# Story 0007 — DevLog Lifecycle Integration

## Metadata

**ID:**
`0007`

**Title:**
Automatically Synchronize Engineering Story Lifecycle with DevLog

**Status:**
Draft

---

## Goal

Introduce the smallest deterministic Engineering-Skills integration that automatically synchronizes the lifecycle of an Engineering Story with the existing DevLog EngineeringStory API, closing the first missing edge in the feedback loop.

---

## Context

DevLog Story 0029 introduced the DevLog-side `EngineeringStory` domain model and lifecycle:

```text
REGISTERED → IN_PROGRESS → COMPLETED
```

DevLog now exposes endpoints allowing an external workflow to:

1. register an Engineering Story (`POST /api/v1/projects/{projectId}/stories`);
2. start it with a deterministic Git `baseCommit` (`POST /.../start`);
3. complete it with a deterministic Git `targetCommit` (`POST /.../complete`).

However, Engineering-Skills currently uses DevLog only as a READ-side context provider before Repository Analysis (Story 0006). There is no automatic path from Engineering-Skills to DevLog lifecycle transitions.

Story 0029 created the container. The workflow does not populate it.

---

## Problem

DevLog holds an `EngineeringStory` entity that can record which Git evolution implemented a Story. But no code populates this entity during the Engineering-Skills workflow.

Without integration:

* DevLog's `EngineeringStory` table remains empty despite completed Stories;
* there is no deterministic link between an Engineering Story and its Git evolution;
* commit-scoped facts cannot be scoped to a Story;
* future Story-aware context, ranking, and documentation generation have no lifecycle data to work with;
* the feedback loop between Engineering-Skills and DevLog remains broken at its first edge.

The integration must be:

* automatic — no manual REST calls required;
* deterministic — driven by `git rev-parse HEAD`, not timestamps or heuristics;
* non-blocking — DevLog failure never prevents engineering work;
* minimal — the smallest change that closes the lifecycle loop.

---

## Scope

* Introduce a `devlog-story.mjs` adapter script for WRITE-side DevLog lifecycle synchronization (register, start, complete).
* Register the Engineering Story in DevLog at Story creation, before Repository Analysis.
* Capture a deterministic `baseCommit` via `git rev-parse HEAD` after Human Approval Gate 2 (Implementation Plan approved), before Implementation begins.
* Introduce a post-Engineering-Report human commit boundary: the workflow produces the report, tells the human to create the Git commit, and waits for the commit to exist before resuming.
* After the human commit, capture a deterministic `targetCommit` via `git rev-parse HEAD`.
* Send `COMPLETE` to DevLog with the `targetCommit`.
* Visible failure/fallback when DevLog is unavailable.
* Focused tests covering registration, start, completion, no-premature-completion, failure behavior, and runtime path.
* Documentation of the adapter and workflow behavior.

---

## Out of Scope

* Knowledge Graph Query API;
* KnowledgeRelations for EngineeringStory;
* automatic EngineeringEvent creation;
* automatic proposal generation;
* Story-aware Repository Context ranking;
* commit-scoped fact changes;
* Monitoring;
* Project Health;
* scheduler;
* background retries;
* message broker;
* frontend;
* Obsidian integration;
* documentation generation;
* AI interpretation;
* automatic Git commit;
* automatic push;
* automatic merge;
* multi-repository Stories;
* changes to the DevLog API contract;
* DevLog idempotency improvements (documented as limitation if needed);
* changes to the workflow-gate plugin state machine or approval semantics.

---

## Acceptance Criteria

* [ ] A `devlog-story.mjs` adapter script exists and handles three operations: `register`, `start`, `complete`.
* [ ] The adapter reuses the existing DevLog configuration from `TOOLS.md` (base URL and project UUID mapping).
* [ ] At Story creation, the adapter sends a `register` request to DevLog with the correct `storyNumber`, `title`, and `storyPath`.
* [ ] Registration failure produces a visible `DEVLOG_LIFECYCLE_ERROR` message but does not block Repository Analysis or any subsequent workflow stage.
* [ ] After Human Approval Gate 2 (Implementation Plan approved), before Implementation begins, the adapter captures `git rev-parse HEAD` and sends a `start` request with `baseCommit`.
* [ ] Start failure produces a visible `DEVLOG_LIFECYCLE_ERROR` message but does not block Implementation.
* [ ] After the Engineering Report is produced, the workflow explicitly tells the human to create the Git commit and waits for the commit to exist.
* [ ] The human commit boundary is NOT an Approval Gate. The three existing Approval Gates and their semantics are preserved.
* [ ] After the human commits, the adapter captures `git rev-parse HEAD` as `targetCommit` and verifies `targetCommit != baseCommit`.
* [ ] The adapter sends a `complete` request with `targetCommit`.
* [ ] Complete failure produces a visible `DEVLOG_LIFECYCLE_ERROR` message but does not mark the workflow as incomplete.
* [ ] No `complete` request is sent before the human commit exists.
* [ ] The adapter handles DevLog unavailability gracefully: engineering workflow remains usable, synchronization failure is visible.
* [ ] Automated validation covers: registration, start with correct baseCommit, completion with correct targetCommit, no-premature-completion, and DevLog unavailability fallback.
* [ ] The adapter works through the path actually used by the installed OpenClaw skill, including the symlinked installation.
* [ ] Existing approval gates, workflow-gate transitions, and artifact authority are unchanged.
* [ ] Relevant repository validation succeeds.

---

## Impacted Components

### Engineering-Skills / `engineering-story`

Owns:

* when DevLog lifecycle calls are triggered;
* how configuration is resolved;
* how `baseCommit` and `targetCommit` are captured;
* the human commit boundary behavior;
* warning and fallback behavior.

Likely affected areas: `engineering-story/SKILL.md`, `engineering-story/scripts/devlog-story.mjs` (new), `engineering-story/references/devlog-story.md` (new).

### OpenClaw Workspace Configuration

Owns the DevLog base URL and repository-to-project UUID mapping in `TOOLS.md`. No new configuration mechanism.

### Workflow Gate

Remains the deterministic authority for workflow state and Human Approval Gates. No transition model changes required.

### DevLog

Acts as the external lifecycle store through its existing API (Story 0029). No DevLog modification expected.

---

## Architectural Boundaries

* **DevLog** owns `EngineeringStory` lifecycle state: REGISTERED, IN_PROGRESS, COMPLETED.
* **Engineering-Skills / `engineering-story`** owns when lifecycle calls are triggered, configuration resolution, Git commit capture, the human commit boundary, and fallback behavior.
* **The human** owns the Git commit. Engineering-Skills never automates commits, pushes, or merges.
* **The workflow-gate** remains authoritative for workflow progression. DevLog records history; it does not control approval.

Invariant:

```text
DevLog records engineering history. The workflow-gate controls human approval.
Engineering-Skills bridges them deterministically.
```

---

## Design Decisions

### 1. Registration Point

**Decision:** Register at Story creation, before Repository Analysis.

**Rationale:** At this point, all metadata is deterministically available:

* `storyNumber` — from the Story ID (`0007` → `7`);
* `title` — from `story.md` metadata;
* `storyPath` — from the file system path relative to repository root;
* `projectId` — from `TOOLS.md` configuration.

No LLM inference is needed. The registration is a pure side effect of Story creation.

**Alternative considered:** Register at Repository Analysis start. Rejected because it couples registration to an optional analysis stage and introduces timing complexity.

### 2. Base Commit Capture

**Decision:** Capture after Human Approval Gate 2 (Implementation Plan approved), before Implementation begins.

**Rationale:** This is the earliest point where:

* the approved Implementation Plan exists;
* the human has authorized implementation;
* the repository state is stable (no implementation changes yet);
* `git rev-parse HEAD` gives a deterministic, meaningful baseline.

**Alternative considered:** Capture at Story creation. Rejected because the repository may change during Repository Analysis and Implementation Planning (documentation reconciliation, analysis artifacts). The base commit should represent the state immediately before implementation begins.

### 3. Target Commit Capture

**Decision:** After the human creates the Git commit, capture `git rev-parse HEAD` and verify `targetCommit != baseCommit`.

**Rationale:** The target commit must identify an actual Git commit containing the completed implementation. Only the human creates this commit. The workflow must:

1. produce the Engineering Report;
2. tell the human to create the commit;
3. wait for the commit to exist;
4. capture the new HEAD.

**Verification:** `targetCommit != baseCommit` is necessary but not sufficient. The adapter should also verify that `targetCommit` is a valid Git SHA (40-character hex string). The adapter does NOT verify commit message content or which files were changed — that is outside its scope.

### 4. Human Commit Boundary

**Decision:** After Engineering Report + Code Review approval, the workflow produces the report and explicitly tells the human: "Please create the Git commit for this Story. Resume after the commit exists." The workflow then waits for user input.

**Rationale:** This is NOT an Approval Gate. The three existing gates (Repository Analysis, Implementation Plan, Code Review) are preserved with their exact semantics. The human commit boundary is a different concept: it is a workflow pause point where:

* the workflow has completed all its stages;
* the human needs to perform a Git operation;
* the workflow resumes after confirming the commit exists.

**Alternative considered:** Introduce a fourth Approval Gate. Rejected because approval gates have specific semantic meaning (artifact review and authorization). A Git commit is not an artifact review — it is a mechanical operation.

### 5. Adapter Design

**Decision:** Separate `devlog-story.mjs` script, distinct from `devlog-context.mjs`.

**Rationale:**

* `devlog-context.mjs` is READ-side context retrieval (request context, parse response, return JSON).
* `devlog-story.mjs` is WRITE-side lifecycle synchronization (register, start, complete with Git SHAs).
* Different responsibilities, different error semantics, different invocation patterns.
* Keeping them separate preserves the single-responsibility principle and avoids a generic DevLog SDK.

### 6. Configuration

**Decision:** Reuse the existing `TOOLS.md` configuration mechanism (base URL + project UUID mapping). No new configuration.

**Rationale:** Story 0006 already established the pattern. The lifecycle adapter needs the same configuration. No additional configuration is genuinely necessary.

### 7. Failure Semantics

**Decision:** DevLog lifecycle failure produces a visible `DEVLOG_LIFECYCLE_ERROR` message but never blocks the engineering workflow. The adapter returns structured error information for diagnostic purposes.

**Rationale:** Consistent with the existing `DEVLOG_CONTEXT_ERROR` pattern. The engineering workflow is primary; DevLog synchronization is a side effect. However, failures must be visible — not silently swallowed — so the human knows the lifecycle is not synchronized and can retry manually if needed.

### 8. Idempotency

**Decision:** The adapter must handle the following DevLog behaviors:

| Operation | DevLog Behavior | Adapter Handling |
|---|---|---|
| Register (storyNumber exists) | 409 Conflict (unique constraint) | Treat as success — story already registered. Return existing story. |
| Start (already IN_PROGRESS) | 409 Conflict (status check) | Treat as success — already started. |
| Complete (already COMPLETED) | 409 Conflict (status check) | Treat as success — already completed. |

**Rationale:** The workflow may resume after interruption. If DevLog received the operation but Engineering-Skills did not receive the response, retry must not fail. The adapter treats 409 as a success when the resulting state matches the intended state.

**Limitation documented:** If a different `baseCommit` or `targetCommit` is sent for the same story, DevLog will reject it with 409. This is correct behavior — the adapter must not silently overwrite committed Git history.

---

## Constraints

* Follow Engineering-Skills repository conventions.
* Preserve the current `engineering-story` workflow sequence and artifact contract.
* Preserve all three Human Approval Gates and their explicit-approval semantics.
* Reuse DevLog's existing API (Story 0029 endpoints).
* Keep DevLog optional and fail open.
* Keep configuration environment-specific and the skill reusable.
* Avoid unrelated changes.

---

## Dependencies

* Existing `engineering-story` skill and workflow.
* Existing workflow-gate integration and Human Approval Gates.
* DevLog Story 0029 (`EngineeringStoryController` at `/api/v1/projects/{projectId}/stories`).
* A reachable DevLog backend for successful-path validation.
* OpenClaw workspace `TOOLS.md` DevLog configuration.

---

## Relevant Documentation

* `AGENTS.md`
* `README.md`
* `CONVENTIONS.md`
* `engineering-story/SKILL.md`
* `engineering-story/references/devlog-context.md`
* `plugins/workflow-gate/README.md`
* `plugins/workflow-gate/src/transitions.ts`
* `plugins/workflow-gate/src/types.ts`
* DevLog Story 0029 artifacts (`docs/stories/0029-engineering-story-identity/`)
* DevLog `EngineeringStoryController`, DTOs, and migration V36

---

## Definition of Done

* [ ] Repository Analysis approved
* [ ] Implementation Plan approved
* [ ] `devlog-story.mjs` adapter implemented and tested
* [ ] Workflow integration in SKILL.md completed
* [ ] Human commit boundary behavior validated
* [ ] Automated validation executed
* [ ] Code Review approved
* [ ] Engineering Report completed
