/**
 * Booking wizard model: draft state, pricing, validation and the operator message.
 * Pure helpers only (no components) – shared by booking.tsx and booking-steps.tsx.
 */
import { BRAND, LANGS, SLOTS, type L, type Lang, type SlotId, type Tour } from "./content";
import {
  BOOKING_EXTRAS,
  DRINKS,
  DURATIONS,
  FOOD,
  ISLANDS,
  addOnTotal,
  customTourPrice,
  slotStatus,
  tourById,
  type AddOn,
  type DurationId,
} from "./booking-data";
import { formatTHB } from "./store";

export type Mode = "preset" | "custom";

export type Draft = {
  mode: Mode;
  tourId: string | null;
  duration: DurationId;
  islands: string[];
  date: string | null;
  slot: SlotId | null;
  guests: number;
  kids: number;
  food: string[];
  drinks: string[];
  extras: string[];
  name: string;
  email: string;
  phone: string;
  hotel: string;
  wishes: string;
  occasion: string | null;
};

export const MAX_GUESTS = 5;

export const OCCASIONS: { id: string; emoji: string; label: L }[] = [
  { id: "birthday", emoji: "🎂", label: { de: "Geburtstag", en: "Birthday" } },
  { id: "anniversary", emoji: "💞", label: { de: "Jahrestag", en: "Anniversary" } },
  { id: "proposal", emoji: "💍", label: { de: "Antrag", en: "Proposal" } },
  { id: "family", emoji: "👨‍👩‍👧", label: { de: "Familienurlaub", en: "Family holiday" } },
  { id: "honeymoon", emoji: "🌅", label: { de: "Flitterwochen", en: "Honeymoon" } },
];

export const STEP_LABELS: L[] = [
  { de: "Tour", en: "Tour" },
  { de: "Datum & Uhrzeit", en: "Date & time" },
  { de: "Gäste & Verpflegung", en: "Guests & catering" },
  { de: "Extras", en: "Extras" },
  { de: "Kontakt & Übersicht", en: "Contact & summary" },
];

export function initialDraft(tourId: string | null, custom: boolean): Draft {
  const tour = tourById(tourId);
  return {
    mode: custom ? "custom" : "preset",
    tourId: tour && !custom ? tour.id : null,
    duration: "half",
    islands: [],
    date: null,
    slot: null,
    guests: 2,
    kids: 0,
    food: [],
    drinks: [],
    extras: [],
    name: "",
    email: "",
    phone: "",
    hotel: "",
    wishes: "",
    occasion: null,
  };
}

export function currentTour(d: Draft): Tour | undefined {
  return d.mode === "preset" ? tourById(d.tourId) : undefined;
}

export function currentSlots(d: Draft): SlotId[] {
  if (d.mode === "preset") return currentTour(d)?.slots ?? [];
  return DURATIONS.find((x) => x.id === d.duration)?.slots ?? [];
}

export function durationOf(id: DurationId) {
  return DURATIONS.find((x) => x.id === id) ?? DURATIONS[0];
}

export function basePrice(d: Draft) {
  if (d.mode === "preset") return currentTour(d)?.price ?? 0;
  return d.islands.length ? customTourPrice(d.duration, d.islands) : durationOf(d.duration).base;
}

export function priceBreakdown(d: Draft) {
  const base = basePrice(d);
  const food = addOnTotal(FOOD, d.food, d.guests);
  const drinks = addOnTotal(DRINKS, d.drinks, d.guests);
  const extras = addOnTotal(BOOKING_EXTRAS, d.extras, d.guests);
  return { base, food, drinks, extras, total: base + food + drinks + extras };
}

export function itemAmount(item: AddOn, guests: number) {
  return item.per === "person" ? item.price * guests : item.price;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^\+?[\d\s()/-]{7,}$/;

export type ContactErrors = { name?: L; contact?: L; email?: L; phone?: L };

export function contactErrors(d: Draft): ContactErrors {
  const e: ContactErrors = {};
  if (d.name.trim().length < 2) e.name = { de: "Bitte geben Sie Ihren Namen ein.", en: "Please enter your name." };
  const email = d.email.trim();
  const phone = d.phone.trim();
  if (!email && !phone)
    e.contact = { de: "Bitte E-Mail oder WhatsApp/Telefon angeben.", en: "Please enter an e-mail or WhatsApp/phone." };
  if (email && !EMAIL_RE.test(email)) e.email = { de: "Diese E-Mail-Adresse sieht nicht gültig aus.", en: "This e-mail address doesn't look valid." };
  if (phone && !PHONE_RE.test(phone)) e.phone = { de: "Bitte Nummer mit Ländervorwahl angeben, z. B. +49 …", en: "Please include the country code, e.g. +44 …" };
  return e;
}

/** Why the user can't leave step `i` yet (null = fine). */
export function stepBlocker(d: Draft, i: number, todayISO: string): L | null {
  if (i === 0) {
    if (d.mode === "preset" && !currentTour(d)) return { de: "Bitte wählen Sie eine Tour.", en: "Please choose a tour." };
    if (d.mode === "custom" && d.islands.length === 0) return { de: "Bitte mindestens eine Insel wählen.", en: "Please choose at least one island." };
  }
  if (i === 1) {
    if (!d.date) return { de: "Bitte wählen Sie ein Datum.", en: "Please choose a date." };
    if (!d.slot || !currentSlots(d).includes(d.slot) || slotStatus(d.date, d.slot, todayISO) === "booked")
      return { de: "Bitte wählen Sie eine Abfahrtszeit.", en: "Please choose a departure time." };
  }
  if (i === 4) {
    if (Object.keys(contactErrors(d)).length) return { de: "Bitte Kontaktdaten vervollständigen.", en: "Please complete your contact details." };
  }
  return null;
}

/** First step index that is not yet valid (used to cap jumping ahead). */
export function firstBlocked(d: Draft, todayISO: string) {
  for (let i = 0; i < 5; i++) if (stepBlocker(d, i, todayISO)) return i;
  return 5;
}

export function htmlLang(lang: Lang) {
  return LANGS.find((l) => l.id === lang)?.html ?? lang;
}

export function slotInfo(id: SlotId) {
  return SLOTS.find((s) => s.id === id) ?? SLOTS[0];
}

export function routeNames(d: Draft) {
  return d.islands.map((id) => ISLANDS.find((i) => i.id === id)?.name ?? id);
}

/**
 * Operator message (WhatsApp formatting: *bold*). Built in the operator language via tOp.
 */
export function buildMessage(d: Draft, lang: Lang, tOp: (l: L) => string) {
  const opLocale = lang === "de" ? "de-DE" : "en-GB";
  const price = priceBreakdown(d);
  const tour = currentTour(d);
  const lines: string[] = [];
  lines.push(`*${tOp({ de: "Buchungsanfrage", en: "Booking request" })} – ${BRAND.name}*`);
  lines.push("");
  if (tour) {
    lines.push(`*${tOp({ de: "Tour", en: "Tour" })}:* ${tOp(tour.title)}`);
    lines.push(`${tOp({ de: "Dauer", en: "Duration" })}: ${tOp(tour.duration)}`);
    lines.push(`${tOp({ de: "Preis Boot", en: "Boat price" })}: ${formatTHB(price.base)}`);
  } else {
    const dur = durationOf(d.duration);
    lines.push(`*${tOp({ de: "Eigene Tour", en: "Custom tour" })}:* ${tOp(dur.label)} (${dur.hours} h)`);
    lines.push(`${tOp({ de: "Route", en: "Route" })}: Ao Nang → ${routeNames(d).join(" → ")} → Ao Nang`);
    lines.push(`${tOp({ de: "Preis Boot", en: "Boat price" })}: ${formatTHB(price.base)}`);
  }
  if (d.date) {
    const date = new Date(`${d.date}T12:00:00`).toLocaleDateString(opLocale, {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const s = d.slot ? slotInfo(d.slot) : null;
    lines.push(`*${tOp({ de: "Datum", en: "Date" })}:* ${date}${s ? ` · ${s.time} (${tOp(s.label)})` : ""}`);
  }
  lines.push(
    `*${tOp({ de: "Gäste", en: "Guests" })}:* ${d.guests}${
      d.kids ? ` (${tOp({ de: "davon Kinder", en: "incl. children" })}: ${d.kids})` : ""
    }`,
  );

  const section = (title: L, items: AddOn[], selected: string[]) => {
    const chosen = items.filter((i) => selected.includes(i.id));
    if (!chosen.length) return;
    lines.push("");
    lines.push(`*${tOp(title)}:*`);
    for (const i of chosen) {
      const amount = itemAmount(i, d.guests);
      const calc = i.per === "person" ? `${d.guests} × ${formatTHB(i.price)} = ${formatTHB(amount)}` : formatTHB(amount);
      lines.push(`• ${tOp(i.label)} – ${calc}`);
    }
  };
  section({ de: "Verpflegung", en: "Food" }, FOOD, d.food);
  section({ de: "Getränke", en: "Drinks" }, DRINKS, d.drinks);
  section({ de: "Extras", en: "Extras" }, BOOKING_EXTRAS, d.extras);

  lines.push("");
  lines.push(`*${tOp({ de: "Richtpreis gesamt", en: "Estimated total" })}: ${formatTHB(price.total)}*`);
  lines.push("");
  lines.push(`*${tOp({ de: "Kontakt", en: "Contact" })}:*`);
  lines.push(`${tOp({ de: "Name", en: "Name" })}: ${d.name.trim()}`);
  if (d.email.trim()) lines.push(`${tOp({ de: "E-Mail", en: "E-mail" })}: ${d.email.trim()}`);
  if (d.phone.trim()) lines.push(`${tOp({ de: "WhatsApp/Telefon", en: "WhatsApp/phone" })}: ${d.phone.trim()}`);
  if (d.hotel.trim()) lines.push(`${tOp({ de: "Hotel", en: "Hotel" })}: ${d.hotel.trim()}`);
  const occ = OCCASIONS.find((o) => o.id === d.occasion);
  if (occ) lines.push(`${tOp({ de: "Anlass", en: "Occasion" })}: ${tOp(occ.label)}`);
  if (d.wishes.trim()) lines.push(`${tOp({ de: "Wünsche", en: "Wishes" })}: ${d.wishes.trim()}`);
  if (lang === "zh" || lang === "ko" || lang === "ja") {
    const label = LANGS.find((l) => l.id === lang)?.label ?? lang;
    lines.push(`${tOp({ de: "Sprache des Gastes", en: "Guest language" })}: ${label}`);
  }
  return lines.join("\n");
}

export function mailHref(d: Draft, lang: Lang, tOp: (l: L) => string) {
  const body = buildMessage(d, lang, tOp).replace(/\*/g, "");
  const tour = currentTour(d);
  const subject = `${tOp({ de: "Buchungsanfrage", en: "Booking request" })}: ${
    tour ? tOp(tour.title) : tOp({ de: "Eigene Tour", en: "Custom tour" })
  }${d.date ? ` · ${d.date}` : ""}`;
  return `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
