# Story Closure Merge

## Mission

Merge a human-validated Story pull request using the repository's established
GitHub merge-commit methodology.

## Preconditions

* The PR URL and head commit are known.
* Required checks and reviews are in the required state.
* The human explicitly confirmed final PR validation and merge authorization.
* The PR is not stale or conflicted.

## Procedure

1. Re-read the PR status immediately before merging.
2. Use the provider's normal merge-commit operation, matching the repository's
   history (`Merge pull request #<number> from <source-branch>`). Do not use
   squash or rebase unless the user explicitly authorizes an exception.
3. If the API or token cannot perform that operation, stop and report the
   permission failure. Do not silently fall back to squash, force-push, or a
   local history rewrite.
4. Verify the resulting merged state and target branch commit.
5. Do not delete branches in this stage unless cleanup has separately been
   authorized and all cleanup preconditions are met.

## Deliverable

Return a `Merge Delivery Record` containing merge status, method, resulting hash,
target branch, and provider response.

## Stop Condition

Stop if validation, review, checks, permissions, or mergeability are uncertain.
