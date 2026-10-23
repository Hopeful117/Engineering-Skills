#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GIT_SHA_PATTERN = /^[0-9a-f]{40}$/i;
const VALID_OPERATIONS = ["register", "start", "complete"];
const DEFAULT_TIMEOUT_MS = 3000;

export class DevLogLifecycleError extends Error {
  constructor(message) {
    super(message);
    this.name = "DevLogLifecycleError";
  }
}

export function formatFailure(error) {
  const diagnostic = error instanceof Error ? error.message : String(error);
  return `DEVLOG_LIFECYCLE_ERROR: ${diagnostic}. Engineering workflow continues without DevLog synchronization.`;
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new DevLogLifecycleError(
        "Expected --base-url, --project-id, and --operation arguments",
      );
    }
    values.set(key, value);
  }
  const operation = values.get("--operation");
  if (!VALID_OPERATIONS.includes(operation ?? "")) {
    throw new DevLogLifecycleError(
      `--operation must be one of: ${VALID_OPERATIONS.join(", ")}`,
    );
  }
  return {
    baseUrl: values.get("--base-url"),
    projectId: values.get("--project-id"),
    storyId: values.get("--story-id"),
    operation,
    timeoutMs: values.has("--timeout-ms")
      ? Number(values.get("--timeout-ms"))
      : DEFAULT_TIMEOUT_MS,
  };
}

function validateInputs({ baseUrl, projectId, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new DevLogLifecycleError("DevLog base URL is invalid");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new DevLogLifecycleError("DevLog base URL must use HTTP or HTTPS");
  }
  if (!UUID_PATTERN.test(projectId ?? "")) {
    throw new DevLogLifecycleError("DevLog project ID is invalid");
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) {
    throw new DevLogLifecycleError(
      "DevLog timeout must be between 1 and 30000 milliseconds",
    );
  }
  return url;
}

export function validateGitSha(sha, label) {
  if (typeof sha !== "string" || !GIT_SHA_PATTERN.test(sha)) {
    throw new DevLogLifecycleError(
      `${label} must be a 40-character hexadecimal Git SHA`,
    );
  }
}

async function postJson(url, body, timeoutMs, fetchImplementation = fetch) {
  let response;
  try {
    response = await fetchImplementation(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const message =
      error?.name === "TimeoutError"
        ? "DevLog request timed out"
        : `DevLog request failed: ${error?.message ?? String(error)}`;
    throw new DevLogLifecycleError(message);
  }

  if (!response.ok) {
    throw new DevLogLifecycleError(`DevLog returned HTTP ${response.status}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new DevLogLifecycleError("DevLog returned malformed JSON");
  }
  return payload;
}

export async function registerStory(
  { baseUrl, projectId, storyNumber, title, storyPath, timeoutMs = DEFAULT_TIMEOUT_MS },
  fetchImplementation = fetch,
) {
  const url = validateInputs({ baseUrl, projectId, timeoutMs });
  url.pathname = `${url.pathname.replace(/\/$/, "")}/api/v1/projects/${projectId}/stories`;
  url.search = "";

  if (typeof storyNumber !== "number" || !Number.isInteger(storyNumber)) {
    throw new DevLogLifecycleError("storyNumber must be an integer");
  }
  if (typeof title !== "string" || title.trim() === "") {
    throw new DevLogLifecycleError("title must be a non-empty string");
  }
  if (typeof storyPath !== "string" || storyPath.trim() === "") {
    throw new DevLogLifecycleError("storyPath must be a non-empty string");
  }

  try {
    const payload = await postJson(
      url,
      { projectId, title, storyNumber, storyPath },
      timeoutMs,
      fetchImplementation,
    );
    return { ok: true, storyId: payload?.id };
  } catch (error) {
    if (
      error instanceof DevLogLifecycleError &&
      error.message.includes("HTTP 409")
    ) {
      return { ok: true, storyId: null };
    }
    throw error;
  }
}

export async function startStory(
  { baseUrl, projectId, storyId, baseCommit, timeoutMs = DEFAULT_TIMEOUT_MS },
  fetchImplementation = fetch,
) {
  const url = validateInputs({ baseUrl, projectId, timeoutMs });
  validateGitSha(baseCommit, "baseCommit");
  url.pathname = `${url.pathname.replace(/\/$/, "")}/api/v1/projects/${projectId}/stories/${storyId}/start`;
  url.search = "";

  try {
    await postJson(url, { baseCommit }, timeoutMs, fetchImplementation);
    return { ok: true };
  } catch (error) {
    if (
      error instanceof DevLogLifecycleError &&
      error.message.includes("HTTP 409")
    ) {
      return { ok: true };
    }
    throw error;
  }
}

export async function completeStory(
  { baseUrl, projectId, storyId, targetCommit, baseCommit, timeoutMs = DEFAULT_TIMEOUT_MS },
  fetchImplementation = fetch,
) {
  const url = validateInputs({ baseUrl, projectId, timeoutMs });
  validateGitSha(targetCommit, "targetCommit");
  if (baseCommit && targetCommit === baseCommit) {
    throw new DevLogLifecycleError(
      "targetCommit must differ from baseCommit; the human commit may not have been created",
    );
  }
  url.pathname = `${url.pathname.replace(/\/$/, "")}/api/v1/projects/${projectId}/stories/${storyId}/complete`;
  url.search = "";

  try {
    await postJson(url, { targetCommit }, timeoutMs, fetchImplementation);
    return { ok: true };
  } catch (error) {
    if (
      error instanceof DevLogLifecycleError &&
      error.message.includes("HTTP 409")
    ) {
      return { ok: true };
    }
    throw error;
  }
}

async function readStandardInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArguments(argv);
    const input = JSON.parse(await readStandardInput());

    let result;
    if (options.operation === "register") {
      result = await registerStory({ ...options, ...input });
    } else if (options.operation === "start") {
      result = await startStory({ ...options, ...input });
    } else if (options.operation === "complete") {
      result = await completeStory({ ...options, ...input });
    }

    process.stdout.write(`${JSON.stringify(result)}\n`);
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
