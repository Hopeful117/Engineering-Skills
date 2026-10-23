# Story Closure Pull Request

## Mission

Publish the dedicated Story branch and create a complete, reviewable pull request.

## Preconditions

* The Story commit exists locally.
* The human explicitly authorized push and PR creation.
* The remote and target branch are verified.

## Procedure

1. Push the dedicated branch without force.
2. Use the repository PR template when present.
3. Set the PR title using the approved Story message.
4. Include the Story identifier, summary, validation evidence, risks, and
   explicit notes about anything not run or unavailable.
5. Record the PR URL, source branch, target branch, head hash, and initial checks.

Do not merge from this stage. Do not represent PR creation as PR approval.

## Deliverable

Return a `Pull Request Delivery Record` with the exact URL, title, body sections,
head hash, target branch, reviewers/checks, and pending human validation.

## Stop Condition

Stop after presenting the PR and wait for explicit human validation before merge.
