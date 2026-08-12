# Repository Analysis

## Story Understanding

Story 0008 asks Engineering-Skills to align its reusable engineering workflow with the quality reality now established in DevLog AI.

Requested behavior:

* clarify the `engineering-story` workflow contract for quality validation;
* define what validation evidence must be recorded and reviewed for backend and frontend quality gates;
* make the distinction between quality success and human approval explicit and non-ambiguous;
* ensure ranking/allocation Stories require representative outcome validation, not only coverage and generic regression checks;
* keep `workflow-gate` focused on workflow state and approval authority unless the analysis proves a minimal change is necessary.

Engineering objective:

* bring the reusable workflow contract up to date with the quality pipeline now used in practice by DevLog AI;
* reduce ambiguity in Implementation Reports and Code Reviews;
* prepare a clean boundary for any future dedicated quality skill without transferring workflow authority away from `engineering-story` and `workflow-gate`.

Explicit scope:

* workflow-contract clarification in `engineering-story`;
* likely prompt and reference updates;
* review of current `workflow-gate` and adjacent quality-skill proposal boundaries.

Explicit exclusions:

* no DevLog AI repository change;
* no CI/Sonar/JaCoCo reconfiguration;
* no automatic approval from quality results;
* no broad plugin rewrite;
* no unrelated repository cleanup.

---

## Repository Summary

Engineering-Skills is a repository of reusable, artifact-first engineering workflows. Its primary active workflow is `engineering-story`, which coordinates Story → Repository Analysis → Plan → Implementation → Code Review → Engineering Report with explicit human approval gates and persisted artifacts, as described in [README.md](/home/ludo/Bureau/workspace/Engineering-Skills/README.md:1), [engineering-story/SKILL.md](/home/ludo/Bureau/workspace/Engineering-Skills/engineering-story/SKILL.md:1), and ADR-001 [docs/adr/ADR-001-engineering-artifacts.md](/home/ludo/Bureau/workspace/Engineering-Skills/docs/adr/ADR-001-engineering-artifacts.md:1).

For this Story, the repository is not a product-code monolith with services, entities, or persistence layers. The relevant architecture is:

* workflow authority in `engineering-story/SKILL.md`;
* stage-specific contracts in `engineering-story/prompts/`;
* deterministic approval-state enforcement in `plugins/workflow-gate/`;
* thin DevLog adapter scripts in `engineering-story/scripts/`;
* Story artifacts under `stories/`.

The capability affected by Story 0008 is the reusable engineering workflow contract itself, not a business feature exposed by an application runtime.

---

## Affected Modules

### `engineering-story/SKILL.md`

Relevant because it is the top-level workflow authority and already contains the current repository-wide quality rule:

* implementation must report executed validations and tests;
* SonarQube validation is mandatory when configured for the affected module;
* successful Quality Gate results never grant human approval.

This file is the natural home for workflow-level quality semantics and stage boundaries.

### `engineering-story/prompts/implementation.md`

Relevant because it defines what the Implementation Engineer must validate and what the Implementation Report must record. It already requires compilation, tests, static analysis, SonarQube when required, and frontend tests when affected, but it remains generic about the exact evidence shape.

### `engineering-story/prompts/code-review.md`

Relevant because it defines how review consumes validation evidence and where approval boundaries are reinforced. It already states that a successful SonarQube Quality Gate is not approval, but it does not yet encode repository-pattern-specific quality expectations such as frontend quality gates or representative outcome tests for ranking/allocation behavior.

### `engineering-story/prompts/engineering-report.md`

Relevant because the final report summarizes validation and approved outcomes. If the quality contract changes upstream, this prompt may need aligned language to keep the final artifact faithful to implementation and review evidence.

### `plugins/workflow-gate/src/`

Relevant because it is the deterministic state authority for approval gates. The analysis shows it is intentionally narrow:

* states only cover Story/Analysis/Plan/Implementation/Review/Report progression;
* approval hashes are tracked only for approved artifacts;
* expected approval artifacts are `repository-analysis.md`, `implementation-plan.md`, and `code-review.md`.

This plugin is involved mainly as a boundary to preserve, not as the primary implementation target.

### `engineering-story/scripts/devlog-context.mjs` and `engineering-story/scripts/devlog-story.mjs`

Relevant because Story 0008 depends on recent DevLog evolution and existing integration boundaries. They confirm the current architecture:

* DevLog context is optional and fail-open;
* DevLog lifecycle synchronization records Story history but does not own workflow approval.

They are not obvious primary modification targets for Story 0008 unless planning identifies a small supporting reference need.

### Adjacent workspace proposal: `~/.openclaw/workspace/skills/quality-gate-skill/SKILL.md`

Relevant as an external dependency of understanding, not as an in-repository module. It proposes a dedicated quality-gate capability separate from `workflow-gate`, which is conceptually aligned with Story 0008's scope boundary.

---

## Existing Implementation

### Existing behavior

The current workflow already contains important quality and approval primitives.

1. `engineering-story/SKILL.md` defines workflow-level quality semantics.
   It already requires SonarQube analysis when configured and explicitly requires reporting:
   * analyzed project key;
   * analysis command;
   * Quality Gate status;
   * new bugs, vulnerabilities, hotspots, smells;
   * new-code coverage;
   * duplicated lines on new code.

   It also explicitly states that:
   * a failed Quality Gate must never be reported as successful implementation;
   * a successful Quality Gate does not constitute human approval.

2. `engineering-story/prompts/implementation.md` already requires validation before implementation is considered complete:
   * compilation;
   * targeted unit tests;
   * relevant integration tests;
   * repository validation commands;
   * static analysis;
   * SonarQube when required;
   * frontend tests when affected.

   The Implementation Report already has sections for `Tests` and `Validation`, but the prompt does not define a reusable evidence shape for mixed backend/frontend quality gates.

3. `engineering-story/prompts/code-review.md` already treats technical readiness and approval as separate concepts.
   It explicitly states that:
   * successful tests are not approval;
   * successful build is not approval;
   * successful SonarQube Quality Gate is not approval.

4. `engineering-story/prompts/engineering-report.md` already preserves the same approval boundary at final reporting time.

5. `plugins/workflow-gate/src/` implements only workflow-state and approval-state logic.
   Its state machine is artifact-hash based and approval oriented. It knows nothing about:
   * JaCoCo thresholds;
   * SonarQube metrics;
   * frontend lint/format/build/coverage evidence;
   * representative outcome tests.

6. Existing DevLog integrations remain intentionally narrow.
   * Story 0006 integrated DevLog context as optional discovery help.
   * Story 0007 integrated Story lifecycle registration/start/complete.
   Neither integration makes DevLog authoritative for approval or workflow progression.

### Missing behavior

The current repository does not yet define quality evidence precisely enough for the evolved DevLog reality.

Missing or under-specified areas:

* no explicit reusable contract for frontend quality evidence comparable to the Sonar-focused backend language;
* no workflow-level distinction between mandatory validation evidence and optional/advisory quality signals beyond SonarQube wording;
* no explicit repository-agnostic rule that ranking/allocation Stories require representative outcome tests in addition to coverage and generic regression validation;
* no documented mapping from "repository uses backend quality gates", "repository uses frontend quality gates", or "repository uses both" to the minimum report/review evidence expected;
* no automated coverage around prompt-level quality semantics themselves; current tests focus on DevLog adapter scripts, and plugin validation/build focus on `workflow-gate`.

### Behavior that must remain unchanged

The following behaviors are established and must remain unchanged unless explicitly approved:

* the artifact chain and immutability model from ADR-001;
* the three Human Approval Gates and their semantics;
* `workflow-gate` as the sole workflow approval-state authority;
* DevLog as optional context/lifecycle integration rather than workflow governor;
* persisted artifact-first workflow records rather than conversational-only state.

### Existing tests and validations relevant to the Story

Relevant existing coverage is narrow but useful:

* `engineering-story/scripts/devlog-context.test.mjs`
* `engineering-story/scripts/devlog-story.test.mjs`
* `plugins/workflow-gate/package.json` build and plugin validation scripts
* Story 0005/0006/0007 artifacts documenting plugin validation and adapter validation

There is no current automated test suite for:

* prompt contract correctness;
* workflow-level quality evidence shape;
* representative outcome-test requirements.

That gap does not block implementation, but it is important for planning.

---

## Relevant Documentation

* [README.md](/home/ludo/Bureau/workspace/Engineering-Skills/README.md:1)
* [docs/adr/ADR-001-engineering-artifacts.md](/home/ludo/Bureau/workspace/Engineering-Skills/docs/adr/ADR-001-engineering-artifacts.md:1)
* [engineering-story/SKILL.md](/home/ludo/Bureau/workspace/Engineering-Skills/engineering-story/SKILL.md:1)
* [engineering-story/prompts/repository-analysis.md](/home/ludo/Bureau/workspace/Engineering-Skills/engineering-story/prompts/repository-analysis.md:1)
* [engineering-story/prompts/implementation.md](/home/ludo/Bureau/workspace/Engineering-Skills/engineering-story/prompts/implementation.md:1)
* [engineering-story/prompts/code-review.md](/home/ludo/Bureau/workspace/Engineering-Skills/engineering-story/prompts/code-review.md:1)
* [engineering-story/prompts/engineering-report.md](/home/ludo/Bureau/workspace/Engineering-Skills/engineering-story/prompts/engineering-report.md:1)
* [plugins/workflow-gate/README.md](/home/ludo/Bureau/workspace/Engineering-Skills/plugins/workflow-gate/README.md:1)
* [plugins/workflow-gate/src/index.ts](/home/ludo/Bureau/workspace/Engineering-Skills/plugins/workflow-gate/src/index.ts:1)
* [plugins/workflow-gate/src/transitions.ts](/home/ludo/Bureau/workspace/Engineering-Skills/plugins/workflow-gate/src/transitions.ts:1)
* [plugins/workflow-gate/src/types.ts](/home/ludo/Bureau/workspace/Engineering-Skills/plugins/workflow-gate/src/types.ts:1)
* [stories/0005-workflow-gate-plugin/story.md](/home/ludo/Bureau/workspace/Engineering-Skills/stories/0005-workflow-gate-plugin/story.md:1)
* [stories/0006-integrate-devlog-context/story.md](/home/ludo/Bureau/workspace/Engineering-Skills/stories/0006-integrate-devlog-context/story.md:1)
* [stories/0007-devlog-lifecycle-integration/story.md](/home/ludo/Bureau/workspace/Engineering-Skills/stories/0007-devlog-lifecycle-integration/story.md:1)
* External adjacent proposal used for boundary analysis: [quality-gate-skill/SKILL.md](/home/ludo/.openclaw/workspace/skills/quality-gate-skill/SKILL.md:1)

---

## Constraints

* ADR-001 requires engineering artifacts to remain first-class, persisted, and reviewable workflow records.
* `engineering-story/SKILL.md` remains the sole workflow orchestrator contract.
* Human approval must remain independent from technical success, including tests, builds, and Quality Gate results.
* `workflow-gate` must remain deterministic and narrowly focused on stage progression and approval-state enforcement unless a minimal necessary change is proven.
* DevLog details must inform the workflow without making the reusable skill overfit to one repository.
* The repository currently has no broad runtime or prompt-contract test harness, so changes should remain simple, explicit, and auditable.
* Story 0008 should avoid turning repository-specific quality pipelines into hardcoded infrastructure logic inside workflow-state code.

---

## Risks

### Overloading `workflow-gate`

If Story 0008 pushes quality evidence handling into `workflow-gate`, the plugin risks mixing workflow authority with repository-specific validation semantics. That would blur responsibilities and make approval-state behavior harder to reason about.

### Overfitting the reusable workflow to DevLog

DevLog provides the motivating quality pipeline, but Engineering-Skills is meant to stay reusable. If the implementation copies DevLog-specific tooling assumptions too literally, the workflow contract may become less portable.

### Under-specifying frontend quality evidence

Backend SonarQube language already exists, but frontend quality expectations are currently only implied through generic validation wording. If planning does not make this explicit, mixed repositories may continue to produce uneven reports and reviews.

### False confidence from mechanical validation

The Story explicitly depends on the lesson that ranking/allocation work needs representative outcome tests. If planning treats this only as an optional review preference, the workflow will still allow formally green but substantively weak validation.

### Weak automated enforcement

Because the repository has little automated coverage for prompt/workflow semantics, a documentation-only change could drift later unless the implementation includes at least focused validation or reviewable examples proving the new contract.

---

## Open Questions

None.

The repository is sufficiently understood to plan the change without additional human clarification. The main decisions are implementation-shape decisions, not blocked domain ambiguities.

---

## Recommendation

Ready for planning

---

## Implementation Readiness

The Story can be implemented using the current repository.

No blocking technical prerequisite is missing:

* workflow ownership is clear;
* affected modules are clear;
* architecture boundaries are clear;
* approval semantics are already established;
* the needed change is primarily a contract clarification and alignment exercise across existing workflow assets.

Important implementation realities to carry into planning:

* the most likely primary targets are `engineering-story/SKILL.md` and the implementation/code-review/report prompts;
* `workflow-gate` should default to no change unless planning uncovers one minimal, justified boundary fix;
* the adjacent `quality-gate-skill` should be treated as a separate concern, not as an already-available dependency;
* focused validation strategy will need to compensate for the lack of prompt-contract tests.

Repository Analysis completed.

Human approval required before Implementation Planning.

Awaiting explicit human approval.
