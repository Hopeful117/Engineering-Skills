# Engineering Report

## Story

Story 0015 — Align Final Human Validation with Pull Request Review.

## Objective

Update the `engineering-story` workflow so the final human validation occurs on
the pull request rather than as an internal Code Review approval gate, while
preserving explicit earlier approvals and keeping Code Review as a mandatory
artifact.

## Repository Analysis Summary

The approved analysis showed that the old workflow encoded final human
validation in too many places at once:

* `engineering-story/SKILL.md` still declared three mandatory gates;
* the `workflow-gate` plugin enforced `WAITING_FOR_REVIEW_APPROVAL`;
* prompts and docs still assumed Engineering Report depended on human approval
  of the Code Review.

That model no longer matched repositories where remote updates flow through
pull requests and the true final human governance point is PR validation before
merge.

## Implementation Plan Summary

The approved plan targeted four coordinated changes:

* remove the internal review-approval gate from the workflow contract;
* simplify the workflow-gate plugin to two approval gates;
* reconcile prompts and documentation with PR-based final validation;
* align DevLog completion with human PR validation.

The chosen completion rule was explicit:

* the Story is `Completed` only after human validation of the pull request.

## Implementation Summary

The workflow contract now defines two mandatory Human Approval Gates:

* Repository Analysis
* Implementation Plan

Code Review remains mandatory, but it now feeds directly into Engineering
Report generation instead of waiting on an internal approval state.

The workflow-gate plugin no longer models `WAITING_FOR_REVIEW_APPROVAL`, and
the DevLog lifecycle reference now completes the Story only after human PR
validation is confirmed.

Repository documentation was reconciled so the new authority model is visible
outside the skill internals.

## Modified Files

* `engineering-story/SKILL.md`
* `engineering-story/references/devlog-story.md`
* `engineering-story/prompts/code-review.md`
* `engineering-story/prompts/engineering-report.md`
* `plugins/workflow-gate/src/types.ts`
* `plugins/workflow-gate/src/transitions.ts`
* `plugins/workflow-gate/src/index.ts`
* `plugins/workflow-gate/README.md`
* `README.md`
* `CONVENTIONS.md`

## Architecture Impact

No new architecture or provider-specific PR subsystem was introduced.

The change is governance-focused:

* the plugin remains the deterministic controller of the formal artifact
  workflow;
* `engineering-story` remains the orchestrator of overall Story lifecycle;
* final PR validation remains human-owned and explicitly outside the internal
  approval-gate state machine.

This preserves explicit approval semantics while making the workflow compatible
with protected-branch repositories.

## Validation

Executed validation:

* `cd plugins/workflow-gate && npm run build`
* `cd plugins/workflow-gate && npm run plugin:validate`
* `git diff --check`

Results:

* TypeScript build passed.
* Plugin validation passed.
* diff hygiene passed.

## Documentation Reconciliation

Documentation update: Completed.

The repository’s canonical workflow documentation, prompts, and plugin README
were updated together with the executable state model.

## Review Outcome

Code Review found no findings.

The implementation was judged consistent with the approved Story and plan,
correctly scoped, and sufficiently validated for a workflow-governance change.

## Workflow Approvals

* Repository Analysis: Human approved
* Implementation Plan: Human approved

## Remaining Work

This Story’s workflow and reporting artifacts are complete, but the Story is
not yet operationally `Completed`.

Remaining external completion work:

* create the Git commit for the Story;
* push the branch and open the pull request if required by repository policy;
* obtain explicit human PR validation;
* only then mark the Story completed and send DevLog `complete`.

## Lessons Learned

* Strong CI/CD evidence and strong human governance are complementary, not
  interchangeable.
* Pull request validation is often the real final acceptance boundary in modern
  protected-branch repositories.
* A bounded workflow plugin can stay simple if the orchestrator explicitly owns
  external delivery and acceptance boundaries rather than trying to encode every
  post-report repository event as an internal approval gate.

## Final Status

Partially Completed
