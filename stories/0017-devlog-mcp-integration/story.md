# 0017-devlog-mcp-integration

## Metadata

**ID:** `0017`

**Title:** Integrate DevLog MCP for Engineering Context

**Status:** Draft

## Goal

Integrate the DevLog MCP `get_engineering_context` tool as the primary source of engineering context during the Repository Analysis phase of the Engineering Story workflow. This replaces the legacy script-based approach (`scripts/devlog-context.mjs`) with a modern MCP-based context retrieval that provides targeted, searchable context while preserving all fallback behavior and governance.

## Context

The current `engineering-story` skill uses a script-based DevLog context preparation step (`scripts/devlog-context.mjs`) to gather repository context before Repository Analysis. This approach predates the newer `get_engineering_context(projectSlug, intent)` MCP capability.

The new workflow shifts the sequence to:
```
User request → clarify objective → construct intent → call DevLog MCP get_engineering_context → assess context → targeted verification → Repository Analysis
```

This ensures Kiko leverages MCP's search-space reduction and structured context retrieval while preserving:
- All human approval gates
- Repository as authoritative source
- Fallback behavior on MCP failure
- Complete governance and validation steps

## Problem

The current DevLog context preparation relies on a monolithic script that:
- Always uses the same script-based approach
- Does not leverage MCP's ability to provide targeted, searchable context
- Lacks structured intent-based context retrieval
- Does not utilize MCP's ability to reduce search space and prioritize relevant context

## Scope
Includes modifying the `engineering-story` skill to replace the DevLog Context Preparation section with MCP-based context retrieval while preserving all existing functionality.

## Acceptance Criteria

- [ ] `SKILL.md` updated with new "DevLog Context Preparation" section using `get_engineering_context(projectSlug, intent)`
- [ ] `engineering-story-implementation-plan.md` created with detailed replacement instructions
- [ ] All existing fallback behavior preserved (MCP failure → DEVLOG_CONTEXT_ERROR → direct inspection)
- [ ] No modification to existing approval gates or workflow stages
- [ ] Repository Analysis approval gate remains unchanged
- [ ] All human approval gates remain intact

## Constraints

- Preserve human ownership of all approvals
- Do not alter the core Engineering Story workflow stages
- Maintain backward compatibility with existing SKILL.md structure
- Ensure MCP failure falls back to existing direct repository inspection
- Keep the repository as the ultimate source of truth

## Dependencies

- Requires `get_engineering_context` MCP tool to be available
- No other skills or infrastructure changes required

## Relevant Documentation

- `AGENTS.md`
- `README.md`
- `CONVENTIONS.md`
- `engineering-story/SKILL.md` (will be updated)
- `engineering-story-implementation-plan.md` (this file)

## Definition of Done

- [ ] New story `0017-devlog-mcp-integration` created under `Engineering-Skills/`
- [ ] `SKILL.md` updated with new DevLog Context Preparation section
- [ ] `engineering-story-implementation-plan.md` created with precise replacement instructions
- [ ] All existing approval gates and workflow stages remain unchanged
- [ ] No breaking changes to existing functionality
- [ ] Story follows the standard Engineering Story template structure
