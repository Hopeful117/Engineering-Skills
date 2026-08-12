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
}

async function createRepo(root) {
  await writeFile(
    path.join(root, "stories", "0012-example", "story.md"),
    `# Story 0012

## Metadata

**Title:**
\`Improve Engineering Workflow Knowledge\`
`,
  );
  await writeFile(
    path.join(root, "stories", "0012-example", "engineering-report.md"),
    `# Engineering Report

This report captures a recurring pattern about repository analysis, quality
gates, and durable workflow knowledge across multiple repositories.
`,
  );
  await writeFile(
    path.join(root, "docs", "adr", "ADR-010-engineering-workflow.md"),
    `# Engineering Workflow

This ADR documents the same workflow topic already represented in the vault.
`,
  );
}

test("extractWorkspaceVaultCandidates emits candidate-aligned results and duplicate hints", async () => {
  const vaultRoot = await makeTempDir("vault-");
  const repoRoot = await makeTempDir("repo-");
  await createVault(vaultRoot);
  await createRepo(repoRoot);

  const result = await extractWorkspaceVaultCandidates(vaultRoot, [repoRoot]);

  assert.equal(result.mode, "proposal-only");
  assert.equal(result.vaultNotesConsidered, 1);
  assert.equal(result.extractedCandidates.length, 2);

  const classifications = result.extractedCandidates.map((entry) => entry.classification).sort();
  assert.deepEqual(classifications, ["duplicate", "new"]);

  const duplicate = result.extractedCandidates.find((entry) => entry.classification === "duplicate");
  assert.equal(duplicate.matchedVaultNote, "Engineering Workflow");

  const fresh = result.extractedCandidates.find((entry) => entry.classification === "new");
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
