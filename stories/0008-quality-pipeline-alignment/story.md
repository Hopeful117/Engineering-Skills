# Story 0008 — Align Engineering-Skills with DevLog Quality Pipeline

## Metadata

**ID:**
`0008`

**Title:**
Align Engineering-Skills with the Evolved DevLog Quality Pipeline

**Status:**
Draft

---

## Goal

Update the `engineering-story` workflow so that it expresses, requests, and reviews quality validation evidence in a way that matches the current DevLog quality pipeline, while preserving explicit human approval, deterministic workflow authority, and artifact-first traceability.

---

## Context

DevLog AI's quality pipeline has evolved materially since the initial Engineering-Skills integration work:

* backend validation now relies on an explicit JaCoCo threshold with generated MapStruct implementations excluded from the blocking check;
* SonarQube is treated as a first-class validation signal with new-code metrics and a Quality Gate verdict;
* the frontend now has its own blocking quality baseline (strict TypeScript, ESLint, Prettier, build, and coverage gate);
* recent engineering lessons established that, for ranking and allocation behavior, passing tests and coverage alone are insufficient without a representative outcome test;
* the workflow discipline has become stricter: engineering artifacts must be written to disk and the workflow sequence must remain explicit and reviewable.

Engineering-Skills already contains partial quality language in `engineering-story/SKILL.md`, but it does not yet define a sufficiently explicit, reusable, and reviewable contract for quality evidence across the repositories it orchestrates.

At the same time:

* `workflow-gate` is intentionally focused on deterministic workflow progression and human approval gates;
* DevLog lifecycle registration records Story history, but does not own workflow approval;
* a `quality-gate-skill` proposal exists, but it is not yet an active workflow component.

The next step is therefore not to bolt CI logic into the workflow state machine, but to clarify the workflow contract so the implementation, review, and later quality tooling all speak the same language.

---

## Problem

The current Engineering-Skills workflow can say that quality validation is required, but it does not yet define quality evidence precisely enough for the repositories it coordinates.

Without this alignment:

* implementation reports may mention validation inconsistently across backend and frontend modules;
* code reviews may not know which quality signals are mandatory, advisory, or out of scope;
* ranking/allocation Stories may pass with mechanical coverage while still missing representative outcome validation;
* future quality tooling risks duplicating or contradicting the workflow contract;
* `workflow-gate` may remain correct technically while the surrounding workflow remains under-specified functionally.

The fix must preserve the current engineering workflow structure and approval semantics.

---

## Scope

* Clarify the `engineering-story` workflow contract for quality validation.
* Define what validation evidence must be recorded for repositories with:
  * backend JaCoCo/SonarQube validation;
  * frontend lint/format/build/test/coverage validation;
  * mixed backend/frontend quality gates.
* Distinguish clearly between:
  * blocking quality validation evidence;
  * advisory quality findings;
  * explicit human approval.
* Define the workflow expectation for ranking/allocation features that require representative outcome tests in addition to mechanical correctness and coverage.
* Update the relevant Engineering-Skills workflow assets so the quality contract is reusable and auditable.
* Identify whether the existing `quality-gate-skill` proposal should remain separate, be refined, or be deferred after workflow-contract clarification.

---

## Out of Scope

* Changes to DevLog AI backend, frontend, or CI pipelines.
* Changes to SonarQube configuration, Quality Profiles, or project tokens.
* Changes to JaCoCo thresholds or coverage formulas in DevLog.
* Runtime integration with GitHub Actions, SonarQube APIs, or other CI systems.
* Automatic workflow advancement based on CI or Quality Gate results.
* Removal, addition, or semantic change of the three existing Human Approval Gates.
* Replacing `workflow-gate` with a broader orchestration plugin.
* Full implementation of a new quality plugin unless justified by the approved analysis and plan.
* Unrelated prompt cleanup or broad skill refactoring.

---

## Acceptance Criteria

* [ ] The repository analysis identifies the exact Engineering-Skills assets that currently define quality expectations and the gaps relative to DevLog's evolved quality pipeline.
* [ ] The final implementation scope preserves the existing workflow order, artifact chain, and approval semantics from `engineering-story` and ADR-001.
* [ ] The workflow contract explicitly distinguishes human approval from quality validation success.
* [ ] The workflow contract defines the minimum validation evidence expected when SonarQube is configured for an affected module.
* [ ] The workflow contract defines the minimum validation evidence expected for frontend quality gates when the affected repository uses lint, format, build, unit tests, and coverage thresholds.
* [ ] The workflow contract states when representative outcome tests are required in addition to coverage and regression validation.
* [ ] The implementation keeps workflow-gate focused on approval/state authority unless the approved analysis demonstrates a minimal necessary change.
* [ ] Any proposed role for `quality-gate-skill` remains clearly separated from workflow approval authority.
* [ ] Updated workflow documentation and prompts remain reviewable, repository-persisted engineering artifacts.
* [ ] Relevant repository validation succeeds.

---

## Impacted Components

### Engineering-Skills / `engineering-story`

Owns:

* workflow sequencing;
* validation expectations;
* implementation-report and code-review expectations;
* separation between validation success and human approval.

Likely affected areas:

* `engineering-story/SKILL.md`
* `engineering-story/prompts/implementation.md`
* `engineering-story/prompts/code-review.md`
* supporting references related to DevLog quality expectations

### Engineering-Skills / `workflow-gate`

Owns:

* deterministic workflow progression;
* artifact hash verification;
* Human Approval Gates.

This Story must verify whether any change is truly required here, and default to no change unless the analysis proves otherwise.

### Engineering-Skills / `quality-gate-skill`

Currently a proposal. This Story may clarify its eventual role, but must not treat the proposal as an already-integrated capability.

### DevLog AI

Acts as the source of the evolved quality pipeline expectations and validation vocabulary. DevLog does not become the owner of Engineering-Skills workflow sequencing or approval semantics.

---

## Architectural Boundaries

* **Engineering-Skills** owns workflow contracts, artifact expectations, and approval semantics.
* **workflow-gate** owns workflow state transitions and Human Approval Gate enforcement.
* **DevLog** owns its repository-specific quality pipeline and validation signals.
* **The human engineer** owns approval decisions.

Invariants:

```text
Quality validation can recommend readiness.
Quality validation can never grant approval.

workflow-gate controls approval state.
engineering-story controls workflow contract.
DevLog provides repository-specific quality expectations and evidence vocabulary.
```

---

## Tests and Validation

### Repository Analysis must identify

* existing workflow and prompt locations that define quality expectations;
* existing `workflow-gate` behavior relevant to quality evidence and approval boundaries;
* current `quality-gate-skill` status and its repository role;
* the DevLog quality signals that Engineering-Skills should treat as required evidence versus repository-specific detail.

### Later implementation planning must determine

* which prompt and reference updates are required;
* whether any template or artifact-structure adjustments are necessary;
* what focused validation proves the new contract behaves as intended.

---

## Risks

### Overloading workflow-gate

Mixing quality validation mechanics into workflow approval state would blur responsibilities and make the plugin harder to reason about.

### Under-specifying quality evidence

If the contract remains too generic, future reports and reviews will keep drifting across repositories and Story types.

### Repository-specific leakage

If DevLog details are copied too literally into the reusable workflow, Engineering-Skills may become overfit to one repository.

### False confidence from coverage

If the workflow does not explicitly require representative outcome tests for ranking/allocation behavior, formally green validation may still miss the real failure mode.

---

## Constraints

* Follow the Engineering-Skills workflow and artifact conventions.
* Preserve ADR-001 artifact authority and immutability principles.
* Preserve the current `engineering-story` workflow sequence.
* Preserve all existing Human Approval Gates and their semantics.
* Keep repository-specific runtime settings out of reusable workflow assets.
* Prefer minimal, deterministic, reviewable workflow changes over broad automation.

---

## Dependencies

* ADR-001 — Engineering Artifacts as First-Class Workflow Records
* Story 0005 — Workflow Gate Plugin
* Story 0006 — Integrate DevLog Context into Repository Analysis
* Story 0007 — DevLog Lifecycle Integration
* DevLog AI quality pipeline changes already delivered in DevLog
