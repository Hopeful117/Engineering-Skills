import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";

import { feedStoryVaultOutcome, main } from "./story-vault-feed.mjs";

async function makeTempDir(prefix) {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function createRepoRoot(root) {
  await fs.mkdir(path.join(root, ".git"));
  await fs.mkdir(path.join(root, "stories"), { recursive: true });
  await fs.mkdir(path.join(root, "transverse-memory", "proposals"), { recursive: true });
}

async function createVault(root) {
  await writeFile(
    path.join(root, "04 - Knowledge Engineering", "Fluid Knowledge Feeding Pipeline.md"),
    `---
id: fluid-knowledge-feeding-pipeline
title: Fluid Knowledge Feeding Pipeline
kind: pattern
status: curated
sourceProjects:
  - dev-tools
provenance:
  - docs/knowledge.md
created: 2026-08-12
---

# Fluid Knowledge Feeding Pipeline

Canonical note.
`,
  );
}

async function writeVaultOutcome(storyDir, overrides = {}) {
  const payload = {
    schemaVersion: "vault-outcome-v1",
    storyId: "0014",
    storyTitle: "Continuous Vault Feeding Workflow",
    storyPath: "stories/0014-continuous-vault-feeding-workflow",
    vaultConsulted: true,
    outcome: "new-candidate",
    candidateTitle: "Continuous Vault Feeding Workflow",
    candidateKind: "pattern",
    targetCuratedNote: "",
    sourceProjects: ["Engineering-Skills"],
    provenance: [
      "stories/0014-continuous-vault-feeding-workflow/implementation-report.md",
    ],
    transverseRationale:
      "Defines a reusable workflow pattern for continuous proposal generation.",
    proposedSynthesis:
      "Generate repository-owned proposal artifacts from structured Story vault outcomes.",
    curationNotes:
      "Likely complements existing knowledge-feeding notes rather than replacing them.",
    created: "2026-08-12",
    ...overrides,
  };
  await writeFile(
    path.join(storyDir, "vault-outcome.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
}

test("feedStoryVaultOutcome creates a proposal artifact for new-candidate", async () => {
  const repoRoot = await makeTempDir("story-vault-feed-repo-");
  const vaultRoot = await makeTempDir("story-vault-feed-vault-");
  await createRepoRoot(repoRoot);
  await createVault(vaultRoot);
  const storyDir = path.join(repoRoot, "stories", "0014-example");
  await fs.mkdir(storyDir, { recursive: true });
  await writeVaultOutcome(storyDir);

  const result = await feedStoryVaultOutcome({
    storyDir,
    proposalsRoot: path.join(repoRoot, "transverse-memory", "proposals"),
    vaultRoot,
  });

  assert.equal(result.action, "created");
  const markdown = await fs.readFile(result.proposalPath, "utf8");
  assert.match(markdown, /status: proposed/);
  assert.match(markdown, /Continuous Vault Feeding Workflow/);
  assert.match(markdown, /vault-outcome\.json/);
});

test("feedStoryVaultOutcome updates an existing enrich-existing proposal and suppresses duplicate replay", async () => {
  const repoRoot = await makeTempDir("story-vault-feed-repo-");
  const vaultRoot = await makeTempDir("story-vault-feed-vault-");
  await createRepoRoot(repoRoot);
  await createVault(vaultRoot);
  const proposalsRoot = path.join(repoRoot, "transverse-memory", "proposals");

  const storyA = path.join(repoRoot, "stories", "0014-a");
  await fs.mkdir(storyA, { recursive: true });
  await writeVaultOutcome(storyA, {
    storyId: "0014-a",
    storyPath: "stories/0014-a",
    outcome: "enrich-existing",
    candidateTitle: "Continuous Knowledge Feeding Clarification",
    targetCuratedNote: "Fluid Knowledge Feeding Pipeline",
    provenance: ["stories/0014-a/implementation-report.md"],
  });

  const first = await feedStoryVaultOutcome({
    storyDir: storyA,
    proposalsRoot,
    vaultRoot,
  });
  assert.equal(first.action, "created");

  const storyB = path.join(repoRoot, "stories", "0014-b");
  await fs.mkdir(storyB, { recursive: true });
  await writeVaultOutcome(storyB, {
    storyId: "0014-b",
    storyPath: "stories/0014-b",
    outcome: "enrich-existing",
    candidateTitle: "Continuous Knowledge Feeding Clarification",
    targetCuratedNote: "Fluid Knowledge Feeding Pipeline",
    provenance: ["stories/0014-b/implementation-report.md"],
  });

  const second = await feedStoryVaultOutcome({
    storyDir: storyB,
    proposalsRoot,
    vaultRoot,
  });
  assert.equal(second.action, "updated");

  const replay = await feedStoryVaultOutcome({
    storyDir: storyB,
    proposalsRoot,
    vaultRoot,
  });
  assert.equal(replay.action, "skipped");
  assert.equal(replay.reason, "duplicate-story-provenance");

  const markdown = await fs.readFile(first.proposalPath, "utf8");
  assert.match(markdown, /stories\/0014-a\/implementation-report\.md/);
  assert.match(markdown, /stories\/0014-b\/implementation-report\.md/);
});

test("feedStoryVaultOutcome does not create proposals for none or deferred outcomes", async () => {
  const repoRoot = await makeTempDir("story-vault-feed-repo-");
  await createRepoRoot(repoRoot);
  const proposalsRoot = path.join(repoRoot, "transverse-memory", "proposals");
  const storyDir = path.join(repoRoot, "stories", "0014-none");
  await fs.mkdir(storyDir, { recursive: true });
  await writeVaultOutcome(storyDir, { outcome: "none" });

  const result = await feedStoryVaultOutcome({
    storyDir,
    proposalsRoot,
  });

  assert.equal(result.action, "not-applicable");
  assert.equal(result.proposalPath, null);
  assert.deepEqual(await fs.readdir(proposalsRoot), []);
});

test("main returns exit code 2 on missing vault-outcome file", async () => {
  const repoRoot = await makeTempDir("story-vault-feed-repo-");
  await createRepoRoot(repoRoot);
  const storyDir = path.join(repoRoot, "stories", "0014-missing");
  await fs.mkdir(storyDir, { recursive: true });
  const stderr = [];
  const originalWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk) => {
    stderr.push(String(chunk));
    return true;
  };

  try {
    const exitCode = await main([
      "--story-dir",
      storyDir,
      "--proposals-root",
      path.join(repoRoot, "transverse-memory", "proposals"),
    ]);
    assert.equal(exitCode, 2);
    assert.match(stderr.join(""), /STORY_VAULT_FEED_ERROR:/);
  } finally {
    process.stderr.write = originalWrite;
  }
});
