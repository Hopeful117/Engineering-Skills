# Story 0015 — Align Final Human Validation with Pull Request Review — Implementation Plan

## Overview

Realign the `engineering-story` workflow with PR-based repository governance.

The workflow will continue to produce the full engineering artifact chain,
including `engineering-report.md`, but it will no longer treat Code Review as
an in-workflow Human Approval Gate.

The final human validation will happen on the pull request, outside the formal
workflow, and the Story will be marked `Completed` only after the human
confirms that PR validation occurred.

This keeps the workflow simple while preserving a strong final authority
boundary.

## Planning Decision

The user explicitly chose the simplest governance model:

* `Completed` happens after human validation of the pull request.

This rejects the earlier alternative of marking the Story completed as soon as
the PR is opened with a green pipeline.

The workflow must therefore distinguish between:

* the final workflow artifact being produced; and
* the Story actually becoming `Completed`.

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
Completed
```

Two explicit workflow Approval Gates remain:

* Repository Analysis approval
* Implementation Plan approval

Code Review remains mandatory, but no longer blocks Engineering Report through
an internal approval state.

## Planned Changes

### 1. Update the `engineering-story` workflow contract

Update:

* `engineering-story/SKILL.md`

Planned changes:

* remove Gate 3 as a mandatory in-workflow Human Approval Gate;
* rewrite the workflow sequence and STOP semantics accordingly;
* keep Code Review as a required stage and artifact before Engineering Report;
* state explicitly that final human validation occurs on the pull request,
  outside the formal workflow, before merge;
* state that Story `Completed` is reached only after the human confirms PR
  validation;
* move commit/PR boundary guidance so it happens after Engineering Report, not
  before it;
* update DevLog lifecycle completion guidance to align with the new sequence.

### 2. Simplify the workflow-gate state machine

Update:

* `plugins/workflow-gate/src/types.ts`
* `plugins/workflow-gate/src/transitions.ts`
* `plugins/workflow-gate/src/index.ts`
* `plugins/workflow-gate/README.md`

Planned changes:

* remove `WAITING_FOR_REVIEW_APPROVAL` from the state model;
* make Code Review completion transition directly into `REPORT_IN_PROGRESS`;
* remove `review` approval as a precondition for entering report stage;
* preserve approval tracking and hash verification for analysis and plan gates;
* keep workflow completion tied to report completion, while repository-facing
  workflow text clarifies that external PR validation is still required before
  the Story is considered fully complete by the orchestrator.

Important nuance:

* the plugin’s `WORKFLOW_COMPLETED` state remains the end of the formal
  artifact-production state machine;
* the skill contract will define that the Story is not operationally complete
  until the human confirms PR validation.

This keeps the plugin bounded while moving the final external validation to the
orchestrator contract.

### 3. Reconcile stage prompts with the new authority model

Update:

* `engineering-story/prompts/code-review.md`
* `engineering-story/prompts/engineering-report.md`
* `engineering-story/prompts/implementation.md`

Planned changes:

* remove instructions that claim Engineering Report requires explicit human
  approval of Code Review;
* preserve the rule that Code Review cannot itself approve commit, push, merge,
  or final acceptance;
* teach the Engineering Report prompt to summarize a completed workflow while
  remaining explicit that final PR validation still belongs to the human;
* keep implementation-stage guardrails unchanged for earlier workflow
  approvals.

### 4. Update DevLog lifecycle guidance

Update:

* `engineering-story/references/devlog-story.md`
* `engineering-story/SKILL.md`

Planned changes:

* move the previous “complete after human commit following Engineering Report”
  guidance to a PR-aware boundary;
* record that DevLog completion should happen only after the human confirms PR
  validation, because the Story is not considered `Completed` earlier;
* preserve the principle that DevLog is a record, not workflow authority.

This aligns DevLog history with the chosen completion rule instead of with mere
PR creation.

### 5. Reconcile repository-level documentation

Update:

* `README.md`
* `CONVENTIONS.md`

Planned changes:

* replace the old three-approval narrative with the new two-gate workflow plus
  external PR validation model;
* preserve the repository’s emphasis on explicit human authority and merge
  approval.

### 6. Add or update workflow-gate validation

If tests already exist for the plugin, update them.

If no targeted state-machine tests exist, add minimal focused coverage proving:

* analysis still requires approval;
* plan still requires approval;
* Code Review completion now leads directly toward report generation;
* no review approval state remains.

Expected likely touchpoints:

* plugin build validation
* targeted test execution if test harness exists

## Files to Modify

Primary files:

* `engineering-story/SKILL.md`
* `engineering-story/prompts/code-review.md`
* `engineering-story/prompts/engineering-report.md`
* `engineering-story/prompts/implementation.md`
* `engineering-story/references/devlog-story.md`
* `plugins/workflow-gate/src/types.ts`
* `plugins/workflow-gate/src/transitions.ts`
* `plugins/workflow-gate/src/index.ts`
* `plugins/workflow-gate/README.md`
* `README.md`
* `CONVENTIONS.md`

Possible additional files:

* workflow-gate tests, if present or required
* story examples or templates if they still hard-code the old Gate 3 model

## Files Not Expected to Change

* `engineering-story/scripts/devlog-story.mjs`
* `engineering-story/scripts/devlog-context.mjs`
* vault feeding scripts and proposal generation scripts
* unrelated ADRs unless implementation reveals a real architectural mismatch

## Validation Plan

Planned validation:

* targeted inspection of the updated workflow contract and prompts for internal
  consistency;
* plugin build:
  * `npm run build` in `plugins/workflow-gate`
* targeted plugin tests if available;
* `git diff --check`

If implementation adds or reveals executable plugin tests, they become part of
the required validation evidence.

## Risks and Controls

### Risk: plugin state and skill contract diverge

Control:

* update both in the same Story and review them together.

### Risk: “Completed” becomes ambiguous again

Control:

* state unambiguously in `SKILL.md`, prompts, and DevLog reference that
  completion occurs after human PR validation.

### Risk: hidden reintroduction of implicit approval

Control:

* preserve explicit earlier gates;
* preserve mandatory Code Review artifact;
* state that successful CI is evidence, not authority.

## Sequencing

1. Update the workflow contract in `SKILL.md`.
2. Update the workflow-gate state model and transitions.
3. Reconcile prompts and DevLog lifecycle reference.
4. Reconcile top-level documentation.
5. Run build/tests/validation.
6. Summarize the new authority model in the Implementation Report.

## Expected Outcome

After implementation:

* the formal workflow no longer blocks on a review-approval gate;
* the final engineering artifact is still produced deterministically;
* commit and PR creation are compatible with protected-branch repositories;
* final human validation remains explicit and authoritative on the PR;
* Story completion and DevLog completion both align with human PR validation.
