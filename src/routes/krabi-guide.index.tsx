import { createFileRoute } from "@tanstack/react-router";
import { ARTICLES, getArticle, FEATURED_SLUG } from "@/components/krabi-guide/articles";
import { GuideHub } from "@/components/krabi-guide/guide-hub";
import { validateLangSearch } from "@/components/secret-islands/lang-context";
import { BRAND_HEAD_LINKS, GUIDE_PATH, ROBOTS_LARGE_IMAGES, guideHubJsonLd, langLinks, pageUrl, socialMeta } from "@/components/secret-islands/seo";

const HUB_META = {
  title: {
    de: "Krabi Insider Guide – Inseln, Geheimtipps & Reisewissen",
    en: "Krabi Insider Guide – Islands, Hidden Gems & Travel Tips",
  },
  description: {
    de: "Krabi Insider Guide: alle Inseln von Koh Poda bis Koh Roi, beste Reisezeit, Gezeiten, Schnorchelspots, Lagunen und Timing-Tipps lokaler Kapitäne aus Ao Nang.",
    en: "Krabi Insider Guide: every island from Koh Poda to Koh Roi, best time to visit, tides, snorkel spots, lagoons and timing tips from local captains in Ao Nang.",
  },
};

export const Route = createFileRoute("/krabi-guide/")({
  // Guide texts exist in German + English: `?lang=en` is the English URL; zh/ko/ja show the English text and canonicalise to it.
  validateSearch: validateLangSearch,
  head: ({ match }) => {
    const lang = match.search.lang && match.search.lang !== "de" ? "en" : "de";
    const title = HUB_META.title[lang];
    const description = HUB_META.description[lang];
    const url = pageUrl(GUIDE_PATH, lang);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "theme-color", content: "#0a192f" },
        ROBOTS_LARGE_IMAGES,
        ...socialMeta({ title, description, url, image: getArticle(FEATURED_SLUG)?.image, type: "website", lang }),
        { "script:ld+json": guideHubJsonLd(lang, { title, description }, ARTICLES) },
      ],
      links: [...langLinks(GUIDE_PATH, lang, ["de", "en"]), ...BRAND_HEAD_LINKS],
    };
  },
  component: GuideHub,
});
