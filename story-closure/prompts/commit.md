# Story Closure Commit

## Mission

Create the focused Story commit on a dedicated branch without altering unrelated
work.

## Preconditions

* Preflight is complete.
* The human explicitly authorized branch selection and commit creation.
* The working tree contains only Story changes, or unrelated changes are safely
  isolated without discarding them.

## Procedure

1. Create or select the dedicated branch.
2. Inspect the diff and staged file list.
3. Stage only files belonging to the Story.
4. Create one focused commit using the approved message.
5. Verify the commit hash, parent, branch, and clean/remaining worktree state.

Do not amend an existing commit unless explicitly requested. Do not use reset,
force-push, or broad staging as a shortcut.

## Deliverable

Return the commit hash, branch, exact message, staged files, and any remaining
worktree changes.

## Stop Condition

Stop before committing when ownership of any changed file is unclear or when the
commit would include unrelated work.
