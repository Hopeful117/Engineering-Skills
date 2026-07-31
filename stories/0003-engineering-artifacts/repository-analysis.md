# Repository Analysis

## Story Understanding

Story 0003 requests that Engineering Artifacts become explicit, first-class
concepts in Engineering Skills. Each workflow stage already produces a document
used by later stages; the Story requires this behavior to be formally described
as an artifact chain rather than only as a sequence of prompts.

The requested documentation must define:

- what an Engineering Artifact is;
- how an artifact is produced and consumed;
- who owns an artifact;
- the artifact lifecycle;
- artifact immutability after approval;
- the relationship between workflow stages and their artifacts.

The model must be recorded through an architectural decision. The current
workflow, approval gates, and stage responsibilities must remain unchanged.

Changes to workflow stages, existing Story templates, new skills, OpenCode,
multi-agent orchestration, and Developer OS integration are out of scope.

## Repository Summary

The current repository is `/home/ludo/Bureau/workspace/Engineering-Skills` on
the `main` branch, tracking `origin/main`.

Engineering Skills is a repository of reusable engineering workflows expressed
through skills, stage-specific prompts, documentation, and persisted Story
artifacts. The `engineering-story` skill coordinates an ordered workflow with
human approval gates. Each prompt defines one stage's inputs, output report, and
stop condition.

There is no runtime service, API, database, external provider, event bus, or
message transport involved in this Story. Artifact exchange currently occurs
through Markdown documents stored in each Story directory.

## Affected Modules

### Engineering architecture documentation

The repository contains `docs/adr/`, but no ADR file currently exists there.
This module is responsible for the architectural decision required by the
Story. The ADR itself belongs to a later workflow stage and is not produced by
this analysis.

### Repository documentation and conventions

`README.md` and `CONVENTIONS.md` already describe reusable artifacts, workflow
stages, approval gates, and the intended separation between prompts and output
templates. They provide the repository-level context for formally defining the
artifact model.

### `engineering-story`

`engineering-story/SKILL.md` defines the workflow sequence and approval gates.
The files under `engineering-story/prompts/` define the artifact produced by
each stage and the artifacts consumed as inputs by subsequent stages. These
contracts are directly relevant to documenting the stage-to-artifact
relationship.

### Story artifact storage

`stories/README.md` defines the persisted artifact set within each Story
directory. It establishes the current file-based lifecycle from `story.md`
through `engineering-report.md`.

`stories/story-template.md` describes Story metadata and Definition of Done,
but the Story explicitly excludes changes to that template.

## Existing Implementation

Engineering Artifacts already exist implicitly as Markdown reports:

| Workflow stage | Produced artifact | Consumed by |
| --- | --- | --- |
| Story Definition | `story.md` | All later stages |
| Repository Analysis | `repository-analysis.md` | Implementation Planning and later stages |
| Implementation Planning | `implementation-plan.md` | Implementation, Code Review, and Engineering Report |
| Implementation | `implementation-report.md` | Code Review and Engineering Report |
| Code Review | `code-review.md` | Engineering Report and human approval |
| Engineering Report | `engineering-report.md` | Final engineering record |

`engineering-story/SKILL.md` orders these stages and requires human approval
between Repository Analysis and Planning, Planning and Implementation,
Implementation and Review, and Review and final reporting.

Each stage prompt defines its expected upstream artifacts:

- Repository Analysis consumes the Story and repository documentation.
- Implementation Planning consumes the approved Story and Repository Analysis.
- Implementation consumes the approved Story, Repository Analysis, and
  Implementation Plan.
- Code Review consumes the preceding approved artifacts, Implementation Report,
  implementation diff, and repository state.
- Engineering Report consumes the approved lifecycle artifacts and summarizes
  them as the official record.

`CONVENTIONS.md` already states that every stage produces a reusable artifact,
that artifacts have predictable structures, and that later stages can consume
them without relying on free-form conversation. It also assigns one
responsibility to each stage and preserves human authority at approval gates.

The existing documentation does not provide one formal definition covering
artifact identity, producer and consumer relationships, ownership, lifecycle
states, or post-approval immutability. No ADR currently governs that model.

## Relevant Documentation

- `stories/0003-engineering-artifacts/story.md` — authoritative scope,
  acceptance criteria, constraints, and exclusions.
- `README.md` — repository purpose, skill architecture, workflow, and existing
  artifact terminology.
- `CONVENTIONS.md` — artifact conventions, stage responsibility boundaries,
  approval gates, and human authority.
- `engineering-story/SKILL.md` — workflow ordering and approval gates.
- `engineering-story/prompts/repository-analysis.md` — Repository Analysis
  input and output contract.
- `engineering-story/prompts/implementation-plan.md` — planning input and
  output contract.
- `engineering-story/prompts/implementation.md` — implementation input and
  Implementation Report contract.
- `engineering-story/prompts/code-review.md` — review inputs and Code Review
  Report contract.
- `engineering-story/prompts/engineering-report.md` — lifecycle summary inputs
  and final record contract.
- `stories/README.md` — persisted artifact names and per-Story layout.
- `stories/story-template.md` — existing Story definition and lifecycle
  checklist; modification is out of scope.
- Story 0001 — repository foundation dependency.
- Story 0002 — scoped Repository Analysis behavior dependency.

No existing ADR governs Engineering Artifacts.

## Constraints

- Preserve the current workflow stages and their order.
- Preserve all existing human approval gates.
- Do not change the responsibilities assigned to individual workflow stages.
- Keep the artifact model independent of OpenClaw and other specific tools.
- Keep the model reusable across target repositories.
- Treat artifacts as persisted engineering knowledge rather than conversational
  output.
- Define ownership and lifecycle without transferring final engineering
  authority away from the human engineer.
- Define post-approval immutability without modifying the existing Story
  template.
- Do not introduce new skills, runtime integrations, or multi-agent behavior.
- Do not generate the architectural decision during Repository Analysis.

## Risks

- Artifact immutability must account for corrections or superseding decisions
  without allowing an approved record to be silently rewritten.
- Artifact ownership can refer to authorship, approval authority, repository
  custody, or responsibility for maintenance; an ambiguous definition would
  make lifecycle rules difficult to apply consistently.
- The model must distinguish an artifact's production from its approval because
  several artifacts exist before reaching their human approval gate.
- A tool-independent model cannot depend on OpenClaw-specific execution state or
  conversation history.
- The Engineering Report summarizes earlier artifacts, so its role as a final
  record must remain distinguishable from ownership or replacement of those
  source artifacts.

## Open Questions

1. Does artifact ownership mean the producing workflow stage, the human
   approver, the repository, or a combination of these roles?
2. Which lifecycle states are required between creation and approval?
3. When an approved artifact needs correction, should it be superseded by a new
   version, explicitly reopened, or handled through a new Story?
4. Does immutability begin at human approval only, or are completed but
   unapproved artifacts also protected from in-place changes?
5. What ADR naming and numbering convention should be used for the first file
   under `docs/adr/`?

## Recommendation

**Ready for planning.**

The current artifact chain, its producer and consumer relationships, governing
workflow constraints, and documentation surfaces are identifiable. The open
questions describe decisions that the Implementation Plan and its human
approval must make explicit before the ADR is authored.

## Approval Required

Repository Analysis completed.

Awaiting human approval before Implementation Planning.
