import { createContext } from "react";
import { LANGS, type Lang } from "./content";

/**
 * Per-render language override used for SSR and the first (hydrating) client render.
 *
 * The zustand store (`useSI`) is a module singleton – on the server it is shared by every request,
 * so the URL language (`?lang=en`) must NEVER be written into it there. Instead the route passes the
 * language down through this context; `useLang()` / `useTx()` prefer it over the store.
 * After mount, `<LangBoundary>` copies the language into the (client-only) store and clears the override.
 */
export const LangOverrideContext = createContext<Lang | null>(null);

const SUPPORTED = new Set<string>(LANGS.map((l) => l.id));

/** Validate a `?lang=` search value. `undefined` = no (valid) language in the URL. */
export function parseLang(v: unknown): Lang | undefined {
  return typeof v === "string" && SUPPORTED.has(v) ? (v as Lang) : undefined;
}

/** Search schema shared by /secret-islands and the Insider Guide routes. German (default) has no parameter. */
export function validateLangSearch(search: Record<string, unknown>): { lang?: Lang } {
  const lang = parseLang(search.lang);
  // Explicit `undefined`: the router merges the raw (root) search under the validated one, so omitting the key
  // would let an invalid raw value like `?lang=xx` leak into `match.search`.
  return { lang: lang && lang !== "de" ? lang : undefined };
}

/** `<Link search={keepLang}>` – carries the current `?lang=` over to internal links (crawlable language versions). */
export function keepLang(prev: Record<string, unknown>): { lang?: Lang } {
  return validateLangSearch(prev);
}
