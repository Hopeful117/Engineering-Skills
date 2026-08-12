# Engineering Report

## Story

Story 0016 — Add Systematic Local Cleanup After PR Validation.

## Objective

Extend the `engineering-story` workflow so local Git cleanup becomes a
systematic part of finalization after explicit human PR validation, instead of
remaining implicit manual follow-up.

## Repository Analysis Summary

The approved analysis showed that Story 0015 solved the governance issue by
moving final validation to the pull request, but left local repository hygiene
undefined afterward.

The key architectural conclusion was that this gap belongs to the
`engineering-story` orchestrator, not to the `workflow-gate` plugin and not to
the delegated implementation provider.

The analysis also highlighted an important real-world safety constraint: the
repository already contained unrelated local modifications, so the cleanup model
had to refuse unsafe Git transitions rather than force them.

## Implementation Plan Summary

The approved plan targeted a narrow documentation-and-contract slice:

* extend `engineering-story/SKILL.md` with a post-validation cleanup phase;
* reconcile the Engineering Report prompt with the new completion semantics;
* clarify DevLog and OpenCode references;
* update top-level repository documentation;
* avoid any `workflow-gate` plugin change.

The chosen policy was conservative:

* fetch/prune refs;
* return to `main` only when safe;
* fast-forward `main` when possible;
* delete only eligible merged local Story branches;
* never discard unrelated work or delete unmerged branches.

## Implementation Summary

The workflow contract now includes:

* human PR validation;
* DevLog completion;
* systematic local cleanup;
* only then `Completed`.

The Engineering Report prompt now reflects that final completion requires both
human PR validation and safe cleanup resolution.

The supporting references now state that:

* `targetCommit` must be captured before cleanup changes branch position;
* local cleanup remains orchestrator-owned;
* OpenCode must not perform cleanup or branch deletion.

Repository-level docs now describe post-validation cleanup as part of the
workflow’s expected end state.

## Modified Files

* `engineering-story/SKILL.md`
  Updated the workflow sequence and delivery-boundary rules to include
  conservative local cleanup before completion.
* `engineering-story/prompts/engineering-report.md`
  Reconciled completion semantics, workflow approvals, and final-status rules.
* `engineering-story/references/devlog-story.md`
  Clarified `targetCommit` capture timing and ownership boundary.
* `engineering-story/references/opencode.md`
  Recorded that cleanup remains orchestrator-owned and non-delegated.
* `README.md`
  Updated the skills overview and principles to reflect post-validation
  cleanup.
* `CONVENTIONS.md`
  Added the conservative cleanup convention for workflow-owned delivery.

## Created Files

* `stories/0016-systematic-local-cleanup-after-pr-validation/story.md`
  Story definition for the workflow change.
* `stories/0016-systematic-local-cleanup-after-pr-validation/repository-analysis.md`
  Repository Analysis artifact.
* `stories/0016-systematic-local-cleanup-after-pr-validation/implementation-plan.md`
  Approved implementation plan.
* `stories/0016-systematic-local-cleanup-after-pr-validation/implementation-report.md`
  Implementation summary and validation record.
* `stories/0016-systematic-local-cleanup-after-pr-validation/code-review.md`
  Independent technical review.

## Architecture Impact

No new subsystem or plugin state model was introduced.

Preserved boundaries:

* `workflow-gate` still owns only the formal artifact workflow;
* `engineering-story` owns external delivery and post-validation workflow
  finalization;
* OpenCode remains prohibited from branch deletion and cleanup authority.

This is a governance refinement, not a runtime architecture change.

## Validation

Executed validation:

* `git diff --check`

Manual consistency review covered:

* `engineering-story/SKILL.md`
* `engineering-story/prompts/engineering-report.md`
* `engineering-story/references/devlog-story.md`
* `engineering-story/references/opencode.md`
* `README.md`
* `CONVENTIONS.md`

Results:

* diff hygiene passed;
* workflow wording is consistent across the modified surfaces;
* plugin build/validation was not applicable to the approved scope because no
  plugin file changed.

## Vault Outcome

* curated vault context materially informed the Story: no
* vault action: none
* outcome remained proposal-only: not applicable

## Review Outcome

Technical recommendation: Ready for pull request validation.

Code Review found no blocking findings.

Residual risk:

* cleanup behavior is still contract-driven rather than backed by a dedicated
  helper script.

Final human approval state:

* Repository Analysis: approved
* Implementation Plan: approved
* Human PR validation: pending

## Workflow Approvals

* Repository Analysis: Human approved
* Implementation Plan: Human approved

## Remaining Work

* obtain human validation of the eventual pull request;
* run the workflow’s final local cleanup and completion sequence after that
  validation.

## Lessons Learned

* Moving the final human validation to the PR boundary naturally exposes the
  need to define the local repository end state as part of workflow completion.
* Post-validation Git cleanup belongs to the orchestrator contract, not to the
  formal artifact state machine.
* Conservative cleanup rules are more important than automation breadth when
  local repositories may already contain unrelated work.

## Final Status

Partially Completed
