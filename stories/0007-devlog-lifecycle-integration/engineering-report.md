# Engineering Report

## Story

Story 0007 — DevLog Lifecycle Integration

Introduce the smallest deterministic Engineering-Skills integration that automatically synchronizes the lifecycle of an Engineering Story with the existing DevLog EngineeringStory API, closing the first missing edge in the feedback loop.

## Objective

DevLog Story 0029 created the `EngineeringStory` domain model and lifecycle endpoints (REGISTERED → IN_PROGRESS → COMPLETED). However, no code populated this entity during the Engineering-Skills workflow. Story 0007 closes this gap by automatically registering, starting, and completing Engineering Stories in DevLog at the correct workflow boundaries.

## Repository Analysis Summary

Engineering-Skills is a repository of workflow definitions and supporting integration components. The relevant architecture has three parts: `engineering-story/SKILL.md` (workflow orchestrator), `engineering-story/prompts/` (specialized workflow roles), and `plugins/workflow-gate/` (TypeScript plugin for deterministic workflow states).

The existing READ-side adapter (`devlog-context.mjs`) established the pattern for DevLog integration: custom error class, `formatFailure()`, CLI arguments, stdin/stdout JSON protocol, timeout handling, and symlink-compatible entry detection.

The DevLog lifecycle API exposes three endpoints: `POST /api/v1/projects/{projectId}/stories` (register), `POST /.../start` (with `baseCommit`), and `POST /.../complete` (with `targetCommit`). The entity enforces transitions via `requireStatus()` and has a unique constraint on `(project_id, story_number)`.

Key finding: the integration boundary must remain in `engineering-story/SKILL.md`, not in the workflow-gate plugin. DevLog lifecycle calls are orthogonal to workflow state transitions.

## Implementation Plan Summary

The approved plan specified:

1. Create `devlog-story.mjs` adapter handling register, start, complete operations.
2. Create `devlog-story.test.mjs` with 24+ tests.
3. Create `devlog-story.md` reference documentation.
4. Update `SKILL.md` with three lifecycle integration points.
5. Validate all tests pass and static checks confirm no regressions.

Important exclusions: no workflow-gate changes, no fourth Approval Gate, no automatic Git commits, no DevLog API modifications, no monitoring infrastructure.

## Implementation Summary

All planned work was completed without deviation:

- **Adapter**: `devlog-story.mjs` implements three operations following the exact patterns of `devlog-context.mjs`. Input validation covers URL, UUID, Git SHA format, and `targetCommit != baseCommit`. 409 Conflict is treated as success for idempotency. All failures emit `DEVLOG_LIFECYCLE_ERROR` and never block the workflow.

- **Tests**: 24 tests pass covering register (7), start (5), complete (5), failure (3), validation (2), and entrypoint (1). All use Node's built-in test runner with a local mock HTTP server.

- **Reference**: `devlog-story.md` documents CLI interface, JSON protocol, idempotency, validation, failure contract, and trust model.

- **SKILL.md**: Three integration points added:
  - Registration after Story creation, before Repository Analysis
  - Start after Gate 2 approval, before Implementation
  - Complete after human commit, before Engineering Report production
  - Human commit boundary explicitly documented as NOT an Approval Gate

## Modified Files

| File | Change |
|---|---|
| `engineering-story/SKILL.md` | Added three lifecycle integration points (DevLog Lifecycle Registration, DevLog Lifecycle Start, Human Commit Boundary and DevLog Lifecycle Complete) |

## Created Files

| File | Purpose |
|---|---|
| `engineering-story/scripts/devlog-story.mjs` | WRITE-side lifecycle adapter (register, start, complete) |
| `engineering-story/scripts/devlog-story.test.mjs` | 24 tests for the lifecycle adapter |
| `engineering-story/references/devlog-story.md` | Reference documentation for the lifecycle adapter |

## Architecture Impact

No architectural changes. The adapter follows the established pattern from `devlog-context.mjs`. The workflow-gate plugin remains the sole authority for workflow state and approval transitions. DevLog lifecycle calls are orthogonal side effects that record history without affecting approval.

Boundaries preserved:
- Engineering-Skills owns when lifecycle calls are triggered
- DevLog owns `EngineeringStory` lifecycle state
- The human owns the Git commit
- The workflow-gate remains authoritative for approval

No new dependencies, no database changes, no API changes.

## Validation

| Command | Result |
|---|---|
| `node --test engineering-story/scripts/devlog-story.test.mjs` | 24/24 pass |
| `node --test engineering-story/scripts/devlog-context.test.mjs` | 9/9 pass (no regression) |
| No UUID in SKILL.md | ✓ |
| No localhost in SKILL.md | ✓ |
| Workflow-gate source unchanged | ✓ |
| `devlog-context.mjs` unchanged | ✓ |

Known limitation: practical DevLog lifecycle validation requires deploying the updated DevLog backend (endpoints exist in code but are not in the running instance). Adapter tests use mock servers and fully validate all paths.

## Review Outcome

**Code Review technical recommendation:** Approve — all 17 acceptance criteria satisfied, all tests pass, no issues found.

**Human Code Review approval:** Granted.

**Residual risks:**
1. DevLog API not yet deployed — mitigated by mock server tests
2. Idempotency 409 limitation — mitigated by workflow ensuring one start/complete per Story
3. Human commit boundary compliance — mitigated by explicit SKILL.md instruction

## Workflow Approvals

- Repository Analysis: Human approved
- Implementation Plan: Human approved
- Code Review: Human approved

## Remaining Work

None. The Story is complete.

Optional non-blocking follow-up: practical validation with a running DevLog instance after the updated backend is deployed. This was explicitly excluded from the Story scope.

## Lessons Learned

1. **Adapter pattern consistency**: Following the exact patterns from `devlog-context.mjs` (error class, formatFailure, CLI args, stdin/stdout, isMainModule) made the new adapter predictable and testable without design decisions.

2. **Idempotency requires careful API analysis**: DevLog's 409 responses conflate "already in state" with "conflict with different data." The adapter treats 409 as success, but this is a documented limitation. Future API improvements could return more specific error codes.

3. **Human commit boundary ≠ Approval Gate**: The distinction between a workflow pause point (mechanical Git operation) and an Approval Gate (artifact review and authorization) is important for workflow clarity. Keeping them separate preserves the semantic precision of the three Approval Gates.

4. **Default parameter handling in Node ESM**: When destructuring parameters with defaults, the default must be applied at the destructuring site, not after validation. `function f({ x = DEFAULT })` ensures `x` is defined before any validation function sees it.

## Final Status

Completed
