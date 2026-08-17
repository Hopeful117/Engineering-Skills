# Implementation Plan

## Engineering Story: 0017 - Integrate DevLog MCP for Engineering Context

### Objective
Update the Kiko Engineering Story skill/workflow to make DevLog MCP the preferred initial source of engineering context during Story preparation.

### Background

The Kiko Engineering Story skill currently follows a specific context-gathering workflow defined in its SKILL.md. The existing "DevLog Context Preparation" section uses a script-based approach (`scripts/devlog-context.mjs`) to fetch DevLog context before Repository Analysis.

The new requirement is to shift this toward:

```
User request → clarify objective → construct intent → call DevLog MCP get_engineering_context → assess context → targeted verification → Repository Analysis
```

### Current Workflow Shortcomings

1. Uses a single script (`scripts/devlog-context.mjs`) that predates the newer `get_engineering_context(projectSlug, intent)` MCP capability
2. Script treats the full Story description as JSON payload
3. No structured intent-based context retrieval
4. Not leveraging MCP's search-space reduction capabilities

### Required Changes

| File | Change Description |
|------|-------------------|
| `SKILL.md` | Replace "DevLog Context Preparation" section with MCP-based workflow |
| `repository-analysis.md` | This file - detailed analysis of changes needed |
| `implementation-plan.md` | This file - implementation details |

### Implementation Details

#### 1. Replace Current DevLog Context Preparation

**Exact text replacement in `SKILL.md`:**

The entire "DevLog Context Preparation" section must be replaced with the new MCP-based approach (see repository-analysis.md for complete replacement text).

Key changes:
- **Intent construction**: Added step to clarify objectives and construct specific engineering intent
- **MCP call**: Replace `scripts/devlog-context.mjs` with `get_engineering_context(projectSlug, intent)`
- **Context assessment**: Added structured assessment of returned EngineeringContext
- **Verification guidance**: Expanded verification requirements

### Fallback Behavior (Preserved)
All existing fallback behavior is preserved:
- MCP unavailable → `DEVLOG_CONTEXT_ERROR` → continue with direct inspection
- Empty/noisy/truncated context → same fallback
- Repository verification always mandatory

### Success Criteria
- [ ] `get_engineering_context(projectSlug, intent)` successfully integrated
- [ ] Intent construction logic formalized
- [ ] Context assessment process defined
- [ ] All human approval gates unchanged
- [ ] All fallback behaviors preserved
- [ ] Repository remains authoritative source of truth

### Files Created
1. `repository-analysis.md` — Detailed analysis with exact replacement text
2. `implementation-plan.md` — This file with implementation details
3. New story file `0017-devlog-mcp-integration.md` at repository root

### Related Files
- `/home/ludo/Bureau/workspace/Engineering-Skills/SKILL.md` (to be edited)
- `/home/ludo/Bureau/workspace/Engineering-Skills/stories/0006-integrate-devlog-context/` (reference for existing work)