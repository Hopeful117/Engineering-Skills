# Workspace Vault Extraction

Use this reference when running a ponctual workspace scan to extract useful
transverse-memory candidates.

## Purpose

This workflow is for bootstrap and discovery.

It is appropriate when you want to:

* inspect selected repositories;
* surface likely transverse-memory candidates;
* compare those candidates against the current curated vault;
* prepare proposal-only output for later human curation.

It is not a background process and not a publication workflow.

## Inputs

Provide:

* one vault root path;
* one or more repository roots to scan.

Example:

```text
node transverse-memory/scripts/workspace-vault-extract.mjs \
  --vault-root /path/to/vault \
  --repo-roots /path/to/repo-a,/path/to/repo-b
```

## Source Selection

The first extraction workflow targets high-value artifact classes only:

* `stories/*/engineering-report.md`
* `stories/*/code-review.md`
* `docs/stories/*/engineering-report.md`
* `docs/stories/*/code-review.md`
* `docs/adr/*.md`
* `docs/decisions/*.md`

This is deliberately selective. It avoids treating every markdown file as a
candidate source.

Repository layout differences matter.

The extractor should support the current repository families in the workspace
without becoming an open-ended file crawler.

## Output Interpretation

Each extracted result should be interpreted as one of:

* `new`
  Use when the candidate appears to describe a useful transverse topic not
  already represented clearly in the vault.
* `enrich-existing`
  Use when the candidate seems to add meaningful detail to an existing curated
  note.
* `duplicate`
  Use when the candidate appears to restate an already-curated topic with low
  marginal value.
* `skip`
  Use when the source is eligible in theory but too weak, too local, or too
  mechanical to justify a candidate note.

These are review hints, not final curation decisions.

Typical skip cases include:

* very short content with weak synthesis value;
* generic Story-level reports that mostly restate workflow boilerplate;
* broad “no findings” reviews with little durable transverse knowledge.
* feature-level implementation reports that do not show enough explicit
  transverse signal.

## Repeatability

A ponctual scan may be repeated.

Repeated scans should:

* preserve provenance;
* avoid silently creating curated notes;
* remain reviewable;
* use the current vault state to reduce obvious duplicates.

Vault comparison is intentionally heuristic and deterministic.

It should use current curated vault topics to reduce obvious duplicate
proposals and to suggest likely enrichments, but it must not pretend to
perform automatic curation.

## Review Guidance

After a scan:

* review `new` candidates for true cross-project value;
* review `enrich-existing` candidates against the referenced curated note;
* reject or ignore low-value duplicates;
* expect some eligible artifacts to be skipped deliberately when they are too
  generic;
* keep curation decisions explicit and human-owned.

## Validation

Run:

```text
node --test transverse-memory/scripts/workspace-vault-extract.test.mjs
```

Manual validation should also confirm that:

* relevant repository layouts are covered by the scan;
* provenance points back to repository and source artifact paths;
* the current vault influences duplicate/enrichment hints;
* obviously generic Story artifacts are filtered out;
* no curated vault note is modified during extraction.
