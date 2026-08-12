# Story 0015 — Align Final Human Validation with Pull Request Review — Repository Analysis

## Purpose

Understand how the current `engineering-story` workflow encodes final human
approval, commit/DevLog timing, and workflow-gate transitions so the workflow
can be realigned around pull-request-based final validation.

This analysis is scoped to workflow governance, not to repository feature code.

## Story Understanding

The requested change is not a cosmetic rewrite of workflow wording.

It changes where the final human authority sits:

* today, the workflow treats human approval of the Code Review as Gate 3 inside
  the workflow;
* target state: the workflow still produces all engineering artifacts,
  including the final `engineering-report.md`, but the human validates the pull
  request afterward, outside the formal workflow, before merge.

This means the workflow should keep strict explicit approval where it materially
authorizes engineering work:

* Repository Analysis approval;
* Implementation Plan approval.

It should stop treating the final review as an in-workflow gate that blocks the
final deliverable.

## Relevant Components

### `engineering-story/SKILL.md`

This file is the authoritative workflow contract.

Current behavior:

* defines three mandatory Human Approval Gates;
* Gate 3 is `Code Review Approval`;
* states that the Engineering Report, finalization, commit, merge, or
  equivalent completion action must not occur until the human explicitly
  approves the current Code Review;
* places the human commit boundary after Code Review approval and before
  Engineering Report completion.

Impact:

* this file must change first because it defines the governance model every
  prompt and tool follows.

### `plugins/workflow-gate/src/types.ts`

This file encodes the workflow state model.

Current behavior:

* includes `WAITING_FOR_REVIEW_APPROVAL`;
* maps `review -> WAITING_FOR_REVIEW_APPROVAL`;
* maps `WAITING_FOR_REVIEW_APPROVAL -> REPORT_IN_PROGRESS`;
* treats `review` approval as a required precondition for `report`.

Impact:

* the state model itself still enforces the obsolete Gate 3, so the plugin must
  be updated to match the new workflow authority model.

### `plugins/workflow-gate/src/transitions.ts`

This file encodes allowed transitions and stage preconditions.

Current behavior:

* `WAITING_FOR_REVIEW_APPROVAL` allows only `request_approval`;
* `report` completion requires `state.approvals["review"]`;
* `currentStateToStage()` assumes `REPORT_IN_PROGRESS` is only reachable after
  a review approval state.

Impact:

* transition rules must be simplified so Code Review completion can move
  directly into report generation without an extra approval gate.

### `plugins/workflow-gate/README.md`

This file documents the plugin state machine.

Current behavior:

* publicly documents the same Gate 3 state progression.

Impact:

* documentation must be reconciled with code and workflow contract in the same
  change set.

### `engineering-story/prompts/code-review.md`

This prompt currently treats Code Review as a stage that ends in
`WAITING_FOR_REVIEW_APPROVAL`.

Current behavior:

* explicitly says finalization and Engineering Report require human approval of
  the current Code Review;
* prohibits commit/push/merge authorization before that gate is satisfied.

Impact:

* this prompt must be reframed so the Code Reviewer still produces a strong
  technical review artifact, but no longer claims an in-workflow human gate
  blocks the Engineering Report.

### `engineering-story/prompts/engineering-report.md`

This prompt currently assumes the Engineering Report may only be produced after
explicit human approval of the current Code Review.

Impact:

* it must instead depend on the existence of a completed Code Review artifact
  and verified earlier approvals, while clearly stating that PR validation and
  merge approval remain outside the workflow.

### `engineering-story/prompts/implementation.md`

This prompt contains downstream authority boundaries around finalization,
commit, push, and merge.

Impact:

* wording likely requires reconciliation so implementation still cannot perform
  final workflow steps, but later workflow stages may produce the final
  artifact before the external PR validation happens.

### `engineering-story/references/devlog-story.md`

Current behavior:

* describes DevLog complete after the human creates the Git commit following
  the Engineering Report;
* assumes the older sequence where Engineering Report production happens only
  after Code Review approval.

Impact:

* DevLog lifecycle guidance must be checked carefully so completion remains
  aligned with the actual Git boundary once the report can be produced before
  external PR validation.

### Repository documentation: `README.md` and `CONVENTIONS.md`

Current behavior:

* both documents still present a three-approval workflow narrative including a
  final review approval before Engineering Report.

Impact:

* these documents must be updated or they will contradict the executable skill
  contract.

## Existing Design Tension

Story 0007 deliberately preserved three approval gates and introduced only a
mechanical human commit boundary after the Engineering Report.

That model was coherent when direct human commit was the last practical control
point.

It is less coherent for repositories where:

* remote changes must flow through pull requests;
* the real final human validation happens on the PR diff plus CI evidence;
* merge approval, not pre-report artifact approval, is the effective final
  authority.

The current workflow therefore stops too early relative to the actual
repository governance model.

## Architectural Interpretation

The cleanest interpretation of the requested change is:

* keep workflow approval gates only where they authorize costly or risky
  engineering work to begin;
* keep Code Review as a required technical verification artifact;
* let Engineering Reporting complete the formal engineering record;
* treat commit/PR creation as workflow-adjacent delivery work;
* treat final human PR validation and merge approval as external governance,
  not as a workflow-gate transition.

This preserves strong approval semantics without forcing the workflow to invent
an internal approval that the real repository process no longer uses.

## Risks

### 1. Weakening approval semantics accidentally

If Gate 3 is removed carelessly, the workflow could drift into implicit
approval based on passing tests or a positive code review.

Mitigation:

* require a completed Code Review artifact before Engineering Report;
* explicitly state that PR validation remains mandatory before merge;
* keep earlier explicit approval gates unchanged.

### 2. Contract drift between skill text and plugin enforcement

If `SKILL.md` changes without updating `workflow-gate`, the documented workflow
and executable state machine will diverge.

Mitigation:

* treat skill contract, plugin states, prompts, and docs as one atomic
  workflow-change surface.

### 3. DevLog lifecycle ambiguity

If DevLog completion timing is not re-evaluated, the system may record a Story
as completed before the repository’s actual final human PR validation.

Mitigation:

* implementation planning must decide whether DevLog complete should remain at
  commit time, move to PR creation time, or explicitly stay best-effort and
  pre-merge by design.
* whichever choice is taken must be documented clearly.

### 4. Backward-compatibility with non-PR repositories

A too provider-specific workflow could reduce generality.

Mitigation:

* define the final step in governance terms: external final validation on the
  proposed repository update boundary.
* PR is the primary example, but the underlying rule is “outside-workflow final
  validation before merge”.

## Files Likely Affected

Primary:

* `engineering-story/SKILL.md`
* `plugins/workflow-gate/src/types.ts`
* `plugins/workflow-gate/src/transitions.ts`
* `plugins/workflow-gate/README.md`
* `engineering-story/prompts/code-review.md`
* `engineering-story/prompts/engineering-report.md`
* `engineering-story/prompts/implementation.md`
* `engineering-story/references/devlog-story.md`
* `README.md`
* `CONVENTIONS.md`

Potentially relevant:

* workflow-related story templates or examples that hard-code three approval
  gates;
* tests for the `workflow-gate` plugin if present or if they need to be added.

## Questions Resolved by Analysis

### Is this just a documentation change?

No.

The executable workflow-gate state machine encodes the obsolete Gate 3. This is
behavioral workflow logic, not just wording.

### Must the Code Review artifact disappear?

No.

The request is about moving final human validation, not removing technical
review.

Code Review should remain a required artifact and input to Engineering Report.

### Must PR automation be implemented in this Story?

Not necessarily.

The request requires the workflow contract to allow commit and PR creation
before final human validation. The analysis does not yet prove that provider
specific PR tooling must be built as part of this change.

## Conclusion

The repository is sufficiently understood to plan implementation.

The change is centered on workflow governance and has a bounded surface area.
The key rule for the approved plan should be:

* two explicit in-workflow approval gates remain;
* Code Review remains mandatory;
* Engineering Report remains the final workflow artifact;
* final human validation moves to PR review outside the formal workflow;
* plugin enforcement, prompts, DevLog guidance, and repository docs must be
  updated together so workflow authority remains consistent.
