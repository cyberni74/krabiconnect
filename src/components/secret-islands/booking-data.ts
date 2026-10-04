import { IMG, TOURS, type L, type SlotId, type Tour } from "./content";

/* ───────────── Custom tour builder ───────────── */

export type Zone = "near" | "mid" | "far";
export type Island = {
  id: string;
  name: string;
  zone: Zone;
  /** Minutes one way from Ao Nang. */
  minutes: number;
  image: string;
  tag: L;
  desc: L;
};

export const ZONE_SURCHARGE: Record<Zone, number> = { near: 0, mid: 1500, far: 4000 };
export const ZONE_LABEL: Record<Zone, L> = {
  near: { de: "Nah · bis 20 Min.", en: "Near · up to 20 min" },
  mid: { de: "Mittel · 30–45 Min.", en: "Mid · 30–45 min" },
  far: { de: "Weit · 60+ Min.", en: "Far · 60+ min" },
};

export const ISLANDS: Island[] = [
  { id: "poda", name: "Koh Poda", zone: "near", minutes: 15, image: IMG.beach, tag: { de: "Traumstrand", en: "Dream beach" }, desc: { de: "Weißer Sand, Kalksteinturm, ideales Badewasser.", en: "White sand, limestone tower, perfect swimming." } },
  { id: "chicken", name: "Chicken Island", zone: "near", minutes: 15, image: IMG.snorkel, tag: { de: "Schnorcheln", en: "Snorkeling" }, desc: { de: "Bunte Riffe direkt am markanten Hühnerkopf-Felsen.", en: "Colourful reefs right by the famous chicken-head rock." } },
  { id: "tup", name: "Tup Sandbank", zone: "near", minutes: 15, image: IMG.sandbar, tag: { de: "Nur bei Ebbe", en: "Low tide only" }, desc: { de: "Zu Fuß übers Meer zwischen zwei Inseln.", en: "Walk across the sea between two islands." } },
  { id: "phranang", name: "Phra Nang & Railay", zone: "near", minutes: 10, image: IMG.cliffs, tag: { de: "Ikone", en: "Icon" }, desc: { de: "Höhle, Kletterfelsen und einer der schönsten Strände Asiens.", en: "Cave, climbing cliffs and one of Asia's finest beaches." } },
  { id: "hong", name: "Koh Hong (Krabi)", zone: "mid", minutes: 35, image: IMG.lagoon, tag: { de: "Lagune", en: "Lagoon" }, desc: { de: "Smaragdgrüne Lagune, umringt von Felswänden.", en: "Emerald lagoon ringed by rock walls." } },
  { id: "laolading", name: "Koh Lao Lading", zone: "mid", minutes: 35, image: IMG.bay, tag: { de: "Mini-Bucht", en: "Tiny cove" }, desc: { de: "Winzige Bucht mit Schatten unter Klippen.", en: "Tiny cove with shade under the cliffs." } },
  { id: "pakbia", name: "Koh Pakbia", zone: "mid", minutes: 35, image: IMG.island, tag: { de: "Doppelstrand", en: "Twin beach" }, desc: { de: "Zwei Strände, verbunden durch eine Sandzunge.", en: "Two beaches joined by a sand spit." } },
  { id: "yawasam", name: "Koh Yawasam", zone: "mid", minutes: 30, image: IMG.aerial, tag: { de: "Angelspot", en: "Fishing spot" }, desc: { de: "Fischreiches Riff – perfekt für einen Angelstopp.", en: "Rich reef – perfect for a fishing stop." } },
  { id: "roi", name: "Koh Roi", zone: "far", minutes: 60, image: IMG.cliffs, tag: { de: "Geheim", en: "Secret" }, desc: { de: "Versteckte Lagune hinter einem Felstunnel.", en: "Hidden lagoon behind a rock tunnel." } },
  { id: "kudu", name: "Koh Kudu", zone: "far", minutes: 60, image: IMG.bay, tag: { de: "Geheim", en: "Secret" }, desc: { de: "Zum Himmel offene Höhle – kaum besucht.", en: "Sky-open cave chamber – hardly visited." } },
  { id: "nok", name: "Koh Nok", zone: "far", minutes: 55, image: IMG.beach, tag: { de: "Einsam", en: "Deserted" }, desc: { de: "Einsamer Strand für Ihr Picknick.", en: "Lonely beach for your picnic." } },
  { id: "phiphi", name: "Phi Phi & Maya Bay", zone: "far", minutes: 50, image: IMG.lagoon, tag: { de: "Weltberühmt", en: "World famous" }, desc: { de: "Maya Bay und Pileh-Lagune – am besten früh.", en: "Maya Bay and Pileh Lagoon – best early." } },
];

export type DurationId = "half" | "sunset" | "full" | "extended";
export const DURATIONS: { id: DurationId; hours: number; base: number; maxStops: number; slots: SlotId[]; label: L; desc: L }[] = [
  { id: "half", hours: 4, base: 11000, maxStops: 3, slots: ["morning", "midday"], label: { de: "Halbtags", en: "Half day" }, desc: { de: "4 Std. · bis 3 Stopps", en: "4 hrs · up to 3 stops" } },
  { id: "sunset", hours: 5, base: 14000, maxStops: 3, slots: ["sunset"], label: { de: "Sunset", en: "Sunset" }, desc: { de: "5 Std. · bis 3 Stopps · Sonnenuntergang", en: "5 hrs · up to 3 stops · sunset" } },
  { id: "full", hours: 8, base: 19000, maxStops: 5, slots: ["morning"], label: { de: "Ganztags", en: "Full day" }, desc: { de: "8 Std. · bis 5 Stopps", en: "8 hrs · up to 5 stops" } },
  { id: "extended", hours: 10, base: 24000, maxStops: 7, slots: ["morning"], label: { de: "Expedition", en: "Expedition" }, desc: { de: "10 Std. · bis 7 Stopps · auch weite Inseln", en: "10 hrs · up to 7 stops · incl. far islands" } },
];

/** Half-day and sunset trips can't reach far-zone islands. */
export function islandAllowed(island: Island, duration: DurationId) {
  return island.zone !== "far" || duration === "full" || duration === "extended";
}

export function customTourPrice(duration: DurationId, islandIds: string[]) {
  const d = DURATIONS.find((x) => x.id === duration) ?? DURATIONS[0];
  const zones = new Set(ISLANDS.filter((i) => islandIds.includes(i.id)).map((i) => i.zone));
  const surcharge = zones.has("far") ? ZONE_SURCHARGE.far : zones.has("mid") ? ZONE_SURCHARGE.mid : 0;
  return d.base + surcharge;
}

/* ───────────── Catering, drinks, extras ───────────── */

export type AddOn = {
  id: string;
  label: L;
  desc: L;
  price: number;
  /** "person": × guests, "child": × children, "boat": flat per booking. */
  per: "person" | "child" | "boat";
  emoji: string;
  tag?: L;
  /** Highlight ("Empfohlen") for fishing trips or for couples / honeymoons / sunset tours. */
  recommendFor?: ("fishing" | "romance")[];
};

/** One-click catering package offered on every booking (per person). */
export const CATERING_PACKAGE: AddOn = {
  id: "catering",
  emoji: "🍽️",
  label: { de: "Verpflegung an Bord", en: "Catering on board" },
  desc: {
    de: "2 frisch zubereitete Mahlzeiten + Getränke (Wasser, Cola, Cola Zero)",
    en: "2 freshly prepared meals + drinks (water, Coke, Coke Zero)",
  },
  price: 500,
  per: "person",
  tag: { de: "1 Klick", en: "1 click" },
};

export const FOOD: AddOn[] = [
  CATERING_PACKAGE,
  { id: "fruit", emoji: "🍍", label: { de: "Tropische Obst- & Snackplatte", en: "Tropical fruit & snack platter" }, desc: { de: "Mango, Ananas, Drachenfrucht, Nüsse & Chips", en: "Mango, pineapple, dragon fruit, nuts & chips" }, price: 350, per: "person" },
  { id: "lunchbox", emoji: "🍱", label: { de: "Thai-Lunchbox", en: "Thai lunch box" }, desc: { de: "Pad Thai oder grünes Curry, frisch vom Restaurant", en: "Pad thai or green curry, fresh from the restaurant" }, price: 450, per: "person" },
  { id: "veggie", emoji: "🥗", label: { de: "Vegane Buddha-Bowl", en: "Vegan Buddha bowl" }, desc: { de: "Tofu, Mango-Salsa, Reis, Erdnuss-Dressing", en: "Tofu, mango salsa, rice, peanut dressing" }, price: 650, per: "person" },
  { id: "picnic", emoji: "🧺", label: { de: "Gourmet-Strandpicknick", en: "Gourmet beach picnic" }, desc: { de: "Thai-Fusion, Garnelen-Salat, Dessert – am privaten Strand angerichtet", en: "Thai fusion, prawn salad, dessert – set up on a private beach" }, price: 1200, per: "person", tag: { de: "Beliebt", en: "Popular" } },
  { id: "bbq", emoji: "🦐", label: { de: "Seafood-BBQ am Strand", en: "Seafood BBQ on the beach" }, desc: { de: "Tiger-Garnelen, Fisch, Tintenfisch vom Grill, Beilagen & Dips", en: "Tiger prawns, fish, squid off the grill, sides & dips" }, price: 1900, per: "person", tag: { de: "Highlight", en: "Highlight" } },
  { id: "finedining", emoji: "🕯️", label: { de: "Sunset Fine-Dining an Bord", en: "Sunset fine dining on board" }, desc: { de: "3 Gänge vom Privatkoch, Tischdeko & Kerzen", en: "3 courses by a private chef, table decor & candles" }, price: 2800, per: "person", tag: { de: "Luxus", en: "Luxury" } },
  { id: "kids", emoji: "🧒", label: { de: "Kindermenü", en: "Kids' menu" }, desc: { de: "Chicken-Nuggets, Pommes, Obst & Saft", en: "Chicken nuggets, fries, fruit & juice" }, price: 300, per: "child" },
];

export const DRINKS: AddOn[] = [
  { id: "coconut", emoji: "🥥", label: { de: "Frische Kokosnüsse & Smoothies", en: "Fresh coconuts & smoothies" }, desc: { de: "Eisgekühlt, unbegrenzt", en: "Ice-cold, unlimited" }, price: 250, per: "person" },
  { id: "beer", emoji: "🍺", label: { de: "Eiskaltes Bier", en: "Ice-cold beer" }, desc: { de: "Chang, Singha & Leo in der Kühlbox – perfekt für Angeltouren", en: "Chang, Singha & Leo in the cooler – perfect for fishing trips" }, price: 400, per: "person", tag: { de: "Für Angler", en: "For anglers" }, recommendFor: ["fishing"] },
  { id: "cocktails", emoji: "🍹", label: { de: "Cocktail-Bar an Bord", en: "Cocktail bar on board" }, desc: { de: "Mojito, Piña Colada, Mai Tai – frisch gemixt", en: "Mojito, piña colada, mai tai – freshly mixed" }, price: 900, per: "person", tag: { de: "Beliebt", en: "Popular" } },
  { id: "prosecco", emoji: "🥂", label: { de: "Sekt für Verliebte", en: "Sparkling wine for lovers" }, desc: { de: "2 Flaschen gekühlter Sekt mit Gläsern – für Paare & Hochzeitsreisen", en: "2 bottles of chilled sparkling wine with glasses – for couples & honeymoons" }, price: 2200, per: "boat", tag: { de: "Für Paare", en: "For couples" }, recommendFor: ["romance"] },
  { id: "champagne", emoji: "🍾", label: { de: "Premium-Champagner", en: "Premium champagne" }, desc: { de: "Moët & Chandon Impérial, 0,75 l", en: "Moët & Chandon Impérial, 0.75 l" }, price: 6500, per: "boat", tag: { de: "Luxus", en: "Luxury" }, recommendFor: ["romance"] },
];

export const BOOKING_EXTRAS: AddOn[] = [
  { id: "drone", emoji: "🚁", label: { de: "4K Drohnen-Paket", en: "4K drone package" }, desc: { de: "Pilot, Reel + 40 Luftbilder, Lieferung am selben Abend", en: "Pilot, reel + 40 aerial photos, same-evening delivery" }, price: 4500, per: "boat", tag: { de: "Bestseller", en: "Bestseller" } },
  { id: "underwater", emoji: "🤿", label: { de: "Unterwasser-Fotograf", en: "Underwater photographer" }, desc: { de: "GoPro-Aufnahmen beim Schnorcheln", en: "GoPro shots while snorkeling" }, price: 2500, per: "boat" },
  { id: "romance", emoji: "🌹", label: { de: "Romantik-Deko & Blumen", en: "Romance decor & flowers" }, desc: { de: "Für Antrag, Jahrestag & Flitterwochen", en: "For proposals, anniversaries & honeymoons" }, price: 2500, per: "boat" },
  { id: "fishing", emoji: "🎣", label: { de: "Angelstopp mit Ausrüstung", en: "Fishing stop with gear" }, desc: { de: "1 Std. Riff-Angeln während der Inseltour", en: "1 hr reef fishing during the island tour" }, price: 1500, per: "boat" },
  { id: "sup", emoji: "🏄", label: { de: "SUP & Kajak", en: "SUP & kayak" }, desc: { de: "2 Stand-up-Paddles + 1 Doppelkajak", en: "2 stand-up paddles + 1 double kayak" }, price: 1200, per: "boat" },
];

export function addOnAmount(item: AddOn, guests: number, kids = 0) {
  if (item.per === "person") return item.price * guests;
  if (item.per === "child") return item.price * kids;
  return item.price;
}

export function addOnTotal(items: AddOn[], selected: string[], guests: number, kids = 0) {
  return items.filter((i) => selected.includes(i.id)).reduce((sum, i) => sum + addOnAmount(i, guests, kids), 0);
}

/* ───────────── Availability (demo) ───────────── */

export type SlotStatus = "free" | "limited" | "booked";

/**
 * Availability (no backend yet): past dates and today are closed, everything else is requestable.
 */
export function slotStatus(dateISO: string, slot: SlotId, todayISO: string): SlotStatus {
  // Honest default until a real availability backend exists: every future slot is requestable,
  // the operator confirms. (Random "limited"/"booked" days would be fake scarcity.)
  void slot;
  return dateISO <= todayISO ? "booked" : "free";
}

export function dayStatus(dateISO: string, slots: SlotId[], todayISO: string): SlotStatus {
  const st = slots.map((s) => slotStatus(dateISO, s, todayISO));
  if (st.every((s) => s === "booked")) return "booked";
  if (st.some((s) => s === "free")) return "free";
  return "limited";
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function tourById(id: string | null | undefined): Tour | undefined {
  return TOURS.find((t) => t.id === id);
}
