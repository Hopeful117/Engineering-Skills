#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

import { catalogVault } from "./vault-catalog.mjs";
import { generateCandidateNote } from "./candidate-note.mjs";

const VALID_OUTCOMES = new Set([
  "none",
  "new-candidate",
  "enrich-existing",
  "deferred",
]);

const VALID_KINDS = new Set([
  "concept",
  "pattern",
  "lesson",
  "decision-summary",
  "glossary",
  "map",
]);

export class StoryVaultFeedError extends Error {
  constructor(message) {
    super(message);
    this.name = "StoryVaultFeedError";
  }
}

export function formatFailure(error) {
  const diagnostic = error instanceof Error ? error.message : String(error);
  return `STORY_VAULT_FEED_ERROR: ${diagnostic}`;
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new StoryVaultFeedError(
        "Expected --story-dir and --proposals-root arguments",
      );
    }
    values.set(key, value);
  }
  return {
    storyDir: values.get("--story-dir"),
    proposalsRoot: values.get("--proposals-root"),
    vaultRoot: values.get("--vault-root") ?? null,
  };
}

async function validateDirectory(dirPath, label) {
  if (typeof dirPath !== "string" || dirPath.trim() === "") {
    throw new StoryVaultFeedError(`${label} must be a non-empty path`);
  }
  const resolved = path.resolve(dirPath);
  let stats;
  try {
    stats = await fs.stat(resolved);
  } catch {
    throw new StoryVaultFeedError(`${label} does not exist: ${resolved}`);
  }
  if (!stats.isDirectory()) {
    throw new StoryVaultFeedError(`${label} is not a directory: ${resolved}`);
  }
  return resolved;
}

async function validateOptionalDirectory(dirPath, label) {
  if (dirPath === null) return null;
  return validateDirectory(dirPath, label);
}

function requireString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new StoryVaultFeedError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function optionalString(value, field) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    throw new StoryVaultFeedError(`${field} must be a string when present`);
  }
  return value.trim();
}

function requireBoolean(value, field) {
  if (typeof value !== "boolean") {
    throw new StoryVaultFeedError(`${field} must be a boolean`);
  }
  return value;
}

function requireStringArray(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new StoryVaultFeedError(`${field} must be a non-empty array`);
  }
  return value.map((entry) => requireString(entry, `${field}[]`));
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function pickVaultTitle(markdown, fileName) {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (!match) return path.basename(fileName, ".md");
  const heading = match[1].trim();
  if (/^\d+\.\s+/.test(heading)) {
    return path.basename(fileName, ".md");
  }
  return heading;
}

async function readJson(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new StoryVaultFeedError(`Required file does not exist: ${filePath}`);
    }
    if (error instanceof SyntaxError) {
      throw new StoryVaultFeedError(`Invalid JSON: ${filePath}`);
    }
    throw error;
  }
}

function validateVaultOutcome(payload) {
  const schemaVersion = requireString(payload.schemaVersion, "schemaVersion");
  if (schemaVersion !== "vault-outcome-v1") {
    throw new StoryVaultFeedError(`Unsupported schemaVersion: ${schemaVersion}`);
  }

  const outcome = requireString(payload.outcome, "outcome");
  if (!VALID_OUTCOMES.has(outcome)) {
    throw new StoryVaultFeedError(`outcome is invalid: ${outcome}`);
  }

  const candidateKind = payload.candidateKind === undefined
    ? "pattern"
    : requireString(payload.candidateKind, "candidateKind");
  if (!VALID_KINDS.has(candidateKind)) {
    throw new StoryVaultFeedError(`candidateKind is invalid: ${candidateKind}`);
  }

  const validated = {
    schemaVersion,
    storyId: requireString(payload.storyId, "storyId"),
    storyTitle: requireString(payload.storyTitle, "storyTitle"),
    storyPath: requireString(payload.storyPath, "storyPath"),
    vaultConsulted: requireBoolean(payload.vaultConsulted, "vaultConsulted"),
    outcome,
    candidateTitle: optionalString(payload.candidateTitle, "candidateTitle"),
    candidateKind,
    targetCuratedNote: optionalString(
      payload.targetCuratedNote,
      "targetCuratedNote",
    ),
    sourceProjects: payload.sourceProjects
      ? requireStringArray(payload.sourceProjects, "sourceProjects")
      : [],
    provenance: requireStringArray(payload.provenance, "provenance"),
    transverseRationale: optionalString(
      payload.transverseRationale,
      "transverseRationale",
    ),
    proposedSynthesis: optionalString(
      payload.proposedSynthesis,
      "proposedSynthesis",
    ),
    curationNotes: optionalString(payload.curationNotes, "curationNotes"),
    created: requireString(payload.created, "created"),
  };

  if (validated.outcome === "new-candidate" || validated.outcome === "enrich-existing") {
    requireString(validated.candidateTitle, "candidateTitle");
    requireString(validated.transverseRationale, "transverseRationale");
    requireString(validated.proposedSynthesis, "proposedSynthesis");
    requireString(validated.curationNotes, "curationNotes");
  }
  if (validated.outcome === "enrich-existing") {
    requireString(validated.targetCuratedNote, "targetCuratedNote");
  }

  return validated;
}

async function resolveRepositoryRoot(startDir) {
  let current = startDir;
  for (;;) {
    const gitPath = path.join(current, ".git");
    try {
      await fs.stat(gitPath);
      return current;
    } catch {}
    const parent = path.dirname(current);
    if (parent === current) {
      throw new StoryVaultFeedError(
        `Could not resolve repository root from ${startDir}`,
      );
    }
    current = parent;
  }
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    throw new StoryVaultFeedError("Proposal file is missing YAML frontmatter");
  }
  const closingMarker = markdown.indexOf("\n---\n", 4);
  if (closingMarker === -1) {
    throw new StoryVaultFeedError("Proposal frontmatter is not properly terminated");
  }
  const rawFrontmatter = markdown.slice(4, closingMarker);
  const body = markdown.slice(closingMarker + 5);
  const lines = rawFrontmatter.split("\n");
  const data = {};
  let currentListKey = null;

  for (const line of lines) {
    if (!line.trim()) continue;
    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch) {
      if (!currentListKey) {
        throw new StoryVaultFeedError(
          "Proposal frontmatter list item found without a preceding key",
        );
      }
      data[currentListKey].push(listMatch[1].trim());
      continue;
    }

    const scalarMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$/);
    if (!scalarMatch) {
      throw new StoryVaultFeedError(`Unsupported proposal frontmatter line: ${line}`);
    }
    const [, key, rawValue = ""] = scalarMatch;
    if (rawValue === "") {
      data[key] = [];
      currentListKey = key;
      continue;
    }
    data[key] = rawValue.trim();
    currentListKey = null;
  }

  return { data, body };
}

function extractSection(body, sectionTitle) {
  const pattern = new RegExp(
    `## ${sectionTitle.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\n\\n([\\s\\S]*?)(?=\\n## |$)`,
  );
  const match = body.match(pattern);
  return match ? match[1].trim() : "";
}

async function readExistingProposal(filePath) {
  const markdown = await fs.readFile(filePath, "utf8");
  const { data, body } = parseFrontmatter(markdown);
  return {
    title: data.title ?? "",
    kind: data.kind ?? "pattern",
    candidateSourceTypes: Array.isArray(data.candidateSourceTypes)
      ? data.candidateSourceTypes
      : [],
    sourceProjects: Array.isArray(data.sourceProjects) ? data.sourceProjects : [],
    provenance: Array.isArray(data.provenance) ? data.provenance : [],
    transverseRationale: data.transverseRationale ?? "",
    targetCuratedNote: data.targetCuratedNote ?? "",
    created: data.created ?? "YYYY-MM-DD",
    proposedSynthesis: extractSection(body, "Proposed Synthesis"),
    curationNotes: extractSection(body, "Curation Notes"),
  };
}

function union(left, right) {
  return [...new Set([...left, ...right])].sort((a, b) => a.localeCompare(b));
}

function mergeCurationNotes(existingNotes, nextNotes, newProvenance) {
  if (newProvenance.length === 0) return existingNotes;
  const addition = [
    "Additional workflow evidence:",
    ...newProvenance.map((item) => `- ${item}`),
    "",
    nextNotes,
  ].join("\n");
  return existingNotes ? `${existingNotes}\n\n${addition}` : addition;
}

async function loadVaultTitles(vaultRoot) {
  if (!vaultRoot) return [];
  try {
    const catalog = await catalogVault(vaultRoot);
    return catalog.notes.map((note) => note.title);
  } catch {
    const titles = [];

    async function walk(currentDir) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      entries.sort((left, right) => left.name.localeCompare(right.name));
      for (const entry of entries) {
        const absolutePath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name.startsWith(".")) continue;
          await walk(absolutePath);
          continue;
        }
        if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
        const markdown = await fs.readFile(absolutePath, "utf8");
        titles.push(pickVaultTitle(markdown, entry.name));
      }
    }

    await walk(vaultRoot);
    return titles.sort((left, right) => left.localeCompare(right));
  }
}

export async function feedStoryVaultOutcome({
  storyDir,
  proposalsRoot,
  vaultRoot = null,
}) {
  const resolvedStoryDir = await validateDirectory(storyDir, "Story directory");
  const resolvedProposalsRoot = await validateDirectory(
    proposalsRoot,
    "Proposals root",
  );
  const resolvedVaultRoot = await validateOptionalDirectory(vaultRoot, "Vault root");
  const repositoryRoot = await resolveRepositoryRoot(resolvedStoryDir);
  const outcomePath = path.join(resolvedStoryDir, "vault-outcome.json");
  const payload = validateVaultOutcome(await readJson(outcomePath));

  if (payload.outcome === "none" || payload.outcome === "deferred") {
    return {
      action: "not-applicable",
      reason: payload.outcome,
      proposalPath: null,
      outcomePath,
    };
  }

  const vaultTitles = await loadVaultTitles(resolvedVaultRoot);
  if (
    payload.outcome === "new-candidate" &&
    vaultTitles.some((title) => title.toLowerCase() === payload.candidateTitle.toLowerCase())
  ) {
    return {
      action: "skipped",
      reason: "duplicate-curated-note",
      proposalPath: null,
      outcomePath,
    };
  }
  if (
    payload.outcome === "enrich-existing" &&
    resolvedVaultRoot &&
    !vaultTitles.some(
      (title) => title.toLowerCase() === payload.targetCuratedNote.toLowerCase(),
    )
  ) {
    throw new StoryVaultFeedError(
      `Target curated note not found in vault: ${payload.targetCuratedNote}`,
    );
  }

  const proposalKey = slugify(
    payload.targetCuratedNote || payload.candidateTitle,
  );
  const proposalPath = path.join(resolvedProposalsRoot, `${proposalKey}.md`);
  const defaultSourceProjects = payload.sourceProjects.length > 0
    ? payload.sourceProjects
    : [path.basename(repositoryRoot)];
  const relativeOutcomePath = path.relative(repositoryRoot, outcomePath).split(path.sep).join("/");
  const nextProvenance = union(payload.provenance, [relativeOutcomePath]);

  const proposalPayload = {
    title: payload.candidateTitle,
    kind: payload.candidateKind,
    sourceType: "pattern-record",
    sourceProjects: defaultSourceProjects,
    provenance: nextProvenance,
    transverseRationale: payload.transverseRationale,
    proposedSynthesis: payload.proposedSynthesis,
    curationNotes: payload.curationNotes,
    targetCuratedNote: payload.targetCuratedNote,
    created: payload.created,
  };

  let action = "created";

  try {
    await fs.stat(proposalPath);
    const existing = await readExistingProposal(proposalPath);
    const mergedSourceProjects = union(
      existing.sourceProjects,
      proposalPayload.sourceProjects,
    );
    const mergedProvenance = union(existing.provenance, proposalPayload.provenance);
    const newProvenance = mergedProvenance.filter(
      (item) => !existing.provenance.includes(item),
    );
    if (newProvenance.length === 0) {
      return {
        action: "skipped",
        reason: "duplicate-story-provenance",
        proposalPath,
        outcomePath,
      };
    }
    proposalPayload.sourceProjects = mergedSourceProjects;
    proposalPayload.provenance = mergedProvenance;
    proposalPayload.transverseRationale =
      existing.transverseRationale || proposalPayload.transverseRationale;
    proposalPayload.proposedSynthesis =
      existing.proposedSynthesis || proposalPayload.proposedSynthesis;
    proposalPayload.curationNotes = mergeCurationNotes(
      existing.curationNotes,
      proposalPayload.curationNotes,
      newProvenance,
    );
    proposalPayload.created = existing.created || proposalPayload.created;
    action = "updated";
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const candidate = generateCandidateNote(proposalPayload);
  await fs.writeFile(proposalPath, `${candidate.markdown}\n`, "utf8");

  return {
    action,
    reason: null,
    proposalPath,
    outcomePath,
    targetCuratedNote: candidate.targetCuratedNote,
  };
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArguments(argv);
    const result = await feedStoryVaultOutcome(options);
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
