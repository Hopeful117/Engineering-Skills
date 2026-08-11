# Repository Analysis

## Story Understanding

Story 0007 requests the first WRITE-side integration between Engineering-Skills and DevLog. While Story 0006 established READ-side context retrieval (DevLog → Engineering-Skills via `devlog-context.mjs`), Story 0007 closes the feedback loop by automatically synchronizing the Engineering Story lifecycle from Engineering-Skills → DevLog.

The integration covers three lifecycle operations:

1. **Register** — at Story creation, before Repository Analysis, send `POST /api/v1/projects/{projectId}/stories` with `storyNumber`, `title`, `storyPath`, and `projectId`.
2. **Start** — after Human Approval Gate 2 (Implementation Plan approved), before Implementation begins, capture `git rev-parse HEAD` as `baseCommit` and send `POST /.../start`.
3. **Complete** — after the human creates the Git commit following the Engineering Report, capture `git rev-parse HEAD` as `targetCommit` and send `POST /.../complete`.

The integration must be automatic, deterministic (driven by `git rev-parse HEAD`), non-blocking (DevLog failure never prevents engineering work), and minimal (the smallest change that closes the lifecycle loop).

The Story explicitly introduces a **human commit boundary**: after the Engineering Report is produced, the workflow tells the human to create the Git commit and waits for the commit to exist before resuming. This is NOT an Approval Gate — it is a workflow pause point for a mechanical Git operation.

## Repository Summary

Engineering-Skills is a repository of workflow definitions and supporting integration components. Its relevant architecture has three parts:

* `engineering-story/SKILL.md` is the workflow orchestrator. It owns stage sequencing, entry preconditions, STOP semantics, delegation boundaries, and Human Approval governance.
* `engineering-story/prompts/` defines specialized workflow roles (Repository Analysis, Implementation Planning, Implementation, Code Review, Engineering Reporting).
* `plugins/workflow-gate/` is a TypeScript OpenClaw plugin implementing deterministic workflow states and approval transitions.

The relevant existing integration component is `engineering-story/scripts/devlog-context.mjs` — the READ-side adapter introduced by Story 0006. This script:

* accepts `--base-url` and `--project-id` CLI arguments;
* reads the Story description from stdin;
* sends `POST /api/projects/{projectId}/engineering-story-context` with `{ description }`;
* validates the response and writes `RepositoryContext` JSON to stdout;
* exits with code 2 and writes `DEVLOG_CONTEXT_ERROR` to stderr on failure;
* has a test suite (`devlog-context.test.mjs`) using Node's built-in test runner and a local HTTP server.

The `engineering-story` skill is installed into the OpenClaw workspace through a symbolic link to this repository. The workspace `TOOLS.md` contains the DevLog base URL and repository-to-project UUID mapping.

The workflow-gate plugin has states: `STORY_CREATED`, `ANALYSIS_IN_PROGRESS`, `WAITING_FOR_ANALYSIS_APPROVAL`, `PLAN_IN_PROGRESS`, `WAITING_FOR_PLAN_APPROVAL`, `IMPLEMENTATION_IN_PROGRESS`, `CODE_REVIEW_IN_PROGRESS`, `WAITING_FOR_REVIEW_APPROVAL`, `REPORT_IN_PROGRESS`, `WORKFLOW_COMPLETED`, `BLOCKED`. DevLog lifecycle calls are orthogonal to these states — they record history, they do not control progression.

## Affected Modules

### `engineering-story/SKILL.md`

Owns when DevLog lifecycle calls are triggered. Currently has a "DevLog Context Preparation" section for the READ side. Must be extended with lifecycle synchronization points:

* Registration at Story creation (before Repository Analysis).
* Base commit capture after Gate 2 approval (before Implementation).
* Human commit boundary after Engineering Report.
* Target commit capture and Complete after human commit.

### `engineering-story/scripts/devlog-story.mjs` (new)

The WRITE-side adapter script. Handles three operations: `register`, `start`, `complete`. Follows the same design patterns as `devlog-context.mjs`:

* CLI arguments for `--base-url`, `--project-id`.
* Input via stdin (JSON payload with operation-specific fields).
* Structured output to stdout.
* Error handling with `DEVLOG_LIFECYCLE_ERROR` prefix.
* Same timeout and validation patterns.

### `engineering-story/references/devlog-story.md` (new)

Reference documentation for the lifecycle adapter. Follows the pattern of `references/devlog-context.md`. Documents:

* CLI interface and input/output contracts.
* Idempotency behavior (409 = success when resulting state matches).
* Failure contract and visible error prefix.
* Configuration reuse from `TOOLS.md`.

### `engineering-story/scripts/devlog-story.test.mjs` (new)

Test suite for the lifecycle adapter. Follows the pattern of `devlog-context.test.mjs`. Covers:

* Register: sends correct payload, handles 201 success.
* Register: handles 409 (already registered) as success.
* Start: sends correct `baseCommit`, handles 200 success.
* Start: handles 409 (already started) as success.
* Complete: sends correct `targetCommit`, handles 200 success.
* Complete: handles 409 (already completed) as success.
* Failure: network error → `DEVLOG_LIFECYCLE_ERROR`.
* Failure: timeout → `DEVLOG_LIFECYCLE_ERROR`.
* Failure: malformed response → `DEVLOG_LIFECYCLE_ERROR`.
* `targetCommit != baseCommit` validation.
* CLI entrypoint recognition through symlinks.

### OpenClaw workspace `TOOLS.md`

Already contains the DevLog base URL and repository-to-project UUID mapping from Story 0006. No new configuration mechanism needed — the lifecycle adapter reuses the same configuration.

### `plugins/workflow-gate/`

Remains the deterministic authority for workflow state and Human Approval Gates. **No changes required.** The DevLog lifecycle calls are orthogonal — they record history in DevLog, they do not affect workflow-gate state transitions.

### DevLog API (external, read-only dependency)

The existing `EngineeringStoryController` endpoints:

* `POST /api/v1/projects/{projectId}/stories` — body: `{ projectId, title, storyNumber, storyPath }` → 201 with story ID.
* `POST /api/v1/projects/{projectId}/stories/{storyId}/start` — body: `{ baseCommit }` → 200.
* `POST /api/v1/projects/{projectId}/stories/{storyId}/complete` — body: `{ targetCommit }` → 200.

Idempotency: `(project_id, story_number)` has a unique constraint → duplicate registration returns 409. Status transitions are enforced → wrong-state transitions return 409.

## Existing Implementation

### Existing DevLog lifecycle behavior (DevLog side)

`EngineeringStory` entity has fields: `id`, `projectId`, `title`, `storyNumber`, `storyPath`, `status` (REGISTERED/IN_PROGRESS/COMPLETED), `baseCommit`, `targetCommit`, `registeredAt`, `startedAt`, `completedAt`, `createdAt`, `updatedAt`. The `requireStatus()` method enforces transitions: `REGISTERED → IN_PROGRESS → COMPLETED`. Any deviation throws `ConflictException`.

### Existing READ-side adapter pattern

`devlog-context.mjs` establishes the exact pattern for DevLog integration:

* Custom error class (`DevLogContextError`).
* `formatFailure()` for visible error messages.
* `parseArguments()` for CLI argument parsing.
* `validateInputs()` for URL and UUID validation.
* `requestDevLogContext()` as the core HTTP function.
* `main()` as the CLI entrypoint.
* `isMainModule()` for symlink-compatible entry detection.
* Test suite with `before`/`after` server lifecycle, `jsonResponse` helper, and focused test cases.

The new `devlog-story.mjs` must follow these patterns exactly.

### Existing SKILL.md integration points

The SKILL.md currently has a "DevLog Context Preparation" section that runs before Repository Analysis. Story 0007 adds three more integration points:

1. After Story creation → registration.
2. After Gate 2 approval → base commit capture and start.
3. After Engineering Report + human commit → target commit capture and complete.

These are all preconditions or post-conditions of existing workflow stages, not new stages.

### Existing workflow-gate behavior

The workflow-gate plugin has no DevLog-related states and does not need any. The `STAGE_TO_COMPLETION_STATE` mapping and `APPROVAL_TO_NEXT_STATE` transitions remain unchanged. DevLog lifecycle calls happen at workflow boundaries but do not affect gate progression.

### Existing test patterns

`devlog-context.test.mjs` uses:

* Node built-in test runner (`node:test`).
* Local HTTP server with configurable responder.
* `assert` module for assertions.
* Test isolation via `before`/`after` hooks.
* Symlink recognition test.

The new test suite must follow these patterns.

## Behavior That Must Remain Unchanged

* The three Human Approval Gates and their explicit-approval semantics.
* Workflow-gate state transitions and approval hashes.
* The `engineering-story` workflow sequence (Story → Repository Analysis → Gate 1 → Implementation Plan → Gate 2 → Implementation → Documentation Reconciliation → Code Review → Gate 3 → Engineering Report → Completed).
* `devlog-context.mjs` behavior and its test suite.
* The human owns the Git commit. Engineering-Skills never automates commits, pushes, or merges.
* DevLog failure never blocks the engineering workflow.
* The `DEVLOG_CONTEXT_ERROR` prefix and fallback behavior for the READ side.
* Repository Analysis artifact structure and approval gate semantics.
* Delegate Task behavior and delegation preconditions.

## Relevant Documentation

* `README.md`
* `CONVENTIONS.md`
* `engineering-story/SKILL.md`
* `engineering-story/references/devlog-context.md`
* `engineering-story/scripts/devlog-context.mjs`
* `engineering-story/scripts/devlog-context.test.mjs`
* `plugins/workflow-gate/README.md`
* `plugins/workflow-gate/src/types.ts`
* `plugins/workflow-gate/src/transitions.ts`
* `stories/0006-integrate-devlog-context/story.md`
* `stories/0006-integrate-devlog-context/repository-analysis.md`
* `stories/0006-integrate-devlog-context/engineering-report.md`
* `stories/0007-devlog-lifecycle-integration/story.md`
* OpenClaw workspace `TOOLS.md`
* DevLog `EngineeringStoryController.java`
* DevLog `CreateEngineeringStoryRequest.java`
* DevLog `StartStoryRequest.java`
* DevLog `CompleteStoryRequest.java`
* DevLog `EngineeringStory.java` (entity)

## Constraints

* The Story belongs to Engineering-Skills; DevLog is an external provider and must not be modified.
* The existing DevLog API endpoints and request/response contracts must be reused. No DevLog API change is required or permitted.
* Configuration reuses the existing `TOOLS.md` mechanism (base URL + project UUID mapping). No new configuration format.
* DevLog lifecycle failure produces a visible `DEVLOG_LIFECYCLE_ERROR` message but never blocks the engineering workflow.
* The adapter must handle 409 Conflict as success when the resulting state matches the intended state (idempotency).
* The adapter must verify `targetCommit != baseCommit` before sending complete.
* The adapter must verify Git SHA format (40-character hex string).
* The human commit boundary is NOT an Approval Gate. The three existing Gates are preserved with their exact semantics.
* Automatic Git commit, push, and merge are excluded.
* The adapter must work through the symlinked installation path used by OpenClaw.
* No changes to the workflow-gate plugin state machine or approval semantics.
* No new workflow stages or approval gates.
* The skill must remain usable for repositories with no DevLog mapping.
* Existing `devlog-context.mjs` behavior and tests must not be affected.

## Risks

### Adapter complexity growth

Three operations (register, start, complete) with idempotency handling, Git SHA validation, and commit boundary semantics make `devlog-story.mjs` more complex than `devlog-context.mjs`. The implementation must keep the adapter small and testable without introducing a generic DevLog SDK.

### Timing of base commit capture

The base commit is captured after Gate 2 approval, before Implementation. If the repository changes between Gate 2 approval and the actual capture (e.g., documentation reconciliation from a parallel workflow, or an unrelated commit), the base commit may not represent the intended baseline. The adapter captures at the moment of invocation — this is the best available deterministic signal.

### Human commit boundary compliance

The workflow tells the human to create the Git commit and waits for input. If the human resumes without creating the commit, `targetCommit == baseCommit` and the adapter must reject the complete. The workflow must clearly communicate this requirement.

### DevLog API contract drift

The lifecycle endpoints were introduced in Story 0029 and are not yet deployed in the running DevLog instance. If the API contract changes before deployment, the adapter may need updates. This is a timing risk, not an architectural one.

### Test isolation for Git operations

The adapter captures `git rev-parse HEAD` at runtime. Tests must mock or isolate Git operations to avoid depending on repository state. The test suite must cover the case where Git is unavailable or returns an error.

### Idempotency edge cases

DevLog returns 409 for duplicate registration (unique constraint) and wrong-state transitions. The adapter must distinguish between "already in intended state" (treat as success) and "conflict with different data" (report error). The current DevLog API does not return enough information to make this distinction for start/complete with different commits — this is a documented limitation.

## Open Questions

None.

The exact implementation design (adapter structure, CLI interface, stdin/stdout protocol, test organization) can be resolved during Implementation Planning. The DevLog API contract is established, the integration points are clear, the adapter pattern exists, and the configuration is available.

## Recommendation

Ready for planning

The repository and external API are sufficiently understood. Ownership is clear, the existing `devlog-context.mjs` pattern provides a proven adapter design, the DevLog lifecycle API is established (Story 0029), and the workflow integration points are well-defined. No DevLog API change, workflow-gate transition change, or new architectural decision is required.

This recommendation is technical only. It does not approve the Repository Analysis or authorize Implementation Planning.

## Implementation Readiness

The Story can be implemented using the current repositories and API contract.

The Engineering-Skills repository has the adapter pattern (`devlog-context.mjs` + tests), the workflow orchestration (`SKILL.md`), and the configuration mechanism (`TOOLS.md`). The new adapter, reference documentation, test suite, and SKILL.md updates are all within the established boundaries.

DevLog's lifecycle endpoints exist in code (Story 0029) but are not yet deployed in the running instance. Successful-path validation requires either deploying the updated backend or using a mock server. The adapter's failure paths can be validated without a running DevLog instance.

No missing contract, ownership decision, persistence change, database migration, or ADR is required.

Repository Analysis completed.

Human approval required before Implementation Planning.

Awaiting explicit human approval.
