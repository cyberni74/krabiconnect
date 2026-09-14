export function env(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

/**
 * Workspace preview vs deployed app. The deployer writes GROK_PROJECT_ID on
 * every publish; the sandbox preview never has it. Single source of truth for
 * the split — gate audience, gate endpoints and connector-token semantics all
 * key off this predicate.
 */
export function isWorkspacePreview(): boolean {
  return !env("GROK_PROJECT_ID");
}

/**
 * Image hosting (optional):
 * - SITE_URL — public origin for owned listing photos, e.g. https://your-app.vercel.app
 *   Used by toOwnedImageUrl as `${SITE_URL}/api/img?u=…`. Falls back to
 *   VITE_PUBLIC_HOSTNAME / VERCEL_URL; empty origin yields a relative `/api/img` path.
 * - BLOB_READ_WRITE_TOKEN — Vercel Blob read-write token for POST /api/agent/rehost.
 *   When unset, rehost returns 503. GET /api/img still works without Blob.
 */
