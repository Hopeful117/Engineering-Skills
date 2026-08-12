# Implementation Report

## Summary

Implemented the Story 0012 hardening pass on the punctual workspace-to-vault
extractor so it now:

* supports both `stories/*` and `docs/stories/*` repository layouts;
* supports both `docs/adr/*` and `docs/decisions/*` architecture-document
  roots;
* skips generic Story-level review artifacts;
* skips Story artifacts that do not show enough explicit transverse signal;
* uses a stronger vault-aware comparison based on title and limited content
  tokens;
* preserves proposal-only output and provenance.

## Implemented Changes

### 1. Source discovery now supports real repository layouts

`transverse-memory/scripts/workspace-vault-extract.mjs` now discovers eligible
Story artifacts under:

* `stories/*/engineering-report.md`
* `stories/*/code-review.md`
* `docs/stories/*/engineering-report.md`
* `docs/stories/*/code-review.md`

It also supports architecture-document discovery under:

* `docs/adr/*.md`
* `docs/decisions/*.md`

This closes the concrete coverage gap that previously excluded `devlog-ai`
from the bootstrap run.

### 2. Generic Story artifacts are filtered explicitly

The extractor now identifies and skips Story-level review/report artifacts that
are mostly workflow boilerplate instead of durable transverse knowledge.

Implemented skip rule:

* `generic-story-artifact`

This primarily targets broad “Code Review Report” style outputs and “no
findings” review summaries that do not justify a vault candidate.

### 3. Weak transverse signals are filtered explicitly

The extractor now requires non-ADR Story artifacts to show stronger transverse
signal before generating a candidate.

Implemented skip rule:

* `weak-transverse-signal`

This prevents feature-level implementation summaries from being promoted just
because they are long enough.

### 4. Vault comparison is more informative

The previous comparison used only title matching plus title token overlap.

The hardened version keeps exact title matching, then adds:

* normalized title-token comparison;
* limited summary-token comparison;
* threshold-based distinction between `duplicate` and `enrich-existing`.

This remains deterministic and reviewable.

### 5. Reference documentation now matches the hardened behavior

`docs/references/workspace-vault-extraction.md` now documents:

* supported layout variants;
* supported architecture-document roots;
* stronger skip semantics;
* heuristic but deterministic vault-aware comparison expectations;
* manual validation expectations around coverage and signal filtering.

## Files Modified

* `transverse-memory/scripts/workspace-vault-extract.mjs`
* `transverse-memory/scripts/workspace-vault-extract.test.mjs`
* `docs/references/workspace-vault-extraction.md`

## Validation

### Automated

Command:

```text
node --test transverse-memory/scripts/workspace-vault-extract.test.mjs
```

Result:

* `5/5` tests passed.

Covered behaviors:

* multi-layout support (`stories/*` and `docs/stories/*`);
* `duplicate`, `enrich-existing`, and `new` classification paths;
* low-value skipping;
* generic Story-artifact skipping;
* weak transverse-signal skipping;
* CLI failure on invalid repository root.

### Repository hygiene

Command:

```text
git diff --check
```

Result:

* passed.

### Real bootstrap rerun

Command:

```text
node transverse-memory/scripts/workspace-vault-extract.mjs \
  --vault-root "/home/ludo/Bureau/workspace/dev-tools/obsidian/Engineering Vault" \
  --repo-roots /home/ludo/Bureau/workspace/Engineering-Skills,/home/ludo/Bureau/workspace/devlog-ai
```

Observed result after hardening:

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

Interpretation:

* the extractor now covers both repositories instead of silently missing
  `devlog-ai`;
* Story-level noise is actively filtered instead of being promoted blindly;
* the resulting bootstrap is much more architecture- and governance-focused;
* the current curated vault still leaves many ADR topics classified as `new`,
  which is expected given the small existing taxonomy.

## Documentation Reconciliation

Only the punctual extraction runbook required update.

No ADR, template, or broader memory-boundary document needed to change because
Story 0012 refines extraction quality rather than changing architectural
ownership.

## Deviations

No architectural deviation from the approved plan.

One practical refinement emerged during implementation:

* improving layout support alone was insufficient;
* a second filtering layer based on explicit transverse signal was required to
  keep the bootstrap reviewable on the real workspace.

This remains consistent with the approved Repository Analysis and
Implementation Plan.
