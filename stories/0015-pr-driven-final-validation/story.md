# Story

## Metadata

**ID:**
`0015`

**Title:**
Align Final Human Validation with Pull Request Review

**Status:**
Draft

---

## Goal

Update the `engineering-story` workflow so the final human validation happens on
the pull request after the last workflow deliverable is produced, while the
workflow itself is allowed to generate the final artifact, create the commit,
and open the pull request beforehand.

---

## Context

Some repositories enforce modern CI/CD rules where remote updates must flow
through pull requests instead of direct pushes to the main branch.

The current `engineering-story` workflow still treats Code Review human
approval as an in-workflow Gate 3 that must happen before:

* the final `Engineering Report`;
* the human Git commit boundary;
* DevLog completion.

That sequencing no longer matches the desired operating model for repositories
where the human engineer should validate the final pull request as the last
approval step.

---

## Problem

The workflow currently freezes too early.

It requires explicit human approval of the Code Review before the final
deliverable is produced, and before the Git/PR boundary is crossed.

This creates two mismatches:

* the final human validation is attached to a pre-PR artifact instead of the
  actual pull request that will be merged;
* the workflow-gate state machine and `engineering-story` contract no longer
  fit repositories where PR review is the authoritative final validation.

The workflow needs to preserve strong approval semantics for analysis and
planning, but move the final human validation outside the formal workflow so
the human engineer validates the actual PR before merge.

---

## Scope

* Update the `engineering-story` workflow contract so only Repository Analysis
  and Implementation Plan remain workflow Approval Gates.
* Move the final human validation after final artifact generation and treat it
  as a PR review/merge boundary outside the workflow.
* Allow the workflow to produce the final `Engineering Report`, then support
  commit and pull request creation before the external final validation.
* Update DevLog lifecycle guidance so completion aligns with the new Git/PR
  boundary.
* Update the `workflow-gate` plugin state machine and documentation to remove
  the in-workflow review approval state.
* Update the workflow prompts and repository documentation so the new authority
  model is explicit and consistent.

---

## Out of Scope

* Changing Gate 1 semantics for Repository Analysis approval.
* Changing Gate 2 semantics for Implementation Plan approval.
* Automating merge approval or merge execution.
* Building provider-specific PR tooling in this Story unless required by the
  approved implementation analysis.
* Changing the repository artifact set (`repository-analysis.md`,
  `implementation-plan.md`, `implementation-report.md`, `code-review.md`,
  `engineering-report.md`).
* Broad DevLog API redesign.

---

## Acceptance Criteria

* [ ] The documented `engineering-story` workflow no longer requires explicit
      human Code Review approval before `engineering-report.md` is produced.
* [ ] The workflow contract explicitly states that final human validation occurs
      on the pull request outside the formal workflow before merge.
* [ ] The workflow-gate state machine no longer contains an in-workflow
      `WAITING_FOR_REVIEW_APPROVAL` gate.
* [ ] The workflow still requires explicit human approval for Repository
      Analysis and Implementation Plan.
* [ ] The workflow still requires a Code Review artifact before the Engineering
      Report is produced.
* [ ] The updated DevLog lifecycle guidance remains coherent with the new
      commit/pull-request boundary.
* [ ] Prompt and documentation surfaces that previously described Gate 3 are
      reconciled with the new workflow contract.
* [ ] Relevant validation succeeds.

---

## Constraints

* Preserve deterministic workflow sequencing.
* Preserve artifact authority boundaries.
* Keep human approval semantics explicit.
* Do not silently replace formal workflow approval with implicit inference from
  tests, builds, or successful CI.
* Keep the workflow understandable for repositories that use PR-based remote
  update policies.

---

## Dependencies

* Existing `engineering-story` skill contract
* Existing `workflow-gate` plugin
* Existing DevLog lifecycle integration guidance

---

## Relevant Documentation

* `README.md`
* `CONVENTIONS.md`
* `engineering-story/SKILL.md`
* `engineering-story/prompts/code-review.md`
* `engineering-story/prompts/engineering-report.md`
* `engineering-story/prompts/implementation.md`
* `engineering-story/references/devlog-story.md`
* `plugins/workflow-gate/README.md`
* `plugins/workflow-gate/src/types.ts`
* `plugins/workflow-gate/src/transitions.ts`

---

## Definition of Done

* [ ] Repository Analysis approved
* [ ] Implementation Plan approved
* [ ] Implementation completed
* [ ] Relevant validation executed
* [ ] Code Review approved
* [ ] Engineering Report completed
