# Story 0016 — Add Systematic Local Cleanup After PR Validation — Implementation Report

## Overview

Implemented the workflow change that makes local Git cleanup a systematic part
of `engineering-story` finalization after explicit human PR validation.

The implementation is intentionally narrow:

* it updates the workflow contract and its supporting documentation;
* it keeps cleanup orchestrator-owned;
* it does not extend the `workflow-gate` plugin;
* it defines conservative cleanup semantics rather than introducing aggressive
  Git automation.

## Modified Files

### Workflow contract and guidance

* `engineering-story/SKILL.md`
* `engineering-story/references/devlog-story.md`
* `engineering-story/references/opencode.md`

### Prompts

* `engineering-story/prompts/engineering-report.md`

### Repository documentation

* `README.md`
* `CONVENTIONS.md`

## Implemented Changes

### 1. Extended the workflow sequence with local cleanup finalization

`engineering-story/SKILL.md` now defines the end of the workflow as:

* Engineering Report
* commit / push / pull request creation
* external human PR validation
* systematic local cleanup
* Completed

This closes the gap left by Story 0015, where final human validation was moved
to the PR boundary but local repository cleanup remained implicit.

### 2. Defined conservative cleanup rules

The delivery-boundary section now states that cleanup must:

* refresh remote refs with `git fetch --prune`;
* switch to local `main` only when safe;
* fast-forward local `main` from `origin/main` when possible;
* delete only eligible merged local Story branches;
* never rewrite history;
* never discard unrelated local changes;
* never delete unmerged branches.

It also states explicitly that unsafe cleanup must be reported rather than
forced.

### 3. Updated completion semantics

The workflow now treats `Completed` as requiring both:

* confirmed human PR validation;
* cleanup finalization resolved safely.

That means completion no longer describes only governance success. It now
describes the promised post-delivery local repository state as well.

### 4. Reconciled Engineering Report instructions

`engineering-story/prompts/engineering-report.md` was updated so it:

* includes systematic local cleanup in the end-of-workflow sequence;
* no longer mentions a human-approved Code Review gate;
* records only:
  - Repository Analysis human approval
  - Implementation Plan human approval
  - final human PR validation
* defines `Completed` as requiring safe cleanup resolution.

This keeps the reporting prompt aligned with Story 0015 and avoids reintroducing
obsolete gate semantics.

### 5. Preserved the orchestrator/provider boundary

`engineering-story/references/opencode.md` now states explicitly that
post-validation local cleanup remains owned by `engineering-story`.

This preserves the existing Git safety rules:

* OpenCode still must not delete branches;
* branch cleanup is not delegated implementation work.

### 6. Reconciled DevLog lifecycle guidance and top-level docs

`engineering-story/references/devlog-story.md` now clarifies that
`targetCommit` must be captured before any later cleanup changes branch
position.

`README.md` and `CONVENTIONS.md` now describe post-validation local cleanup as
part of the workflow’s conservative delivery behavior.

## Validation

### Executed checks

Commands executed:

```text
git diff --check
```

### Manual consistency review

Performed targeted consistency review across:

* `engineering-story/SKILL.md`
* `engineering-story/prompts/engineering-report.md`
* `engineering-story/references/devlog-story.md`
* `engineering-story/references/opencode.md`
* `README.md`
* `CONVENTIONS.md`

Confirmed:

* cleanup is described after human PR validation;
* completion semantics are aligned across contract, prompt, and docs;
* no plugin change is required by the implemented scope;
* no obsolete `Code Review: Human approved` workflow statement remains in the
  updated reporting prompt.

## Documentation Reconciliation

Documentation update: Completed.

Reason:

This Story is itself a workflow-contract and documentation evolution. The
canonical repository documentation and prompt surfaces had to change together.

## Vault Outcome

Vault consulted during Repository Analysis: no.

Outcome: no vault action.

Rationale:

The Story refines repository-local workflow behavior but does not introduce a
new transverse knowledge pattern beyond the existing Engineering Skills
governance model.

## Deviations

No implementation deviation from the approved plan.

The deliberate non-change remained intact:

* `workflow-gate` was not modified, because post-validation local cleanup is
  outside the plugin’s formal artifact-workflow responsibility.
