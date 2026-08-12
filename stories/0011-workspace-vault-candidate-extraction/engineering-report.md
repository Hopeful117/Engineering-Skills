# Engineering Report

## Story

Story 0011 — Extract Vault Candidates from Workspace Projects.

The requested change was to define and implement a ponctual capability that can
scan selected workspace repositories, compare extracted material against the
current Obsidian Engineering Vault, and surface useful transverse-memory
candidates without turning the vault into a second project database.

## Objective

The objective was to bootstrap vault population selectively and safely, while
preserving the previously established memory boundaries and candidate-note
proposal semantics.

More precisely, the Story aimed to:

* define a ponctual multi-repository extraction workflow;
* define eligible source classes for bootstrap extraction;
* define candidate-aligned batch output with provenance;
* make the extraction vault-aware so obvious duplicates can be downgraded;
* keep the solution operator-controlled and proposal-only;
* avoid prematurely introducing a permanent reusable skill.

## Repository Analysis Summary

The repository analysis established that:

* Story 0009 had already created the curated-vault boundary and read-side
  contract;
* Story 0010 had already created the steady-state
  `source -> candidate -> curated` lifecycle;
* the actual Engineering Vault already contained curated foundational notes on
  philosophy, quality, workflow, AI engineering, and knowledge evolution;
* no ponctual cross-repository bootstrap extraction capability existed yet.

The key pre-implementation findings were:

* extraction should avoid restating standards already present in the vault;
* batch output should align with candidate-note semantics from Story 0010;
* a script and runbook were likely more appropriate than a reusable skill for a
  first bootstrap capability;
* the real vault state needed to be treated as practical context rather than an
  abstract future target.

## Implementation Plan Summary

The approved implementation strategy was:

* define a punctual, operator-controlled extraction boundary;
* define selective repository and artifact eligibility rules;
* define candidate-aligned batch output with duplicate/enrichment hints;
* add a runbook for manual execution and review;
* implement a minimal dependency-free extraction script;
* use the current vault contents explicitly during classification;
* avoid automatic publication and avoid mandatory skill creation.

## Implementation Summary

The implementation delivered the planned bootstrap extraction foundation:

* added a new ADR defining ponctual extraction, vault-aware comparison, and the
  decision to keep the first solution script/runbook-oriented;
* extended the main transverse-memory reference with ponctual extraction
  guidance and proposal-only expectations;
* added a dedicated runbook for operator-controlled extraction;
* added a dependency-free extraction script that scans selected artifact
  classes from chosen repositories, compares them against current vault notes,
  and emits structured proposal batches with `new`, `enrich-existing`,
  `duplicate`, or `skip` classification;
* slightly generalized the candidate-note generator so extraction scripts can
  reuse the candidate-note contract programmatically;
* added automated tests for batch extraction behavior and real-vault practical
  validation.

One practical adaptation was introduced during implementation:

* the real vault currently contains curated notes without uniform YAML
  frontmatter, so the extraction script now includes a safe fallback mode for
  reading vault note titles heuristically when strict catalog parsing is not
  possible.

This adaptation improves practical robustness without changing the curated-note
contract established in Story 0009.

## Modified Files

- `docs/references/obsidian-transverse-memory.md`
  Extended with ponctual extraction guidance, vault-aware comparison
  expectations, and proposal-only extraction behavior.

- `transverse-memory/scripts/candidate-note.mjs`
  Generalized so validated candidate payloads can be converted into
  proposal-only output without requiring file-based JSON as the only entry
  point.

## Created Files

- `docs/adr/ADR-004-punctual-workspace-extraction.md`
  New architectural decision for ponctual multi-repository extraction and
  vault-aware comparison.

- `docs/references/workspace-vault-extraction.md`
  New operator runbook for manual extraction execution and interpretation.

- `transverse-memory/scripts/workspace-vault-extract.mjs`
  New batch extraction script for selected repositories and artifact classes.

- `transverse-memory/scripts/workspace-vault-extract.test.mjs`
  New automated tests for the extraction script.

- `stories/0011-workspace-vault-candidate-extraction/repository-analysis.md`
- `stories/0011-workspace-vault-candidate-extraction/implementation-plan.md`
- `stories/0011-workspace-vault-candidate-extraction/implementation-report.md`
- `stories/0011-workspace-vault-candidate-extraction/code-review.md`
  Story workflow artifacts produced through the Engineering Story process.

## Architecture Impact

The Story adds a new bootstrap/discovery layer on top of the existing
transverse-memory architecture.

Architectural effects:

* new bootstrap boundary: ponctual workspace extraction;
* new operator-facing runbook and extraction script;
* preserved boundaries:
  * ADR-002 remains authoritative for curated-vault ownership;
  * ADR-003 remains authoritative for proposal-only candidate semantics;
  * Story 0010 remains authoritative for steady-state feeding;
  * extraction remains proposal-only and non-mutating toward curated notes;
  * no mandatory reusable skill was introduced.

This is a practical extraction-layer addition, not a new permanent orchestration
platform.

## Validation

Recorded validation from the Implementation Report and Code Review:

* DevLog lifecycle `start` synchronization succeeded with base commit
  `decc725e4d08dc9a8a0f413a1c9c4721bc067367`.
* `node --test transverse-memory/scripts/workspace-vault-extract.test.mjs`
  passed with 3 tests.
* practical validation against the real Engineering Vault and the
  Engineering-Skills repository succeeded:
  * the script returned `mode: "proposal-only"`;
  * it considered 7 current vault notes;
  * it emitted candidate batches from selected artifact classes;
  * it did not modify curated vault notes.
* repository content checks confirmed the expected ponctual extraction,
  operator-control, proposal-only, and duplicate/enrichment language.
* local-value leak checks passed with no machine-specific secrets or mappings
  introduced.
* `git diff --check` passed.

Validation strategy applied to this Story:

* applicable and passed:
  * ponctual extraction contract consistency checks;
  * extraction script automated tests;
  * practical real-vault validation;
  * diff cleanliness checks;
  * local-value leak checks;
  * DevLog lifecycle start synchronization.
* applicable and failed:
  * none.
* blocked or unavailable:
  * richer semantic duplicate detection was intentionally out of scope for this
    bootstrap Story.
* not applicable:
  * automatic curated-note publication;
  * continuous background ingestion;
  * mandatory reusable skill execution;
  * product-stack quality gates such as SonarQube, JaCoCo, or frontend build
    pipelines.

No pre-existing unrelated repository failure was represented as a Story
failure.

## Review Outcome

Code Review technical recommendation: Ready for human approval.

Important findings: none. The Code Review reported no findings.

Residual risks:

* duplicate/enrichment detection remains deliberately lightweight and
  title-oriented;
* future vault growth may justify richer semantic comparison later.

Required corrections: none.

Final human approval state:

* Repository Analysis: Human approved
* Implementation Plan: Human approved
* Code Review: Human approved

## Workflow Approvals

* Repository Analysis: Human approved
* Implementation Plan: Human approved
* Code Review: Human approved

## Final Status

Engineering Story workflow completed.

Repository finalization and DevLog lifecycle `complete` remain pending until
the human commit exists.
