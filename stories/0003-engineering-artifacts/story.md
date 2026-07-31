# Story

## Metadata

**ID**

0003

**Title**

Introduce Engineering Artifacts

**Status**

Approved

---

## Goal

Introduce Engineering Artifacts as first-class concepts within Engineering Skills.

Every workflow stage should produce a standardized engineering artifact that serves as the input for the next stage.

The workflow should be viewed as a chain of engineering artifacts rather than a sequence of AI prompts.

---

## Context

The first executions of the `engineering-story` workflow demonstrated that every stage naturally produces a reusable document.

Examples include:

* Story
* Repository Analysis
* Implementation Plan
* Implementation Report
* Code Review Report
* Engineering Report

These documents represent engineering knowledge rather than conversational responses.

---

## Problem

Engineering Skills currently focuses on workflow stages and prompts.

However, the true value of the workflow lies in the engineering artifacts produced during execution.

Without explicitly defining Engineering Artifacts, future skills may generate inconsistent outputs or lose interoperability between workflow stages.

---

## Scope

Define Engineering Artifacts as the primary outputs of every workflow stage.

Document:

* what an Engineering Artifact is;
* how artifacts are produced;
* how artifacts are consumed;
* ownership of artifacts;
* artifact lifecycle;
* artifact immutability after approval.

Introduce an architectural decision documenting this model.

---

## Out of Scope

* Changes to workflow stages.
* New engineering skills.
* OpenCode integration.
* Multi-agent orchestration.
* Developer OS integration.
* Changes to existing Story templates.

---

## Acceptance Criteria

* Engineering Artifacts are formally defined.
* An ADR documents the architectural decision.
* The relationship between workflow stages and artifacts is documented.
* Artifact ownership is clearly defined.
* Artifact lifecycle is documented.

---

## Constraints

Preserve the current engineering workflow.

Do not change approval gates.

Remain tool-independent.

Keep the model reusable across repositories.

---

## Dependencies

* Story 0001 — Repository Foundation
* Story 0002 — Improve Repository Analysis

---

## Relevant Documentation

* README.md
* CONVENTIONS.md
* engineering-story/SKILL.md
* engineering-story/prompts/
* stories/story-template.md

---

## Definition of Done

* Repository Analysis completed.
* Implementation Plan approved.
* ADR created.
* Engineering Report completed.

