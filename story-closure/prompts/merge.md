# Story Closure Merge

## Mission

Merge a human-validated Story pull request using the repository's approved policy.

## Preconditions

* The PR URL and head commit are known.
* Required checks and reviews are in the required state.
* The human explicitly confirmed final PR validation and merge authorization.
* The PR is not stale or conflicted.

## Procedure

1. Re-read the PR status immediately before merging.
2. Prefer the repository's configured merge method; otherwise use squash when
   policy permits and preserve the Story identifier in the merge message.
3. Verify the resulting merged state and target branch commit.
4. Do not delete branches in this stage unless cleanup has separately been
   authorized and all cleanup preconditions are met.

## Deliverable

Return a `Merge Delivery Record` containing merge status, method, resulting hash,
target branch, and provider response.

## Stop Condition

Stop if validation, review, checks, permissions, or mergeability are uncertain.
