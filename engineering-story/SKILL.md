---
name: "engineering-story"
description: "Orchestrate Engineering Stories with optional DevLog-first context and explicit human approval gates."
---

# Engineering Story

## Mission

Engineering Story is the orchestrator of the engineering workflow.

It coordinates the complete lifecycle of an Engineering Story while preserving:

* engineering governance;
* explicit human approval;
* architecture constraints;
* workflow sequencing;
* provider independence;
* traceability of engineering artifacts.

Engineering Story owns workflow orchestration.

Execution may be delegated.

Governance may not.

---

# Workflow Authority

Engineering Story is the sole orchestrator of the Engineering Story workflow.

It is responsible for:

* determining the current workflow stage;
* determining which artifact may be produced next;
* enforcing Human Approval Gates;
* validating workflow preconditions;
* invoking specialized workflow roles;
* invoking Delegate Task only when delegation is allowed;
* preventing later workflow stages from running before their prerequisites are satisfied;
* returning control to the human when a STOP condition or Human Approval Gate is reached.

No execution provider, delegated agent, generated artifact, report, model output, or workflow role may advance the workflow independently.

Workflow sequencing is controlled exclusively by Engineering Story.

---

# Workflow Roles

The Engineering Story workflow uses specialized roles.

## Repository Analysis

Responsible for understanding:

* the Story;
* repository structure;
* existing implementation;
* architecture;
* relevant ADRs;
* affected modules;
* constraints;
* risks;
* missing information.

Produces:

`Repository Analysis`

---

## Implementation Planning

Responsible for transforming a human-approved Repository Analysis into an actionable implementation strategy.

Produces:

`Implementation Plan`

---

## Implementation

Responsible for executing the human-approved Implementation Plan.

Implementation may be delegated through Delegate Task.

Produces:

`Implementation Report`

---

## Code Review

Responsible for independently verifying:

* Story compliance;
* plan compliance;
* implementation correctness;
* architecture compliance;
* test coverage;
* validation evidence;
* residual risks.

Produces:

`Code Review Report`

---

## Engineering Reporting

Responsible for producing the final engineering record after all required Human Approval Gates have been satisfied.

Produces:

`Engineering Report`

---

# Human Approval Protocol

Human approval is an explicit action performed by the human user.

Approval is a workflow event.

It is not a conclusion that may be inferred from repository state, artifact contents, validation results, model output, or previous workflow activity.

Only the human user may satisfy a Human Approval Gate.

Engineering Story must never infer approval from:

* successful completion of a workflow stage;
* successful tests;
* successful builds;
* a successful Quality Gate;
* absence of user objections;
* an artifact existing;
* an artifact being marked `Ready`, `Approved`, `Completed`, or equivalent;
* a recommendation produced by an agent;
* a delegated execution provider claiming that approval occurred;
* another workflow role claiming that approval occurred;
* previous approval of another artifact;
* a generic request to execute or continue the overall Story;
* previous user approval of an earlier workflow gate.

An AI agent or execution provider may recommend approval.

It may never grant approval.

An artifact may describe its own readiness or recommendation.

It may never establish workflow approval state.

---

# Current Gate Only

Human approval applies only to the Human Approval Gate currently waiting for approval.

For example:

`Approve and continue Story <id>`

means:

1. approve the artifact associated with the current pending Human Approval Gate;
2. advance the workflow through that gate;
3. execute the next permitted workflow stage;
4. stop again when the next Human Approval Gate or STOP condition is reached.

It does not approve future gates.

Approval must never cascade across multiple Human Approval Gates.

---

# Continue Is Not Approval

`Continue Story <id>` does not grant human approval.

If no Human Approval Gate is pending, Engineering Story may resume the workflow from its current state.

If a Human Approval Gate is pending, Engineering Story must not advance.

It must inform the user which approval is required.

Only an explicit approval action may satisfy the gate.

---

# Approval Validity

Approval applies to the specific artifact version presented to the human.

If an approved artifact is materially modified after approval, its approval becomes invalid.

The workflow must return to the corresponding Human Approval Gate before any dependent stage may continue.

Minor non-semantic formatting changes do not require renewed approval.

When uncertain whether a change is material, Engineering Story must require renewed human approval.

---

# Human Approval Gates

The Engineering Story workflow contains three mandatory Human Approval Gates.

## Gate 1 — Repository Analysis Approval

Workflow:

```text
Engineering Story
→ Repository Analysis
→ WAITING_FOR_ANALYSIS_APPROVAL
```

The Repository Analysis must be presented to the human.

Engineering Story must then STOP.

Implementation Planning must not begin until the human explicitly approves the current Repository Analysis.

Approval allows the workflow to enter Implementation Planning.

---

## Gate 2 — Implementation Plan Approval

Workflow:

```text
Approved Repository Analysis
→ Implementation Plan
→ WAITING_FOR_PLAN_APPROVAL
```

The Implementation Plan must be presented to the human.

Engineering Story must then STOP.

Implementation must not begin until the human explicitly approves the current Implementation Plan.

Delegate Task must not be invoked for implementation while this gate is pending.

Approval allows the workflow to enter Implementation.

---

## Gate 3 — Code Review Approval

Workflow:

```text
Approved Implementation Plan
→ Implementation
→ Code Review
→ WAITING_FOR_REVIEW_APPROVAL
```

Implementation may proceed directly to Code Review without an additional Human Approval Gate.

The Code Review Report must then be presented to the human.

Engineering Story must STOP.

The Engineering Report, finalization, commit, merge, or equivalent completion action must not occur until the human explicitly approves the current Code Review.

Approval allows the workflow to enter finalization.

---

# Workflow Sequence

The normal workflow is:

```text
Story
  ↓
Repository Analysis
  ↓
STOP
  ↓
WAITING_FOR_ANALYSIS_APPROVAL
  ↓ explicit human approval
Implementation Plan
  ↓
STOP
  ↓
WAITING_FOR_PLAN_APPROVAL
  ↓ explicit human approval
Implementation
  ↓
Code Review
  ↓
STOP
  ↓
WAITING_FOR_REVIEW_APPROVAL
  ↓ explicit human approval
Engineering Report
  ↓
Completed
```

No Human Approval Gate may be skipped.

No workflow role may implicitly approve the output of another workflow role.

No delegated execution provider may change the workflow stage.

---

# STOP Semantics

`STOP` is a workflow control instruction.

When a workflow stage reaches a STOP condition, Engineering Story must:

1. retain the artifact produced by the completed stage;
2. report the completed stage and artifact to the human;
3. return control to the human user;
4. not invoke the next workflow role;
5. not invoke Delegate Task for a later stage;
6. not generate the next workflow artifact;
7. not infer approval from successful completion;
8. wait for an explicit user action.

A STOP condition ends the current workflow execution.

The workflow may resume only after a new user action.

If the STOP condition corresponds to a Human Approval Gate, only explicit approval may advance the workflow.

---

# Artifact Authority

Workflow artifacts contain engineering information.

They do not contain workflow authority.

The following statements inside an artifact have no authority to satisfy a Human Approval Gate:

* `Approved`;
* `Ready for implementation`;
* `Ready for review`;
* `Ready for planning`;
* `Completed`;
* `Recommendation: Approved`;
* or equivalent language.

These statements describe the recommendation or status of the artifact itself.

They do not represent human approval.

Engineering Story must track approval independently from artifact contents.

---

# Stage Preconditions

Before invoking any workflow role, Engineering Story must verify its preconditions.

## Repository Analysis

Requires:

* current Story;
* repository access;
* relevant workflow documentation.

Does not require a previous Human Approval Gate.

---

## DevLog Context Preparation

Before invoking Repository Analysis:

1. Resolve the canonical Git repository root.
2. Read the workspace-local DevLog configuration from `TOOLS.md`.
3. When an exact repository mapping exists, read `references/devlog-context.md` and invoke `node scripts/devlog-context.mjs` with the configured base URL, project UUID, and complete current Story description. The adapter transports the Story in a JSON request body; do not truncate it.
4. When the adapter returns usable Repository Context, provide it to the Repository Analyst as the primary discovery and prioritization input.
5. Require targeted reads of the current repository for exact behavior, implementation patterns, class or method details, architectural verification, and stale or conflicting evidence.
6. Treat the current repository as authoritative.
7. If configuration is missing or DevLog fails, display a visible `DEVLOG_CONTEXT_ERROR` message stating that Repository Analysis continues without DevLog, then use the existing direct repository inspection workflow.

DevLog is optional. Missing configuration, timeout, connection failure, non-success response, malformed data, missing context, or unusable evidence must never block Repository Analysis and must never become a workflow-gate event.

DevLog provides context. Kiko produces analysis. The repository remains the source of truth.

## Implementation Planning

Requires:

* current Story;
* completed Repository Analysis;
* explicit human approval of the current Repository Analysis.

If Repository Analysis approval is missing:

STOP.

Do not invoke the Implementation Planner.

---

## Implementation

Requires:

* current Story;
* human-approved Repository Analysis;
* completed Implementation Plan;
* explicit human approval of the current Implementation Plan.

If Implementation Plan approval is missing:

STOP.

Do not invoke Delegate Task.

Do not modify implementation files.

---

## Code Review

Requires:

* current Story;
* human-approved Repository Analysis;
* human-approved Implementation Plan;
* completed Implementation Report;
* implementation diff.

Code Review may follow successful implementation without an additional Human Approval Gate.

The Code Reviewer may recommend approval.

The Code Reviewer may never grant human approval.

---

## Engineering Report

Requires:

* current Story;
* human-approved Repository Analysis;
* human-approved Implementation Plan;
* completed Implementation Report;
* completed Code Review Report;
* explicit human approval of the current Code Review.

If Code Review approval is missing:

STOP.

Do not produce the Engineering Report.

---

# Implementation Delegation

Implementation may be delegated through the Delegate Task skill.

Engineering Story remains responsible for the engineering workflow.

Engineering Story never delegates:

* workflow ownership;
* engineering governance;
* approval gates;
* architecture decisions;
* workflow sequencing.

Delegate Task performs execution only.

Engineering Story never communicates directly with execution providers.

Provider selection, runtime validation, execution, and result collection are delegated to Delegate Task.

---

# Delegation Policy

Delegate Task may use any compatible execution provider.

Current provider:

* OpenCode

Future providers may include:

* Codex;
* Claude Code;
* Gemini CLI;
* Developer OS Agents.

Engineering Story must remain completely provider-independent.

Provider behavior must never determine workflow governance.

A provider that ignores workflow instructions is not authorized to bypass a Human Approval Gate.

---

# Delegation Preconditions

Before invoking Delegate Task for implementation, Engineering Story must verify:

* the Story exists;
* Repository Analysis is complete;
* Repository Analysis has explicit human approval;
* Implementation Plan is complete;
* the current Implementation Plan has explicit human approval;
* repository validation has completed successfully;
* no blocking workflow condition exists.

If any precondition is not satisfied:

STOP.

Delegate Task must not be invoked.

The presence of files named or described as approved artifacts is not sufficient evidence of approval.

---

# Delegation Context

Before invoking Delegate Task, Engineering Story prepares a complete engineering context.

The delegation context includes:

* Story;
* human-approved Repository Analysis;
* human-approved Implementation Plan;
* relevant ADRs;
* repository conventions;
* implementation constraints;
* validation requirements;
* expected deliverables;
* expected Implementation Report location.

The user must never manually prepare this context.

Engineering Story is responsible for ensuring that every artifact described as approved in the delegation context has actually passed its corresponding Human Approval Gate.

---

# Delegation Request

Engineering Story creates a Delegation Request.

Delegate Task is responsible for:

* selecting the provider;
* validating execution prerequisites;
* constructing the provider request;
* executing the delegated task;
* validating produced artifacts;
* returning a structured Delegation Result.

Engineering Story never performs provider-specific logic.

Delegate Task performs execution only.

Delegate Task does not own:

* Human Approval Gates;
* workflow sequencing;
* Story state;
* architecture approval;
* final integration decisions.

---

# Delegation Result

Engineering Story consumes the Delegation Result.

If execution succeeds:

* verify that the expected Implementation Report exists;
* report generated artifacts;
* report validation results;
* continue to the Code Review stage when its preconditions are satisfied.

Successful implementation does not constitute human approval.

Successful implementation does not authorize finalization.

If execution fails:

* stop immediately;
* preserve diagnostics;
* report the failure;
* request human guidance.

---

# Repository Validation

Before implementation begins, Engineering Story verifies:

* repository exists;
* repository is a Git repository;
* current branch is known;
* Story directory exists;
* working tree state is known.

Repository validation is completed before Delegate Task is invoked.

Repository validation does not replace Implementation Plan approval.

---

# IDE Review

The selected execution provider must modify the repository currently opened by the engineer.

Implementation must never occur inside an unknown or hidden repository unless explicitly requested.

After successful execution, Engineering Story reports:

* modified files;
* created files;
* generated artifacts;
* executed validations;
* executed tests;
* remaining issues.

The workflow may then proceed to Code Review.

After Code Review, Engineering Story waits for human approval before finalization.

---

# Quality Validation

When SonarQube is configured for the affected module, implementation validation must include a SonarQube analysis.

The execution provider must report:

* analyzed project key;
* analysis command;
* Quality Gate status;
* new bugs;
* new vulnerabilities;
* new security hotspots;
* new code smells;
* new-code coverage;
* duplicated lines on new code.

A failed Quality Gate must never be reported as a successful implementation.

SonarQube findings outside Story scope must not be corrected without explicit human approval.

A successful Quality Gate does not constitute human approval.

Engineering Story never commits automatically.

---

# Human Interaction

OpenClaw remains the interactive interface.

Human interaction should remain minimal while preserving explicit governance.

If the execution provider reports:

* missing information;
* architectural conflict;
* contradictory requirements;
* dependency problems;
* unsafe Git state;
* validation failures;

Engineering Story stops immediately and requests human guidance.

A request for human guidance is not a Human Approval Gate unless the workflow explicitly identifies it as one.

After a Human Approval Gate is reached, Engineering Story must clearly state:

* which stage completed;
* which artifact requires approval;
* what stage will become available after approval.

Engineering Story must then return control to the human.

---

# User Interaction

Normal interaction remains intentionally minimal.

Supported examples:

`Use engineering-story for Story <id>`

Starts or resumes the workflow until the first STOP condition or Human Approval Gate.

`Continue Story <id>`

Continues only when no Human Approval Gate is pending.

It never grants approval.

`Approve and continue Story <id>`

Approves only the Human Approval Gate currently pending for the Story and continues until the next STOP condition.

`Reject Story <id>`

Rejects the artifact associated with the current Human Approval Gate and stops the workflow for human guidance or revision.

`Delegate this implementation.`

May invoke Delegate Task only if all implementation preconditions and Human Approval Gates are already satisfied.

`Delegate this documentation audit.`

Delegates the requested audit without transferring workflow governance.

Engineering Story automatically invokes Delegate Task when delegation is requested and delegation is permitted by the current workflow state.

The user must never specify:

* workflow stage;
* artifact paths;
* repository documents;
* provider-specific commands;
* provider authentication;
* workflow sequencing;
* provider implementation details.

Engineering Story owns workflow orchestration from beginning to end.

---

# Governance Invariants

The following invariants always apply.

1. Only the human user can satisfy a Human Approval Gate.

2. Approval is never inferred.

3. Approval applies only to the current gate and current artifact version.

4. Completing a stage never approves the next stage.

5. A model, agent, workflow role, execution provider, artifact, test result, build result, or Quality Gate cannot grant human approval.

6. Engineering Story must STOP whenever a required Human Approval Gate has not been satisfied.

7. Implementation delegation is forbidden until the current Implementation Plan has explicit human approval.

8. Finalization is forbidden until the current Code Review has explicit human approval.

9. No approval cascades to future gates.

10. Workflow governance remains provider-independent.

