/** Builder chrome ("Created with Grok" / Remix) is preview-only. */

function envOn(value: unknown): boolean {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

function hostnameOf(host: string): string {
  return String(host ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
}

/**
 * Hide Grok/Remix chrome on published standalone apps.
 * Preview (localhost / sandbox) keeps the badge.
 */
export function shouldHideGrokChrome(
  host = typeof window !== "undefined" ? window.location.hostname : "",
): boolean {
  if (envOn(import.meta.env.VITE_STANDALONE) || envOn(import.meta.env.VITE_HIDE_GROK_CHROME)) {
    return true;
  }
  return hostnameOf(host).endsWith(".grok.me");
}
