---
name: engineering-story
description: Execute the complete engineering workflow for a Story.
---

# Engineering Story

## Mission

Coordinate the complete engineering workflow.

## Delegation

The Engineering Story skill coordinates engineering work.

It may delegate specialized tasks to other tools.

Typical delegation includes:

- Repository Analysis
- Implementation Planning
- Code Review

Implementation may be delegated to OpenCode.

When implementation is delegated:

- OpenCode receives the approved Story and Implementation Plan.
- OpenCode must remain within the approved scope.
- OpenCode must not change architecture without approval.
- OpenCode produces the implementation and its report.
- Engineering Story resumes control after implementation.

Delegation never transfers responsibility.

Engineering Story remains responsible for the workflow.

## Workflow

For a new Story:

1. Read the Story.
2. Load the project workflow documentation.
3. Execute Repository Analysis using `prompts/repository-analysis.md`.
4. Wait for human approval.
5. Execute Implementation Planning using `prompts/implementation-plan.md`.
6. Wait for human approval.
7. Execute Implementation using `prompts/implementation.md`.
8. Wait for human approval.
9. Execute Code Review using `prompts/code-review.md`.
10. Wait for human approval.
11. Execute Engineering Report using `prompts/engineering-report.md`.
12. Finish.

Never skip approval gates.

Never change the workflow order.

Always use the dedicated prompt for each stage.

## Continue an Existing Story

When the user asks to continue an existing Story without naming a stage,
execute the continuation protocol below.

### Locate the Story

Resolve the Story before inspecting workflow state.

- If the user provides a Story directory, use that directory.
- If the user provides a `story.md` path, use its parent directory.
- If the user provides a Story ID, match it against `stories/<id>-*`.
- An ID must resolve to exactly one directory.
- If no directory matches, stop and report that the Story was not found.
- If multiple directories match, stop and request an exact path.
- The resolved directory must contain a readable, non-empty `story.md` whose
  first report heading is `# Story`.

Do not select a Story by timestamps, directory ordering, or a partial match when
the result is ambiguous.

### Inspect Artifact State

Use this artifact order as the authoritative workflow order:

```text
story.md
repository-analysis.md
implementation-plan.md
implementation-report.md
code-review.md
engineering-report.md
```

The expected first report headings are:

| Artifact | Expected heading |
| --- | --- |
| `story.md` | `# Story` |
| `repository-analysis.md` | `# Repository Analysis` |
| `implementation-plan.md` | `# Implementation Plan` |
| `implementation-report.md` | `# Implementation Report` |
| `code-review.md` | `# Code Review Report` |
| `engineering-report.md` | `# Engineering Report` |

Before choosing a stage:

1. Inspect every expected artifact path in the resolved Story directory.
2. Treat an artifact as a completed stage output only when it is a readable,
   non-empty file with the expected first report heading.
3. Require existing artifacts to form a contiguous prefix of the artifact
   order.
4. If an artifact exists after a missing, empty, unreadable, or unidentifiable
   prerequisite, report an inconsistent workflow state and stop.
5. Never overwrite, regenerate, or modify an existing completed artifact while
   determining continuation state.

Artifact inspection determines completion only. It never determines approval.

### Determine the Next Stage

The first missing artifact selects the next valid stage:

| Missing artifact | Next stage | Dedicated prompt |
| --- | --- | --- |
| `repository-analysis.md` | Repository Analysis | `prompts/repository-analysis.md` |
| `implementation-plan.md` | Implementation Planning | `prompts/implementation-plan.md` |
| `implementation-report.md` | Implementation | `prompts/implementation.md` |
| `code-review.md` | Code Review | `prompts/code-review.md` |
| `engineering-report.md` | Engineering Reporting | `prompts/engineering-report.md` |

If no artifact is missing, report that the Story workflow is complete and do
not execute a stage.

### Verify Approval

Before executing any stage after Repository Analysis, verify approval of the
immediately preceding artifact.

Approval is valid only when the human explicitly approved the relevant artifact
for the relevant Story in the current request or in unambiguous active
conversation context.

Never infer approval from:

- artifact existence;
- filenames or directory names;
- timestamps;
- Story status alone;
- a stage recommendation;
- prior workflow progress.

Preserve these approval boundaries:

- Repository Analysis must be approved before Implementation Planning.
- Implementation Plan must be approved before Implementation.
- Implementation Report must be approved before Code Review.
- Code Review Report must be approved before Engineering Reporting.

A Code Review recommendation is not human approval. If the review reports
`Changes required` or `Blocked`, a generic continuation request must stop and
request explicit human resolution. Do not infer that findings were accepted or
corrected.

If approval is missing, ambiguous, or applies to another Story or artifact,
report the current state, request the required approval, and stop without
executing a stage.

### Execute One Stage

After Story resolution, artifact validation, prerequisite validation, and any
required approval confirmation:

1. Load the project documentation required by the detected stage.
2. Load only the dedicated prompt for that stage.
3. Execute that stage according to its prompt.
4. Save its artifact under the expected filename in the resolved Story
   directory.
5. Verify that the artifact was produced at that path.
6. Stop at the next human approval gate.

Execute exactly one stage per continuation request. Do not continue into a
second stage even if later approval appears to be available.

Do not perform automatic approval, commits, merges, pull requests, rollback,
parallel stages, runtime integrations, or persistent workflow-state updates.

### Report Workflow State

Before stopping, report:

- the resolved Story ID and directory;
- the artifacts detected;
- the latest completed stage;
- the next valid stage, or that the workflow is complete;
- whether required approval was confirmed, missing, or ambiguous;
- the stage executed, if any;
- the artifact produced, if any;
- the next required approval or continuation action.
