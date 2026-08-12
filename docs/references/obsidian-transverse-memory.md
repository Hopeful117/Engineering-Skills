# Obsidian Transverse Memory

Use this reference when integrating a local Obsidian vault as transverse memory
alongside DevLog and Engineering Story artifacts.

## Role

The vault is the curated, cross-project transverse-memory layer.

Good vault candidates include:

* concepts shared across projects;
* recurring implementation or architecture patterns;
* lessons learned with multi-project value;
* curated decision summaries;
* cross-project glossaries or maps.

The vault is not the home for:

* project lifecycle state;
* approval state;
* raw Story artifacts;
* exhaustive copies of project memory;
* personal operational notes that belong in workspace memory.

## Feeding Lifecycle

Transverse memory uses a three-step feeding lifecycle:

```text
source artifact -> candidate note -> curated note
```

The roles are distinct:

* **source artifacts** remain authoritative for their original engineering or
  project-memory claims;
* **candidate notes** are reviewable proposals derived from one or more
  authoritative sources;
* **curated notes** are the canonical vault notes.

Automation may help move information from source artifact to candidate note.
It must not silently move information from candidate note to curated note.

## Note Contract

The first integration uses plain Markdown notes with simple YAML frontmatter.

Required frontmatter fields:

* `id`
* `title`
* `kind`
* `status`
* `sourceProjects`
* `provenance`

Optional frontmatter fields:

* `created`
* `updated`
* `tags`
* `aliases`

Expected `kind` examples:

* `concept`
* `pattern`
* `lesson`
* `decision-summary`
* `glossary`
* `map`

Expected `status` examples:

* `draft`
* `curated`

`sourceProjects` and `provenance` are simple YAML lists in the first version.

Curated notes are canonical vault notes. Candidate notes use a separate
proposal-oriented template and status model.

## Candidate Note Contract

Candidate notes are proposal records, not canonical transverse knowledge.

Required candidate metadata should include:

* `id`
* `title`
* `kind`
* `status`
* `candidateSourceTypes`
* `sourceProjects`
* `provenance`
* `transverseRationale`

Candidate statuses may include:

* `proposed`
* `needs-curation`
* `superseded`

Candidate notes may also reference an optional target curated note when the
proposal amends or merges into an existing concept rather than creating a new
one.

Candidate notes must remain explicitly non-curated and reviewable.

## Source Eligibility

Likely eligible sources include:

* Engineering Reports;
* Code Review Reports when they contain reusable lessons;
* ADRs;
* validated cross-project patterns;
* selected durable DevLog knowledge.

By default, the following are not sufficient on their own:

* every Story artifact indiscriminately;
* transient implementation details;
* purely project-local state;
* personal workspace memory.

Source eligibility does not imply automatic note creation. Cross-project
relevance and strong provenance are still required.

## Anti-Flooding Rules

The feeding pipeline should prefer signal over volume.

Expected safeguards:

* not every eligible artifact becomes a candidate note;
* duplicate or near-duplicate proposals should be merged, linked, or rejected;
* candidate notes should say whether they propose a new concept or an update to
  an existing curated note;
* curated notes should not be overwritten directly by automation.

For steady-state workflow feeding, duplicate suppression should also consider:

* existing repository-owned proposal artifacts;
* repeated Story provenance already attached to a proposal;
* no-op replays of the same Story outcome.

## Provenance Rules

Every candidate and curated transverse note must link back to authoritative
sources.

Examples:

* a Story path;
* an ADR path;
* an Engineering Report path;
* a repository document path;
* a DevLog record identifier written as a reference, not as a replacement for
  project state.

The vault may summarize or connect knowledge, but it must not become the only
place where a claim can be verified.

Candidate notes should also preserve enough provenance to explain:

* why the source was considered eligible;
* why the content appears cross-project rather than project-local;
* whether the proposal is new or intended to amend an existing concept.

## Trust Model

When information conflicts:

* repository source and accepted ADRs win for repository-specific behavior;
* DevLog wins for structured project-memory facts;
* approved workflow artifacts win for workflow reasoning and approval-scoped
  records;
* the vault provides contextual synthesis and links, not authority overrides.

Within the vault itself:

* curated notes outrank candidate notes for canonical transverse-memory use;
* candidate notes remain proposals until a human curation decision resolves
  them.

## Local Configuration

Do not hardcode a personal vault path in repository source.

Supply the vault root path locally when invoking tools or adapters. Example:

```text
node transverse-memory/scripts/vault-catalog.mjs --vault-root /path/to/vault
```

Machine-specific values belong in workspace-local operator context, not in
committed reusable assets.

## Curation Boundary

Automation may:

* detect eligible source artifacts;
* generate candidate-note drafts;
* preserve provenance and backlinks;
* suggest whether the proposal looks like a new concept or an update to an
  existing curated note.

Automation must not:

* silently publish curated notes;
* overwrite curated notes as if curation already occurred;
* erase source provenance;
* become a workflow or approval authority.

Human curation remains responsible for:

* accepting a candidate into curated transverse memory;
* rejecting low-value candidates;
* merging overlapping proposals;
* deciding whether to amend an existing curated note.

## Continuous Feeding

Bootstrap extraction and continuous feeding are different workflows.

Use continuous feeding when a completed Story has already produced an explicit
vault outcome through `engineering-story`.

The first continuous workflow should:

* record a structured Story-local `vault-outcome.json` artifact;
* generate or update repository-owned proposal artifacts under
  `transverse-memory/proposals/`;
* keep those proposal artifacts outside the curated vault;
* use deterministic duplicate suppression based on proposal key, Story
  provenance, and current curated vault state;
* remain lighter than broad workspace extraction.

Continuous feeding should not:

* rescan repositories broadly;
* parse loose prose when a structured Story artifact is available;
* publish directly into the curated vault.

## Read-Side Catalog

The first integration is read-only.

The catalog adapter:

* scans Markdown notes under a local vault root;
* ignores `.obsidian`, hidden paths, and non-Markdown files;
* parses the minimum frontmatter contract;
* extracts outbound links for deterministic navigation;
* emits stable JSON for downstream navigation or indexing.

The adapter must never:

* create notes;
* update notes;
* rewrite frontmatter;
* infer missing project-state facts;
* act as a workflow gate.

## Validation

Run:

```text
node --test transverse-memory/scripts/vault-catalog.test.mjs
```

Manual validation should also confirm that:

* valid notes are cataloged with stable relative paths;
* invalid notes fail clearly;
* no vault file is modified during scanning.

Run:

```text
node --test transverse-memory/scripts/candidate-note.test.mjs
```

Manual validation for feeding should also confirm that:

* candidate drafts preserve provenance;
* generated candidates remain explicitly non-curated;
* no curated note is modified during proposal generation.

## Punctual Workspace Extraction

Bootstrap extraction across repositories is a separate, operator-triggered
workflow.

Its purpose is to inspect selected repositories and artifact classes, compare
them against the current curated vault, and surface proposal-only candidates.

Expected properties:

* selective rather than exhaustive;
* vault-aware rather than vault-blind;
* provenance-preserving;
* proposal-only;
* manually triggered and reviewed.

The preferred outputs are:

* likely new candidate;
* likely enrichment of an existing curated note;
* likely duplicate or skip.

Punctual extraction should align with the candidate-note contract introduced in
the steady-state feeding model. It must not invent a competing note lifecycle.
