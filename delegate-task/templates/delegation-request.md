# Delegation Request Template

## Purpose

This template defines the canonical structure of every delegated engineering
task.

All execution providers must consume this structure.

The goal is to keep engineering workflows provider-independent.

---

# Metadata

Task ID:
{{taskId}}

Execution ID:
{{executionId}}

Timestamp:
{{timestamp}}

Requested By:
{{requester}}

Provider:
{{provider}}

---

# Repository

Repository:
{{repository}}

Branch:
{{branch}}

Working Directory:
{{workingDirectory}}

---

# Task

Type:
{{taskType}}

Title:
{{title}}

Description:

{{description}}

---

# Engineering Context

Project:

{{project}}

Story:

{{story}}

ADR References:

{{adrs}}

Related Documentation:

{{documentation}}

Existing Artifacts:

{{existingArtifacts}}

---

# Objectives

The delegated task shall achieve:

{{objectives}}

---

# Expected Deliverables

The provider must produce:

{{deliverables}}

---

# Constraints

The following constraints are mandatory:

{{constraints}}

Typical examples:

- preserve accepted architecture
- preserve deterministic behaviour
- respect ADRs
- do not introduce unrelated changes
- no automatic commit
- no automatic push
- no automatic merge

---

# Validation Requirements

Before completion the provider shall verify:

{{validation}}

---

# Success Criteria

Execution is successful only if:

{{successCriteria}}

---

# Failure Policy

If execution cannot be completed:

- stop immediately;
- explain the reason;
- preserve diagnostics;
- never fabricate results;
- never claim success without evidence.

---

# Additional Notes

{{notes}}

---

# End of Request
