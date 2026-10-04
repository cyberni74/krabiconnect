import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Clock, Mail, MapPin, Minus, Plus, Quote, Search, ShieldCheck, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ARTICLES, BRAND, FAQ, REVIEWS, UI } from "./content";
import { translate, useSI, useTx, waLink } from "./store";
import { BrandMark, Reveal, SectionHeading, SmartImage, WhatsAppIcon } from "./ui";

export function Guide() {
  const { t, tl, lang } = useTx();
  const openArticle = useSI((s) => s.openArticle);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const cats = useMemo(() => {
    const seen = new Map<string, string>();
    ARTICLES.forEach((a) => seen.set(a.category.de, translate(a.category, lang)));
    return [...seen.entries()];
  }, [lang]);

  const list = ARTICLES.filter((a) => {
    if (cat !== "all" && a.category.de !== cat) return false;
    if (!q.trim()) return true;
    const hay = `${t(a.title)} ${t(a.excerpt)} ${tl(a.body).join(" ")}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  return (
    <section id="guide" className="scroll-mt-16 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow={t(UI.guideEyebrow)} title={t(UI.guideTitle)} sub={t(UI.guideSub)} />

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative block md:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t(UI.searchPlaceholder)}
              className="h-12 w-full rounded-2xl bg-si-white pl-11 pr-4 text-base text-si-navy ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-si-cyan"
            />
          </label>
          <div className="hide-scroll -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            {[["all", t({ de: "Alle", en: "All" })] as const, ...cats].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCat(id)}
                className={cn(
                  "h-11 shrink-0 rounded-full px-4 text-sm font-bold transition",
                  cat === id ? "bg-si-navy text-white" : "bg-si-white text-si-slate ring-1 ring-slate-200",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <p className="rounded-2xl bg-si-white p-8 text-center text-si-slate">{t(UI.noResults)}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {list.map((a, i) => (
                <motion.button
                  layout
                  key={a.id}
                  type="button"
                  onClick={() => openArticle(a.id)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="group flex gap-4 rounded-3xl bg-si-white p-3 text-left ring-1 ring-slate-200 transition hover:shadow-xl hover:ring-si-cyan sm:flex-col sm:p-0 sm:overflow-hidden"
                >
                  <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl sm:aspect-[16/9] sm:size-auto sm:w-full sm:rounded-none">
                    <SmartImage
                      src={a.image}
                      alt=""
                      className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 hidden rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-si-cyan-dark sm:block">
                      {t(a.category)}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col py-1 sm:p-5 sm:pt-1">
                    <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <span className="text-si-cyan-dark sm:hidden">{t(a.category)} ·</span>
                      <Clock className="size-3" /> {a.minutes} {t(UI.minRead)}
                    </p>
                    <h3 className="line-clamp-3 text-[15px] font-extrabold leading-snug text-si-navy sm:text-lg">
                      {t(a.title)}
                    </h3>
                    <p className="mt-1.5 hidden text-sm leading-relaxed text-si-slate sm:line-clamp-2">{t(a.excerpt)}</p>
                    <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-bold text-si-cyan-dark">
                      {t(UI.readMore)} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

export function Reviews() {
  const { t } = useTx();
  return (
    <section className="overflow-hidden bg-si-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow={t(UI.reviewsEyebrow)} title={t(UI.reviewsTitle)} />
        <div className="mb-6 -mt-3 flex items-center gap-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-5 fill-si-gold text-si-gold" />
            ))}
          </div>
          <p className="text-sm font-semibold text-si-slate">
            4.9 / 5 · {t({ de: "aus 380+ Bewertungen", en: "from 380+ reviews" })}
          </p>
        </div>
        <div className="hide-scroll -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-2 md:px-0 lg:grid-cols-4">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.08} className="w-[85%] shrink-0 snap-center sm:w-[55%] md:w-auto">
              <figure className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200">
                <Quote className="mb-3 size-7 text-si-cyan" />
                <div className="mb-3 flex">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="size-4 fill-si-gold text-si-gold" />
                  ))}
                </div>
                <blockquote className="flex-1 text-[15px] leading-relaxed text-si-slate">“{t(r.text)}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-si-cyan to-si-cyan-dark font-bold text-white">
                    {r.name.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-si-navy">
                      {r.name} <span className="font-medium text-slate-500">· {t(r.origin)}</span>
                    </span>
                    <span className="block truncate text-xs font-semibold text-si-cyan-dark">
                      {t(r.type)} · {t(r.tour)}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { t } = useTx();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-16 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading eyebrow={t(UI.faqEyebrow)} title={t(UI.faqTitle)} center />
        <div className="space-y-3">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q.de}
                className={cn(
                  "overflow-hidden rounded-2xl ring-1 transition",
                  isOpen ? "bg-si-white ring-si-cyan" : "bg-white ring-slate-200",
                )}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex min-h-14 w-full items-center gap-4 px-5 py-4 text-left"
                >
                  <span className="flex-1 font-bold text-si-navy">{t(f.q)}</span>
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full transition",
                      isOpen ? "bg-si-cyan text-si-navy" : "bg-slate-100 text-si-slate",
                    )}
                  >
                    {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-5 pb-5 text-[15px] leading-relaxed text-si-slate">{t(f.a)}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  const { t, tOp } = useTx();
  const openInquiry = useSI((s) => s.openInquiry);
  return (
    <section className="bg-white px-4 pb-16 sm:pb-24">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-si-cyan-dark via-si-navy to-si-navy p-8 text-center sm:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-si-cyan/30 blur-3xl" />
        <h2 className="relative mx-auto max-w-2xl text-2xl font-extrabold text-white sm:text-4xl">{t(UI.finalTitle)}</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-slate-300">{t(UI.finalSub)}</p>
        <div className="relative mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => openInquiry()}
            className="h-14 rounded-2xl bg-si-cyan px-7 font-bold text-si-navy shadow-xl shadow-si-cyan/30 transition hover:bg-white"
          >
            {t(UI.ctaInquire)}
          </button>
          <a
            href={waLink(tOp({ de: "Hallo! Ich habe eine Frage zu Ihren Touren.", en: "Hi! I have a question about your tours." }))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-si-wa px-7 font-bold text-white"
          >
            <WhatsAppIcon className="size-5" /> {t(UI.ctaWhatsapp)}
          </a>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  const { t, tOp } = useTx();
  const [legal, setLegal] = useState<"imprint" | "privacy" | null>(null);
  return (
    <footer className="bg-si-navy pb-28 pt-14 text-slate-300 md:pb-10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2 text-lg font-extrabold text-white">
            <BrandMark className="size-11" />
            Krabi <span className="-ml-1 text-si-cyan">Secret</span> Islands
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">{t(UI.footerTagline)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-si-gold/15 px-3 py-1.5 text-xs font-bold text-si-gold ring-1 ring-si-gold/30">
              <BadgeCheck className="size-4" /> {t(UI.tat)}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-si-cyan/15 px-3 py-1.5 text-xs font-bold text-si-cyan ring-1 ring-si-cyan/30">
              <ShieldCheck className="size-4" /> {t(UI.marine)}
            </span>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-white">{t(UI.contact)}</p>
          <ul className="space-y-1 text-sm">
            <li>
              <a
                href={waLink(tOp({ de: "Hallo Krabi Secret Islands!", en: "Hi Krabi Secret Islands!" }))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-2 hover:text-white"
              >
                <WhatsAppIcon className="size-4 text-si-wa" /> {BRAND.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${BRAND.email}`} className="flex min-h-11 items-center gap-2 hover:text-white">
                <Mail className="size-4 text-si-cyan" /> {BRAND.email}
              </a>
            </li>
            <li className="flex min-h-11 items-center gap-2">
              <MapPin className="size-4 text-si-gold" /> {t(BRAND.location)}
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Legal</p>
          <ul className="space-y-1 text-sm">
            <li>
              <button type="button" onClick={() => setLegal(legal === "imprint" ? null : "imprint")} className="min-h-11 hover:text-white">
                {t(UI.imprint)}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setLegal(legal === "privacy" ? null : "privacy")} className="min-h-11 hover:text-white">
                {t(UI.privacy)}
              </button>
            </li>
          </ul>
          {legal ? (
            <p className="mt-2 rounded-xl bg-white/5 p-3 text-xs leading-relaxed">
              {legal === "imprint"
                ? t({
                    de: `Krabi Secret Islands Co., Ltd. · Ao Nang, Mueang Krabi, 81180 Thailand · ${BRAND.email}`,
                    en: `Krabi Secret Islands Co., Ltd. · Ao Nang, Mueang Krabi, 81180 Thailand · ${BRAND.email}`,
                  })
                : t({
                    de: "Anfragedaten werden ausschließlich zur Bearbeitung Ihrer Buchung verwendet und nicht an Dritte weitergegeben. Diese Seite speichert nur Ihre Spracheinstellung lokal.",
                    en: "Inquiry data is used solely to process your booking and never shared with third parties. This site only stores your language preference locally.",
                  })}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 px-4 pt-6 text-xs leading-relaxed text-slate-400">
        <p>{t(UI.legalNote)}</p>
        <p className="mt-2">
          © {new Date().getFullYear()} {BRAND.name} · {BRAND.domain}
        </p>
      </div>
    </footer>
  );
}
