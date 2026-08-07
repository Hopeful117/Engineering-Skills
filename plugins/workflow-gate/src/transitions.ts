// Workflow Gate Plugin — Transition Rules

import type {
  WorkflowState,
  WorkflowStateName,
  WorkflowEvent,
  StageName,
} from "./types.js";
import {
  STAGE_TO_COMPLETION_STATE,
  APPROVAL_TO_NEXT_STATE,
  APPROVAL_TO_GATE_NAME,
  APPROVAL_TO_ARTIFACT_PATH,
} from "./types.js";

// Valid transitions: from → [allowed triggers]
const VALID_TRANSITIONS: Record<WorkflowStateName, string[]> = {
  STORY_CREATED: ["complete_stage"],
  ANALYSIS_IN_PROGRESS: ["complete_stage"],
  WAITING_FOR_ANALYSIS_APPROVAL: ["request_approval"],
  PLAN_IN_PROGRESS: ["complete_stage"],
  WAITING_FOR_PLAN_APPROVAL: ["request_approval"],
  IMPLEMENTATION_IN_PROGRESS: ["complete_stage"],
  CODE_REVIEW_IN_PROGRESS: ["complete_stage"],
  WAITING_FOR_REVIEW_APPROVAL: ["request_approval"],
  REPORT_IN_PROGRESS: ["complete_stage"],
  WORKFLOW_COMPLETED: [],
  BLOCKED: ["unblock"],
};

export function canTransition(
  state: WorkflowState,
  trigger: string,
): { allowed: boolean; reason: string } {
  const allowed = VALID_TRANSITIONS[state.currentState];
  if (!allowed) {
    return { allowed: false, reason: `Unknown state: ${state.currentState}` };
  }
  if (!allowed.includes(trigger)) {
    return {
      allowed: false,
      reason: `Trigger "${trigger}" not allowed in state "${state.currentState}"`,
    };
  }
  return { allowed: true, reason: "ok" };
}

export function canCompleteStage(
  state: WorkflowState,
  stage: StageName,
): { allowed: boolean; reason: string } {
  const check = canTransition(state, "complete_stage");
  if (!check.allowed) return check;

  // Verify the stage matches what's expected for the current state
  const expectedNextState = STAGE_TO_COMPLETION_STATE[stage];
  if (!expectedNextState) {
    return { allowed: false, reason: `Unknown stage: ${stage}` };
  }

  // For stages that require previous approvals, check them
  if (stage === "plan" && !state.approvals["analysis"]) {
    return {
      allowed: false,
      reason: "Repository Analysis must be approved before entering Plan",
    };
  }
  if (stage === "implementation" && !state.approvals["plan"]) {
    return {
      allowed: false,
      reason: "Implementation Plan must be approved before entering Implementation",
    };
  }
  if (stage === "report" && !state.approvals["review"]) {
    return {
      allowed: false,
      reason: "Code Review must be approved before entering Report",
    };
  }

  return { allowed: true, reason: "ok" };
}

export function executeTransition(
  state: WorkflowState,
  trigger: string,
  metadata: {
    artifactPath?: string;
    artifactHash?: string;
    reason?: string;
  },
): WorkflowState {
  const now = new Date().toISOString();
  let newState: WorkflowStateName;

  if (trigger === "complete_stage") {
    // Determine the stage from the current state
    const stage = currentStateToStage(state.currentState);
    if (!stage) {
      throw new Error(`Cannot determine stage from state: ${state.currentState}`);
    }
    newState = STAGE_TO_COMPLETION_STATE[stage];
  } else if (trigger === "request_approval") {
    // Transition from WAITING_FOR_*_APPROVAL to next state
    const next = APPROVAL_TO_NEXT_STATE[state.currentState];
    if (!next) {
      throw new Error(`No next state for approval in: ${state.currentState}`);
    }
    newState = next;

    // Record the approval
    const gateName = APPROVAL_TO_GATE_NAME[state.currentState];
    const approvals = { ...state.approvals };
    if (gateName) {
      const key = gateNameToKey(gateName);
      approvals[key] = {
        stage: key,
        approvedAt: now,
        artifactHash: metadata.artifactHash || "",
        artifactPath: metadata.artifactPath || "",
      };
    }

    const event: WorkflowEvent = {
      type: trigger,
      from: state.currentState,
      to: newState,
      timestamp: now,
      artifactPath: metadata.artifactPath,
      artifactHash: metadata.artifactHash,
    };

    return {
      ...state,
      currentState: newState,
      history: [...state.history, event],
      approvals,
    };
  } else if (trigger === "unblock") {
    // Return to the state before blocking (or STORY_CREATED)
    const lastBlock = state.blocks[state.blocks.length - 1];
    newState = "STORY_CREATED"; // Default if no previous state
    if (lastBlock) {
      // Try to determine previous state from history
      const blockEvent = state.history.find(
        (e) => e.type === "block" && e.timestamp === lastBlock.blockedAt,
      );
      if (blockEvent) {
        newState = blockEvent.from;
      }
    }
  } else {
    throw new Error(`Unknown trigger: ${trigger}`);
  }

  const event: WorkflowEvent = {
    type: trigger,
    from: state.currentState,
    to: newState,
    timestamp: now,
    artifactPath: metadata.artifactPath,
    artifactHash: metadata.artifactHash,
    reason: metadata.reason,
  };

  return {
    ...state,
    currentState: newState,
    history: [...state.history, event],
  };
}

export function executeBlock(
  state: WorkflowState,
  reason: string,
): WorkflowState {
  const now = new Date().toISOString();
  const event: WorkflowEvent = {
    type: "block",
    from: state.currentState,
    to: "BLOCKED",
    timestamp: now,
    reason,
  };

  return {
    ...state,
    currentState: "BLOCKED",
    history: [...state.history, event],
    blocks: [
      ...state.blocks,
      { reason, blockedAt: now },
    ],
  };
}

export function deriveGateInfo(state: WorkflowState): {
  gateName: string;
  artifactPath: string;
  artifactHash: string;
} | null {
  const gateName = APPROVAL_TO_GATE_NAME[state.currentState];
  const artifactPath = APPROVAL_TO_ARTIFACT_PATH[state.currentState];
  if (!gateName || !artifactPath) return null;

  // Find the hash from the last history event
  const lastEvent = [...state.history]
    .reverse()
    .find((e) => e.to === state.currentState);
  const artifactHash = lastEvent?.artifactHash || "";

  return { gateName, artifactPath, artifactHash };
}

// Helper: convert current state to the stage name it represents
function currentStateToStage(state: WorkflowStateName): StageName | null {
  switch (state) {
    case "STORY_CREATED": return "created";
    case "ANALYSIS_IN_PROGRESS": return "analysis";
    case "PLAN_IN_PROGRESS": return "plan";
    case "IMPLEMENTATION_IN_PROGRESS": return "implementation";
    case "CODE_REVIEW_IN_PROGRESS": return "review";
    case "REPORT_IN_PROGRESS": return "report";
    default: return null;
  }
}

// Helper: convert gate name to approval key
function gateNameToKey(gateName: string): string {
  switch (gateName) {
    case "Repository Analysis": return "analysis";
    case "Implementation Plan": return "plan";
    case "Code Review": return "review";
    default: return gateName.toLowerCase();
  }
}
