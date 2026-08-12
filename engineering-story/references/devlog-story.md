# DevLog Lifecycle Integration

Read this reference when performing lifecycle synchronization between Engineering-Skills and DevLog.

## Workspace configuration

Keep machine- and repository-specific values in the OpenClaw workspace `TOOLS.md`, never in `SKILL.md`.

Use this shape with local values:

```markdown
### DevLog

- Base URL: `http://localhost:18080`
- Repository mappings:
  - `/home/user/project` → `00000000-0000-0000-0000-000000000000`
```

Resolve the repository with `git rev-parse --show-toplevel` and use only an exact canonical-path match. No match is a normal fallback condition.

## Operations

The adapter handles three lifecycle operations.

### Register

Register the Engineering Story in DevLog at Story creation, before Repository Analysis.

```text
node scripts/devlog-story.mjs --base-url <url> --project-id <uuid> --operation register
```

Stdin JSON:
```json
{ "storyNumber": 7, "title": "Story Title", "storyPath": "stories/0007-story-slug" }
```

Stdout JSON:
```json
{ "ok": true, "storyId": "uuid" }
```

### Start

Start the Story after Human Approval Gate 2 (Implementation Plan approved), before Implementation begins.

```text
node scripts/devlog-story.mjs --base-url <url> --project-id <uuid> --story-id <uuid> --operation start
```

Stdin JSON:
```json
{ "baseCommit": "40-character-hex-sha" }
```

The `baseCommit` is captured via `git rev-parse HEAD` at the moment of invocation.

Stdout JSON:
```json
{ "ok": true }
```

### Complete

Complete the Story only after the human has validated the pull request generated from the completed Engineering Report and committed branch state.

```text
node scripts/devlog-story.mjs --base-url <url> --project-id <uuid> --story-id <uuid> --operation complete
```

Stdin JSON:
```json
{ "targetCommit": "40-character-hex-sha", "baseCommit": "40-character-hex-sha" }
```

The `targetCommit` is captured via `git rev-parse HEAD` after the human confirms PR validation and the commit exists. The adapter verifies `targetCommit != baseCommit`.

Stdout JSON:
```json
{ "ok": true }
```

## Idempotency

| Operation | DevLog 409 Behavior | Adapter Handling |
|---|---|---|
| Register (storyNumber exists) | 409 Conflict (unique constraint) | Treat as success — story already registered |
| Start (already IN_PROGRESS) | 409 Conflict (status check) | Treat as success — already started |
| Complete (already COMPLETED) | 409 Conflict (status check) | Treat as success — already completed |

The adapter treats 409 as success when the resulting state matches the intended state. If a different `baseCommit` or `targetCommit` is sent for the same story, DevLog will reject it with 409 — this is correct behavior.

**Limitation:** The adapter cannot distinguish "already in intended state" from "conflict with different data" because the DevLog API does not return enough information. The workflow ensures only one start and one complete are attempted per Story.

## Validation

- Base URL: must be valid HTTP/HTTPS.
- Project ID: must be valid UUID.
- Operation: must be `register`, `start`, or `complete`.
- Git SHA (start/complete): must be 40-character hex string.
- Complete: must verify `targetCommit != baseCommit`.
- Story number: must be integer.
- Title and story path: must be non-empty strings.
- Timeout: bounded 1–30000ms, default 3000ms.

## Failure contract

Any adapter failure must produce a visible message with this form:

```text
DEVLOG_LIFECYCLE_ERROR: <diagnostic>. Engineering workflow continues without DevLog synchronization.
```

Then continue through the normal engineering workflow. DevLog failure is never a STOP condition and never a workflow-gate event.

Exit code 2 indicates adapter failure.

## Trust model

DevLog records engineering history. The workflow-gate controls human approval. Engineering-Skills bridges them deterministically.

- DevLog lifecycle state (REGISTERED, IN_PROGRESS, COMPLETED) is a record, not authority.
- The workflow-gate remains authoritative for workflow progression.
- The human owns final repository acceptance. Engineering-Skills may create commits or open pull requests only when explicitly delegated, but final PR validation remains human-owned.

## Configuration

The adapter reuses the existing `TOOLS.md` DevLog configuration (base URL + project UUID mapping). No additional configuration is required. The `--timeout-ms` argument is optional with a default of 3000ms.

## Validation commands

```text
node --test engineering-story/scripts/devlog-story.test.mjs
```
