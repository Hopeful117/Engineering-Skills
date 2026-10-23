# Git Safety Reference

## Safe Defaults

* Inspect before mutating.
* Prefer fast-forward updates and non-force pushes.
* Stage explicit paths rather than all changes when ownership is mixed.
* Verify merge state before branch deletion.
* Keep unrelated user work untouched.

## Forbidden Shortcuts

Do not use `reset --hard`, force pushes, forced branch deletion, broad stashing,
or history rewriting to make the workflow appear complete.

## Branch Deletion Evidence

Deletion requires evidence that the branch is merged, obsolete, not current,
not protected, and not used by another open pull request. Missing evidence means
retain the branch and report the uncertainty.
