# Story 0005 — Workflow Gate Plugin

## Metadata

**ID:**
`0005`

**Title:**
Implement workflow-gate OpenClaw plugin as deterministic workflow state controller

**Status:**
Completed with Follow-up

---

## Goal

Implement an OpenClaw plugin (`workflow-gate`) that serves as the deterministic controller of the Engineering Story workflow state. The plugin enforces Human Approval Gates through OpenClaw's native `requireApproval` mechanism, ensuring that no workflow transition can occur without explicit human approval.

---

## Context

The Engineering Story skill orchestrates a multi-stage workflow with three mandatory Human Approval Gates. Currently, the skill relies on SKILL.md instructions and LLM compliance to enforce these gates. This is insufficient because:

1. The LLM can call `workflow-state approve` directly, bypassing human approval.
2. There is no technical enforcement of the trust boundary between human and LLM.
3. The workflow state can be modified by the LLM without going through the approval mechanism.

The `workflow-gate` plugin resolves these issues by:
- Becoming the sole authority for workflow state mutations.
- Using OpenClaw's `requireApproval` mechanism for all gate approvals.
- Storing the workflow state in `api.runContext` (protected from direct LLM access).
- Exposing custom tools that the LLM calls to request approvals and check state.

---

## Problem

The Engineering Story workflow needs a trust boundary between human approval and LLM execution. The LLM must not be able to:
- Approve its own work.
- Modify the workflow state directly.
- Skip mandatory Human Approval Gates.
- Bypass artifact hash verification.

The `workflow-gate` plugin resolves these issues by:
- Becoming the sole authority for workflow state mutations.
- Using OpenClaw's `requireApproval` mechanism for all gate approvals.
- Storing the workflow state in `api.runContext` (protected from direct LLM access).
- Exposing custom tools that the LLM calls to request approvals and check state.

---

## Scope

* `plugins/workflow-gate/` — new OpenClaw plugin in Engineering-Skills repository
* Custom tools: `workflow_gate_status`, `workflow_gate_can_enter`, `workflow_gate_complete_stage`, `workflow_gate_request_approval`, `workflow_gate_block`
* State machine: 11 states, 15 transitions, 3 Human Approval Gates
* Artifact hash verification (SHA-256)
* Integration with OpenClaw's `requireApproval` mechanism
* Installation via symlink for development

---

## Out of Scope

* `workflow-state.sh` — no bash script for mutations (plugin is the controller)
* `.workflow-state.json` in Story directories — state lives in `api.runContext`
* JSON sync/projection — deferred to V2 if needed
* Multi-user support
* Audit trail beyond state history array
* Other skills (engineering-story, delegate-task) modifications — separate stories

---

## Acceptance Criteria

* [x] Plugin registers 5 custom tools visible to the LLM
* [x] `workflow_gate_request_approval` triggers OpenClaw's `requireApproval` flow
* [x] Human can approve with "Allow once" or deny
* [x] State transitions only occur after `Allow once`
* [x] Artifact hashes are verified at approval time and at `can-enter` for dependent stages
* [x] Deny does not change workflow state
* [x] Timeout is fail-closed (no transition)
* [x] Plugin stores state in `api.runContext`
* [x] Plugin is installable via `openclaw plugins install -l`
* [x] Plugin is versioned in `Engineering-Skills/plugins/workflow-gate/`

---

## Constraints

* TypeScript ESM module
* OpenClaw plugin SDK (`openclaw/plugin-sdk`)
* `api.runContext` for state storage (run-scoped)
* SHA-256 for artifact hashing
* No new runtime dependencies beyond OpenClaw SDK
* Plugin must be versioned in Engineering-Skills repository

---

## Dependencies

* OpenClaw plugin SDK (already installed)
* TypeBox (for schema definition)
* Node.js crypto module (for SHA-256 hashing)

---

## Relevant Documentation

* `Engineering-Skills/engineering-story/SKILL.md` — workflow definition
* `Engineering-Skills/CONVENTIONS.md` — repository conventions
* OpenClaw plugin docs: `building-plugins.md`, `tool-plugins.md`, `plugin-permission-requests.md`

---

## Definition of Done

* [x] Repository Analysis approved
* [x] Implementation Plan approved
* [x] Implementation completed
* [x] Plugin builds successfully (`npm run build`)
* [x] Plugin validates (`openclaw plugins validate`)
* [x] Plugin installs via symlink (`openclaw plugins install -l`)
* [x] Plugin loads and registers tools (`openclaw plugins inspect workflow-gate --runtime`)
* [x] Code Review approved
* [x] Engineering Report completed
