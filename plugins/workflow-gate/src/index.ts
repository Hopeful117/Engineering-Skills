// Workflow Gate Plugin — Entry Point
//
// Registers 5 custom tools for deterministic workflow state management.
// State is stored in api.runContext (run-scoped).
// Human approval is enforced through OpenClaw's requireApproval mechanism.

import { Type } from "typebox";
import { defineToolPlugin } from "openclaw/plugin-sdk/tool-plugin";
import { readState, writeState, createStateForStory } from "./state.js";
import {
  canCompleteStage,
  canTransition,
  executeTransition,
  executeBlock,
  deriveGateInfo,
} from "./transitions.js";
import { computeArtifactHash, verifyArtifactHash } from "./hash.js";
import type { WorkflowState, StageName } from "./types.js";

// Valid stage names for validation
const VALID_STAGES: StageName[] = [
  "created",
  "analysis",
  "plan",
  "implementation",
  "review",
  "report",
];

export default defineToolPlugin({
  id: "workflow-gate",
  name: "Workflow Gate",
  description:
    "Deterministic workflow state controller for Engineering Story. Enforces Human Approval Gates through OpenClaw's native approval mechanism.",
  tools: (tool) => [
    // ─── Tool 1: workflow_gate_status ───
    tool({
      name: "workflow_gate_status",
      label: "Workflow Gate Status",
      description:
        "Read the current workflow state for a Story. Returns current state, history, and approvals.",
      parameters: Type.Object({
        storyId: Type.String({ description: "Story ID to check" }),
      }),
      async execute({ storyId }, _config, context) {
        const state = readState(
          context.api.runContext,
          context.toolCallId,
          storyId,
        );
        if (!state) {
          return {
            error: `No workflow state found for Story ${storyId}`,
            storyId,
            currentState: "UNINITIALIZED",
          };
        }
        return {
          storyId: state.storyId,
          currentState: state.currentState,
          approvals: state.approvals,
          historyLength: state.history.length,
          lastEvent: state.history[state.history.length - 1] || null,
        };
      },
    }),

    // ─── Tool 2: workflow_gate_can_enter ───
    tool({
      name: "workflow_gate_can_enter",
      label: "Workflow Gate Can Enter",
      description:
        "Check if a specific stage can be entered. Verifies preconditions including previous approvals and artifact hashes.",
      parameters: Type.Object({
        storyId: Type.String({ description: "Story ID" }),
        stage: Type.String({
          description:
            "Stage to check: created, analysis, plan, implementation, review, report",
        }),
      }),
      async execute({ storyId, stage }, _config, context) {
        if (!VALID_STAGES.includes(stage as StageName)) {
          return {
            allowed: false,
            reason: `Invalid stage: ${stage}. Valid stages: ${VALID_STAGES.join(", ")}`,
          };
        }

        const state = readState(
          context.api.runContext,
          context.toolCallId,
          storyId,
        );
        if (!state) {
          return {
            allowed: false,
            reason: `No workflow state found for Story ${storyId}`,
          };
        }

        // Check if blocked
        if (state.currentState === "BLOCKED") {
          return {
            allowed: false,
            reason: "Workflow is blocked",
            blockReason: state.blocks[state.blocks.length - 1]?.reason,
          };
        }

        // Check if completed
        if (state.currentState === "WORKFLOW_COMPLETED") {
          return {
            allowed: false,
            reason: "Workflow is already completed",
          };
        }

        // Check if a gate is pending
        if (state.currentState.startsWith("WAITING_FOR_")) {
          return {
            allowed: false,
            reason: `Gate pending: ${state.currentState}. Approve before continuing.`,
          };
        }

        // Check stage-specific preconditions
        const check = canCompleteStage(state, stage as StageName);
        if (!check.allowed) {
          return { allowed: false, reason: check.reason };
        }

        // Verify artifact hashes for dependent stages
        if (stage === "plan" && state.approvals["analysis"]) {
          const approved = state.approvals["analysis"];
          try {
            const { valid } = await verifyArtifactHash(
              approved.artifactPath,
              approved.artifactHash,
            );
            if (!valid) {
              return {
                allowed: false,
                reason: "Repository Analysis artifact has been modified since approval. Re-approve.",
              };
            }
          } catch {
            return {
              allowed: false,
              reason: `Cannot verify Repository Analysis artifact: ${approved.artifactPath}`,
            };
          }
        }

        if (stage === "implementation" && state.approvals["plan"]) {
          const approved = state.approvals["plan"];
          try {
            const { valid } = await verifyArtifactHash(
              approved.artifactPath,
              approved.artifactHash,
            );
            if (!valid) {
              return {
                allowed: false,
                reason: "Implementation Plan artifact has been modified since approval. Re-approve.",
              };
            }
          } catch {
            return {
              allowed: false,
              reason: `Cannot verify Implementation Plan artifact: ${approved.artifactPath}`,
            };
          }
        }

        return { allowed: true, reason: "ok", currentState: state.currentState };
      },
    }),

    // ─── Tool 3: workflow_gate_complete_stage ───
    tool({
      name: "workflow_gate_complete_stage",
      label: "Workflow Gate Complete Stage",
      description:
        "Mark the current stage as complete. Computes artifact hash and transitions to the next state, which may be an approval state for analysis or plan.",
      parameters: Type.Object({
        storyId: Type.String({ description: "Story ID" }),
        stage: Type.String({
          description:
            "Stage being completed: created, analysis, plan, implementation, review, report",
        }),
        artifactPath: Type.String({
          description: "Path to the artifact produced by this stage",
        }),
      }),
      async execute({ storyId, stage, artifactPath }, _config, context) {
        if (!VALID_STAGES.includes(stage as StageName)) {
          return { error: `Invalid stage: ${stage}` };
        }

        // Get or create state
        let state = readState(
          context.api.runContext,
          context.toolCallId,
          storyId,
        );
        if (!state) {
          state = createStateForStory(
            context.api.runContext,
            context.toolCallId,
            storyId,
          );
        }

        // Check if we can complete this stage
        const check = canCompleteStage(state, stage as StageName);
        if (!check.allowed) {
          return { error: check.reason, currentState: state.currentState };
        }

        // Compute artifact hash
        let artifactHash: string;
        try {
          artifactHash = await computeArtifactHash(artifactPath);
        } catch (err) {
          return {
            error: `Cannot compute hash for artifact: ${artifactPath}`,
            details: err instanceof Error ? err.message : String(err),
          };
        }

        // Execute transition
        const newState = executeTransition(state, "complete_stage", {
          artifactPath,
          artifactHash,
        });

        // Save state
        writeState(context.api.runContext, context.toolCallId, newState);

        return {
          storyId,
          previousState: state.currentState,
          newState: newState.currentState,
          artifactPath,
          artifactHash,
          historyLength: newState.history.length,
          message: `Stage "${stage}" completed. State: ${newState.currentState}`,
        };
      },
    }),

    // ─── Tool 4: workflow_gate_request_approval ───
    tool({
      name: "workflow_gate_request_approval",
      label: "Workflow Gate Request Approval",
      description:
        "Request human approval for the current pending gate. Returns a requireApproval payload that OpenClaw Gateway presents to the human. The workflow only advances after 'Allow once'.",
      parameters: Type.Object({
        storyId: Type.String({ description: "Story ID" }),
      }),
      async execute({ storyId }, _config, context) {
        const state = readState(
          context.api.runContext,
          context.toolCallId,
          storyId,
        );
        if (!state) {
          return { error: `No workflow state found for Story ${storyId}` };
        }

        // Verify a gate is pending
        if (!state.currentState.startsWith("WAITING_FOR_")) {
          return {
            error: `No gate pending. Current state: ${state.currentState}`,
          };
        }

        // Derive gate info
        const gateInfo = deriveGateInfo(state);
        if (!gateInfo) {
          return {
            error: `Cannot derive gate info for state: ${state.currentState}`,
          };
        }

        // Verify the artifact exists and compute fresh hash
        let currentHash: string;
        try {
          currentHash = await computeArtifactHash(gateInfo.artifactPath);
        } catch {
          return {
            error: `Cannot compute hash for artifact: ${gateInfo.artifactPath}`,
          };
        }

        // Store the hash for post-approval verification
        // We store it in the state's history so we can verify after approval
        const stateWithHash = {
          ...state,
          history: [
            ...state.history,
            {
              type: "approval_requested",
              from: state.currentState,
              to: state.currentState,
              timestamp: new Date().toISOString(),
              artifactPath: gateInfo.artifactPath,
              artifactHash: currentHash,
            },
          ],
        };
        writeState(context.api.runContext, context.toolCallId, stateWithHash);

        // Return the requireApproval payload
        // OpenClaw Gateway will present this to the human
        return {
          requireApproval: {
            title: `Workflow Gate: ${gateInfo.gateName}`,
            description: [
              `Story: ${storyId}`,
              `Gate: ${gateInfo.gateName}`,
              `Artifact: ${gateInfo.artifactPath}`,
              `Hash: ${currentHash}`,
              "",
              "Approve to continue the workflow.",
            ].join("\n"),
            severity: "critical",
            allowedDecisions: ["allow-once", "deny"],
            timeoutMs: 300000,
            timeoutBehavior: "deny",
          },
        };
      },
    }),

    // ─── Tool 5: workflow_gate_block ───
    tool({
      name: "workflow_gate_block",
      label: "Workflow Gate Block",
      description: "Block the workflow with a reason. Requires unblock to resume.",
      parameters: Type.Object({
        storyId: Type.String({ description: "Story ID" }),
        reason: Type.String({ description: "Reason for blocking" }),
      }),
      async execute({ storyId, reason }, _config, context) {
        let state = readState(
          context.api.runContext,
          context.toolCallId,
          storyId,
        );
        if (!state) {
          state = createStateForStory(
            context.api.runContext,
            context.toolCallId,
            storyId,
          );
        }

        const newState = executeBlock(state, reason);
        writeState(context.api.runContext, context.toolCallId, newState);

        return {
          storyId,
          previousState: state.currentState,
          newState: "BLOCKED",
          reason,
          message: `Workflow blocked: ${reason}`,
        };
      },
    }),
  ],
});
