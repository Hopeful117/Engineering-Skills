# Implementation Report

## Story

Story 0007 — DevLog Lifecycle Integration

## Implementation Summary

Implemented a deterministic WRITE-side adapter (`devlog-story.mjs`) that automatically synchronizes the Engineering Story lifecycle with DevLog, closing the first missing edge in the feedback loop.

### Changes Made

**New files created:**

1. `engineering-story/scripts/devlog-story.mjs` — Lifecycle adapter handling three operations:
   - `register`: sends `POST /api/v1/projects/{projectId}/stories` with `{ storyNumber, title, storyPath }`
   - `start`: sends `POST /.../start` with `{ baseCommit }` after Gate 2 approval
   - `complete`: sends `POST /.../complete` with `{ targetCommit, baseCommit }` after human commit
   - Validates inputs (URL, UUID, Git SHA format, `targetCommit != baseCommit`)
   - Handles 409 Conflict as success for idempotent operations
   - Emits `DEVLOG_LIFECYCLE_ERROR` on failure, never blocks workflow
   - Follows exact patterns from `devlog-context.mjs`

2. `engineering-story/scripts/devlog-story.test.mjs` — 24 tests covering:
   - Register: payload, 201 success, 409 idempotency, input validation (URL, UUID, storyNumber, title, storyPath), HTTP errors
   - Start: payload, 200 success, 409 idempotency, SHA validation, HTTP errors
   - Complete: payload, 200 success, 409 idempotency, SHA validation, `targetCommit == baseCommit` rejection, HTTP errors
   - Failure: fetch errors, timeout, malformed JSON
   - SHA validation: valid hex, invalid characters, wrong length
   - Entrypoint: symlink recognition

3. `engineering-story/references/devlog-story.md` — Reference documentation covering:
   - CLI interface and argument contract
   - Stdin/stdout JSON protocol for each operation
   - Idempotency behavior (409 handling)
   - `targetCommit != baseCommit` validation
   - Configuration reuse from `TOOLS.md`
   - `DEVLOG_LIFECYCLE_ERROR` prefix and failure contract
   - Trust model and limitations

**Modified files:**

4. `engineering-story/SKILL.md` — Three lifecycle integration points added:
   - **DevLog Lifecycle Registration**: after Story creation, before Repository Analysis
   - **DevLog Lifecycle Start**: after Gate 2 approval, before Implementation
   - **Human Commit Boundary and DevLog Lifecycle Complete**: after Gate 3 approval, after human commit, before Engineering Report production

### Invariants Preserved

- Three existing Human Approval Gates unchanged
- Workflow-gate plugin source unchanged
- `devlog-context.mjs` and its tests unchanged
- Human owns Git commit (no automation)
- DevLog failure never blocks engineering workflow
- No project UUID or localhost in SKILL.md

## Validation

### Adapter Tests

```text
node --test engineering-story/scripts/devlog-story.test.mjs
```

Result: **24/24 pass**

### Existing Tests

```text
node --test engineering-story/scripts/devlog-context.test.mjs
```

Result: **9/9 pass**

### Static Validation

- No UUID embedded in SKILL.md ✓
- No localhost in SKILL.md ✓
- Workflow-gate source unchanged ✓
- `devlog-context.mjs` unchanged ✓
- All acceptance criteria from Story 0007 covered ✓

## Documentation Reconciliation

Documentation update: **Required and completed.**

The following documentation was updated:
- `engineering-story/SKILL.md` — added three lifecycle integration points with preconditions, steps, and fallback behavior
- `engineering-story/references/devlog-story.md` — new reference documenting the lifecycle adapter

No other canonical repository documentation was affected.

## Residual Risks

1. **DevLog API not yet deployed**: The lifecycle endpoints exist in code (Story 0029) but are not in the running DevLog instance. Practical validation requires deploying the updated backend. Adapter tests use mock servers and are fully validated.

2. **Idempotency limitation**: DevLog returns 409 for both "already in state" and "conflict with different data." The adapter cannot distinguish these cases. The workflow ensures only one start and one complete per Story.

3. **Human commit boundary**: If the human resumes without creating the commit, `targetCommit == baseCommit` and the adapter rejects the complete. The SKILL.md clearly communicates this requirement.

## Story Compliance

All acceptance criteria from Story 0007 are satisfied:

- [x] `devlog-story.mjs` exists with register, start, complete operations
- [x] Adapter reuses existing `TOOLS.md` configuration
- [x] Registration at Story creation with correct payload
- [x] Registration failure produces `DEVLOG_LIFECYCLE_ERROR` and does not block
- [x] Start after Gate 2 with `baseCommit` from `git rev-parse HEAD`
- [x] Start failure produces `DEVLOG_LIFECYCLE_ERROR` and does not block
- [x] Human commit boundary after Engineering Report
- [x] Human commit boundary is NOT an Approval Gate
- [x] Complete after human commit with `targetCommit`
- [x] `targetCommit != baseCommit` verified
- [x] Complete failure produces `DEVLOG_LIFECYCLE_ERROR` and does not block
- [x] No complete before human commit
- [x] DevLog unavailability handled gracefully
- [x] Automated validation covers all critical paths
- [x] Adapter works through symlinked installation
- [x] Existing approval gates unchanged
- [x] Repository validation succeeds
