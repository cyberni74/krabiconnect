import { useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LANGS, type Lang } from "./content";
import { LangOverrideContext, parseLang } from "./lang-context";
import { detectLang, useLang, useSI } from "./store";

/** Client-only flag: the store language has been initialised once in this browser tab (never set on the server). */
let clientLangReady = false;

/**
 * Makes the page render in the URL language (`?lang=`) on the server and during hydration,
 * then hands over to the client store.
 * - URL has `?lang=xx` → that language wins (no auto-detection, so crawlers see a stable language per URL).
 * - No parameter → previous behaviour: saved choice → browser language (first load only).
 */
export function LangBoundary({ urlLang, children }: { urlLang?: Lang; children: ReactNode }) {
  const [settled, setSettled] = useState(() => clientLangReady && !urlLang);

  useEffect(() => {
    const s = useSI.getState();
    const next = urlLang ?? (clientLangReady ? s.lang : detectLang());
    clientLangReady = true;
    if (next !== s.lang) useSI.setState({ lang: next });
    setSettled(true);
  }, [urlLang]);

  return <LangOverrideContext.Provider value={settled ? null : (urlLang ?? "de")}>{children}</LangOverrideContext.Provider>;
}

/** Language from the current URL (`?lang=`), undefined for the German default URL. */
export function useUrlLang(): Lang | undefined {
  return useRouterState({ select: (s) => parseLang((s.location.search as Record<string, unknown>).lang) });
}

/** Switch language and keep the URL language-addressable (`?lang=en`, German = no parameter). */
export function useSwitchLang() {
  const router = useRouter();
  const setLang = useSI((s) => s.setLang);
  return (l: Lang) => {
    setLang(l);
    const loc = router.state.location;
    const params = new URLSearchParams(loc.searchStr);
    if (l === "de") params.delete("lang");
    else params.set("lang", l);
    const qs = params.toString();
    const href = `${loc.pathname}${qs ? `?${qs}` : ""}${loc.hash ? `#${loc.hash}` : ""}`;
    if (href !== loc.href) void router.navigate({ href, replace: true, resetScroll: false });
  };
}

/** Keeps <html lang> in sync with the visible language (the SSR <html> tag comes from __root). */
export function useHtmlLang() {
  const lang = useLang();
  useEffect(() => {
    document.documentElement.lang = LANGS.find((l) => l.id === lang)?.html ?? lang;
  }, [lang]);
}
