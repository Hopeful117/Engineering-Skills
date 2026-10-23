# Quality Validation Result Contract

Use this contract when the `quality-validation` skill reports validation
results to another workflow such as `engineering-story`.

## Purpose

The result must allow downstream artifacts to answer:

- what repository surface was validated;
- which checks were applicable;
- which checks actually ran;
- what passed or failed;
- what was blocked, unavailable, or not applicable;
- what evidence supports those conclusions;
- what validation limitations remain.

## Result Shape

The exact serialization format may vary by caller, but the result must preserve
the following concepts.

### Story scope

- Story identifier or title when available
- summary of affected behavior

### Repository scope

- affected modules, packages, directories, or services
- relevant stack indicators

### Checks

Each reported check should include:

- `category`
- `name`
- `applicable`: yes or no
- `executed`: yes or no
- `status`: passed, failed, blocked, unavailable, or not-applicable
- `reason`: required when not passed
- `evidence`: command, artifact, metric, or report reference when available

### Required categories

Use the repository and affected stack to decide applicability. Common
categories include:

- compile or build
- unit
- integration
- e2e
- lint
- format
- static-analysis
- coverage-gate
- sonarqube
- representative-outcome

### Summary

The result must also include:

- material failures
- material blocked or unavailable checks
- validation limitations
- whether the evidence is sufficient for technical review

## Special Cases

### SonarQube

When SonarQube is applicable, include:

- analyzed project key
- analysis command
- Quality Gate status
- new bugs
- new vulnerabilities
- new security hotspots
- new code smells
- new-code coverage
- duplicated lines on new code

### Frontend quality gates

When repository-defined frontend quality gates are applicable, include the
relevant checks such as:

- lint
- format verification
- strict build or type-check
- unit or e2e tests
- coverage gates

### Ranking and allocation behavior

When representative outcome validation is applicable, the result must explain:

- what realistic scenario was used;
- what intended outcome was validated;
- whether the result demonstrated the expected behavior.

Coverage alone is not sufficient evidence in this case.

## Workflow Boundary

This result does not grant approval.

It is technical validation evidence only.

Calling workflows remain responsible for:

- implementation authority;
- Code Review decisions;
- Human Approval Gates;
- final workflow progression.
