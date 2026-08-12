# Repository Analysis

## Story Understanding

Story 0010 asks for the next safe step after Story 0009: define how the
ecosystem should feed the Obsidian vault smoothly without turning it into a
dumping ground or a second project-memory system.

Requested behavior:

* define the ingestion pipeline from source artifacts and project memory toward
  the vault;
* define which upstream sources may generate transverse-memory candidates;
* define the promotion model from raw source material to candidate notes to
  curated notes;
* define human-versus-automation responsibilities for candidate creation and
  update;
* define provenance, backlink, and traceability rules for the feeding flow;
* identify the minimum automation shape for a first safe feeding workflow.

Engineering objective:

* make transverse-memory feeding fluid enough to be usable while preserving the
  ownership boundary introduced in Story 0009 and the artifact authority
  defined by ADR-001.

Explicit scope:

* feeding-pipeline design;
* source eligibility rules;
* candidate-versus-curated promotion model;
* provenance/backlink rules;
* minimum automation shape for first safe feeding.

Explicit exclusions:

* initial read-side vault integration itself;
* aggressive autonomous ingestion of all Story artifacts;
* fully automatic curation and publication;
* recommendation/ranking infrastructure unless explicitly justified later;
* Obsidian UI/plugin implementation unless required by the approved plan.

---

## Repository Summary

Engineering-Skills is a workflow and artifact repository, not a knowledge-base
runtime. Its existing responsibilities remain:

* defining reusable engineering workflows;
* preserving human approval gates;
* standardizing engineering artifacts;
* documenting architecture and workflow boundaries;
* introducing small deterministic integration surfaces where needed.

For Story 0010, the repository now already contains the first transverse-memory
foundation from Story 0009:

* ADR-002 defines differentiated ownership across DevLog, workflow artifacts,
  workspace memory, and the Obsidian vault;
* `docs/references/obsidian-transverse-memory.md` defines the vault role and
  minimal note contract;
* `docs/templates/obsidian-transverse-note.md` defines the first note shape;
* `transverse-memory/scripts/vault-catalog.mjs` provides read-only vault
  cataloging.

What the repository still does **not** contain is equally important:

* no candidate-note layer;
* no feeding pipeline contract;
* no rules for when automation may propose updates;
* no distinction in repository assets between source artifact, candidate note,
  and curated note beyond conceptual wording in Story 0010 itself.

Story 0010 therefore sits between:

* artifact-first workflow outputs governed by ADR-001;
* transverse-memory ownership governed by ADR-002;
* future extraction/bootstrap work anticipated by Story 0011;
* future Developer OS federation that may eventually orchestrate the flow.

---

## Affected Modules

### ADR-001 artifact model

Relevant component:

* `docs/adr/ADR-001-engineering-artifacts.md`

Why involved:

* Story 0010 proposes using workflow artifacts as upstream inputs to a feeding
  pipeline, so the pipeline must respect artifact authority, immutability, and
  traceability.

Current responsibility:

* workflow artifacts are first-class, persisted, approval-scoped engineering
  records and remain authoritative for their workflow stage outputs.

### ADR-002 transverse-memory boundary

Relevant component:

* `docs/adr/ADR-002-transverse-memory-boundary.md`

Why involved:

* Story 0010 must build directly on the memory-layer ownership rules created in
  Story 0009.

Current responsibility:

* DevLog owns project memory;
* Engineering Artifacts own workflow records;
* workspace memory owns local operational continuity;
* the Obsidian vault owns curated cross-project transverse knowledge;
* the first integration boundary is read-side only.

### Obsidian transverse-memory reference and template

Relevant components:

* `docs/references/obsidian-transverse-memory.md`
* `docs/templates/obsidian-transverse-note.md`

Why involved:

* Story 0010 needs to decide how source material becomes candidate notes and
  then curated notes, so the existing note contract is a key downstream target.

Current responsibility:

* define the role, frontmatter contract, provenance rules, trust model, and
  example structure of curated transverse notes.

### Read-side vault catalog adapter

Relevant component:

* `transverse-memory/scripts/vault-catalog.mjs`

Why involved:

* the existing adapter shows what the repository currently considers a
  valid, readable transverse note. Any feeding design must either target that
  contract directly or define a separate candidate contract that can later be
  promoted into it.

Current responsibility:

* reads and validates curated-note-like markdown files from a local vault;
* indexes note metadata and outbound links;
* provides no write path, no candidate status model, and no promotion logic.

### Story artifacts as source material

Relevant repository surfaces:

* Story directories under `stories/`
* Engineering Reports
* Code Review Reports
* ADRs and repository documentation

Why involved:

* Story 0010 explicitly positions these artifacts as likely upstream sources for
  candidate transverse knowledge.

Current responsibility:

* these assets preserve engineering reasoning and outcomes, but they are not
  yet modeled as inputs to a candidate-generation or promotion flow.

### Story 0011 dependency boundary

Relevant component:

* `stories/0011-workspace-vault-candidate-extraction/story.md`

Why involved:

* Story 0011 depends on Story 0010 and is about ponctual extraction across
  projects, so Story 0010 must not accidentally absorb that tactical bootstrap
  scope.

Current responsibility:

* reserves workspace-wide scanning and selective extraction as a separate,
  later concern.

---

## Existing Implementation

### Existing behavior

The repository now has an explicit destination model for transverse memory, but
no feeding model.

1. Curated transverse notes are defined.
   Story 0009 introduced:

   * ADR-002 ownership rules;
   * a note contract with provenance;
   * a note template;
   * a read-only catalog adapter.

2. Workflow artifacts remain authoritative upstream records.
   ADR-001 and the `engineering-story` workflow preserve the authority of
   Stories, analyses, plans, reports, and reviews.

3. DevLog remains authoritative for structured project memory.
   Story 0009 reaffirmed that project-state facts stay in DevLog or repository
   source artifacts, not in curated vault notes.

4. The repository can read vault notes, but cannot feed them.
   `vault-catalog.mjs` can index notes already in the vault, but there is:

   * no candidate-note representation;
   * no source-to-candidate transformation model;
   * no promotion workflow from candidate to curated note;
   * no automation boundary for safe updates.

### Missing behavior

The following behavior required by Story 0010 is currently missing:

* no staged feeding model from source artifacts to candidate notes to curated
  notes;
* no policy for which artifacts are eligible to generate candidates;
* no rules for when automation may create a candidate or update an existing one;
* no explicit deduplication or anti-flooding model;
* no backlink requirements beyond the curated-note provenance field itself;
* no first automation shape for low-friction feeding.

### Behavior that must remain unchanged

The following existing behaviors must remain unchanged:

* DevLog remains authoritative for structured project memory.
* Workflow artifacts remain authoritative for workflow reasoning and approvals.
* The vault remains the curated transverse layer rather than a project-memory
  mirror.
* Human approval authority remains outside any memory or feeding mechanism.
* Story 0010 must not silently absorb Story 0011 workspace-scan behavior.

### Existing tests and validation

The only current executable coverage in this area is for read-side vault
cataloging:

* `node --test transverse-memory/scripts/vault-catalog.test.mjs`

No current tests exist for:

* candidate generation;
* promotion rules;
* deduplication heuristics;
* feeding automation;
* source eligibility selection.

---

## Architecture and Constraints

### Artifact authority cannot be collapsed into note authority

ADR-001 means upstream artifacts remain authoritative even when they seed
transverse notes. Any feeding pipeline must preserve the distinction between:

* source artifact;
* proposed candidate note;
* curated note.

### Story 0009 created a strong destination contract but no ingestion contract

The current note template and catalog adapter define what a curated note looks
like, but they do not define how a note gets there. Story 0010 therefore needs
to introduce an intermediate proposal model or promotion contract rather than
writing directly from artifacts into curated notes.

### Automation may assist, but curation must remain explicit

Story 0010's own invariants already state:

```text
Automation may propose.
It must not silently curate.
```

This is aligned with both ADR-001 and ADR-002 and should likely remain the
central architectural rule of the feeding pipeline.

### Deduplication and anti-flooding matter as much as extraction

Because the repository already produces many rich markdown artifacts, a naive
feeding pipeline could flood the vault by treating every Story output as a note
candidate. The repository currently has no built-in mechanism to prevent this,
so Story 0010 must define selectivity criteria and likely a candidate lifecycle.

### Feeding scope must stay below full workspace scanning

Story 0011 already reserves ponctual multi-project scanning. Story 0010 should
focus on the steady-state feeding architecture and the contract between source
artifacts, candidate notes, and curated notes rather than on broad discovery
across all repositories.

### DevLog provider context remains optional

Attempting DevLog context retrieval for this analysis returned:

```text
DEVLOG_CONTEXT_ERROR: DevLog returned HTTP 404. Repository Analysis continues without DevLog.
```

This is consistent with the existing fallback contract. The repository analysis
therefore relies on direct repository evidence.

---

## Risks

### Silent curation drift

If candidate generation writes directly into curated notes, the system will
blur the line between proposal and accepted transverse knowledge.

### Candidate sprawl

If every report, ADR, or Story generates independent candidates mechanically,
the repository may create a pipeline that is fluid in volume but poor in
signal.

### Provenance thinning

If a candidate or curated note compresses too much source context without
strong backlinks, trust in the vault will degrade.

### Ownership confusion with Story 0011

If Story 0010 designs a feeding pipeline that already includes cross-repository
discovery and extraction, Story 0011 loses its distinct tactical scope.

### Over-coupling to current note parser

If the feeding design assumes the exact current curated note shape as the only
possible intermediate state, it may make future candidate workflows too rigid.

---

## Relevant Files and Evidence

Primary evidence reviewed:

* `stories/0010-fluid-obsidian-knowledge-feeding/story.md`
* `stories/0009-obsidian-transverse-memory-integration/engineering-report.md`
* `docs/adr/ADR-001-engineering-artifacts.md`
* `docs/adr/ADR-002-transverse-memory-boundary.md`
* `docs/references/obsidian-transverse-memory.md`
* `docs/templates/obsidian-transverse-note.md`
* `transverse-memory/scripts/vault-catalog.mjs`
* `stories/0011-workspace-vault-candidate-extraction/story.md`

Most relevant repository conclusions:

* Story 0009 delivered the transverse-memory destination contract.
* Story 0010 must define the ingestion and promotion contract.
* Story 0011 should remain separate as a ponctual extraction/bootstrap concern.

---

## Recommendation

Ready for planning.

Repository Analysis completed.

Human approval required before Implementation Planning.

Awaiting explicit human approval.
