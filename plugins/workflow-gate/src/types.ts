// Workflow Gate Plugin — Shared Types

export type WorkflowStateName =
  | "STORY_CREATED"
  | "ANALYSIS_IN_PROGRESS"
  | "WAITING_FOR_ANALYSIS_APPROVAL"
  | "PLAN_IN_PROGRESS"
  | "WAITING_FOR_PLAN_APPROVAL"
  | "IMPLEMENTATION_IN_PROGRESS"
  | "CODE_REVIEW_IN_PROGRESS"
  | "REPORT_IN_PROGRESS"
  | "WORKFLOW_COMPLETED"
  | "BLOCKED";

export interface ApprovalRecord {
  stage: string;
  approvedAt: string;
  artifactHash: string;
  artifactPath: string;
}

export interface WorkflowEvent {
  type: string;
  from: WorkflowStateName;
  to: WorkflowStateName;
  timestamp: string;
  artifactPath?: string;
  artifactHash?: string;
  reason?: string;
}

export interface BlockRecord {
  reason: string;
  blockedAt: string;
}

export interface WorkflowState {
  storyId: string;
  currentState: WorkflowStateName;
  history: WorkflowEvent[];
  approvals: Record<string, ApprovalRecord>;
  blocks: BlockRecord[];
}

export interface GateInfo {
  gateName: string;
  artifactPath: string;
  artifactHash: string;
  currentState: WorkflowStateName;
  nextState: WorkflowStateName;
}

export interface ToolResult {
  [key: string]: unknown;
}

// Valid stage names for complete_stage
export type StageName =
  | "created"
  | "analysis"
  | "plan"
  | "implementation"
  | "review"
  | "report";

// Map stage names to their completion states
export const STAGE_TO_COMPLETION_STATE: Record<StageName, WorkflowStateName> = {
  created: "ANALYSIS_IN_PROGRESS",
  analysis: "WAITING_FOR_ANALYSIS_APPROVAL",
  plan: "WAITING_FOR_PLAN_APPROVAL",
  implementation: "CODE_REVIEW_IN_PROGRESS",
  review: "REPORT_IN_PROGRESS",
  report: "WORKFLOW_COMPLETED",
};

// Map approval states to their next states (only approval states have next states)
export const APPROVAL_TO_NEXT_STATE: Partial<Record<WorkflowStateName, WorkflowStateName>> = {
  WAITING_FOR_ANALYSIS_APPROVAL: "PLAN_IN_PROGRESS",
  WAITING_FOR_PLAN_APPROVAL: "IMPLEMENTATION_IN_PROGRESS",
};

// Map approval states to their gate names (only approval states have gates)
export const APPROVAL_TO_GATE_NAME: Partial<Record<WorkflowStateName, string>> = {
  WAITING_FOR_ANALYSIS_APPROVAL: "Repository Analysis",
  WAITING_FOR_PLAN_APPROVAL: "Implementation Plan",
};

// Map approval states to expected artifact paths (only approval states have artifacts)
export const APPROVAL_TO_ARTIFACT_PATH: Partial<Record<WorkflowStateName, string>> = {
  WAITING_FOR_ANALYSIS_APPROVAL: "repository-analysis.md",
  WAITING_FOR_PLAN_APPROVAL: "implementation-plan.md",
};
