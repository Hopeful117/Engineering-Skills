# Story 0009 — Integrate Obsidian Vault as Transverse Memory

## Metadata

**ID:**
`0009`

**Title:**
Integrate an Obsidian Vault as Transverse Memory Alongside DevLog

**Status:**
Draft

---

## Goal

Define and implement the first safe integration of an Obsidian vault into the
ecosystem as a **transverse memory**, while preserving DevLog as the
authoritative structured memory for project-specific engineering state.

---

## Context

The ecosystem is converging toward differentiated memory layers:

* **DevLog** already acts as project memory:
  * structured;
  * deterministic;
  * workflow-aware;
  * story- and repository-scoped.
* **Engineering-Skills** defines how engineering knowledge is produced,
  reviewed, approved, and reported.
* A future **Developer OS** should federate knowledge across projects,
  workflows, and agents.

An Obsidian vault could play a complementary role:

* human-readable;
* cross-project;
* concept-oriented;
* narrative and connective rather than purely operational.

The risk is turning the vault into a second DevLog or a lossy duplicate of
workflow artifacts, which would create drift, ownership ambiguity, and
conflicting sources of truth.

The first step is therefore to integrate the vault as a **readable,
linkable, transverse memory layer**, not yet as a broad autonomous sync system.

---

## Problem

Today, DevLog can capture structured project memory, but it is not the ideal
home for:

* cross-project concepts;
* durable patterns;
* architecture themes spanning multiple repositories;
* curated lessons learned;
* higher-level “developer memory” that is useful outside one Story or one
  project timeline.

Without a dedicated transverse memory:

* reusable knowledge remains scattered across project reports and local notes;
* cross-project synthesis depends too much on human recall;
* concepts, patterns, and lessons have no clear canonical home;
* future Developer OS knowledge navigation lacks a curated layer above raw
  project memory.

The integration must avoid:

* duplicating DevLog project state into Markdown notes;
* introducing bidirectional sync complexity too early;
* making the vault authoritative for workflow or project-state facts.

---

## Scope

* Define the architectural role of the Obsidian vault in the ecosystem.
* Define a first integration model where the vault is readable, indexable, and
  linkable from the rest of the system.
* Define the ownership boundary between:
  * DevLog project memory;
  * transverse vault memory;
  * workflow artifacts;
  * local workspace memory.
* Define the minimum note model for transverse knowledge, including metadata
  conventions and provenance links.
* Define how the ecosystem can query or navigate vault content without
  transferring workflow authority to the vault.
* Identify the minimal engineering changes required for a first operational
  read-side integration.

---

## Out of Scope

* Automatic vault feeding from Stories or reports.
* Bidirectional sync between DevLog and Obsidian.
* Full semantic search or embeddings pipeline.
* Obsidian plugin development unless explicitly required by the approved
  analysis and plan.
* Making Obsidian the source of truth for project state, workflow approvals, or
  engineering lifecycle data.
* Importing all existing project documents into the vault.
* Personal knowledge-management features unrelated to the engineering memory
  model.

---

## Acceptance Criteria

* [ ] The Story defines a clear ownership split between DevLog project memory
  and Obsidian transverse memory.
* [ ] The Story defines which kinds of knowledge belong in the vault and which
  must remain in DevLog or workflow artifacts.
* [ ] The Story defines a minimal note model for the vault, including metadata
  and provenance conventions.
* [ ] The Story defines a first integration mode that is read-side and
  link-oriented rather than broad bidirectional sync.
* [ ] The Story preserves DevLog as the authoritative source for structured
  project-state memory.
* [ ] The Story preserves Engineering-Skills workflow authority and approval
  semantics.
* [ ] The Story identifies the minimum technical components needed to query,
  index, or navigate vault content from the ecosystem.
* [ ] Relevant repository validation succeeds.

---

## Impacted Components

### Developer OS / Ecosystem Memory Layer

Owns the federation between multiple memory sources and is the most likely
architectural home for this integration.

### DevLog AI

Owns project-specific structured memory and remains authoritative for Stories,
project knowledge, lifecycle state, and repository-scoped evidence.

### Obsidian Vault

Would become the canonical home for curated, cross-project, concept-level
knowledge.

### Engineering-Skills

Relevant because workflow artifacts are likely future upstream inputs to
transverse memory, but this Story must not yet design the write pipeline in
detail.

---

## Architectural Boundaries

* **DevLog** owns project memory and structured engineering state.
* **Obsidian vault** owns curated transverse knowledge.
* **Engineering-Skills** owns production and review of workflow artifacts.
* **Developer OS** should eventually federate and navigate these memory layers.

Invariants:

```text
DevLog is not replaced by the vault.
The vault is not a second DevLog.

Project facts remain project-scoped and structured.
Transverse knowledge remains curated, linkable, and cross-project.
```

---

## Risks

### Source-of-truth ambiguity

If the vault stores the same facts as DevLog without a clear ownership model,
the ecosystem will drift.

### Premature sync complexity

If the first integration attempts write-back or bidirectional sync too early,
the system may become fragile before the memory model is stable.

### Over-broad note model

If every kind of knowledge is pushed into the vault, transverse memory will
become another dumping ground instead of a curated layer.

### Workflow leakage

If the vault starts carrying workflow authority or lifecycle truth, engineering
governance becomes ambiguous.

---

## Dependencies

* DevLog project-memory model
* Engineering-Skills artifact and workflow model
* Future Developer OS memory federation direction
