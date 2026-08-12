# ADR-003 — Transverse Memory Feeding

- **Status:** Accepted
- **Date:** 2026-08-12
- **Decision scope:** Engineering Skills transverse-memory feeding guidance

## Context

Story 0009 introduced the first safe transverse-memory boundary:

* DevLog owns structured project memory;
* Engineering Artifacts own workflow-stage records;
* workspace memory owns local operational continuity;
* the Obsidian vault owns curated cross-project transverse knowledge.

That work established how curated vault notes are modeled and read, but it did
not define how new knowledge safely reaches the vault.

Without an explicit feeding model, the ecosystem risks:

* manual copy/paste as the default knowledge path;
* automatic dumping of low-value artifacts into the vault;
* duplicate or drifting concept notes;
* ambiguous ownership between proposed knowledge and curated knowledge.

Story 0010 therefore needs an explicit feeding lifecycle.

## Decision

The feeding lifecycle for transverse memory is:

```text
authoritative source artifact
  ->
candidate note
  ->
curated note
```

These are three distinct states with different ownership and authority.

### Source artifact

A source artifact is an authoritative upstream input such as:

* an Engineering Report;
* a Code Review Report containing reusable lessons;
* an ADR;
* a validated cross-project pattern record;
* selected durable DevLog project knowledge.

Source artifacts remain authoritative for their original claims.

### Candidate note

A candidate note is a proposal derived from one or more authoritative sources.

It exists to:

* surface potentially transverse knowledge;
* preserve provenance and suggested synthesis;
* make human curation reviewable;
* distinguish proposal from accepted vault knowledge.

Candidate notes are not canonical knowledge.

### Curated note

A curated note is the canonical transverse-memory note stored in the vault.

Curated notes may summarize and connect knowledge across projects, but must link
back to authoritative sources.

## Ownership Rules

### Rule 1: Source authority is never transferred silently

Candidate or curated notes do not replace the authority of the source artifact.

### Rule 2: Automation may propose, not curate

Automation may create or update candidate notes, but it may not silently
publish curated notes or overwrite them as if curation had already happened.

### Rule 3: Curated notes remain the only canonical vault notes

Only curated notes represent accepted transverse memory.

Candidate notes remain explicitly provisional until human curation resolves
them.

### Rule 4: Feeding must preserve provenance

Every candidate and curated note must preserve source references and backlinks
sufficient to verify the underlying claim.

### Rule 5: Feeding must resist flooding

Not every eligible source produces a note automatically.

Cross-project relevance, provenance quality, and duplication risk are part of
the candidate decision.

## Eligible Sources

Likely eligible sources include:

* Engineering Reports;
* Code Review Reports when they contain reusable lessons or patterns;
* ADRs;
* validated cross-project patterns;
* selected durable DevLog knowledge.

By default, the following are not sufficient on their own:

* every Story artifact indiscriminately;
* transient implementation details;
* project-local state;
* personal workspace memory.

## Candidate Lifecycle

The initial candidate lifecycle is intentionally small.

Suggested states:

* `proposed`
* `needs-curation`
* `superseded`

This ADR does not require a larger workflow state machine.

## Update and Merge Model

A candidate note may represent either:

* a proposed new transverse concept; or
* a proposed update to an existing curated note.

The proposal must say which case it represents.

This avoids encouraging duplicate canonical notes when the better action is to
merge or amend an existing concept.

## First Technical Boundary

The first feeding implementation may generate deterministic candidate-note
drafts or payloads.

It must not:

* write directly into curated notes;
* act as a workflow gate;
* claim that curation already happened;
* implement broad multi-project scanning as a prerequisite.

## Consequences

### Positive

* feeding becomes explicit and reviewable;
* the vault can be populated with higher signal and stronger provenance;
* candidate generation becomes possible without pretending to be curation;
* Story 0011 can remain focused on ponctual extraction/bootstrap concerns.

### Negative

* the system now has an intermediate candidate layer that must be managed;
* curation remains a human responsibility and therefore a potential bottleneck;
* later stories may need better deduplication or consolidation support.

## Scope Boundaries

This ADR does not:

* implement workspace-wide scanning;
* authorize automatic publication;
* define a full recommendation engine;
* define an Obsidian plugin;
* change DevLog APIs or workflow approval gates;
* replace ADR-001 or ADR-002.
