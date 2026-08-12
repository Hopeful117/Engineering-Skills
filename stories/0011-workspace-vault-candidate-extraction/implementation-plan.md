# Implementation Plan

## Overview

Implement Story 0011 by defining and delivering the first punctual
workspace-scan capability for extracting useful transverse-memory candidates
from existing repositories and comparing them against the current Obsidian
Engineering Vault.

The implementation should:

* preserve the existing architecture where the vault remains curated transverse
  memory and candidate extraction remains proposal-only;
* use the current vault contents as an explicit context input so the scan can
  avoid obvious duplicates and suggest enrichments when appropriate;
* define a selective bootstrap scan across chosen repositories and artifact
  classes instead of broad continuous ingestion;
* produce candidate-note-aligned output with provenance, source traceability,
  and merge/deduplication hints;
* prefer a small script/runbook over a permanent reusable skill unless the
  implementation evidence proves a skill is necessary.

This keeps Story 0011 aligned with the earlier memory stories while solving the
new problem identified in Repository Analysis: the ecosystem now has a curated
vault, a candidate-note contract, and a feeding lifecycle, but it still lacks a
practical bootstrap mechanism for surfacing useful existing knowledge across the
workspace.

## Planned Changes

### 1. Formalize the ponctual extraction lifecycle

Define the repository-level contract for bootstrap extraction as a ponctual,
manual discovery workflow rather than an always-on ingestion system.

The lifecycle should establish:

* selected workspace repositories and note sources are scanned on demand;
* high-value source artifacts are identified and assessed for transverse value;
* extraction produces candidate-note-aligned proposals or proposal batches;
* the current vault is consulted to detect likely duplicates, overlaps, or
  enrichment opportunities;
* the output remains proposal-only and awaits later curation.

Relevant constraint:

* this lifecycle must complement ADR-002 and ADR-003 rather than bypassing the
  curated-vault boundary or Story 0010 feeding semantics.

### 2. Define scan targets and source eligibility for bootstrap mode

Specify which repositories and artifact classes are eligible scan targets for
the ponctual extraction workflow.

The plan should distinguish:

* likely eligible repositories:
  * Engineering-Skills;
  * DevLog AI;
  * other selected workspace repositories explicitly chosen for a run;
* likely eligible artifact types:
  * Engineering Reports;
  * Code Review Reports with reusable lessons;
  * ADRs;
  * stable project documentation;
  * curated project notes;
  * selected validated DevLog-derived knowledge when available through approved
    repository artifacts or exported project context;
* lower-value or ineligible material by default:
  * every markdown file indiscriminately;
  * transient implementation notes;
  * local operational memory;
  * files already acting as vault notes.

Relevant constraint:

* Story 0011 should define a selective scan policy, not a brute-force “all
  files are candidates” heuristic.

### 3. Define what counts as a useful vault candidate

Add an explicit extraction policy for distinguishing useful transverse
knowledge from raw project material.

The policy should require candidates to demonstrate one or more of:

* cross-project relevance;
* reusable concept or pattern value;
* durable engineering lesson;
* glossary or domain-language usefulness beyond one repository;
* concrete enrichment of an existing curated vault topic.

The policy should reject or downgrade material that is:

* purely project-local;
* too mechanical or implementation-specific;
* already covered by current curated vault content without meaningful new
  evidence;
* too weakly sourced to justify proposal generation.

Relevant constraint:

* Story 0011 should produce fewer, higher-value candidates rather than large
  noisy batches.

### 4. Define the batch extraction output model

Specify the output model for a ponctual extraction run.

The model should likely include:

* repository and artifact source identity;
* candidate-note-aligned payload or markdown draft;
* provenance back to repository, file, and source artifact;
* extraction reason or transverse rationale;
* candidate type such as new concept, enrichment, merge suggestion, or glossary
  candidate;
* vault-comparison hint indicating:
  * likely new note;
  * likely update to existing curated note;
  * likely duplicate / skip.

Relevant constraint:

* the output should align with Story 0010 candidate-note semantics rather than
  inventing a parallel proposal format.

### 5. Incorporate the current vault as a deduplication and enrichment context

Extend the design so ponctual extraction explicitly inspects the existing vault
before suggesting candidate additions.

The implementation should use the current vault to:

* identify already-covered foundational topics;
* detect obvious duplicate candidates;
* suggest enrichment when a repository artifact adds meaningful detail to an
  existing curated note;
* preserve the distinction between “new candidate” and “candidate updating an
  existing curated topic.”

Relevant constraint:

* vault comparison should remain heuristic and reviewable, not an automatic
  canonical merge operation.

### 6. Provide a runbook and operator-controlled trigger model

Document how the ponctual scan is executed manually and safely.

The runbook should define:

* how the operator chooses repositories or paths to scan;
* how the existing vault path is provided and inspected;
* how output is reviewed before any curation action;
* how a scan can be repeated without forcing duplicate publication;
* how to interpret duplicate, enrich, skip, or uncertain results.

Relevant constraint:

* this must remain an operator-triggered workflow, not a background service or
  mandatory reusable skill.

### 7. Introduce a minimal punctual extraction script

Create the smallest technical component needed to make the bootstrap extraction
model concrete and testable.

The most likely shape is a dependency-free Node.js script that:

* accepts one or more repository roots and the vault root as inputs;
* scans selected artifact classes only;
* reads current vault notes through the existing or shared note-reading logic;
* emits a structured batch of candidate proposals or candidate-note payloads;
* marks each result as new, enrich-existing, duplicate, skip, or ineligible;
* never writes directly into curated vault notes.

Relevant constraint:

* the script should support ponctual workspace extraction, not become a
  permanent orchestration layer.

### 8. Preserve separation from Story 0010 and reusable-skill escalation

Document explicitly why Story 0011 is not the same as Story 0010.

Story 0011 should cover:

* bootstrap/discovery across selected repositories;
* batch candidate extraction;
* vault-aware comparison and deduplication hints;
* manual operator control.

Story 0010 continues to own:

* the steady-state feeding lifecycle;
* source-to-candidate promotion semantics;
* proposal-only candidate-note generation rules.

The plan should also establish that a dedicated reusable skill is optional and
should only be introduced if the ponctual script/runbook proves insufficient.

Relevant constraint:

* avoid over-abstracting before the practical extraction pattern is validated.

### 9. Validate the ponctual extraction boundary end to end

Validation should confirm both conceptual consistency and practical usefulness.

The implementation should verify:

* extraction output aligns with candidate-note semantics;
* existing vault notes influence duplicate/enrichment hints;
* provenance is preserved for every proposed candidate;
* clearly ineligible inputs are skipped or flagged;
* no implementation path writes into curated vault notes;
* the final shape remains script/runbook-oriented rather than requiring a full
  reusable skill.

## Files to Modify

* `docs/references/obsidian-transverse-memory.md` — extend the reference with
  punctual extraction guidance, vault-aware comparison expectations, and manual
  operator workflow.

## Files to Create

* `docs/adr/ADR-004-punctual-workspace-extraction.md` — architectural decision
  for ponctual multi-repository extraction, vault-aware deduplication hints, and
  operator-controlled execution.
* `docs/references/workspace-vault-extraction.md` — runbook/reference for scan
  targets, operator inputs, output interpretation, and repeatable manual use.
* `transverse-memory/scripts/workspace-vault-extract.mjs` — minimal dependency-
  free ponctual extraction script.
* `transverse-memory/scripts/workspace-vault-extract.test.mjs` — automated tests
  for the extraction script.

If implementation reveals that a tiny shared helper is needed to reuse curated
vault note parsing safely across scripts, it may be added only if it remains
strictly within the approved extraction scope.

## Dependencies

### Internal dependencies

* `docs/adr/ADR-002-transverse-memory-boundary.md` remains authoritative for
  curated-vault ownership.
* `docs/adr/ADR-003-transverse-memory-feeding.md` remains authoritative for
  candidate-note semantics and proposal-only feeding.
* `docs/references/obsidian-transverse-memory.md` remains the main transverse-
  memory reference and should be extended rather than contradicted.
* `docs/templates/obsidian-transverse-candidate-note.md` remains the canonical
  candidate-note target shape.
* `transverse-memory/scripts/vault-catalog.mjs` remains the baseline read-side
  vault contract.
* `transverse-memory/scripts/candidate-note.mjs` remains the steady-state
  proposal generator that this Story should align with.

### External dependencies

* Node.js runtime already used in the Engineering-Skills environment.
* The existing local vault at `/home/ludo/Bureau/workspace/dev-tools/obsidian/Engineering Vault`
  for practical validation only.
* Selected local workspace repositories for practical validation.

No DevLog schema change, Obsidian plugin, remote API, database, or paid service
is required.

### Ordering dependencies

1. Define the ponctual extraction boundary and operator model first.
2. Define scan target policy and candidate batch output contract.
3. Extend the transverse-memory reference and add the runbook.
4. Implement the minimal extraction script against the candidate-note-aligned
   output model.
5. Validate extraction usefulness against the current vault content.

## Test Plan

### Documentation and boundary validation

Review the new ADR, updated reference, and runbook together to confirm:

* extraction is ponctual and operator-controlled;
* output remains proposal-only;
* vault-aware duplicate/enrichment hints are explicit;
* Story 0010 steady-state feeding remains separate;
* no mandatory reusable skill is assumed.

### Script tests

Run:

```text
node --test transverse-memory/scripts/workspace-vault-extract.test.mjs
```

Tests should verify:

* eligible artifact inputs produce candidate-aligned output;
* existing vault notes influence new/enrich/duplicate classification;
* required provenance is preserved in extracted results;
* ineligible or low-value inputs are skipped or marked accordingly;
* no script path writes into curated vault notes.

### Repository checks

Expected targeted validation commands:

```text
rg -n "punctual|candidate|duplicate|enrich|vault|operator|proposal-only|ineligible" docs/adr docs/references transverse-memory
```

```text
git diff -- docs/adr docs/references transverse-memory stories/0011-workspace-vault-candidate-extraction
```

```text
rg -n "/home/ludo|localhost|93441821|f3d56247" docs/adr docs/references transverse-memory
```

### Practical local validation

Run the extraction script against a selected small workspace scope plus the
current Engineering Vault and verify that:

* the output identifies plausible candidate additions or enrichments;
* clearly duplicate foundational topics are downgraded or flagged;
* provenance points back to repository and source artifact paths;
* no note in the curated vault is modified.

### Expected success conditions

* the repository defines a punctual extraction boundary;
* a runbook exists for operator-controlled workspace scanning;
* a minimal extraction script exists and is tested;
* the output aligns with candidate-note semantics from Story 0010;
* existing vault content is considered before suggesting additions;
* the final diff stays within extraction/bootstrap scope and does not create a
  mandatory reusable skill.

## Risks

### Duplicate sensitivity stays too weak

Risk:
A bootstrap scan could still suggest many redundant candidates if comparison to
current vault content is too shallow.

Mitigation:
Require explicit duplicate/enrichment hints and practical validation against the
current vault.

### Extraction becomes an implicit permanent workflow

Risk:
A ponctual script could drift into a quasi-continuous ingestion system.

Mitigation:
Keep the runbook operator-triggered and avoid background or always-on behavior.

### Candidate output drifts from Story 0010 semantics

Risk:
The batch extraction path could invent another proposal format.

Mitigation:
Align output fields and statuses with the candidate-note contract introduced in
Story 0010.

### Over-abstraction through premature skill creation

Risk:
Building a dedicated skill now could add more structure than the current use
case warrants.

Mitigation:
Prefer a script and runbook first, and treat skill creation as follow-up only if
repeated practical use justifies it.

## Validation Checklist

- [ ] The repository defines a ponctual, operator-controlled extraction model.
- [ ] Scan target eligibility rules exist for repositories and artifact types.
- [ ] The extraction output aligns with candidate-note semantics.
- [ ] Provenance is preserved back to repository, file, and source artifact.
- [ ] Existing vault notes are considered for duplicate/enrichment hints.
- [ ] A runbook exists for manual execution and interpretation.
- [ ] A minimal extraction script exists in the repository.
- [ ] Automated tests cover candidate-aligned output, provenance, duplicate
      hints, and non-mutation of curated notes.
- [ ] No implementation path writes into curated vault notes.
- [ ] No mandatory reusable skill is introduced by this Story.
- [ ] The final diff stays scoped to bootstrap extraction rather than
      continuous feeding.

## Recommendation

Ready for implementation

## Approval Required

Implementation Plan completed.

Human approval required before Implementation.

Awaiting explicit human approval.
