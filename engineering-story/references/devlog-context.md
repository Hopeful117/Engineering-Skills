# DevLog Engineering Story Context

Read this reference only when preparing Repository Analysis and a DevLog mapping may be available.

## Workspace configuration

Keep machine- and repository-specific values in the OpenClaw workspace `TOOLS.md`, never in `SKILL.md`.

Use this shape with local values:

```markdown
### DevLog

- Base URL: `https://devlog.example.test`
- Repository mappings:
  - `/absolute/canonical/repository/path` → `00000000-0000-0000-0000-000000000000`
```

Resolve the repository with `git rev-parse --show-toplevel` and use only an exact canonical-path match. No match is a normal fallback condition. Do not infer a project by slug, remote URL, or directory name.

## Request

Pass the configured base URL and project UUID to:

```text
node scripts/devlog-context.mjs --base-url <url> --project-id <uuid>
```

Provide the complete current Story description on standard input. The adapter calls the body-based endpoint so complete Stories do not depend on request-target limits:

```text
POST /api/projects/{projectId}/engineering-story-context
Content-Type: application/json

{"description":"<complete current Story>"}
```

Do not truncate or summarize the Story before transport. Use a bounded timeout. The adapter writes the validated `RepositoryContext` JSON to standard output.

## Use of context

Use selected evidence for navigation and prioritization:

- modules, source files, tests, and configuration;
- ADRs and validated project knowledge;
- Git history and commit diffs;
- provenance, originating files, ranking reasons, warnings, selection decisions, and digest.

Do not re-rank or reinterpret evidence inside the adapter. Distinguish validated knowledge from transient repository evidence. Read targeted repository files for exact current behavior and architecture. The repository wins when context is stale or conflicting.

## Failure contract

Any missing configuration or adapter failure must produce a visible message with this form:

```text
DEVLOG_CONTEXT_ERROR: <diagnostic>. Repository Analysis continues without DevLog.
```

Then continue through the existing direct Repository Analysis workflow. DevLog failure is never a STOP condition and never a workflow-gate event.

The Engineering-Skills adapter owns this stable user-facing error prefix. If standardization later requires changes to DevLog responses, create a separate Story in the DevLog repository.
