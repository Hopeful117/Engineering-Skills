# ADR-002 — Transverse Memory Boundary

- **Status:** Accepted
- **Date:** 2026-08-12
- **Decision scope:** Engineering Skills memory-layer integration guidance

## Context

The ecosystem now contains or anticipates several different memory surfaces:

* DevLog project memory;
* Engineering Story workflow artifacts;
* OpenClaw workspace memory files;
* a possible Obsidian vault for cross-project knowledge;
* a future Developer OS federation layer.

Without an explicit boundary, these surfaces can drift into duplicate,
conflicting sources of truth. The main risks are:

* turning the vault into a second DevLog;
* treating local workspace notes as canonical engineering records;
* copying project-state facts into markdown notes without provenance;
* allowing a memory system to appear authoritative for workflow or approval.

Story 0009 requires a first safe integration of an Obsidian vault as
transverse memory without weakening ADR-001 or changing workflow authority.

## Decision

The ecosystem uses differentiated memory layers with explicit ownership.

### DevLog

DevLog owns structured, project-scoped engineering memory.

It is the authoritative home for:

* project knowledge;
* lifecycle records;
* repository-scoped evidence;
* structured project state.

### Engineering Artifacts

Engineering Artifacts own workflow-stage records.

They are the authoritative home for:

* Story scope;
* Repository Analysis;
* Implementation Plans;
* Implementation Reports;
* Code Review Reports;
* Engineering Reports;
* approval-traceable workflow reasoning.

ADR-001 remains authoritative for artifact semantics, lifecycle, and
immutability.

### Workspace memory

Workspace memory owns personal and operational continuity.

This includes local files such as:

* `MEMORY.md`;
* daily `memory/YYYY-MM-DD.md` notes;
* workspace-local operational notes.

Workspace memory is useful for continuity and operator context, but it is not a
canonical transverse engineering knowledge layer.

### Obsidian vault

The Obsidian vault owns curated, cross-project transverse knowledge.

It is the canonical home for knowledge such as:

* reusable concepts;
* recurring architectural patterns;
* lessons learned that matter across projects;
* cross-project glossaries;
* curated decision summaries that link back to authoritative sources.

The vault is a curated and link-oriented memory surface, not a project-memory
database.

### Developer OS

Developer OS is the likely future federation layer across these memory
surfaces.

It may later provide:

* navigation across memory layers;
* query orchestration;
* permissions and execution boundaries;
* user-facing federation experiences.

This ADR does not require Developer OS to exist now.

## Ownership Rules

### Rule 1: Project facts stay in project memory

Structured project-state facts remain in DevLog or repository-owned source
artifacts.

A vault note may summarize or contextualize those facts, but it must link back
to the authoritative source rather than silently duplicate mutable project
state.

### Rule 2: Workflow authority stays in workflow artifacts

The vault does not own workflow sequencing, approval state, or approval
decisions.

Memory systems may provide context, but they do not become workflow
controllers.

### Rule 3: Workspace memory stays local and operational

Workspace memory is not the same thing as transverse memory.

It may contain reminders, session continuity, or local notes, but it is not the
curated cross-project knowledge base.

### Rule 4: Transverse memory is curated and provenance-aware

Vault notes must preserve provenance back to Stories, ADRs, reports,
repositories, or other authoritative sources.

The vault accumulates curated signal, not raw dumps of upstream documents.

## First Integration Boundary

The first Obsidian integration is read-side only.

Story 0009 permits:

* defining the transverse-note contract;
* reading a local vault from the filesystem;
* indexing note metadata and links deterministically;
* using the vault as optional contextual navigation.

Story 0009 does not permit:

* automatic vault publication;
* bidirectional synchronization;
* vault-owned project state;
* vault-owned workflow state;
* semantic search infrastructure as a prerequisite.

## Consequences

### Positive

* each memory surface has a clear role;
* DevLog remains authoritative for project memory;
* workflow artifacts remain authoritative for workflow history;
* the vault can grow as curated cross-project knowledge without governance
  ambiguity;
* later Stories can build feeding and extraction on top of a stable boundary.

### Negative

* some information may appear in summarized form in the vault and in detail in
  project memory, requiring discipline around provenance;
* a curated vault needs explicit note conventions to avoid drift;
* users must understand that local workspace notes and curated vault notes serve
  different purposes.

## Scope Boundaries

This ADR does not:

* define a feeding pipeline into the vault;
* define workspace-wide extraction heuristics;
* define an Obsidian plugin;
* change DevLog APIs or schema;
* change `engineering-story` approval gates;
* replace ADR-001.
