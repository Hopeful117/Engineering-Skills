# Implementation Plan — Story 0005: Workflow Gate Plugin

## Overview

Implement the `workflow-gate` OpenClaw plugin as a TypeScript ESM module in `Engineering-Skills/plugins/workflow-gate/`. The plugin registers 5 custom tools, manages workflow state in `api.session.state`, and enforces Human Approval Gates through OpenClaw's `requireApproval` mechanism.

---

## Implementation Steps

### Step 1: Scaffold Plugin Structure

Create the plugin directory and configuration files.

**Files:**
- `plugins/workflow-gate/package.json`
- `plugins/workflow-gate/tsconfig.json`
- `plugins/workflow-gate/.gitignore`

**Actions:**
1. Create `package.json` with:
   - `"type": "module"`
   - `"openclaw": { "extensions": ["./dist/index.js"] }`
   - Dependencies: `typebox` (for schema)
   - Peer dependencies: `openclaw >= 2026.3.24-beta.2`
   - Scripts: `build`, `validate`

2. Create `tsconfig.json` targeting ES2022, ESM, strict mode.

3. Create `.gitignore` for `dist/`, `node_modules/`.

**Validation:** `npm install` succeeds.

---

### Step 2: Define Types

Create shared type definitions.

**File:** `plugins/workflow-gate/src/types.ts`

**Contents:**
- `WorkflowStateName` — union of 11 state names
- `WorkflowState` — main state interface
- `ApprovalRecord` — approval details
- `WorkflowEvent` — history event
- `BlockRecord` — block details
- `GateInfo` — gate information for approval requests
- `ToolResult` — standard tool return type

**Validation:** TypeScript compiles without errors.

---

### Step 3: Implement State Management

Create state read/write operations.

**File:** `plugins/workflow-gate/src/state.ts`

**Functions:**
- `readState(context, storyId): Promise<WorkflowState | null>`
- `writeState(context, storyId, state): Promise<void>`
- `initializeState(storyId): WorkflowState`

**Behavior:**
- `readState` calls `context.session.state.get("workflow-gate")` and filters by storyId
- `writeState` calls `context.session.state.set("workflow-gate", ...)` with merged state
- `initializeState` creates state with `STORY_CREATED` and empty history

**Validation:** Unit test for state initialization.

---

### Step 4: Implement Transition Rules

Create transition validation and execution.

**File:** `plugins/workflow-gate/src/transitions.ts`

**Contents:**
- `TRANSITIONS` — map of valid transitions with guards
- `canTransition(from, trigger): boolean`
- `getAllowedTransitions(state): string[]`
- `executeTransition(state, trigger, metadata): WorkflowState`

**Guards:**
- `complete_stage`: stage must match current state's expected stage
- `request_approval`: gate must be pending, hash must match
- `block`: reason must be provided
- `unblock`: must be in BLOCKED state

**Validation:** Unit tests for each transition.

---

### Step 5: Implement Artifact Hashing

Create SHA-256 hashing for artifacts.

**File:** `plugins/workflow-gate/src/hash.ts`

**Functions:**
- `computeArtifactHash(artifactPath): Promise<string>`
- `verifyArtifactHash(artifactPath, expectedHash): Promise<boolean>`

**Behavior:**
- Read file content
- Compute SHA-256 hash
- Return hex string

**Validation:** Unit test with known input/output.

---

### Step 6: Implement Entry Point and Tools

Create the main plugin entry point with all 5 tools.

**File:** `plugins/workflow-gate/src/index.ts`

**Tools:**

#### `workflow_gate_status`
- **Purpose:** Read current workflow state
- **Parameters:** `{ storyId: string }`
- **Returns:** Current state, history, approvals
- **Mutates:** No

#### `workflow_gate_can_enter`
- **Purpose:** Check if a stage can be entered
- **Parameters:** `{ storyId: string, stage: string }`
- **Returns:** `{ allowed: boolean, reason: string }`
- **Mutates:** No
- **Checks:** State is correct, required approvals exist, artifact hashes match

#### `workflow_gate_complete_stage`
- **Purpose:** Mark current stage as complete
- **Parameters:** `{ storyId: string, stage: string, artifactPath: string }`
- **Returns:** New state
- **Mutates:** Yes
- **Behavior:** Computes hash, validates transition, executes transition, stores hash

#### `workflow_gate_request_approval`
- **Purpose:** Request human approval for pending gate
- **Parameters:** `{ storyId: string }`
- **Returns:** requireApproval payload or error
- **Mutates:** Yes (after approval)
- **Behavior:** Reads state, verifies gate is pending, returns requireApproval

#### `workflow_gate_block`
- **Purpose:** Block workflow
- **Parameters:** `{ storyId: string, reason: string }`
- **Returns:** New state
- **Mutates:** Yes

**Approval Flow:**
```typescript
// In workflow_gate_request_approval execute handler
const state = await readState(context, storyId);
if (!state.currentState.startsWith("WAITING_FOR_")) {
  return { error: "No gate pending" };
}

const gateInfo = deriveGateInfo(state);

// Return requireApproval - OpenClaw Gateway handles the rest
return {
  requireApproval: {
    title: `Workflow Gate: ${gateInfo.gateName}`,
    description: [
      `Story: ${storyId}`,
      `Gate: ${gateInfo.gateName}`,
      `Artifact: ${gateInfo.artifactPath}`,
      `Hash: ${gateInfo.artifactHash}`,
    ].join("\n"),
    severity: "critical",
    allowedDecisions: ["allow-once", "deny"],
    timeoutMs: 300000,
    timeoutBehavior: "deny",
  },
};
```

**Post-Approval Handler:**
```typescript
// After "Allow once" - re-verify and transition
const currentHash = await computeArtifactHash(gateInfo.artifactPath);
if (currentHash !== gateInfo.artifactHash) {
  return { error: "Artifact modified since approval request" };
}

const newState = executeTransition(state, "request_approval", {
  artifactPath: gateInfo.artifactPath,
  artifactHash: gateInfo.artifactHash,
});

await writeState(context, storyId, newState);
return { status: "approved", newState: newState.currentState };
```

**Validation:** Plugin builds, validates, and loads.

---

### Step 7: Build and Validate

**Actions:**
1. Run `npm run build` — TypeScript compiles to `dist/`
2. Run `openclaw plugins validate` — manifest matches entry
3. Run `openclaw plugins install -l .` — symlink install
4. Run `openclaw plugins inspect workflow-gate --runtime` — tools registered

**Validation:** All 5 tools visible in inspect output.

---

### Step 8: Integration Test

**Actions:**
1. Initialize state for a test story
2. Call `workflow_gate_status` — verify initial state
3. Call `workflow_gate_complete_stage` — verify transition
4. Call `workflow_gate_request_approval` — verify approval request
5. Simulate approval — verify state transition
6. Call `workflow_gate_can_enter` — verify gate checks

**Validation:** All operations succeed with correct state transitions.

---

## File Summary

| File | Action | Lines (est.) |
|---|---|---|
| `plugins/workflow-gate/package.json` | Create | 25 |
| `plugins/workflow-gate/tsconfig.json` | Create | 15 |
| `plugins/workflow-gate/.gitignore` | Create | 3 |
| `plugins/workflow-gate/src/types.ts` | Create | 60 |
| `plugins/workflow-gate/src/state.ts` | Create | 80 |
| `plugins/workflow-gate/src/transitions.ts` | Create | 120 |
| `plugins/workflow-gate/src/hash.ts` | Create | 40 |
| `plugins/workflow-gate/src/index.ts` | Create | 200 |
| **Total** | | **~543** |

---

## Validation Checklist

- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds
- [ ] `openclaw plugins validate` passes
- [ ] `openclaw plugins install -l .` succeeds
- [ ] `openclaw plugins inspect workflow-gate --runtime` shows 5 tools
- [ ] `workflow_gate_status` returns initial state
- [ ] `workflow_gate_complete_stage` transitions correctly
- [ ] `workflow_gate_request_approval` triggers approval flow
- [ ] `workflow_gate_can_enter` validates preconditions
- [ ] `workflow_gate_block` blocks workflow
- [ ] Hash verification works correctly
- [ ] Deny does not change state
- [ ] Timeout is fail-closed

---

## Dependencies

- OpenClaw plugin SDK (`openclaw/plugin-sdk`)
- TypeBox (`typebox`) for schema definition
- Node.js `crypto` module for SHA-256

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| `api.session.state` API unknown | Inspect SDK types during implementation |
| `requireApproval` return format unknown | Test with minimal plugin first |
| Multiple stories in same session | Use storyId as key partition |
| Plugin SDK breaking changes | Pin SDK version |

---

## Next Steps After Implementation

1. Integrate plugin into `engineering-story/SKILL.md` (separate story)
2. Add defensive `can-enter` check to `delegate-task` (separate story)
3. Test on a real Story (0003 or 0004)
4. Update `CONVENTIONS.md` and `CHANGELOG.md`
