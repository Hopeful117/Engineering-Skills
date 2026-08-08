# Implementation Plan

## Overview

Implement the DevLog integration as a small, optional context-provider boundary owned by Engineering-Skills:

* OpenClaw workspace `TOOLS.md` holds the local DevLog base URL and explicit working-repository-to-project UUID mappings;
* `engineering-story` invokes DevLog when Repository Analysis begins and a mapping exists;
* a dependency-free Node helper performs the bounded HTTP request, validates the minimum response contract, and returns the existing `RepositoryContext` without re-ranking or summarizing it;
* the Repository Analysis prompt defines how Kiko uses evidence for prioritization and how it verifies current behavior against the repository;
* every DevLog failure produces a visible standardized error message and the workflow continues through the existing direct Repository Analysis path;
* workflow-gate behavior and the DevLog repository remain unchanged.

This satisfies the approved analysis and the human clarification: DevLog failure must be visible, but must never stop the Engineering Story workflow. If cross-provider error standardization later requires a DevLog contract change, that work belongs to a separate DevLog Story.

## Planned Changes

### 1. Define the workspace-local DevLog configuration contract

Add a focused Engineering-Skills reference describing a `TOOLS.md` section for:

* one DevLog base URL;
* explicit mappings from canonical Git repository root paths to DevLog project UUIDs;
* exact-path matching using the current repository root;
* absence of a mapping as a normal fallback condition;
* prohibition on embedding local URLs or UUIDs in `SKILL.md`.

The documented representation should remain human-readable because `TOOLS.md` is OpenClaw's local operational notebook. Kiko resolves the current canonical repository root and reads the matching configuration before invoking the helper. This increment does not introduce automatic URL or slug resolution.

### 2. Add a minimal deterministic DevLog context adapter

Create a dependency-free Node.js ESM helper dedicated to the Engineering Story integration. It should accept the resolved base URL, project UUID, and Story description through safe process inputs that avoid shell interpolation hazards.

The adapter should:

* validate required inputs before network access;
* construct the existing endpoint with `URL` and `URLSearchParams` so the Story description is correctly encoded;
* use a short explicit request timeout suitable for an optional provider;
* require a successful HTTP response;
* parse JSON safely;
* validate that `repositoryContext.evidence` exists and contains usable evidence;
* emit the existing `RepositoryContext` data needed by Kiko without introducing ranking, semantic interpretation, or a second selection layer;
* preserve evidence provenance, originating files, scores/reasons, warnings, selection decisions, budget metadata, and digest;
* avoid logging local configuration or response data unnecessarily.

On missing/invalid inputs, connection failure, timeout, non-success HTTP status, malformed JSON, missing `RepositoryContext`, or empty/unusable evidence, the adapter must:

1. emit a visible message to standard error using a stable Engineering-Skills-owned prefix such as `DEVLOG_CONTEXT_ERROR`;
2. state that Repository Analysis will continue without DevLog;
3. return a non-success adapter result that the workflow treats as fallback, not as a workflow failure.

The error vocabulary is local to the integration. No DevLog API error redesign is included. A future standardization requiring DevLog changes must be implemented through a separate Story in the DevLog repository.

### 3. Integrate optional context retrieval into `engineering-story`

Update the orchestration definition so Repository Analysis entry performs the following bounded preparation:

* determine the canonical current Git repository root;
* inspect the workspace-local DevLog configuration;
* if configuration is present, invoke the DevLog adapter with the current Story description;
* if usable context is returned, provide it as the primary repository discovery and prioritization input;
* if configuration is absent or the adapter reports any failure, display the required error/fallback message and continue through the existing direct inspection workflow;
* never treat provider success or failure as a workflow-gate event;
* complete Repository Analysis and stop at Human Approval Gate 1 exactly as before.

The orchestration wording must make clear that fallback is automatic and that DevLog availability is not a Repository Analysis precondition.

Durable changes to the reusable skill must be performed through the established Skill Workshop workflow rather than by directly editing installed skill files. The resulting source changes must remain versioned in the Engineering-Skills repository.

### 4. Extend the Repository Analysis role contract

Update the Repository Analysis prompt so the analyst:

* receives optional DevLog `RepositoryContext` as an additional discovery input;
* uses ranked evidence to identify likely relevant modules, files, tests, configuration, ADRs, history, and diffs;
* uses provenance and `originatingFile` to navigate to concrete repository artifacts;
* distinguishes validated knowledge from transient repository evidence;
* directly verifies implementation patterns, class/method details, current behavior, architectural constraints, and stale or conflicting references;
* treats the current repository as authoritative;
* reports a visible DevLog error and follows the original direct inspection method when context is unavailable or unusable;
* does not change the required `repository-analysis.md` structure or approval language.

### 5. Document operational behavior

Add a concise reference for local setup and troubleshooting covering:

* the `TOOLS.md` configuration example with placeholder values only;
* successful DevLog-first behavior;
* the standardized visible error/fallback behavior;
* the trust model;
* expected response fields used by Kiko;
* validation commands;
* the rule that provider-side error standardization belongs to a separate DevLog Story.

Do not commit Ludovic's real DevLog project UUID or machine-specific base URL to Engineering-Skills.

### 6. Validate the integration boundary

Use Node's built-in test runner and a local mock HTTP server to validate the adapter without adding runtime dependencies. Cover successful retrieval, encoded description transmission, input validation, API failure, malformed JSON, absent context, empty evidence, and timeout/fetch failure behavior.

Perform static/documentation checks to confirm:

* `SKILL.md` contains no hardcoded project UUID or local DevLog URL;
* workflow instructions explicitly continue after DevLog failure;
* Repository Analysis still ends at Gate 1;
* workflow-gate source is unchanged.

Finally, run the practical local validation from the Story with a configured real DevLog project, then repeat with DevLog unavailable. Record lightweight observations in the Implementation Report rather than introducing telemetry infrastructure.

## Files to Modify

* `engineering-story/SKILL.md` — add the optional DevLog context-preparation behavior at Repository Analysis entry, explicit visible-error fallback, and unchanged Gate 1 transition.
* `engineering-story/prompts/repository-analysis.md` — define DevLog-first discovery, evidence trust boundaries, targeted verification, and direct-inspection fallback.

No DevLog file and no workflow-gate implementation file should be modified.

## Files to Create

* `engineering-story/references/devlog-context.md` — local configuration contract, API contract, trust model, fallback semantics, and operational guidance.
* `engineering-story/scripts/devlog-context.mjs` — bounded, dependency-free adapter for the existing DevLog Engineering Story Context endpoint.
* `engineering-story/scripts/devlog-context.test.mjs` — adapter tests using Node's built-in test runner and a local mock server.

If Skill Workshop produces its normal proposal metadata outside the repository, that metadata is workflow support and must not replace the versioned Engineering-Skills source changes.

## Dependencies

### Internal dependencies

* `engineering-story/SKILL.md` remains the workflow orchestrator.
* `engineering-story/prompts/repository-analysis.md` remains the Repository Analysis role contract.
* OpenClaw workspace `TOOLS.md` supplies environment-specific values.
* The existing workflow-gate state model remains the approval authority and is not modified.

### External dependencies

* Existing DevLog endpoint: `GET /api/projects/{projectId}/engineering-story-context?description={storyDescription}`.
* Node.js runtime already used by the Engineering-Skills/OpenClaw environment.
* A running DevLog backend and valid configured project UUID only for successful-path local validation.

No new NPM package, DevLog change, database migration, or external paid service is required.

### Ordering dependencies

The configuration and adapter contracts must be coherent before the orchestration and Repository Analysis instructions can reference them. Automated adapter validation must precede the real local workflow validation. Practical DevLog-first validation requires local configuration but fallback validation deliberately does not.

## Test Plan

### Adapter tests

Run:

```text
node --test engineering-story/scripts/devlog-context.test.mjs
```

Tests should verify:

* a configured request targets `/api/projects/{projectId}/engineering-story-context`;
* the complete Story description arrives in the `description` query parameter after safe encoding;
* a valid non-empty response exposes the existing `RepositoryContext` and provenance intact;
* invalid base URL or project UUID produces `DEVLOG_CONTEXT_ERROR` and fallback status;
* connection failure and timeout produce a visible error and fallback status;
* non-2xx responses produce a visible error and fallback status;
* malformed JSON produces a visible error and fallback status;
* missing `repositoryContext` produces a visible error and fallback status;
* empty or unusable evidence produces a visible error and fallback status;
* failure messages explicitly state that Repository Analysis continues without DevLog.

### Static and repository validation

Run targeted searches to verify that:

* no concrete UUID or localhost/machine-specific DevLog value is embedded in the reusable skill;
* the skill and prompt contain explicit fallback and repository-authority language;
* workflow-gate source has no Story 0006 diff;
* DevLog repository has no Story 0006 diff.

Validate the installed skill through the normal OpenClaw/Skill Workshop validation path applicable at implementation time.

### Practical successful-path validation

Configure placeholder-free local values in the workspace `TOOLS.md`, run a real Engineering Story through Repository Analysis, and capture in the Implementation Report:

* broad `find`, `grep`, and `git log` operations;
* direct repository file reads;
* relevant modules, files, tests, ADRs, history, and diffs identified from DevLog;
* targeted verification performed;
* provenance or digest used for traceability;
* completeness of `repository-analysis.md`.

### Practical fallback validation

Make DevLog unavailable or point the local configuration to an unavailable test endpoint. Verify that:

* a visible `DEVLOG_CONTEXT_ERROR` message is displayed;
* the message states that the workflow continues without DevLog;
* direct Repository Analysis proceeds;
* `repository-analysis.md` can still be completed;
* Gate 1 behavior remains unchanged.

### Expected success conditions

All adapter tests pass, successful-path evidence guides discovery, every tested provider failure is visible and non-blocking, no external repository is modified, and the workflow stops at Human Approval Gate 1 after Repository Analysis.

## Risks

### Markdown configuration is not a typed store

`TOOLS.md` is appropriate for local operational data but is not a formal configuration API. The plan mitigates this by documenting one explicit representation, using exact canonical-path mapping, and keeping deterministic network behavior in the adapter rather than attempting broad Markdown parsing logic.

### Helper scope expansion

The adapter could grow into a second context engine. The plan constrains it to input validation, one HTTP request, minimum response validation, and faithful context output. It must not rank, summarize, interpret, cache, or resolve projects automatically.

### Error inconsistency across systems

DevLog may return heterogeneous errors. The adapter owns a stable Engineering-Skills-facing `DEVLOG_CONTEXT_ERROR` message and preserves useful diagnostics without requiring provider changes. Broader standardization is explicitly deferred to a DevLog-owned Story.

### Provider latency

An unavailable provider could delay every analysis. An explicit short timeout and immediate fallback bound the impact.

### Stale evidence

The plan keeps targeted repository verification mandatory and the current working repository authoritative.

### Context consumption

The adapter preserves DevLog's already budgeted result and does not create an additional summary layer. Kiko uses selected evidence and only the metadata relevant to navigation, warnings, and traceability.

### Workflow regression

The plan isolates provider preparation before analysis and forbids workflow-gate modifications. Static checks and practical fallback validation confirm that provider state cannot affect approval transitions.

### Skill update governance

Reusable skill changes must pass through Skill Workshop and may require its explicit proposal/application lifecycle. The implementation must preserve Engineering Story approval sequencing while satisfying that tooling requirement.

## Validation Checklist

* [ ] Workspace-local DevLog configuration contract is documented with placeholder values only.
* [ ] Canonical repository path maps explicitly to a DevLog project UUID.
* [ ] No project UUID or local DevLog URL is hardcoded in `SKILL.md`.
* [ ] Adapter safely constructs the existing endpoint and encodes the Story description.
* [ ] Adapter applies an explicit short timeout.
* [ ] Valid non-empty context preserves evidence, provenance, ranking metadata, warnings, decisions, and digest.
* [ ] Every DevLog failure path emits a visible `DEVLOG_CONTEXT_ERROR` message.
* [ ] Every failure message states that Repository Analysis continues without DevLog.
* [ ] Missing mapping, unavailable service, HTTP error, malformed response, and empty evidence all fall back to direct inspection.
* [ ] Kiko uses DevLog for navigation/prioritization and repository reads for verification.
* [ ] Repository remains authoritative over stale or conflicting evidence.
* [ ] Validated knowledge and transient evidence remain distinguishable.
* [ ] Repository Analysis deliverable structure is unchanged.
* [ ] Workflow-gate source and transitions are unchanged.
* [ ] DevLog repository and API are unchanged.
* [ ] Adapter automated tests pass.
* [ ] Successful-path local Engineering Story validation is recorded.
* [ ] DevLog-unavailable fallback validation is recorded.
* [ ] Repository Analysis still stops at Human Approval Gate 1.
* [ ] No unrelated refactoring or DevLog enrichment is included.

## Recommendation

Ready for implementation

The implementation boundary is small, testable, and compatible with the approved Repository Analysis. The existing DevLog contract is sufficient, failure behavior is explicit and non-blocking, and no unresolved architecture or product decision remains.

This recommendation is technical only. It does not approve the Implementation Plan or authorize implementation.

## Approval Required

Implementation Plan completed.

Human approval required before Implementation.

Awaiting explicit human approval.
