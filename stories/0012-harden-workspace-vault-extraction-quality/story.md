# Story 0012 — Harden Workspace Vault Extraction Quality

## Metadata

**ID:**
`0012`

**Title:**
Improve Workspace Vault Extraction Quality Before Vault Bootstrap

**Status:**
Draft

---

## Goal

Improve the quality of the ponctual workspace-to-vault extraction process so it
produces a smaller, more relevant, and more trustworthy candidate set before
any real bootstrap of the Obsidian transverse-memory vault.

---

## Context

Story 0011 introduced the first punctual extraction capability for vault
candidates.

That first implementation proved the end-to-end shape:

* inspect a real vault;
* scan selected repositories;
* compare extracted topics against current vault notes;
* emit proposal-only candidate notes.

It also exposed concrete quality limits during real usage:

* repository source discovery is not layout-flexible enough;
* `Engineering-Skills` is scanned successfully, but `devlog-ai` is currently
  missed because its eligible artifacts live under `docs/stories/*`;
* generic Story-level artifacts such as broad code review reports are surfaced
  too easily as transverse candidates;
* current vault comparison is too weak to distinguish true new topics from
  likely duplicates or enrichments;
* the extraction output is technically valid but not yet editorially sharp
  enough to feed the vault with confidence.

Before integrating vault feeding into a broader workflow, the extraction step
must become more selective and more representative of real transverse value.

---

## Problem

The current bootstrap process can generate candidate proposals, but it still
overstates novelty and understates noise.

Without a refinement Story:

* bootstrap output risks flooding the review process with weak candidates;
* cross-project extraction quality remains biased by repository layout;
* high-value patterns from repositories such as `devlog-ai` may be absent;
* the vault may receive mechanical proposals instead of curated-worthy signal;
* later workflow integration would automate an extraction layer that is not yet
  mature enough.

The immediate need is not more automation.

It is better extraction quality.

---

## Scope

* Reassess the eligible source-discovery rules for workspace extraction.
* Support relevant repository layout variants when locating candidate sources.
* Define stronger heuristics for filtering low-value or overly generic
  artifacts.
* Define better comparison rules against the current vault to separate:
  * likely new topics;
  * likely enrichments of existing notes;
  * likely duplicates;
  * low-value skips.
* Define observable quality criteria for evaluating extraction usefulness on a
  real workspace run.
* Implement the minimum changes required to make the extraction output more
  credible for human review.

---

## Out of Scope

* Automatic publication into curated vault notes.
* Full workflow integration of vault feeding; that comes later.
* Rich semantic ranking infrastructure unless explicitly justified by the
  approved analysis and plan.
* Turning punctual extraction into a background ingestion system.
* Reworking the role of DevLog or the role of the Obsidian vault.
* Large-scale reorganization of the existing vault taxonomy.

---

## Acceptance Criteria

* [ ] The Story supports at least the currently relevant repository artifact
  layouts needed to scan both `Engineering-Skills` and `devlog-ai`.
* [ ] The Story reduces extraction noise from generic Story-level artifacts
  that are not strong transverse-memory candidates.
* [ ] The Story improves the distinction between `new`, `enrich-existing`,
  `duplicate`, and `skip`.
* [ ] The Story defines explicit observable quality expectations for a real
  bootstrap run.
* [ ] The Story preserves proposal-only behavior and does not silently curate
  the vault.
* [ ] The Story preserves provenance back to repository and source artifact.
* [ ] The Story includes validation that demonstrates the refined extraction
  behavior on representative repository layouts and artifact cases.
* [ ] Relevant repository validation succeeds.

---

## Impacted Components

### Engineering-Skills

Owns the current punctual extraction implementation and associated tests,
references, and ADRs.

### DevLog AI

Acts as a representative second repository whose artifact layout must be
properly supported if the extraction is to be meaningfully cross-project.

### Obsidian Vault

Remains the reviewed target of future bootstrap and curation, but must not be
modified automatically by this Story.

### Developer OS / Memory Federation Direction

Depends on extraction quality being trustworthy before this capability is wired
into any broader memory or workflow layer.

---

## Architectural Boundaries

* **Workspace extraction** remains discovery-oriented.
* **Candidate generation** remains proposal-only.
* **Vault curation** remains explicitly human-owned.
* **Repository artifacts** remain authoritative sources.

Invariants:

```text
Better extraction must not weaken curation boundaries.

Cross-project coverage matters, but signal quality matters more.
```

---

## Risks

### Overfitting to current repositories

If the extraction logic is tuned too narrowly to today's repositories, it may
become brittle for future projects.

### Over-filtering

If the heuristics become too aggressive, the system may suppress legitimate
cross-project lessons or patterns.

### False confidence

If classification improves only cosmetically, workflow integration may still be
built on top of weak signal.

### Heuristic sprawl

If the refinement grows into many ad hoc rules without a clear model, the
extraction process may become hard to understand and maintain.

---

## Dependencies

* Story 0009 — Integrate Obsidian Vault as Transverse Memory
* Story 0010 — Design a Fluid Knowledge-Feeding Pipeline for the Obsidian Vault
* Story 0011 — Extract Vault Candidates from Workspace Projects
* Existing real vault content
* Representative repositories including `Engineering-Skills` and `devlog-ai`
