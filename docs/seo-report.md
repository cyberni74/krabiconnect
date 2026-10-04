# SEO report – /secret-islands + Krabi Insider Guide (2026-10-04)

No SEO skill was installed, so this report follows Google Search Central. Google docs could not be fetched from the sandbox and were checked through search results instead.
Verification: `tsc --noEmit` passes. ESLint on all changed files: 0 errors (react-refresh warnings only). Every sitemap URL (51) was fetched from SSR and checked with a script: status 200, exactly 1 H1, self canonical, exactly 1 JSON-LD block that passes `JSON.parse`, exactly 1 FAQPage where a FAQ is visible (0 on the hub), every FAQ question and answer present in the HTML, no microdata left, title ≤ 65 / description 110–165 characters. Playwright at 390×844 and 1366×860 (landing DE, `?lang=ko&utm_source=…`, guide article, hub `?lang=en`): no console errors, horizontal overflow 0, CLS 0.000 on load. Screenshots are in `/tmp/claude-0/shots/seo-*.png`.

## Checklist

| # | Item | Status | Where / note |
|---|---|---|---|
| 1 | Content in SSR HTML (H1, body, tours, FAQ answers) | ✅ | All 14 tours, both FAQ blocks and all guide sections are in the SSR HTML. The regular FAQ used to render only the open answer; all answers are now in the DOM (`sections-bottom.tsx:716`). |
| 1 | No accidental noindex, status 200 | ✅ | Only unknown guide slugs get 404 + noindex (`krabi-guide.$slug.tsx`). |
| 1 | Unique self canonical per URL | ✅ | `seo.ts` `langLinks()`. The landing page had no canonical before. |
| 1 | Internal links are `<a href>` | ✅ | Guide: real `<Link>`s that keep `?lang`. Landing: added 8 deep links to guide articles (`sections-bottom.tsx:38`). Tour, landing-article and lightbox cards still open modals (button-only), which is acceptable because the modal content has no URL of its own. |
| 2 | robots.txt | ✅ | `src/routes/robots[.]txt.ts`: allows everything; disallows only `/api/auth/`, `/api/agent`, `/admin`, `/account`, `/chats`; references the sitemap. Marketplace routes are untouched. |
| 2 | sitemap.xml with lastmod + hreflang | ✅ | `src/routes/sitemap[.]xml.ts`: 51 URLs (landing ×5 languages, hub ×2, 22 articles ×2) with absolute `https://krabi-secret-islands.com` URLs and `xhtml:link` alternates. |
| 3 | Unique titles/descriptions, one H1, H2/H3 | ✅ | All 51 URLs have unique titles and descriptions (zh/ko/ja are translated; CJK descriptions are 89–109 characters, which is fine because CJK characters are about twice as wide). |
| 4 | TravelAgency (LocalBusiness) | ⚠️ | `seo.ts` `businessNode()`: name, url, logo, email, address (Ao Nang, Krabi, TH), areaServed, priceRange from TOURS. Left out because unconfirmed: telephone (WhatsApp number is a placeholder), streetAddress/geo, sameAs, real photo. All are marked TODO(owner). |
| 4 | TouristTrip + THB offers | ✅ | 14 trips with itinerary (visible stops), provider, `Offer{price, THB, "per boat"}`. |
| 4 | Exactly one FAQPage | ✅ | Landing: LongtailFaq microdata removed; one JSON-LD FAQPage combines Longtail + regular FAQ (`longtailAnswerText`). Articles: FAQPage from the visible `<details>` FAQ. Note: Google stopped showing FAQ rich results on 7 May 2026, so the markup is valid but brings no SERP feature. |
| 4 | BlogPosting + BreadcrumbList / CollectionPage + ItemList | ✅ | Breadcrumb names and URLs match the visible breadcrumb. datePublished = dateModified = GUIDE_UPDATED (set real per-article dates later). |
| 4 | No fake ratings | ✅ / ❌ content | No AggregateRating/Review markup. **But the page shows unverified claims:** hero stats "4.9 Ø Bewertung / 1.200+ Private Touren" (`content.ts:101`), placeholder reviews, and **"TAT Lizenz Nr. 34/01234"** (`content.ts:166`), which looks like a placeholder licence number. Replace with real data or remove before launch (trust and legal risk). |
| 5 | LCP image priority | ✅ | `priority` prop, which sets eager + `fetchpriority="high"` (`ui.tsx:64`, `guide-ui.tsx:58`): landing hero (`sections-top.tsx:279`), article hero, hub featured image. Added a preconnect to images.unsplash.com. |
| 5 | CLS | ✅ | All images sit in aspect-ratio or absolutely positioned boxes. Measured CLS 0. |
| 5 | Lazy below the fold | ✅ | SmartImage/GuideImage lazy by default. |
| 5 | Responsive sizes | ✅ | Automatic `srcSet` 480–1920w for Unsplash URLs plus `sizes` on card grids (`ui.tsx:13`), so phones no longer load 1200–1800 px files. |
| 5 | Fonts | ✅ | Google Fonts with `display=swap`. |
| 5 | Mobile blur/INP | ✅ | `styles.css:156`: below 768px, glass blur drops from 18→10px and 28→16px, and the scroll-scrubbed `filter: blur()` of ScrollScene is turned off (`.si-scene`, set in `fx.tsx`). The look is the same. ⚠️ The hero still loads an HD Pexels video on mobile. Consider skipping it below 768px (design decision). |
| 6 | Alt texts | ✅ | Tours, guide images and cards are descriptive. Hero and landing-article teasers use `alt=""` (decorative, text next to them). |
| 6 | Formats | ⚠️ | Unsplash `auto=format` serves WebP/AVIF. The logo is a PNG on cloudfront, and brand images are not yet in `/public/images` (see `docs/brand-assets.md`). |
| 7 | Language URLs + hreflang + x-default | ✅ | `?lang=` per page, SSR-rendered in that language without touching the zustand singleton (`lang-context.ts`, `lang.tsx`, `useLang()` at `store.ts:105`). Details: `docs/seo-plan.md`. |
| 7 | Localised titles | ✅ | Localised in all 5 languages (`SEO_META`; the translation agents added the zh/ko/ja keys, `extract.ts --missing` = 0). Guide: DE/EN. |
| 7 | `<html lang>` in SSR | ❌ | `__root.tsx:64` always outputs `lang="en"` (outside the SEO scope). Patch proposed in seo-plan §3. |
| 7 | Auto-detection on the default URL | ❌ (decision) | Googlebot (en-US) probably renders the German URL in English. Recommendation in seo-plan §2. |
| 8 | Spam policies | ✅ | No hidden text (collapsed accordions are fine), no doorway pages; the `?lang` variants are real translations. Guide content is unique and long-form. |

## Changes
- New: `src/routes/robots[.]txt.ts`, `src/routes/sitemap[.]xml.ts`, `src/components/secret-islands/seo.ts` (URLs, hreflang, social meta, JSON-LD builders), `lang-context.ts`, `lang.tsx`.
- Routes `secret-islands.tsx`, `krabi-guide.index.tsx`, `krabi-guide.$slug.tsx`: `validateSearch`, localised title/description, canonical, hreflang, OG/Twitter, JSON-LD.
- `content.ts`: `SEO_META` (landing title/description, translatable). `articles.ts`: `SITE_URL` re-exported from seo.ts.
- `store.ts`: `useLang()` (context-aware); `useTx` uses it. `page.tsx`, `guide-ui.tsx`, `guide-helpers.ts`: LangBoundary/useLang instead of reading the store directly; switchers update the URL.
- `sections-bottom.tsx`: microdata removed, FAQ answers always rendered, guide deep links. `ui.tsx` / `guide-ui.tsx`: `priority`, srcSet/sizes. `fx.tsx`: `si-scene` class. `styles.css`: mobile blur rules.

## Open
1. Invalid or redundant `?lang=` values (`xx`, `de`, empty) are redirected by the router with a 307 to the clean URL; utm parameters are kept. A 301 would be cleaner but is not critical.
2. Owner: real TAT licence number, WhatsApp number, street address, sameAs profiles, real reviews/stats, logo and photos under the own domain.
3. Lead: decisions in `docs/seo-plan.md` §2 (auto-detection), §3 (`__root` html lang), §5 (domain root shows the marketplace).
4. Platform: the PWA injector replaces all og:/twitter: tags on HTML responses (seo-plan §6).
5. After deploy: submit the sitemap in Search Console, test with the Rich Results Test and URL Inspection (rendered HTML language of `/secret-islands`).
