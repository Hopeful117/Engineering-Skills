# Repository Analysis

## Story Understanding

Story 0013 asks for the first safe integration of the curated Obsidian vault
into the `engineering-story` workflow.

The question is no longer whether the vault should exist.

That question was answered by Stories 0009 through 0012.

The question is now:

* where the vault is read during workflow execution;
* where candidate vault updates may be produced;
* how the workflow records vault-related outcomes;
* how to do all of this without weakening DevLog authority, human approval, or
  workflow determinism.

Requested outcomes:

* define the read-side position of the vault in the workflow;
* define the write-side proposal points for vault candidates;
* preserve authority boundaries across DevLog, workflow artifacts, and curated
  transverse memory;
* identify the smallest implementation shape required in `engineering-story`;
* implement that integration if justified by the approved plan.

Explicit non-goals:

* changing DevLog into a transverse-memory system;
* granting the vault any workflow-state authority;
* silent curation or automatic publication into curated notes;
* broad semantic retrieval or memory federation infrastructure unless later
  justified.

---

## Repository Summary

The relevant repository remains `Engineering-Skills`.

Its current role is not to become a memory platform.

Its role is to orchestrate engineering workflow and define the contracts
through which memory systems participate safely.

The vault-related baseline is now:

* Story 0009
  * defined the vault as curated transverse memory;
  * established the memory-layer boundary through ADR-002;
  * introduced the read-side vault contract and cataloging.
* Story 0010
  * defined the `source -> candidate -> curated` feeding lifecycle;
  * introduced proposal-only candidate-note semantics.
* Story 0011
  * introduced ponctual workspace extraction for bootstrap/discovery.
* Story 0012
  * hardened extraction quality so the bootstrap output is now credible enough
    for real curation.

Separately, the real vault now exists and contains curated notes across:

* philosophy;
* quality;
* workflow;
* AI engineering;
* knowledge engineering.

This means Story 0013 is the first moment where the vault becomes an actual
workflow participant instead of a merely modeled future surface.

---

## Current Vault State

The current vault is stored at:

* `/home/ludo/Bureau/workspace/dev-tools/obsidian/Engineering Vault`

It currently contains a coherent curated corpus with notes such as:

* `Engineering Workflow`
* `Deterministic Workflow State Control`
* `Engineering Artifacts as Workflow Records`
* `AI Engineering Standard`
* `AI Proposal and Knowledge Promotion Workflow`
* `Deterministic Analysis and AI Interpretation`
* `Deterministic Construction of Analysis Context`
* `Human Validation Workflow`
* `Knowledge Evolution Principles`
* `Knowledge First Architecture`
* `Knowledge Layer Separation`
* `Project Source Model`
* `Transverse Memory Boundary`
* `Fluid Knowledge Feeding Pipeline`

The vault is now sufficiently populated that:

* Repository Analysis can benefit from selective consultation of transverse
  knowledge already curated there;
* the workflow can meaningfully record whether a completed Story suggests a new
  candidate note or an enrichment of an existing note;
* the vault should no longer be treated as a hypothetical empty destination.

---

## Affected Modules

### `engineering-story/SKILL.md`

This is the primary workflow contract.

Why involved:

* Story 0013 is fundamentally about workflow placement and authority;
* if the vault is to become an explicit participant, the orchestration
  contract must define when it is consulted and when it is not;
* any write-side proposal step must be introduced here with clear boundaries.

Current responsibility:

* owns workflow sequencing;
* owns Human Approval Gate semantics;
* integrates DevLog lifecycle synchronization;
* does not currently define any vault interaction point.

### Workflow prompts and artifact expectations

Relevant surfaces are likely:

* Repository Analysis expectations;
* Implementation Report expectations;
* Code Review expectations;
* Engineering Report expectations.

Why involved:

* vault consultation and candidate-update outcomes need to be visible in
  persisted workflow artifacts, not only in conversation;
* Story 0013 explicitly asks that vault usage or non-usage be recorded.

Current responsibility:

* prompts define stage-specific artifact content, but currently without any
  first-class vault section or outcome.

### `transverse-memory/scripts/vault-catalog.mjs`

Read-side vault adapter.

Why involved:

* if Repository Analysis is allowed to consult the vault, it needs a
  deterministic read-side mechanism;
* this script already provides the safest current read contract.

Current responsibility:

* scans and validates curated vault notes;
* exposes note metadata and links;
* performs no candidate generation or curation.

### `transverse-memory/scripts/candidate-note.mjs`

Proposal-only candidate generator.

Why involved:

* if the workflow is allowed to produce candidate vault updates, the existing
  candidate-note contract is the natural write-side target;
* Story 0013 should reuse proposal-only semantics rather than inventing a new
  format.

Current responsibility:

* validates candidate payloads;
* emits proposal-only candidate markdown;
* does not define workflow trigger points.

### `transverse-memory/scripts/workspace-vault-extract.mjs`

Bootstrap/discovery extractor.

Why involved:

* Story 0013 should remain clearly distinct from bootstrap discovery;
* however, it may reuse the same vocabulary for `new`, `enrich-existing`,
  `duplicate`, and `skip`.

Current responsibility:

* scans repositories ponctually;
* compares outputs against the current vault;
* emits proposal-only candidate batches.

### DevLog integration

Relevant surfaces:

* `engineering-story/scripts/devlog-context.mjs`
* `engineering-story/scripts/devlog-story.mjs`
* TOOLS.md repository mapping

Why involved:

* Story 0013 must define precedence between DevLog project memory and vault
  transverse memory;
* the vault must not become a competing source of project state.

Current responsibility:

* DevLog provides structured project-memory context and lifecycle sync;
* no vault-precedence rule is currently formalized in workflow assets.

---

## Existing Behavior

### What already exists

1. The vault has a clear role.

   ADR-002 and the vault notes now establish that the vault owns curated
   cross-project transverse knowledge.

2. Candidate-note semantics exist.

   Story 0010 already created the proposal-only contract:

   * source artifact
   * candidate note
   * curated note

3. Bootstrap extraction exists.

   Stories 0011 and 0012 created and hardened the ponctual extraction path for
   workspace bootstrap and discovery.

4. Workflow artifacts remain first-class records.

   ADR-001 already requires persisted artifacts between workflow stages.

5. Workflow orchestration is strict.

   `engineering-story` owns stage order, approval gates, and DevLog lifecycle
   integration.

### What is missing

The following behavior required by Story 0013 does not yet exist:

* no explicit vault consultation point in Repository Analysis;
* no rule stating whether the vault is mandatory, optional, or selective
  context;
* no precedence rule between:
  * Story;
  * repository evidence;
  * ADRs;
  * DevLog context;
  * vault context;
* no workflow-defined point where vault candidate updates are proposed after a
  Story completes;
* no explicit vault-related outcome recorded in Implementation Report or
  Engineering Report;
* no standardized “vault action” vocabulary such as:
  * consulted / not consulted;
  * candidate suggested / no candidate suggested;
  * enrichment suggested / new note suggested / deferred.

### What must remain unchanged

The following existing behavior must remain intact:

* DevLog remains authoritative for project memory;
* the vault remains curated transverse memory;
* the vault does not own workflow state or approvals;
* candidate generation remains proposal-only unless a separate human curation
  step occurs;
* workflow sequencing remains entirely under `engineering-story`.

---

## Integration Design Space

### Read-side integration options

#### Option A — Consult the vault during Repository Analysis only

Meaning:

* Repository Analysis may selectively read vault notes when the Story appears
  related to existing transverse concepts, workflow patterns, quality
  standards, AI governance, or knowledge-engineering principles.

Pros:

* smallest surface area;
* easiest to reason about;
* keeps vault context close to where architectural understanding is built.

Cons:

* later stages rely on Repository Analysis to propagate vault insights.

#### Option B — Consult the vault in every stage

Pros:

* maximum availability.

Cons:

* likely context inflation;
* weakens discipline;
* encourages repeated, inconsistent use of the vault.

#### Option C — Consult the vault only after implementation

Pros:

* limits influence on implementation.

Cons:

* misses the main value of curated transverse guidance during understanding and
  planning.

Assessment:

* Option A is the strongest fit for Story 0013.

### Write-side integration options

#### Option A — Candidate suggestion recorded in Implementation Report

Meaning:

* after implementation and documentation reconciliation, the workflow records
  whether the completed Story suggests:
  * no vault action;
  * a new candidate note;
  * an enrichment of an existing curated note.

Pros:

* aligns with implementation outcomes;
* keeps the decision close to the new evidence produced by the Story;
* still lets Code Review assess whether the suggestion is appropriate.

Cons:

* may need explicit review wording.

#### Option B — Candidate suggestion recorded only in Engineering Report

Pros:

* final summary is clean.

Cons:

* too late;
* Code Review cannot verify the appropriateness of the proposed vault action as
  part of implementation correctness.

#### Option C — Direct vault mutation during implementation

Rejected:

* violates proposal-only discipline;
* collapses workflow execution and curation.

Assessment:

* Option A is the best fit, with Code Review verifying the vault outcome and
  Engineering Report summarizing it.

---

## Recommended Direction

The safest first integration is:

1. Read-side
   * allow selective vault consultation during Repository Analysis;
   * treat the vault as optional transverse context, never as authoritative
     project state;
   * define a precedence rule:
     Story + repository evidence + accepted ADRs + DevLog project context
     outrank vault notes for project-specific truth.

2. Write-side
   * add a vault-outcome section to Implementation Report:
     * consulted or not;
     * candidate action:
       * none
       * new candidate suggested
       * enrich-existing suggested
       * deferred
     * rationale and provenance
   * require Code Review to verify whether that vault outcome is appropriate;
   * require Engineering Report to summarize the final vault outcome.

3. Technical shape
   * do not introduce automatic curated-note publication;
   * reuse existing deterministic read-side and candidate-note assets;
   * keep the first implementation mostly in `engineering-story` contract and
     prompt/report expectations rather than building a large new runtime.

---

## Risks

### Context inflation

If Repository Analysis consults the vault indiscriminately, the workflow may
import noise instead of signal.

Mitigation:

* make vault consultation selective and explicitly justified.

### Authority confusion

If prompts do not clearly define precedence, agents may treat vault notes as
project-state authority.

Mitigation:

* define precedence explicitly in workflow instructions and artifacts.

### Hidden vault decisions

If vault outcomes are not written into artifacts, the workflow may revert to
ad hoc behavior.

Mitigation:

* add explicit vault-outcome sections to persisted reports.

### Premature automation

If the Story introduces direct vault mutation, curation boundaries will erode.

Mitigation:

* keep all write-side behavior proposal-only.

---

## Validation Strategy

If implementation is approved, validation should confirm:

* Repository Analysis contract includes explicit vault consultation rules;
* Implementation Report includes explicit vault-outcome recording;
* Code Review verifies vault-outcome appropriateness;
* Engineering Report summarizes vault-outcome status;
* existing workflow approval semantics are unchanged;
* no implementation path silently writes curated notes;
* relevant repository tests or checks pass for modified scripts/prompts.

---

## Conclusion

Story 0013 should not build a new memory platform.

It should define the first disciplined workflow contract between:

* project memory;
* engineering artifacts;
* curated transverse memory.

The strongest first step is a narrow integration:

* read the vault selectively during Repository Analysis;
* record vault candidate outcomes during and after implementation;
* preserve strict authority and curation boundaries throughout.
