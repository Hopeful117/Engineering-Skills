---
name: engineering-story
description: Execute the complete engineering workflow for a Story.
---

# Engineering Story

## Mission

Coordinate the complete engineering workflow.

## Workflow

When invoked:

1. Read the Story.
2. Load the project workflow documentation.
3. Execute Repository Analysis using `prompts/repository-analysis.md`.
4. Wait for human approval.
5. Execute Implementation Planning using `prompts/implementation-plan.md`.
6. Wait for human approval.
7. Execute Implementation using `prompts/implementation.md`.
8. Wait for human approval.
9. Execute Code Review using `prompts/code-review.md`.
10. Wait for human approval.
11. Execute Engineering Report using `prompts/engineering-report.md`.
12. Finish.

Never skip approval gates.

Never change the workflow order.

Always use the dedicated prompt for each stage.
