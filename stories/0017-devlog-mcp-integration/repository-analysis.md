# Repository Analysis

## Engineering Story: 0017 - Integrate DevLog MCP for Engineering Context

### Objective
Integrate the DevLog MCP `get_engineering_context` tool as the primary source of engineering context during the Repository Analysis phase of the Engineering Story workflow. This replaces the legacy script-based approach (`scripts/devlog-context.mjs`) with a modern MCP-based context retrieval that provides targeted, searchable context while preserving all fallback behavior and governance.

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

**Files to modify:**
1. `/home/ludo/Bureau/workspace/Engineering-Skills/SKILL.md` - "DevLog Context Preparation" section

**Changes needed:**
1. Replace script-based context preparation with MCP-based workflow
2. Add intent construction step before MCP call
3. Integrate MCP context assessment into Repository Analysis preparation
4. Preserve all existing fallback behavior when MCP is unavailable

### Implementation Details

#### 1. Replace Current DevLog Context Preparation

**Current Text to Replace:**
```
## DevLog Context Preparation

Before invoking Repository Analysis:

1. Resolve the canonical Git repository root.
2. Read the workspace-local DevLog configuration from `TOOLS.md`.
3. When an exact repository mapping exists, read `references/devlog-context.md` and invoke `node scripts/devlog-context.mjs` with the configured base URL, project UUID, and complete current Story description. The adapter transports the Story in a JSON request body; do not truncate it.
4. When the adapter returns usable Repository Context, provide it to the Repository Analyst as the primary discovery and prioritization input.
5. Require targeted reads of the current repository for exact behavior, implementation patterns, class or method details, architectural verification, and stale or conflicting evidence.
6. Treat the current repository as authoritative.
7. If configuration is missing or DevLog fails, display a visible `DEVLOG_CONTEXT_ERROR` message stating that Repository Analysis continues without DevLog, then use the existing direct repository inspection workflow.

DevLog is optional. Missing configuration, timeout, connection failure, non-success response, malformed data, missing context, or unusable evidence must never block Repository Analysis and must never become a workflow-gate event.

DevLog provides context. Kiko produces analysis. The repository remains the source of truth.
```

**Replace With:**
```
## DevLog Context Preparation

Before invoking Repository Analysis:

1. Clarify or confirm the user's engineering objective for this Story.
2. Construct a specific engineering intent describing what context is needed (e.g., "Understand the current DevLog architecture, recent engineering work, constraints and existing context pipeline relevant to exposing Engineering Stories as deterministic context evidence").
3. Read the workspace-local DevLog configuration from `TOOLS.md`.
4. When an exact repository mapping exists in the DevLog configuration:
   - Call the DevLog MCP tool `get_engineering_context` with:
     * `projectSlug`: the mapped DevLog project slug
     * `intent`: the constructed engineering intent from step 2
   - Assess the returned EngineeringContext:
     * Identify directly relevant evidence
     * Note potentially useful architectural constraints
     * Identify referenced components/files requiring verification
     * Identify possibly stale or noisy information
     * Note missing information or gaps
   - Provide the assessed context to the Repository Analyst as discovery and prioritization input
   - Require targeted reads of the current repository to:
     * Verify exact behavior, implementation patterns, class or method details
     * Confirm architectural verification
     * Check for stale or conflicting evidence
     * Validate current Git state, build configuration, and tests
   - Treat the current repository as the authoritative source of truth
5. When DevLog MCP is unavailable (network issues, service down) OR when the project is unknown OR when EngineeringContext is empty OR when context is excessively noisy OR when context is truncated OR when evidence appears stale:
   - Display a visible `DEVLOG_CONTEXT_ERROR` message stating that Repository Analysis continues without DevLog
   - Continue with the existing direct repository inspection workflow
   - Do not block Repository Analysis on MCP failure

DevLog MCP provides engineering context and search-space reduction. The repository remains the source of truth for current implementation. Kiko performs reasoning and Engineering Story preparation. Human provides authority and approval.
```

### Fallback Behavior (Preserved)
The implementation preserves all existing fallback behavior:
- MCP failure → visible error message → continue with direct inspection
- Unknown project/missing context/noisy/stale context → same fallback
- Repository verification remains mandatory regardless of MCP status

### Success Criteria
- Kiko successfully calls `get_engineering_context(projectSlug, intent)` during Repository Analysis preparation
- Returned context guides targeted repository verification (not replaces it)
- All human approval gates function identically to before
- Repository remains authoritative source for implementation details