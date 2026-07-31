# Implementation Plan

## Overview

Create one architectural decision record that defines Engineering Artifacts as
the primary persisted outputs and inputs of Engineering Skills workflows.

The ADR will formalize the model already implied by `engineering-story` and
`CONVENTIONS.md` without changing workflow stages, prompts, approval gates, or
Story templates. It will remain tool-independent and applicable across target
repositories.

## Planned Changes

1. Create the first Engineering Skills ADR at
   `docs/adr/ADR-001-engineering-artifacts.md`.
2. Record the decision context: workflow stages already exchange reusable
   documents, but the repository does not formally define their shared model.
3. Define an Engineering Artifact as a persisted, structured engineering record
   produced by one workflow stage and consumed by later stages.
4. Document the existing artifact chain:

   | Stage | Produced artifact | Principal consumers |
   | --- | --- | --- |
   | Story Definition | Story | All later stages |
   | Repository Analysis | Repository Analysis | Implementation Planning and later stages |
   | Implementation Planning | Implementation Plan | Implementation, review, and final reporting |
   | Implementation | Implementation Report | Code Review and final reporting |
   | Code Review | Code Review Report | Human approval and final reporting |
   | Engineering Report | Engineering Report | Final engineering record |

5. Define production and consumption rules:
   - each stage produces one standardized artifact;
   - later stages consume approved upstream artifacts where an approval gate
     exists;
   - persisted artifacts, rather than conversational context, carry engineering
     knowledge between stages;
   - an artifact must remain understandable without the conversation that
     produced it.
6. Define ownership as distinct responsibilities:
   - the producing stage is responsible for artifact content;
   - the human engineer owns approval and rejection decisions;
   - the repository provides custody and traceability of persisted artifacts.
7. Define a minimal lifecycle that distinguishes:
   - creation or drafting;
   - completion by the producing stage;
   - human review where an approval gate exists;
   - approval or rejection;
   - consumption by downstream stages;
   - supersession when an approved decision must be replaced.
8. Define immutability rules:
   - artifacts may be revised before approval;
   - approval establishes an immutable workflow input;
   - approved artifacts must not be silently rewritten;
   - corrections require an explicitly traceable superseding artifact or a new
     approved workflow decision;
   - downstream artifacts do not replace or erase their source artifacts.
9. Record consequences, including predictable interoperability, auditability,
   explicit lifecycle management, and the cost of retaining and superseding
   approved records.
10. State the boundaries of the decision: it defines the conceptual model but
    does not alter current stages, approval gates, file templates, execution
    tools, or repository integrations.

## Files to Modify

None.

## Files to Create

- `docs/adr/ADR-001-engineering-artifacts.md` — architectural decision defining
  Engineering Artifacts, their stage relationships, ownership, lifecycle,
  immutability, and consequences.

The workflow artifact produced by the later Implementation stage will be
recorded separately according to the `engineering-story` workflow; it is not
part of the architectural content change itself.

## Dependencies

- Approved Story 0003.
- Approved Repository Analysis for Story 0003.
- Story 0001 repository foundation and Story directory conventions.
- Story 0002 scoped Repository Analysis behavior.
- `README.md` for repository purpose and workflow context.
- `CONVENTIONS.md` for artifact, responsibility, approval, and tool-independence
  conventions.
- `engineering-story/SKILL.md` for the authoritative workflow order and approval
  gates.
- The stage contracts in `engineering-story/prompts/` for current artifact
  producer and consumer relationships.

There are no runtime, API, database, external-service, or package dependencies.

## Test Plan

No automated code tests are required because the implementation is a single
Markdown architectural record and changes no executable behavior.

Perform deterministic documentation validation:

1. Confirm the ADR exists at the exact planned path.
2. Confirm it formally defines Engineering Artifacts.
3. Confirm every current workflow stage is mapped to its produced artifact and
   downstream consumers.
4. Confirm production, consumption, ownership, lifecycle, and post-approval
   immutability are explicitly documented.
5. Confirm the decision preserves the current workflow and every approval gate.
6. Confirm the model contains no OpenClaw-specific requirement and remains
   reusable across repositories.
7. Confirm excluded integrations and Story-template changes are not introduced.
8. Inspect the Git diff and verify the ADR is the only architectural content
   file created or modified by implementation.

## Risks

- Ownership terminology may conflate content responsibility, approval
  authority, and repository custody unless the ADR keeps them distinct.
- Lifecycle terminology may unintentionally imply a new workflow state machine;
  the ADR must describe the existing process without changing stage behavior.
- Immutability may prevent legitimate corrections if supersession is not
  explicitly described.
- The artifact-chain table may drift from prompt contracts if it introduces
  stages or approval gates not present in `SKILL.md`.
- Tool-specific storage or orchestration details would conflict with the
  repository's reuse and tool-independence constraints.

## Validation Checklist

- [ ] Only `docs/adr/ADR-001-engineering-artifacts.md` is created as Story
  implementation content.
- [ ] The ADR has a clear title, status, context, decision, consequences, and
  scope boundaries.
- [ ] Engineering Artifact is formally defined.
- [ ] Every current workflow stage is related to an output artifact.
- [ ] Artifact production and consumption are documented.
- [ ] Producing-stage responsibility, human approval authority, and repository
  custody are distinguished.
- [ ] Drafting, completion, review, approval or rejection, consumption, and
  supersession are covered by the lifecycle.
- [ ] Approved artifacts are immutable and corrections remain traceable.
- [ ] Existing stages and approval gates are unchanged.
- [ ] Existing Story templates are unchanged.
- [ ] No new skill or runtime integration is introduced.
- [ ] The model is tool-independent and reusable across repositories.
- [ ] The final diff matches the approved scope.

## Recommendation

**Ready for implementation after human approval.**

The implementation is limited to one ADR, has no runtime dependencies, and can
be validated directly against the Story acceptance criteria and existing
workflow contracts.
