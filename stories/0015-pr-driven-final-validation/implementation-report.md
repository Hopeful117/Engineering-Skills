# Story 0015 — Align Final Human Validation with Pull Request Review — Implementation Report

## Overview

Implemented the workflow change that moves the final human validation from an
internal Code Review approval gate to external pull request validation.

The formal workflow now keeps two explicit approval gates:

* Repository Analysis
* Implementation Plan

Code Review remains mandatory, but no longer blocks `engineering-report.md`
behind a third workflow approval gate.

Story completion is now tied to explicit human validation of the pull request,
and DevLog completion guidance was moved to the same boundary.

## Modified Files

### Workflow contract and guidance

* `engineering-story/SKILL.md`
* `engineering-story/references/devlog-story.md`

### Prompts

* `engineering-story/prompts/code-review.md`
* `engineering-story/prompts/engineering-report.md`

### Workflow-gate plugin

* `plugins/workflow-gate/src/types.ts`
* `plugins/workflow-gate/src/transitions.ts`
* `plugins/workflow-gate/src/index.ts`
* `plugins/workflow-gate/README.md`

### Repository documentation

* `README.md`
* `CONVENTIONS.md`

## Implemented Changes

### 1. Removed the in-workflow review approval gate

`engineering-story/SKILL.md` now defines two mandatory Human Approval Gates
instead of three.

The workflow sequence was updated so:

* Code Review still happens after Implementation;
* Engineering Report follows Code Review directly;
* commit / push / pull request creation happen after Engineering Report;
* final human validation happens on the pull request outside the formal
  workflow;
* Story completion happens only after that validation.

### 2. Moved DevLog completion to the PR-validation boundary

The previous guidance completed DevLog after the post-report human commit
boundary.

The new guidance completes DevLog only after:

* the final report exists;
* the relevant commit exists;
* the human confirms pull request validation.

This keeps DevLog `COMPLETED` aligned with the repository governance model
chosen for protected-branch repositories.

### 3. Simplified the workflow-gate state machine

The plugin no longer contains `WAITING_FOR_REVIEW_APPROVAL`.

The transition model now behaves as follows:

* `analysis -> WAITING_FOR_ANALYSIS_APPROVAL`
* `plan -> WAITING_FOR_PLAN_APPROVAL`
* `implementation -> CODE_REVIEW_IN_PROGRESS`
* `review -> REPORT_IN_PROGRESS`
* `report -> WORKFLOW_COMPLETED`

Approval tracking remains active for analysis and plan only.

The plugin README now states explicitly that `WORKFLOW_COMPLETED` refers to the
formal artifact workflow, while final PR validation remains orchestrated
outside the plugin by `engineering-story`.

### 4. Reconciled prompt authority boundaries

The Code Review prompt was updated so it:

* no longer enters `WAITING_FOR_REVIEW_APPROVAL`;
* no longer claims that Engineering Report is blocked on human Code Review
  approval;
* still prohibits the reviewer from granting merge or final acceptance.

The Engineering Report prompt was updated so it:

* no longer requires human approval of Code Review as an entry precondition;
* treats final PR validation as the final human acceptance event for Story
  completion;
* keeps earlier workflow approvals explicit and authoritative.

### 5. Reconciled repository documentation

Top-level documentation now reflects that:

* pull request validation can be the final human acceptance boundary;
* merge authority remains human-owned;
* explicit earlier workflow approval gates remain unchanged.

## Validation

### Automated / Tooling

Commands executed:

```text
cd plugins/workflow-gate && npm run build
cd plugins/workflow-gate && npm run plugin:validate
git diff --check
```

Results:

* TypeScript build passed.
* OpenClaw plugin validation passed: `Plugin workflow-gate is valid.`
* `git diff --check` passed.

### Manual consistency review

Performed targeted reconciliation checks across:

* `engineering-story/SKILL.md`
* workflow-gate state machine files
* Code Review and Engineering Report prompts
* DevLog lifecycle reference
* top-level repository documentation

Confirmed that active workflow surfaces no longer describe an in-workflow
review approval gate.

## Documentation Reconciliation

Documentation update: Completed.

Reason:

This Story changes the repository’s workflow contract and approval semantics,
so the canonical workflow documentation had to be updated together with the
skill and plugin logic.

## Vault Outcome

Vault consulted during Repository Analysis: no.

Outcome: deferred vault action.

Rationale:

The Story surfaced a useful transverse knowledge direction around CI/CD quality
pipelines and PR-based final validation, with `DevLog AI` as a potential
quality reference standard. However, this Story changed workflow governance
rather than analyzing the full CI/CD quality model itself, so the evidence is
not yet rich enough to create a high-quality vault candidate without mixing
governance conclusions and future quality-pipeline design.

Recommended follow-up:

* create a dedicated transverse note or section once the CI/CD quality
  validation model is analyzed explicitly across projects, using `DevLog AI` as
  the reference baseline.

## Deviations

One deliberate implementation nuance remains:

* the workflow-gate plugin still ends in `WORKFLOW_COMPLETED` after report
  completion, while Story completion itself is defined by `engineering-story`
  only after final human PR validation.

This is intentional to keep the plugin bounded to the formal artifact workflow
and avoid reintroducing the final human validation as an internal approval
gate.
