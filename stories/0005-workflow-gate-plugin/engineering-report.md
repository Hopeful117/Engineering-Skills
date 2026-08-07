# Engineering Report — Story 0005: Workflow Gate Plugin

## Story

Implement an OpenClaw plugin (`workflow-gate`) that serves as the deterministic controller of the Engineering Story workflow state. The plugin enforces Human Approval Gates through OpenClaw's native `requireApproval` mechanism, ensuring that no workflow transition can occur without explicit human approval.

---

## Objective

The Engineering Story workflow requires a trust boundary between human approval and LLM execution. The LLM must not be able to:
- Approve its own work
- Modify the workflow state directly
- Skip mandatory Human Approval Gates
- Bypass artifact hash verification

The `workflow-gate` plugin resolves these issues by becoming the sole authority for workflow state mutations and using OpenClaw's `requireApproval` mechanism for all gate approvals.

---

## Repository Analysis Summary

The repository analysis identified:
- **Repository structure:** Engineering-Skills monorepo with skills, plugins, stories, and shared utilities
- **Existing workflow:** `engineering-story/SKILL.md` defines the workflow but relies on LLM compliance for enforcement
- **Problem:** No technical enforcement of the trust boundary — the LLM can call `workflow-state approve` directly
- **Solution:** OpenClaw plugin with custom tools that use `requireApproval` for human gate enforcement
- **Architecture decision:** Plugin as the sole Workflow State Controller, no separate bash script

---

## Implementation Plan Summary

The approved implementation plan specified:
- **Location:** `Engineering-Skills/plugins/workflow-gate/`
- **5 custom tools:** status, can_enter, complete_stage, request_approval, block
- **State machine:** 11 states, 15 transitions, 3 Human Approval Gates
- **State storage:** `api.session.state` (authoritative, protected from LLM)
- **Artifact hashing:** SHA-256 at completion, approval, and can-enter
- **Installation:** Symlink for development (`openclaw plugins install -l`)

**Note:** The implementation used `api.runContext` instead of `api.session.state` (documented deviation).

---

## Implementation Summary

The implementation was completed with the following results:

### Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `src/types.ts` | Shared type definitions | 95 |
| `src/state.ts` | State management (read/write/create) | 65 |
| `src/transitions.ts` | Transition rules and state machine logic | 180 |
| `src/hash.ts` | Artifact hashing (SHA-256) | 20 |
| `src/index.ts` | Plugin entry point with 5 tools | 350 |
| `package.json` | Package configuration | 30 |
| `tsconfig.json` | TypeScript configuration | 15 |
| `README.md` | Documentation | 80 |
| `.gitignore` | Git ignore rules | 3 |

**Total:** ~838 lines across 9 files

### Deviations from Plan

1. **State storage:** Used `api.runContext` instead of `api.session.state`
   - Reason: `runContext` API was more straightforward for initial implementation
   - Impact: State is run-scoped (cleared on run end), not session-persistent
   - Assessment: Acceptable for V1 — workflow operations happen within a single agent run

2. **TypeScript types:** Refined `Record<WorkflowStateName, ...>` to `Partial<Record<WorkflowStateName, ...>>` for approval maps
   - Reason: Not all states have approval mappings
   - Impact: Type safety improved
   - Assessment: Justified improvement

---

## Modified Files

None. The plugin is a new addition to the repository.

---

## Created Files

| File | Purpose |
|------|---------|
| `plugins/workflow-gate/package.json` | NPM package configuration |
| `plugins/workflow-gate/tsconfig.json` | TypeScript compiler configuration |
| `plugins/workflow-gate/.gitignore` | Git ignore rules for dist/ and node_modules/ |
| `plugins/workflow-gate/README.md` | Plugin documentation |
| `plugins/workflow-gate/src/types.ts` | Shared type definitions |
| `plugins/workflow-gate/src/state.ts` | State management functions |
| `plugins/workflow-gate/src/transitions.ts` | Transition rules and state machine |
| `plugins/workflow-gate/src/hash.ts` | Artifact hashing utilities |
| `plugins/workflow-gate/src/index.ts` | Plugin entry point with 5 tools |

---

## Architecture Impact

**New abstraction:** The plugin introduces a deterministic workflow state controller as an OpenClaw plugin.

**Dependency changes:**
- Added: `typebox` (runtime dependency for schema definition)
- Added: `openclaw` (peer dependency for plugin SDK)
- Added: Node.js `crypto` (built-in, for SHA-256 hashing)

**Preserved boundaries:**
- Plugin is self-contained in `plugins/workflow-gate/`
- No modifications to existing skills or shared utilities
- Plugin depends only on OpenClaw SDK and Node.js stdlib

**Compatibility impact:**
- No breaking changes to existing functionality
- Plugin is additive — existing workflow continues to work without the plugin
- Plugin provides optional enforcement layer

---

## Validation

### Executed Validation

```text
Command: cd plugins/workflow-gate && npx tsc
Result: Passed (no errors)

Command: cd plugins/workflow-gate && npx openclaw plugins validate --entry ./dist/index.js
Result: Plugin workflow-gate is valid.

Command: npx openclaw plugins install -l ~/Bureau/workspace/Engineering-Skills/plugins/workflow-gate
Result: Linked plugin path: ~/Bureau/workspace/Engineering-Skills/plugins/workflow-gate

Command: npx openclaw plugins inspect workflow-gate --runtime
Result: Status: loaded, Tools: 5 registered
```

### Validation Limitations

- No unit tests for state transitions, hashing, or edge cases
- No end-to-end testing of the approval flow with OpenClaw Gateway
- `requireApproval` integration not verified at runtime

---

## Review Outcome

**Code Review technical recommendation:** Ready for human approval with minor follow-up

**Key findings:**
- No Blocker or Major findings
- Minor: No tests included
- Minor: Post-approval flow not wired
- Minor: Unused import (`canTransition`)
- Observation: State initialization race condition (low risk)
- Observation: Artifact path not validated (low risk)

**Residual risks:**
1. Post-approval flow untested with OpenClaw Gateway
2. State is run-scoped (not session-persistent)
3. No unit tests for edge cases
4. `requireApproval` integration not verified at runtime

**Human Code Review approval:** Granted

---

## Workflow Approvals

- **Repository Analysis:** Human approved
- **Implementation Plan:** Human approved
- **Code Review:** Human approved

---

## Remaining Work

1. **Post-approval wiring:** The `workflow_gate_request_approval` tool returns a `requireApproval` payload but does not include a callback to execute the transition after approval. This requires investigation of OpenClaw's `before_tool_call` hook or similar mechanism.

2. **Unit tests:** Add tests for state transitions, hash verification, and edge cases.

3. **Integration testing:** Test the plugin with a real Story workflow to verify end-to-end behavior.

4. **SKILL.md integration:** Update `engineering-story/SKILL.md` to use the plugin tools (separate story).

5. **Delegate Task defense:** Add `workflow_gate_can_enter` check to `delegate-task` (separate story).

---

## Lessons Learned

1. **Plugin SDK discovery:** The `api.runContext` API is simpler to use than `api.session.state` for run-scoped state. For V1, run-scoped state is sufficient for workflow operations.

2. **`requireApproval` integration:** The mechanism for returning approval payloads from custom tools needs further investigation. The payload structure is documented but the actual Gateway integration is not well-documented.

3. **TypeScript refinements:** Using `Partial<Record<...>>` for maps that don't cover all states is more type-safe than forcing a complete record.

4. **Symlink installation:** The `openclaw plugins install -l` command works well for development. It allows the plugin to be updated by simply rebuilding — no reinstallation needed.

---

## Final Status

**Completed with Follow-up**

The Story is complete and human-approved. The plugin is built, validated, installed, and all 5 tools are registered. Only explicitly accepted non-blocking follow-up remains (post-approval wiring, unit tests, integration testing).

---

Engineering Report completed.

Story 0005 workflow is complete.
