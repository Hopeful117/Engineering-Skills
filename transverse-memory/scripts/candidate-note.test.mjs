import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";

import { generateCandidateNoteFromFile, main } from "./candidate-note.mjs";

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "candidate-note-"));
}

async function writeJson(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function validPayload(overrides = {}) {
  return {
    title: "Cross Project Memory Feeding",
    kind: "pattern",
    sourceType: "engineering-report",
    sourceProjects: ["engineering-skills", "devlog-ai"],
    provenance: [
      "stories/0009-obsidian-transverse-memory-integration/engineering-report.md",
    ],
    transverseRationale:
      "Defines a reusable memory promotion pattern relevant across repositories.",
    proposedSynthesis:
      "Introduce a candidate layer between authoritative source artifacts and curated vault notes.",
    curationNotes:
      "Likely amends an existing memory-pattern note rather than creating an isolated concept.",
    created: "2026-08-12",
    ...overrides,
  };
}

test("generateCandidateNoteFromFile produces deterministic proposal-only output", async () => {
  const root = await makeTempDir();
  const filePath = path.join(root, "candidate.json");
  await writeJson(filePath, validPayload());

  const result = await generateCandidateNoteFromFile(filePath);

  assert.equal(result.mode, "proposal-only");
  assert.equal(result.createsCuratedNote, false);
  assert.equal(result.updatesCuratedNoteDirectly, false);
  assert.equal(result.candidateId, "cross-project-memory-feeding");
  assert.match(result.markdown, /status: proposed/);
  assert.match(result.markdown, /candidateSourceTypes:/);
  assert.match(result.markdown, /## Curation Notes/);
});

test("generateCandidateNoteFromFile preserves target curated note when provided", async () => {
  const root = await makeTempDir();
  const filePath = path.join(root, "candidate.json");
  await writeJson(
    filePath,
    validPayload({ targetCuratedNote: "memory-feeding-pattern" }),
  );

  const result = await generateCandidateNoteFromFile(filePath);

  assert.equal(result.targetCuratedNote, "memory-feeding-pattern");
  assert.match(result.markdown, /targetCuratedNote: memory-feeding-pattern/);
});

test("generateCandidateNoteFromFile enforces provenance", async () => {
  const root = await makeTempDir();
  const filePath = path.join(root, "candidate.json");
  await writeJson(filePath, validPayload({ provenance: [] }));

  await assert.rejects(
    () => generateCandidateNoteFromFile(filePath),
    /provenance must be a non-empty array/,
  );
});

test("generateCandidateNoteFromFile rejects ineligible source types", async () => {
  const root = await makeTempDir();
  const filePath = path.join(root, "candidate.json");
  await writeJson(filePath, validPayload({ sourceType: "story" }));

  await assert.rejects(
    () => generateCandidateNoteFromFile(filePath),
    /sourceType is not eligible: story/,
  );
});

test("main returns exit code 2 on invalid source file", async () => {
  const stderr = [];
  const originalWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk) => {
    stderr.push(String(chunk));
    return true;
  };

  try {
    const exitCode = await main(["--source-file", "/missing/candidate.json"]);
    assert.equal(exitCode, 2);
    assert.match(stderr.join(""), /CANDIDATE_NOTE_ERROR:/);
  } finally {
    process.stderr.write = originalWrite;
  }
});
