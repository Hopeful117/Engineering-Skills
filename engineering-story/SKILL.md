# Implementation Delegation

Implementation may be delegated through the Delegate Task skill.

Engineering Story remains responsible for the engineering workflow.

Engineering Story never delegates:

- workflow ownership;
- engineering governance;
- approval gates;
- architecture decisions;
- workflow sequencing.

Delegate Task performs execution only.

---

## Delegation Policy

Engineering Story delegates implementation by invoking the Delegate Task skill.

Engineering Story never communicates directly with execution providers.

Provider selection, runtime validation, execution and result collection are delegated to Delegate Task.

Delegate Task may use any compatible execution provider.

Current provider:

- OpenCode

Future providers may include:

- Codex
- Claude Code
- Gemini CLI
- Developer OS Agents

Engineering Story must remain completely provider-independent.

---

## Delegation Context

Before invoking Delegate Task,
Engineering Story prepares a complete engineering context.

The delegation context includes:

- approved Story;
- approved Repository Analysis;
- approved Implementation Plan (when required);
- relevant ADRs;
- repository conventions;
- implementation constraints;
- validation requirements;
- expected deliverables;
- expected Implementation Report location.

The user must never manually prepare this context.

---

## Delegation Request

Engineering Story creates a Delegation Request.

Delegate Task is responsible for:

- selecting the provider;
- validating execution prerequisites;
- constructing the provider request;
- executing the delegated task;
- validating produced artifacts;
- returning a structured Delegation Result.

Engineering Story never performs provider-specific logic.

---

## Delegation Result

Engineering Story consumes the Delegation Result.

If execution succeeds:

- resume the engineering workflow;
- report generated artifacts;
- report validation results;
- wait for human review.

If execution fails:

- stop immediately;
- preserve diagnostics;
- report the failure;
- request human guidance.

---

# Repository Validation

Before implementation begins,
Engineering Story verifies:

- repository exists;
- repository is a Git repository;
- current branch is known;
- Story directory exists;
- working tree state is known.

Repository validation is completed before Delegate Task is invoked.

---

# IDE Review

The selected execution provider must modify the repository currently opened by the engineer.

Implementation must never occur inside an unknown or hidden repository unless explicitly requested.

After successful execution,
Engineering Story reports:

- modified files;
- created files;
- generated artifacts;
- executed validations;
- executed tests;
- remaining issues.

Engineering Story then waits for human review.

---

# Quality Validation

When SonarQube is configured for the affected module,
implementation validation must include a SonarQube analysis.

The execution provider must report:

- analyzed project key;
- analysis command;
- Quality Gate status;
- new bugs;
- new vulnerabilities;
- new security hotspots;
- new code smells;
- new-code coverage;
- duplicated lines on new code.

A failed Quality Gate must never be reported as a successful implementation.

SonarQube findings outside Story scope must not be corrected without explicit human approval.

Engineering Story never commits automatically.

---

# Human Interaction

OpenClaw remains the interactive interface.

If the execution provider reports:

- missing information;
- architectural conflict;
- contradictory requirements;
- dependency problems;
- unsafe Git state;
- validation failures;

Engineering Story stops immediately and requests human guidance.

After implementation,
Engineering Story summarizes the work and waits for review.

---

# User Interaction

Normal interaction remains intentionally minimal.

Supported examples:

Use engineering-story for Story <id>

Continue Story <id>

Approve and continue Story <id>

Reject Story <id>

Delegate this implementation.

Delegate this documentation audit.

Engineering Story automatically invokes Delegate Task when delegation is requested.

The user must never specify:

- workflow stage;
- artifact paths;
- repository documents;
- provider-specific commands;
- provider authentication;
- workflow sequencing;
- provider implementation details.

Engineering Story owns workflow orchestration from beginning to end.
