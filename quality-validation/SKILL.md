---
name: quality-validation
description: Determines and executes repository-appropriate quality validation for an Engineering Story without owning workflow approval or sequencing.
version: 1.0.0
author: HopeCodeSec
---

# Quality Validation

## Purpose

This skill determines and executes the quality validation appropriate for the
current repository, Story scope, affected modules, and technical stack.

Its goal is to produce structured, reviewable quality evidence for the
Engineering Story workflow.

This skill does not own workflow authority.

It does not grant approval.

It does not advance workflow state.

---

# Responsibilities

The Quality Validation skill is responsible for:

- determining which quality checks are applicable;
- executing or coordinating those checks;
- recording what was executed and what was not;
- reporting structured outcomes and evidence;
- identifying blocked, unavailable, or non-applicable checks explicitly;
- requiring representative outcome validation when repository behavior demands
  more than mechanical coverage.

The Quality Validation skill is NOT responsible for:

- granting human approval;
- deciding workflow stage transitions;
- authorizing implementation;
- rewriting Story scope;
- performing Code Review;
- producing the final Engineering Report;
- committing, pushing, or merging.

Those responsibilities remain owned by the calling engineering workflow.

---

# Inputs

The skill should receive the smallest repository-aware context needed to decide
quality applicability, for example:

- the current Story;
- the approved Repository Analysis when available;
- the approved Implementation Plan when available;
- affected modules, files, or packages when known;
- repository conventions and toolchain signals;
- validation constraints already defined by the calling workflow.

If essential repository information is missing, the skill must report the
missing information explicitly instead of inventing applicability.

---

# Applicability Model

The skill must determine quality validation from the repository reality rather
than a fixed universal checklist.

It should consider signals such as:

- build system and package managers;
- backend versus frontend modules;
- configured linters and formatters;
- coverage tooling;
- static-analysis tooling;
- SonarQube or equivalent quality-gate systems;
- test types present in the repository;
- Story-specific behavioral risk.

Typical validation categories include:

- compilation or build;
- unit tests;
- integration tests;
- end-to-end tests;
- lint;
- format verification;
- static analysis;
- coverage gates;
- SonarQube or equivalent quality-gate analysis;
- representative outcome validation.

The skill must not claim a category is applicable without repository evidence.

The skill must not omit a repository-defined gate that applies to the affected
modules.

---

# Representative Outcome Validation

Mechanical correctness, coverage, and regression checks are not always
sufficient.

When the Story changes ranking, allocation, prioritization, routing, or another
behavior where the main risk is quality of selection or outcome rather than
basic execution, the skill must require representative outcome validation.

Representative outcome validation should demonstrate that the implemented
behavior produces the intended result on realistic inputs.

If such validation is applicable but absent, the skill must report that gap
explicitly.

---

# Output Contract

The skill returns structured quality-validation evidence.

Read `references/result-contract.md` for the detailed contract.

At minimum, the result must identify:

- affected modules or surfaces;
- applicable checks;
- executed checks;
- passed checks;
- failed checks;
- blocked or unavailable checks with reasons;
- non-applicable checks with reasons;
- supporting evidence references;
- overall validation limitations.

---

# Constraints

This skill must never:

- claim human approval occurred;
- modify workflow state;
- treat successful validation as workflow authorization;
- expand Story scope;
- fix unrelated technical debt merely because it is visible;
- hide unavailable or skipped checks.

Successful validation is evidence only.

The calling workflow decides what happens next.

---

# Integration Model

Typical caller:

- `engineering-story`

The calling workflow should use this skill when quality validation must adapt to
the actual repository and stack.

The workflow remains responsible for:

- deciding when validation is required;
- requiring validation artifacts;
- interpreting approval gates;
- stopping when approval is missing.

---

# Failure Handling

If the skill cannot determine or execute required validation:

- preserve diagnostics;
- report which checks were blocked, unavailable, or uncertain;
- never replace missing evidence with optimistic conclusions.

Blocked or partial validation does not become approval and must remain visible
to later workflow stages.
