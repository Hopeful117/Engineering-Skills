# Story 0016 — Add Systematic Local Cleanup After PR Validation — Repository Analysis

## Purpose

Understand where the `engineering-story` workflow currently stops after human
PR validation, which workflow surfaces define completion semantics, and how a
safe local cleanup phase should be integrated without weakening approval
governance or deleting still-useful local work.

This analysis is scoped to workflow governance and repository hygiene, not to
feature implementation in downstream product repositories.

## Repository Context

### Current Git state

Repository branch at analysis time:

* base working line: `feat/story-0015-pr-validation`
* Story branch created for this analysis: `story/0016-systematic-local-cleanup-after-pr-validation`

Observed local working-tree nuance:

* `stories/0015-pr-driven-final-validation/engineering-report.md` already has
  an unrelated local modification marking Story 0015 as fully completed after
  human PR validation.

Impact:

* this Story must avoid mixing that unrelated local change into its own scope;
* implementation planning must account for dirty-tree-safe cleanup behavior
  because the repository itself currently demonstrates the exact class of risk
  the new cleanup step must not mishandle.

### DevLog context

Attempted but unavailable during this analysis:

* Story register
* Repository context fetch

Observed adapter failures:

* `DEVLOG_LIFECYCLE_ERROR: DevLog request failed: fetch failed.`
* `DEVLOG_CONTEXT_ERROR: DevLog request failed: fetch failed.`

Impact:

* Repository Analysis continues from direct repository inspection only;
* DevLog unavailability is not a blocker for this Story.

## Story Understanding

The requested change is not generic repository cleanup.

It is a workflow-completion change:

* Story 0015 already established that final human validation happens on the
  pull request and that Story completion occurs only after that validation;
* the workflow still stops immediately after `Completed`;
* local Git cleanup remains implicit manual follow-up.

The new requirement is to make local cleanup a systematic post-validation
behavior of `engineering-story`.

The desired cleanup must be:

* explicit;
* deterministic;
* local-only;
* conservative;
* ordered after human PR validation;
* safe in the presence of unrelated local changes and unmerged branches.

## Relevant Components

### `engineering-story/SKILL.md`

This file is the authoritative workflow contract.

Current behavior:

* the workflow sequence ends at:

```text
Engineering Report
↓
Commit / Push / Pull Request creation
↓
External human PR validation
↓
Completed
```

* the delivery-boundary section ends with:
  - human PR validation;
  - DevLog `complete`;
  - mark the Story as `Completed`.

Missing behavior:

* no post-completion local cleanup step is defined;
* no safety rules describe what Git operations are allowed after validation;
* no ordered handoff returns the repository to a predictable local state.

Impact:

* this is the primary contract surface that must change.

### `engineering-story/prompts/engineering-report.md`

This prompt currently positions the workflow as:

```text
Engineering Report
↓
Delivery preparation
↓
Human PR validation
↓
Completed
```

Current behavior:

* the report records final PR validation as the final acceptance event;
* it does not describe any mandatory post-validation cleanup behavior;
* it still treats completion as the terminal workflow state.

Impact:

* this prompt must be reconciled so it no longer implies that `Completed`
  immediately ends all orchestrated local work.

### `engineering-story/references/devlog-story.md`

Current behavior:

* DevLog `complete` happens only after human PR validation and a detectable
  commit boundary.

Important nuance:

* this reference currently defines lifecycle completion, not local Git
  housekeeping.

Impact:

* it likely needs only small reconciliation so the order remains coherent if
  cleanup happens after DevLog `complete` or after Story completion;
* it should not become a place that owns detailed Git cleanup policy.

### `engineering-story/references/opencode.md`

Current behavior:

* implementation delegation explicitly forbids OpenCode from:
  - committing automatically;
  - pushing automatically;
  - merging automatically;
  - rewriting Git history;
  - deleting branches;
  - discarding user modifications.

Architectural implication:

* branch deletion already belongs outside delegated implementation;
* local cleanup should remain orchestrator-owned, not delegated to the
  implementation provider.

Impact:

* this Story should preserve that boundary rather than weaken it.

### `README.md`

Current behavior:

* principles already mention that pull request validation is the final human
  acceptance boundary when repository policy requires PR-based delivery;
* the workflow example still ends at Engineering Report in the skills overview
  and does not explain post-validation cleanup.

Impact:

* top-level documentation likely needs a concise completion-flow update.

### `CONVENTIONS.md`

Current behavior:

* conventions explicitly require external PR validation before merge when
  repository policy requires it;
* no convention currently states what the repository should look like locally
  after that validation.

Impact:

* conventions should capture the safety intent of cleanup so later workflow
  changes do not drift.

### `plugins/workflow-gate/*`

Current behavior:

* the plugin models the formal artifact workflow only:
  - `analysis -> approval`
  - `plan -> approval`
  - `implementation -> review -> report -> WORKFLOW_COMPLETED`

Architectural implication:

* after Story 0015, final PR validation is already outside the plugin state
  machine;
* local cleanup after PR validation is even further outside the plugin’s
  responsibility.

Impact:

* there is no strong evidence yet that the plugin itself should change for this
  Story;
* implementation planning should challenge any plugin modification and require
  a clear justification before touching it.

## Existing Design Tension

Story 0015 corrected the governance model, but it also exposed a new boundary
question:

* what exactly happens locally after the workflow is considered complete?

Today the answer is inconsistent and manual.

That is undesirable because the workflow now owns:

* commit creation when delegated;
* PR creation when delegated;
* DevLog synchronization after human PR validation.

Once the workflow is already orchestrating repository delivery this far, leaving
local cleanup undefined makes the end state unnecessarily variable.

## Architectural Interpretation

The cleanest interpretation is:

* PR validation remains the final human repository-governance event;
* Story `Completed` remains a workflow conclusion, not a delegated action;
* after completion is confirmed, `engineering-story` performs a bounded local
  cleanup phase as repository housekeeping;
* that cleanup is not a Human Approval Gate and not a delegated implementation
  responsibility.

This suggests the end-to-end sequence should conceptually become:

```text
Engineering Report
↓
Commit / Push / Pull Request creation
↓
External human PR validation
↓
DevLog complete
↓
Story Completed
↓
Systematic local cleanup
```

An alternative is:

```text
External human PR validation
↓
DevLog complete
↓
Systematic local cleanup
↓
Story Completed
```

The difference matters because “Completed” should ideally describe whether the
workflow includes housekeeping or ends before it.

My recommendation is to treat cleanup as part of completion finalization rather
than as optional postscript work. That keeps the workflow’s promised final
state operationally meaningful.

## Cleanup Policy Candidates

### Candidate A — Aggressive cleanup

Behavior:

* switch to `main`
* pull latest `main`
* delete all non-current Story branches

Problem:

* too risky;
* not safe for unmerged branches;
* not safe for locally valuable branches;
* not safe in dirty working trees.

Verdict:

* reject.

### Candidate B — Conservative deterministic cleanup

Behavior:

* detect current working tree state;
* fetch and prune remotes;
* switch to local `main` only when safe;
* fast-forward local `main` from `origin/main`;
* delete only local Story branches that are already fully merged / obsolete;
* never delete unmerged branches;
* never discard unrelated local modifications.

Benefits:

* predictable end state;
* safe with ordinary Git hygiene;
* aligned with the user request;
* compatible with protected-branch repositories.

Verdict:

* best candidate.

### Candidate C — Report-only reminder

Behavior:

* document recommended cleanup in the Engineering Report;
* leave execution manual.

Problem:

* does not solve the actual inconsistency;
* keeps cleanup dependent on operator memory;
* does not enrich the workflow materially.

Verdict:

* insufficient.

## Risks

### 1. Deleting useful local work

If cleanup uses branch naming alone instead of merge status and working-tree
checks, it may delete branches that remain useful locally.

Mitigation:

* require merged/obsolete checks;
* never delete unmerged branches;
* never delete the current branch before safely repositioning;
* stop rather than guess when safety is unclear.

### 2. Conflicts with dirty working tree state

The repository already contains an unrelated local modification from Story 0015.

If cleanup blindly switches branches or pulls `main`, it may fail or encourage
unsafe stash/reset behavior.

Mitigation:

* cleanup policy must explicitly preserve local modifications;
* when branch switching is unsafe, the workflow should report the blocked
  cleanup outcome rather than forcing Git state changes.

### 3. Expanding orchestrator scope too far

If cleanup becomes a full Git janitor, the workflow could grow beyond its core
responsibility.

Mitigation:

* keep scope narrow:
  - local main synchronization;
  - merged Story branch cleanup;
  - explicit reporting of skipped cleanup.

### 4. Documentation / behavior drift

If only `SKILL.md` is updated, prompts and top-level docs will drift again.

Mitigation:

* treat workflow contract, prompts, and repository docs as one atomic
  change surface.

### 5. Plugin overreach

Trying to encode cleanup in `workflow-gate` could blur the boundary between
formal artifact workflow and post-validation local housekeeping.

Mitigation:

* default to no plugin change unless implementation analysis finds a real gap.

## Files Likely Affected

Primary:

* `engineering-story/SKILL.md`
* `engineering-story/prompts/engineering-report.md`
* `engineering-story/references/devlog-story.md`
* `engineering-story/references/opencode.md`
* `README.md`
* `CONVENTIONS.md`

Possible but not yet justified:

* helper scripts or references used by the orchestrator to standardize cleanup
  behavior

Unlikely / should remain untouched unless proven necessary:

* `plugins/workflow-gate/src/types.ts`
* `plugins/workflow-gate/src/transitions.ts`
* `plugins/workflow-gate/src/index.ts`

## Recommended Planning Direction

Implementation Planning should start from these assumptions:

1. The cleanup step belongs to `engineering-story`, not to delegated
   implementation providers.
2. The cleanup step should happen only after explicit human PR validation.
3. The cleanup step should be local-only and conservative.
4. The cleanup step must tolerate dirty working-tree scenarios by refusing
   unsafe transitions rather than forcing them.
5. Plugin changes should be avoided unless the approved design proves they are
   necessary.

## Gate Recommendation

Approve Repository Analysis.

The Story is well-scoped, the target behavior is clear, and the main
architectural question for planning is not whether cleanup should exist, but
how to define a conservative safety policy without turning workflow completion
into a destructive Git operation.
