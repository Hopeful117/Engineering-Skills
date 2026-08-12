#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const VALID_SOURCE_TYPES = new Set([
  "engineering-report",
  "code-review",
  "adr",
  "devlog-knowledge",
  "pattern-record",
]);

const VALID_KINDS = new Set([
  "concept",
  "pattern",
  "lesson",
  "decision-summary",
  "glossary",
  "map",
]);

export class CandidateNoteError extends Error {
  constructor(message) {
    super(message);
    this.name = "CandidateNoteError";
  }
}

export function formatFailure(error) {
  const diagnostic = error instanceof Error ? error.message : String(error);
  return `CANDIDATE_NOTE_ERROR: ${diagnostic}`;
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new CandidateNoteError("Expected --source-file argument");
    }
    values.set(key, value);
  }
  return {
    sourceFile: values.get("--source-file"),
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function validateSourceFile(sourceFile) {
  if (typeof sourceFile !== "string" || sourceFile.trim() === "") {
    throw new CandidateNoteError("Source file must be a non-empty path");
  }
  const resolved = path.resolve(sourceFile);
  let stats;
  try {
    stats = await fs.stat(resolved);
  } catch {
    throw new CandidateNoteError(`Source file does not exist: ${resolved}`);
  }
  if (!stats.isFile()) {
    throw new CandidateNoteError(`Source file is not a file: ${resolved}`);
  }
  if (!resolved.endsWith(".json")) {
    throw new CandidateNoteError("Source file must be a JSON document");
  }
  return resolved;
}

function requireString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new CandidateNoteError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function requireStringArray(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new CandidateNoteError(`${field} must be a non-empty array`);
  }
  const items = value.map((entry) => requireString(entry, `${field}[]`));
  return items;
}

function validateInput(payload) {
  const title = requireString(payload.title, "title");
  const kind = requireString(payload.kind, "kind");
  if (!VALID_KINDS.has(kind)) {
    throw new CandidateNoteError(`kind is invalid: ${kind}`);
  }

  const sourceType = requireString(payload.sourceType, "sourceType");
  if (!VALID_SOURCE_TYPES.has(sourceType)) {
    throw new CandidateNoteError(`sourceType is not eligible: ${sourceType}`);
  }

  const sourceProjects = requireStringArray(payload.sourceProjects, "sourceProjects");
  const provenance = requireStringArray(payload.provenance, "provenance");
  const transverseRationale = requireString(
    payload.transverseRationale,
    "transverseRationale",
  );
  const proposedSynthesis = requireString(
    payload.proposedSynthesis,
    "proposedSynthesis",
  );
  const curationNotes = requireString(payload.curationNotes, "curationNotes");
  let targetCuratedNote = "";
  if (payload.targetCuratedNote !== undefined && payload.targetCuratedNote !== null) {
    if (typeof payload.targetCuratedNote !== "string") {
      throw new CandidateNoteError("targetCuratedNote must be a string when present");
    }
    targetCuratedNote = payload.targetCuratedNote.trim();
  }
  const created = payload.created ? requireString(payload.created, "created") : "YYYY-MM-DD";

  return {
    title,
    kind,
    sourceType,
    sourceProjects,
    provenance,
    transverseRationale,
    proposedSynthesis,
    curationNotes,
    targetCuratedNote,
    created,
  };
}

function toMarkdown(payload) {
  const slug = slugify(payload.title);
  const targetCuratedNote = payload.targetCuratedNote || "";
  const list = (items) => items.map((item) => `  - ${item}`).join("\n");

  return `---
id: ${slug}
title: ${payload.title}
kind: ${payload.kind}
status: proposed
candidateSourceTypes:
  - ${payload.sourceType}
sourceProjects:
${list(payload.sourceProjects)}
provenance:
${list(payload.provenance)}
transverseRationale: ${payload.transverseRationale}
targetCuratedNote: ${targetCuratedNote}
created: ${payload.created}
updated: ${payload.created}
tags:
  - transverse-memory
  - candidate
---

# ${payload.title}

## Proposed Synthesis

${payload.proposedSynthesis}

## Why It Is Transverse

${payload.transverseRationale}

## Source Evidence

${payload.provenance.map((item) => `* \`${item}\``).join("\n")}

## Curation Notes

${payload.curationNotes}
`;
}

export function generateCandidateNote(payload) {
  const validated = validateInput(payload);
  const markdown = toMarkdown(validated);

  return {
    mode: "proposal-only",
    createsCuratedNote: false,
    updatesCuratedNoteDirectly: false,
    candidateId: slugify(validated.title),
    targetCuratedNote: validated.targetCuratedNote || null,
    markdown,
  };
}

export async function generateCandidateNoteFromFile(sourceFile) {
  const resolvedSource = await validateSourceFile(sourceFile);
  let payload;
  try {
    payload = JSON.parse(await fs.readFile(resolvedSource, "utf8"));
  } catch {
    throw new CandidateNoteError("Source file contains invalid JSON");
  }

  return {
    sourceFile: resolvedSource,
    ...generateCandidateNote(payload),
  };
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArguments(argv);
    const result = await generateCandidateNoteFromFile(options.sourceFile);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`${formatFailure(error)}\n`);
    return 2;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main();
}
