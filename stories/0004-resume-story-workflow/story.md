# Story

## Metadata

**ID**

0004

**Title**

Resume Story Workflow Automatically

**Status**

Approved

---

## Goal

Allow the `engineering-story` skill to determine and execute the next valid workflow stage when the user asks to continue an existing Story.

The user should not need to manually specify which stage must run next.

---

## Context

The current workflow requires the user to explicitly request each stage:

* Repository Analysis
* Implementation Planning
* Implementation
* Code Review
* Engineering Report

The skill already knows the workflow order and the expected artifact paths.

It should use the Story directory to determine the current workflow state.

---

## Problem

The user currently acts as the workflow orchestrator.

This creates unnecessary repetition and increases the risk of:

* requesting the wrong stage;
* skipping a required stage;
* using the wrong artifact path;
* attempting implementation before approval;
* repeating completed work.

---

## Scope

Improve the `engineering-story` skill so that it can:

* inspect the current Story directory;
* detect existing workflow artifacts;
* determine the latest completed stage;
* determine the next valid stage;
* identify missing prerequisites;
* execute only the next valid stage;
* stop at the next human approval gate;
* report the detected workflow state.

Support a simple request such as:

```text
Continue Story 0004.
```

---

## Expected Artifact Order

```text
story.md
repository-analysis.md
implementation-plan.md
implementation-report.md
code-review.md
engineering-report.md
```

The skill must use this order when determining workflow progress.

---

## Approval Rules

The skill must not infer approval from file existence alone.

A completed artifact that requires human approval must be explicitly approved before the next stage runs.

If approval cannot be confirmed, the skill must stop and request it.

---

## Out of Scope

* Automatic human approval
* Automatic commits
* Automatic merges
* Pull request creation
* Parallel workflow stages
* OpenCode integration
* Multi-agent orchestration
* Workflow rollback
* Changing existing artifact formats

---

## Acceptance Criteria

* The skill can locate a Story directory from its ID or provided path.
* The skill detects which workflow artifacts already exist.
* The skill identifies the next valid stage.
* The skill does not repeat a completed stage unnecessarily.
* The skill does not skip required stages.
* The skill stops when an upstream artifact lacks human approval.
* The skill executes only one stage per continuation request.
* The skill saves the resulting artifact to the expected Story directory.
* The skill reports the current state and the next required approval or stage.
* Existing approval gates remain unchanged.

---

## Constraints

* Preserve the existing Engineering Story workflow.
* Preserve all human approval gates.
* Remain tool-independent.
* Do not infer approval from filenames or timestamps.
* Do not modify completed approved artifacts.
* Keep workflow-state detection understandable and deterministic.
* Avoid introducing a runtime service or persistent database.

---

## Dependencies

* Story 0003 — Introduce Engineering Artifacts
* ADR-001 — Engineering Artifacts as First-Class Workflow Records

---

## Relevant Documentation

* `engineering-story/SKILL.md`
* `engineering-story/prompts/`
* `CONVENTIONS.md`
* `docs/adr/ADR-001-engineering-artifacts.md`
* `stories/README.md`

---

## Definition of Done

* Repository Analysis approved.
* Implementation Plan approved.
* Automatic next-stage detection implemented.
* Continuation behavior validated on a real Story.
* Code Review approved.
* Engineering Report completed.

