/**
 * Domains that serve CAPTAIN TIDE only. On these hosts every page outside
 * /tide leads to the tide app; the marketplace is not shown.
 */
export const TIDE_ONLY_HOSTS: ReadonlySet<string> = new Set(["cyberni.de", "www.cyberni.de"]);

/** Reduce a Host / X-Forwarded-Host value to a bare lower-case hostname. */
export function normalizeHost(raw: string | null | undefined): string {
  return (raw ?? "").split(",")[0].trim().toLowerCase().split(":")[0];
}

export function isTideOnlyHost(raw: string | null | undefined): boolean {
  return TIDE_ONLY_HOSTS.has(normalizeHost(raw));
}

export function isTidePath(pathname: string): boolean {
  return pathname === "/tide" || pathname.startsWith("/tide/");
}
