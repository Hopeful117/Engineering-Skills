# Implementation Plan

## Overview

Introduce a deterministic WRITE-side adapter (`devlog-story.mjs`) that automatically synchronizes the Engineering Story lifecycle with DevLog, closing the first missing edge in the feedback loop.

The adapter handles three operations — `register`, `start`, `complete` — following the exact patterns established by `devlog-context.mjs`. Integration points are added to `SKILL.md` at workflow boundaries: Story creation (register), Gate 2 approval (start), and post-human-commit (complete). The human commit boundary is a workflow pause point, not an Approval Gate.

The adapter reuses the existing `TOOLS.md` DevLog configuration, emits `DEVLOG_LIFECYCLE_ERROR` on failure, and never blocks the engineering workflow.

## Planned Changes

### 1. Create the lifecycle adapter script

Create `engineering-story/scripts/devlog-story.mjs` — a dependency-free Node.js ESM module handling three operations via CLI.

**CLI interface:**
```text
node scripts/devlog-story.mjs --base-url <url> --project-id <uuid> --operation <register|start|complete>
```

**Stdin input (JSON):**
- Register: `{ "storyNumber": 7, "title": "...", "storyPath": "stories/0007-..." }`
- Start: `{ "baseCommit": "abc123..." }`
- Complete: `{ "targetCommit": "def456..." }`

**Stdout output (JSON):**
- Register: `{ "ok": true, "storyId": "uuid" }`
- Start: `{ "ok": true }`
- Complete: `{ "ok": true }`

**Error behavior:**
- Exits with code 2 on any failure.
- Writes `DEVLOG_LIFECYCLE_ERROR: <diagnostic>. Engineering workflow continues without DevLog synchronization.` to stderr.
- Treats 409 Conflict as success when the resulting state matches the intended state (idempotency).

**Validation:**
- Base URL: must be valid HTTP/HTTPS.
- Project ID: must be valid UUID.
- Operation: must be `register`, `start`, or `complete`.
- Git SHA (start/complete): must be 40-character hex string.
- Complete: must verify `targetCommit != baseCommit`.
- Timeout: bounded, configurable, default 3000ms.

**Design patterns** (matching `devlog-context.mjs`):
- Custom error class `DevLogLifecycleError`.
- `formatFailure()` for visible error messages.
- `parseArguments()` for CLI argument parsing.
- `validateInputs()` for URL, UUID, and operation validation.
- `validateGitSha()` for SHA format validation.
- Core HTTP functions: `registerStory()`, `startStory()`, `completeStory()`.
- `main()` as CLI entrypoint.
- `isMainModule()` for symlink-compatible entry detection.

### 2. Create the lifecycle adapter test suite

Create `engineering-story/scripts/devlog-story.test.mjs` covering:

**Register tests:**
- Sends correct payload to `POST /api/v1/projects/{projectId}/stories`.
- Handles 201 success with story ID.
- Handles 409 (already registered) as success.
- Rejects invalid base URL.
- Rejects invalid project UUID.
- Rejects missing required fields.

**Start tests:**
- Sends correct `baseCommit` to `POST /.../start`.
- Handles 200 success.
- Handles 409 (already started) as success.
- Rejects invalid Git SHA format.
- Rejects non-hex characters.

**Complete tests:**
- Sends correct `targetCommit` to `POST /.../complete`.
- Handles 200 success.
- Handles 409 (already completed) as success.
- Rejects invalid Git SHA format.
- Rejects `targetCommit == baseCommit`.
- Rejects non-hex characters.

**Failure tests:**
- Network error → `DEVLOG_LIFECYCLE_ERROR`.
- Timeout → `DEVLOG_LIFECYCLE_ERROR`.
- Non-success HTTP status → `DEVLOG_LIFECYCLE_ERROR`.
- Malformed JSON response → `DEVLOG_LIFECYCLE_ERROR`.

**Entrypoint tests:**
- CLI entrypoint recognition through symlinks.

### 3. Create the lifecycle adapter reference documentation

Create `engineering-story/references/devlog-story.md` documenting:

- CLI interface and argument contract.
- Stdin/stdout JSON protocol for each operation.
- Idempotency behavior (409 handling).
- `targetCommit != baseCommit` validation.
- Configuration reuse from `TOOLS.md`.
- `DEVLOG_LIFECYCLE_ERROR` prefix and fallback semantics.
- Trust model (DevLog records history, workflow-gate controls approval).
- Limitation: DevLog API does not distinguish "different data" conflicts from "already in state" conflicts for start/complete.

### 4. Update `engineering-story/SKILL.md` with lifecycle integration points

Add three integration points to the SKILL.md workflow orchestration:

**4a. Registration at Story creation:**
After the Story artifact is created and before Repository Analysis begins:
1. Resolve canonical Git repository root.
2. Read workspace-local DevLog configuration from `TOOLS.md`.
3. When an exact repository mapping exists, invoke `node scripts/devlog-story.mjs --base-url <url> --project-id <uuid> --operation register` with `{ storyNumber, title, storyPath }` on stdin.
4. On success, record the DevLog story ID for subsequent operations.
5. On failure, display `DEVLOG_LIFECYCLE_ERROR` and continue.

**4b. Base commit capture after Gate 2 approval:**
After the Implementation Plan is approved (Gate 2) and before Implementation begins:
1. Capture `git rev-parse HEAD` as `baseCommit`.
2. Invoke `node scripts/devlog-story.mjs --base-url <url> --project-id <uuid> --operation start` with `{ baseCommit }` on stdin.
3. On success, record the `baseCommit` for the complete operation.
4. On failure, display `DEVLOG_LIFECYCLE_ERROR` and continue.

**4c. Human commit boundary after Engineering Report:**
After the Engineering Report is produced and Code Review is approved (Gate 3):
1. Tell the human: "Please create the Git commit for this Story. Resume after the commit exists."
2. Wait for user input (STOP — but NOT an Approval Gate).
3. After the human confirms the commit exists, capture `git rev-parse HEAD` as `targetCommit`.
4. Verify `targetCommit != baseCommit`. If equal, tell the human the commit was not created and stop.
5. Invoke `node scripts/devlog-story.mjs --base-url <url> --project-id <uuid> --operation complete` with `{ targetCommit }` on stdin.
6. On failure, display `DEVLOG_LIFECYCLE_ERROR` and continue.
7. Produce the Engineering Report and mark the workflow as Completed.

**Key invariant preserved:** The human commit boundary is NOT a fourth Approval Gate. The three existing Gates and their semantics are unchanged.

### 5. Update workspace `TOOLS.md` with DevLog configuration (local only)

Ensure `TOOLS.md` contains the DevLog configuration section with the base URL and repository-to-project UUID mapping. This is already present from Story 0006. The lifecycle adapter reuses this configuration without changes.

No new configuration mechanism is introduced.

## Files to Modify

| File | Nature of Modification |
|---|---|
| `engineering-story/SKILL.md` | Add three lifecycle integration points (register, start, complete) with visible error fallback and unchanged approval gate semantics |

## Files to Create

| File | Purpose |
|---|---|
| `engineering-story/scripts/devlog-story.mjs` | WRITE-side lifecycle adapter (register, start, complete) |
| `engineering-story/scripts/devlog-story.test.mjs` | Test suite for the lifecycle adapter |
| `engineering-story/references/devlog-story.md` | Reference documentation for the lifecycle adapter |

## Dependencies

### Internal dependencies
- `engineering-story/SKILL.md` — workflow orchestration, owns integration points.
- `engineering-story/scripts/devlog-context.mjs` — existing READ-side adapter (pattern reference, no code dependency).
- `engineering-story/references/devlog-context.md` — existing reference (pattern reference).
- OpenClaw workspace `TOOLS.md` — DevLog base URL and project UUID mapping.
- `plugins/workflow-gate/` — no changes, remains approval authority.

### External dependencies
- DevLog `EngineeringStoryController` endpoints (Story 0029):
  - `POST /api/v1/projects/{projectId}/stories`
  - `POST /api/v1/projects/{projectId}/stories/{storyId}/start`
  - `POST /api/v1/projects/{projectId}/stories/{storyId}/complete`
- Node.js runtime (already available).
- `git` CLI for `git rev-parse HEAD`.

No new NPM package, DevLog change, database migration, or external paid service is required.

### Ordering dependencies
1. `devlog-story.mjs` must be implemented and tested before SKILL.md integration.
2. `devlog-story.md` reference must be written before SKILL.md integration.
3. SKILL.md integration must be last, as it references the adapter and reference.
4. `TOOLS.md` configuration must be present for successful-path validation.

## Test Plan

### Adapter tests

Run:
```text
node --test engineering-story/scripts/devlog-story.test.mjs
```

Tests verify:
- Register sends correct payload to the correct endpoint.
- Register handles 409 (already registered) as success.
- Start sends correct `baseCommit` to the correct endpoint.
- Start handles 409 (already started) as success.
- Complete sends correct `targetCommit` to the correct endpoint.
- Complete handles 409 (already completed) as success.
- Complete rejects `targetCommit == baseCommit`.
- All operations validate input (URL, UUID, SHA, required fields).
- All failure paths emit `DEVLOG_LIFECYCLE_ERROR`.
- CLI entrypoint works through symlinks.

### Static and repository validation

- No project UUID or local DevLog URL hardcoded in `SKILL.md`.
- `SKILL.md` contains explicit fallback and non-blocking language.
- Workflow-gate source has no diff.
- DevLog repository has no diff.
- `devlog-context.mjs` and its tests have no diff.

### Practical validation (if DevLog is available)

Configure local values in `TOOLS.md`, run a Story through the workflow:
- Verify registration creates an EngineeringStory in DevLog.
- Verify start sets `baseCommit` correctly.
- Verify complete sets `targetCommit` correctly.
- Verify lifecycle state progresses: REGISTERED → IN_PROGRESS → COMPLETED.

### Fallback validation

Make DevLog unavailable:
- Verify `DEVLOG_LIFECYCLE_ERROR` is displayed for each operation.
- Verify the engineering workflow continues normally.
- Verify all three Approval Gates function correctly.
- Verify the Engineering Report is produced.

### Expected success conditions

All adapter tests pass, lifecycle synchronization works end-to-end when DevLog is available, every failure path is visible and non-blocking, no external repository is modified, and the workflow stops at the correct Approval Gates.

## Risks

### Adapter complexity (3 operations vs 1)

`devlog-story.mjs` handles three operations compared to `devlog-context.mjs`'s single operation. The plan constrains each operation to a focused HTTP function with shared validation and error handling. Tests cover each operation independently.

### Git SHA capture at runtime

The adapter captures `git rev-parse HEAD` at the moment of invocation. If the repository changes between the workflow trigger and the actual capture, the SHA may not represent the intended state. This is the best available deterministic signal — the same pattern used in the Story specification.

### Human commit boundary compliance

If the human resumes without creating the commit, `targetCommit == baseCommit` and the adapter rejects the complete. The SKILL.md must clearly communicate this requirement. The test suite covers this rejection case.

### DevLog API not yet deployed

The lifecycle endpoints exist in code but are not in the running DevLog instance. Adapter tests use a mock server. Practical validation requires deploying the updated backend. This is a timing constraint, not a blocker.

### Idempotency limitation

DevLog returns 409 for both "already in state" and "conflict with different data." The adapter cannot distinguish these cases for start/complete with different commits. This is documented as a limitation. The workflow ensures only one start and one complete are attempted per Story.

## Validation Checklist

- [ ] `devlog-story.mjs` implements register, start, and complete operations.
- [ ] Adapter validates URL, UUID, operation, and Git SHA inputs.
- [ ] Adapter handles 409 as success for idempotent operations.
- [ ] Adapter rejects `targetCommit == baseCommit`.
- [ ] Every failure path emits `DEVLOG_LIFECYCLE_ERROR`.
- [ ] Adapter tests pass (`node --test`).
- [ ] `devlog-story.md` reference documents CLI, protocol, idempotency, and failure contract.
- [ ] `SKILL.md` contains three lifecycle integration points.
- [ ] Registration happens before Repository Analysis.
- [ ] Start happens after Gate 2 approval, before Implementation.
- [ ] Complete happens after human commit, before Engineering Report.
- [ ] Human commit boundary is NOT an Approval Gate.
- [ ] Three existing Approval Gates are unchanged.
- [ ] Workflow-gate source is unchanged.
- [ ] DevLog repository and API are unchanged.
- [ ] `devlog-context.mjs` and its tests are unchanged.
- [ ] No project UUID or local DevLog URL in `SKILL.md`.
- [ ] Fallback is explicit and non-blocking.
- [ ] Adapter works through symlinked installation path.

## Recommendation

Ready for implementation

The implementation boundary is small, testable, and compatible with the approved Repository Analysis. The existing adapter pattern (`devlog-context.mjs`) provides a proven design. The DevLog API contract is established, failure behavior is explicit and non-blocking, and no unresolved architecture or product decision remains.

This recommendation is technical only. It does not approve the Implementation Plan or authorize implementation.

## Approval Required

Implementation Plan completed.

Human approval required before Implementation.

Awaiting explicit human approval.
