import { useTideSettings, type TideLang } from "./store";

export const TZ = "Asia/Bangkok";

const de = {
  forecastNow: "Aktuelle Gezeitenprognose",
  simulation: "Simulation",
  rising: "Flut – Wasser steigt",
  falling: "Ebbe – Wasser fällt",
  slack: "Gezeitenwechsel",
  nextHighIn: "Nächstes Hochwasser in",
  nextLowIn: "Nächstes Niedrigwasser in",
  highAt: "Hochwasser",
  lowAt: "Niedrigwasser",
  predicted: "Prognostizierter Pegel",
  last30: "letzte 30 min",
  perHour: "pro Stunde",
  toGo: "bis zum Extrem",
  simulate: "Gezeiten simulieren",
  close: "Schließen",
  backToNow: "Zurück zu jetzt",
  now: "Jetzt",
  tides: "Gezeiten",
  map: "Karte",
  captain: "Captain",
  oClock: "Uhr",
  demoBanner: "DEMO-MODUS – simulierte Beispielkurve, keine echte Prognose",
  stale: "Veraltete Daten – Stand",
  noData: "Keine Prognosedaten für diesen Zeitpunkt",
  loading: "Lade Gezeitenprognose …",
  source: "Quelle",
  station: "Prognosestandort",
  datum: "Höhenbezug",
  notMeasured: "Astronomisch-modellierte Prognose, keine Live-Messung. Nicht zur Navigation.",
  sevenDays: "Gezeitenprognose · 7 Tage",
  hourly: "Stündlicher Pegel",
  extremes: "Hoch- & Niedrigwasser",
  today: "Heute",
  tapChart: "Tippe oder ziehe über die Kurve – der Hintergrund folgt.",
  locations: "Standorte",
  useGps: "Meinen Standort verwenden",
  gpsLocating: "Ortung läuft …",
  gpsDenied: "Standortzugriff nicht möglich",
  gpsNearest: "Nächster Prognosestandort",
  autoGps: "Beim Start automatisch per GPS wählen",
  favorites: "Favoriten",
  illustrationNote: "Hintergrund zeigt das Krabi-Deltabecken als Illustration des Pegels.",
  boat: "Mein Boot",
  boatName: "Bootsname",
  draft: "Tiefgang",
  reserve: "Sicherheitsreserve unter dem Kiel",
  homePort: "Heimathafen",
  planner: "Fahrtplanung",
  departure: "Abfahrt",
  ret: "Rückkehr",
  atDeparture: "Bei deiner geplanten Abfahrt um",
  atReturn: "Bei deiner geplanten Rückkehr um",
  levelPredicted: "wird ein Pegel von",
  predictedSuffix: "prognostiziert.",
  untilDeparture: "Bis zu deinem geplanten Abfahrtszeitpunkt",
  rises: "steigt das Wasser voraussichtlich um",
  falls: "fällt das Wasser voraussichtlich um",
  minDepth: "Benötigte Wassertiefe (Tiefgang + Reserve)",
  depthHint:
    "Vergleiche selbst mit einer verifizierten Seekarte: Kartentiefe + prognostizierter Pegel muss mindestens diesen Wert erreichen.",
  noUkc:
    "Ohne verifizierte Kartentiefen kann die App keine tatsächliche Wassertiefe oder Unterkielfreiheit berechnen. Keine Befahrbarkeitsfreigabe.",
  alerts: "Benachrichtigungen",
  beforeHigh: "Erinnerung vor Hochwasser",
  beforeLow: "Erinnerung vor Niedrigwasser",
  leadTime: "Vorlauf",
  minutes: "Min.",
  aboveAlarm: "Alarm bei Überschreiten von",
  belowAlarm: "Alarm bei Unterschreiten von",
  alertsNote:
    "Benachrichtigungen basieren auf der Prognose des gewählten Standorts und funktionieren, solange CAPTAIN TIDE geöffnet ist bzw. im Hintergrund läuft.",
  enableNotif: "Benachrichtigungen erlauben",
  notifBlocked: "Vom Browser blockiert",
  language: "Sprache",
  play: "Abspielen",
  pause: "Pause",
  outOfRange: "außerhalb der Bildspanne – nächstgelegene Grafik",
  reminderHigh: "Hochwasser in",
  reminderLow: "Niedrigwasser in",
  crossAbove: "Pegel steigt über",
  crossBelow: "Pegel fällt unter",
  at: "um",
  in: "in",
  change: "Änderung",
};

export type TideKey = keyof typeof de;

const en: Record<TideKey, string> = {
  forecastNow: "Current tide prediction",
  simulation: "Simulation",
  rising: "Flood – water rising",
  falling: "Ebb – water falling",
  slack: "Tide turning",
  nextHighIn: "Next high water in",
  nextLowIn: "Next low water in",
  highAt: "High water",
  lowAt: "Low water",
  predicted: "Predicted level",
  last30: "last 30 min",
  perHour: "per hour",
  toGo: "to extreme",
  simulate: "Simulate tides",
  close: "Close",
  backToNow: "Back to now",
  now: "Now",
  tides: "Tides",
  map: "Map",
  captain: "Captain",
  oClock: "",
  demoBanner: "DEMO MODE – synthetic sample curve, not a real prediction",
  stale: "Stale data – as of",
  noData: "No prediction data for this time",
  loading: "Loading tide prediction …",
  source: "Source",
  station: "Prediction point",
  datum: "Datum",
  notMeasured: "Astronomical/model prediction, not a live measurement. Not for navigation.",
  sevenDays: "Tide prediction · 7 days",
  hourly: "Hourly level",
  extremes: "High & low water",
  today: "Today",
  tapChart: "Tap or drag across the curve – the background follows.",
  locations: "Locations",
  useGps: "Use my location",
  gpsLocating: "Locating …",
  gpsDenied: "Location access unavailable",
  gpsNearest: "Nearest prediction point",
  autoGps: "Pick automatically via GPS on start",
  favorites: "Favourites",
  illustrationNote: "The background shows the Krabi estuary as an illustration of the level.",
  boat: "My boat",
  boatName: "Boat name",
  draft: "Draft",
  reserve: "Under-keel safety reserve",
  homePort: "Home port",
  planner: "Trip planner",
  departure: "Departure",
  ret: "Return",
  atDeparture: "At your planned departure at",
  atReturn: "At your planned return at",
  levelPredicted: "a level of",
  predictedSuffix: "is predicted.",
  untilDeparture: "Until your planned departure",
  rises: "the water is expected to rise by",
  falls: "the water is expected to fall by",
  minDepth: "Required water depth (draft + reserve)",
  depthHint:
    "Check against a verified chart yourself: charted depth + predicted level must reach at least this value.",
  noUkc:
    "Without verified charted depths the app cannot compute actual water depth or under-keel clearance. No passage clearance.",
  alerts: "Notifications",
  beforeHigh: "Reminder before high water",
  beforeLow: "Reminder before low water",
  leadTime: "Lead time",
  minutes: "min",
  aboveAlarm: "Alarm when level rises above",
  belowAlarm: "Alarm when level falls below",
  alertsNote:
    "Notifications use the selected location's prediction and work while CAPTAIN TIDE is open or running in the background.",
  enableNotif: "Allow notifications",
  notifBlocked: "Blocked by the browser",
  language: "Language",
  play: "Play",
  pause: "Pause",
  outOfRange: "outside illustrated span – nearest image",
  reminderHigh: "High water in",
  reminderLow: "Low water in",
  crossAbove: "Level rises above",
  crossBelow: "Level falls below",
  at: "at",
  in: "in",
  change: "Change",
};

const dicts: Record<TideLang, Record<TideKey, string>> = { de, en };

export function translate(lang: TideLang, k: TideKey): string {
  return dicts[lang][k];
}

export function useTT() {
  const lang = useTideSettings((s) => s.lang);
  const t = (k: TideKey) => dicts[lang][k];
  return { t, lang };
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmt(lang: TideLang, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = lang + JSON.stringify(opts);
  let f = fmtCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(lang === "de" ? "de-DE" : "en-GB", { timeZone: TZ, ...opts });
    fmtCache.set(key, f);
  }
  return f;
}

export function fmtTime(t: number, lang: TideLang, seconds = false): string {
  return fmt(lang, {
    hour: "2-digit",
    minute: "2-digit",
    ...(seconds ? { second: "2-digit" } : {}),
    hour12: false,
  }).format(t);
}

export function fmtDay(t: number, lang: TideLang): string {
  return fmt(lang, { weekday: "short", day: "numeric", month: "short" }).format(t);
}

export function fmtWeekday(t: number, lang: TideLang): string {
  return fmt(lang, { weekday: "short" }).format(t);
}

export function fmtDateNum(t: number, lang: TideLang): string {
  return fmt(lang, { day: "numeric", month: "numeric" }).format(t);
}

/** Bangkok is UTC+7 with no DST — midnight of the Bangkok day containing t. */
export const BKK_OFFSET = 7 * 60 * 60_000;
export function bkkDayStart(t: number): number {
  const day = 24 * 60 * 60_000;
  return Math.floor((t + BKK_OFFSET) / day) * day - BKK_OFFSET;
}

export function fmtSigned(cm: number): string {
  const r = Math.round(cm);
  return `${r > 0 ? "+" : r < 0 ? "−" : "±"}${Math.abs(r)}`;
}
