# OpenCode Provider

## Purpose

This provider executes delegated engineering tasks through an OpenCode runtime.

It translates a generic delegation request into an OpenCode execution.

The provider is responsible only for execution.

It never owns engineering decisions.

---

# Responsibilities

The provider is responsible for:

- verifying the OpenCode runtime;
- verifying connectivity;
- verifying authentication;
- preparing the execution request;
- executing the task;
- collecting execution results;
- returning a structured execution report.

The provider is NOT responsible for:

- deciding what to execute;
- validating architecture;
- approving implementation;
- reviewing code;
- committing changes.

---

# Runtime Discovery

Before executing any task the provider must verify:

- OpenCode CLI is available.
- OpenCode server is reachable.
- Authentication is valid.
- Repository exists.
- Repository is clean enough for execution.

If one verification fails, stop immediately.

---

# Execution Context

The provider receives:

- repository
- branch
- task
- engineering context
- constraints
- expected artifacts

The provider must not infer missing requirements.

---

# Execution Rules

The provider must:

- work only inside the provided repository;
- preserve existing files unless requested;
- follow repository conventions;
- respect engineering constraints;
- preserve deterministic behaviour.

The provider must never:

- commit;
- push;
- merge;
- bypass approval gates;
- ignore validation failures.

---

# Prompt Construction

The provider converts the generic delegation request into an OpenCode prompt.

The prompt should include:

- engineering objective;
- repository context;
- expected artifacts;
- constraints;
- validation requirements;
- completion criteria.

Provider-specific prompt formatting belongs here.

---

# Expected Artifacts

Typical artifacts include:

- repository-analysis.md
- implementation-plan.md
- implementation-report.md
- code-review.md
- engineering-report.md

The caller determines which artifacts are expected.

---

# Result Validation

Execution is considered successful only if:

- requested artifacts exist;
- execution completed without provider errors;
- constraints were respected.

Otherwise return FAILURE.

---

# Structured Result

Example:

```yaml
status: SUCCESS

provider: opencode

repository: trading-os

artifacts:
  - implementation-report.md

warnings: []

errors: []
```

---

# Failure Handling

Possible failures include:

- runtime unavailable;
- authentication failure;
- repository not found;
- provider execution error;
- missing artifacts.

Return structured diagnostics.

Do not retry automatically unless explicitly requested.

---

# Security

Never expose:

- passwords;
- tokens;
- secrets;
- environment variables.

Never log sensitive information.

---

# Future Compatibility

This provider implements the Delegate Task provider contract.

Future providers should expose equivalent behaviour so workflows remain provider-independent.
