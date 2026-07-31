# Implementation Plan

## Overview

Extend the `engineering-story` coordinator so a continuation request can locate
an existing Story, inspect its persisted artifacts, determine the next valid
workflow stage, enforce explicit approval, execute exactly one stage, and report
the resulting workflow state.

The implementation will modify only `engineering-story/SKILL.md`. Existing
stage prompts, artifact formats, approval gates, and Story templates will remain
unchanged.

## Planned Changes

1. Add a continuation workflow to `engineering-story/SKILL.md` for requests
   such as `Continue Story 0004` or requests containing a Story path.
2. Define deterministic Story location rules:
   - accept an explicit Story directory or `story.md` path;
   - normalize a `story.md` path to its containing directory;
   - resolve an ID against directories matching `stories/<id>-*`;
   - require exactly one matching directory;
   - stop and request an exact path when no directory or multiple directories
     match;
   - verify that the resolved directory contains `story.md`.
3. Define the authoritative artifact order:

   ```text
   story.md
   repository-analysis.md
   implementation-plan.md
   implementation-report.md
   code-review.md
   engineering-report.md
   ```

4. Require the coordinator to inspect all expected artifact paths before
   selecting a stage.
5. Treat an artifact as a completed stage output only when its expected file is
   present, readable, non-empty, and identifiable as the expected report type.
6. Validate that existing artifacts form a contiguous prefix of the artifact
   order. If an earlier artifact is missing while a later artifact exists,
   report an inconsistent workflow state and stop without executing a stage.
7. Determine the next stage from the first missing artifact:
   - missing `repository-analysis.md` → Repository Analysis;
   - missing `implementation-plan.md` → Implementation Planning;
   - missing `implementation-report.md` → Implementation;
   - missing `code-review.md` → Code Review;
   - missing `engineering-report.md` → Engineering Reporting;
   - no missing artifact → workflow complete.
8. Define approval checks independently of artifact detection:
   - artifact presence never implies approval;
   - approval must be an explicit human statement in the current request or
     unambiguous active conversation context;
   - the approval must identify the relevant Story or immediately preceding
     artifact sufficiently to avoid ambiguity;
   - if approval cannot be confirmed, report the completed stage and request
     approval without executing the next stage;
   - a Code Review recommendation does not itself constitute human approval;
   - a review reporting `Changes required` or `Blocked` cannot advance through
     a generic continuation request and requires explicit human resolution.
9. Preserve the existing approval boundaries:
   - Repository Analysis approval before Implementation Planning;
   - Implementation Plan approval before Implementation;
   - Implementation approval before Code Review;
   - Code Review approval before Engineering Reporting.
10. Require the coordinator to load and execute only the dedicated prompt for
    the detected next stage.
11. Enforce one-stage execution per continuation request, even when approval for
    later stages appears available.
12. Save the produced artifact using the existing filename in the resolved
    Story directory and never overwrite an existing completed artifact.
13. Define a concise state report containing:
    - resolved Story ID and directory;
    - artifacts detected;
    - latest completed stage;
    - next valid stage or workflow-complete state;
    - approval confirmed, required, or unresolved;
    - action executed, if any;
    - next required approval or continuation action.
14. Preserve the current full-workflow definition for new Stories while making
    continuation behavior explicit and deterministic.

## Files to Modify

- `engineering-story/SKILL.md` — add Story resolution, artifact-state
  detection, approval verification, next-stage selection, one-stage execution,
  and workflow-state reporting rules.

## Files to Create

None as implementation content.

The Implementation stage will separately create
`stories/0004-resume-story-workflow/implementation-report.md` as its required
workflow artifact.

## Dependencies

- Approved Story 0004.
- Approved Repository Analysis for Story 0004.
- `engineering-story/SKILL.md` for the current stage order and approval gates.
- Existing stage prompts under `engineering-story/prompts/` for stage-specific
  prerequisites, outputs, and stop conditions.
- `stories/README.md` for Story artifact filenames and storage layout.
- `CONVENTIONS.md` for deterministic workflows, human authority, explicit
  approval gates, and tool independence.
- ADR-001 for artifact completion, approval, consumption, immutability, and
  supersession semantics.

There are no API, database, runtime-service, external-service, or package
dependencies.

## Test Plan

No automated application test framework exists for Markdown skill behavior.
Validate the modified coordinator through deterministic scenario inspection and
real Story directories.

### Story resolution scenarios

1. Resolve a Story from an explicit directory path.
2. Resolve a Story from an explicit `story.md` path.
3. Resolve a Story from a unique numeric ID.
4. Confirm zero matches stops with a missing-Story report.
5. Confirm multiple matches stop and request an exact path.

### Artifact-state scenarios

1. Directory containing only `story.md` selects Repository Analysis.
2. Valid artifact prefix selects the stage corresponding to the first missing
   file.
3. Later artifact with a missing prerequisite reports inconsistent state and
   executes nothing.
4. All artifacts present reports workflow complete.
5. Existing target artifact is never overwritten or regenerated.

### Approval scenarios

1. Completed Repository Analysis without explicit approval stops before
   planning.
2. Explicit Repository Analysis approval allows only Implementation Planning.
3. Completed Implementation Plan without explicit approval stops before
   implementation.
4. Completed Implementation Report without explicit approval stops before Code
   Review.
5. Completed Code Review without explicit human approval stops before
   Engineering Reporting.
6. `Changes required` or `Blocked` review does not advance through a generic
   continuation request.
7. File existence and timestamps are never reported as approval evidence.

### Scope scenarios

1. Confirm exactly one dedicated stage prompt is executed per continuation.
2. Confirm each produced artifact uses the existing expected path.
3. Confirm stage prompts, Story templates, and artifact formats remain
   unchanged.
4. Confirm no runtime service, database, integration, commit, merge, pull
   request, rollback, parallel stage, or automatic approval behavior is added.

## Risks

- Approval retained in conversation may be ambiguous about the Story or
  artifact; ambiguous approval must block rather than authorize execution.
- Lightweight artifact-shape validation must not become a new artifact format
  or a substitute for human approval.
- Story ID matching must reject ambiguity rather than choose a directory based
  on ordering or timestamps.
- A valid-looking artifact sequence may still contain a negative Code Review;
  generic continuation must not interpret completion as approval.
- Adding continuation logic directly to `SKILL.md` may increase its size; the
  rules must remain orchestration-focused and avoid duplicating stage-specific
  prompt instructions.
- Re-executing an existing stage could violate ADR-001 immutability, so target
  artifact existence must be a hard stop.

## Validation Checklist

- [ ] Story directories can be resolved from a unique ID or explicit path.
- [ ] Missing and ambiguous Stories stop safely.
- [ ] The exact Story 0004 artifact order is encoded.
- [ ] Existing artifacts are inspected as an ordered contiguous prefix.
- [ ] Missing prerequisites stop execution.
- [ ] The first missing artifact selects the next stage deterministically.
- [ ] Artifact existence and timestamps never imply human approval.
- [ ] Approval must be explicit and unambiguous.
- [ ] Negative or unresolved Code Review state cannot advance generically.
- [ ] Exactly one stage runs per continuation request.
- [ ] Existing artifacts are not repeated, overwritten, or modified.
- [ ] New artifacts use the established Story-directory paths.
- [ ] State reporting includes Story, artifacts, latest stage, next stage,
  approval status, action, and next required step.
- [ ] Existing workflow stages and approval gates remain unchanged.
- [ ] Existing prompt files and Story templates remain unchanged.
- [ ] No new artifact format is introduced.
- [ ] No runtime service, database, tool-specific dependency, automatic
  approval, parallelism, rollback, commit, merge, or pull request behavior is
  introduced.

## Recommendation

**Ready for implementation after human approval.**

The implementation is confined to the workflow coordinator, uses the existing
artifact and prompt contracts, and can be validated through deterministic
continuation scenarios without introducing runtime state or changing approval
semantics.
