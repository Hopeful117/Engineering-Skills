---
name: story-closure
description: "Use when an implemented Engineering Story must be delivered: commit the work on a dedicated branch, create and validate a pull request, merge it, and safely remove obsolete branches."
---

# Story Closure

## Mission

Finalize an implemented Engineering Story through the repository delivery lifecycle:

```text
preflight
  -> dedicated branch
  -> commit
  -> push and pull request
  -> human PR validation
  -> merge
  -> conservative branch cleanup
  -> closure report
```

This skill owns delivery coordination only. It does not implement Story changes,
rewrite history, deploy, or release software.

## Preconditions

Before changing Git state, verify:

* the Story identifier and canonical Story artifact are known;
* implementation, required tests, and review artifacts are complete;
* the repository root, current branch, remotes, and working-tree state are known;
* the target integration branch is known from repository policy (normally `main`);
* the user explicitly authorized the requested delivery scope.

If the Story artifact is missing, required validation is incomplete, or repository
policy is unclear, stop and report the blocker.

## Approval Gates

Stop and request explicit confirmation before each destructive or externally visible
step:

1. Create or select the dedicated Story branch.
2. Create the commit and push it.
3. Open the pull request.
4. Merge the pull request.
5. Delete obsolete local or remote branches.

Do not infer authorization from a general request to "close" a Story. A previously
approved step does not approve later steps.

The human must validate the final PR before merge. A passing check, review, or
quality gate is evidence, not human authorization to merge.

## Branch Policy

* Never commit Story work directly on `main`, `master`, or another protected branch.
* Prefer `story/<story-id>-<short-slug>`; preserve an existing dedicated branch
  when it already contains the Story work.
* Never switch branches while there are unrelated uncommitted changes that would
  be carried across or overwritten.
* Never reset, rebase, force-push, stash away, or discard work unless the user
  explicitly requests that exact operation.

## Message Policy

Use the repository's established convention when one exists. Otherwise use:

* Commit: `feat(story-<id>): <imperative summary>`
* PR title: `feat(story-<id>): <imperative summary>`
* Merge commit: use the provider-generated `Merge pull request #<number> from
  <source-branch>` format established by this repository. Do not replace it
  with a squash commit unless the user explicitly requests an exception.
* Cleanup report: `chore(story-<id>): remove obsolete delivery branches` only if
  the repository actually requires a cleanup commit; branch deletion normally
  needs no commit.

Messages must describe the Story outcome, remain concise, and never claim tests,
review, or deployment that did not occur.

## Delivery Sequence

Use the dedicated prompts in order:

1. `prompts/preflight.md`: inspect state and produce a delivery plan.
2. `prompts/commit.md`: create one focused commit on the dedicated branch.
3. `prompts/pull-request.md`: push and create the PR with traceable metadata.
4. `prompts/merge.md`: wait for human PR validation, then merge through the
   repository's established GitHub merge-commit method.
5. `prompts/cleanup.md`: refresh remote state and remove only safely obsolete branches.

After every step, record the result in the closure report. If a command fails,
preserve its diagnostics and stop rather than trying a more destructive variant.

## Cleanup Rules

Cleanup is allowed only after the PR is confirmed merged and remote state has been
refreshed. Delete a branch only when all of these are true:

* it is the dedicated Story branch or another branch explicitly identified as
  obsolete by the user;
* the merged PR is its source of truth;
* it is fully merged into the target integration branch;
* it has no unpushed commits or unrelated work;
* it is not the current branch, a protected branch, or a branch used by another
  open PR.

If any condition cannot be verified, leave the branch and report it. Never delete
unmerged branches merely because their names look old.

## Completion

Mark the Story closure as complete only when the commit, PR, human validation,
merge, and cleanup outcomes are all explicitly known. Report skipped or blocked
actions separately from successful actions.

The final report must include:

* Story identifier and dedicated branch;
* commit hash and commit message;
* PR URL, title, and validation status;
* merge method, merge commit or resulting target hash;
* branches deleted and branches retained with reasons;
* tests and checks observed, without reclassifying them;
* remaining manual actions or blockers.

Then stop and return control to the human.
