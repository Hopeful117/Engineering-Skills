# Story 0018 — Repository Analysis

## Scope

The change is repository-level workflow content, not application code. The
repository already uses one directory per skill with `SKILL.md`, prompts,
templates, and references. `CONVENTIONS.md` requires explicit workflow stages,
artifacts, approval gates, and human control.

## Findings

* The new skill belongs in `story-closure/`.
* OpenCode discovers global skills below `~/.config/opencode/skills`.
* A symbolic link can expose the repository-owned skill without copying it.
* The current worktree is on `main` and contains the new skill, README and
  changelog changes, plus pre-existing deletions in `engineering-story/` and
  `quality-validation/`.
* The user explicitly confirmed that those deletions are part of this delivery.

## Risks

* Delivering from `main` would violate the dedicated-branch requirement.
* The confirmed deletions materially reduce the existing skill surface and must
  remain visible in the PR for human review.
* Branch cleanup must not remove the current branch or any unmerged branch.

## Decision

Create a dedicated Story branch, commit only the confirmed current diff, open a
PR, wait for human PR validation, merge according to repository policy, then
clean up only verified obsolete branches.

## Validation Evidence

`git diff --check` passed before this artifact was created. The symbolic link
was verified to resolve to `story-closure/`.
