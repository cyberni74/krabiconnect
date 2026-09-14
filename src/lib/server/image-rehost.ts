import { createHash } from "node:crypto";
import { env } from "@/lib/env.server";
import { inspectImageUrl, proxyRemoteImage } from "./image-proxy";

/**
 * BLOB_READ_WRITE_TOKEN — Vercel Blob read-write token.
 * Optional. POST /api/agent/rehost returns 503 when unset.
 * GET /api/img still works without Blob.
 */
export function blobReadWriteToken(): string | undefined {
  return env("BLOB_READ_WRITE_TOKEN");
}

function extFor(contentType: string): string {
  const type = contentType.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  if (type.includes("avif")) return "avif";
  return "jpg";
}

export type RehostResult = { ok: true; url: string };

export async function rehostRemoteImage(raw: string): Promise<RehostResult> {
  const token = blobReadWriteToken();
  if (!token) {
    const err = new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Configure a Vercel Blob read-write token to rehost. GET /api/img still works without Blob.",
    ) as Error & { status: number };
    err.status = 503;
    throw err;
  }
  const inspected = inspectImageUrl(raw);
  if (!inspected.ok) {
    const err = new Error(inspected.error) as Error & { status: number };
    err.status = inspected.status;
    throw err;
  }
  const proxied = await proxyRemoteImage(raw);
  if (!proxied.ok) {
    let message = "Upstream image fetch failed";
    try {
      const body = (await proxied.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* keep default */
    }
    const err = new Error(message) as Error & { status: number };
    err.status = proxied.status === 400 ? 400 : 502;
    throw err;
  }
  const bytes = Buffer.from(await proxied.arrayBuffer());
  if (!bytes.byteLength) {
    const err = new Error("Upstream image was empty") as Error & { status: number };
    err.status = 502;
    throw err;
  }
  const contentType = proxied.headers.get("content-type") || "image/jpeg";
  const hash = createHash("sha256").update(inspected.url.href).digest("hex").slice(0, 20);
  const pathname = `listings/${hash}.${extFor(contentType)}`;
  const { put } = await import("@vercel/blob");
  const stored = await put(pathname, bytes, {
    access: "public",
    token,
    contentType,
    addRandomSuffix: true,
  });
  return { ok: true, url: stored.url };
}
