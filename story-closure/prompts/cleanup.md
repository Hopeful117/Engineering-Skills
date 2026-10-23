# Story Closure Cleanup

## Mission

Return the local repository to a safe post-delivery state by removing only
verified obsolete branches.

## Preconditions

* The PR is confirmed merged.
* The human explicitly authorized cleanup.
* Remote references have been refreshed with prune behavior.
* The working tree is safe and unrelated local work will not be discarded.

## Procedure

1. Refresh remote state and inspect local and remote branch relationships.
2. Switch away from the merged Story branch only when safe.
3. Delete the local Story branch only if it is fully merged and obsolete.
4. Delete the remote Story branch only if provider policy permits and the merged
   PR confirms it is obsolete.
5. Never delete protected, current, unmerged, open-PR, or uncertain branches.
6. Verify the final branch list and working-tree status.

No cleanup operation may use force deletion. If safe cleanup is not possible,
retain the branch and report why.

## Deliverable

Return a `Cleanup Delivery Record` containing refreshed state, deleted branches,
retained branches with reasons, and final repository status.

## Stop Condition

Stop before deletion if merge state, branch ownership, open PR usage, or local
work safety cannot be verified.
