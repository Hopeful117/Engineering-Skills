# Engineering Report

## Story

Story 0012 — Harden Workspace Vault Extraction Quality.

The requested change was to improve the quality of the punctual workspace-to-
vault extraction process before using it as a real bootstrap mechanism for the
Obsidian transverse-memory vault.

## Objective

The objective was to make extraction more selective, more representative of the
real workspace, and more trustworthy for human review without changing the
established architecture.

More precisely, the Story aimed to:

* support the repository layouts actually present in the workspace;
* reduce noise from generic Story-level artifacts;
* improve the distinction between `new`, `enrich-existing`, `duplicate`, and
  `skip`;
* preserve proposal-only behavior and provenance;
* validate the hardened extractor on both synthetic fixtures and the real
  workspace bootstrap scenario.

## Repository Analysis Summary

The repository analysis established that Story 0011 had already delivered the
right architectural boundary for punctual extraction, but the first real
bootstrap run showed that extraction quality was not yet good enough.

The key findings were:

* source discovery only supported `stories/*`, so `devlog-ai` was silently
  missed because it stores Story artifacts under `docs/stories/*`;
* architecture-document discovery was too convention-bound;
* vault comparison relied too heavily on titles;
* generic review/report artifacts were too easily promoted;
* validation covered extractor shape, but not realistic multi-repository
  quality behavior.

These findings justified a hardening pass rather than a redesign.

## Implementation Plan Summary

The approved implementation strategy was:

* expand eligible source discovery to support the repository layouts actually
  used in the workspace;
* add stronger filtering for low-value and generic Story artifacts;
* improve vault-aware comparison while keeping it deterministic and
  understandable;
* preserve the candidate-note contract and proposal-only output semantics;
* update the punctual extraction reference;
* expand tests with representative fixtures;
* re-run the real workspace bootstrap after implementation.

## Implementation Summary

The implementation delivered the planned quality hardening:

* `workspace-vault-extract.mjs` now supports both:
  * `stories/*/...`
  * `docs/stories/*/...`
* architecture-document discovery now supports both:
  * `docs/adr/*.md`
  * `docs/decisions/*.md`
* the extractor now skips two additional classes of weak candidates:
  * `generic-story-artifact`
  * `weak-transverse-signal`
* vault-aware comparison now combines exact title match, title-token overlap,
  and bounded summary-token overlap;
* the operator runbook now documents the hardened source layouts, skip logic,
  and validation expectations;
* the automated test suite now covers:
  * multi-layout support;
  * `new`, `enrich-existing`, and `duplicate`;
  * low-value skipping;
  * generic Story-artifact skipping;
  * weak transverse-signal skipping.

One important practical result emerged during validation:

* once `devlog-ai` layout support was added, layout coverage alone still
  produced too much noise;
* a second explicit “transverse worthiness” filter was necessary to keep the
  bootstrap reviewable.

That refinement remained consistent with the approved plan and with the
architectural boundary of the extractor.

## Modified Files

- `transverse-memory/scripts/workspace-vault-extract.mjs`
  Hardened source discovery, filtering heuristics, and vault-aware
  classification.

- `transverse-memory/scripts/workspace-vault-extract.test.mjs`
  Expanded with representative quality and layout coverage.

- `docs/references/workspace-vault-extraction.md`
  Updated runbook for the hardened extractor behavior.

## Created Files

- `stories/0012-harden-workspace-vault-extraction-quality/repository-analysis.md`
- `stories/0012-harden-workspace-vault-extraction-quality/implementation-plan.md`
- `stories/0012-harden-workspace-vault-extraction-quality/implementation-report.md`
- `stories/0012-harden-workspace-vault-extraction-quality/code-review.md`
- `stories/0012-harden-workspace-vault-extraction-quality/engineering-report.md`

These are the Story workflow artifacts produced through the Engineering Story
process.

## Architecture Impact

This Story does not change the memory-layer architecture.

It strengthens the quality of one existing boundary:

* punctual extraction remains discovery-oriented;
* candidate generation remains proposal-only;
* the vault remains curated and human-owned;
* repository artifacts remain authoritative sources.

The Story improves extractor precision without introducing a new memory service,
background ingestion system, or automatic curation path.

## Validation

Recorded validation from implementation and review:

* DevLog lifecycle `start` synchronization succeeded with base commit
  `0318682508005791ba2ec9a6babb7478d6714624`.
* `node --test transverse-memory/scripts/workspace-vault-extract.test.mjs`
  passed with `5/5` tests.
* `git diff --check` passed.
* the real bootstrap rerun against:
  * `/home/ludo/Bureau/workspace/Engineering-Skills`
  * `/home/ludo/Bureau/workspace/devlog-ai`
  * `/home/ludo/Bureau/workspace/dev-tools/obsidian/Engineering Vault`
  produced:
  * `vaultNotesConsidered = 7`
  * `extractedCount = 58`
  * `skippedCount = 85`
  * extracted by repository:
    * `Engineering-Skills = 8`
    * `devlog-ai = 50`
  * extracted by source type:
    * `adr = 53`
    * `code-review = 1`
    * `engineering-report = 4`
  * skipped by reason:
    * `generic-story-artifact = 40`
    * `weak-transverse-signal = 45`

Validation strategy applied to this Story:

* applicable and passed:
  * multi-layout extraction support;
  * deterministic classification behavior;
  * low-value and generic artifact filtering;
  * weak transverse-signal filtering;
  * real-workspace bootstrap rerun;
  * diff cleanliness checks;
  * DevLog lifecycle synchronization.
* applicable and failed:
  * none.
* blocked or unavailable:
  * none.
* not applicable:
  * automatic curated-note publication;
  * continuous background ingestion;
  * product-stack quality gates such as SonarQube, JaCoCo, or frontend build
    pipelines.

## Review Outcome

Code Review technical recommendation: Ready for human approval.

Important findings: none.

Residual risks:

* the current vault is still small and principle-heavy, so many ADRs are
  reasonably classified as `new`;
* Story-artifact filtering is now intentionally conservative and may later be
  tuned using real curation feedback.

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

Human commit detected:

* `targetCommit = c408665f1823a6bb1058b1bda97b5fd91b0f0b6d`

DevLog lifecycle `complete` is now eligible.
