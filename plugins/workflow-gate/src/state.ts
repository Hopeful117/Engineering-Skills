// Workflow Gate Plugin — State Management
//
// State is stored in api.runContext (run-scoped, cleared on run end).
// For V1, this is sufficient because workflow operations happen within
// a single agent run. If cross-run persistence is needed in V2,
// we can migrate to file-based storage or api.session.state.

import type { WorkflowState, WorkflowStateName } from "./types.js";

const STATE_NAMESPACE = "workflow-gate";

export function initializeState(storyId: string): WorkflowState {
  return {
    storyId,
    currentState: "STORY_CREATED",
    history: [],
    approvals: {},
    blocks: [],
  };
}

export function readState(
  runContext: {
    getRunContext: (params: { runId: string; namespace: string }) => unknown;
  },
  runId: string,
  storyId: string,
): WorkflowState | null {
  const data = runContext.getRunContext({ runId, namespace: STATE_NAMESPACE });
  if (!data || typeof data !== "object") return null;
  const state = data as Record<string, unknown>;
  if (state.storyId !== storyId) return null;
  return state as unknown as WorkflowState;
}

export function writeState(
  runContext: {
    setRunContext: (patch: { runId: string; namespace: string; data: unknown }) => boolean;
  },
  runId: string,
  state: WorkflowState,
): boolean {
  return runContext.setRunContext({
    runId,
    namespace: STATE_NAMESPACE,
    data: state,
  });
}

export function createStateForStory(
  runContext: {
    getRunContext: (params: { runId: string; namespace: string }) => unknown;
    setRunContext: (patch: { runId: string; namespace: string; data: unknown }) => boolean;
  },
  runId: string,
  storyId: string,
): WorkflowState {
  const existing = readState(runContext, runId, storyId);
  if (existing) return existing;
  const initial = initializeState(storyId);
  writeState(runContext, runId, initial);
  return initial;
}
