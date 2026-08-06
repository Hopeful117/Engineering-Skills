# OpenCode Delegation Contract

## Prerequisites

Before OpenClaw can delegate work to OpenCode, the execution environment must provide:

- OPENCODE_SERVER_USERNAME
- OPENCODE_SERVER_PASSWORD

OpenClaw must inherit these variables from its execution environment.

The skill must never hardcode credentials.

If the variables are missing, delegation must stop before invoking OpenCode.

## Purpose

This document defines how the `engineering-story` skill delegates implementation work to OpenCode.

OpenCode is responsible only for implementation.

It is not responsible for engineering analysis, implementation planning, architectural decisions, workflow coordination, code review, or human approval.

The `engineering-story` skill remains the workflow orchestrator.

---

# Engineering Responsibilities

## Engineering Story

Engineering Story is responsible for:

* locating the current Story;
* validating workflow state;
* loading approved Engineering Artifacts;
* verifying implementation authorization;
* preparing the delegation context;
* invoking OpenCode;
* resuming the workflow after implementation.

---

## OpenCode

OpenCode is responsible for:

* reading the delegated engineering context;
* implementing the approved work;
* remaining inside the approved Story scope;
* respecting repository conventions;
* producing an Implementation Report.

---

## Human Engineer

The human engineer remains responsible for:

* approving Repository Analysis;
* approving Implementation Plans;
* approving architectural decisions;
* reviewing implementations;
* approving merges.

Approval authority is never delegated.

---

# Required Engineering Artifacts

Implementation delegation requires:

* `story.md`
* `repository-analysis.md`
* `implementation-plan.md`

Repository Analysis and Implementation Plan must have explicit human approval.

File existence alone is never sufficient.

---

# Runtime Configuration

The OpenCode executable must be explicitly configured.

The orchestrator must never depend on the user's interactive shell PATH.

Example:

```text
/home/ludo/.local/bin/opencode
```

Before delegation the executable must be verified:

```text
opencode --version
```

If the executable cannot be started, delegation must stop.

---

# Invocation

OpenCode should be executed in non-interactive mode.

Preferred form:

```text
opencode run \
    --dir <repository> \
    "<delegation prompt>"
```

The repository path must always be explicit.

---

# Delegation Context

Engineering Story delegates:

* repository path;
* current branch;
* Story;
* Repository Analysis;
* approved Implementation Plan;
* relevant documentation;
* relevant ADRs;
* implementation scope;
* implementation exclusions;
* validation requirements;
* Implementation Report path.

Engineering Artifacts are the authoritative context.

Conversation history is not.

---

# Pre-Delegation Validation

Before delegation Engineering Story must verify:

* repository exists;
* Git repository detected;
* Story exists;
* Repository Analysis exists;
* Repository Analysis approved;
* Implementation Plan exists;
* Implementation Plan approved;
* OpenCode executable available;
* implementation not already completed.

If one validation fails, delegation must stop.

---

# Git Safety

OpenCode must never:

* commit automatically;
* push automatically;
* merge automatically;
* rewrite Git history;
* delete branches;
* discard user modifications.

OpenCode must detect existing working-tree changes before implementation.

---

# Implementation Rules

OpenCode must:

* implement only the approved plan;
* preserve repository architecture;
* respect module boundaries;
* avoid unrelated refactoring;
* document deviations;
* stop if implementation requires an unapproved architectural decision.

Scope expansion is forbidden.

---

# Validation

When requested by the Implementation Plan, OpenCode should execute available validation.

Typical validation includes:

* compilation;
* unit tests;
* integration tests;
* formatting;
* static analysis.

Validation results must distinguish:

* executed successfully;
* executed with failures;
* not executed.

OpenCode must never claim that a test passed if it was not executed.

---

# Implementation Report

Implementation must produce:

```text
stories/<story>/implementation-report.md
```

The report should contain:

* implementation summary;
* modified files;
* created files;
* validation executed;
* validation results;
* deviations;
* remaining risks;
* completion status.

Implementation is incomplete until this report exists.

---

# Return of Control

When implementation finishes:

1. OpenCode stops.
2. Engineering Story resumes.
3. Engineering Story verifies the Implementation Report.
4. Code Review becomes the next workflow stage.

OpenCode does not perform Code Review during implementation.

---

# Failure Handling

Delegation must stop when:

* required artifacts are missing;
* approval cannot be verified;
* OpenCode is unavailable;
* repository cannot be identified;
* implementation exceeds Story scope;
* implementation conflicts with an accepted ADR;
* validation exposes a blocking failure.

Partial implementation must be reported explicitly.

---

# Completion Status

OpenCode must end with exactly one status:

* IMPLEMENTATION COMPLETED
* IMPLEMENTATION COMPLETED WITH NOTES
* IMPLEMENTATION BLOCKED

These statuses describe implementation only.

They do not represent human approval.

---

# Constraints

OpenCode must never:

* bypass approval gates;
* approve its own work;
* infer approval from file existence;
* silently change architecture;
* modify unrelated files;
* expose secrets;
* commit automatically;
* merge automatically.

---

# Principle

Engineering Story decides **what** should be implemented.

OpenCode decides **how** to implement the approved work.

The human engineer remains responsible for every engineering approval.

