# Story 0006 — Integrate DevLog Context into Repository Analysis

## Metadata

**ID:**
`0006`

**Title:**
Integrate DevLog Engineering Story Context into Repository Analysis

**Status:**
Draft

---

## Goal

Enable the `engineering-story` workflow to use DevLog's ranked Engineering Story Context as the primary source for repository discovery and prioritization at the beginning of Repository Analysis, while preserving Kiko's reasoning, targeted repository verification, graceful fallback, and all existing Human Approval Gates.

---

## Context

DevLog Stories 0001–0006 established a project-scoped Engineering Story Context API backed by deterministic repository evidence collection, ranking, budgeting, provenance, and explainability.

The current Engineering-Skills Repository Analysis workflow does not consume this capability. Kiko discovers repository structure, source files, tests, configuration, ADRs, history, and changed files through direct repository searches before reading the most relevant artifacts.

This Story is the first real vertical integration between the two systems:

```text
Engineering Story
        ↓
engineering-story
        ↓
Repository Analysis begins
        ↓
resolve configured DevLog project
        ↓
GET /api/projects/{projectId}/engineering-story-context
        ↓
ranked RepositoryContext evidence
        ↓
Kiko navigates and prioritizes repository inspection
        ↓
targeted verification against the current repository
        ↓
repository-analysis.md
        ↓
Human Approval Gate 1
```

DevLog remains an optional context provider. It does not become the workflow orchestrator, the Repository Analyst, or the source of workflow approval.

---

## Problem

The `engineering-story` workflow currently repeats broad repository discovery even when DevLog already holds ranked, traceable, story-specific evidence about the project.

Without integration:

* DevLog's existing context infrastructure is not validated in Kiko's real workflow;
* Kiko must perform broad file, test, history, and ADR searches before targeted analysis;
* repository discovery lacks reusable evidence provenance and ranking explanations;
* future DevLog enrichment risks being driven by assumptions rather than observed workflow needs.

The integration must reduce discovery work without weakening analysis quality or making DevLog a required runtime dependency.

---

## Scope

* Integrate DevLog context retrieval at the beginning of the `engineering-story` Repository Analysis stage.
* Transmit the current Story description through DevLog's existing `description` request parameter.
* Consume the existing `EngineeringStoryContext.repositoryContext`, including selected evidence, provenance, originating files, ranking information, warnings, selection metadata, and digest where useful.
* Use DevLog evidence for navigation and prioritization of likely relevant modules, source files, tests, configuration, ADRs, Git history, and commit diffs.
* Preserve targeted direct repository inspection for current implementation details and verification.
* Define and consume a simple configuration-based mapping from the working repository to a DevLog project UUID.
* Keep environment-specific values, including the DevLog base URL and project mapping, outside `engineering-story/SKILL.md` in an appropriate OpenClaw workspace-local configuration mechanism such as `TOOLS.md` or the equivalent established during Repository Analysis.
* Provide graceful fallback to the existing direct Repository Analysis workflow when DevLog context cannot be used.
* Preserve the current Repository Analysis artifact contract and Human Approval Gate 1 behavior.
* Document the integration behavior sufficiently for local use and validation.

---

## Out of Scope

* Changes to the DevLog repository or DevLog API contract.
* New DevLog collectors or evidence layers.
* File-content analysis inside DevLog.
* Symbol, class, or method extraction.
* Dependency analysis or source-to-test mapping.
* Semantic embeddings or new AI interpretation inside DevLog.
* Automatic project resolution by repository URL, project slug, or repository path.
* Hardcoding a DevLog project UUID or environment-specific base URL in `engineering-story/SKILL.md`.
* A new context selection, ranking, or summarization engine.
* Replacement of Kiko's reasoning or direct repository verification.
* Changes to Human Approval semantics, workflow-gate state transitions, or artifact approval rules.
* Large observability or telemetry infrastructure.
* Unrelated `engineering-story`, `delegate-task`, or workflow-gate refactoring.

---

## Acceptance Criteria

* [ ] At the beginning of Repository Analysis, `engineering-story` attempts to resolve the current repository through a configured repository-to-DevLog-project mapping.
* [ ] The configuration keeps the DevLog base URL and project UUID mapping outside `engineering-story/SKILL.md` and supports reuse of the skill across repositories.
* [ ] When a mapping is available, the workflow calls `GET /api/projects/{projectId}/engineering-story-context?description={storyDescription}` with the Story description correctly encoded and transmitted.
* [ ] A successful non-empty response makes DevLog's ranked evidence the primary input for repository discovery and prioritization.
* [ ] Kiko uses evidence provenance and `originatingFile` values to perform targeted reads against the current working repository when exact behavior, implementation patterns, class or method details, or architectural verification are required.
* [ ] The repository remains authoritative: current repository contents override stale, missing, or conflicting DevLog evidence.
* [ ] Validated DevLog knowledge and transient repository evidence remain distinguishable in their use, consistent with DevLog ADR-040 Knowledge and Evidence Separation.
* [ ] If DevLog is unconfigured, unavailable, returns an error, returns an empty or unusable `RepositoryContext`, or supplies stale/nonexistent references, the workflow warns appropriately and continues through the existing direct Repository Analysis path.
* [ ] DevLog failure never blocks Story execution or changes the Repository Analysis recommendation by itself.
* [ ] The produced `repository-analysis.md` remains compliant with the existing Repository Analysis prompt and contains no workflow authority or inferred approval.
* [ ] Completion of Repository Analysis still transitions only to `WAITING_FOR_ANALYSIS_APPROVAL`; Implementation Planning remains forbidden until explicit human approval.
* [ ] The integration does not alter workflow-gate transitions, approval hashes, approval ownership, or later workflow stages.
* [ ] Automated validation covers configured retrieval, Story description transmission, usable context handling, missing configuration, API failure, empty context, and fallback behavior at the level supported by the selected implementation.
* [ ] A local end-to-end validation runs a real Engineering Story with DevLog available and confirms that Repository Analysis can be completed with DevLog-first discovery followed by targeted verification.
* [ ] A local fallback validation confirms that the same workflow can complete Repository Analysis when DevLog is unavailable.
* [ ] Relevant repository validation succeeds.

---

## Impacted Components

### Engineering-Skills / `engineering-story`

Owns:

* when DevLog context is requested;
* how configuration is resolved;
* how evidence guides Repository Analysis;
* warning and fallback behavior;
* preservation of the Repository Analysis contract and approval gates.

Likely affected areas include `engineering-story/SKILL.md`, `engineering-story/prompts/repository-analysis.md`, and any minimal supporting reference, script, or OpenClaw integration component justified by Repository Analysis.

### OpenClaw Workspace Configuration

Owns environment-specific configuration such as the DevLog base URL and repository-to-project UUID mapping. Repository Analysis must identify the smallest representation compatible with existing OpenClaw and Engineering-Skills conventions.

### Workflow Gate

Remains the deterministic authority for workflow state and Human Approval Gates. Its transition model should not require modification for this Story.

### DevLog

Acts only as an external context provider through its existing API. No DevLog modification is expected or authorized by this Story.

---

## Architectural Boundaries

* **DevLog** owns deterministic evidence, ranking, provenance, project knowledge, selection metadata, warnings, and context digest.
* **Engineering-Skills / `engineering-story`** owns invocation timing, configuration consumption, fallback behavior, workflow sequencing, and Human Approval Gates.
* **Kiko** owns reasoning over evidence, targeted verification, and production of the Repository Analysis.
* **The current repository** remains the ultimate implementation source of truth.
* DevLog context is advisory and navigational; it must not be treated as workflow approval or as proof of current repository behavior.
* The integration must remain provider-specific only at the context-provider boundary and must not transfer workflow governance to DevLog.

Invariant:

```text
DevLog provides context. Kiko produces analysis. Repository remains source of truth.
```

---

## Tests and Validation

### Automated Validation

Repository Analysis and Implementation Planning must select the smallest testing level supported by the final integration design. Coverage must include:

* configured mapping resolution;
* correct endpoint and encoded Story description;
* successful parsing/use of a non-empty `RepositoryContext`;
* missing mapping fallback;
* DevLog connection or API failure fallback;
* empty or unusable context fallback;
* preservation of Repository Analysis and approval-gate behavior.

### Practical Local Validation

Run one representative Engineering Story using DevLog-first discovery and record lightweight observations:

* number of broad `find`, `grep`, and `git log` operations;
* number of repository files Kiko reads directly;
* whether relevant files, modules, tests, ADRs, history, and changed files are identified;
* whether `repository-analysis.md` remains complete and accurate;
* whether evidence provenance improves traceability;
* whether conflicting or stale evidence is verified against the repository.

Repeat or simulate the same Repository Analysis with DevLog unavailable and confirm graceful fallback. No persistent telemetry system is required.

---

## Risks

### Stale or conflicting evidence

DevLog may describe an earlier synchronized repository state. Kiko must verify exact current behavior against the working repository, which remains authoritative.

### Fragile optional dependency

Network, configuration, or DevLog runtime failures could interrupt the workflow if failure handling is not bounded. The integration must catch these conditions, warn, and fall back to direct inspection.

### Configuration coupling

Embedding project-specific identifiers in the reusable skill would couple it to one repository. Environment-specific mapping must remain workspace-local and absent from `SKILL.md`.

### Excessive context

Passing unnecessary response metadata may consume context without improving analysis. The implementation should reuse DevLog's existing budgeted `RepositoryContext` and expose the evidence and metadata useful to Repository Analysis without adding another selection engine.

### Over-trust in ranked evidence

Ranked evidence can omit relevant details or point to obsolete paths. Kiko must treat it as navigation and prioritization, not as a replacement for analysis or verification.

### Workflow regression

Adding a pre-analysis context attempt must not bypass, advance, or weaken the existing deterministic workflow-gate behavior.

---

## Constraints

* Follow Engineering-Skills repository conventions.
* Preserve the current `engineering-story` workflow sequence and artifact contract.
* Preserve all three Human Approval Gates and their explicit-approval semantics.
* Reuse DevLog's existing API and context-budget mechanisms.
* Keep DevLog optional and fail open to the established direct Repository Analysis workflow.
* Keep configuration environment-specific and the skill reusable.
* Avoid unrelated changes and horizontal DevLog enrichment.

---

## Dependencies

* Existing `engineering-story` skill and Repository Analysis prompt.
* Existing workflow-gate integration and Human Approval Gate 1.
* A reachable DevLog backend for the successful-path validation.
* DevLog endpoint: `GET /api/projects/{projectId}/engineering-story-context?description={storyDescription}`.
* A configured DevLog project UUID for the target repository.
* An OpenClaw workspace-local configuration mechanism for the DevLog base URL and repository mapping.

---

## Relevant Documentation

* `AGENTS.md`
* `README.md`
* `CONVENTIONS.md`
* `engineering-story/SKILL.md`
* `engineering-story/prompts/repository-analysis.md`
* `plugins/workflow-gate/README.md`
* `plugins/workflow-gate/src/transitions.ts`
* DevLog ADR-040 — Knowledge and Evidence Separation
* DevLog Engineering Story Context API contract

---

## Definition of Done

* [ ] Repository Analysis approved
* [ ] Implementation Plan approved
* [ ] DevLog-first Repository Analysis integration completed
* [ ] Configuration and graceful fallback behavior validated
* [ ] Practical successful-path and unavailable-DevLog validations completed
* [ ] Relevant automated validation executed
* [ ] Code Review approved
* [ ] Engineering Report completed
