# SEO plan – language URLs & open decisions (Secret Islands + Insider Guide)

Status 2026-10-04. Part 1 is implemented; parts 2–6 need a decision by the lead/owner.

## 1. Language-addressable URLs (IMPLEMENTED, `?lang=`)

| Page | German (default, x-default) | Other languages |
|---|---|---|
| `/secret-islands` | `/secret-islands` | `?lang=en`, `?lang=zh` (hreflang `zh-Hans`), `?lang=ko`, `?lang=ja` |
| `/krabi-guide`, `/krabi-guide/$slug` | no parameter | `?lang=en` only (guide text exists in DE + EN). `?lang=zh/ko/ja` still works for visitors (UI chrome translated, body English) but its canonical points to `?lang=en`. |

How it works (SSR-safe):
- Routes use `validateSearch: validateLangSearch` (`src/components/secret-islands/lang-context.ts`). `?lang=de` and invalid values are dropped, so German has a single URL.
- The server **never** writes the language into the zustand singleton. The route passes `urlLang` to `<LangBoundary>` (`lang.tsx`), which provides it through `LangOverrideContext`. `useLang()` / `useTx()` (store.ts) prefer that context, so SSR and hydration render the URL language. After mount the boundary copies the language into the client store and removes the override.
- If the URL has `?lang=`, there is no auto-detection. That keeps one language per URL.
- The language switchers (`LangMenu`, guide header) call `useSwitchLang()`. It updates the store and replaces the URL (`?lang=xx`, German = no parameter) without scrolling, so `<head>` (title, canonical, hreflang) re-renders as well.
- Internal `<Link>`s use `search={keepLang}`, so crawlers moving through `?lang=en` pages stay in English.
- Every page has a self-referencing canonical and reciprocal hreflang alternates plus `x-default`. The sitemap lists the same alternates.
- Other query parameters (utm_*) are kept (checked with Playwright).

## 2. DECISION NEEDED – auto-detection on the German default URL
Today, `/secret-islands` without `?lang` switches to the browser language after hydration. Googlebot renders with an en-US browser and crawls without `Accept-Language` (Google: "How Google crawls locale-adaptive pages"). So Google most likely sees **English content on the URL that hreflang declares as German**. Playwright with an English locale reproduces this.
- **Option A (recommended):** on the default URL, only restore an explicitly *saved* choice (localStorage). If the browser language is not German, show a small non-blocking banner ("This page is available in English → switch") that links to `?lang=en` and does not switch automatically. This is Google's documented recommendation: don't redirect or adapt automatically by perceived language.
  Patch: in `LangBoundary`, replace `detectLang()` with a `savedLang()` (localStorage only) and render `<LangSuggestion lang={browserLang} />` when they differ.
- **Option B:** keep today's behaviour and accept the risk that the German page is indexed as English.

## 3. DECISION NEEDED – `<html lang>` in SSR (`src/routes/__root.tsx`, not owned by the SEO agent)
The root always renders `<html lang="en">`. An inline script then sets `th`/`en` from the marketplace cookie, and only the page effect corrects it. Google ignores the `lang` attribute for language detection, but it matters for accessibility and other search engines. Proposed patch in `Root()`:
```tsx
const loc = useRouterState({ select: (s) => s.location });
const si = loc.pathname.startsWith("/secret-islands") || loc.pathname.startsWith("/krabi-guide");
const siLang = (loc.search as { lang?: string }).lang ?? "de";
<html lang={si ? (siLang === "zh" ? "zh-Hans" : siLang) : "en"} …>
// and render the marketplace lang <script> only when !si
```

## 4. OPTIONAL – subdirectories instead of `?lang=`
Google lists URL parameters (`site.com?loc=de`) as "not recommended" for locale URLs and prefers subdirectories (`/en/…`). Parameters with hreflang do work. A later move to `/en/secret-islands` (TanStack routes `en.secret-islands.tsx` or a `$lang` prefix with validation) would need 301s from `?lang=xx` and updated hreflang and sitemap. Do it only before the parameter URLs build up many links.

## 5. Domain root
`https://krabi-secret-islands.com/` serves the KrabiMarketplace app (title "KrabiMarketplace"). Google takes the site name, brand signals and most link equity from the home page. If the domain is meant to be the Secret Islands brand, `/` should be (or 301 to) `/secret-islands`, and `WebSite` structured data (site name) should go on `/`.

## 6. Platform limits
- The PWA injector (`scripts/grok-pwa-shared.mjs`) strips all `og:*` / `twitter:*` from HTML responses and adds its own card (`og:title` = page `<title>`, `og:image` = global card). The per-route OG tags are in place, but per-page share images need a platform setting. This does not affect Google ranking.
