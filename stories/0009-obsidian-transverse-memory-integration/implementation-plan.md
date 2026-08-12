# Implementation Plan

## Overview

Implement Story 0009 as a deliberately small transverse-memory foundation for
Engineering-Skills and the wider ecosystem:

* define an explicit architectural boundary where DevLog remains the
  authoritative project-memory system, workflow artifacts remain the
  authoritative engineering records, workspace memory remains personal and
  operational, and the Obsidian vault becomes the curated cross-project
  transverse-memory layer;
* introduce a repository-owned note-model contract describing what a vault note
  is allowed to contain, what it must link back to, and what it must never own;
* add a minimal read-side technical integration that can inspect a vault on
  disk and emit deterministic navigation/index data without writing into the
  vault or granting it workflow authority;
* document how this integration fits the future Developer OS federation
  direction without pre-designing the later feeding pipeline from Story 0010 or
  the workspace scan from Story 0011.

This keeps the first increment operational and testable while avoiding the two
main failure modes identified in Repository Analysis: turning the vault into a
second DevLog or collapsing multiple memory layers into one vague store.

## Planned Changes

### 1. Formalize the ecosystem memory boundary

Create an explicit repository-level architectural decision for differentiated
memory layers.

The decision should establish:

* **DevLog** owns structured, project-scoped engineering memory;
* **Engineering Artifacts** own workflow-stage records and approval-traceable
  engineering outputs;
* **workspace memory** (`MEMORY.md`, daily notes, local operational files)
  remains personal and operational continuity;
* **Obsidian vault** owns curated, cross-project, concept-oriented transverse
  knowledge;
* **Developer OS** is the likely future federation layer across those memory
  sources.

The decision must also state negative boundaries clearly:

* the vault does not own project lifecycle state;
* the vault does not own approval state;
* the vault does not replace Story artifacts;
* the vault does not become an ingestion sink for every project document.

Relevant constraint:

* the new decision must extend ADR-001 rather than undermine it; approved
  workflow artifacts remain first-class records.

### 2. Define the minimum transverse-note model

Add a concrete contract for what a first transverse-memory note looks like.

The note model should cover:

* canonical note purpose, such as concept, pattern, lesson, decision summary,
  glossary, or cross-project map;
* minimum metadata, for example:
  * `id` or stable slug;
  * `title`;
  * `kind`;
  * `status` such as draft or curated;
  * `created` / `updated`;
  * `sourceProjects`;
  * provenance links back to Story, ADR, report, or repository file;
  * optional related concepts / aliases / tags;
* minimum content expectations:
  * concise statement of the concept or lesson;
  * why it matters across projects;
  * explicit links back to authoritative sources;
* forbidden content classes, for example:
  * approval outcomes as vault authority;
  * mutable copies of project-state facts that belong in DevLog;
  * raw uncurated dumps of Story artifacts.

Relevant constraint:

* the note model must be strong enough to preserve provenance and weak enough
  to remain tool-independent and human-editable in plain Markdown.

### 3. Introduce a read-side vault integration contract

Define how the ecosystem may read and navigate vault content without turning
that read path into a workflow dependency.

The contract should establish:

* the vault is accessed from a configured filesystem path, not via a networked
  service requirement;
* the first integration is read-only;
* consumers receive deterministic note metadata and link information;
* a missing vault path, malformed note, or missing metadata is a local
  validation/runtime issue, not a workflow authority issue;
* Engineering-Skills can use vault navigation as optional context, never as an
  approval gate.

Relevant constraint:

* Story 0009 must stop at the read-side navigation/index boundary and leave
  write automation to Story 0010.

### 4. Implement a small deterministic vault catalog adapter

Create a dependency-free Node.js adapter that reads an Obsidian vault directory
and emits a deterministic catalog of eligible transverse-memory notes.

The adapter should:

* accept a vault root path as input;
* recursively inspect Markdown notes while ignoring `.obsidian`, hidden files,
  and non-Markdown assets;
* parse the minimum note metadata contract;
* extract note title, kind, status, provenance links, tags, and outbound wiki
  links or Markdown links relevant to navigation;
* produce stable structured JSON suitable for downstream query/navigation use;
* preserve exact note paths relative to the vault root;
* fail deterministically when the vault path is invalid or unreadable;
* distinguish invalid note structure from simple absence of optional metadata;
* never write to the vault, rename files, mutate frontmatter, or infer missing
  project-state facts.

Relevant constraint:

* the adapter is an index/navigation primitive, not a semantic search engine,
  recommendation engine, or curation workflow.

### 5. Provide a reference note template and usage guidance

Create a minimal repository-owned template and guidance for transverse-memory
notes so the architecture is executable in practice rather than purely
conceptual.

The guidance should show:

* one example note structure with metadata and provenance sections;
* expected linking style toward Stories, ADRs, reports, or repositories;
* when a concept belongs in the vault versus in DevLog or a workflow artifact;
* how to represent cross-project relevance without copying project-state data.

Relevant constraint:

* the example must use placeholders only and must not commit any personal vault
  content or local paths.

### 6. Document local configuration and trust boundaries

Add concise operational guidance describing:

* how a local vault path is supplied from workspace-local configuration rather
  than hardcoded into reusable repository assets;
* that Engineering-Skills never stores Ludovic's personal vault path in the
  repository;
* how the catalog adapter is intended to be run and validated locally;
* that vault notes may provide transverse context but do not override the
  repository, DevLog, or approved artifacts when conflicts appear.

Relevant constraint:

* machine-specific values belong to workspace-local configuration or operator
  commands, not to repository source.

### 7. Keep workflow orchestration unchanged in authority

Do not make the Obsidian integration a new workflow controller.

Implementation should preserve that:

* `engineering-story` still owns workflow sequencing;
* `workflow-gate` still owns approval-state enforcement;
* Story artifacts remain the approval-scoped workflow chain;
* the vault remains an optional contextual layer.

If any reusable workflow wording needs adjustment, it should only clarify these
boundaries. Story 0009 should not redesign prompts around vault ingestion,
publication, or approval use.

### 8. Validate the first read-side integration end to end

Validate both the conceptual and executable pieces together.

The implementation should verify:

* the architectural boundary is explicit and non-contradictory with ADR-001;
* the note model, template, and adapter all describe the same metadata and
  provenance contract;
* the adapter returns deterministic catalog data for valid notes;
* malformed notes and invalid vault-path scenarios fail clearly;
* no implementation path writes to the vault;
* no Story 0010 or Story 0011 scope leaks into this implementation.

## Files to Modify

* `README.md` — clarify the repository's role in the wider memory ecosystem and
  position transverse memory relative to Developer OS without transferring
  workflow authority.

## Files to Create

* `docs/adr/ADR-002-transverse-memory-boundary.md` — architectural decision for
  the four memory layers and their ownership boundaries.
* `docs/references/obsidian-transverse-memory.md` — operational/reference
  guidance for vault role, note categories, provenance, trust model, and local
  configuration expectations.
* `docs/templates/obsidian-transverse-note.md` — minimal transverse-note
  template with placeholder metadata and provenance links.
* `transverse-memory/scripts/vault-catalog.mjs` — dependency-free read-only
  vault catalog adapter.
* `transverse-memory/scripts/vault-catalog.test.mjs` — automated tests for the
  adapter.

If implementation reveals that a tiny additional supporting file is required to
keep the adapter or documentation coherent, it may be added only if it stays
strictly within the approved read-side scope.

## Dependencies

### Internal dependencies

* `docs/adr/ADR-001-engineering-artifacts.md` remains the baseline authority for
  workflow artifacts.
* `README.md` remains the high-level repository positioning document.
* the new transverse-memory documentation and adapter must remain consistent
  with existing Engineering-Skills conventions.
* Stories 0010 and 0011 depend conceptually on this boundary and therefore must
  not be partially implemented here.

### External dependencies

* Node.js runtime already used in the Engineering-Skills environment.
* A local Obsidian vault directory only for practical validation.

No Obsidian plugin, remote API, database, DevLog schema change, or external paid
service is required.

### Ordering dependencies

1. Define the memory-layer boundary first.
2. Define the note-model and template against that boundary.
3. Implement the read-only catalog adapter against the same contract.
4. Validate documentation and adapter behavior together.

## Test Plan

### Documentation and boundary validation

Review the new ADR, reference guide, template, and README together to confirm:

* ownership boundaries are explicit and non-overlapping;
* DevLog remains authoritative for project memory;
* workflow artifacts remain authoritative for workflow records;
* workspace memory remains distinct from transverse vault memory;
* the vault is read-side and contextual only in this Story.

### Adapter tests

Run:

```text
node --test transverse-memory/scripts/vault-catalog.test.mjs
```

Tests should verify:

* valid Markdown notes with the expected metadata are indexed correctly;
* relative paths are stable and normalized;
* `.obsidian` and non-Markdown files are ignored;
* outbound wiki links and Markdown links are extracted for navigation;
* missing vault root fails clearly;
* malformed required metadata fails clearly;
* optional metadata may be absent without inventing values;
* the adapter never writes to vault contents.

### Repository checks

Expected targeted validation commands:

```text
rg -n "Obsidian|vault|transverse memory|DevLog|workflow authority|workspace memory" README.md docs/adr docs/references docs/templates transverse-memory
```

```text
git diff -- README.md docs/adr docs/references docs/templates transverse-memory engineering-story plugins/workflow-gate
```

```text
rg -n "/home/ludo|localhost|93441821|f3d56247|Vault" docs/adr docs/references docs/templates transverse-memory README.md
```

### Practical local validation

Create a tiny temporary sample vault locally and verify that:

* a note respecting the template is cataloged successfully;
* a note with missing required provenance is rejected or reported according to
  the final contract;
* the generated catalog is useful for deterministic navigation;
* no file in the vault is modified by the adapter.

### Expected success conditions

* the repository contains a clear documented transverse-memory boundary;
* a minimal transverse-note contract and template exist;
* a read-only vault catalog adapter exists and is tested;
* the final diff stays within documentation and read-side adapter scope;
* no workflow authority is transferred to the vault;
* no write/feeding automation is introduced.

## Risks

### Building a second memory system by accident

Risk:
The implementation could duplicate project facts already owned by DevLog.

Mitigation:
Make provenance mandatory, forbid project-state authority in the note model,
and keep the adapter read-only.

### Blurring personal memory with shared transverse memory

Risk:
Workspace local notes and vault notes could become interchangeable in the
architecture.

Mitigation:
Document a strict ownership split between operational/personal continuity and
curated cross-project knowledge.

### Scope drift into Story 0010 or 0011

Risk:
Implementation could slip into automated feeding, extraction heuristics, or
workspace-wide scanning.

Mitigation:
Constrain Story 0009 to note contract, boundary definition, and read-side vault
cataloging only.

### Overfitting to Obsidian internals

Risk:
A first integration could become dependent on Obsidian-specific runtime
features.

Mitigation:
Use plain Markdown plus minimal metadata conventions and filesystem-based
reading only.

### Weak note-model enforcement

Risk:
If the metadata contract is too vague, later feeding and extraction work will
be inconsistent.

Mitigation:
Give the template and adapter one shared minimum contract with explicit required
and optional fields.

## Validation Checklist

- [ ] The repository defines an explicit ownership boundary between DevLog,
      workflow artifacts, workspace memory, and the Obsidian vault.
- [ ] DevLog remains documented as the authoritative project-memory layer.
- [ ] Workflow artifacts remain documented as the authoritative workflow
      record.
- [ ] The Obsidian vault is documented as curated transverse memory only.
- [ ] A minimum note-model contract exists with metadata and provenance
      expectations.
- [ ] A repository-owned transverse-note template exists.
- [ ] A read-only vault catalog adapter exists in the repository.
- [ ] Automated tests cover valid cataloging, ignored files, malformed notes,
      and invalid vault-root handling.
- [ ] No repository file hardcodes a personal vault path or local machine value.
- [ ] No implementation path writes to the vault.
- [ ] `engineering-story` and `workflow-gate` authority boundaries remain
      unchanged.
- [ ] The final diff stays scoped to Story 0009 and does not implement Story
      0010 or Story 0011 behavior.

## Recommendation

Ready for implementation

## Approval Required

Implementation Plan completed.

Human approval required before Implementation.

Awaiting explicit human approval.
