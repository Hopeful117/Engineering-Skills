#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const DEFAULT_IGNORED_DIRS = new Set([".obsidian"]);
const REQUIRED_FIELDS = [
  "id",
  "title",
  "kind",
  "status",
  "sourceProjects",
  "provenance",
];

export class VaultCatalogError extends Error {
  constructor(message) {
    super(message);
    this.name = "VaultCatalogError";
  }
}

export function formatFailure(error) {
  const diagnostic = error instanceof Error ? error.message : String(error);
  return `VAULT_CATALOG_ERROR: ${diagnostic}`;
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new VaultCatalogError("Expected --vault-root argument");
    }
    values.set(key, value);
  }
  return {
    vaultRoot: values.get("--vault-root"),
  };
}

async function validateVaultRoot(vaultRoot) {
  if (typeof vaultRoot !== "string" || vaultRoot.trim() === "") {
    throw new VaultCatalogError("Vault root must be a non-empty path");
  }
  const resolved = path.resolve(vaultRoot);
  let stats;
  try {
    stats = await fs.stat(resolved);
  } catch {
    throw new VaultCatalogError(`Vault root does not exist: ${resolved}`);
  }
  if (!stats.isDirectory()) {
    throw new VaultCatalogError(`Vault root is not a directory: ${resolved}`);
  }
  return resolved;
}

function isHiddenName(name) {
  return name.startsWith(".");
}

async function collectMarkdownFiles(root) {
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (DEFAULT_IGNORED_DIRS.has(entry.name) || isHiddenName(entry.name)) {
          continue;
        }
        await walk(absolutePath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (isHiddenName(entry.name)) continue;
      if (!entry.name.endsWith(".md")) continue;
      files.push(absolutePath);
    }
  }

  await walk(root);
  return files;
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    throw new VaultCatalogError("Note is missing YAML frontmatter");
  }

  const closingMarker = markdown.indexOf("\n---\n", 4);
  if (closingMarker === -1) {
    throw new VaultCatalogError("Note frontmatter is not properly terminated");
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
        throw new VaultCatalogError("List item found without a preceding key");
      }
      data[currentListKey].push(listMatch[1].trim());
      continue;
    }

    const scalarMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$/);
    if (!scalarMatch) {
      throw new VaultCatalogError(`Unsupported frontmatter line: ${line}`);
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

function validateMetadata(metadata, relativePath) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in metadata)) {
      throw new VaultCatalogError(
        `Note ${relativePath} is missing required field "${field}"`,
      );
    }
  }

  for (const field of ["sourceProjects", "provenance"]) {
    if (!Array.isArray(metadata[field]) || metadata[field].length === 0) {
      throw new VaultCatalogError(
        `Note ${relativePath} field "${field}" must be a non-empty list`,
      );
    }
  }

  for (const field of ["tags", "aliases"]) {
    if (field in metadata && !Array.isArray(metadata[field])) {
      throw new VaultCatalogError(
        `Note ${relativePath} field "${field}" must be a list when present`,
      );
    }
  }
}

function extractLinks(body) {
  const wikiLinks = [];
  const markdownLinks = [];
  const wikiPattern = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
  const markdownPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

  for (const match of body.matchAll(wikiPattern)) {
    wikiLinks.push(match[1].trim());
  }
  for (const match of body.matchAll(markdownPattern)) {
    markdownLinks.push(match[2].trim());
  }

  wikiLinks.sort((left, right) => left.localeCompare(right));
  markdownLinks.sort((left, right) => left.localeCompare(right));

  return { wikiLinks, markdownLinks };
}

async function readNote(vaultRoot, notePath) {
  const markdown = await fs.readFile(notePath, "utf8");
  const relativePath = path.relative(vaultRoot, notePath).split(path.sep).join("/");
  const { data, body } = parseFrontmatter(markdown);
  validateMetadata(data, relativePath);
  const links = extractLinks(body);

  return {
    path: relativePath,
    id: data.id,
    title: data.title,
    kind: data.kind,
    status: data.status,
    sourceProjects: data.sourceProjects,
    provenance: data.provenance,
    created: data.created ?? null,
    updated: data.updated ?? null,
    tags: data.tags ?? [],
    aliases: data.aliases ?? [],
    links,
  };
}

export async function catalogVault(vaultRoot) {
  const resolvedRoot = await validateVaultRoot(vaultRoot);
  const markdownFiles = await collectMarkdownFiles(resolvedRoot);
  const notes = [];

  for (const filePath of markdownFiles) {
    notes.push(await readNote(resolvedRoot, filePath));
  }

  notes.sort((left, right) => left.path.localeCompare(right.path));

  return {
    vaultRoot: resolvedRoot,
    noteCount: notes.length,
    notes,
  };
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArguments(argv);
    const catalog = await catalogVault(options.vaultRoot);
    process.stdout.write(`${JSON.stringify(catalog, null, 2)}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`${formatFailure(error)}\n`);
    return 2;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main();
}
