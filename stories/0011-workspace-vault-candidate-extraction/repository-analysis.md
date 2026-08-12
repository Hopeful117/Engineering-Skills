# Repository Analysis

## Story Understanding

Story 0011 asks for a punctual capability to scan workspace projects and
extract useful candidate knowledge items for the Obsidian transverse-memory
vault.

Requested behavior:

* define a ponctual scan workflow across one or more workspace projects;
* define which repositories and artifact types are eligible extraction sources;
* define what counts as a vault candidate rather than raw project material;
* define the extraction output model for candidate transverse knowledge;
* define provenance and traceability requirements;
* define how the scan is triggered and controlled manually;
* identify the minimum technical shape for a first usable extraction pass.

Engineering objective:

* bootstrap or support vault population selectively without turning the vault
  into a second project database and without requiring a permanent reusable
  skill prematurely.

Explicit scope:

* ponctual scan design;
* eligible source selection;
* candidate extraction contract;
* provenance and deduplication rules;
* minimum manual/technical execution shape.

Explicit exclusions:

* continuous feeding architecture; that belongs to Story 0010;
* vault integration architecture itself; that belongs to Story 0009;
* automatic publication into curated vault notes;
* mandatory reusable skill creation if a smaller ponctual mechanism is enough;
* exhaustive ingestion of every file;
* deep semantic ranking infrastructure unless later justified.

---

## Repository Summary

Engineering-Skills now contains three relevant layers of transverse-memory
work:

* Story 0009 established the vault as curated transverse memory with a
  read-side contract;
* Story 0010 established the steady-state feeding lifecycle
  `source -> candidate -> curated`, plus a proposal-only candidate generator;
* Story 0011 now addresses a different problem: discovering and extracting
  useful existing material across repositories in a ponctual way.

The repository is still not a knowledge-base runtime. Its role remains to:

* define workflow and artifact contracts;
* define architectural boundaries;
* provide small deterministic helpers where justified;
* keep human approval and curation explicit.

Story 0011 therefore sits at the boundary between:

* the existing vault destination and feeding contracts;
* the actual current workspace repositories and notes;
* a manual or bootstrap extraction workflow that may later inform broader
  Developer OS federation.

---

## Workspace Vault Context

The provided vault at:

* `/home/ludo/Bureau/workspace/dev-tools/obsidian/Engineering Vault`

already contains curated engineering notes in at least these areas:

* Engineering Philosophy;
* Quality standards;
* Workflow;
* AI Engineering;
* Knowledge Evolution Principles.

Representative note content shows that the vault currently emphasizes:

* shared engineering principles;
* workflow and quality standards;
* deterministic versus AI-assisted responsibilities;
* knowledge evolution and anti-duplication concerns.

This matters for Story 0011 because:

* extraction should avoid proposing notes that simply restate material already
  present in the vault;
* useful candidates may need to be framed as missing concepts, enrichments, or
  concrete cross-project patterns rather than generic standards already covered;
* the current vault is curated and principle-heavy, which increases the value
  of selective bootstrap extraction from real repository artifacts.

---

## Affected Modules

### Story 0009 transverse-memory boundary

Relevant components:

* `docs/adr/ADR-002-transverse-memory-boundary.md`
* `docs/references/obsidian-transverse-memory.md`
* `docs/templates/obsidian-transverse-note.md`
* `transverse-memory/scripts/vault-catalog.mjs`

Why involved:

* Story 0011 must respect the existing definition of the vault as curated
  transverse memory and the existing curated-note contract.

Current responsibility:

* define the vault role, curated-note contract, provenance expectations, and
  read-only cataloging behavior.

### Story 0010 feeding lifecycle

Relevant components:

* `docs/adr/ADR-003-transverse-memory-feeding.md`
* `docs/templates/obsidian-transverse-candidate-note.md`
* `transverse-memory/scripts/candidate-note.mjs`

Why involved:

* Story 0011 should likely produce candidate-note-like output, so it must align
  with the proposal-only candidate model introduced in Story 0010.

Current responsibility:

* define the steady-state feeding lifecycle and proposal-only candidate
  semantics.

### Engineering artifacts and ADRs as extraction sources

Relevant components:

* Story directories under `stories/`
* Engineering Reports
* Code Review Reports
* `docs/adr/`
* repository documentation

Why involved:

* Story 0011 is explicitly about finding candidate transverse knowledge in
  existing repository material.

Current responsibility:

* these artifacts preserve project-specific and workflow-specific engineering
  knowledge, but there is not yet a ponctual cross-repository scan contract.

### Existing vault content

Relevant workspace components:

* current Obsidian vault markdown notes

Why involved:

* extraction should be informed by what the vault already contains to reduce
  obvious duplication and improve candidate usefulness.

Current responsibility:

* curated transverse knowledge already accepted into the vault.

---

## Existing Implementation

### Existing behavior

The repository now supports destination and feeding semantics, but not ponctual
workspace-wide extraction.

1. Curated vault notes are modeled and readable.
   Story 0009 delivered:

   * memory-layer ownership;
   * curated-note contract;
   * read-side vault cataloging.

2. Candidate notes are modeled and generatable.
   Story 0010 delivered:

   * proposal-only candidate-note lifecycle;
   * candidate-note template;
   * candidate generator with provenance and eligibility validation.

3. The current vault already contains curated principle documents.
   The vault is not empty; it already covers philosophy, quality, workflow, AI
   engineering, and knowledge evolution.

4. No ponctual scan contract exists.
   There is currently:

   * no workspace repository selection model for bootstrap extraction;
   * no cross-repository candidate extraction format beyond the generic
     candidate-note contract;
   * no deduplication step against existing vault content;
   * no manual runbook or script for batch extraction.

### Missing behavior

The following behavior required by Story 0011 is currently missing:

* no ponctual scan workflow across multiple repositories;
* no repository/artifact-type eligibility rules for scan mode specifically;
* no output contract for extracted candidate batches;
* no mechanism to compare extracted material against existing vault notes;
* no manual bootstrap-oriented extraction command or runbook.

### Behavior that must remain unchanged

The following existing behaviors must remain unchanged:

* the vault remains the curated transverse layer;
* candidate extraction remains proposal, not publication;
* Story 0011 must not replace Story 0010 steady-state feeding semantics;
* DevLog remains authoritative for structured project memory;
* personal workspace memory remains distinct from transverse-memory candidates.

### Existing tests and validation

Current executable coverage in this area is limited to:

* `node --test transverse-memory/scripts/vault-catalog.test.mjs`
* `node --test transverse-memory/scripts/candidate-note.test.mjs`

No current tests exist for:

* multi-repository extraction;
* vault-aware deduplication;
* batch candidate output;
* manual bootstrap scan behavior.

---

## Architecture and Constraints

### Story 0011 is bootstrap/discovery, not steady-state feeding

Story 0010 already owns the ongoing feeding lifecycle. Story 0011 should define
how to inspect existing repositories and surface useful candidate material in
batch, not redesign the steady-state candidate lifecycle.

### Existing vault content must influence extraction usefulness

Because the current vault already contains high-level standards and principles,
the scan should prefer:

* missing cross-project concepts;
* concrete recurring patterns;
* distilled lessons from reports and ADRs;
* enrichments to existing curated topics;

rather than producing generic duplicates of already-curated standards.

### Extraction output should align with candidate-note semantics

The safest shape for Story 0011 output is likely:

* a batch of candidate-note drafts or payloads;
* with provenance back to repository, file, and source artifact;
* plus deduplication or merge hints against current vault content.

This keeps Story 0011 aligned with Story 0010 instead of inventing another
intermediate model.

### A reusable skill may be unnecessary

The Story explicitly allows a smaller punctual mechanism. Given the current
scope, a script, command, or documented manual workflow may be sufficient and
more appropriate than a full dedicated skill.

### DevLog context remains optional

This repository has repeatedly shown that DevLog context retrieval may degrade
gracefully. Story 0011 should therefore avoid depending on DevLog-specific
availability for its core extraction contract.

---

## Risks

### Duplicate candidate noise

If extraction ignores the current vault, it may propose concepts already
curated, reducing trust in the scan output.

### Over-extraction from rich artifact stores

Engineering-Skills repositories contain many markdown artifacts; a naive scan
could generate large volumes of low-value candidates.

### Provenance dilution in batch mode

Cross-repository extraction can easily collapse source detail if the output
model is too summary-heavy.

### Premature permanent abstraction

Building a full reusable skill too early may overcomplicate what is currently a
bootstrap/discovery need.

---

## Relevant Files and Evidence

Primary evidence reviewed:

* `stories/0011-workspace-vault-candidate-extraction/story.md`
* `stories/0010-fluid-obsidian-knowledge-feeding/engineering-report.md`
* `docs/adr/ADR-002-transverse-memory-boundary.md`
* `docs/adr/ADR-003-transverse-memory-feeding.md`
* `docs/references/obsidian-transverse-memory.md`
* `docs/templates/obsidian-transverse-note.md`
* `docs/templates/obsidian-transverse-candidate-note.md`
* `transverse-memory/scripts/vault-catalog.mjs`
* `transverse-memory/scripts/candidate-note.mjs`

Vault evidence reviewed:

* `00 - Engineering Philosophy/Engineering Philosophy.md`
* `01 - Quality/Engineering Quality Standard.md`
* `02 - Workflow/Engineering Workflow.md`
* `04 - Knowledge Engineering/Knowledge Evolution Principles.md`

Most relevant conclusions:

* the vault already contains curated foundational standards and principles;
* Story 0011 should avoid obvious duplication and prefer selective bootstrap
  extraction;
* Story 0011 should likely emit candidate-note-aligned output rather than invent
  another note layer;
* a ponctual script/runbook is likely more appropriate than a reusable skill.

---

## Recommendation

Ready for planning.

Repository Analysis completed.

Human approval required before Implementation Planning.

Awaiting explicit human approval.
