import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import http from "node:http";
import { mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  DevLogLifecycleError,
  formatFailure,
  isMainModule,
  registerStory,
  startStory,
  completeStory,
  validateGitSha,
} from "./devlog-story.mjs";

const PROJECT_ID = "123e4567-e89b-42d3-a456-426614174000";
const STORY_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const BASE_COMMIT = "a".repeat(40);
const TARGET_COMMIT = "b".repeat(40);
let server;
let baseUrl;
let responder;
let capturedUrl;
let capturedMethod;
let capturedBody;

before(async () => {
  server = http.createServer(async (request, response) => {
    capturedUrl = new URL(request.url, baseUrl);
    capturedMethod = request.method;
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    capturedBody = Buffer.concat(chunks).toString("utf8");
    responder(request, response);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

function jsonResponse(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

// ── Register tests ──

test("register sends correct payload and handles 201", async () => {
  responder = (_request, response) =>
    jsonResponse(response, 201, { id: STORY_ID });

  const result = await registerStory({
    baseUrl,
    projectId: PROJECT_ID,
    storyNumber: 7,
    title: "DevLog Lifecycle Integration",
    storyPath: "stories/0007-devlog-lifecycle-integration",
  });

  assert.deepEqual(result, { ok: true, storyId: STORY_ID });
  assert.equal(
    capturedUrl.pathname,
    `/api/v1/projects/${PROJECT_ID}/stories`,
  );
  assert.equal(capturedMethod, "POST");
  const body = JSON.parse(capturedBody);
  assert.equal(body.projectId, PROJECT_ID);
  assert.equal(body.storyNumber, 7);
  assert.equal(body.title, "DevLog Lifecycle Integration");
  assert.equal(body.storyPath, "stories/0007-devlog-lifecycle-integration");
});

test("register treats 409 as success (already registered)", async () => {
  responder = (_request, response) => jsonResponse(response, 409, {});

  const result = await registerStory({
    baseUrl,
    projectId: PROJECT_ID,
    storyNumber: 7,
    title: "DevLog Lifecycle Integration",
    storyPath: "stories/0007-devlog-lifecycle-integration",
  });

  assert.deepEqual(result, { ok: true, storyId: null });
});

test("register rejects invalid base URL", async () => {
  await assert.rejects(
    registerStory({
      baseUrl: "file:///tmp/devlog",
      projectId: PROJECT_ID,
      storyNumber: 7,
      title: "Title",
      storyPath: "path",
    }),
    /HTTP or HTTPS/,
  );
});

test("register rejects invalid project UUID", async () => {
  await assert.rejects(
    registerStory({
      baseUrl,
      projectId: "not-a-uuid",
      storyNumber: 7,
      title: "Title",
      storyPath: "path",
    }),
    /project ID is invalid/,
  );
});

test("register rejects non-integer storyNumber", async () => {
  await assert.rejects(
    registerStory({
      baseUrl,
      projectId: PROJECT_ID,
      storyNumber: 7.5,
      title: "Title",
      storyPath: "path",
    }),
    /storyNumber must be an integer/,
  );
});

test("register rejects empty title", async () => {
  await assert.rejects(
    registerStory({
      baseUrl,
      projectId: PROJECT_ID,
      storyNumber: 7,
      title: "  ",
      storyPath: "path",
    }),
    /title must be a non-empty string/,
  );
});

test("register rejects empty storyPath", async () => {
  await assert.rejects(
    registerStory({
      baseUrl,
      projectId: PROJECT_ID,
      storyNumber: 7,
      title: "Title",
      storyPath: "",
    }),
    /storyPath must be a non-empty string/,
  );
});

test("register rejects non-success HTTP responses", async () => {
  responder = (_request, response) => jsonResponse(response, 500, {});
  await assert.rejects(
    registerStory({
      baseUrl,
      projectId: PROJECT_ID,
      storyNumber: 7,
      title: "Title",
      storyPath: "path",
    }),
    /HTTP 500/,
  );
});

// ── Start tests ──

test("start sends correct baseCommit and handles 200", async () => {
  responder = (_request, response) => jsonResponse(response, 200, {});

  const result = await startStory({
    baseUrl,
    projectId: PROJECT_ID,
    storyId: STORY_ID,
    baseCommit: BASE_COMMIT,
  });

  assert.deepEqual(result, { ok: true });
  assert.equal(
    capturedUrl.pathname,
    `/api/v1/projects/${PROJECT_ID}/stories/${STORY_ID}/start`,
  );
  assert.equal(capturedMethod, "POST");
  assert.deepEqual(JSON.parse(capturedBody), { baseCommit: BASE_COMMIT });
});

test("start treats 409 as success (already started)", async () => {
  responder = (_request, response) => jsonResponse(response, 409, {});

  const result = await startStory({
    baseUrl,
    projectId: PROJECT_ID,
    storyId: STORY_ID,
    baseCommit: BASE_COMMIT,
  });

  assert.deepEqual(result, { ok: true });
});

test("start rejects invalid Git SHA", async () => {
  await assert.rejects(
    startStory({
      baseUrl,
      projectId: PROJECT_ID,
      storyId: STORY_ID,
      baseCommit: "not-a-sha",
    }),
    /40-character hexadecimal Git SHA/,
  );
});

test("start rejects short SHA", async () => {
  await assert.rejects(
    startStory({
      baseUrl,
      projectId: PROJECT_ID,
      storyId: STORY_ID,
      baseCommit: "abc123",
    }),
    /40-character hexadecimal Git SHA/,
  );
});

test("start rejects non-success HTTP responses", async () => {
  responder = (_request, response) => jsonResponse(response, 503, {});
  await assert.rejects(
    startStory({
      baseUrl,
      projectId: PROJECT_ID,
      storyId: STORY_ID,
      baseCommit: BASE_COMMIT,
    }),
    /HTTP 503/,
  );
});

// ── Complete tests ──

test("complete sends correct targetCommit and handles 200", async () => {
  responder = (_request, response) => jsonResponse(response, 200, {});

  const result = await completeStory({
    baseUrl,
    projectId: PROJECT_ID,
    storyId: STORY_ID,
    targetCommit: TARGET_COMMIT,
    baseCommit: BASE_COMMIT,
  });

  assert.deepEqual(result, { ok: true });
  assert.equal(
    capturedUrl.pathname,
    `/api/v1/projects/${PROJECT_ID}/stories/${STORY_ID}/complete`,
  );
  assert.equal(capturedMethod, "POST");
  assert.deepEqual(JSON.parse(capturedBody), { targetCommit: TARGET_COMMIT });
});

test("complete treats 409 as success (already completed)", async () => {
  responder = (_request, response) => jsonResponse(response, 409, {});

  const result = await completeStory({
    baseUrl,
    projectId: PROJECT_ID,
    storyId: STORY_ID,
    targetCommit: TARGET_COMMIT,
    baseCommit: BASE_COMMIT,
  });

  assert.deepEqual(result, { ok: true });
});

test("complete rejects targetCommit equal to baseCommit", async () => {
  await assert.rejects(
    completeStory({
      baseUrl,
      projectId: PROJECT_ID,
      storyId: STORY_ID,
      targetCommit: BASE_COMMIT,
      baseCommit: BASE_COMMIT,
    }),
    /targetCommit must differ from baseCommit/,
  );
});

test("complete rejects invalid Git SHA", async () => {
  await assert.rejects(
    completeStory({
      baseUrl,
      projectId: PROJECT_ID,
      storyId: STORY_ID,
      targetCommit: "not-a-sha",
      baseCommit: BASE_COMMIT,
    }),
    /40-character hexadecimal Git SHA/,
  );
});

test("complete rejects non-success HTTP responses", async () => {
  responder = (_request, response) => jsonResponse(response, 500, {});
  await assert.rejects(
    completeStory({
      baseUrl,
      projectId: PROJECT_ID,
      storyId: STORY_ID,
      targetCommit: TARGET_COMMIT,
      baseCommit: BASE_COMMIT,
    }),
    /HTTP 500/,
  );
});

// ── Failure tests ──

test("wraps fetch failures and formats visible fallback message", async () => {
  await assert.rejects(
    registerStory(
      {
        baseUrl,
        projectId: PROJECT_ID,
        storyNumber: 7,
        title: "Title",
        storyPath: "path",
      },
      async () => {
        throw new Error("connection refused");
      },
    ),
    /request failed: connection refused/,
  );

  const message = formatFailure(
    new DevLogLifecycleError("DevLog unavailable"),
  );
  assert.equal(
    message,
    "DEVLOG_LIFECYCLE_ERROR: DevLog unavailable. Engineering workflow continues without DevLog synchronization.",
  );
});

test("rejects requests that exceed the bounded timeout", async () => {
  const neverCompletes = async (_url, options) =>
    new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(options.signal.reason), {
        once: true,
      });
    });

  await assert.rejects(
    registerStory(
      {
        baseUrl,
        projectId: PROJECT_ID,
        storyNumber: 7,
        title: "Title",
        storyPath: "path",
        timeoutMs: 10,
      },
      neverCompletes,
    ),
    /request timed out/,
  );
});

test("rejects malformed JSON responses", async () => {
  responder = (_request, response) => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end("{");
  };
  await assert.rejects(
    registerStory({
      baseUrl,
      projectId: PROJECT_ID,
      storyNumber: 7,
      title: "Title",
      storyPath: "path",
    }),
    /malformed JSON/,
  );
});

// ── validateGitSha unit tests ──

test("validateGitSha accepts valid 40-character hex", () => {
  assert.doesNotThrow(() => validateGitSha("a".repeat(40), "test"));
  assert.doesNotThrow(
    () => validateGitSha("0123456789abcdef0123456789abcdef01234567", "test"),
  );
});

test("validateGitSha rejects non-hex and wrong length", () => {
  assert.throws(() => validateGitSha("not-a-sha", "test"), /40-character/);
  assert.throws(
    () => validateGitSha("g" + "a".repeat(39), "test"),
    /40-character/,
  );
  assert.throws(() => validateGitSha("a".repeat(39), "test"), /40-character/);
  assert.throws(() => validateGitSha("a".repeat(41), "test"), /40-character/);
});

// ── Entrypoint tests ──

test("recognizes the CLI entrypoint through a directory symlink", async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), "engineering-story-symlink-"),
  );
  const canonicalScript = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "devlog-story.mjs",
  );
  const linkedSkillDirectory = path.join(temporaryDirectory, "engineering-story");
  await symlink(
    path.resolve(path.dirname(canonicalScript), ".."),
    linkedSkillDirectory,
    "dir",
  );

  try {
    const linkedScript = path.join(
      linkedSkillDirectory,
      "scripts",
      "devlog-story.mjs",
    );
    assert.equal(
      isMainModule(linkedScript, pathToFileURL(canonicalScript).href),
      true,
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
