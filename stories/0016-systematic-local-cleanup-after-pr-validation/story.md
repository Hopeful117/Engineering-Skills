# Story

## Metadata

**ID:**
`0016`

**Title:**
Add Systematic Local Cleanup After PR Validation

**Status:**
Draft

---

## Goal

Extend the `engineering-story` workflow so a validated Story ends with a
systematic, safe local Git cleanup after the human confirms the pull request
has been validated.

---

## Context

Story 0015 moved the final human validation to the pull request boundary and
made Story completion happen only after the human confirms PR validation.

That resolved the governance issue, but the workflow still leaves local Git
state cleanup as an implicit manual follow-up. In practice, merged Story
branches can accumulate locally and the repository may remain on a stale Story
branch even though the workflow is already operationally complete.

The workflow should close this gap and return the local repository to a clean,
predictable post-delivery state.

---

## Problem

The current workflow stops at Story completion without defining what should
happen to the local Git workspace afterward.

That creates avoidable friction:

* merged Story branches accumulate locally;
* local `main` may remain outdated;
* the engineer may stay positioned on an obsolete Story branch after delivery;
* cleanup behavior becomes inconsistent across repositories and sessions.

The workflow needs an explicit post-validation cleanup step that is systematic
but conservative, so it improves hygiene without deleting still-useful local
work.

---

## Scope

* Update the `engineering-story` workflow contract to include a post-validation
  local cleanup phase after human PR validation.
* Define the exact cleanup responsibilities and safety rules.
* Update prompts, references, and repository documentation that describe the
  delivery boundary and completion behavior.
* If required by the approved implementation analysis, update workflow-owned
  executable guidance or supporting artifacts so the cleanup behavior is
  operationally clear and testable.

---

## Out of Scope

* Automatic merge execution.
* Remote branch deletion policy.
* Cleanup of unmerged local branches.
* Cleanup of unrelated local working tree changes.
* Repository-specific release automation.

---

## Acceptance Criteria

* [ ] The workflow contract explicitly states that local cleanup occurs after
      explicit human PR validation.
* [ ] The workflow defines a conservative cleanup policy that updates local
      `main` and removes only eligible merged Story branches.
* [ ] The workflow does not allow cleanup to delete unmerged branches or
      unrelated local work.
* [ ] Documentation and prompt surfaces that describe Story completion are
      reconciled with the new post-validation cleanup behavior.
* [ ] Relevant validation succeeds.

---

## Constraints

* Preserve explicit human authority for PR validation and merge approval.
* Keep cleanup local-only unless a separate repository policy explicitly
  requires more.
* Prefer deterministic and conservative Git behavior.
* Avoid any destructive cleanup of branches or working tree state that has not
  already become safely obsolete.

---

## Dependencies

* Story 0015
* Existing `engineering-story` workflow contract
* Existing delivery-boundary and DevLog lifecycle guidance

---

## Relevant Documentation

* `README.md`
* `CONVENTIONS.md`
* `engineering-story/SKILL.md`
* `engineering-story/prompts/engineering-report.md`
* `engineering-story/references/devlog-story.md`
* `engineering-story/references/opencode.md`

---

## Definition of Done

* [ ] Repository Analysis approved
* [ ] Implementation Plan approved
* [ ] Implementation completed
* [ ] Relevant validation executed
* [ ] Code Review approved
* [ ] Engineering Report completed
