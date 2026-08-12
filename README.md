# Engineering Skills

Reusable AI engineering workflows for structured, reviewable, and human-controlled software development.

## Overview

Engineering Skills is a repository of reusable skills, prompts, templates, and workflow definitions designed to coordinate AI-assisted software engineering.

The project focuses on engineering discipline rather than autonomous code generation.

Each skill defines a structured workflow with:

* explicit responsibilities;
* standardized inputs and outputs;
* human approval gates;
* specialized workflow stages;
* clear stop conditions;
* reusable engineering artifacts.

The repository is initially designed for OpenClaw, but its concepts should remain as tool-independent as possible.

---

## Goals

Engineering Skills aims to:

* standardize AI-assisted engineering workflows;
* separate analysis, planning, implementation, and review;
* preserve human ownership of important decisions;
* reduce inconsistent prompting;
* make AI-generated work auditable;
* provide reusable workflows across multiple repositories;
* support future integration with Developer OS.

---

## Principles

The repository follows these principles:

* Understand before changing.
* Separate responsibilities.
* Prefer explicit workflows over autonomous behavior.
* Keep humans responsible for approvals and merges.
* Treat pull request validation as the final human acceptance boundary when repository policy requires PR-based delivery.
* Produce standardized engineering artifacts.
* Do not invent missing context.
* Do not skip validation.
* Keep skills focused and reusable.
* Treat prompts and workflows as versioned engineering assets.

---

## Repository Structure

```text
engineering-skills/
│
├── README.md
├── CONVENTIONS.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── ROADMAP.md
│
├── docs/
│
├── skill-template/
│
└── engineering-story/
    ├── SKILL.md
    ├── prompts/
    ├── templates/
    └── references/
```

---

## Skills

### engineering-story

Coordinates the complete engineering lifecycle of a Story.

Workflow:

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

The skill acts as an Engineering Coordinator.

It does not replace the human engineer and must not bypass approval gates.

---

## Skill Architecture

Each skill follows the same conceptual structure.

```text
skill-name/
│
├── SKILL.md
├── prompts/
├── templates/
└── references/
```

### SKILL.md

Defines:

* skill identity;
* mission;
* workflow order;
* delegation rules;
* approval gates;
* stop conditions.

`SKILL.md` coordinates the workflow but should not contain all stage-specific instructions.

### prompts/

Contains the specification for each workflow stage.

A prompt should define:

* mission;
* inputs;
* objectives;
* deliverable;
* constraints;
* stop condition.

### templates/

Contains standardized output structures.

Examples:

* Repository Analysis;
* Implementation Plan;
* Implementation Report;
* Code Review Report;
* Engineering Report.

### references/

Contains supporting knowledge used by the skill.

References must not replace repository-specific documentation or accepted architectural decisions.

---

## Installation

Clone the repository:

```bash
git clone git@github.com:Hopeful117/engineering-skills.git
```

Create the OpenClaw workspace skills directory if necessary:

```bash
mkdir -p ~/.openclaw/workspace/skills
```

Create a symbolic link for the desired skill:

```bash
ln -s \
  /absolute/path/to/engineering-skills/engineering-story \
  ~/.openclaw/workspace/skills/engineering-story
```

Verify the link:

```bash
ls -l ~/.openclaw/workspace/skills
```

OpenClaw should detect the skill using its identifier:

```text
engineering-story
```

---

## Usage

Invoke the skill from a repository containing the required engineering context.

Example:

```text
Use the engineering-story skill.

Process the current Story until the Repository Analysis approval gate.

Do not implement anything.
```

The skill should read repository-level documentation when available, including:

```text
AGENTS.md
docs/workflow/
docs/adr/
README.md
```

Project documentation remains authoritative for project-specific architecture and conventions.

---

## Project Integration

A repository using Engineering Skills should ideally define:

```text
AGENTS.md

docs/
└── workflow/
    ├── ai-workflow.md
    ├── ai-roles.md
    ├── story-template.md
    └── prompts/
        └── common-principles.md
```

Engineering Skills provides workflow execution.

The target repository defines how it expects engineering work to be performed.

---

## Human Approval

AI agents may:

* analyze repositories;
* prepare plans;
* implement approved work;
* execute validation;
* review changes;
* produce reports.

AI agents must not independently:

* approve architectural decisions;
* merge code;
* bypass required reviews;
* rewrite shared Git history;
* expose secrets;
* expand Story scope without approval.

The human engineer remains the final decision-maker.

---

## Current Status

The repository is in early development.

Current focus:

* stabilize the `engineering-story` skill;
* validate the workflow on real repositories;
* integrate OpenCode as an implementation runtime;
* define shared skill conventions;
* create a reusable skill template.

---

## Roadmap

### v0.1

* Engineering Story skill
* Repository Analysis
* Implementation Planning
* Implementation
* Code Review
* Engineering Report
* OpenClaw integration
* First Trading OS workflow validation

### Future

Potential skills include:

* bug-fix;
* adr;
* architecture-review;
* security-review;
* documentation;
* release;
* performance-analysis.

New skills should be added only when a distinct and reusable workflow is justified.

---

## Relationship with Developer OS

Engineering Skills is an independent repository.

Long term, it may become a workflow library consumed by Developer OS and its Engineering Workflow Studio.

Developer OS may eventually provide:

* workflow orchestration;
* project context;
* permissions;
* job execution;
* human validation;
* auditability;
* integration with coding runtimes.

Engineering Skills remains responsible for reusable workflow definitions and skill standards.

### Memory Ecosystem

Engineering Skills is not itself a project-memory database or a transverse
knowledge base.

Within the wider ecosystem:

* **DevLog** owns structured, project-scoped engineering memory;
* **Engineering Artifacts** own workflow-stage records and approval-traceable
  engineering outputs;
* **workspace memory** owns local personal and operational continuity;
* an **Obsidian vault** may own curated, cross-project transverse knowledge;
* **Developer OS** may later federate those memory layers.

Engineering Skills may define reusable contracts and adapters around those
layers, but it must not transfer workflow authority or approval authority to a
memory system.

---

## Contributing

Contributions should:

* preserve human approval gates;
* keep skills focused;
* avoid tool-specific assumptions when unnecessary;
* follow repository conventions;
* include clear documentation;
* remain compatible with the standardized skill structure.

See `CONTRIBUTING.md` and `CONVENTIONS.md` when available.

---

## License

This project is intended to use the MIT License.
