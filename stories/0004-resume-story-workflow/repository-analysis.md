# Repository Analysis

## Story Understanding

Story 0004 requests deterministic continuation behavior for the
`engineering-story` skill. A user should be able to identify an existing Story
by ID or path and ask to continue it without naming the next workflow stage.

For each continuation request, the skill must:

- locate the Story directory;
- inspect the expected workflow artifacts in their defined order;
- identify the latest completed stage;
- identify missing prerequisites;
- determine the next valid stage;
- confirm any required upstream human approval;
- execute no more than that one stage;
- save its artifact in the same Story directory;
- stop at the next approval gate and report the resulting state.

Artifact existence may establish that a stage produced its output, but it must
not be treated as evidence of human approval.

Automatic approval, commits, merges, pull requests, parallel stages, workflow
rollback, OpenCode, multi-agent orchestration, runtime services, persistent
databases, and changes to existing artifact formats are out of scope.

## Repository Summary

The current repository is `/home/ludo/Bureau/workspace/Engineering-Skills` on
the `main` branch, tracking `origin/main`.

Engineering Skills defines reusable, tool-independent engineering workflows.
The `engineering-story` skill coordinates these ordered stages:

```text
Story
→ Repository Analysis
→ Human Approval
→ Implementation Plan
→ Human Approval
→ Implementation Report
→ Human Approval
→ Code Review Report
→ Human Approval
→ Engineering Report
```

Stage prompts define prerequisites, output formats, and stop conditions. Story
directories persist the resulting artifacts as Markdown files. ADR-001 defines
those files as first-class workflow records and distinguishes artifact
completion from human approval.

No runtime service, API, database, event stream, or external integration is
involved. Continuation state must be derived from repository files plus explicit
human approval context.

## Affected Modules

### `engineering-story/SKILL.md`

This is the directly affected workflow coordinator. It currently specifies the
complete stage order and approval gates, but it always describes execution from
the beginning and contains no rules for Story lookup, artifact inspection,
resume-state detection, prerequisite validation, or one-stage continuation.

### `engineering-story/prompts/`

The existing stage prompts provide the authoritative prerequisites, artifact
formats, and stop conditions used by continuation logic. Their stage
responsibilities and output formats must remain unchanged.

### Story directories

`stories/README.md` and existing Story directories establish the artifact names
and storage convention used for workflow-state detection:

```text
story.md
repository-analysis.md
implementation-plan.md
implementation-report.md
code-review.md
engineering-report.md
```

Story directories may contain only a Story, a valid prefix of completed stage
artifacts, or an inconsistent set with missing prerequisites. The skill must
inspect rather than assume their state.

### ADR-001

`docs/adr/ADR-001-engineering-artifacts.md` governs artifact completion,
approval, consumption, immutability, and supersession. Continuation behavior
must preserve the distinction between a completed artifact and an approved
artifact.

## Existing Implementation

`engineering-story/SKILL.md` currently:

- defines the workflow order;
- invokes one dedicated prompt for each engineering stage;
- places a human approval wait between Repository Analysis, Implementation
  Planning, Implementation, Code Review, and final reporting;
- prohibits skipped approval gates and reordered stages.

It does not currently define:

- how an ID such as `0004` maps to a Story directory;
- how a provided Story path is normalized to its containing directory;
- how the expected artifact sequence is inspected;
- how gaps or missing prerequisite artifacts are handled;
- how the next stage is selected from the latest completed artifact;
- how explicit approval is confirmed independently of file existence;
- how continuation state is reported;
- how execution is limited to one stage per continuation request.

The stage contracts already provide the required artifact dependencies:

- Repository Analysis consumes the Story.
- Implementation Planning consumes an approved Story and approved Repository
  Analysis.
- Implementation consumes the approved Story, Repository Analysis, and
  Implementation Plan.
- Code Review consumes the preceding approved artifacts, Implementation Report,
  implementation diff, and repository state.
- Engineering Reporting consumes the approved lifecycle artifacts, including
  the Code Review Report.

Existing Story directories demonstrate partial workflow states. Story 0004
currently contains only `story.md`, so its next valid stage is Repository
Analysis and no upstream artifact approval is required for that stage. The
current request explicitly asks the workflow to stop after producing that
artifact.

Approval is not represented by a dedicated file or persistent state. Under the
Story constraints, it can only be confirmed from an explicit human statement
available to the current workflow execution. If such confirmation is absent,
the skill must stop at the relevant gate.

## Relevant Documentation

- `stories/0004-resume-story-workflow/story.md` — authoritative scope,
  acceptance criteria, approval rules, artifact order, and exclusions.
- `engineering-story/SKILL.md` — existing workflow order and approval gates.
- `engineering-story/prompts/repository-analysis.md` — first stage contract.
- `engineering-story/prompts/implementation-plan.md` — planning prerequisites
  and artifact contract.
- `engineering-story/prompts/implementation.md` — implementation prerequisites
  and report contract.
- `engineering-story/prompts/code-review.md` — review prerequisites, artifact
  contract, and approval stop condition.
- `engineering-story/prompts/engineering-report.md` — final-stage prerequisites
  and artifact contract.
- `CONVENTIONS.md` — deterministic workflows, single-stage responsibilities,
  approval gates, human authority, and tool independence.
- `docs/adr/ADR-001-engineering-artifacts.md` — artifact lifecycle, approval,
  immutability, and consumption rules.
- `stories/README.md` — expected Story directory layout and artifact names.

No repository-level `AGENTS.md` or project workflow hierarchy under
`docs/workflow/` exists.

## Constraints

- Preserve the current stage order and stage responsibilities.
- Preserve every existing human approval gate.
- Use exactly the artifact order defined by Story 0004.
- Do not infer approval from artifact filenames, existence, or timestamps.
- Require explicit human approval before consuming an artifact guarded by an
  approval gate.
- Execute at most one stage for each continuation request.
- Do not repeat a completed stage when its artifact already exists.
- Do not skip a missing prerequisite or continue through an inconsistent
  artifact sequence.
- Do not modify completed approved artifacts.
- Save newly produced artifacts in the located Story directory using existing
  filenames and formats.
- Keep Story lookup and state detection deterministic and understandable.
- Remain tool-independent and filesystem-based.
- Do not add persistent storage, runtime services, automatic approval, rollback,
  parallelism, new integrations, or new artifact formats.

## Risks

- Multiple Story directories could match the same supplied ID; selecting one
  without detecting ambiguity could continue the wrong Story.
- A directory may contain a later artifact while an earlier prerequisite is
  missing; choosing the latest filename alone could skip required work.
- An artifact may exist but still be awaiting approval, rejected, or require
  correction; existence alone cannot authorize the next stage.
- Explicit approval may be unavailable in the current request or retained
  conversation context. The skill must stop rather than infer it.
- A completed Code Review can recommend changes instead of approval. The skill
  must not produce the Engineering Report until the human explicitly resolves
  and approves that review state.
- Running more than one detected stage would bypass the Story's one-stage
  continuation rule and its next approval gate.
- Re-running a stage whose expected artifact already exists could overwrite a
  completed or approved Engineering Artifact.

## Open Questions

1. When a Story ID matches more than one directory, should the skill always stop
   for an exact path, or is another deterministic disambiguation rule intended?
2. What forms of explicit approval are valid for continuation: only the current
   user request, or also an unambiguous approval statement retained in the
   active conversation?
3. When a required artifact exists but its content is incomplete or malformed,
   should it count as a completed stage or as a missing prerequisite?
4. Should a Code Review recommendation such as `Changes required` always block
   Engineering Reporting even if the user uses a generic continuation request?
5. What exact state summary fields should be reported after inspection and
   after executing the next stage?

## Recommendation

**Ready for planning.**

The workflow order, artifact paths, stage prerequisites, approval boundaries,
and current coordinator are identifiable. The open questions concern explicit
edge-case rules that can be resolved in the Implementation Plan while
preserving the Story's deterministic, one-stage continuation model.

## Approval Required

Repository Analysis completed.

Awaiting human approval before Implementation Planning.
