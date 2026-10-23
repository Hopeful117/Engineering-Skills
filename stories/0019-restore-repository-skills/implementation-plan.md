# Story 0019 — Implementation Plan

1. Copy `engineering-story/` from the configured OpenCode skills directory.
2. Copy `quality-validation/` from the configured OpenCode skills directory.
3. Update the repository structure and Skills section in `README.md`.
4. Record both restored skills in `CHANGELOG.md`.
5. Compare each repository copy with its source directory.
6. Run `git diff --check` and review the complete staged diff.

Delivery will use a dedicated `story/0019-restore-repository-skills` branch,
the repository's normal PR merge-commit method, and conservative branch cleanup.
