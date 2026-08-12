# Story 0011 — Extract Vault Candidates from Workspace Projects

## Metadata

**ID:**
`0011`

**Title:**
Scan Workspace Projects and Extract Useful Vault Candidates

**Status:**
Draft

---

## Goal

Design and implement a **punctual workspace scan** that can inspect multiple
projects in the workspace and extract candidate knowledge items useful for the
Obsidian transverse-memory vault, without requiring a permanent dedicated skill
or turning the vault into a second project database.

---

## Context

Stories 0009 and 0010 split the Obsidian initiative into:

* vault integration as transverse memory;
* fluid long-term feeding of that memory.

There is also a more tactical need:

* scan the current workspace;
* detect useful existing material across repositories;
* extract candidate concepts, patterns, decisions, lessons, and glossaries;
* prepare that material for vault ingestion.

This is different from the long-term continuous feeding pipeline:

* it may be run manually or on demand;
* it may analyze repositories in batch;
* it does not necessarily justify a reusable skill on day one;
* it is more like a migration, bootstrap, or discovery capability.

The challenge is to extract **useful** vault candidates rather than copying raw
project memory or flooding the vault with low-value artifacts.

---

## Problem

Useful transverse knowledge already exists across the workspace, but it is
scattered:

* Stories;
* Engineering Reports;
* Code Reviews;
* ADRs;
* project documentation;
* curated workspace notes;
* DevLog-backed project memory.

Without a deliberate extraction capability:

* bootstrapping the vault will depend on manual browsing across repositories;
* cross-project patterns may remain undiscovered;
* the first vault population may be inconsistent or biased toward the most
  recent project only;
* later feeding design lacks a realistic baseline for what “useful transverse
  knowledge” actually looks like in the current workspace.

This extraction must remain selective, provenance-aware, and safe to run
manually.

---

## Scope

* Define a punctual scan workflow for one or more workspace projects.
* Define which repositories and artifact types are eligible for extraction.
* Define what counts as a vault candidate versus raw project material.
* Define the extraction output model for candidate transverse knowledge.
* Define provenance and traceability requirements for extracted candidates.
* Define how the scan is triggered and controlled manually.
* Identify the minimum technical implementation needed for a first usable scan.

---

## Out of Scope

* Full continuous feeding pipeline; that belongs to Story 0010.
* Obsidian vault integration architecture itself; that belongs to Story 0009.
* Automatic publication of extracted candidates into curated vault notes.
* A mandatory reusable skill if a smaller ponctual implementation is
  sufficient.
* Exhaustive ingestion of every file in every repository.
* Deep semantic ranking infrastructure unless explicitly justified by the
  approved analysis and plan.

---

## Acceptance Criteria

* [ ] The Story defines a ponctual scan model across one or more workspace
  projects.
* [ ] The Story defines which artifact types are useful extraction sources.
* [ ] The Story defines a candidate output model suitable for later vault
  ingestion or curation.
* [ ] The Story defines provenance requirements back to repository, file, and
  source artifact.
* [ ] The Story defines how to avoid extracting low-value or duplicate material
  mechanically.
* [ ] The Story preserves the distinction between project memory and transverse
  vault knowledge.
* [ ] The Story identifies whether a simple script/command is sufficient or
  whether a reusable skill is actually justified.
* [ ] Relevant repository validation succeeds.

---

## Impacted Components

### Workspace Repositories

Candidate scan targets, for example:

* project repositories such as DevLog AI or Engineering-Skills;
* curated workspace notes;
* ADR collections;
* Story artifacts and engineering reports.

### Obsidian Vault

Would receive the extracted candidates later, but is not yet the direct target
of automated curation in this Story.

### Developer OS / Memory Federation Layer

Likely long-term home for this capability if it proves useful beyond a one-off
bootstrap.

### Engineering-Skills

Relevant as a source of high-value engineering artifacts and as the repository
where the Story itself is defined.

---

## Architectural Boundaries

* **Workspace scan** may discover candidates.
* **Candidate extraction** may propose transverse notes.
* **Vault curation** remains a later decision or workflow.
* **DevLog** remains authoritative for project memory where applicable.

Invariants:

```text
Scanning is discovery, not curation.
Extraction is proposal, not publication.

Workspace repositories remain source artifacts.
The vault remains the curated transverse layer.
```

---

## Risks

### Over-extraction

A naive scan could surface too many low-value candidates and make the result
unusable.

### Provenance erosion

If extracted candidates lose links back to their source artifacts, trust and
reviewability will suffer.

### Accidental duplication

The scan may repeatedly extract near-identical candidates from multiple
repositories unless deduplication or consolidation rules are defined.

### Premature abstraction

Building a full reusable skill too early may overcomplicate what should begin
as a ponctual workspace operation.

---

## Dependencies

* Story 0009 — Integrate Obsidian Vault as Transverse Memory
* Story 0010 — Design a Fluid Knowledge-Feeding Pipeline for the Obsidian Vault
* Existing workspace repositories and engineering artifacts
