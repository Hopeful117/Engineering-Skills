# Story 0016 — Add Systematic Local Cleanup After PR Validation — Implementation Plan

## Overview

Extend the `engineering-story` workflow so a Story does not stop immediately
after human PR validation and DevLog completion.

Instead, the workflow will define and document a final local cleanup phase that
returns the repository to a predictable post-delivery state when that cleanup
can be performed safely.

The chosen design keeps this behavior in the `engineering-story` contract and
its supporting guidance. It does **not** extend the `workflow-gate` plugin,
because cleanup happens after the formal artifact workflow and after external
human repository validation.

## Planning Decision

The approved Repository Analysis pointed to the conservative workflow-owned
approach.

Chosen rule:

* after explicit human PR validation, `engineering-story` performs systematic
  local cleanup as part of workflow finalization;
* cleanup is local-only and conservative;
* cleanup must never delete unmerged branches or discard unrelated local work;
* when cleanup cannot be executed safely, the workflow reports the cleanup as
  skipped/blocked rather than forcing Git state changes.

This keeps the workflow useful while preserving Git safety.

## Target Workflow

The planned target sequence is:

```text
Story
  ↓
Repository Analysis
  ↓
WAITING_FOR_ANALYSIS_APPROVAL
  ↓ explicit human approval
Implementation Plan
  ↓
WAITING_FOR_PLAN_APPROVAL
  ↓ explicit human approval
Implementation
  ↓
Documentation Reconciliation
  ↓
Code Review
  ↓
Engineering Report
  ↓
Commit / Push / Pull Request creation
  ↓
External human PR validation
  ↓
DevLog complete
  ↓
Systematic local cleanup
  ↓
Completed
```

Important interpretation:

* PR validation remains the final human governance event;
* DevLog completion remains best-effort and follows that validation;
* local cleanup is workflow finalization, not a Human Approval Gate;
* `Completed` should reflect the final post-cleanup workflow state, not merely
  the existence of a validated PR.

## Planned Changes

### 1. Update the `engineering-story` workflow contract

Update:

* `engineering-story/SKILL.md`

Planned changes:

* extend the workflow sequence with a post-validation cleanup phase;
* update the delivery-boundary section so completion no longer happens
  immediately after PR validation / DevLog complete;
* define the cleanup responsibilities explicitly:
  - refresh remote refs with prune;
  - return to local `main` only when safe;
  - fast-forward local `main` from `origin/main` when possible;
  - delete only eligible merged local Story branches;
  - never rewrite history, discard changes, or delete unmerged branches;
* define failure behavior:
  - unsafe cleanup must stop or report a skipped cleanup outcome;
  - cleanup must not silently downgrade into destructive Git behavior.

### 2. Reconcile Engineering Report workflow wording

Update:

* `engineering-story/prompts/engineering-report.md`

Planned changes:

* update the workflow-position section so it includes cleanup after PR
  validation;
* update completion wording so the report no longer implies that completion is
  reached before cleanup finalization;
* update the “Remaining Work” / “Final Status” semantics so local cleanup is
  not treated as an invisible out-of-band manual task when it is required by
  the workflow contract;
* keep the distinction between technical recommendation and human PR validation
  unchanged.

### 3. Reconcile supporting references

Update:

* `engineering-story/references/devlog-story.md`
* `engineering-story/references/opencode.md`

Planned changes:

* clarify that DevLog completion still happens after PR validation, but before
  or alongside local workflow finalization;
* document that local cleanup belongs to the orchestrator, not to delegated
  implementation providers;
* preserve the existing OpenCode Git safety rules and make sure local cleanup
  does not reopen provider-side branch deletion.

### 4. Reconcile repository-level documentation

Update:

* `README.md`
* `CONVENTIONS.md`

Planned changes:

* document that workflow completion includes a safe local cleanup phase after
  human PR validation;
* preserve the repository’s governance model:
  - human validation remains explicit;
  - merge authority remains human-owned;
  - cleanup is housekeeping, not authority.

### 5. Avoid `workflow-gate` plugin changes

Do **not** update:

* `plugins/workflow-gate/src/types.ts`
* `plugins/workflow-gate/src/transitions.ts`
* `plugins/workflow-gate/src/index.ts`
* `plugins/workflow-gate/README.md`

Reason:

* the plugin models the formal artifact workflow only;
* Story 0015 already moved PR validation outside the plugin;
* Story 0016 is about post-validation local housekeeping, which sits even
  further outside the plugin boundary.

This is an intentional non-change, not an omission.

### 6. Keep implementation narrow and documentation-driven

The Story should stay bounded to contract and guidance surfaces unless the
implementation proves a small helper artifact is required.

No standalone Git automation script is planned by default.

Reason:

* the immediate value is to make the workflow behavior explicit and safe;
* a helper script can be considered later only if repeated execution shows that
  manual orchestration is too ambiguous.

## Files to Modify

Primary files:

* `engineering-story/SKILL.md`
* `engineering-story/prompts/engineering-report.md`
* `engineering-story/references/devlog-story.md`
* `engineering-story/references/opencode.md`
* `README.md`
* `CONVENTIONS.md`

Story artifacts:

* `stories/0016-systematic-local-cleanup-after-pr-validation/implementation-report.md`
* `stories/0016-systematic-local-cleanup-after-pr-validation/code-review.md`
* `stories/0016-systematic-local-cleanup-after-pr-validation/engineering-report.md`

## Files Not Expected to Change

* `plugins/workflow-gate/src/types.ts`
* `plugins/workflow-gate/src/transitions.ts`
* `plugins/workflow-gate/src/index.ts`
* `plugins/workflow-gate/README.md`
* `engineering-story/scripts/devlog-story.mjs`
* `engineering-story/scripts/devlog-context.mjs`
* vault-related workflow artifacts

## Validation Plan

Planned validation:

* targeted consistency review across:
  - `engineering-story/SKILL.md`
  - `engineering-story/prompts/engineering-report.md`
  - `engineering-story/references/devlog-story.md`
  - `engineering-story/references/opencode.md`
  - `README.md`
  - `CONVENTIONS.md`
* `git diff --check`

Not planned unless implementation scope unexpectedly expands:

* `workflow-gate` plugin build
* plugin validation

Reason:

* the current approved plan intentionally avoids plugin changes.

## Risks and Controls

### Risk: cleanup wording becomes too aggressive

Control:

* define cleanup as conservative and safety-first;
* say explicitly what must never happen.

### Risk: cleanup semantics remain ambiguous

Control:

* describe the cleanup order concretely in `SKILL.md`;
* align prompts and docs so the same end-state is described everywhere.

### Risk: “Completed” becomes inconsistent again

Control:

* define whether completion happens only after cleanup finalization;
* keep that same interpretation across the workflow contract and Engineering
  Report prompt.

### Risk: hidden coupling with provider implementation

Control:

* preserve the orchestrator/provider boundary;
* keep branch deletion outside OpenCode responsibility.

## Sequencing

1. Update `engineering-story/SKILL.md` with the new completion flow and cleanup
   policy.
2. Reconcile `engineering-story/prompts/engineering-report.md`.
3. Reconcile `engineering-story/references/devlog-story.md`.
4. Reconcile `engineering-story/references/opencode.md`.
5. Reconcile `README.md` and `CONVENTIONS.md`.
6. Run diff-hygiene validation and perform targeted consistency review.
7. Record the final behavior and any limitations in the Implementation Report.
