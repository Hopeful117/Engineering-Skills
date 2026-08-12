# Engineering Skills Conventions

## Purpose

This document defines the engineering conventions that every skill in this repository must follow.

These conventions ensure that all skills behave consistently, remain predictable, and integrate into the same engineering workflow.

Every new skill should comply with these rules unless an explicit exception is documented.

---

# Core Principles

Every skill should:

* solve one engineering problem;
* have a single responsibility;
* follow an explicit workflow;
* produce standardized artifacts;
* remain deterministic whenever possible;
* stop at defined approval gates;
* preserve human control.

---

# Skill Structure

Every skill must follow the same directory layout.

```text
skill-name/
│
├── SKILL.md
├── prompts/
├── templates/
└── references/
```

Each directory has a single responsibility.

---

# SKILL.md

The SKILL.md file is the workflow orchestrator.

It defines:

* the mission;
* the workflow stages;
* delegation rules;
* approval gates;
* stop conditions.

SKILL.md should remain concise.

It should coordinate the workflow, not replace the workflow stages.

---

# Prompts

Each prompt represents one engineering stage.

Examples:

* Repository Analysis
* Implementation Plan
* Implementation
* Code Review
* Engineering Report

Every prompt should define:

* Mission
* Inputs
* Objectives
* Deliverable
* Constraints
* Stop Condition

Prompts should focus on one responsibility only.

---

# Templates

Templates define standardized engineering artifacts.

Templates should specify output structure only.

They should not contain workflow logic.

Examples include:

* Repository Analysis
* Implementation Plan
* Implementation Report
* Code Review Report
* Engineering Report

---

# References

References provide supporting documentation.

They may contain:

* engineering guidance;
* technology notes;
* architectural references;
* coding standards.

References must never override repository-specific documentation.

---

# Workflow

Every workflow should follow explicit engineering stages.

Typical workflow:

```text
Story
    ↓
Repository Analysis
    ↓
Human Approval
    ↓
Implementation Plan
    ↓
Human Approval
    ↓
Implementation
    ↓
Code Review
    ↓
Human Approval
    ↓
Engineering Report
```

Workflows may differ between skills, but they must remain explicit and reviewable.

---

# Responsibilities

A workflow stage should have exactly one responsibility.

Examples:

* Repository Analysis understands.
* Implementation Plan prepares.
* Implementation builds.
* Code Review verifies.
* Engineering Report summarizes.

A stage must not perform the responsibility of another stage.

---

# Approval Gates

Skills must never bypass required approval gates.

When approval is required, the workflow must stop.

Examples include:

* Repository Analysis approval;
* Implementation Plan approval;
* explicit external pull request validation before merge when repository policy requires it.

When a workflow owns repository delivery through commit and pull request
creation, it should also define a conservative post-validation local cleanup
policy. That cleanup must never delete unmerged branches or discard unrelated
local work.

---

# Engineering Artifacts

Every stage should produce a reusable artifact.

Artifacts should:

* have a predictable structure;
* be understandable without additional context;
* be reusable by later workflow stages.

Artifacts should never be replaced by free-form conversation.

---

# Human Authority

The human engineer remains responsible for:

* priorities;
* architecture decisions;
* implementation approval;
* merge approval;
* release decisions.

Skills assist engineering.

They do not replace engineering judgment.

---

# Tool Independence

Engineering Skills should remain as tool-independent as possible.

Skills should describe engineering behavior rather than vendor-specific behavior.

Repository-specific documentation remains authoritative.

---

# Naming

Use clear and descriptive names.

Examples:

* engineering-story
* bug-fix
* architecture-review

Avoid abbreviations when possible.

---

# Documentation

Every skill should provide:

* a clear purpose;
* documented workflow;
* reusable prompts;
* standardized templates;
* references where appropriate.

Documentation should evolve together with the skill.

---

# Versioning

Skills should evolve incrementally.

Avoid breaking workflow behavior without documentation.

Significant workflow changes should be reflected in the repository changelog.

---

# Future Evolution

Future versions may introduce:

* shared prompts;
* shared templates;
* workflow inheritance;
* reusable engineering components;
* automated orchestration.


# Engineering Changes

Engineering changes affect the repository architecture, workflow, or engineering behavior.

Engineering changes require:

- a GitHub Issue;
- a Story;
- the Engineering Story workflow;
- human approval before integration.

Examples include:

- new skills;
- workflow modifications;
- prompt changes;
- architectural decisions;
- new engineering artifacts.


# Editorial Changes

Editorial changes do not modify engineering behavior.

Examples include:

- spelling corrections;
- formatting;
- broken links;
- metadata updates;
- wording improvements.

Editorial changes may be applied directly when they do not alter engineering intent.


# Workflow Rule

Engineering Skills develops itself.

Every engineering change should be introduced through the Engineering Story workflow.

The repository serves as the reference implementation of its own engineering process.

These improvements should preserve the conventions defined in this document.
