# Story 0010 — Design Fluid Feeding of Obsidian Transverse Memory

## Metadata

**ID:**
`0010`

**Title:**
Design a Fluid Knowledge-Feeding Pipeline for the Obsidian Vault

**Status:**
Draft

---

## Goal

Design how the ecosystem should feed the Obsidian vault smoothly and safely
after the vault has been integrated as transverse memory, so the vault gains
high-value knowledge without becoming noisy, duplicated, or automatically
corrupted.

---

## Context

If Story 0009 succeeds, the vault will have a defined role:

* cross-project;
* concept-oriented;
* curated;
* linkable from the broader ecosystem.

The next problem is not “how to dump more data into Markdown,” but how to
promote the **right** knowledge into the vault with low friction and strong
provenance.

Potential upstream sources include:

* Engineering Reports;
* Code Review Reports;
* ADRs;
* decisions and lessons learned;
* validated cross-project patterns;
* future Developer OS memory services.

The feeding pipeline must preserve the distinction between:

* raw engineering artifacts;
* candidate transverse knowledge;
* curated vault notes.

---

## Problem

Without a designed feeding model:

* valuable lessons remain trapped inside project artifacts;
* the vault depends on manual copy/paste and will be inconsistently maintained;
* automation risks flooding the vault with low-signal material;
* provenance back to Story, project, ADR, or report can be lost;
* curation boundaries between machine-generated candidates and human-owned
  notes remain unclear.

The goal is to make feeding **fluid**, not uncontrolled.

---

## Scope

* Define the ingestion pipeline from engineering artifacts and project memory
  toward the Obsidian vault.
* Define which upstream sources are eligible to produce transverse-memory
  candidates.
* Define the promotion model between:
  * raw source artifacts;
  * candidate notes;
  * curated canonical notes.
* Define human-versus-automation responsibilities in the feeding process.
* Define how provenance, backlinks, and traceability must be preserved.
* Define the minimum automation shape for a first safe feeding workflow.

---

## Out of Scope

* Initial read-side vault integration itself; that belongs to Story 0009.
* Full autonomous summarization across all repositories.
* Aggressive background ingestion of every Story artifact.
* Complex recommendation ranking engines unless explicitly justified by the
  approved analysis and plan.
* Replacing human curation with fully automatic vault publication.
* Obsidian UI/plugin work unless required by the approved design.

---

## Acceptance Criteria

* [ ] The Story defines a staged feeding model from source artifacts to
  candidate notes to curated vault notes.
* [ ] The Story defines which engineering artifacts may generate transverse
  knowledge candidates.
* [ ] The Story defines when automation may create or update candidate notes
  and when human curation is required.
* [ ] The Story defines provenance and backlink requirements from vault content
  back to project artifacts and memory sources.
* [ ] The Story defines how to avoid flooding the vault with low-value or
  duplicate notes.
* [ ] The Story preserves the distinction between project memory and transverse
  memory.
* [ ] The Story identifies the minimum technical components required for a
  first fluid feeding workflow.
* [ ] Relevant repository validation succeeds.

---

## Impacted Components

### Obsidian Vault

Would receive candidate and curated transverse knowledge.

### DevLog AI

Potential upstream structured source for project-level facts and validated
knowledge that may later be promoted into transverse memory.

### Engineering-Skills

Owns many of the engineering artifacts likely to seed the transverse memory
pipeline, especially Engineering Reports, Code Reviews, and ADR-like decisions.

### Developer OS / Memory Federation Layer

Likely orchestration home for extraction, promotion, linking, and curation
support across sources.

---

## Architectural Boundaries

* **Source artifacts** remain authoritative for their original engineering
  context.
* **Candidate notes** are machine-assisted or workflow-assisted proposals.
* **Curated vault notes** are canonical transverse-memory notes.
* **Human curation** remains responsible for final promotion into durable
  transverse knowledge unless a later explicit design says otherwise.

Invariants:

```text
Automation may propose.
It must not silently curate.

The vault should accumulate signal, not exhaust.
```

---

## Risks

### Vault flooding

If every Story artifact becomes a note automatically, the vault loses signal.

### Provenance loss

If a curated note no longer points back to its source Story, report, or ADR,
trust degrades.

### Duplicate concept drift

If automation creates near-duplicate notes without consolidation rules, the
transverse memory becomes fragmented.

### Human bottleneck

If the process requires too much manual curation for low-level tasks, the vault
will stagnate.

---

## Dependencies

* Story 0009 — Integrate Obsidian Vault as Transverse Memory
* DevLog knowledge and project-memory model
* Engineering-Skills artifact model
* Future Developer OS memory-orchestration direction
