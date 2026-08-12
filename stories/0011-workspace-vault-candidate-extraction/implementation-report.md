# Implementation Report

## Overview

Implemented Story 0011 by introducing the first ponctual workspace-extraction
capability for transverse-memory candidates, using the current Obsidian
Engineering Vault as comparison context.

The implementation does four things:

* defines a dedicated bootstrap/discovery extraction boundary separate from
  steady-state feeding;
* adds a runbook for operator-controlled multi-repository scans;
* provides a dependency-free batch extraction script that compares selected
  repository artifacts against the current vault;
* keeps all output proposal-only with duplicate/enrichment hints and no direct
  mutation of curated notes.

## Modified Files

- `docs/references/obsidian-transverse-memory.md`
  Extended the main transverse-memory reference with ponctual extraction
  guidance, vault-aware comparison expectations, and the rule that batch
  extraction stays proposal-only.

- `transverse-memory/scripts/candidate-note.mjs`
  Reused and slightly generalized the candidate generator so other scripts can
  generate proposal-only candidate output from validated payloads without
  relying only on file-based JSON input.

## New Files

- `docs/adr/ADR-004-punctual-workspace-extraction.md`
  New ADR defining punctual multi-repository extraction, vault-aware
  deduplication hints, operator-controlled execution, and the decision to avoid
  a mandatory reusable skill at this stage.

- `docs/references/workspace-vault-extraction.md`
  New runbook/reference documenting inputs, selected source classes, output
  interpretation, repeatability, and manual review expectations.

- `transverse-memory/scripts/workspace-vault-extract.mjs`
  New dependency-free batch extraction script that scans selected repository
  artifact classes, reads current vault notes, classifies extracted results as
  `new`, `enrich-existing`, `duplicate`, or `skip`, and emits candidate-aligned
  proposal output.

- `transverse-memory/scripts/workspace-vault-extract.test.mjs`
  New Node test suite covering candidate-aligned extraction, duplicate hints,
  low-value skipping, and CLI failure signaling.

## Tests

Automated tests added:

- `transverse-memory/scripts/workspace-vault-extract.test.mjs`

Acceptance criteria covered by the implementation:

- the repository now defines a ponctual scan model across workspace
  repositories;
- the repository defines useful extraction source classes and excludes naive
  all-file scanning;
- the extraction output is candidate-note-aligned and provenance-preserving;
- the extraction flow compares against current vault content before suggesting
  additions;
- duplicate/enrichment hints are explicit;
- project memory and transverse memory remain distinct;
- the implementation uses a script and runbook rather than introducing a
  mandatory reusable skill.

## Validation

Command: `printf '{"baseCommit":"decc725e4d08dc9a8a0f413a1c9c4721bc067367"}' | node engineering-story/scripts/devlog-story.mjs --base-url http://localhost:18080 --project-id 93441821-2a71-4a1d-93cd-f38369030205 --story-id e48fb890-ef39-4a43-b555-06b47c27663b --operation start`
Result: Passed (`{"ok":true}`)

Command: `node --test transverse-memory/scripts/workspace-vault-extract.test.mjs`
Result: Passed. 3 tests succeeded covering candidate-aligned extraction,
duplicate hints from current vault content, low-value skipping, and CLI failure
signaling.

Command: `node transverse-memory/scripts/workspace-vault-extract.mjs --vault-root '/home/ludo/Bureau/workspace/dev-tools/obsidian/Engineering Vault' --repo-roots /home/ludo/Bureau/workspace/Engineering-Skills`
Result: Passed during practical local validation with the real Engineering
Vault. The script returned `mode: "proposal-only"`, considered 7 current vault
notes, and emitted candidate batches from selected Engineering-Skills artifact
classes without modifying the curated vault.

Command: `rg -n "punctual|candidate|duplicate|enrich|vault|operator|proposal-only|ineligible" docs/adr docs/references transverse-memory`
Result: Passed. Confirmed the expected extraction, operator-control, duplicate,
and proposal-only language across the new ADR, updated reference, runbook, and
script.

Command: `rg -n "/home/ludo|localhost|93441821|f3d56247" docs/adr docs/references transverse-memory`
Result: Passed with no matches in reusable documentation or scripts.

Command: `git diff --check`
Result: Passed. No whitespace or patch-format issues detected.

## Deviations

One practical adaptation was required:

- the real vault currently contains curated notes without uniform YAML
  frontmatter, so the extraction script now includes a safe fallback for
  reading vault note titles heuristically when strict catalog parsing is not
  possible.

This does not change the curated-note contract from Story 0009. It only makes
bootstrap comparison robust enough to work with the current vault state.

## Remaining Work

None for the implementation stage.

Steady-state feeding remains owned by Story 0010, and any future reusable skill
escalation remains a follow-up only if repeated practical use justifies it.

## Recommendation

Ready for Review
