# Repository Analysis

## Story Understanding

Story 0014 asks for the next safe step after Stories 0010 and 0013:

* Story 0010 defined the feeding lifecycle:
  * source artifact
  * candidate note
  * curated note
* Story 0013 defined where the vault now participates in the
  `engineering-story` workflow and introduced the persisted `Vault Outcome`
  artifact contract.

The remaining problem is steady-state operation.

The Story is not asking how to bootstrap the vault from a broad workspace scan.

It is asking how completed engineering work should continuously and repeatably
produce reviewable vault candidates without flooding the vault or repeating the
same proposal every time a similar Story finishes.

Requested outcomes:

* define the steady-state trigger points for candidate generation;
* define which workflow artifacts are eligible continuous upstream sources;
* define when the system proposes:
  * a new candidate note;
  * an enrich-existing candidate;
  * no vault action;
* define how repeated executions avoid duplicate candidate churn;
* define how curation decisions are recorded and made visible;
* identify the minimum technical implementation for a first continuous feeding
  workflow.

Explicit non-goals:

* full-workspace bootstrap scanning;
* automatic publication into curated notes;
* replacing human curation;
* changing the authority model between DevLog, workflow artifacts, and the
  vault;
* introducing a large semantic memory runtime unless clearly justified.

---

## Repository Summary

`Engineering-Skills` already contains almost all foundational pieces needed for
continuous feeding, but they currently exist as separate layers rather than as
one repeatable workflow.

Current state:

* Story 0009 defined the vault as curated transverse memory and introduced the
  read-side contract.
* Story 0010 defined the `source -> candidate -> curated` lifecycle and added
  the deterministic `candidate-note.mjs` generator.
* Story 0011 introduced ponctual multi-repository extraction for bootstrap and
  discovery.
* Story 0012 hardened bootstrap extraction quality so broad scans are now more
  selective and more reviewable.
* Story 0013 integrated the vault into `engineering-story` as:
  * selective transverse-memory input during Repository Analysis;
  * persisted `Vault Outcome` reporting during Implementation, Review, and
    Engineering Report.

What the repository still does **not** contain:

* no continuous workflow step that turns a completed Story's `Vault Outcome`
  into a concrete proposal artifact;
* no deterministic mechanism that decides whether a similar outcome was already
  proposed recently;
* no repository-owned state model for recording continuous feeding decisions
  beyond the text written inside Story artifacts themselves;
* no small adapter that transforms approved workflow artifacts into
  `candidate-note.mjs` input.

The repository is therefore in a transitional state:

* bootstrap extraction exists for discovery;
* workflow-level vault awareness exists for steady-state reporting;
* but the operational bridge between those two surfaces is still missing.

---

## Vault Context Usage

Vault context was consulted for this Repository Analysis.

Materially consulted curated notes:

* `02 - Workflow/Engineering Workflow.md`
* `04 - Knowledge Engineering/Fluid Knowledge Feeding Pipeline.md`
* `03 - AI Engineering/AI Proposal and Knowledge Promotion Workflow.md`
* `04 - Knowledge Engineering/Transverse Memory Boundary.md`

How these notes informed the analysis:

* `Engineering Workflow` confirms that knowledge update belongs after Git
  commit and after human validation rather than during raw implementation;
* `Fluid Knowledge Feeding Pipeline` confirms that the candidate-note layer is
  the correct safe midpoint and that enrich-existing is a first-class outcome;
* `AI Proposal and Knowledge Promotion Workflow` reinforces that proposal
  storage and canonical knowledge storage must remain separate;
* `Transverse Memory Boundary` confirms that continuous feeding must preserve
  source authority and must not let the vault become a second project-memory
  surface.

These notes acted as transverse guidance only.

Repository code, ADRs, prompts, and Story artifacts remain authoritative for
repository-specific behavior.

---

## Affected Modules

### `engineering-story/SKILL.md`

Why involved:

* Story 0013 added reporting of `Vault Outcome`, but not the continuous
  post-Story action that should follow from it;
* Story 0014 is fundamentally about workflow trigger points, sequencing, and
  authority boundaries.

Current responsibility:

* defines workflow sequencing and Human Approval Gates;
* defines selective vault consultation during Repository Analysis;
* requires `Vault Outcome` reporting in the Implementation Report;
* does not yet define a steady-state candidate-generation step or a duplicate
  suppression rule.

### `engineering-story` prompts

Relevant surfaces:

* `prompts/implementation.md`
* `prompts/code-review.md`
* `prompts/engineering-report.md`

Why involved:

* these prompts already carry the `Vault Outcome` vocabulary;
* continuous feeding will likely depend on making that vocabulary more
  operational and less purely narrative.

Current responsibility:

* records and reviews vault-related outcome text;
* does not yet require machine-usable proposal payloads or repeatability data.

### `transverse-memory/scripts/candidate-note.mjs`

Why involved:

* this is the current deterministic proposal-only generator;
* any first continuous feeding implementation should reuse it rather than
  inventing a second candidate format.

Current responsibility:

* validates a narrow JSON contract;
* generates deterministic candidate markdown;
* preserves proposal-only boundaries;
* knows nothing about workflow artifacts, repeated proposals, or previous
  curation outcomes.

### `transverse-memory/scripts/workspace-vault-extract.mjs`

Why involved:

* it already demonstrates how to compare source-derived synthesis against the
  current vault and classify outcomes as:
  * `new`
  * `enrich-existing`
  * `duplicate`
  * `skip`
* it provides a useful anti-flooding and enrich-existing baseline.

Current responsibility:

* ponctual bootstrap/discovery scanning across repository families;
* heuristic comparison against the current vault;
* proposal generation for broad scans.

It is **not** the right direct vehicle for Story 0014 because:

* it is intentionally scan-oriented rather than workflow-oriented;
* it treats repeated scans as acceptable and heuristic;
* it has no Story-scoped memory of prior continuous proposals.

### `docs/references/obsidian-transverse-memory.md`

Why involved:

* this reference already defines:
  * the feeding lifecycle;
  * source eligibility;
  * anti-flooding rules;
  * proposal-only boundaries;
  * provenance requirements.

Current responsibility:

* architectural and operational guidance for transverse-memory feeding;
* no concrete continuous-trigger workflow yet.

### Story artifacts under `stories/*`

Why involved:

* Story 0013 introduced a `Vault Outcome` section in Implementation Reports;
* Engineering Reports summarize the final vault outcome.

Current responsibility:

* persisted workflow evidence;
* human-reviewed engineering history.

Current limitation:

* these artifacts carry the information needed for continuous feeding, but only
  as human-readable prose.

---

## Existing Implementation

### What already exists

1. The proposal boundary exists.

   The repository already has a safe candidate layer:

   * proposal-only candidate notes;
   * provenance requirements;
   * explicit `targetCuratedNote` support for enrich-existing behavior.

2. The workflow now reports vault outcomes.

   Story 0013 introduced explicit reporting of:

   * whether vault context was consulted;
   * whether a completed Story suggests:
     * no action;
     * new candidate;
     * enrich-existing;
     * deferred.

3. Bootstrap extraction already demonstrates vault-aware classification.

   `workspace-vault-extract.mjs` already contains a deterministic pattern for:

   * comparing source-derived synthesis against the vault;
   * identifying likely enrich-existing targets;
   * skipping weak or generic content.

4. Curated vault lookup already exists.

   `vault-catalog.mjs` already provides deterministic read access to curated
   notes and their metadata.

### What is missing

The behavior required by Story 0014 does not yet exist:

1. No continuous trigger exists.

   There is currently no workflow-defined point that says:

   * “after a Story reaches the appropriate completion state, evaluate whether
     a candidate proposal should be materialized.”

2. No deterministic Story-to-candidate adapter exists.

   The repository can generate a candidate from repository-owned JSON, but it
   cannot yet derive that JSON deterministically from approved Story artifacts.

3. No anti-duplication memory exists for continuous feeding.

   The current vault comparison helps detect overlap with curated notes, but it
   does not answer:

   * was this same candidate already proposed by a previous Story?
   * was it rejected?
   * was it deferred intentionally?
   * was it already merged into an existing curated note?

4. No explicit repository-owned place exists for candidate backlog state.

   The current system has:

   * curated notes in the vault;
   * story artifacts in the repository;
   * candidate generation logic;

   but no explicit backlog or registry for continuous proposals that remain
   proposal-only while still being deduplicable.

### Behavior that must remain unchanged

The following current behaviors must remain unchanged:

* DevLog remains authoritative for project-memory facts.
* Workflow artifacts remain authoritative for engineering-stage records.
* The vault remains curated transverse memory, not a raw proposal dump.
* Automation may generate or update proposal artifacts, but may not silently
  curate.
* Bootstrap extraction remains a separate discovery workflow and should not be
  collapsed into steady-state feeding.

---

## Architecture

Relevant architectural rules:

* ADR-001: engineering artifacts are persisted workflow records.
* ADR-002: the vault is curated cross-project transverse memory, distinct from
  project memory and workflow artifacts.
* ADR-003: transverse feeding follows `source artifact -> candidate note ->
  curated note`, with proposal-only automation.

Constraints that matter for Story 0014:

* the workflow must remain deterministic and human-governed;
* continuous feeding must stay lighter than bootstrap and less noisy than broad
  extraction;
* proposal and curated states must remain separate;
* provenance to authoritative upstream artifacts must be preserved;
* repeated Stories must not generate uncontrolled candidate churn;
* the first implementation should reuse existing deterministic repository
  assets wherever possible.

Architectural tension to resolve:

* if continuous feeding remains purely textual inside reports, it is too weak
  to be repeatable;
* if it writes directly into curated notes, it breaks the curation boundary;
* therefore the missing safe middle layer is a repository-owned proposal/backlog
  representation tied to completed Story outcomes.

---

## Dependencies

Relevant dependencies for this Story:

* `engineering-story` workflow contract and prompts;
* `candidate-note.mjs` proposal generator;
* `vault-catalog.mjs` curated-note lookup;
* `workspace-vault-extract.mjs` classification heuristics;
* `docs/references/obsidian-transverse-memory.md`;
* ADR-002 and ADR-003;
* the local curated Engineering Vault.

DevLog context request was attempted but unavailable:

* `DEVLOG_CONTEXT_ERROR: DevLog returned HTTP 404. Repository Analysis continues without DevLog.`

This is non-blocking and does not prevent planning.

---

## Tests

Existing automated coverage relevant to this Story:

* `node --test transverse-memory/scripts/candidate-note.test.mjs`
* `node --test transverse-memory/scripts/vault-catalog.test.mjs`
* `node --test transverse-memory/scripts/workspace-vault-extract.test.mjs`

Behavior already covered:

* proposal-only candidate generation;
* curated vault catalog validation;
* bootstrap classification across `new`, `enrich-existing`, `duplicate`, and
  `skip`.

Important missing coverage for Story 0014:

* deriving a continuous candidate payload from Story workflow artifacts;
* preventing duplicate continuous proposals across repeated Story outcomes;
* recording and reusing prior curation/proposal state deterministically;
* verifying that continuous feeding remains proposal-only while still being
  operational.

Detailed test planning belongs to the Implementation Plan stage.

---

## Risks

### Duplicate churn

If continuous feeding only compares against curated notes, then repeated
Stories may repeatedly propose the same candidate before a human curates it.

### Hidden proposal state

If proposal status remains buried only in prose inside Story artifacts, future
automation will have no reliable way to know whether the same concept was
already proposed, deferred, or intentionally ignored.

### Workflow bloat

If continuous feeding introduces too much ceremony or too many required manual
fields, it may make normal Story execution heavier than justified.

### Overcoupling to narrative wording

If the implementation parses loose prose rather than adding a narrow
deterministic contract, the workflow may become brittle whenever report wording
evolves.

### Boundary drift

If the continuous path is implemented by writing directly into the curated
vault, the system would break the curation model established in Stories 0010
and 0013.

---

## Missing Information

No blocking information gap prevents implementation planning.

The repository state is sufficiently clear to plan a first implementation.

The main design choice for planning is not whether continuous feeding is
needed, but where the proposal/backlog state should live so that it remains:

* deterministic;
* repository-owned;
* deduplicable;
* proposal-only;
* lightweight enough for normal Story completion.
