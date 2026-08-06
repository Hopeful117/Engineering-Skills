---
name: delegate-task
description: Delegates engineering tasks to an external execution provider while preserving the engineering workflow, traceability, and human approval process.
version: 1.0.0
author: HopeCodeSec
---

# Delegate Task

## Purpose

This skill delegates an approved engineering task to an external execution
provider.

The skill is provider-agnostic.

Its responsibilities are to:

- validate the delegation request;
- select the requested provider;
- prepare the execution context;
- delegate the task;
- validate the returned artifacts;
- return a structured execution result.

This skill never performs engineering work itself.

---

# Responsibilities

The Delegate Task skill is responsible for:

- validating delegation requests;
- selecting an execution provider;
- preparing the execution context;
- invoking the provider;
- validating returned artifacts;
- reporting execution status.

The Delegate Task skill is NOT responsible for:

- architecture decisions;
- implementation decisions;
- code review;
- documentation review;
- committing code;
- pushing code;
- merging branches.

Those responsibilities remain owned by the calling engineering workflow.

---

# Supported Tasks

Examples include:

- repository analysis
- implementation planning
- implementation
- code review
- documentation audit
- architecture audit
- engineering report generation
- documentation generation

The exact task is determined by the calling workflow.

---

# Provider Model

Execution is delegated through a provider.

Current provider:

- OpenCode

Future providers may include:

- Codex
- Claude Code
- Gemini CLI
- Developer OS Agents

The calling workflow should not depend on provider-specific behaviour.

---

# Delegation Lifecycle

The Delegate Task skill follows this lifecycle:

1. Validate the request.
2. Resolve the provider.
3. Prepare the execution context.
4. Delegate execution.
5. Wait for completion.
6. Validate returned artifacts.
7. Return a structured execution result.

---

# Inputs

A delegation request should contain:

- task
- provider
- repository
- branch (optional)
- expected artifacts
- constraints
- success criteria

---

# Outputs

The skill returns a structured execution result.

Example:

```yaml
status: SUCCESS

provider: opencode

task: implementation

repository: trading-os

artifacts:
  - implementation-report.md

warnings: []

errors: []
```

---

# Constraints

This skill must never:

- commit code;
- push code;
- merge branches;
- bypass human approval;
- modify engineering workflows.

The provider only executes delegated work.

The calling workflow remains responsible for governance.

---

# Error Handling

If delegation fails:

- capture the failure;
- preserve diagnostic information;
- return a structured failure result;
- never silently retry without explicit provider policy.

---

# Extensibility

Provider-specific logic must remain outside this skill.

Provider implementations belong under:

providers/

Example:

providers/
    opencode.md

Future providers may be added without modifying this skill.

---

# Related Skills

Typical callers include:

- engineering-story
- documentation-audit
- architecture-review
- code-review

---

# Future Evolution

Future versions may support:

- provider capability discovery;
- automatic provider selection;
- fallback providers;
- execution policies;
- multi-provider orchestration;
- parallel delegation;
- Developer OS native agents.

These capabilities must remain transparent to calling workflows.
