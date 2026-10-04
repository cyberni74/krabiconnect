/** Types for the Krabi Insider Guide (/krabi-guide). Bilingual source: German + English. */
export type Bi = { de: string; en: string };
export type BiList = { de: string[]; en: string[] };

export type GuideCategory = "pillar" | "island" | "insider";

export type GuideSection = {
  /** Anchor id (English kebab-case). Generated from the English H2 when omitted. */
  id?: string;
  h2: Bi;
  body: BiList;
  /** Insider tip box. */
  tip?: Bi;
  list?: BiList;
};

export type GuideArticleInput = {
  slug: string;
  category: GuideCategory;
  /** Short label for island quick-nav and cards. */
  short: Bi;
  primaryKeyword: string;
  keywords: string[];
  title: Bi;
  metaDescription: Bi;
  h1: Bi;
  intro: Bi;
  sections: GuideSection[];
  faq: { q: Bi; a: Bi }[];
  related: string[];
  tourIds: string[];
  image: string;
  /**
   * Optional photo gallery. `src` is the final licensed file (e.g. /images/guide/<seo-name>.webp);
   * `fallback` (an IMG.* url) is shown until that file exists.
   */
  images?: GuideImage[];
};

export type GuideImage = { src: string; fallback: string; alt: Bi };

export type GuideArticle = GuideArticleInput & {
  sections: (GuideSection & { id: string })[];
  readingMinutes: number;
  updated: string;
};
