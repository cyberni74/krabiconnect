import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { CATEGORY_LABEL, getArticle, readyGuideImages } from "@/components/krabi-guide/articles";
import { GuideArticlePage } from "@/components/krabi-guide/guide-article";
import { GuideShell } from "@/components/krabi-guide/guide-ui";
import { btn } from "@/components/secret-islands/fx";
import { validateLangSearch } from "@/components/secret-islands/lang-context";
import { BRAND_HEAD_LINKS, GUIDE_PATH, ROBOTS_LARGE_IMAGES, guideArticleJsonLd, langLinks, pageUrl, socialMeta } from "@/components/secret-islands/seo";

export const Route = createFileRoute("/krabi-guide/$slug")({
  // Guide texts exist in German + English: `?lang=en` is the English URL; zh/ko/ja show the English text and canonicalise to it.
  validateSearch: validateLangSearch,
  // Only the slug crosses the wire – the article text is bundled, so it is not duplicated in the hydration payload.
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { slug: article.slug };
  },
  head: ({ loaderData, match }) => {
    const a = loaderData ? getArticle(loaderData.slug) : undefined;
    if (!a) {
      return {
        meta: [
          { title: "Artikel nicht gefunden – Krabi Insider Guide" },
          { name: "robots", content: "noindex" },
          { name: "theme-color", content: "#0a192f" },
        ],
        links: BRAND_HEAD_LINKS,
      };
    }
    const lang = match.search.lang && match.search.lang !== "de" ? "en" : "de";
    const path = `${GUIDE_PATH}/${a.slug}`;
    const title = a.title[lang];
    const description = a.metaDescription[lang];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "theme-color", content: "#0a192f" },
        ROBOTS_LARGE_IMAGES,
        ...socialMeta({ title, description, url: pageUrl(path, lang), image: a.image, type: "article", lang }),
        { property: "article:modified_time", content: a.updated },
        { "script:ld+json": guideArticleJsonLd(lang, { ...a, gallery: readyGuideImages(a).map((i) => i.src) }, CATEGORY_LABEL[a.category][lang]) },
      ],
      links: [...langLinks(path, lang, ["de", "en"]), ...BRAND_HEAD_LINKS],
    };
  },
  component: ArticleRoute,
  notFoundComponent: ArticleNotFound,
});

function ArticleRoute() {
  const { slug } = Route.useLoaderData();
  const article = getArticle(slug)!;
  return <GuideArticlePage article={article} />;
}

function ArticleNotFound() {
  return (
    <GuideShell>
      <section className="mx-auto max-w-2xl px-4 pb-10 pt-32 text-center">
        <h1 className="text-3xl font-extrabold">Artikel nicht gefunden</h1>
        <p className="mt-3 text-slate-300">
          Dieser Artikel existiert nicht (mehr). Im Insider Guide finden Sie alle Artikel zu Krabis Inseln. / This
          article doesn’t exist – browse all articles in the Insider Guide.
        </p>
        <Link to="/krabi-guide" className={`${btn.primary} mt-6`}>
          Krabi Insider Guide
        </Link>
      </section>
    </GuideShell>
  );
}
