// Workflow Gate Plugin — Artifact Hashing

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export async function computeArtifactHash(
  artifactPath: string,
): Promise<string> {
  const content = await readFile(artifactPath);
  return createHash("sha256").update(content).digest("hex");
}

export async function verifyArtifactHash(
  artifactPath: string,
  expectedHash: string,
): Promise<{ valid: boolean; actualHash: string }> {
  const actualHash = await computeArtifactHash(artifactPath);
  return {
    valid: actualHash === expectedHash,
    actualHash,
  };
}
