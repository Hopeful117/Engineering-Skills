# Repository Analysis

## Story Understanding

Story 0002 requests a refinement of the Repository Analysis stage in the
`engineering-story` workflow. The stage must continue to gather the repository
context needed by Implementation Planning, but its artifact must remain
descriptive, concise, and limited to the current Story.

The problem being addressed is a boundary overlap between repository
understanding and repository evaluation. The first workflow execution produced
the required artifact and respected the approval gate, but also included
repository-wide observations and suggestions that are not inputs required for
planning the Story.

The requested behavior is therefore:

- identify only Story-relevant modules and existing implementations;
- report only Story-relevant constraints and implementation risks;
- avoid repository audits, architectural reviews, technical-debt analysis, and
  unsolicited improvement suggestions;
- produce a shorter artifact suitable as input to Implementation Planning.

Repository cleanup, architecture review, documentation review, technical-debt
analysis, Implementation Planning, and code generation are explicitly out of
scope.

## Repository Summary

The current repository is `/home/ludo/Bureau/workspace/Engineering-Skills` on
the `main` branch, tracking `origin/main`.

Engineering Skills is a repository of reusable prompts and workflow definitions
for human-controlled AI-assisted engineering. Its current workflow module,
`engineering-story`, coordinates these ordered stages:

```text
Repository Analysis
→ Human Approval
→ Implementation Planning
→ Human Approval
→ Implementation
→ Code Review
→ Human Approval
→ Engineering Report
```

`SKILL.md` owns workflow coordination and approval gates. Individual files in
`engineering-story/prompts/` own the instructions for each stage. There is no
application service, API, database, or event flow involved in this Story.

The working tree already contains unrelated or preceding uncommitted repository
foundation work. Story 0002 itself currently contains only `story.md` before
this Repository Analysis artifact.

## Affected Modules

### `engineering-story/prompts/repository-analysis.md`

This is the module directly responsible for the Repository Analysis stage. It
defines the stage mission, required inputs, inspection objectives, report
sections, constraints, and stop condition. Story 0002 changes the behavior
specified by this prompt.

### `engineering-story/SKILL.md`

This coordinator invokes the Repository Analysis prompt and enforces the first
human approval gate. It is relevant as a workflow contract, but the Story
requires its workflow order and approval gates to remain unchanged.

### `stories/0001-repository-foundation/repository-analysis.md`

This artifact records the first real execution referenced by the Story. It
provides the concrete example of repository-wide observations and questions
that Story 0002 intends to exclude from future Repository Analysis artifacts.
It is an analysis input, not a target for modification.

## Existing Implementation

`engineering-story/prompts/repository-analysis.md` currently defines:

- a Repository Analyst mission separated from planning, implementation, and
  review;
- required loading of repository, workflow, and relevant architecture
  documentation;
- objectives covering Story understanding, ownership, existing implementation,
  architecture, dependencies, risks, and missing information;
- an instruction to inspect only repository areas necessary for the Story;
- an instruction to avoid unrelated modules and general repository audits;
- a fixed report with Story Understanding, Repository Summary, Affected
  Modules, Existing Implementation, Relevant Documentation, Constraints, Risks,
  Open Questions, Recommendation, and Approval Required sections;
- a stop condition requiring human approval before Implementation Planning.

The prompt's generic objectives ask about services, APIs, database entities,
events, and message flows. These elements apply conditionally depending on the
target Story and repository.

The Story 0001 Repository Analysis followed the current report structure. In
addition to its Story-specific context, it recorded repository state,
documentation-path differences, absent target-structure paths, changelog state,
and related clarification questions. Story 0002 identifies that type of
repository-wide evaluation as outside the intended stage responsibility.

`CONVENTIONS.md` defines the governing separation of responsibilities:

- Repository Analysis understands;
- Implementation Planning prepares;
- Implementation builds;
- Code Review verifies;
- Engineering Report summarizes.

It also requires predictable artifacts, explicit approval gates, and prompts
with a single responsibility.

## Relevant Documentation

- `stories/0002-improve-repository-analysis/story.md` — authoritative goal,
  scope, acceptance criteria, constraints, and exclusions.
- `engineering-story/SKILL.md` — workflow order and approval-gate contract.
- `engineering-story/prompts/repository-analysis.md` — current specification of
  the stage affected by the Story.
- `CONVENTIONS.md` — responsibility separation, prompt structure, artifacts,
  and approval-gate conventions.
- `README.md` — repository purpose, skill architecture, and workflow overview.
- `stories/0001-repository-foundation/repository-analysis.md` — prior real Story
  execution referenced by Story 0002.
- `stories/README.md` — expected location and progression of Story artifacts.

No ADR governs this Story, and no repository-level `AGENTS.md` or
`docs/workflow/` hierarchy is present.

## Constraints

- Preserve the existing Engineering Story workflow order.
- Preserve every human approval gate.
- Keep Repository Analysis responsible for understanding rather than
  evaluation.
- Preserve the responsibilities of Implementation Planning, Implementation,
  Code Review, and Engineering Report.
- Keep analysis limited to modules and context relevant to the current Story.
- Report risks only when they can affect implementation of the current Story.
- Do not introduce repository cleanup, architecture review, documentation
  review, or technical-debt analysis into this stage.
- Do not generate implementation details or code during Repository Analysis.
- Keep the resulting artifact predictable and reusable by the next workflow
  stage.
- Retain tool independence and repository-specific documentation precedence.

## Risks

- The prompt is reusable across repositories and Story types, so its scope
  controls must still allow relevant architecture, API, persistence, and
  dependency information when those facts materially affect implementation.
- The distinction between an implementation risk and a general repository
  observation must be explicit enough to produce consistent artifacts across
  different executions.
- The Recommendation section must communicate planning readiness without
  becoming an implementation proposal or an unsolicited repository-improvement
  recommendation.
- Validation requires a real Story whose relevant context is sufficient to show
  that the refined prompt remains useful to Implementation Planning while
  excluding unrelated evaluation.

## Open Questions

1. Is Story 0001 the intended real Story for validating the refined Repository
   Analysis prompt, or should validation use another Story?
2. Should the fixed report retain every current section, or may sections with no
   Story-relevant content be omitted while keeping the artifact predictable?
3. Should the prompt define an explicit test for distinguishing implementation
   risks from general audit findings, or is the Story's stated boundary the
   complete rule?

## Recommendation

**Ready for planning.**

The affected prompt, governing workflow contract, conventions, and prior
execution artifact are identifiable. The open questions concern validation and
report-shape details that can be resolved during human review or Implementation
Planning without changing the Story's objective or workflow boundary.

## Approval Required

Repository Analysis completed.

Awaiting human approval before Implementation Planning.
