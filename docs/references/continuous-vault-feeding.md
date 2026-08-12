# Continuous Vault Feeding

Use this reference when evolving the Obsidian transverse-memory vault from
completed Engineering Stories in steady-state workflow execution.

## Purpose

This workflow is for continuous, Story-scoped proposal generation.

It is appropriate when:

* a Story has completed implementation work;
* the Story produced an explicit vault outcome;
* that outcome should become a reviewable proposal artifact;
* broad workspace bootstrap scanning is unnecessary.

It is not a curated-vault publication workflow.

It is not a replacement for ponctual bootstrap extraction.

## Trigger Point

The first continuous feeding trigger occurs during Documentation
Reconciliation, before Code Review.

This keeps the generated proposal artifact:

* inside the implementation diff;
* reviewable together with the Story change;
* included in the human Git commit when accepted.

## Story Artifact

When the Story outcome suggests `new-candidate` or `enrich-existing`, create:

* `stories/<story>/vault-outcome.json`

This file is the authoritative machine-readable input for proposal generation.

The Implementation Report remains the human-readable explanation.

## Proposal Backlog

Repository-owned continuous proposals live under:

* `transverse-memory/proposals/`

These files are:

* explicit proposals;
* non-curated;
* reviewable in Git;
* separate from the curated Obsidian vault.

The proposal backlog is the steady-state memory of what has already been
proposed, updated, or replayed.

## Duplicate Suppression

The first implementation should suppress duplicate churn deterministically.

Recommended rules:

* `targetCuratedNote` is the primary stable key when present;
* otherwise use a normalized candidate-title key;
* if a proposal with that key already exists, update it instead of creating a
  second proposal file;
* if the existing proposal already contains the same Story provenance, treat
  the replay as a no-op;
* if the curated vault already clearly contains the same canonical topic, skip
  duplicate proposal creation.

## Boundaries

Continuous feeding may:

* read Story artifacts;
* read repository-owned proposal artifacts;
* read the curated vault;
* generate or update proposal artifacts.

Continuous feeding must not:

* modify curated vault notes directly;
* act as a workflow gate;
* replace human curation;
* depend on broad repository rescans.

## Validation

Run:

```text
node --test transverse-memory/scripts/story-vault-feed.test.mjs
```

Manual validation should also confirm that:

* `vault-outcome.json` is small, deterministic, and Story-scoped;
* generated proposals live only in `transverse-memory/proposals/`;
* replaying the same Story outcome does not create duplicate proposal files;
* proposal artifacts remain explicitly non-curated.
