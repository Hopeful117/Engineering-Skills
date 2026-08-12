# Implementation Plan

## Overview

Implement Story 0013 by integrating the curated Obsidian vault into the
`engineering-story` workflow as:

* a selective transverse-memory input during Repository Analysis;
* a proposal-only knowledge-update outcome recorded by later workflow stages.

The implementation should improve workflow discipline and memory continuity
without creating a new memory runtime or weakening the authority model already
established across DevLog, workflow artifacts, and the vault.

The safest implementation shape is expected to be mostly workflow-contract and
artifact-contract work, not a large new execution subsystem.

## Planned Changes

### 1. Add an explicit vault-read contract to Repository Analysis

Extend `engineering-story/SKILL.md` and the Repository Analysis prompt so the
workflow may selectively consult the curated vault during Repository Analysis.

The contract should define:

* when vault consultation is appropriate;
* when it is unnecessary;
* how vault context relates to Story, repository evidence, accepted ADRs, and
  DevLog context;
* the rule that vault notes are transverse guidance, not authoritative
  project-state truth.

The workflow should avoid loading the vault indiscriminately.

Vault consultation should be:

* selective;
* relevance-driven;
* explicitly justified when used.

### 2. Define source-of-truth precedence explicitly

Add a formal precedence rule to the workflow contract and prompts.

At minimum, the plan should make explicit that:

* Story, repository evidence, accepted repository ADRs, and DevLog project
  context outrank vault notes for project-specific truth;
* vault notes may help with:
  * transverse concepts;
  * cross-project patterns;
  * workflow guidance;
  * AI/governance principles;
  * knowledge-engineering principles;
* vault notes must not override repository-specific facts.

This is the main defense against memory-source ambiguity.

### 3. Add a vault-outcome section to Implementation Report

Extend the implementation artifact contract so the Implementation Report must
record the vault outcome for the Story.

The section should include a small explicit vocabulary such as:

* vault consulted / not consulted;
* vault update outcome:
  * none;
  * new candidate suggested;
  * enrich-existing suggested;
  * deferred;
* rationale;
* source artifact provenance;
* target curated note when enrichment is suggested.

The output must remain proposal-only.

This section should document the workflow outcome even when no candidate update
is appropriate.

### 4. Make Code Review verify vault-outcome appropriateness

Extend the Code Review prompt and expectations so review explicitly evaluates:

* whether vault consultation during Repository Analysis was appropriate;
* whether the Implementation Report's vault outcome is justified;
* whether the proposed candidate action respects the authority model and
  proposal-only boundary;
* whether a vault update was missed, overstated, or inappropriately suggested.

This keeps vault participation reviewable instead of silently accepted.

### 5. Make Engineering Report summarize the final vault outcome

Extend the Engineering Report prompt and expectations so the final report
summarizes:

* whether the vault informed the Story;
* whether the Story produced a vault candidate suggestion;
* whether the proposed action was:
  * none;
  * new candidate;
  * enrich-existing;
  * deferred.

The Engineering Report should summarize the outcome.

It should not perform curation itself.

### 6. Add a minimal vault reference for workflow usage

If existing transverse-memory references are insufficiently workflow-oriented,
add or extend a small repository-owned reference that explains:

* how Engineering Story should consult the vault;
* how to interpret vault notes relative to repository truth;
* how vault-outcome reporting should be framed in workflow artifacts.

The reference should remain small and operational.

### 7. Reuse existing vault and candidate helpers instead of building a new subsystem

The first implementation should favor reuse of:

* `transverse-memory/scripts/vault-catalog.mjs`
* `transverse-memory/scripts/candidate-note.mjs`

If code changes are needed beyond prompts and workflow instructions, they
should stay minimal and deterministic.

The Story should not introduce:

* background synchronization;
* automatic curated-note publication;
* a new orchestration daemon;
* hidden vault state.

### 8. Validate the integration as workflow behavior, not just code behavior

Validation should confirm both the contract and the workflow outcome shape.

The implementation should verify:

* Repository Analysis now has an explicit vault-read rule;
* Implementation Report includes explicit vault-outcome recording;
* Code Review checks the vault outcome;
* Engineering Report summarizes the vault outcome;
* authority precedence is explicit and unchanged;
* no implementation path silently mutates curated notes.

## Files to Modify

Expected primary modifications:

* `engineering-story/SKILL.md`
* `engineering-story/prompts/repository-analysis.md`
* `engineering-story/prompts/implementation.md`
* `engineering-story/prompts/code-review.md`
* `engineering-story/prompts/engineering-report.md`

Likely documentation updates:

* `docs/references/obsidian-transverse-memory.md`
  or
* a new small workflow-oriented vault reference if the existing reference would
  become too overloaded.

## Files Not Expected to Change

The following should remain unchanged unless implementation reveals a concrete
gap:

* DevLog lifecycle scripts
* workflow-gate plugin
* candidate-note markdown contract
* vault templates
* workspace bootstrap extractor behavior

## Sequencing

1. Update the workflow contract in `engineering-story/SKILL.md`.
2. Update Repository Analysis prompt for selective vault consultation and
   precedence rules.
3. Update Implementation prompt with a vault-outcome section.
4. Update Code Review prompt to review vault usage and vault-outcome
   appropriateness.
5. Update Engineering Report prompt to summarize the final vault outcome.
6. Add or update a lightweight workflow-oriented vault reference if needed.
7. Run validation on the modified workflow assets and summarize the resulting
   contract in the Implementation Report.

## Validation

Manual / repository validation should include at minimum:

* inspection of the modified `engineering-story` workflow contract;
* verification that the prompt set consistently reflects the same vault
  authority and outcome model;
* `git diff --check`

If implementation introduces or updates any executable helper, run the
corresponding automated tests as well.

Expected evidence:

* vault read-side participation is explicitly defined at Repository Analysis;
* vault write-side participation remains proposal-only;
* workflow artifacts record vault outcomes explicitly;
* no prompt or contract text implies that vault notes outrank repository truth;
* no path silently publishes curated vault notes.

## Risks and Controls

### Risk: Workflow bloat

Control:

* keep the vault integration narrow and stage-specific.

### Risk: Source-of-truth confusion

Control:

* define precedence explicitly in both the workflow contract and prompts.

### Risk: Accidental curation drift

Control:

* keep all write-side outcomes proposal-only and reviewable.

### Risk: Prompt inconsistency across stages

Control:

* modify all affected prompts together and validate them as one workflow
  contract.

## Completion Criteria

The Story is complete when:

* the workflow explicitly defines where the vault is read;
* the workflow explicitly defines where proposal-only vault outcomes are
  recorded;
* prompts and workflow contract preserve the DevLog / repository / vault
  authority boundaries;
* the final workflow artifacts have a coherent vault-related outcome model;
* repository validation succeeds.
