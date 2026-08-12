# Story 0013 — Integrate Vault into Engineering Workflow

## Metadata

**ID:**
`0013`

**Title:**
Integrate the Obsidian Vault into the Engineering Story Workflow

**Status:**
Draft

---

## Goal

Define and implement how the curated Obsidian vault should participate in the
`engineering-story` workflow as a transverse-memory input and knowledge-update
output, without weakening DevLog authority, human approval, or workflow
determinism.

---

## Context

Stories 0009 to 0012 established four foundations:

* the vault has a distinct transverse-memory role;
* feeding the vault requires a `source -> candidate -> curated` lifecycle;
* the workspace can be scanned ponctually to bootstrap candidates;
* the extractor quality is now strong enough to support real curation.

The vault is no longer hypothetical.

It now contains curated notes derived from real repository knowledge, and its
graph is structurally coherent.

The next question is no longer:

> Can the vault exist?

It is:

> Where does the vault enter and leave the Engineering Story workflow?

That integration must stay disciplined.

The vault must help the workflow without becoming:

* a second DevLog;
* a workflow-state owner;
* an approval authority;
* an uncontrolled write target.

---

## Problem

The vault now has useful content, but the workflow still treats it as an
external optional artifact rather than a defined participant in engineering
execution.

Without an explicit workflow integration:

* repository analysis may ignore relevant transverse knowledge that already
  exists in the vault;
* engineers and agents may use the vault inconsistently or not at all;
* post-story knowledge updates remain ad hoc;
* the memory ecosystem still lacks a clear read/write contract between
  workflow, project memory, and transverse memory.

The issue is not extraction quality anymore.

The issue is workflow placement and authority boundaries.

---

## Scope

* Define where the vault may be consulted during the Engineering Story
  workflow.
* Define which workflow stages may produce candidate updates for the vault.
* Define how vault-derived context should be treated relative to Story,
  repository evidence, ADRs, and DevLog context.
* Define how the workflow records that a vault update was suggested, skipped,
  deferred, or completed.
* Define the minimum technical integration shape required in
  `engineering-story`.
* Implement the first safe workflow integration if the approved analysis and
  plan justify code changes.

---

## Out of Scope

* Changing the role of DevLog as project-memory authority.
* Automatic curation of vault notes without human review.
* Background vault synchronization outside the workflow.
* Broad semantic retrieval infrastructure unless explicitly justified by the
  approved analysis and plan.
* Reworking the vault taxonomy itself except where a minimal workflow contract
  requires it.

---

## Acceptance Criteria

* [ ] The Story defines where the vault is read during the Engineering Story
  workflow.
* [ ] The Story defines where candidate vault updates are produced during or
  after the workflow.
* [ ] The Story preserves the authority boundary between DevLog, repository
  artifacts, workflow state, and curated transverse memory.
* [ ] The Story defines how vault usage or non-usage is recorded in workflow
  artifacts.
* [ ] The Story identifies the minimum implementation required in
  `engineering-story`.
* [ ] The Story preserves proposal-only behavior for vault updates unless an
  explicit human curation step occurs.
* [ ] Relevant repository validation succeeds.

---

## Impacted Components

### Engineering-Skills

Owns the workflow contract, prompts, and any first integration of the vault
into `engineering-story`.

### Obsidian Vault

Becomes an explicit workflow participant for transverse-memory consultation and
candidate update suggestion.

### DevLog AI

Remains authoritative for project-specific structured memory and must not be
displaced by vault usage.

### Workflow Artifacts

Repository Analysis, Implementation Report, Code Review, and Engineering Report
may need explicit vault-related sections or outcomes.

---

## Architectural Boundaries

* **DevLog** owns project memory.
* **Workflow artifacts** own stage-by-stage engineering records.
* **Vault** owns curated cross-project transverse memory.
* **Engineering Story** owns workflow orchestration.

Invariants:

```text
The vault may inform workflow context.
It may not own workflow state.

The workflow may propose vault updates.
It may not silently curate the vault.
```

---

## Risks

### Memory-source ambiguity

If the vault is consulted without clear precedence rules, agents may confuse
curated transverse memory with authoritative project state.

### Workflow bloat

If vault integration adds too much mandatory ceremony, the workflow may become
harder to execute.

### Silent publication risk

If write-side integration is underspecified, later automation may drift into
direct vault mutation without a clear curation step.

### Context inflation

If the vault is always loaded indiscriminately, it may add noise rather than
useful transverse guidance.

---

## Dependencies

* Story 0009 — Integrate Obsidian Vault as Transverse Memory
* Story 0010 — Design a Fluid Knowledge-Feeding Pipeline for the Obsidian Vault
* Story 0011 — Extract Vault Candidates from Workspace Projects
* Story 0012 — Harden Workspace Vault Extraction Quality
* Existing curated Engineering Vault
