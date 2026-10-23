import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import http from "node:http";
import { mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  DevLogContextError,
  formatFailure,
  isMainModule,
  requestDevLogContext,
} from "./devlog-context.mjs";

const PROJECT_ID = "123e4567-e89b-42d3-a456-426614174000";
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
    server.close((error) => error ? reject(error) : resolve()));
});

function jsonResponse(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

test("returns existing RepositoryContext and sends description as JSON", async () => {
  const context = {
    evidence: [{
      reference: "source:Example.java",
      summary: "Example",
      provenance: { originatingFile: "src/Example.java" },
    }],
    warnings: [],
    contextDigest: "digest",
  };
  responder = (_request, response) =>
    jsonResponse(response, 200, { repositoryContext: context });

  const description = "Handle context & provenance / tests";
  const result = await requestDevLogContext({
    baseUrl,
    projectId: PROJECT_ID,
    description,
  });

  assert.deepEqual(result, context);
  assert.equal(
    capturedUrl.pathname,
    `/api/projects/${PROJECT_ID}/engineering-story-context`,
  );
  assert.equal(capturedMethod, "POST");
  assert.equal(capturedUrl.search, "");
  assert.deepEqual(JSON.parse(capturedBody), { description });
});

test("sends a complete large Story in the request body", async () => {
  const context = {
    evidence: [{ reference: "source:Large.java", summary: "Large Story" }],
  };
  responder = (_request, response) =>
    jsonResponse(response, 200, { repositoryContext: context });
  const description = "Engineering Story acceptance criterion. ".repeat(320);

  const result = await requestDevLogContext({
    baseUrl,
    projectId: PROJECT_ID,
    description,
  });

  assert.deepEqual(result, context);
  assert.equal(capturedMethod, "POST");
  assert.equal(capturedUrl.search, "");
  assert.equal(JSON.parse(capturedBody).description, description);
});

test("rejects invalid input", async () => {
  await assert.rejects(
    requestDevLogContext({
      baseUrl: "file:///tmp/devlog",
      projectId: PROJECT_ID,
      description: "Story",
    }),
    /HTTP or HTTPS/,
  );
  await assert.rejects(
    requestDevLogContext({
      baseUrl,
      projectId: "not-a-uuid",
      description: "Story",
    }),
    /project ID is invalid/,
  );
});

test("rejects non-success responses", async () => {
  responder = (_request, response) => jsonResponse(response, 503, {});
  await assert.rejects(
    requestDevLogContext({
      baseUrl,
      projectId: PROJECT_ID,
      description: "Story",
    }),
    /HTTP 503/,
  );
});

test("rejects malformed JSON", async () => {
  responder = (_request, response) => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end("{");
  };
  await assert.rejects(
    requestDevLogContext({
      baseUrl,
      projectId: PROJECT_ID,
      description: "Story",
    }),
    /malformed JSON/,
  );
});

test("rejects missing or empty RepositoryContext", async () => {
  responder = (_request, response) => jsonResponse(response, 200, {});
  await assert.rejects(
    requestDevLogContext({
      baseUrl,
      projectId: PROJECT_ID,
      description: "Story",
    }),
    /no RepositoryContext/,
  );

  responder = (_request, response) =>
    jsonResponse(response, 200, { repositoryContext: { evidence: [] } });
  await assert.rejects(
    requestDevLogContext({
      baseUrl,
      projectId: PROJECT_ID,
      description: "Story",
    }),
    /no usable evidence/,
  );
});

test("rejects requests that exceed the bounded timeout", async () => {
  const neverCompletes = async (_url, options) =>
    new Promise((_resolve, reject) => {
      options.signal.addEventListener(
        "abort",
        () => reject(options.signal.reason),
        { once: true },
      );
    });

  await assert.rejects(
    requestDevLogContext(
      {
        baseUrl,
        projectId: PROJECT_ID,
        description: "Story",
        timeoutMs: 10,
      },
      neverCompletes,
    ),
    /request timed out/,
  );
});

test("wraps fetch failures and formats visible fallback message", async () => {
  await assert.rejects(
    requestDevLogContext(
      {
        baseUrl,
        projectId: PROJECT_ID,
        description: "Story",
      },
      async () => { throw new Error("connection refused"); },
    ),
    /request failed: connection refused/,
  );

  const message = formatFailure(new DevLogContextError("DevLog unavailable"));
  assert.equal(
    message,
    "DEVLOG_CONTEXT_ERROR: DevLog unavailable. Repository Analysis continues without DevLog.",
  );
});


test("recognizes the CLI entrypoint through a directory symlink", async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), "engineering-story-symlink-"),
  );
  const canonicalScript = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "devlog-context.mjs",
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
      "devlog-context.mjs",
    );
    assert.equal(
      isMainModule(linkedScript, pathToFileURL(canonicalScript).href),
      true,
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
