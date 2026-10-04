import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { LOGO_URL } from "@/components/secret-islands/content";
import { SITE_URL, getArticle } from "@/components/krabi-guide/articles";
import { GuideArticlePage } from "@/components/krabi-guide/guide-article";
import { GuideShell } from "@/components/krabi-guide/guide-ui";
import { btn } from "@/components/secret-islands/fx";

export const Route = createFileRoute("/krabi-guide/$slug")({
  // Only the slug crosses the wire – the article text is bundled, so it is not duplicated in the hydration payload.
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { slug: article.slug };
  },
  head: ({ loaderData }) => {
    const a = loaderData ? getArticle(loaderData.slug) : undefined;
    return {
      meta: [
        { title: a ? a.title.de : "Artikel nicht gefunden – Krabi Insider Guide" },
        ...(a ? [{ name: "description", content: a.metaDescription.de }] : [{ name: "robots", content: "noindex" }]),
        { name: "theme-color", content: "#0a192f" },
      ],
      links: [
        ...(a ? [{ rel: "canonical", href: `${SITE_URL}/krabi-guide/${a.slug}` }] : []),
        { rel: "icon", type: "image/png", href: LOGO_URL },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
        },
      ],
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
