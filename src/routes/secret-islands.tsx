import { createFileRoute } from "@tanstack/react-router";
import { LANGS, SEO_META } from "@/components/secret-islands/content";
import { validateLangSearch } from "@/components/secret-islands/lang-context";
import { SecretIslandsPage } from "@/components/secret-islands/page";
import { BRAND_HEAD_LINKS, LANDING_PATH, ROBOTS_LARGE_IMAGES, landingJsonLd, langLinks, pageUrl, socialMeta } from "@/components/secret-islands/seo";
import { translate } from "@/components/secret-islands/store";

/** Every page text is translated (zh/ko/ja via i18n dictionaries), so all five languages get their own URL. */
const LANDING_LANGS = LANGS.map((l) => l.id);

export const Route = createFileRoute("/secret-islands")({
  // `?lang=en|zh|ko|ja` = language-addressable URL (German default has no parameter). SSR renders that language.
  validateSearch: validateLangSearch,
  head: ({ match }) => {
    const lang = match.search.lang ?? "de";
    const title = translate(SEO_META.title, lang);
    const description = translate(SEO_META.description, lang);
    const url = pageUrl(LANDING_PATH, lang);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "theme-color", content: "#0a192f" },
        ROBOTS_LARGE_IMAGES,
        ...socialMeta({ title, description, url, image: "/images/krabi-secret-islands-privates-speedboat.jpg", type: "website", lang }),
        { "script:ld+json": landingJsonLd(lang) },
      ],
      links: [...langLinks(LANDING_PATH, lang, LANDING_LANGS), ...BRAND_HEAD_LINKS],
    };
  },
  component: SecretIslandsRoute,
});

function SecretIslandsRoute() {
  const { lang } = Route.useSearch();
  return <SecretIslandsPage urlLang={lang} />;
}
