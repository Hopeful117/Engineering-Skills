# Implementation Plan

## Overview

Implement Story 0012 by hardening the existing punctual extraction workflow so
it becomes a credible bootstrap tool for the Obsidian transverse-memory vault.

The plan should improve extraction quality without changing the fundamental
architecture already established in Stories 0009, 0010, and 0011:

* the vault remains curated transverse memory;
* extraction remains punctual and manually triggered;
* candidate generation remains proposal-only;
* provenance remains explicit;
* the implementation remains deterministic and understandable.

This Story is therefore a refinement of the existing extractor, not a new
memory platform.

## Planned Changes

### 1. Expand eligible source discovery to support real repository layouts

Harden the extractor so it can discover the currently relevant Story artifact
layouts across repositories.

At minimum, support:

* `stories/*/engineering-report.md`
* `stories/*/code-review.md`
* `docs/stories/*/engineering-report.md`
* `docs/stories/*/code-review.md`

Retain selective ADR-style discovery and reassess whether a second explicit
architecture-document root should be supported now or deferred unless concrete
tests justify it.

Rationale:

* the real bootstrap run proved that `Engineering-Skills` is scanned while
  `devlog-ai` is currently missed purely because of directory layout.

### 2. Introduce stronger low-value filtering for generic Story artifacts

Refine extraction heuristics so long but generic artifacts are not promoted
automatically just because they exceed a minimum content length.

The extractor should explicitly detect and skip cases such as:

* generic “Code Review Report” style outputs with little durable transverse
  value;
* broad “no findings” reviews that contain mostly workflow boilerplate;
* implementation summaries that restate Story execution without surfacing a
  reusable concept, pattern, lesson, or decision.

The filtering should remain deterministic and explainable.

Rationale:

* the current `summary.length < 80` rule is too weak for real bootstrap use.

### 3. Improve vault-aware comparison beyond title-only matching

Preserve exact title matching, but add limited body-aware comparison signals so
classification is less dependent on phrasing differences.

The comparison should remain modest and deterministic, for example by combining:

* normalized candidate title tokens;
* normalized vault title tokens;
* normalized topic tokens derived from the extracted summary;
* threshold-based classification rules that remain readable in code and tests.

The goal is not semantic ranking.

The goal is better separation between:

* `new`
* `enrich-existing`
* `duplicate`

Rationale:

* the current extractor overproduces `new` because the real vault is
  principle-heavy while extracted candidates are often story-shaped.

### 4. Keep the candidate-note contract stable

Preserve the proposal-only output contract introduced in Story 0010.

The extractor should continue to emit:

* repository identity;
* source artifact path;
* source type;
* classification;
* matched vault note when relevant;
* candidate-note-aligned payload produced through `generateCandidateNote(...)`.

Rationale:

* Story 0012 should improve selection and classification, not invent a second
  proposal format.

### 5. Update the punctual extraction reference

Refresh `docs/references/workspace-vault-extraction.md` so the documented
behavior matches the refined implementation.

The reference should document:

* supported source layout variants;
* the stronger notion of low-value or generic artifacts;
* interpretation of `new`, `enrich-existing`, `duplicate`, and `skip` after
  refinement;
* the fact that real bootstrap quality depends on both coverage and signal
  filtering.

Rationale:

* the current reference still reflects the looser first extraction version.

### 6. Expand automated validation with representative fixtures

Strengthen `workspace-vault-extract.test.mjs` to cover the real failure modes
observed during bootstrap.

Add tests for at least:

* an `Engineering-Skills`-style repository layout;
* a `devlog-ai`-style `docs/stories/*` repository layout;
* a clearly generic code review or report that should be skipped;
* a realistic overlap case that should classify as `duplicate`;
* a realistic partial-overlap case that should classify as `enrich-existing`;
* preservation of proposal-only behavior and provenance after refinement.

Rationale:

* Story 0012 is fundamentally about extraction quality, so representative
  tests are part of the feature, not cleanup.

### 7. Re-run manual bootstrap validation on the real workspace

After implementation, execute the extractor again against:

* `/home/ludo/Bureau/workspace/Engineering-Skills`
* `/home/ludo/Bureau/workspace/devlog-ai`
* `/home/ludo/Bureau/workspace/dev-tools/obsidian/Engineering Vault`

Manual success criteria:

* `devlog-ai` now contributes eligible extraction sources;
* the result set is materially more selective than the previous run;
* clearly generic Story artifacts are filtered out;
* classification is more varied and more credible;
* the vault remains untouched.

Rationale:

* the Story exists because of a real bootstrap run, so it must be revalidated
  against the same real conditions.

## Files to Modify

* `transverse-memory/scripts/workspace-vault-extract.mjs` — refine source
  discovery, low-value filtering, and vault-aware comparison.
* `transverse-memory/scripts/workspace-vault-extract.test.mjs` — add
  representative coverage for layout support and quality heuristics.
* `docs/references/workspace-vault-extraction.md` — align the runbook and
  operator guidance with the hardened extractor behavior.

## Files Not Expected to Change

The following should remain unchanged unless implementation proves a real
contract gap:

* `transverse-memory/scripts/candidate-note.mjs`
* `transverse-memory/scripts/vault-catalog.mjs`
* vault note templates
* ADR-002, ADR-003, ADR-004 architectural boundaries

## Sequencing

1. Refine `workspace-vault-extract.mjs` source discovery.
2. Add stronger filtering and comparison heuristics in the same script.
3. Expand tests until the new behavior is proven on representative fixtures.
4. Update the extraction reference to match actual behavior.
5. Run automated validation.
6. Re-run manual bootstrap extraction on the real workspace and summarize the
   outcome in the Implementation Report.

## Validation

Automated validation:

```text
node --test transverse-memory/scripts/workspace-vault-extract.test.mjs
```

Manual validation:

```text
node transverse-memory/scripts/workspace-vault-extract.mjs \
  --vault-root "/home/ludo/Bureau/workspace/dev-tools/obsidian/Engineering Vault" \
  --repo-roots /home/ludo/Bureau/workspace/Engineering-Skills,/home/ludo/Bureau/workspace/devlog-ai
```

Expected evidence:

* both repositories are now eligible when they contain supported sources;
* obvious low-value artifacts are skipped rather than promoted;
* classification is no longer dominated by `new`;
* candidate output remains proposal-only and provenance-aware;
* no curated vault note is modified.

## Risks and Controls

### Risk: Too many ad hoc heuristics

Control:

* keep the rules few, named, and covered by tests.

### Risk: Over-filtering useful candidates

Control:

* prefer conservative skip rules tied to clearly generic artifact patterns.

### Risk: Layout support expands without clear boundaries

Control:

* add only repository layouts justified by the current workspace and approved
  analysis, not an open-ended discovery framework.

## Completion Criteria

The Story is complete when:

* the extractor supports the relevant repository layouts already present in the
  workspace;
* low-value generic artifacts are filtered more credibly;
* vault-aware classification is improved in code and tests;
* the reference documentation matches the refined behavior;
* automated tests pass;
* a real bootstrap re-run demonstrates materially better extraction quality.
