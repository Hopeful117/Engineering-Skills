# Delegation Prompt

## Purpose

This document defines the canonical delegation prompt used by the Delegate Task
skill.

Its purpose is to transform a structured engineering request into a provider
execution request.

Providers may adapt formatting but must preserve the meaning of every section.

---

# Delegation Request

You are receiving a delegated engineering task.

Execute the requested work only.

Do not perform unrelated modifications.

Respect every engineering constraint.

---

# Task

{{task}}

---

# Repository

{{repository}}

---

# Branch

{{branch}}

---

# Context

{{context}}

This context is authoritative.

Do not infer missing requirements.

---

# Objectives

{{objectives}}

---

# Expected Deliverables

{{artifacts}}

Only produce the requested deliverables.

---

# Constraints

{{constraints}}

Typical constraints may include:

- preserve architecture
- follow existing conventions
- respect accepted ADRs
- preserve deterministic behaviour
- do not introduce unrelated changes
- do not commit
- do not push
- do not merge

---

# Validation Requirements

Before considering the task complete verify:

- requested artifacts exist;
- requested modifications are complete;
- validation requirements have been executed;
- engineering constraints were respected.

---

# Failure Policy

If the task cannot be completed:

Stop.

Explain why.

Never fabricate results.

Never claim success without evidence.

---

# Output Format

Return a structured execution report containing:

## Status

SUCCESS

or

FAILURE

---

## Summary

Short description of completed work.

---

## Modified Files

List every modified file.

---

## Generated Artifacts

List every generated artifact.

---

## Validation

Describe every executed validation.

---

## Warnings

List remaining concerns.

If none:

None.

---

## Errors

List execution errors.

If none:

None.

---

## Completion

The task is complete only if:

- every requested artifact exists;
- validation has been completed;
- constraints have been respected.

Otherwise return FAILURE.
