# Story 0014 — Continuous Vault Feeding Workflow

## Metadata

**ID:**
`0014`

**Title:**
Design a Continuous Workflow for Feeding the Obsidian Vault

**Status:**
Draft

---

## Goal

Design and implement the next safe step after workflow integration: a repeatable
continuous feeding workflow that keeps the Obsidian vault evolving from real
engineering work without turning it into a noisy, automatically published dump.

---

## Context

The ecosystem now has:

* a curated transverse-memory vault;
* a candidate-note lifecycle;
* a ponctual bootstrap extractor;
* a first curated corpus populated from real repositories;
* a forthcoming workflow integration Story that will define where the vault
  participates in `engineering-story`.

Once the vault is part of the workflow, the next missing capability is not
initial population.

It is steady-state evolution.

The system needs a repeatable way to:

* detect when a Story produced vault-worthy knowledge;
* generate or amend candidate notes at the right moment;
* preserve provenance and reviewability;
* avoid re-proposing the same knowledge every time a similar Story completes.

This should feel continuous.

It must not become uncontrolled.

---

## Problem

The current bootstrap path is useful for discovery and initial curation, but it
is not the same thing as a sustainable long-term feeding workflow.

Without a continuous model:

* new transverse knowledge may depend on periodic manual rescans;
* candidate generation may remain inconsistent across Stories;
* enrich-existing versus new-note decisions may be handled ad hoc;
* the vault may stagnate after bootstrap or become noisy through repeated
  manual extraction batches.

The next challenge is therefore not “how to scan more files,” but:

> how to evolve curated transverse memory continuously from real workflow
> outcomes.

---

## Scope

* Define the steady-state trigger points for candidate generation inside the
  workflow.
* Define which workflow artifacts are eligible continuous upstream sources.
* Define when the system should propose:
  * a new candidate note;
  * an amendment to an existing curated note;
  * no vault action at all.
* Define how repeated Stories avoid generating duplicate candidate work.
* Define how curation decisions are recorded and made visible.
* Identify the minimum technical implementation needed for a first continuous
  feeding workflow.

---

## Out of Scope

* Initial bootstrap scanning across the full workspace.
* Replacing human curation with automatic publication.
* Full semantic memory-graph infrastructure unless explicitly justified by the
  approved analysis and plan.
* Large-scale vault refactoring.
* Changing the authority model between DevLog, workflow artifacts, and the
  vault.

---

## Acceptance Criteria

* [ ] The Story defines the steady-state trigger points for vault candidate
  generation.
* [ ] The Story defines the eligible workflow artifacts for continuous feeding.
* [ ] The Story defines when to create a new candidate, enrich an existing
  note, or do nothing.
* [ ] The Story defines how repeated workflow executions avoid duplicate vault
  churn.
* [ ] The Story preserves proposal-only behavior until human curation occurs.
* [ ] The Story defines how vault-feeding outcomes are recorded in workflow
  artifacts or metadata.
* [ ] The Story identifies the minimum implementation required for a first
  continuous feeding workflow.
* [ ] Relevant repository validation succeeds.

---

## Impacted Components

### Engineering-Skills

Likely home for the first continuous feeding contract, prompts, and candidate
generation hooks.

### Obsidian Vault

Receives curated growth through explicit reviewable candidate updates rather
than periodic brute-force rescans only.

### Workflow Artifacts

Implementation Reports, Code Reviews, and Engineering Reports may need explicit
vault-feeding outcomes.

### DevLog AI

May remain an upstream factual or contextual source, but not the owner of the
vault-feeding workflow.

---

## Architectural Boundaries

* **Bootstrap extraction** is for discovery.
* **Continuous feeding** is for steady-state evolution.
* **Candidate notes** remain proposals.
* **Curated notes** remain human-owned canonical transverse memory.

Invariants:

```text
Continuous feeding must be lighter than bootstrap.
It must not be noisier than bootstrap.

The vault should evolve from workflow outcomes.
It should not be rewritten by workflow execution.
```

---

## Risks

### Duplicate churn

If each Story proposes the same concept again, the feeding workflow will create
curation fatigue.

### Underfeeding

If the trigger rules are too conservative, useful transverse knowledge may stop
reaching the vault.

### Overcoupling to current workflow artifacts

If the design depends too tightly on current artifact wording, it may become
brittle as the workflow evolves.

### Hidden state

If curation outcomes are not recorded clearly, the system may repeatedly behave
as though nothing has ever been proposed or accepted.

---

## Dependencies

* Story 0010 — Design a Fluid Knowledge-Feeding Pipeline for the Obsidian Vault
* Story 0013 — Integrate the Obsidian Vault into the Engineering Story Workflow
* Existing curated Engineering Vault
* Candidate-note and extraction capabilities already present in Engineering-Skills
