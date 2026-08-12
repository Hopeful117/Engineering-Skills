#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

import { catalogVault } from "./vault-catalog.mjs";
import { generateCandidateNote } from "./candidate-note.mjs";

const GENERIC_TOKENS = new Set([
  "a",
  "ai",
  "and",
  "code",
  "cross",
  "design",
  "engineering",
  "extract",
  "for",
  "from",
  "guide",
  "integration",
  "knowledge",
  "memory",
  "note",
  "notes",
  "obsidian",
  "pattern",
  "pipeline",
  "project",
  "projects",
  "proposal",
  "quality",
  "report",
  "review",
  "scan",
  "skill",
  "standard",
  "story",
  "system",
  "the",
  "transverse",
  "vault",
  "workflow",
]);
const STORY_ARTIFACT_LAYOUTS = [
  ["stories"],
  ["docs", "stories"],
];
const STORY_ARTIFACT_NAMES = ["engineering-report.md", "code-review.md"];
const ARCHITECTURE_DOC_LAYOUTS = [
  ["docs", "adr"],
  ["docs", "decisions"],
];
const GENERIC_REVIEW_PHRASES = [
  "review summary",
  "findings no findings",
  "story compliance",
  "plan compliance",
  "implementation correctness",
  "architecture compliance",
];
const TRANSVERSE_SIGNAL_PHRASES = [
  "cross-project",
  "multiple repositories",
  "across multiple repositories",
  "across repositories",
  "reusable pattern",
  "recurring pattern",
  "durable",
  "principle",
  "standard",
  "workflow",
  "quality gate",
  "provenance",
  "traceability",
  "boundary",
  "governance",
  "candidate",
  "candidate-note",
  "canonical",
  "transverse",
  "transverse memory",
  "quality validation",
  "curated",
  "deterministic",
  "knowledge evolution",
  "engineering knowledge",
];

export class WorkspaceVaultExtractError extends Error {
  constructor(message) {
    super(message);
    this.name = "WorkspaceVaultExtractError";
  }
}

export function formatFailure(error) {
  const diagnostic = error instanceof Error ? error.message : String(error);
  return `WORKSPACE_VAULT_EXTRACT_ERROR: ${diagnostic}`;
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new WorkspaceVaultExtractError(
        "Expected --vault-root and --repo-roots arguments",
      );
    }
    values.set(key, value);
  }

  const repoRootsValue = values.get("--repo-roots");
  const repoRoots = repoRootsValue
    ? repoRootsValue.split(",").map((entry) => entry.trim()).filter(Boolean)
    : [];

  return {
    vaultRoot: values.get("--vault-root"),
    repoRoots,
  };
}

async function validateRepoRoots(repoRoots) {
  if (!Array.isArray(repoRoots) || repoRoots.length === 0) {
    throw new WorkspaceVaultExtractError("At least one repository root is required");
  }

  const resolvedRoots = [];
  for (const repoRoot of repoRoots) {
    const resolved = path.resolve(repoRoot);
    let stats;
    try {
      stats = await fs.stat(resolved);
    } catch {
      throw new WorkspaceVaultExtractError(`Repository root does not exist: ${resolved}`);
    }
    if (!stats.isDirectory()) {
      throw new WorkspaceVaultExtractError(`Repository root is not a directory: ${resolved}`);
    }
    resolvedRoots.push(resolved);
  }
  return resolvedRoots;
}

async function collectLooseVaultNotes(vaultRoot) {
  const files = [];

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
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith(".md")) continue;
      files.push(absolutePath);
    }
  }

  await walk(vaultRoot);
  const notes = [];
  for (const filePath of files) {
    const markdown = await fs.readFile(filePath, "utf8");
    const title = extractFirstHeading(markdown) ?? path.basename(filePath, ".md");
    notes.push({
      title,
      path: path.relative(vaultRoot, filePath).split(path.sep).join("/"),
    });
  }
  return notes;
}

async function collectEligibleFiles(repoRoot) {
  const files = [];
  for (const layout of STORY_ARTIFACT_LAYOUTS) {
    const storiesRoot = path.join(repoRoot, ...layout);
    try {
      const storyDirs = await fs.readdir(storiesRoot, { withFileTypes: true });
      for (const entry of storyDirs) {
        if (!entry.isDirectory()) continue;
        for (const name of STORY_ARTIFACT_NAMES) {
          const absolutePath = path.join(storiesRoot, entry.name, name);
          try {
            const stats = await fs.stat(absolutePath);
            if (stats.isFile()) files.push(absolutePath);
          } catch {}
        }
      }
    } catch {}
  }

  for (const layout of ARCHITECTURE_DOC_LAYOUTS) {
    const docsRoot = path.join(repoRoot, ...layout);
    try {
      const entries = await fs.readdir(docsRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!entry.name.endsWith(".md")) continue;
        files.push(path.join(docsRoot, entry.name));
      }
    } catch {}
  }

  files.sort((left, right) => left.localeCompare(right));
  return [...new Set(files)];
}

function inferSourceType(filePath) {
  if (filePath.endsWith("engineering-report.md")) return "engineering-report";
  if (filePath.endsWith("code-review.md")) return "code-review";
  if (
    filePath.includes(`${path.sep}docs${path.sep}adr${path.sep}`) ||
    filePath.includes(`${path.sep}docs${path.sep}decisions${path.sep}`)
  ) {
    return "adr";
  }
  return null;
}

function inferKind(sourceType) {
  if (sourceType === "adr") return "decision-summary";
  if (sourceType === "code-review") return "lesson";
  return "pattern";
}

async function fileExists(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function extractStoryTitleFromSibling(filePath) {
  const storyPath = path.join(path.dirname(filePath), "story.md");
  if (!(await fileExists(storyPath))) return null;
  const content = await fs.readFile(storyPath, "utf8");
  const match = content.match(/\*\*Title:\*\*\s*\n([^\n]+)/);
  return match ? match[1].replace(/`/g, "").trim() : null;
}

function extractFirstHeading(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function summarizeMarkdown(markdown) {
  const text = markdown
    .replace(/^---[\s\S]*?---\s*/m, "")
    .replace(/^#+\s+/gm, "")
    .replace(/`/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\[\[(.*?)\]\]/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 220);
}

function normalizeTokens(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !GENERIC_TOKENS.has(token));
}

function uniqueTokens(value) {
  return [...new Set(normalizeTokens(value))];
}

function computeSimilarity(leftTokens, rightTokens) {
  const left = new Set(leftTokens);
  const right = new Set(rightTokens);
  const overlap = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size || 1;
  return { overlap, score: overlap / union };
}

function looksGenericStoryArtifact(title, summary, sourceType) {
  if (sourceType === "adr") return false;
  const loweredTitle = title.trim().toLowerCase();
  const loweredSummary = summary.trim().toLowerCase();
  if (loweredTitle === "engineering report" || loweredTitle === "code review report") {
    return true;
  }
  return GENERIC_REVIEW_PHRASES.filter((phrase) => loweredSummary.includes(phrase)).length >= 2;
}

function hasStrongTransverseSignal(title, summary, sourceType) {
  if (sourceType === "adr") return true;
  const text = `${title}\n${summary}`.toLowerCase();
  return TRANSVERSE_SIGNAL_PHRASES.filter((phrase) => text.includes(phrase)).length >= 2;
}

function compareWithVault(title, summary, vaultNotes) {
  const normalizedTitle = title.trim().toLowerCase();
  const exactMatch = vaultNotes.find(
    (note) => note.title.trim().toLowerCase() === normalizedTitle,
  );
  if (exactMatch) {
    return { classification: "duplicate", matchedVaultNote: exactMatch.title };
  }

  const titleTokens = uniqueTokens(title);
  const summaryTokens = uniqueTokens(summary).slice(0, 12);
  let best = null;

  for (const note of vaultNotes) {
    const noteTokens = uniqueTokens(note.title);
    const titleSimilarity = computeSimilarity(titleTokens, noteTokens);
    const summarySimilarity = computeSimilarity(summaryTokens, noteTokens);
    const combinedScore = titleSimilarity.score + summarySimilarity.score * 0.35;
    if (!best || combinedScore > best.combinedScore) {
      best = {
        note,
        combinedScore,
        titleOverlap: titleSimilarity.overlap,
        summaryOverlap: summarySimilarity.overlap,
        titleScore: titleSimilarity.score,
      };
    }
  }

  if (!best || (best.titleOverlap === 0 && best.summaryOverlap === 0)) {
    return { classification: "new", matchedVaultNote: null };
  }
  if (best.titleScore >= 0.6 || best.titleOverlap >= 3) {
    return { classification: "duplicate", matchedVaultNote: best.note.title };
  }
  if (best.titleOverlap >= 1 || best.summaryOverlap >= 2) {
    return { classification: "enrich-existing", matchedVaultNote: best.note.title };
  }
  return { classification: "enrich-existing", matchedVaultNote: best.note.title };
}

async function extractCandidateFromFile(repoRoot, filePath, vaultNotes) {
  const sourceType = inferSourceType(filePath);
  if (!sourceType) {
    return {
      sourceFile: filePath,
      classification: "skip",
      reason: "ineligible-source-type",
    };
  }

  const markdown = await fs.readFile(filePath, "utf8");
  const summary = summarizeMarkdown(markdown);
  if (summary.length < 80) {
    return {
      sourceFile: filePath,
      classification: "skip",
      reason: "low-value-content",
    };
  }

  const relativeSourceFile = path.relative(repoRoot, filePath).split(path.sep).join("/");
  let title;
  if (sourceType === "engineering-report" || sourceType === "code-review") {
    const storyTitle = await extractStoryTitleFromSibling(filePath);
    if (storyTitle) {
      title =
        sourceType === "engineering-report"
          ? `Pattern from ${storyTitle}`
          : `Lesson from ${storyTitle}`;
    }
  }
  if (!title) {
    title = extractFirstHeading(markdown) ?? path.basename(filePath, ".md");
  }

  if (looksGenericStoryArtifact(title, summary, sourceType)) {
    return {
      repositoryRoot: repoRoot,
      sourceFile: path.relative(repoRoot, filePath).split(path.sep).join("/"),
      sourceType,
      classification: "skip",
      reason: "generic-story-artifact",
    };
  }
  if (!hasStrongTransverseSignal(title, summary, sourceType)) {
    return {
      repositoryRoot: repoRoot,
      sourceFile: path.relative(repoRoot, filePath).split(path.sep).join("/"),
      sourceType,
      classification: "skip",
      reason: "weak-transverse-signal",
    };
  }

  const comparison = compareWithVault(title, summary, vaultNotes);
  const payload = {
    title,
    kind: inferKind(sourceType),
    sourceType,
    sourceProjects: [path.basename(repoRoot)],
    provenance: [relativeSourceFile],
    transverseRationale:
      comparison.classification === "new"
        ? "Selected by ponctual extraction because it appears relevant beyond one project and is not obviously covered by the current curated vault."
        : `Selected by ponctual extraction because it appears to enrich the current curated vault topic "${comparison.matchedVaultNote}".`,
    proposedSynthesis: summary,
    curationNotes:
      comparison.classification === "duplicate"
        ? `Likely duplicate of current curated note "${comparison.matchedVaultNote}". Review before creating a new candidate note.`
        : comparison.classification === "enrich-existing"
          ? `Likely enriches existing curated note "${comparison.matchedVaultNote}". Review as an amendment rather than a separate canonical note.`
          : "Likely new transverse-memory candidate discovered through ponctual workspace extraction.",
    targetCuratedNote: comparison.classification === "enrich-existing"
      ? comparison.matchedVaultNote
      : "",
    created: "2026-08-12",
  };

  const candidate = generateCandidateNote(payload);
  return {
    repositoryRoot: repoRoot,
    sourceFile: relativeSourceFile,
    sourceType,
    classification: comparison.classification,
    matchedVaultNote: comparison.matchedVaultNote,
    candidate,
  };
}

export async function extractWorkspaceVaultCandidates(vaultRoot, repoRoots) {
  let vaultCatalog;
  try {
    vaultCatalog = await catalogVault(vaultRoot);
  } catch {
    const resolvedVaultRoot = path.resolve(vaultRoot);
    vaultCatalog = {
      vaultRoot: resolvedVaultRoot,
      notes: await collectLooseVaultNotes(resolvedVaultRoot),
      noteCount: 0,
    };
    vaultCatalog.noteCount = vaultCatalog.notes.length;
  }
  const resolvedRepoRoots = await validateRepoRoots(repoRoots);
  const extractedCandidates = [];
  const skipped = [];

  for (const repoRoot of resolvedRepoRoots) {
    const files = await collectEligibleFiles(repoRoot);
    for (const filePath of files) {
      const result = await extractCandidateFromFile(repoRoot, filePath, vaultCatalog.notes);
      if (result.classification === "skip") {
        skipped.push(result);
      } else {
        extractedCandidates.push(result);
      }
    }
  }

  return {
    mode: "proposal-only",
    vaultRoot: vaultCatalog.vaultRoot,
    vaultNotesConsidered: vaultCatalog.noteCount,
    repoRoots: resolvedRepoRoots,
    extractedCandidates,
    skipped,
  };
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArguments(argv);
    const result = await extractWorkspaceVaultCandidates(
      options.vaultRoot,
      options.repoRoots,
    );
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
