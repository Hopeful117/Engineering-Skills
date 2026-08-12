# Implementation Plan

## Overview

Reframe Story 0008 around a dedicated quality-validation capability that can be integrated into the Engineering Story pipeline without transferring workflow authority away from `engineering-story`.

The revised strategy is:

* keep `engineering-story` responsible for workflow sequencing, artifact expectations, and human approval semantics;
* introduce a dedicated reusable quality-validation skill contract that decides what quality checks are applicable based on the actual repository structure, enabled toolchain, and affected modules;
* have `engineering-story` require and consume the resulting quality evidence instead of hardcoding a fixed set of expected checks in every case;
* keep `workflow-gate` unchanged so approval state remains separate from quality execution and quality verdicts.

This better satisfies the approved Story because it preserves explicit governance while adding the flexibility to validate different technical stacks without forcing the core workflow to know every concrete test/gate combination in advance.

## Planned Changes

### 1. Define the architecture boundary between workflow orchestration and quality execution

Update the workflow contract so the responsibilities are explicit:

* `engineering-story` owns:
  * when quality validation must happen;
  * what artifact must record the results;
  * what review and approval semantics apply;
  * the rule that technical success never grants approval;
* the new quality-validation skill owns:
  * determining applicable checks from the repository and affected modules;
  * executing or specifying the relevant quality validation set;
  * returning structured evidence about what was run, what was applicable, what passed, what failed, and what was skipped or unavailable;
* `workflow-gate` continues to own only workflow state and Human Approval Gates.

Relevant constraint:

* this boundary must remain deterministic and reviewable; the quality-validation skill may adapt to the stack, but it must not become a second workflow orchestrator.

### 2. Replace the current “fixed expected checks” direction with a quality-validation contract

Instead of encoding a rigid list of expected checks directly into the main workflow prompts, create a reusable contract for quality validation results.

The contract should cover:

* repository context used to determine applicable checks;
* affected modules or surfaces;
* applicable validation categories, for example:
  * compile/build;
  * unit tests;
  * integration tests;
  * e2e tests;
  * lint;
  * format checks;
  * static analysis;
  * coverage gates;
  * SonarQube or equivalent quality-gate systems;
  * representative outcome tests for ranking/allocation behavior;
* per-check outcome:
  * applicable / not applicable;
  * executed / not executed;
  * passed / failed / blocked;
  * evidence produced;
  * reason when skipped, unavailable, or not applicable.

Relevant constraint:

* the contract must stay generic enough for multiple stacks while still being concrete enough to drive Implementation Reports and Code Reviews.

### 3. Create a dedicated `quality-validation` skill specification

Add a reusable skill definition dedicated to quality validation.

The skill should define:

* mission:
  * determine and execute the appropriate quality checks for the current Story based on the project reality;
* inputs:
  * Story scope;
  * approved Repository Analysis;
  * approved Implementation Plan once applicable;
  * repository context;
  * affected modules/files when available;
* outputs:
  * a structured quality-validation result suitable for inclusion or reference from the Implementation Report and Code Review;
* constraints:
  * no approval authority;
  * no workflow-state authority;
  * no scope expansion;
  * no unrelated fixes;
* special handling for ranking/allocation Stories:
  * representative outcome validation must be considered separately from generic mechanical validation.

Relevant constraint:

* this should be a real reusable skill asset, not just scattered wording inside `engineering-story`.

### 4. Update `engineering-story/SKILL.md` to integrate the quality-validation skill

Revise the top-level workflow contract so `engineering-story` delegates quality execution expectations to the new skill while preserving authority.

Planned changes:

* keep the current rule that quality validation is mandatory when applicable;
* replace overly fixed wording with language such as:
  * the workflow must determine applicable quality validation based on the repository and affected stack;
  * when the quality-validation skill is available, it is the preferred mechanism for that determination and execution;
  * the resulting evidence must be recorded in the Implementation Report and assessed in Code Review;
* preserve explicit wording that successful validation, including successful Quality Gates, never grants human approval.

Relevant constraint:

* `engineering-story` must still be usable even if the dedicated skill is unavailable; fallback expectations must remain explicit.

### 5. Update `implementation.md` so Implementation Reports consume structured quality-validation output

Revise the implementation prompt so Implementation Reports no longer assume a mostly fixed validation list.

Planned changes:

* require the Implementation Engineer to record quality validation using the structured contract;
* require explicit indication of:
  * which checks were applicable;
  * which were executed;
  * which passed/failed;
  * what evidence was produced;
  * why something was not applicable or could not be executed;
* require representative outcome-test evidence when the Story affects ranking/allocation behavior;
* allow the quality-validation skill output to be embedded, summarized, or referenced as the authoritative execution evidence.

Relevant constraint:

* the Implementation Report must remain a workflow artifact, not a raw dump of tool output.

### 6. Update `code-review.md` so review verifies applicability and sufficiency of quality validation

Revise the Code Review prompt so review becomes more flexible and more rigorous at the same time.

Planned changes:

* reviewers must assess whether the selected quality checks were appropriate for the repository and affected stack;
* reviewers must distinguish:
  * missing required checks;
  * optional checks;
  * unavailable infrastructure;
  * justified non-applicability;
* reviewers must verify representative outcome validation when the Story changes ranking/allocation behavior;
* reviewers must continue to treat validation success as evidence only, never as approval.

Relevant constraint:

* the prompt must not require reviewers to re-run or re-design the validation pipeline; it must evaluate sufficiency and correctness of the evidence produced.

### 7. Update `engineering-report.md` so final reporting reflects the quality-validation contract

Revise the final reporting prompt so Engineering Reports can summarize adaptive quality validation coherently.

Planned changes:

* summarize the quality-validation strategy actually applied;
* summarize important pass/fail/block outcomes and limitations;
* keep technical results distinct from human approval state;
* preserve explicit reporting when certain checks were not applicable or could not run.

Relevant constraint:

* the final report must remain concise and traceable to upstream artifacts.

### 8. Keep `workflow-gate` unchanged

Do not plan changes to `workflow-gate`.

Its current role remains correct:

* stage progression;
* artifact hash verification;
* approval-state enforcement.

The revised design makes this boundary even more important, because a dedicated quality-validation skill must not be able to:

* move the workflow forward on its own;
* mark approval as granted;
* create new implicit gates.

### 9. Validate the new boundary with focused repository checks

Because the Story changes reusable workflow assets more than product code, validation should focus on consistency and authority boundaries.

The implementation should verify:

* the new skill contract is coherent with `engineering-story`;
* fallback behavior is explicit if the dedicated skill is absent;
* approval language remains unchanged in authority;
* no runtime plugin or CI integration work leaked into this Story unless explicitly justified.

## Files to Modify

* `engineering-story/SKILL.md` — integrate the quality-validation skill boundary and fallback behavior while preserving approval semantics.
* `engineering-story/prompts/implementation.md` — consume structured adaptive quality-validation evidence.
* `engineering-story/prompts/code-review.md` — review applicability and sufficiency of adaptive quality-validation evidence.
* `engineering-story/prompts/engineering-report.md` — summarize adaptive quality validation consistently.

## Files to Create

* `quality-validation/SKILL.md` — new reusable skill definition for adaptive project-aware quality validation.
* supporting assets under `quality-validation/` as needed by the final design, most likely:
  * references describing the validation-result contract;
  * prompts or templates defining the skill’s expected inputs and outputs.

If the repository’s skill structure requires additional minimal files for the new skill to remain coherent and reusable, they may be created as part of implementation.

## Dependencies

### Internal dependencies

* `engineering-story/SKILL.md` remains the workflow orchestrator.
* `engineering-story` prompts remain the authoritative artifact contracts for implementation, review, and reporting.
* the new `quality-validation` skill must be designed to plug into that workflow rather than replace it.
* `docs/adr/ADR-001-engineering-artifacts.md` continues to constrain artifact authority and immutability.

### External dependencies

* No new runtime dependency is required by the plan itself.
* No DevLog API change is required.
* No CI pipeline modification is required.
* No SonarQube, JaCoCo, or stack-specific integration work is required at planning time beyond defining the skill contract and its expected use.

### Repository prerequisites

* existing skill structure in Engineering-Skills remains the baseline for creating a new reusable skill.
* `workflow-gate` remains installed and behaviorally unchanged.

### Ordering dependencies

1. Define the boundary and contract in `engineering-story/SKILL.md`.
2. Create the `quality-validation` skill definition and its result contract.
3. Update implementation, code-review, and engineering-report prompts to consume that contract.
4. Run focused validation on boundary consistency and scope control.

## Test Plan

### Skill-contract validation

Verify that the new `quality-validation` skill defines:

* clear mission and scope;
* adaptive selection of applicable checks;
* structured output;
* no approval authority;
* no workflow-state authority.

### Workflow-boundary validation

Verify that `engineering-story`:

* delegates quality determination/execution expectations to the new skill when available;
* still records fallback expectations if the skill is absent;
* still states that validation success never grants approval.

### Prompt consistency validation

Review the changed prompts together to ensure they all consume the same quality-validation model:

* Implementation Report records it;
* Code Review evaluates it;
* Engineering Report summarizes it.

### Repository checks

Expected targeted validation commands:

```text
rg -n "quality-validation|human approval|Quality Gate|outcome test|applicable|not applicable" engineering-story/SKILL.md engineering-story/prompts/*.md quality-validation
```

```text
git diff -- engineering-story/SKILL.md engineering-story/prompts/implementation.md engineering-story/prompts/code-review.md engineering-story/prompts/engineering-report.md quality-validation plugins/workflow-gate
```

```text
rg -n "localhost|token|project key|93441821|f3d56247" engineering-story quality-validation
```

### Expected success conditions

* the repository contains a dedicated reusable quality-validation skill;
* `engineering-story` integrates it without losing workflow authority;
* adaptive validation replaces overly rigid expected-check wording;
* representative outcome validation is explicit where needed;
* `workflow-gate` remains unchanged;
* the final diff remains scoped to reusable workflow assets.

## Risks

### Creating a vague meta-skill

Risk:
The new skill could become so generic that it provides little practical guidance.

Mitigation:
Define a concrete result contract with applicability, execution status, outcomes, and evidence fields.

### Accidentally duplicating workflow authority

Risk:
The new skill could start deciding too much about workflow progression.

Mitigation:
Make `engineering-story` the sole owner of sequencing and approval semantics, and state this explicitly in both skill contracts.

### Over-complicating a reusable repository

Risk:
Adding a new skill may introduce more abstraction than value.

Mitigation:
Keep the skill narrowly focused on quality-validation determination and evidence production, not orchestration.

### Weak fallback behavior

Risk:
If the new skill is absent or incomplete, the workflow could become underspecified again.

Mitigation:
Require `engineering-story` to preserve a clear fallback expectation when the dedicated skill is unavailable.

### Scope drift into execution tooling

Risk:
Implementation may drift into CI integration, plugin work, or per-repository automation.

Mitigation:
Constrain Story 0008 to workflow contracts and reusable skill assets only.

## Validation Checklist

- [ ] `engineering-story/SKILL.md` explicitly separates workflow authority from quality-validation execution.
- [ ] A dedicated `quality-validation` skill exists in the repository.
- [ ] The new skill defines adaptive applicable-check selection based on real project context and stack.
- [ ] The new skill defines structured output covering applicable, executed, passed/failed/blocked, and evidence.
- [ ] The new skill explicitly has no approval authority and no workflow-state authority.
- [ ] `engineering-story/prompts/implementation.md` consumes structured quality-validation evidence.
- [ ] `engineering-story/prompts/code-review.md` evaluates sufficiency and applicability of that evidence.
- [ ] `engineering-story/prompts/engineering-report.md` summarizes that evidence without collapsing it into approval.
- [ ] Representative outcome validation is explicit for ranking/allocation Stories.
- [ ] `plugins/workflow-gate` source remains unchanged.
- [ ] No repository-specific local values or secrets are introduced.
- [ ] The final diff remains limited to workflow and skill assets planned by this Story.

## Recommendation

Ready for implementation

## Approval Required

Implementation Plan completed.

Human approval required before Implementation.

Awaiting explicit human approval.
