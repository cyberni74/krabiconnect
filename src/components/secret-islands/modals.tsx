import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, Mail, MapPin, Minus, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ARTICLES, BRAND, EXTRAS, TOURS, UI, type ExtraId } from "./content";
import { formatTHB, useSI, useTx, waLink } from "./store";
import { Sheet, SmartImage, WhatsAppIcon, useLockBody } from "./ui";

export function TourModal() {
  const { t } = useTx();
  const tourId = useSI((s) => s.tourId);
  const close = useSI((s) => s.closeTour);
  const openInquiry = useSI((s) => s.openInquiry);
  const tour = TOURS.find((x) => x.id === tourId);

  return (
    <Sheet open={!!tour} onClose={close} label={tour ? t(tour.title) : ""} closeLabel={t(UI.close)}>
      {tour ? (
        <>
          <div className="overflow-y-auto">
            <div className="relative aspect-[16/10] shrink-0">
              <SmartImage src={tour.image} alt={t(tour.title)} className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-si-navy via-si-navy/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                {tour.badge ? (
                  <span className="mb-2 inline-block rounded-full bg-si-gold px-2.5 py-0.5 text-xs font-bold text-si-navy">
                    {t(tour.badge)}
                  </span>
                ) : null}
                <h3 className="text-2xl font-extrabold leading-tight">{t(tour.title)}</h3>
              </div>
            </div>
            <div className="space-y-6 p-5">
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-si-slate">
                <span className="flex items-center gap-1.5 rounded-xl bg-si-white px-3 py-2">
                  <Clock className="size-4 text-si-cyan-dark" /> {t(tour.duration)}
                </span>
                <span className="flex items-center gap-1.5 rounded-xl bg-si-white px-3 py-2">
                  {t(UI.from)} <b className="text-si-navy">{formatTHB(tour.price)}</b> {t(UI.perBoat)}
                </span>
              </div>
              <p className="leading-relaxed text-si-slate">{t(tour.description)}</p>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{t(UI.stops)}</p>
                <ol className="relative space-y-3 border-l-2 border-dashed border-si-cyan/40 pl-5">
                  {tour.stops.map((s) => (
                    <li key={s} className="relative font-bold text-si-navy">
                      <span className="absolute -left-[27px] top-0.5 grid size-4 place-items-center rounded-full bg-si-cyan ring-4 ring-white" />
                      <MapPin className="mr-1 inline size-4 text-si-cyan-dark" />
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{t(UI.included)}</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {tour.includes.map((inc) => (
                    <li key={inc.de} className="flex items-center gap-2 text-sm text-si-slate">
                      <Check className="size-4 shrink-0 text-si-cyan-dark" strokeWidth={3} /> {t(inc)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 p-4" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
            <button
              type="button"
              onClick={() => openInquiry(tour.id)}
              className="h-14 w-full rounded-2xl bg-si-cyan font-bold text-si-navy shadow-lg shadow-si-cyan/25 active:scale-[0.98]"
            >
              {t(UI.ctaInquire)}
            </button>
          </div>
        </>
      ) : null}
    </Sheet>
  );
}

export function ArticleModal() {
  const { t, lang } = useTx();
  const id = useSI((s) => s.articleId);
  const close = useSI((s) => s.closeArticle);
  const openInquiry = useSI((s) => s.openInquiry);
  const article = ARTICLES.find((a) => a.id === id);

  return (
    <Sheet open={!!article} onClose={close} label={article ? t(article.title) : ""} closeLabel={t(UI.close)} className="sm:max-w-2xl">
      {article ? (
        <div className="overflow-y-auto">
          <div className="relative aspect-[16/9]">
            <SmartImage src={article.image} alt="" className="absolute inset-0 size-full object-cover" />
          </div>
          <article className="p-5 sm:p-8" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold text-si-cyan-dark">
              {t(article.category)} <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="size-3" /> {article.minutes} {t(UI.minRead)}
              </span>
            </p>
            <h3 className="text-2xl font-extrabold leading-tight text-si-navy sm:text-3xl">{t(article.title)}</h3>
            <p className="mt-3 text-lg font-medium leading-relaxed text-si-slate">{t(article.excerpt)}</p>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-si-slate">
              {article.body[lang].map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <div className="mt-8 rounded-3xl bg-si-navy p-5 text-white">
              <p className="font-bold">{t({ de: "Lust auf genau diesen Tag?", en: "Fancy exactly this day?" })}</p>
              <p className="mt-1 text-sm text-slate-300">
                {t({
                  de: "Wir planen Ihre private Tour nach diesem Guide – inkl. Gezeiten & Timing.",
                  en: "We'll plan your private tour based on this guide – tides & timing included.",
                })}
              </p>
              <button
                type="button"
                onClick={() => openInquiry(article.tourId)}
                className="mt-4 min-h-14 w-full rounded-2xl bg-si-cyan px-4 py-3 font-bold text-si-navy active:scale-[0.98]"
              >
                {t(UI.articleCta)}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </Sheet>
  );
}

export function Lightbox() {
  const lb = useSI((s) => s.lightbox);
  const close = useSI((s) => s.closeLightbox);
  const setIndex = useSI((s) => s.setLightboxIndex);
  const { t } = useTx();
  const [dir, setDir] = useState(0);
  useLockBody(!!lb);

  const go = useCallback(
    (d: number) => {
      if (!lb) return;
      setDir(d);
      setIndex((lb.index + d + lb.items.length) % lb.items.length);
    },
    [lb, setIndex],
  );

  useEffect(() => {
    if (!lb) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb, close, go]);

  const item = lb?.items[lb.index];

  return (
    <AnimatePresence>
      {lb && item ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          className="fixed inset-0 z-[80] flex flex-col bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between gap-3 p-3" style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}>
            <p className="truncate pl-2 text-sm font-semibold text-white">
              {item.title}
              <span className="ml-2 text-white/50">
                {lb.index + 1}/{lb.items.length}
              </span>
            </p>
            <button
              type="button"
              onClick={close}
              aria-label={t(UI.close)}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 text-white"
            >
              <X className="size-6" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2">
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={lb.index}
                custom={dir}
                initial={{ opacity: 0, x: dir * 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -80 }}
                transition={{ duration: 0.25 }}
                drag={lb.items.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(1);
                  else if (info.offset.x > 60) go(-1);
                }}
                className="flex size-full items-center justify-center"
              >
                {item.video ? (
                  <LightboxVideo src={item.video} poster={item.src} />
                ) : (
                  <SmartImage
                    src={item.src.replace(/w=\d+/, "w=2000")}
                    alt={item.title}
                    eager
                    className="max-h-full max-w-full rounded-xl object-contain [&.si-fallback]:aspect-[4/3] [&.si-fallback]:w-full"
                  />
                )}
              </motion.div>
            </AnimatePresence>
            {lb.items.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous"
                  className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next"
                  className="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            ) : null}
          </div>
          {lb.items.length > 1 ? (
            <div
              className="hide-scroll flex justify-center gap-2 overflow-x-auto p-3"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
              {lb.items.map((it, i) => (
                <button
                  key={`${it.src}-${i}`}
                  type="button"
                  onClick={() => {
                    setDir(i > lb.index ? 1 : -1);
                    setIndex(i);
                  }}
                  aria-label={it.title}
                  className={cn(
                    "relative size-14 shrink-0 overflow-hidden rounded-xl ring-2 transition",
                    i === lb.index ? "ring-si-cyan" : "opacity-50 ring-transparent",
                  )}
                >
                  <SmartImage src={it.src.replace(/w=\d+/, "w=200")} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function LightboxVideo({ src, poster }: { src: string; poster: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="relative flex max-h-full w-full max-w-3xl items-center justify-center">
        <SmartImage src={poster} alt="" className="max-h-[75vh] w-full rounded-xl object-contain" />
        <span className="absolute bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">Video preview</span>
      </div>
    );
  }
  return (
    <video
      key={src}
      src={src}
      poster={poster}
      controls
      autoPlay
      playsInline
      muted
      loop
      onError={() => setFailed(true)}
      className="max-h-full max-w-full rounded-xl"
    />
  );
}

const STEPS = [
  { de: "Tour", en: "Tour" },
  { de: "Gäste & Datum", en: "Guests & date" },
  { de: "Extras", en: "Extras" },
  { de: "Kontakt", en: "Contact" },
];

export function InquiryModal() {
  const { t, lang } = useTx();
  const { open, tourId: presetTour } = useSI((s) => s.inquiry);
  const close = useSI((s) => s.closeInquiry);

  const [step, setStep] = useState(0);
  const [tourId, setTourId] = useState<string>(TOURS[0].id);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState<"morning" | "afternoon" | "flex">("flex");
  const [extras, setExtras] = useState<ExtraId[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hotel, setHotel] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTouched(false);
    if (presetTour) {
      setTourId(presetTour);
      setStep(1);
    } else {
      setStep(0);
    }
  }, [open, presetTour]);

  const tour = TOURS.find((x) => x.id === tourId) ?? TOURS[0];
  const extrasTotal = EXTRAS.filter((e) => extras.includes(e.id)).reduce(
    (sum, e) => sum + (e.perPerson ? e.price * guests : e.price),
    0,
  );
  const total = tour.price + extrasTotal;
  const today = new Date().toISOString().slice(0, 10);

  const nameOk = name.trim().length >= 2;
  const contactOk = /\S+@\S+\.\S+/.test(email) || phone.replace(/\D/g, "").length >= 7;
  const canNext = step === 1 ? !!date : step === 3 ? nameOk && contactOk : true;

  const timeLabel = {
    morning: { de: "Vormittag", en: "Morning" },
    afternoon: { de: "Nachmittag / Sunset", en: "Afternoon / sunset" },
    flex: { de: "Flexibel", en: "Flexible" },
  } as const;

  const message = [
    lang === "de" ? "🌴 *Anfrage – Krabi Secret Islands*" : "🌴 *Inquiry – Krabi Secret Islands*",
    "",
    `${lang === "de" ? "Tour" : "Tour"}: ${t(tour.title)}`,
    `${lang === "de" ? "Datum" : "Date"}: ${date || "–"} (${t(timeLabel[time])})`,
    `${lang === "de" ? "Personen" : "Guests"}: ${guests}`,
    `Extras: ${extras.length ? EXTRAS.filter((e) => extras.includes(e.id)).map((e) => t(e.label)).join(", ") : "–"}`,
    `${lang === "de" ? "Richtpreis" : "Estimated price"}: ${formatTHB(total)}`,
    "",
    `Name: ${name}`,
    email ? `E-Mail: ${email}` : "",
    phone ? `${lang === "de" ? "Telefon" : "Phone"}: ${phone}` : "",
    hotel ? `Hotel: ${hotel}` : "",
    note ? `${lang === "de" ? "Nachricht" : "Message"}: ${note}` : "",
  ]
    .filter((l, i, arr) => l !== "" || (i > 0 && arr[i - 1] !== ""))
    .join("\n");

  const mailHref = `mailto:${BRAND.email}?subject=${encodeURIComponent(
    `${lang === "de" ? "Tour-Anfrage" : "Tour inquiry"}: ${t(tour.title)} – ${date}`,
  )}&body=${encodeURIComponent(message.replace(/\*/g, ""))}`;

  const next = () => {
    setTouched(true);
    if (canNext) {
      setTouched(false);
      setStep((s) => Math.min(3, s + 1));
    }
  };

  const inputCls =
    "h-12 w-full rounded-xl bg-si-white px-4 text-base text-si-navy ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-si-cyan";

  return (
    <Sheet open={open} onClose={close} label={t(UI.ctaInquire)} closeLabel={t(UI.close)}>
      <div className="border-b border-slate-100 px-5 pb-4 pt-5">
        <p className="pr-12 text-lg font-extrabold text-si-navy">{t(UI.ctaInquire)}</p>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s.de} className="flex-1">
              <div className={cn("h-1.5 rounded-full transition-colors", i <= step ? "bg-si-cyan" : "bg-slate-200")} />
              <p className={cn("mt-1 truncate text-[11px] font-semibold", i === step ? "text-si-navy" : "text-slate-400")}>
                {t(s)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 ? (
              <div className="space-y-3">
                {TOURS.map((tr) => (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => setTourId(tr.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl p-2.5 text-left ring-2 transition",
                      tourId === tr.id ? "bg-cyan-50 ring-si-cyan" : "bg-white ring-slate-200",
                    )}
                  >
                    <SmartImage src={tr.image.replace(/w=\d+/, "w=200")} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold leading-snug text-si-navy">{t(tr.title)}</span>
                      <span className="mt-0.5 block text-xs text-si-slate">
                        {t(UI.from)} {formatTHB(tr.price)} · {t(tr.duration)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full",
                        tourId === tr.id ? "bg-si-cyan text-si-navy" : "ring-2 ring-slate-300",
                      )}
                    >
                      {tourId === tr.id ? <Check className="size-4" strokeWidth={3} /> : null}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-sm font-bold text-si-navy">{t({ de: "Anzahl Personen", en: "Number of guests" })}</p>
                  <div className="flex items-center justify-between rounded-2xl bg-si-white p-2 ring-1 ring-slate-200">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      disabled={guests <= 1}
                      aria-label="−"
                      className="grid size-12 place-items-center rounded-xl bg-white text-si-navy shadow-sm disabled:opacity-40"
                    >
                      <Minus className="size-5" />
                    </button>
                    <div className="text-center">
                      <p className="text-3xl font-extrabold text-si-navy">{guests}</p>
                      <p className="text-xs text-si-slate">{t({ de: "max. 5 Gäste", en: "max. 5 guests" })}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.min(5, g + 1))}
                      disabled={guests >= 5}
                      aria-label="+"
                      className="grid size-12 place-items-center rounded-xl bg-white text-si-navy shadow-sm disabled:opacity-40"
                    >
                      <Plus className="size-5" />
                    </button>
                  </div>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-si-navy">{t({ de: "Wunschdatum", en: "Preferred date" })} *</span>
                  <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
                  {touched && !date ? (
                    <span className="mt-1 block text-xs font-semibold text-red-500">
                      {t({ de: "Bitte Datum wählen", en: "Please choose a date" })}
                    </span>
                  ) : null}
                </label>
                <div>
                  <p className="mb-2 text-sm font-bold text-si-navy">{t({ de: "Bevorzugte Zeit", en: "Preferred time" })}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(timeLabel) as (keyof typeof timeLabel)[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setTime(k)}
                        className={cn(
                          "min-h-12 rounded-xl px-2 text-xs font-bold ring-2 transition",
                          time === k ? "bg-cyan-50 text-si-navy ring-si-cyan" : "text-si-slate ring-slate-200",
                        )}
                      >
                        {t(timeLabel[k])}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-3">
                {EXTRAS.map((e) => {
                  const on = extras.includes(e.id);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setExtras((xs) => (on ? xs.filter((x) => x !== e.id) : [...xs, e.id]))}
                      aria-pressed={on}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl p-4 text-left ring-2 transition",
                        on ? "bg-amber-50 ring-si-gold" : "ring-slate-200",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-md",
                          on ? "bg-si-gold text-si-navy" : "ring-2 ring-slate-300",
                        )}
                      >
                        {on ? <Check className="size-4" strokeWidth={3} /> : null}
                      </span>
                      <span className="flex-1">
                        <span className="block font-bold text-si-navy">{t(e.label)}</span>
                        <span className="block text-xs text-si-slate">{t(e.desc)}</span>
                      </span>
                      <span className="text-right text-sm font-extrabold text-si-navy">
                        +{formatTHB(e.price)}
                        <span className="block text-[10px] font-medium text-slate-500">
                          {e.perPerson ? t({ de: "pro Person", en: "per person" }) : t(UI.perBoat)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-3">
                <input className={inputCls} placeholder={`${t({ de: "Ihr Name", en: "Your name" })} *`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                <input className={inputCls} type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <input className={inputCls} type="tel" placeholder={t({ de: "WhatsApp / Telefon", en: "WhatsApp / phone" })} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                <input className={inputCls} placeholder={t({ de: "Hotel in Krabi (optional)", en: "Hotel in Krabi (optional)" })} value={hotel} onChange={(e) => setHotel(e.target.value)} />
                <textarea
                  className={cn(inputCls, "h-24 resize-none py-3")}
                  placeholder={t({ de: "Besondere Wünsche (Antrag, Geburtstag, Kinder …)", en: "Special wishes (proposal, birthday, kids …)" })}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                {touched && !(nameOk && contactOk) ? (
                  <p className="text-xs font-semibold text-red-500">
                    {t({ de: "Bitte Name und E-Mail oder Telefon angeben.", en: "Please enter your name and an email or phone." })}
                  </p>
                ) : null}

                <div className="rounded-2xl bg-si-navy p-4 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>{t(tour.title)}</span>
                    <span className="font-semibold text-white">{formatTHB(tour.price)}</span>
                  </div>
                  {EXTRAS.filter((e) => extras.includes(e.id)).map((e) => (
                    <div key={e.id} className="mt-1 flex justify-between">
                      <span>
                        {t(e.label)}
                        {e.perPerson ? ` ×${guests}` : ""}
                      </span>
                      <span className="font-semibold text-white">{formatTHB(e.perPerson ? e.price * guests : e.price)}</span>
                    </div>
                  ))}
                  <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
                    <span>
                      {t({ de: "Richtpreis gesamt", en: "Estimated total" })}
                      <span className="block text-[11px] text-slate-400">
                        {date || "–"} · {guests} {t({ de: "Pers.", en: "guests" })}
                      </span>
                    </span>
                    <span className="text-2xl font-extrabold text-si-cyan">{formatTHB(total)}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-slate-100 bg-white p-4" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        {step < 3 ? (
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                aria-label={t({ de: "Zurück", en: "Back" })}
                className="grid size-14 shrink-0 place-items-center rounded-2xl bg-si-white text-si-navy ring-1 ring-slate-200"
              >
                <ArrowLeft className="size-5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={next}
              className="flex h-14 flex-1 items-center justify-between rounded-2xl bg-si-navy px-5 font-bold text-white active:scale-[0.98]"
            >
              <span>{t({ de: "Weiter", en: "Continue" })}</span>
              <span className="text-sm text-si-cyan">{formatTHB(total)}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              aria-label={t({ de: "Zurück", en: "Back" })}
              className="grid size-14 shrink-0 place-items-center rounded-2xl bg-si-white text-si-navy ring-1 ring-slate-200"
            >
              <ArrowLeft className="size-5" />
            </button>
            <a
              href={nameOk && contactOk ? waLink(message) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!(nameOk && contactOk)) {
                  e.preventDefault();
                  setTouched(true);
                }
              }}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-si-wa px-3 text-[15px] font-bold text-white active:scale-[0.98]"
            >
              <WhatsAppIcon className="size-5" /> {t({ de: "Per WhatsApp", en: "Via WhatsApp" })}
            </a>
            <a
              href={nameOk && contactOk ? mailHref : undefined}
              onClick={(e) => {
                if (!(nameOk && contactOk)) {
                  e.preventDefault();
                  setTouched(true);
                }
              }}
              aria-label={t({ de: "Per E-Mail senden", en: "Send via email" })}
              className="grid size-14 shrink-0 place-items-center rounded-2xl bg-si-cyan text-si-navy"
            >
              <Mail className="size-5" />
            </a>
          </div>
        )}
      </div>
    </Sheet>
  );
}
