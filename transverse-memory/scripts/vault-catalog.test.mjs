import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";

import { catalogVault, main } from "./vault-catalog.mjs";

async function makeTempVault() {
  return fs.mkdtemp(path.join(os.tmpdir(), "vault-catalog-"));
}

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

function validNote(title = "Concept A") {
  return `---
id: concept-a
title: ${title}
kind: concept
status: curated
sourceProjects:
  - engineering-skills
provenance:
  - docs/adr/ADR-001-engineering-artifacts.md
created: 2026-08-12
tags:
  - testing
---

# ${title}

See [[Related Concept]] and [ADR](docs/adr/ADR-001-engineering-artifacts.md).
`;
}

test("catalogVault indexes valid notes with stable relative paths and links", async () => {
  const vaultRoot = await makeTempVault();
  await writeFile(path.join(vaultRoot, "Concepts", "concept-a.md"), validNote());

  const result = await catalogVault(vaultRoot);

  assert.equal(result.noteCount, 1);
  assert.equal(result.notes[0].path, "Concepts/concept-a.md");
  assert.equal(result.notes[0].title, "Concept A");
  assert.deepEqual(result.notes[0].sourceProjects, ["engineering-skills"]);
  assert.deepEqual(result.notes[0].links.wikiLinks, ["Related Concept"]);
  assert.deepEqual(result.notes[0].links.markdownLinks, [
    "docs/adr/ADR-001-engineering-artifacts.md",
  ]);
});

test("catalogVault ignores .obsidian, hidden paths, and non-markdown files", async () => {
  const vaultRoot = await makeTempVault();
  await writeFile(path.join(vaultRoot, ".obsidian", "config.md"), validNote("Ignored"));
  await writeFile(path.join(vaultRoot, ".hidden.md"), validNote("Hidden"));
  await writeFile(path.join(vaultRoot, "notes.txt"), "not markdown");
  await writeFile(path.join(vaultRoot, "visible.md"), validNote("Visible"));

  const result = await catalogVault(vaultRoot);

  assert.equal(result.noteCount, 1);
  assert.equal(result.notes[0].title, "Visible");
});

test("catalogVault fails clearly on missing required metadata", async () => {
  const vaultRoot = await makeTempVault();
  await writeFile(
    path.join(vaultRoot, "broken.md"),
    `---
id: broken
title: Broken
kind: concept
status: draft
sourceProjects:
  - engineering-skills
---

# Broken
`,
  );

  await assert.rejects(
    () => catalogVault(vaultRoot),
    /missing required field "provenance"/,
  );
});

test("catalogVault fails clearly when vault root does not exist", async () => {
  await assert.rejects(
    () => catalogVault("/definitely/missing/vault-root"),
    /Vault root does not exist/,
  );
});

test("catalogVault does not modify note contents while scanning", async () => {
  const vaultRoot = await makeTempVault();
  const notePath = path.join(vaultRoot, "concept.md");
  const content = validNote();
  await writeFile(notePath, content);

  await catalogVault(vaultRoot);

  const after = await fs.readFile(notePath, "utf8");
  assert.equal(after, content);
});

test("main returns exit code 2 on invalid vault root", async () => {
  const stderr = [];
  const originalWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk) => {
    stderr.push(String(chunk));
    return true;
  };

  try {
    const exitCode = await main(["--vault-root", "/missing/vault"]);
    assert.equal(exitCode, 2);
    assert.match(stderr.join(""), /VAULT_CATALOG_ERROR:/);
  } finally {
    process.stderr.write = originalWrite;
  }
});
