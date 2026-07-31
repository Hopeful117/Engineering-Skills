# ADR-001 — Engineering Artifacts as First-Class Workflow Records

- **Status:** Accepted
- **Date:** 2026-07-31
- **Decision scope:** Engineering Skills workflows

## Context

Engineering Skills coordinates engineering work through explicit stages such as
Repository Analysis, Implementation Planning, Implementation, Code Review, and
Engineering Reporting. Each stage already produces a structured document that
is persisted in a Story directory and used by later stages.

Those documents contain the durable engineering knowledge of the workflow. The
conversation or tool that produced them is incidental and may not remain
available to later stages. However, the repository currently describes these
documents mainly as prompt outputs and does not define a shared model for their
production, consumption, ownership, lifecycle, approval, or immutability.

Without that model, different skills could produce incompatible records or
depend on conversational context that cannot be reliably reused or audited.

## Decision

Engineering Artifacts are first-class workflow records.

An **Engineering Artifact** is a persisted, structured engineering record
produced by one workflow stage to capture its outcome and provide authoritative
input to later stages.

An Engineering Artifact must:

- have a predictable structure appropriate to its stage;
- be persisted in the target repository or another repository-approved
  location;
- be understandable without the conversation or tool execution that produced
  it;
- identify the engineering outcome of one stage;
- preserve the information required by its downstream consumers;
- remain traceable to the Story and upstream artifacts that informed it.

Free-form conversation may support artifact production, but it is not a
substitute for an Engineering Artifact.

## Artifact Chain

The Engineering Story workflow is a chain of Engineering Artifacts:

| Workflow stage | Produced artifact | Principal consumers |
| --- | --- | --- |
| Story Definition | Story | All later stages |
| Repository Analysis | Repository Analysis | Implementation Planning and later stages |
| Implementation Planning | Implementation Plan | Implementation, Code Review, and Engineering Report |
| Implementation | Implementation Report | Code Review and Engineering Report |
| Code Review | Code Review Report | Human approval and Engineering Report |
| Engineering Reporting | Engineering Report | Final engineering record |

Each artifact adds the knowledge owned by its stage. Downstream artifacts may
summarize or reference upstream artifacts, but they do not replace or erase
them.

This decision preserves the existing workflow stages, their order, and every
approval gate.

## Artifact Production

Each workflow stage produces one primary standardized artifact.

The producing stage must:

- use the approved upstream artifacts required by its stage contract;
- remain within its assigned responsibility;
- record facts, decisions, results, uncertainties, and deviations required by
  its output contract;
- persist the completed artifact before the workflow advances;
- stop at the existing approval gate when the workflow requires one.

An artifact is complete when it satisfies its stage output contract. Completion
does not imply human approval.

## Artifact Consumption

A downstream stage consumes persisted upstream artifacts as its authoritative
workflow inputs.

Consumers must:

- use approved upstream artifacts where an approval gate exists;
- respect the decisions, scope, and constraints recorded by those artifacts;
- report missing or contradictory inputs instead of reconstructing them from
  assumptions;
- preserve traceability when summarizing or deriving new knowledge;
- avoid silently changing an upstream artifact through a downstream report.

Repository-specific documentation and accepted architectural decisions remain
authoritative for repository-specific behavior.

## Ownership

Artifact ownership is divided into three distinct responsibilities.

### Content responsibility

The producing workflow stage is responsible for the completeness, accuracy,
and scope of the artifact it creates. The agent, tool, or human executing that
stage acts in the stage's defined engineering role.

### Approval authority

The human engineer owns approval and rejection decisions. Producing an artifact
does not authorize the producer to approve it or bypass a required gate.

### Custody and traceability

The repository owns custody of persisted artifacts. Repository history and
Story organization preserve their identity, ordering, provenance, and
relationship to later records.

These responsibilities must not be conflated. A tool may produce content, but
it does not thereby gain approval authority or ownership of the engineering
decision.

## Artifact Lifecycle

Engineering Artifacts follow a minimal conceptual lifecycle. These lifecycle
states describe existing workflow behavior; they do not add workflow stages or
approval gates.

### Draft

The producing stage is creating the artifact. The artifact may be revised and
is not yet available as a completed downstream input.

### Completed

The producing stage has satisfied its output contract and persisted the
artifact. Where the workflow defines an approval gate, the artifact awaits
human review and is not yet an approved downstream input.

### Approved

The human engineer has accepted the completed artifact at an existing approval
gate. It becomes an authoritative, immutable input for downstream stages.

Artifacts not subject to an approval gate, such as the final Engineering
Report, become final records when their stage completes.

### Rejected

The human engineer has declined the artifact. It must not be used as an
approved downstream input. The producing stage may create a revised artifact
for a new approval decision.

### Consumed

One or more downstream stages have used the approved or final artifact. Being
consumed does not alter the artifact or remove its authority.

### Superseded

A later, explicitly approved artifact replaces an earlier approved artifact for
future workflow decisions. The superseded artifact remains preserved as part
of the engineering history and continues to explain decisions made while it was
authoritative.

## Approval and Immutability

Artifacts may be revised while they are Draft or while a rejected artifact is
being reworked for another approval decision.

Human approval establishes an immutable workflow input. An approved artifact
must not be silently rewritten, including to correct an error, clarify wording,
or align it with later work.

When an approved artifact must change:

1. the change must be explicit;
2. the replacement must be persisted as a traceable new version, successor, or
   artifact produced through a new approved workflow decision;
3. the replacement must pass the approval gate applicable to that artifact;
4. the relationship to the superseded artifact must be recorded;
5. the superseded artifact must remain available in repository history.

Immutability protects the reasoning chain used by downstream stages. It does
not prohibit correction; it requires correction to remain visible and
reviewable.

## Tool Independence

The artifact model describes engineering behavior rather than an execution
technology.

It does not require:

- a specific AI assistant;
- a particular workflow orchestrator;
- conversational memory;
- a database or remote artifact service;
- a particular serialization format beyond the repository's chosen artifact
  conventions.

Any tool may produce or consume an Engineering Artifact if it respects the
artifact contract, repository documentation, and human approval gates.

## Scope Boundaries

This decision defines the conceptual Engineering Artifact model only.

It does not:

- add, remove, reorder, or rename workflow stages;
- add, remove, or bypass approval gates;
- change the responsibilities of existing stages;
- modify existing Story templates;
- introduce a new skill;
- introduce a runtime integration or orchestration platform;
- define OpenCode, multi-agent, or Developer OS integration;
- mandate a centralized artifact store.

## Consequences

### Positive

- Workflow knowledge remains reusable without conversational context.
- Stage inputs and outputs have explicit producer and consumer relationships.
- Approval authority remains with the human engineer.
- Approved decisions become stable inputs for downstream work.
- Supersession preserves correction history without silently changing prior
  decisions.
- Skills can interoperate through a shared, tool-independent artifact model.
- Story directories provide an auditable engineering record.

### Costs and trade-offs

- Artifact producers must persist complete records rather than rely on
  conversation summaries.
- Approval and supersession relationships must be maintained explicitly.
- Correcting an approved artifact requires a traceable replacement instead of
  an in-place edit.
- Repositories retain superseded artifacts or their history to preserve the
  decision chain.

## Alternatives Considered

### Treat prompt responses as transient conversation

Rejected because later stages would depend on session context that may be
unavailable, incomplete, or unauditable.

### Let each skill define unrelated output formats

Rejected because inconsistent artifacts would weaken interoperability and make
downstream consumption unpredictable.

### Allow approved artifacts to be edited in place

Rejected because downstream decisions could no longer be traced to the exact
inputs that were approved and consumed.

### Centralize artifacts in a mandatory runtime service

Rejected because it would make the model tool-specific and introduce an
integration that is outside the current workflow architecture.
