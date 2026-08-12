# Implementation Report

## Overview

Implemented the first continuous vault-feeding workflow for
`Engineering-Skills`.

The implementation connects the existing workflow-level `Vault Outcome`
reporting to deterministic proposal generation so a completed Story can now
produce a repository-owned, reviewable transverse-memory proposal without
writing directly into the curated Obsidian vault.

The delivered model is:

* Story-local structured outcome:
  * `vault-outcome.json`
* repository-owned proposal backlog:
  * `transverse-memory/proposals/`
* deterministic generator:
  * `story-vault-feed.mjs`

This stays aligned with the approved Story:

* steady-state trigger is now explicit;
* eligible continuous feeding remains Story-scoped;
* duplicate churn is reduced through deterministic proposal keys and
  provenance-aware replay suppression;
* proposal-only behavior is preserved.

## Implemented Changes

### 1. Workflow contract now supports continuous feeding

`engineering-story/SKILL.md` now extends the existing vault integration by
requiring:

* a structured `vault-outcome.json` artifact when the Story outcome is
  `new candidate note` or `enrich-existing candidate`;
* generation or update of a repository-owned proposal artifact under
  `transverse-memory/proposals/`;
* continued separation between proposal artifacts and curated vault notes.

The contract also extends Code Review and Engineering Report expectations so
continuous-feeding results are reviewable and summarized explicitly.

### 2. Workflow prompts now carry the structured artifact

The implementation prompt now requires:

* the human-readable `Vault Outcome` section;
* the structured `vault-outcome.json` artifact when applicable;
* generation or update of a repository-owned proposal artifact.

The Code Review prompt now verifies:

* consistency between the Implementation Report and `vault-outcome.json`;
* deterministic duplicate suppression behavior;
* continued proposal-only boundaries.

The Engineering Report prompt now summarizes whether continuous feeding:

* created a proposal;
* updated a proposal;
* skipped a duplicate/no-op;
* was not applicable.

### 3. A new steady-state runbook now exists

Added `docs/references/continuous-vault-feeding.md` to document:

* the difference between bootstrap extraction and continuous feeding;
* the trigger point during Documentation Reconciliation;
* the role of `vault-outcome.json`;
* the repository-owned proposal backlog;
* the duplicate-suppression model;
* validation expectations.

### 4. A repository-owned proposal backlog now exists

Added:

* `transverse-memory/proposals/README.md`

This establishes a committed, reviewable, explicitly non-curated location for
continuous Story-driven proposals.

### 5. Added deterministic Story-to-proposal generation

Added:

* `transverse-memory/scripts/story-vault-feed.mjs`

The new script:

* reads `vault-outcome.json` from a Story directory;
* validates the `vault-outcome-v1` contract;
* skips proposal generation for:
  * `none`
  * `deferred`
* uses `targetCuratedNote` or candidate title as a stable proposal key;
* generates proposal markdown via `generateCandidateNote(...)`;
* writes or updates proposal files under `transverse-memory/proposals/`;
* suppresses duplicate replay when the same Story provenance already exists.

### 6. Added automated tests for continuous feeding

Added:

* `transverse-memory/scripts/story-vault-feed.test.mjs`

Covered behaviors:

* create proposal for `new-candidate`;
* update an `enrich-existing` proposal;
* suppress replay of the same Story provenance;
* skip proposal generation for `none`;
* return the standard CLI failure path when `vault-outcome.json` is missing.

### 7. `obsidian-transverse-memory` reference now covers steady-state feeding

`docs/references/obsidian-transverse-memory.md` now documents:

* duplicate suppression using repository-owned proposals;
* the distinction between bootstrap extraction and continuous feeding;
* the role of the structured Story-local artifact;
* continued prohibition on direct curated-vault writes.

### 8. The workflow was dogfooded on Story 0014 itself

Created:

* `stories/0014-continuous-vault-feeding-workflow/vault-outcome.json`

Then executed:

```text
node transverse-memory/scripts/story-vault-feed.mjs \
  --story-dir stories/0014-continuous-vault-feeding-workflow \
  --proposals-root transverse-memory/proposals \
  --vault-root "/home/ludo/Bureau/workspace/dev-tools/obsidian/Engineering Vault"
```

Result:

* repository-owned proposal created at:
  * `transverse-memory/proposals/fluid-knowledge-feeding-pipeline.md`

This is important because the Story was validated on the real vault, not only
on isolated fixtures.

## Modified Files

* `engineering-story/SKILL.md`
* `engineering-story/prompts/implementation.md`
* `engineering-story/prompts/code-review.md`
* `engineering-story/prompts/engineering-report.md`
* `docs/references/obsidian-transverse-memory.md`

## Created Files

* `docs/references/continuous-vault-feeding.md`
* `transverse-memory/proposals/README.md`
* `transverse-memory/proposals/fluid-knowledge-feeding-pipeline.md`
* `transverse-memory/scripts/story-vault-feed.mjs`
* `transverse-memory/scripts/story-vault-feed.test.mjs`
* `stories/0014-continuous-vault-feeding-workflow/vault-outcome.json`

## Validation

### Automated

Command:

```text
node --test transverse-memory/scripts/story-vault-feed.test.mjs
```

Result:

* `4/4` tests passed.

Covered:

* proposal creation;
* enrich-existing update behavior;
* duplicate replay suppression;
* non-applicable outcome handling;
* CLI error path.

Command:

```text
node --test transverse-memory/scripts/candidate-note.test.mjs
```

Result:

* `5/5` tests passed.

### Repository hygiene

Command:

```text
git diff --check
```

Result:

* passed.

### Real workflow validation

Command:

```text
node transverse-memory/scripts/story-vault-feed.mjs \
  --story-dir stories/0014-continuous-vault-feeding-workflow \
  --proposals-root transverse-memory/proposals \
  --vault-root "/home/ludo/Bureau/workspace/dev-tools/obsidian/Engineering Vault"
```

Final observed result:

* `action = "created"`
* `proposalPath = /home/ludo/Bureau/workspace/Engineering-Skills/transverse-memory/proposals/fluid-knowledge-feeding-pipeline.md`
* `targetCuratedNote = "Fluid Knowledge Feeding Pipeline"`

### Practical issues discovered and corrected

Dogfooding the workflow against the real vault revealed two concrete issues:

1. The first implementation assumed catalog-only vault notes with YAML
   frontmatter.

   Correction:

* added a tolerant title-loading fallback matching the pragmatic behavior of
  the bootstrap extractor.

2. The first fallback selected the first `#` heading as the note title, which
   failed for notes whose first heading was a numbered section such as
   `# 1. Core Pipeline`.

   Correction:

* when the first heading is a numbered section, the script now falls back to
  the Markdown filename as the note title.

These were implementation issues, not plan changes.

## Documentation Reconciliation

Documentation update: Required.

Updated documentation:

* `docs/references/obsidian-transverse-memory.md`
* `docs/references/continuous-vault-feeding.md`

Reason:

* Story 0014 introduces a new steady-state workflow contract for continuous
  proposal generation and repository-owned proposal backlog behavior.

## Vault Outcome

### Repository Analysis consultation

Vault context was consulted during Repository Analysis.

### Outcome

* `enrich-existing`

### Rationale and provenance

Story 0014 defines a steady-state workflow path that complements the existing
`Fluid Knowledge Feeding Pipeline` note by adding:

* a structured Story-local outcome contract;
* a repository-owned proposal backlog;
* deterministic duplicate suppression;
* a concrete trigger point inside `engineering-story`.

Primary provenance:

* `stories/0014-continuous-vault-feeding-workflow/vault-outcome.json`
* `docs/references/continuous-vault-feeding.md`
* `transverse-memory/scripts/story-vault-feed.mjs`
* `transverse-memory/proposals/fluid-knowledge-feeding-pipeline.md`

### Target curated note

* `Fluid Knowledge Feeding Pipeline`

### Continuous feeding result

* proposal artifact created:
  * `transverse-memory/proposals/fluid-knowledge-feeding-pipeline.md`

The outcome remained proposal-only.

## Deviations

No architectural deviation from the approved plan.

One practical refinement emerged during real-vault validation:

* continuous feeding needed the same tolerant vault-title fallback philosophy
  already used by bootstrap extraction, because the curated vault does not
  uniformly use strict YAML-frontmatter note contracts.

This refinement remains fully consistent with the approved objective:

* make the workflow reliable on the actual vault without weakening the curation
  boundary.
