import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";

import { extractWorkspaceVaultCandidates, main } from "./workspace-vault-extract.mjs";

async function makeTempDir(prefix) {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function createVault(root) {
  await writeFile(
    path.join(root, "02 - Workflow", "Engineering Workflow.md"),
    `---
id: engineering-workflow
title: Engineering Workflow
kind: map
status: curated
sourceProjects:
  - dev-tools
provenance:
  - docs/workflow.md
created: 2026-08-12
---

# Engineering Workflow

Canonical workflow note.
`,
  );
  await writeFile(
    path.join(root, "04 - Knowledge Engineering", "Knowledge Evolution Principles.md"),
    `---
id: knowledge-evolution-principles
title: Knowledge Evolution Principles
kind: concept
status: curated
sourceProjects:
  - dev-tools
provenance:
  - docs/knowledge.md
created: 2026-08-12
---

# Knowledge Evolution Principles

Canonical knowledge-evolution note.
`,
  );
}

async function createEngineeringSkillsStyleRepo(root) {
  await writeFile(
    path.join(root, "stories", "0012-example", "story.md"),
    `# Story 0012

## Metadata

**Title:**
\`Establish Candidate Provenance Contracts\`
`,
  );
  await writeFile(
    path.join(root, "stories", "0012-example", "engineering-report.md"),
    `# Engineering Report

This report captures a reusable pattern for provenance contracts, evidence
lineage, and durable candidate traceability across multiple repositories.
`,
  );
  await writeFile(
    path.join(root, "docs", "adr", "ADR-010-engineering-workflow.md"),
    `# Engineering Workflow

This ADR documents the same workflow topic already represented in the vault.
`,
  );
}

async function createDevlogStyleRepo(root) {
  await writeFile(
    path.join(root, "docs", "stories", "0036-example", "story.md"),
    `# Story 0036

## Metadata

**Title:**
\`Refine Knowledge Evolution Patterns\`
`,
  );
  await writeFile(
    path.join(root, "docs", "stories", "0036-example", "engineering-report.md"),
    `# Engineering Report

This report refines knowledge evolution principles with a repeatable pattern
for promoting durable engineering knowledge without duplicating project memory.
`,
  );
}

test("extractWorkspaceVaultCandidates supports multiple repository layouts and classifications", async () => {
  const vaultRoot = await makeTempDir("vault-");
  const repoA = await makeTempDir("repo-a-");
  const repoB = await makeTempDir("repo-b-");
  await createVault(vaultRoot);
  await createEngineeringSkillsStyleRepo(repoA);
  await createDevlogStyleRepo(repoB);

  const result = await extractWorkspaceVaultCandidates(vaultRoot, [repoA, repoB]);

  assert.equal(result.mode, "proposal-only");
  assert.equal(result.vaultNotesConsidered, 2);
  assert.equal(result.extractedCandidates.length, 3);
  assert.equal(result.skipped.length, 0);

  const adrDuplicate = result.extractedCandidates.find((entry) =>
    entry.sourceFile.endsWith("ADR-010-engineering-workflow.md"),
  );
  assert.equal(adrDuplicate.classification, "duplicate");
  assert.equal(adrDuplicate.matchedVaultNote, "Engineering Workflow");

  const enrich = result.extractedCandidates.find((entry) =>
    entry.sourceFile.includes("0036-example/engineering-report.md"),
  );
  assert.equal(enrich.classification, "enrich-existing");
  assert.equal(enrich.matchedVaultNote, "Knowledge Evolution Principles");

  const fresh = result.extractedCandidates.find((entry) =>
    entry.sourceFile.includes("0012-example/engineering-report.md"),
  );
  assert.equal(fresh.classification, "new");
  assert.match(fresh.candidate.markdown, /status: proposed/);
  assert.equal(fresh.candidate.createsCuratedNote, false);
});

test("extractWorkspaceVaultCandidates skips low-value sources", async () => {
  const vaultRoot = await makeTempDir("vault-");
  const repoRoot = await makeTempDir("repo-");
  await createVault(vaultRoot);
  await writeFile(
    path.join(repoRoot, "docs", "adr", "ADR-001-short.md"),
    `# Tiny\n\nShort.\n`,
  );

  const result = await extractWorkspaceVaultCandidates(vaultRoot, [repoRoot]);

  assert.equal(result.extractedCandidates.length, 0);
  assert.equal(result.skipped.length, 1);
  assert.equal(result.skipped[0].reason, "low-value-content");
});

test("extractWorkspaceVaultCandidates skips generic story artifacts", async () => {
  const vaultRoot = await makeTempDir("vault-");
  const repoRoot = await makeTempDir("repo-");
  await createVault(vaultRoot);
  await writeFile(
    path.join(repoRoot, "stories", "0013-generic", "story.md"),
    `# Story 0013

## Metadata

**Title:**
\`Generic Review Story\`
`,
  );
  await writeFile(
    path.join(repoRoot, "stories", "0013-generic", "code-review.md"),
    `# Code Review Report

Review Summary.
Findings: No findings.
Story compliance confirmed.
Plan compliance confirmed.
Implementation correctness confirmed.
Architecture compliance confirmed.
`,
  );

  const result = await extractWorkspaceVaultCandidates(vaultRoot, [repoRoot]);

  assert.equal(result.extractedCandidates.length, 0);
  assert.equal(result.skipped.length, 1);
  assert.equal(result.skipped[0].reason, "generic-story-artifact");
});

test("extractWorkspaceVaultCandidates skips weak transverse signals", async () => {
  const vaultRoot = await makeTempDir("vault-");
  const repoRoot = await makeTempDir("repo-");
  await createVault(vaultRoot);
  await writeFile(
    path.join(repoRoot, "docs", "stories", "0014-feature", "story.md"),
    `# Story 0014

## Metadata

**Title:**
\`Add Project Timeline Endpoint\`
`,
  );
  await writeFile(
    path.join(repoRoot, "docs", "stories", "0014-feature", "engineering-report.md"),
    `# Engineering Report

This report adds a typed endpoint, two repository queries, a controller, and a
frontend route for a bounded project timeline feature.
`,
  );

  const result = await extractWorkspaceVaultCandidates(vaultRoot, [repoRoot]);

  assert.equal(result.extractedCandidates.length, 0);
  assert.equal(result.skipped.length, 1);
  assert.equal(result.skipped[0].reason, "weak-transverse-signal");
});

test("main returns exit code 2 on invalid repository root", async () => {
  const vaultRoot = await makeTempDir("vault-");
  await createVault(vaultRoot);
  const stderr = [];
  const originalWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk) => {
    stderr.push(String(chunk));
    return true;
  };

  try {
    const exitCode = await main([
      "--vault-root",
      vaultRoot,
      "--repo-roots",
      "/missing/repo",
    ]);
    assert.equal(exitCode, 2);
    assert.match(stderr.join(""), /WORKSPACE_VAULT_EXTRACT_ERROR:/);
  } finally {
    process.stderr.write = originalWrite;
  }
});
