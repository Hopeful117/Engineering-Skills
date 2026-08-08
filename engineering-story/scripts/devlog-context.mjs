#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEFAULT_TIMEOUT_MS = 3000;

export class DevLogContextError extends Error {
  constructor(message) {
    super(message);
    this.name = "DevLogContextError";
  }
}

export function formatFailure(error) {
  const diagnostic = error instanceof Error ? error.message : String(error);
  return `DEVLOG_CONTEXT_ERROR: ${diagnostic}. Repository Analysis continues without DevLog.`;
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new DevLogContextError("Expected --base-url and --project-id arguments");
    }
    values.set(key, value);
  }
  return {
    baseUrl: values.get("--base-url"),
    projectId: values.get("--project-id"),
    timeoutMs: values.has("--timeout-ms")
      ? Number(values.get("--timeout-ms"))
      : DEFAULT_TIMEOUT_MS,
  };
}

function validateInputs({ baseUrl, projectId, timeoutMs }) {
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new DevLogContextError("DevLog base URL is invalid");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new DevLogContextError("DevLog base URL must use HTTP or HTTPS");
  }
  if (!UUID_PATTERN.test(projectId ?? "")) {
    throw new DevLogContextError("DevLog project ID is invalid");
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) {
    throw new DevLogContextError("DevLog timeout must be between 1 and 30000 milliseconds");
  }
  return url;
}

function usableEvidence(evidence) {
  return Array.isArray(evidence)
    && evidence.some((item) => item && typeof item === "object"
      && typeof item.reference === "string"
      && typeof item.summary === "string");
}

export async function requestDevLogContext(
  { baseUrl, projectId, description, timeoutMs = DEFAULT_TIMEOUT_MS },
  fetchImplementation = fetch,
) {
  const url = validateInputs({ baseUrl, projectId, timeoutMs });
  url.pathname = `${url.pathname.replace(/\/$/, "")}/api/projects/${projectId}/engineering-story-context`;
  url.search = "";

  let response;
  try {
    response = await fetchImplementation(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const message = error?.name === "TimeoutError"
      ? "DevLog request timed out"
      : `DevLog request failed: ${error?.message ?? String(error)}`;
    throw new DevLogContextError(message);
  }

  if (!response.ok) {
    throw new DevLogContextError(`DevLog returned HTTP ${response.status}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new DevLogContextError("DevLog returned malformed JSON");
  }

  const context = payload?.repositoryContext;
  if (!context || typeof context !== "object") {
    throw new DevLogContextError("DevLog response has no RepositoryContext");
  }
  if (!usableEvidence(context.evidence)) {
    throw new DevLogContextError("DevLog RepositoryContext contains no usable evidence");
  }
  return context;
}

async function readStandardInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArguments(argv);
    const description = await readStandardInput();
    const context = await requestDevLogContext({ ...options, description });
    process.stdout.write(`${JSON.stringify(context)}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`${formatFailure(error)}\n`);
    return 2;
  }
}

export function isMainModule(
  executablePath = process.argv[1],
  moduleUrl = import.meta.url,
) {
  if (!executablePath) return false;
  try {
    return realpathSync(executablePath) === fileURLToPath(moduleUrl);
  } catch {
    return false;
  }
}

if (isMainModule()) {
  process.exitCode = await main();
}
