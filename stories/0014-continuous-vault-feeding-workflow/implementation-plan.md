# Implementation Plan

## Overview

Implement Story 0014 by introducing the first continuous vault-feeding
workflow inside `Engineering-Skills`.

The implementation should connect the existing workflow-level `Vault Outcome`
reporting from Story 0013 with the proposal-only candidate generation contract
from Story 0010.

The result should be:

* deterministic;
* repository-owned;
* lightweight enough for normal Story execution;
* reviewable before human commit;
* explicitly separate from curated vault mutation.

The safest first implementation is not a broad new memory subsystem.

It is a narrow workflow extension plus a small deterministic proposal adapter.

## Planned Changes

### 1. Introduce a structured `vault-outcome` artifact for Stories

Add a small machine-readable artifact in each Story directory so continuous
feeding does not depend on parsing loose prose from the Implementation Report.

The artifact should capture at minimum:

* whether vault context was consulted;
* outcome:
  * `none`
  * `new-candidate`
  * `enrich-existing`
  * `deferred`
* candidate title when applicable;
* target curated note when applicable;
* source artifact provenance;
* transverse rationale;
* concise proposed synthesis;
* curation notes.

This should become the deterministic bridge between workflow artifacts and the
candidate-note generator.

The human-readable `Vault Outcome` section in the Implementation Report should
remain, but the structured artifact should become the authoritative proposal
input for continuous feeding.

### 2. Define the continuous trigger point inside the workflow

Integrate continuous feeding into `engineering-story` at the point where the
implementation is complete enough to generate reviewable proposal artifacts.

The recommended trigger point is during Documentation Reconciliation, before
Code Review.

Why this trigger point is preferable:

* the Story outcome is already known;
* the proposal can be reviewed together with the implementation;
* the candidate artifact can be included in the human commit;
* Engineering Report can summarize the actual generated proposal outcome rather
  than only an intention.

The workflow should remain selective:

* `none` produces no proposal artifact;
* `deferred` produces no proposal artifact but remains recorded;
* `new-candidate` and `enrich-existing` may produce or update a proposal
  artifact.

### 3. Add a repository-owned proposal backlog outside the curated vault

Introduce a committed repository-owned location for continuous candidate
proposals, separate from the Obsidian curated vault.

Recommended direction:

* `transverse-memory/proposals/`

This proposal backlog should be:

* deterministic;
* reviewable in Git;
* explicitly non-curated;
* suitable for duplicate suppression across Stories.

This location becomes the missing steady-state proposal memory identified by
the Repository Analysis.

It preserves the boundary:

* vault = curated canonical transverse memory;
* repository proposal backlog = machine-assisted or workflow-assisted candidate
  backlog.

### 4. Add a deterministic Story-to-candidate adapter

Create a small script that:

* reads the structured Story `vault-outcome` artifact;
* validates that the Story outcome is eligible for proposal generation;
* derives the `candidate-note.mjs` payload;
* invokes `generateCandidateNote(...)`;
* writes or updates a proposal artifact in the repository-owned proposal
  backlog.

Recommended shape:

* `transverse-memory/scripts/story-vault-feed.mjs`

This script should reuse:

* `candidate-note.mjs` for deterministic candidate markdown generation;
* `vault-catalog.mjs` for curated-note lookup when needed.

The script must remain proposal-only and must never write into the curated
vault.

### 5. Add duplicate-suppression rules for steady-state feeding

Continuous feeding needs stronger repeatability than ponctual bootstrap.

The first implementation should use a small deterministic duplicate-suppression
model based on current repository-owned proposal artifacts plus curated vault
state.

Recommended first rule set:

* when `targetCuratedNote` is present, use it as the primary stable proposal
  key;
* otherwise use a normalized candidate title key;
* when a proposal with the same key already exists, update or append
  provenance/curation notes instead of creating a second proposal file;
* when the existing proposal already references the same Story provenance,
  treat the operation as a no-op;
* when the curated vault already clearly contains the same canonical note,
  avoid creating a duplicate proposal.

This should be explicit and deterministic rather than heuristic prose
interpretation.

### 6. Keep bootstrap extraction separate from continuous feeding

Do not fold `workspace-vault-extract.mjs` into the continuous workflow.

Instead:

* reuse its vocabulary and classification ideas where helpful;
* keep its role limited to discovery/bootstrap scans;
* keep the continuous workflow Story-scoped and lighter-weight.

This preserves the architectural distinction:

* bootstrap = broad discovery;
* continuous feeding = steady-state evolution from one completed Story.

### 7. Extend workflow prompts and contract to carry the structured outcome

Update `engineering-story/SKILL.md` and the relevant prompts so the continuous
feeding artifact is explicitly part of the Story workflow.

Expected prompt/contract changes:

* Implementation must produce both:
  * the human-readable `Vault Outcome` section;
  * the structured `vault-outcome` artifact when applicable;
* Code Review must verify:
  * the structured artifact matches the Implementation Report;
  * proposal generation is justified;
  * duplicate suppression behaved correctly;
  * proposal-only boundaries remain intact;
* Engineering Report must summarize:
  * whether a proposal artifact was created, updated, skipped, or deferred;
  * where that proposal now lives in the repository backlog.

### 8. Add minimal reference documentation for the continuous workflow

Add or extend a small repository-owned reference describing:

* the difference between bootstrap extraction and continuous feeding;
* where continuous proposal artifacts live;
* how the Story `vault-outcome` artifact is interpreted;
* how duplicate suppression works in the first implementation;
* why proposals remain outside the curated vault until human curation.

This documentation should stay practical and operational.

### 9. Validate the workflow as one end-to-end proposal path

Validation should confirm not only isolated script behavior, but the continuous
workflow contract from Story outcome to repository-owned proposal artifact.

Expected validation scope:

* structured `vault-outcome` validation;
* candidate generation from Story outcome;
* duplicate suppression across repeated inputs;
* no-op behavior when the same Story outcome is replayed;
* preservation of proposal-only behavior;
* `git diff --check`.

## Files to Modify

Expected primary modifications:

* `engineering-story/SKILL.md`
* `engineering-story/prompts/implementation.md`
* `engineering-story/prompts/code-review.md`
* `engineering-story/prompts/engineering-report.md`
* `docs/references/obsidian-transverse-memory.md`

Expected new documentation and backlog surfaces:

* `docs/references/continuous-vault-feeding.md`
* `transverse-memory/proposals/` (directory introduction)

Expected new or modified scripts:

* `transverse-memory/scripts/story-vault-feed.mjs`
* tests for the new script

Story-local expected artifacts:

* `stories/0014-continuous-vault-feeding-workflow/vault-outcome.json`
  or equivalent structured artifact name chosen during implementation.

## Files Not Expected to Change

The following should remain unchanged unless implementation reveals a concrete
gap:

* DevLog lifecycle scripts
* workflow-gate plugin
* curated vault note templates
* workspace bootstrap extractor behavior
* candidate-note markdown contract fundamentals

## Sequencing

1. Define the structured Story `vault-outcome` contract.
2. Update the workflow contract in `engineering-story/SKILL.md`.
3. Update Implementation prompt expectations to produce the structured
   artifact.
4. Update Code Review prompt expectations to review that artifact and the
   continuous proposal outcome.
5. Update Engineering Report prompt expectations to summarize the actual
   continuous-feeding result.
6. Introduce the repository-owned proposal backlog location.
7. Implement `story-vault-feed.mjs` using `candidate-note.mjs` and current
   vault/proposal state.
8. Add or update reference documentation for continuous feeding.
9. Add automated tests for new generation and duplicate-suppression behavior.
10. Run validation and summarize the actual workflow result in the
    Implementation Report.

## Validation

Automated and repository validation should include at minimum:

* `node --test transverse-memory/scripts/candidate-note.test.mjs`
* new tests for `story-vault-feed.mjs`
* `git diff --check`

The new tests should demonstrate:

* `new-candidate` creates a repository-owned proposal artifact;
* `enrich-existing` creates or updates a proposal keyed to the target curated
  note;
* `none` and `deferred` do not create proposal artifacts;
* replaying the same Story outcome does not create duplicate proposal files;
* proposal artifacts remain explicitly non-curated.

Manual validation should also confirm:

* prompts and `SKILL.md` express the same trigger point and authority model;
* the generated proposal backlog remains outside the curated vault;
* proposal provenance points back to the Story artifacts that justified it;
* duplicate suppression is deterministic and understandable.

## Risks and Controls

### Risk: Hidden state grows outside review

Control:

* keep proposal backlog state in committed repository artifacts rather than in a
  hidden cache or opaque database.

### Risk: Proposal churn remains noisy

Control:

* use deterministic proposal keys and update existing proposals instead of
  creating a new file for every similar Story.

### Risk: Workflow becomes too heavy

Control:

* keep the structured `vault-outcome` contract intentionally small and scoped
  to the four allowed outcomes.

### Risk: Boundary drift toward automatic curation

Control:

* keep all generated files in the repository-owned proposal backlog, never in
  the curated vault.

### Risk: Brittle prose parsing

Control:

* use a dedicated structured artifact instead of inferring state from narrative
  report text.

## Completion Criteria

The Story is complete when:

* the workflow defines a steady-state trigger point for continuous candidate
  generation;
* the workflow defines a structured Story-level vault outcome contract;
* a repository-owned proposal backlog exists outside the curated vault;
* a deterministic script can turn an eligible Story outcome into a proposal
  artifact;
* repeated executions avoid duplicate proposal churn;
* proposal-only behavior remains intact;
* workflow artifacts and reference documentation describe the same model;
* repository validation succeeds.
