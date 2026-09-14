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
 * - SITE_URL — optional public origin. Listing heroes use a relative `/api/img?u=`
 *   so they load on the Vercel host even if this domain is parked / not attached.
 * - BLOB_READ_WRITE_TOKEN — Vercel Blob read-write token for POST /api/agent/rehost.
 *   When unset, rehost returns 503. GET /api/img still works without Blob.
 */
