# Repository Analysis

## Story Understanding

Story 0006 requests the first runtime use of DevLog inside the `engineering-story` workflow. When Repository Analysis begins, the workflow should attempt to resolve a configured DevLog project for the current working repository and request the existing Engineering Story Context using the current Story description.

When DevLog returns a usable `RepositoryContext`, Kiko should use its ranked evidence, provenance, originating files, explanations, warnings, and digest to prioritize repository discovery. Kiko remains responsible for reasoning and for targeted reads of the current repository whenever exact implementation behavior, code patterns, class or method details, or architectural confirmation are needed.

The integration is explicitly optional. Missing configuration, an unavailable DevLog backend, an API error, empty context, unusable evidence, stale paths, or conflicting evidence must lead to a warning and the existing direct Repository Analysis behavior. These conditions must not block the Engineering Story workflow by themselves.

The Story includes:

* a configuration-based working-repository to DevLog-project mapping;
* DevLog context retrieval at Repository Analysis entry;
* use of selected evidence for navigation and prioritization;
* targeted verification against the working repository;
* graceful fallback;
* preservation of the Repository Analysis artifact and Human Approval Gate 1;
* focused automated and local validation.

It excludes DevLog changes, new evidence collectors, source-content or symbol analysis, dependency analysis, semantic embeddings, automatic URL or slug resolution, new context-selection machinery, Human Approval changes, and unrelated workflow refactoring.

## Repository Summary

Engineering-Skills is a repository of workflow definitions and supporting integration components. Its relevant architecture has three parts:

* `engineering-story/SKILL.md` is the workflow orchestrator. It owns stage sequencing, entry preconditions, STOP semantics, delegation boundaries, and Human Approval governance.
* `engineering-story/prompts/repository-analysis.md` defines the Repository Analyst role and the exact `repository-analysis.md` contract. It currently receives the Story, current Git repository, project documentation, and workflow documentation, then instructs Kiko to inspect only Story-relevant repository areas.
* `plugins/workflow-gate/` is a TypeScript OpenClaw plugin implementing deterministic workflow states and approval transitions. Repository Analysis completion maps to `WAITING_FOR_ANALYSIS_APPROVAL`; planning requires a recorded analysis approval.

The `engineering-story` skill is installed into the OpenClaw workspace through a symbolic link to this repository. OpenClaw's workspace `TOOLS.md` is explicitly intended for environment-specific operational details, making it the existing natural ownership location for a local DevLog base URL and repository-to-project UUID mapping. The current `TOOLS.md` contains only its template and no DevLog configuration.

Engineering-Skills currently has no shared HTTP client, context-provider abstraction, executable helper for Repository Analysis, or automated test harness for Markdown skill behavior. The only executable module is the independently owned `workflow-gate` plugin. This means the integration boundary must be introduced deliberately without transferring context-provider behavior into workflow-state code.

DevLog is an external provider for this Story. Its existing Spring controller exposes:

`GET /api/projects/{projectId}/engineering-story-context?description={storyDescription}`

The response includes `EngineeringStoryContext.repositoryContext`. `RepositoryContext` exposes selected evidence, per-layer counts, budgets, candidate/discard counts, truncation, selection decisions, warnings, and a SHA-256 context digest. Each `RepositoryEvidence` exposes its layer, kind, reference, summary, occurrence time, score, related references, extraction metadata, estimated tokens, ranking reasons, and provenance including `repositoryLocation`, `originatingFile`, and identifier.

DevLog already bounds the response to defaults of 60 evidence items, 500 summary characters, 20 history items, and 6000 estimated tokens. No additional API or context-selection layer is required for the first integration.

## Affected Modules

### `engineering-story` workflow orchestration

Relevant component: `engineering-story/SKILL.md`.

It currently determines when Repository Analysis may start and what happens after it completes, but it has no context-provider step. It is affected because it owns when optional DevLog context is requested, how provider failure affects workflow progression, and the invariant that Repository Analysis still stops before Implementation Planning.

### Repository Analysis role

Relevant component: `engineering-story/prompts/repository-analysis.md`.

It currently defines direct, targeted repository inspection as the only discovery mechanism. It is affected because the analyst needs an explicit contract for using DevLog evidence as discovery guidance, distinguishing trusted knowledge from transient evidence, verifying current behavior against the repository, reporting provider degradation, and falling back safely.

### OpenClaw workspace configuration

Relevant component: workspace-local `TOOLS.md` or the equivalent local mechanism confirmed during planning.

This owns machine- and repository-specific details. It is the appropriate existing boundary for the DevLog base URL and explicit repository-to-project UUID mapping because those values must not be embedded in the reusable skill or committed as universal Engineering-Skills configuration.

### Minimal context-provider integration support

Engineering-Skills has no existing reusable HTTP integration component. A minimal supporting reference, script, or OpenClaw-owned integration component may therefore be affected if required to make configuration lookup, URL encoding, response validation, timeouts, and fallback behavior testable. Its exact form is not currently established and belongs to Implementation Planning after the approved analysis.

It must remain owned by Engineering-Skills/OpenClaw and must not be placed in the workflow-gate state controller.

### `workflow-gate`

Relevant components: `plugins/workflow-gate/src/types.ts` and `plugins/workflow-gate/src/transitions.ts`.

These components establish that Story creation enters analysis and that completed Repository Analysis enters `WAITING_FOR_ANALYSIS_APPROVAL`. Their behavior is relevant as a compatibility constraint but should remain unchanged. DevLog retrieval is pre-analysis context preparation, not a new workflow stage or approval event.

### DevLog Engineering Story Context API

Relevant external components:

* `EngineeringStoryContextController`;
* `EngineeringStoryContext`;
* `RepositoryContextAdapter`;
* `RepositoryContext`;
* `RepositoryEvidence`;
* `EvidenceScore`.

These already provide the required external contract. They are inspected dependencies, not implementation-owned components for this Story.

## Existing Implementation

### Existing Engineering Story behavior

`engineering-story/SKILL.md` makes Engineering Story the sole workflow orchestrator. Repository Analysis requires a current Story, repository access, and relevant workflow documentation. After the analysis artifact is produced, the workflow must stop and wait for explicit human approval. Provider output, successful analysis, or artifact contents cannot grant approval.

There is currently no DevLog reference, context-provider invocation, configuration lookup, HTTP call, or fallback contract in the skill.

### Existing Repository Analysis behavior

`engineering-story/prompts/repository-analysis.md` requires Kiko to understand Story-relevant ownership, implementation, architecture, dependencies, tests, constraints, risks, and missing information. It directs Kiko to read relevant documentation and inspect only necessary repository areas, citing packages, classes, file paths, tests, and ADRs when possible.

This contract already supports targeted verification. The missing behavior is the preliminary use of DevLog evidence to choose those targets and reduce broad discovery. The output structure itself does not need redesign.

### Existing configuration behavior

Engineering-Skills does not define a committed per-project configuration format. OpenClaw's workspace `TOOLS.md` states that unique local setup information belongs there rather than in reusable skills. It is therefore a compatible configuration ownership boundary for the first explicit mapping.

No DevLog base URL or project mapping is currently configured in the inspected workspace. Successful-path runtime validation will require adding local values during implementation or validation, without committing environment-specific identifiers into the skill.

### Existing workflow-gate behavior

The workflow-gate state model has no context-provider state and does not need one. Its `STAGE_TO_COMPLETION_STATE` mapping sends completed analysis to `WAITING_FOR_ANALYSIS_APPROVAL`; `APPROVAL_TO_NEXT_STATE` permits planning only after analysis approval.

The plugin's historical Engineering Report records accepted follow-up limitations around full runtime approval wiring and skill integration. Those existing limitations are not caused by Story 0006 and should not be expanded into this Story. The DevLog integration must preserve the current gate contract rather than attempt to repair unrelated plugin follow-ups.

The workflow-gate tools are not exposed in the current OpenClaw session, so this analysis cannot record a plugin-backed state transition. That runtime availability issue does not prevent producing the governed Repository Analysis artifact, but no technical approval transition may be simulated.

### Existing DevLog contract

`EngineeringStoryContextController` accepts a UUID path variable and optional `description` query parameter, then delegates to `buildWithRepositoryContext`. `RepositoryContextAdapter` uses the description as the intent objective and user guidance for the `engineering-story-v1` profile.

The returned model exposes all data required by the Story:

* ranked evidence and final scores;
* ranking reasons and criterion explanations;
* source, test, configuration, module, ADR, history, and commit-diff evidence when selected;
* provenance with originating file paths;
* selection decisions and warnings;
* context budget and digest.

The inspected backend configuration exposes the service on the normal Spring Boot HTTP port and contains no application security configuration for this endpoint. Runtime reachability still depends on the local DevLog deployment and configured base URL.

### Existing tests and validation

Engineering-Skills has TypeScript build and plugin validation support only inside `plugins/workflow-gate`. It has no tests for `engineering-story` Markdown orchestration or external context-provider behavior.

DevLog has unit coverage for its Repository Context Engine and collectors. The existing API contract is sufficient and remains outside this Story's modification scope. Story 0006 needs validation owned by Engineering-Skills for mapping resolution, request construction, response usability, failure handling, and preservation of the Repository Analysis workflow.

### Behavior that must remain unchanged

* DevLog does not produce `repository-analysis.md` or reason on Kiko's behalf.
* Current repository contents override DevLog evidence when they differ.
* Repository Analysis keeps its existing deliverable structure.
* Repository Analysis completion does not authorize planning.
* Workflow-gate transitions and approval ownership remain unchanged.
* Direct Repository Analysis remains available whenever DevLog cannot provide useful context.
* DevLog's API and repository remain unchanged by this Story.

## Relevant Documentation

* `README.md`
* `CONVENTIONS.md`
* `stories/0006-integrate-devlog-context/story.md`
* `engineering-story/SKILL.md`
* `engineering-story/prompts/repository-analysis.md`
* `plugins/workflow-gate/README.md`
* `plugins/workflow-gate/src/index.ts`
* `plugins/workflow-gate/src/types.ts`
* `plugins/workflow-gate/src/transitions.ts`
* `stories/0005-workflow-gate-plugin/engineering-report.md`
* OpenClaw workspace `TOOLS.md`
* DevLog `EngineeringStoryContextController.java`
* DevLog `EngineeringStoryContextServiceImpl.java`
* DevLog `RepositoryContextAdapter.java`
* DevLog `RepositoryContext.java`
* DevLog `RepositoryEvidence.java`
* DevLog `EvidenceScore.java`
* DevLog `RepositoryContextEngine.java`
* DevLog `application.properties`
* DevLog ADR-040 — Knowledge and Evidence Separation

## Constraints

* The Story belongs to Engineering-Skills; DevLog is an external provider and must not be modified.
* The current DevLog endpoint and response contract must be reused unless an actual incompatibility is found. None was found during analysis.
* The Story description must be safely encoded and transmitted as the `description` query parameter.
* Project resolution is configuration-based for this increment. URL-, slug-, and path-based automatic discovery are excluded.
* Environment-specific base URLs and UUID mappings must not be hardcoded in `engineering-story/SKILL.md` or committed as universal values.
* The reusable skill must remain usable for repositories with no DevLog mapping.
* DevLog is an optional enhancement. Configuration, connectivity, HTTP, parsing, empty-context, and unusable-evidence failures must degrade to direct inspection.
* Network failure handling must be bounded so an optional provider cannot leave Repository Analysis hanging.
* DevLog evidence is navigation and prioritization context, not proof of current implementation behavior.
* The current repository remains the authoritative source for exact code and state.
* Validated DevLog knowledge and transient repository evidence must remain distinguishable, consistent with ADR-040.
* Existing DevLog budgets should be reused; Story 0006 must not introduce another ranking or selection engine.
* Repository Analysis must retain its exact artifact contract and remain descriptive rather than becoming an implementation plan.
* Repository Analysis completion must still stop at `WAITING_FOR_ANALYSIS_APPROVAL`.
* No provider, response, successful request, or artifact may satisfy a Human Approval Gate.
* Workflow-gate state transitions, approval hashes, and later stages are outside the change scope.
* Existing workflow-gate follow-up limitations must not be opportunistically repaired within this Story.
* Validation should be lightweight and local; a large telemetry system is excluded.

## Risks

### Ambiguous executable boundary

Engineering-Skills currently represents Repository Analysis primarily through Markdown instructions and has no shared HTTP integration layer. If provider access is expressed only as prose, configuration validation, timeouts, response validation, and fallback behavior may be inconsistent. If a large new runtime component is introduced, the Story may exceed its minimal vertical scope. Planning must keep this boundary small and testable.

### Workspace configuration parsing

`TOOLS.md` is semantically appropriate for local values but is human-oriented Markdown rather than an existing typed configuration API. An unclear representation could make mapping resolution brittle or encourage assumptions about repository identity. The local contract must be explicit and deterministic enough for Kiko to consume without embedding values in the skill.

### Stale or conflicting evidence

DevLog builds context from synchronized repository and persisted project data. Its evidence can lag behind the current working tree or refer to removed files. Treating ranked evidence as authoritative could produce an incorrect analysis; targeted verification and repository precedence are mandatory.

### Optional dependency becoming operationally mandatory

Unbounded network calls, uncaught response errors, malformed data, or an empty context could prevent analysis from starting. The integration must isolate provider failure and retain the current direct path.

### Context inflation

The complete API response includes selection decisions and detailed scoring metadata in addition to selected evidence. Blindly placing every field into the active reasoning context could consume more context than it saves. The implementation must reuse DevLog's bounded output while retaining only metadata that materially supports navigation, explainability, warnings, and traceability.

### Weak validation coverage

The repository lacks an established skill-level test harness. Without a small testable boundary, successful retrieval may be tested manually while missing mapping, timeout, malformed response, and empty evidence paths remain unverified.

### Workflow-gate coupling

Putting DevLog retrieval inside the workflow-gate plugin would mix context acquisition with workflow authority and could make provider availability affect state transitions. The integration must remain in the Engineering Story / Repository Analysis boundary.

## Open Questions

None.

The exact minimal executable form and local configuration syntax are implementation-design choices that can be resolved during Implementation Planning from the established ownership and acceptance criteria. They do not require a product or architectural decision from the human before planning.

## Recommendation

Ready for planning

The repository and external API are sufficiently understood. Ownership is clear, the existing DevLog contract contains the required context and provenance, `TOOLS.md` provides an appropriate local configuration boundary, and graceful fallback prevents DevLog from becoming a blocking dependency. No DevLog API change, workflow-gate transition change, or new architectural decision is required.

This recommendation is technical only. It does not approve the Repository Analysis or authorize Implementation Planning.

## Implementation Readiness

The Story can be implemented using the current repositories and API contract.

No missing DevLog contract, ownership decision, persistence change, database migration, or ADR is required. The Engineering-Skills repository does not yet contain a context-provider helper or skill-level test harness, so Implementation Planning must select a minimal testable integration boundary and define the workspace-local configuration syntax. These are non-blocking design tasks within the approved Story.

Successful-path validation requires a running DevLog backend, a configured base URL, and a valid project UUID for the target repository. Their absence in the current workspace does not block implementation because failure and unconfigured behavior are explicit acceptance paths.

Repository Analysis completed.

Human approval required before Implementation Planning.

Awaiting explicit human approval.
