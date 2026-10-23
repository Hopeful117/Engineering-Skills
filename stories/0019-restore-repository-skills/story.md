# Story

## Metadata

**ID:**
`0019`

**Title:**
Restore Repository Engineering Skills

**Status:**
Approved

---

## Goal

Keep the repository self-contained by storing the `engineering-story` and
`quality-validation` skills that are available in the OpenCode configuration.

## Scope

* Add `engineering-story/` and all of its prompts, references, scripts, tests,
  and templates from the configured OpenCode skill directory.
* Add `quality-validation/` and its supporting references.
* Document both skills in the README and changelog.
* Preserve `story-closure` and its existing OpenCode symbolic link.

## Out of Scope

* Importing the generic `context7-mcp` skill from `~/.agents/skills`.
* Changing the behavior of the imported skills.
* Creating additional OpenCode configuration links.

## Acceptance Criteria

* [x] The two repository skills are present with their complete file trees.
* [x] Repository copies match their OpenCode source content, with trailing
  whitespace normalized for repository diff hygiene.
* [x] README and changelog document the restored skills.
* [x] `git diff --check` succeeds.

## Definition of Done

* [x] Implementation completed
* [x] Relevant validation executed
* [x] Code review completed
* [ ] Pull request merged
* [ ] Obsolete branch cleaned safely
