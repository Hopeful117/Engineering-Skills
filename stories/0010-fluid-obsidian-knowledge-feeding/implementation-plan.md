# Implementation Plan

## Overview

Implement Story 0010 by defining the first safe feeding architecture for the
Obsidian transverse-memory vault on top of the read-side boundary created in
Story 0009.

The implementation should:

* preserve the existing ownership split where source artifacts and DevLog stay
  authoritative and the vault remains curated transverse memory;
* introduce an explicit intermediate **candidate** layer between raw source
  artifacts and curated vault notes;
* define which upstream sources may generate candidates and under what rules;
* define how automation may propose candidate creation or update without
  silently curating or publishing knowledge;
* provide the smallest technical and documentation surface needed to make a
  first fluid feeding workflow executable and reviewable.

This keeps the next increment below full sync or broad discovery complexity
while solving the main gap identified in Repository Analysis: the ecosystem can
now read curated transverse notes, but it still has no principled way to feed
new knowledge into them.

## Planned Changes

### 1. Formalize the feeding lifecycle between source, candidate, and curated note

Create a repository-level contract for the transverse-memory feeding lifecycle.

The contract should establish three distinct states:

* **source artifact**:
  * authoritative project-memory or workflow-memory input such as Story,
    Engineering Report, Code Review, ADR, or validated DevLog knowledge;
* **candidate note**:
  * a machine-assisted or workflow-assisted proposal derived from one or more
    authoritative sources;
* **curated note**:
  * the canonical transverse-memory note accepted into the vault.

The contract must clarify that:

* source artifacts remain authoritative for their original claims;
* candidate notes are proposals, not accepted transverse knowledge;
* curated notes are the only canonical vault notes;
* automation may move information from source to candidate, but not from
  candidate to curated without explicit human curation.

Relevant constraint:

* this lifecycle must complement ADR-001 and ADR-002 rather than weaken either
  artifact authority or vault curation boundaries.

### 2. Define the candidate-note contract

Add a concrete repository-owned contract for candidate notes as a distinct
object from curated notes.

The candidate contract should cover:

* required metadata, for example:
  * stable id or slug;
  * status such as `proposed`, `needs-curation`, `superseded`, or equivalent;
  * candidate source type(s);
  * source references and provenance;
  * timestamps;
  * candidate rationale or extraction reason;
  * optional target curated note reference when a candidate amends an existing
    concept rather than introducing a new one;
* expected content structure:
  * concise synthesis of the proposed cross-project knowledge;
  * explicit reason why it is transverse rather than project-local;
  * links back to authoritative sources;
  * open curation questions or merge suggestions when relevant;
* rules separating candidate notes from curated notes:
  * candidate notes may be incomplete or tentative;
  * candidate notes must not present themselves as canonical knowledge;
  * candidate notes must be safely reviewable before publication.

Relevant constraint:

* the candidate contract should be close enough to the curated-note contract to
  support later promotion, but distinct enough that automation does not write
  directly into canonical notes.

### 3. Define source eligibility and anti-flooding rules

Specify which sources are eligible to generate transverse-memory candidates and
which are not.

The rules should distinguish:

* high-value upstream sources likely to be eligible:
  * Engineering Reports;
  * Code Review Reports when they contain reusable lessons;
  * ADRs;
  * validated cross-project patterns;
  * selected DevLog project knowledge when it already reflects durable,
    project-validated understanding;
* lower-value or non-eligible raw inputs by default:
  * every Story artifact indiscriminately;
  * transient implementation details;
  * purely project-local state;
  * personal workspace memory.

The plan should also require anti-flooding rules such as:

* source-type eligibility does not imply automatic candidate creation;
* a candidate must satisfy cross-project relevance and provenance thresholds;
* duplicate or near-duplicate candidates should be merged, linked, or rejected
  rather than accumulated mechanically.

Relevant constraint:

* Story 0010 should define the policy and contract, not implement broad
  repository scanning or heavy ranking infrastructure.

### 4. Define automation-versus-curation responsibilities

Document the safe boundary between automation and human curation.

The feeding model should establish that automation may:

* detect eligible source artifacts;
* extract proposed candidate content;
* create or update candidate notes in a proposal space;
* suggest merges into existing concepts when evidence indicates overlap;
* preserve provenance and backlinks automatically.

Automation must not:

* silently publish curated notes;
* overwrite curated notes without explicit human curation;
* erase provenance;
* convert project-local facts into transverse claims without a defined policy;
* act as a workflow or approval authority.

Human curation remains responsible for:

* accepting a candidate into curated transverse memory;
* rejecting low-value or duplicate candidates;
* consolidating overlapping concepts;
* deciding whether a candidate updates an existing note or becomes a new one.

Relevant constraint:

* the plan should make “automation may propose, not curate” operational rather
  than leaving it as a slogan only.

### 5. Extend the transverse-memory reference with feeding guidance

Update the existing Obsidian transverse-memory documentation so it no longer
describes only curated notes and read-side cataloging.

Planned additions:

* feeding lifecycle explanation;
* candidate-note role;
* source eligibility rules;
* provenance and backlink requirements for candidates and curated notes;
* curation workflow expectations;
* trust-model clarification for proposed versus curated content.

Relevant constraint:

* the existing read-side guidance from Story 0009 must remain valid and should
  be extended rather than contradicted.

### 6. Provide candidate-note templates and promotion guidance

Add repository-owned templates and guidance for candidate creation and
promotion.

The implementation should provide:

* a candidate-note template distinct from the curated-note template;
* promotion guidance showing how a candidate becomes a curated note;
* update guidance showing how a new candidate may point to an existing curated
  note for merge or amendment rather than creating duplicate canonical notes.

Relevant constraint:

* the templates should stay plain Markdown plus simple metadata so they remain
  readable, tool-independent, and aligned with the current repository style.

### 7. Introduce a minimal feeding-side technical adapter or contract

Create the smallest technical component needed to make the feeding model
concrete and testable.

The most likely shape is a dependency-free Node.js adapter that:

* accepts one or more source artifacts as inputs;
* produces a deterministic candidate-note payload or markdown draft;
* validates required provenance and minimum metadata;
* distinguishes new-candidate creation from proposed updates to an existing
  curated note;
* writes only into a candidate/proposal space or emits content for later write,
  but never mutates curated notes directly.

The final shape may be either:

* a generator that emits deterministic candidate markdown/JSON for review; or
* a narrow contract document plus stub adapter if a fully materialized write
  path would overstep the approved scope.

Relevant constraint:

* Story 0010 should not implement a broad multi-project scan; any execution
  surface must remain focused on the steady-state feeding boundary.

### 8. Preserve separation from Story 0011

Make the distinction between continuous feeding architecture and ponctual
workspace extraction explicit in both documentation and implementation shape.

Story 0010 should cover:

* how known authoritative sources become candidate notes over time;
* how candidate notes are reviewed and promoted;
* how provenance and anti-duplication work in steady state.

Story 0011 should remain responsible for:

* scanning multiple repositories in batch;
* discovering legacy or pre-existing candidate material;
* bootstrap extraction across the workspace.

Relevant constraint:

* no implementation in Story 0010 should require a mandatory reusable scanner
  for the whole workspace.

### 9. Validate the feeding boundary end to end

Validation should confirm both conceptual consistency and minimal executable
behavior.

The implementation should verify:

* the lifecycle `source -> candidate -> curated` is explicit and non-ambiguous;
* candidate notes remain distinct from curated notes;
* provenance is required and preserved;
* anti-flooding and deduplication guidance is explicit;
* any technical adapter cannot write directly into curated notes;
* Story 0011 scope does not leak into the implementation.

## Files to Modify

* `docs/references/obsidian-transverse-memory.md` — extend the vault reference
  with feeding lifecycle, candidate role, provenance, source eligibility, and
  curation guidance.
* `docs/templates/obsidian-transverse-note.md` — refine the curated-note
  template if needed so promotion boundaries and canonical-note expectations
  remain explicit.

## Files to Create

* `docs/adr/ADR-003-transverse-memory-feeding.md` — architectural decision for
  the feeding lifecycle, candidate role, and automation-versus-curation
  boundary.
* `docs/templates/obsidian-transverse-candidate-note.md` — template for
  candidate transverse-memory notes.
* `transverse-memory/scripts/candidate-note.mjs` — minimal deterministic
  adapter or generator for candidate-note drafts.
* `transverse-memory/scripts/candidate-note.test.mjs` — automated tests for the
  feeding-side adapter or generator.

If implementation reveals that one small additional supporting reference is
needed to document promotion or merge semantics clearly, it may be added only
if it remains strictly within the approved feeding scope.

## Dependencies

### Internal dependencies

* `docs/adr/ADR-001-engineering-artifacts.md` remains authoritative for source
  artifact ownership and immutability.
* `docs/adr/ADR-002-transverse-memory-boundary.md` remains authoritative for
  memory-layer ownership.
* `docs/references/obsidian-transverse-memory.md` remains the main transverse-
  memory operational reference and should be extended rather than replaced.
* `transverse-memory/scripts/vault-catalog.mjs` remains the read-side contract
  for curated notes and may inform candidate-to-curated compatibility.
* Story 0011 depends on this feeding boundary and therefore must not be
  partially implemented here.

### External dependencies

* Node.js runtime already used in the Engineering-Skills environment.
* Local filesystem note handling only.

No Obsidian plugin, remote API, DevLog schema change, database, or paid service
is required.

### Ordering dependencies

1. Define the feeding lifecycle and candidate-role boundary first.
2. Define the candidate-note contract and templates.
3. Extend the transverse-memory reference with promotion and curation rules.
4. Implement the minimal candidate adapter/generator against that contract.
5. Validate the boundary and technical safeguards together.

## Test Plan

### Documentation and boundary validation

Review the new ADR, updated reference, and templates together to confirm:

* source artifacts remain authoritative;
* candidate notes are proposals only;
* curated notes remain canonical vault notes;
* automation cannot silently curate;
* Story 0011 scope remains separate.

### Adapter tests

Run:

```text
node --test transverse-memory/scripts/candidate-note.test.mjs
```

Tests should verify:

* eligible source input produces a deterministic candidate draft;
* required provenance is enforced;
* project-local or unsupported inputs fail clearly or are marked ineligible;
* candidate metadata distinguishes proposal status from curated status;
* proposed updates to an existing curated note are represented explicitly;
* no adapter path mutates curated vault notes directly.

### Repository checks

Expected targeted validation commands:

```text
rg -n "candidate|curated|provenance|source artifact|automation may propose|silently curate|eligible" docs/adr docs/references docs/templates transverse-memory
```

```text
git diff -- docs/adr docs/references docs/templates transverse-memory stories/0010-fluid-obsidian-knowledge-feeding
```

```text
rg -n "/home/ludo|localhost|93441821|f3d56247|vault-root" docs/adr docs/references docs/templates transverse-memory
```

### Practical local validation

Validate a small local example where one source artifact is transformed into a
candidate-note draft and confirm that:

* provenance and source references are preserved;
* the output is explicitly non-curated;
* the result is reviewable as a candidate;
* no curated note is modified.

### Expected success conditions

* the repository defines an explicit feeding lifecycle;
* a candidate-note contract and template exist;
* the updated reference explains automation-versus-curation boundaries;
* a minimal deterministic candidate generator or equivalent contract exists and
  is tested;
* the final diff stays within feeding and promotion scope;
* no workspace-scan or automatic publication behavior is introduced.

## Risks

### Candidate notes become a second unmanaged backlog

Risk:
A candidate layer could accumulate stale proposals without clear promotion or
rejection rules.

Mitigation:
Define explicit candidate statuses, promotion rules, and merge/rejection
expectations.

### Automation writes too close to canonical notes

Risk:
A feeding adapter could effectively curate by writing directly into vault notes.

Mitigation:
Keep a hard boundary where automation only emits proposals or writes to a
candidate-only space.

### Eligibility rules stay too vague

Risk:
If the repository only says “high-value sources” without concrete rules, later
feeding will become inconsistent.

Mitigation:
Define explicit eligible source classes and exclusion examples.

### Deduplication is deferred too far

Risk:
Without at least a merge/update model, candidate generation will encourage
fragmentation.

Mitigation:
Require candidate output to distinguish “new concept” from “proposed update to
existing curated note”.

### Scope drift into Story 0011

Risk:
Implementation may start building the workspace bootstrap scanner instead of a
steady-state feeding architecture.

Mitigation:
Constrain Story 0010 to feeding contracts, candidate generation, and promotion
semantics only.

## Validation Checklist

- [ ] The repository defines an explicit `source -> candidate -> curated`
      feeding lifecycle.
- [ ] Source artifacts remain documented as authoritative.
- [ ] Candidate notes are explicitly documented as proposals rather than
      canonical knowledge.
- [ ] Curated notes remain explicitly documented as canonical vault notes.
- [ ] A candidate-note contract exists with metadata and provenance
      expectations.
- [ ] A repository-owned candidate-note template exists.
- [ ] The transverse-memory reference explains source eligibility,
      anti-flooding, and curation boundaries.
- [ ] A minimal deterministic candidate generator or equivalent technical
      contract exists.
- [ ] Automated tests cover provenance enforcement, deterministic output,
      proposal status, and no direct curated-note mutation.
- [ ] No repository file hardcodes personal vault paths or local machine values.
- [ ] No implementation path silently publishes curated notes.
- [ ] The final diff stays scoped to Story 0010 and does not implement Story
      0011 scanning behavior.

## Recommendation

Ready for implementation

## Approval Required

Implementation Plan completed.

Human approval required before Implementation.

Awaiting explicit human approval.
