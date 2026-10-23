# Story 0018 — Implementation Plan

## Planned Changes

1. Create `story-closure/SKILL.md` with mission, preconditions, gates, message
   conventions, delivery sequence, and cleanup safety rules.
2. Add focused prompts for preflight, commit, pull request, merge, and cleanup.
3. Add a closure report template and Git safety reference.
4. Update `README.md` and `CHANGELOG.md`.
5. Preserve the confirmed deletions without restoring or rewriting them.
6. Create the global OpenCode symbolic link.

## Delivery Plan

1. Create or select `story/0018-story-closure-delivery`.
2. Inspect and stage only the confirmed Story scope.
3. Commit with `feat(story-0018): add story closure delivery skill`.
4. Push and open a PR using the same Story identifier.
5. Wait for explicit human PR validation.
6. Merge using repository policy.
7. Delete only the merged Story branch after verification.

## Validation

* `git diff --check`
* symbolic-link target verification
* final diff and branch-state review

## Safety Constraints

No force push, hard reset, forced branch deletion, unrelated-file staging, or
restoration of the confirmed deletions.
