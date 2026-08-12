# Repository Analysis

## Story Understanding

Story 0012 asks for a refinement of the punctual workspace-to-vault extraction
process introduced in Story 0011.

The problem is no longer whether candidate extraction is possible.

That was proven.

The problem is whether the extraction output is good enough to support a real
vault bootstrap without flooding human review with weak or misleading
proposals.

Requested outcomes:

* improve source discovery across relevant repository layouts;
* reduce noise from overly generic Story-level artifacts;
* improve classification quality across `new`, `enrich-existing`,
  `duplicate`, and `skip`;
* preserve provenance and proposal-only semantics;
* define observable quality expectations for a real bootstrap run.

Explicit non-goals:

* no automatic curation into the vault;
* no broader workflow integration yet;
* no rich semantic platform unless the approved plan can justify it;
* no change to the role boundaries between DevLog and the vault.

---

## Repository Summary

The relevant implementation lives in `Engineering-Skills` under the
transverse-memory layer introduced across Stories 0009, 0010, and 0011.

The current stack is:

* Story 0009
  * defines the vault as curated transverse memory;
  * provides vault cataloging through `vault-catalog.mjs`;
  * establishes note metadata expectations for curated notes.
* Story 0010
  * defines the proposal-only candidate-note model;
  * provides `candidate-note.mjs` for deterministic candidate generation.
* Story 0011
  * introduces `workspace-vault-extract.mjs`;
  * scans selected repositories;
  * compares candidate titles against current vault note titles;
  * emits proposal-only candidate output.

The implementation is intentionally small and deterministic.

That is a strength.

It means Story 0012 should improve precision without turning the extraction
layer into a heavy ranking system.

---

## Relevant Files and Responsibilities

### `transverse-memory/scripts/workspace-vault-extract.mjs`

Current punctual extraction orchestrator.

Responsibilities today:

* validate repository roots;
* collect eligible source files;
* summarize source markdown;
* derive candidate title and kind;
* compare title overlap against vault note titles;
* emit proposal-only candidate-note payloads.

Key current constraints in code:

* eligible Story artifacts are only discovered under `stories/*`
  directories;
* ADRs are only discovered under `docs/adr/*.md`;
* vault comparison uses exact title match first, then token overlap on note
  titles only;
* low-value filtering is mostly `summary.length < 80`;
* generic artifact titles are only weakly controlled.

### `transverse-memory/scripts/workspace-vault-extract.test.mjs`

Current validation is intentionally narrow.

It proves:

* duplicate detection via one exact vault topic;
* low-value skipping for tiny files;
* CLI failure on invalid repo root.

It does not yet prove:

* support for multiple repository layouts;
* classification separation between `enrich-existing` and `duplicate` on more
  realistic cases;
* rejection of generic Story-level artifacts;
* representative cross-project extraction behavior.

### `transverse-memory/scripts/vault-catalog.mjs`

Primary vault reader.

It expects curated notes with YAML frontmatter and required metadata.

When that fails, `workspace-vault-extract.mjs` falls back to a loose heading
catalog from all markdown files under the vault.

This fallback is necessary for the current real vault because its notes are not
uniformly frontmatter-based.

### `transverse-memory/scripts/candidate-note.mjs`

Proposal-only candidate generator.

This layer is already well-bounded and should likely remain unchanged unless
Story 0012 discovers a payload-contract gap.

The main quality issue is upstream selection and classification, not markdown
candidate rendering.

---

## Observed Real-World Behavior

A real bootstrap run was executed against:

* vault:
  `/home/ludo/Bureau/workspace/dev-tools/obsidian/Engineering Vault`
* repositories:
  * `/home/ludo/Bureau/workspace/Engineering-Skills`
  * `/home/ludo/Bureau/workspace/devlog-ai`

Observed result:

* `20` extracted candidates;
* `0` skipped candidates;
* all `20` classified as `new`;
* all `20` sourced from `Engineering-Skills`;
* `devlog-ai` contributed nothing.

This is enough evidence that the current extraction quality is not yet
satisfactory for real vault feeding.

The output was technically valid, but editorially weak.

---

## Root Cause Analysis

### 1. Repository layout discovery is too narrow

`collectEligibleFiles()` only looks for Story artifacts under:

* `stories/*/engineering-report.md`
* `stories/*/code-review.md`

This matches `Engineering-Skills`, but not `devlog-ai`, whose Story artifacts
live under `docs/stories/*/...`.

Result:

* cross-project extraction is biased by repository layout;
* the scan appears to work, but only for one repository family;
* acceptance criteria about workspace-wide usefulness are only partially met in
  practice.

### 2. ADR discovery is tied to one naming convention

The implementation only checks `docs/adr/*.md`.

`devlog-ai` uses `docs/decisions/` as another architecture-oriented knowledge
area and may continue to evolve differently from `Engineering-Skills`.

Even if Story 0012 keeps source selection deliberately selective, the current
implementation is more convention-bound than repository-aware.

### 3. Title-based comparison is too weak for real curation support

`compareWithVault()` compares only titles.

That is enough for:

* exact duplicates with matching names;
* broad overlap hints.

That is not enough for:

* conceptually overlapping but differently phrased notes;
* distinguishing a true amendment from a near-duplicate lesson;
* suppressing generic artifact-derived names that look novel only because the
  wording differs.

The current vault is principle-heavy and the extracted candidates are often
story-shaped.

That makes title-only comparison especially weak.

### 4. Generic artifact promotion is too permissive

For Story artifacts, titles are synthesized as:

* `Pattern from <story title>`
* `Lesson from <story title>`

This improves provenance visibility, but it also means a broad Story title can
become a candidate title even when the underlying artifact is not strong enough
to justify a transverse note.

Examples of likely weak outputs seen in the real run:

* broad “Code Review Report”-style outputs;
* story-specific lessons that read like project history rather than durable
  cross-project knowledge.

The current low-value check only filters very short content.

It does not filter:

* generic review boilerplate;
* “no findings” reviews with little transverse learning;
* implementation summaries that restate the Story more than they extract a
  reusable concept.

### 5. Validation is not representative enough

The current tests validate the shape of the extractor but not the quality bar
needed for real bootstrap use.

Missing representative tests:

* a repository using `docs/stories/*`;
* a repository with different architectural-doc conventions;
* a generic code-review artifact that should now be skipped;
* a realistic vault note that should trigger `enrich-existing` rather than
  `new`;
* a mixed-repository run demonstrating cross-project coverage.

---

## Architectural Constraints

The following constraints must remain intact:

* the extractor remains punctual and manually triggered;
* the output remains proposal-only;
* the vault remains curated and human-owned;
* provenance must remain explicit back to repository and source artifact;
* the implementation should stay deterministic and understandable;
* Story 0012 should improve heuristics, not pretend to solve curation with
  hidden intelligence.

These constraints strongly favor a modest refinement over a heavy redesign.

---

## Design Options

### Option A — Minimal hardening of current deterministic heuristics

Changes:

* support multiple eligible Story roots such as `stories/` and `docs/stories/`;
* support a small explicit set of architecture-document roots where justified;
* add stronger low-value filters for generic review/report content;
* enrich classification using title plus limited body signals;
* add representative tests driven by real repository shapes.

Pros:

* smallest change;
* preserves current architecture;
* directly addresses all observed failures;
* easiest to validate and explain.

Cons:

* still heuristic;
* may require periodic tuning as repositories evolve.

### Option B — Introduce repository-specific extraction profiles

Changes:

* configurable per-repository source roots and source priorities.

Pros:

* handles heterogeneous repositories cleanly.

Cons:

* adds configuration surface early;
* risks over-engineering before the quality model itself is stable.

### Option C — Introduce semantic ranking or LLM-assisted candidate scoring

Pros:

* potentially stronger editorial judgment.

Cons:

* violates the current preference for deterministic, understandable behavior;
* much harder to test;
* too large a step before basic layout and heuristic quality are fixed.

---

## Recommended Direction

Option A is the right next step.

Story 0012 should harden the current deterministic extractor rather than
replace it.

Recommended implementation direction:

1. Expand source discovery to support both `stories/*` and `docs/stories/*`.
2. Keep source classes selective, but allow a small explicit set of
   architecture-document roots when evidence justifies it.
3. Add low-value heuristics that can skip generic reviews and reports even when
   they are longer than 80 characters.
4. Improve comparison by using limited body-derived topic tokens in addition to
   titles.
5. Add representative tests matching the real repositories and the real vault
   shape already observed.

This would materially improve extraction quality without breaking the existing
boundary model.

---

## Validation Strategy

Repository validation should include at minimum:

* `node --test transverse-memory/scripts/workspace-vault-extract.test.mjs`

The test suite should be expanded to prove:

* `Engineering-Skills`-style layout support;
* `devlog-ai`-style `docs/stories/*` layout support;
* duplicate detection on clearly overlapping topics;
* enrichment detection on partially overlapping topics;
* skipping of generic low-value artifacts;
* preservation of proposal-only candidate semantics and provenance.

Manual validation after implementation should confirm:

* the real vault bootstrap run now surfaces both repositories when relevant;
* the result set is materially smaller and more reviewable;
* obviously generic artifacts are filtered out;
* the output still never modifies the vault directly.

---

## Risks

### Over-filtering

Aggressive heuristics could suppress legitimate cross-project knowledge.

Mitigation:

* bias toward explicit and understandable skip rules;
* cover borderline cases in tests.

### Accidental heuristic drift

Many small ad hoc rules could make behavior opaque.

Mitigation:

* keep rules few and named;
* document them in the reference and tests.

### False improvement

The implementation may change classification labels without improving actual
review quality.

Mitigation:

* validate on the real repositories and vault, not only on synthetic fixtures.

---

## Conclusion

Story 0012 is justified by concrete runtime evidence, not by hypothetical
future complexity.

The current extractor already has the right architectural boundary and the
right proposal-only shape.

What it lacks is extraction quality:

* broader but still controlled repository discovery;
* stronger noise filtering;
* better vault-aware comparison;
* representative validation.

That should be addressed now, before any workflow or vault integration is
built on top of it.
