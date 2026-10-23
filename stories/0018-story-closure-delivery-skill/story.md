# Story

## Metadata

**ID:**
`0018`

**Title:**
Create Story Closure Delivery Skill

**Status:**
Approved

---

## Goal

Provide a reusable OpenCode skill that closes an implemented Story through
dedicated-branch delivery, commit, pull request, merge, and conservative branch
cleanup.

## Context

The repository contains reusable Engineering Skills and is configured for global
OpenCode skill discovery. The delivery workflow needs explicit messages,
approval gates, and safe handling of local and remote branches.

## Problem

Story delivery currently depends on ad-hoc Git operations. Without a dedicated
workflow, commits may land on protected branches, pull-request validation may be
skipped, or obsolete branches may be removed unsafely.

## Scope

* Add the `story-closure` skill and its workflow prompts.
* Add a closure-report template and Git safety reference.
* Document the skill in the repository README and changelog.
* Register the skill in OpenCode through a symbolic link.
* Include the already-present deletions in `engineering-story/` and
  `quality-validation/`, confirmed by the user as part of this delivery.

## Out of Scope

* Implementing Story product code.
* Rewriting or restoring the confirmed deletions.
* Deployment or release automation.
* Force pushes, history rewriting, or deletion of unmerged branches.

## Acceptance Criteria

* [x] The skill defines the complete commit, PR, merge, and cleanup sequence.
* [x] Destructive or externally visible operations require explicit confirmation.
* [x] Commit and PR messages have a documented convention.
* [x] Cleanup refuses uncertain, protected, current, or unmerged branches.
* [x] The skill is registered through a symbolic link in OpenCode's global skills directory.
* [x] The confirmed existing deletions remain represented in the delivery diff.
* [x] `git diff --check` succeeds.

## Constraints

* Preserve human control over Git integration.
* Keep the skill tool-independent.
* Do not discard unrelated work.
* Follow the repository skill conventions.

## Dependencies

* `CONVENTIONS.md`
* OpenCode skill discovery conventions

## Relevant Documentation

* `README.md`
* `CONVENTIONS.md`
* `story-closure/SKILL.md`

## Definition of Done

* [x] Story artifacts created
* [x] Implementation completed
* [x] Relevant validation executed
* [x] Code review completed
* [ ] Pull request merged
* [ ] Obsolete branches cleaned safely
