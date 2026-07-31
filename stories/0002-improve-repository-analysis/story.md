# Story

## Metadata

**ID**

0002

**Title**

Improve Repository Analysis

**Status**

Approved

---

## Goal

Improve the Repository Analysis stage so that it consistently produces implementation-focused engineering artifacts.

The Repository Analysis should provide the minimum information required for Implementation Planning without performing repository audits or architectural reviews.

---

## Context

The first execution of the `engineering-story` workflow successfully produced a Repository Analysis artifact.

The workflow correctly followed the approval gate and generated a complete report.

However, the analysis also included repository audit observations, documentation inconsistencies, and improvement suggestions that are outside the responsibility of the Repository Analysis stage.

---

## Problem

The current Repository Analysis mixes two different engineering activities:

* understanding the repository;
* evaluating the repository.

This makes the generated artifact longer than necessary and introduces recommendations that belong to a different workflow.

---

## Scope

Improve the Repository Analysis workflow so that it:

* focuses on repository understanding;
* identifies only Story-relevant modules;
* reports only Story-relevant constraints;
* reports only implementation risks;
* avoids repository-wide audits;
* avoids unsolicited improvement suggestions.

---

## Out of Scope

* Repository cleanup
* Architecture review
* Documentation review
* Technical debt analysis
* Implementation Planning
* Code generation

---

## Acceptance Criteria

* Repository Analysis is descriptive rather than evaluative.
* Repository-wide audits are no longer performed.
* Only Story-relevant information is reported.
* Risks remain limited to implementation risks.
* The resulting artifact is shorter and easier to consume.

---

## Constraints

Preserve the existing engineering workflow.

Do not change approval gates.

Do not modify the responsibilities of other workflow stages.

---

## Dependencies

Story 0001

---

## Relevant Documentation

* engineering-story/prompts/repository-analysis.md
* CONVENTIONS.md

---

## Definition of Done

* Repository Analysis prompt updated.
* Repository Analysis validated on a real Story.
* Engineering workflow behavior remains unchanged.
* Engineering Report completed.

