# workflow-gate

OpenClaw plugin that serves as the deterministic controller of the Engineering Story workflow state.

## Purpose

Enforces Human Approval Gates through OpenClaw's native `requireApproval` mechanism, ensuring that no workflow transition can occur without explicit human approval.

## Features

- **5 custom tools** for workflow state management
- **Deterministic state machine** — 11 states, 15 transitions
- **Human approval enforcement** — via OpenClaw's `requireApproval`
- **Artifact hash verification** — SHA-256 at completion, approval, and can-enter
- **Fail-closed** — deny and timeout do not change state

## Tools

| Tool | Purpose |
|---|---|
| `workflow_gate_status` | Read current workflow state |
| `workflow_gate_can_enter` | Check if a stage can be entered |
| `workflow_gate_complete_stage` | Mark current stage as complete |
| `workflow_gate_request_approval` | Request human approval for pending gate |
| `workflow_gate_block` | Block workflow with a reason |

## Installation

### Development (symlink)

```bash
openclaw plugins install -l ~/Bureau/workspace/Engineering-Skills/plugins/workflow-gate
```

### Update

```bash
cd ~/Bureau/workspace/Engineering-Skills
git pull
cd plugins/workflow-gate
npm run build
# Plugin updates automatically via symlink
```

### CI/Production (npm-pack)

```bash
npm pack --pack-destination /tmp
openclaw plugins install npm-pack:/tmp/workflow-gate-0.1.0.tgz --force
```

## Configuration

Add to `openclaw.json`:

```json
{
  "approvals": {
    "plugin": {
      "enabled": true,
      "mode": "targets",
      "agentFilter": ["main"]
    }
  },
  "tools": {
    "allow": ["workflow_gate_request_approval"]
  }
}
```

## State Machine

```
STORY_CREATED
  → ANALYSIS_IN_PROGRESS
  → WAITING_FOR_ANALYSIS_APPROVAL
  → PLAN_IN_PROGRESS
  → WAITING_FOR_PLAN_APPROVAL
  → IMPLEMENTATION_IN_PROGRESS
  → CODE_REVIEW_IN_PROGRESS
  → WAITING_FOR_REVIEW_APPROVAL
  → REPORT_IN_PROGRESS
  → WORKFLOW_COMPLETED
```

Any state can transition to `BLOCKED` via `workflow_gate_block`.

## Trust Boundary

- The LLM calls `workflow_gate_request_approval` to request approval
- OpenClaw Gateway presents the approval request to the human
- The human decides with "Allow once" or "Deny"
- The transition only occurs after "Allow once"
- Artifact hashes are verified at approval time and before dependent stages
