# Delegation Result Template

## Purpose

This template defines the canonical result returned by every execution provider.

Every provider must produce the same logical result regardless of its internal
implementation.

The calling workflow must never depend on provider-specific output.

---

# Metadata

Execution ID:
{{executionId}}

Task ID:
{{taskId}}

Provider:
{{provider}}

Repository:
{{repository}}

Branch:
{{branch}}

Started At:
{{startedAt}}

Completed At:
{{completedAt}}

Duration:
{{duration}}

---

# Status

Execution Status:

{{status}}

Allowed values:

- SUCCESS
- PARTIAL_SUCCESS
- FAILURE
- CANCELLED

---

# Summary

{{summary}}

---

# Requested Deliverables

{{requestedDeliverables}}

---

# Produced Deliverables

{{producedDeliverables}}

---

# Modified Files

{{modifiedFiles}}

---

# Validation

Validation Executed:

{{validationExecuted}}

Validation Result:

{{validationResult}}

---

# Warnings

{{warnings}}

If none:

None.

---

# Errors

{{errors}}

If none:

None.

---

# Diagnostics

Execution Diagnostics:

{{diagnostics}}

Examples:

- provider timeout
- authentication failure
- repository unavailable
- validation failed
- dependency missing

---

# Constraint Verification

Every delegated execution must verify:

| Constraint | Status |
|------------|--------|
| No automatic commit | {{noCommit}} |
| No automatic push | {{noPush}} |
| No automatic merge | {{noMerge}} |
| Architecture preserved | {{architecture}} |
| ADR constraints respected | {{adrConstraints}} |
| Validation completed | {{validationCompleted}} |

---

# Human Review Required

Human Review:

{{humanReview}}

Typical values:

- Required
- Recommended
- Not Required

---

# Next Suggested Step

{{nextStep}}

Examples:

- Continue engineering workflow
- Execute code review
- Review generated artifacts
- Resolve validation failures

---

# Provider Notes

{{providerNotes}}

---

# End of Result
