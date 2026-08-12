# ADR-004 — Punctual Workspace Extraction

- **Status:** Accepted
- **Date:** 2026-08-12
- **Decision scope:** Engineering Skills bootstrap transverse-memory extraction

## Context

Story 0009 established the curated vault boundary.
Story 0010 established the steady-state feeding lifecycle and candidate-note
proposal semantics.

However, the workspace already contains useful engineering knowledge across
repositories, ADRs, Engineering Reports, and other artifact collections.

The missing capability is a bootstrap/discovery mechanism that can inspect
selected repositories, compare findings against the current vault, and surface
proposal-only candidates without becoming a permanent ingestion system.

## Decision

Workspace extraction is a punctual, operator-controlled workflow.

It is not a background service, not a workflow gate, and not automatic
publication.

The extraction lifecycle is:

```text
selected repositories
  ->
eligible source artifacts
  ->
candidate-aligned extraction batch
  ->
human review and later curation
```

## Ownership Rules

### Rule 1: Extraction is discovery, not curation

The output of a ponctual scan is proposal-only.

It may suggest:

* likely new candidate;
* likely enrichment of an existing curated note;
* likely duplicate to skip.

It may not publish or rewrite curated notes.

### Rule 2: The current vault is part of scan context

The existing vault must be inspected before suggesting additions.

This allows the extraction workflow to:

* avoid obvious duplication;
* identify likely enrichments;
* preserve continuity with already curated topics.

### Rule 3: Selectivity matters more than volume

A successful ponctual extraction run is not measured by the number of produced
candidates.

It is measured by:

* provenance quality;
* transverse usefulness;
* duplication resistance;
* reviewability.

### Rule 4: Reusable skill creation is optional

The first bootstrap extraction capability should prefer a script and runbook.

A reusable skill is justified only if repeated use proves that the punctual
approach is insufficient.

## Eligible Sources

Likely eligible sources include:

* Engineering Reports;
* Code Review Reports with reusable lessons;
* ADRs;
* stable project documentation;
* curated project notes explicitly chosen for a run.

By default, the following are not sufficient:

* every markdown file indiscriminately;
* transient implementation notes;
* local operational memory;
* files already acting as vault notes.

## Output Model

A ponctual extraction run should emit structured candidate-aligned output with:

* repository root;
* source file;
* source type;
* proposed candidate title;
* provenance;
* transverse rationale;
* classification:
  * `new`
  * `enrich-existing`
  * `duplicate`
  * `skip`
* optional target curated note reference.

## Consequences

### Positive

* the workspace gains a practical bootstrap extraction mechanism;
* vault-aware comparison reduces obvious duplicates;
* output remains aligned with Story 0010 candidate-note semantics;
* the solution stays lightweight and operator-controlled.

### Negative

* classification remains heuristic rather than semantically perfect;
* repeated manual use may later justify richer tooling;
* candidate review remains a human responsibility.

## Scope Boundaries

This ADR does not:

* replace Story 0010 steady-state feeding;
* authorize automatic curated-note publication;
* require a reusable skill;
* introduce remote services or databases;
* define a general recommendation engine.
