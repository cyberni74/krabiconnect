import { TH } from "./th";

export type Lang = "de" | "th";
const LS = "krabbenbucht-lang";

let lang: Lang = "de";
const listeners = new Set<() => void>();

export function loadLang(): Lang {
  try {
    const v = localStorage.getItem(LS);
    if (v === "th" || v === "de") lang = v;
  } catch {
    /* ignore */
  }
  return lang;
}
export const getLang = () => lang;
export function setLang(l: Lang) {
  if (l === lang) return;
  lang = l;
  try {
    localStorage.setItem(LS, l);
  } catch {
    /* ignore */
  }
  for (const f of listeners) f();
}
export const onLang = (f: () => void) => {
  listeners.add(f);
  return () => void listeners.delete(f);
};

/** UI strings of the interface (not part of the story text). */
const UI: Record<string, string> = {
  "Neues Spiel": "เกมใหม่",
  "Weiterspielen": "เล่นต่อ",
  "Kapitel wählen": "เลือกบท",
  "Zurück": "กลับ",
  "Aktion": "คำสั่ง",
  "Rucksack": "กระเป๋า",
  "Taschen leer. Noch.": "กระเป๋าว่าง ตอนนี้นะ",
  "Gehe zu": "ไปที่",
  "Schau an": "ดู",
  "Nimm": "หยิบ",
  "Benutze": "ใช้",
  "Rede mit": "คุยกับ",
  "Gib": "ให้",
  "mit": "กับ",
  "an": "แก่",
  "Ende": "จบ",
  "Zum Titel": "กลับหน้าแรก",
  "Nochmal spielen": "เล่นอีกครั้ง",
  "Automatisch": "อัตโนมัติ",
  "Verstanden": "เข้าใจแล้ว",
  "Dreh dein Handy quer": "หมุนมือถือเป็นแนวนอน",
  "Im Querformat siehst du die ganze Szene.": "แนวนอนจะเห็นฉากทั้งหมด",
  "Trotzdem hochkant spielen": "เล่นแนวตั้งต่อ",
  "Hotspots zeigen": "แสดงจุดที่แตะได้",
  "Ton an": "เปิดเสียง",
  "Ton aus": "ปิดเสียง",
  "Vollbild": "เต็มจอ",
  "Zum Titelbild": "กลับหน้าแรก",
  "Inventar": "สิ่งของ",
  "Gegenstand wählen": "เลือกสิ่งของ",
  "dann ins Bild tippen oder zweiten Gegenstand wählen": "แล้วแตะที่ภาพ หรือเลือกสิ่งของอีกชิ้น",
  "Tippen = anschauen · erst „Benutze“ oder „Gib“ wählen, um ihn einzusetzen": "แตะ = ดู · เลือก “ใช้” หรือ “ให้” ก่อนจึงจะใช้ของได้",
  "Tippen zum Gehen · Gedrückt halten zum Anschauen · 🔍 zeigt Hotspots": "แตะเพื่อเดิน · กดค้างเพื่อดู · 🔍 แสดงจุดที่แตะได้",
  "Tippen = gehen / ansehen / reden · Gedrückt halten = anschauen · 🔍 zeigt alle Hotspots · speichert automatisch": "แตะ = เดิน / ดู / คุย · กดค้าง = ดู · 🔍 แสดงจุดทั้งหมด · บันทึกอัตโนมัติ",
  "Verb wählen, dann auf etwas klicken · Rechtsklick = Anschauen / Reden · Leertaste überspringt Text · Spielstand speichert automatisch": "เลือกคำสั่งแล้วคลิกที่สิ่งของ · คลิกขวา = ดู / คุย · ช่องว่างข้ามข้อความ · บันทึกอัตโนมัติ · Shift+L เปลี่ยนภาษา",
  "Weiter": "ไปต่อ",
};

const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^(\d+) Dublonen?$/, (m) => `${m[1]} ดับลูน`],
  [/^Gemerkt! Das sind (\d) von 4 Strophen\.$/, (m) => `จำได้แล้ว! ได้ ${m[1]} จาก 4 ท่อน`],
  [/^Du kennst bisher (\d) von 4 Strophen\. .*$/, (m) => `เจ้ารู้แล้ว ${m[1]} จาก 4 ท่อน คนที่ท่าเรือรู้ท่อนโปรดของข้าทุกคน น่าเสียดาย`],
  [/^Wenn dir einer kommt mit: „(.*)“$/, (m) => `ถ้าใครมาว่า “${tr(m[1])}”`],
  [/^Dann sag: „(.*)“$/, (m) => `ก็ตอบว่า “${tr(m[1])}”`],
];

export const missing = new Set<string>();

/** Translate a German source string for display. */
export function tr(s: string): string {
  if (lang === "de" || !s) return s;
  const hit = TH[s] ?? UI[s];
  if (hit) return hit;
  for (const [re, f] of PATTERNS) {
    const m = s.match(re);
    if (m) return f(m);
  }
  if (/[A-Za-zÄÖÜäöü]{3}/.test(s)) missing.add(s);
  return s;
}

/** Word-wrap that works for Thai (no spaces) via Intl.Segmenter. */
let seg: Intl.Segmenter | null = null;
export function words(text: string): string[] {
  if (lang !== "th") return text.split(" ").map((w, i, a) => (i < a.length - 1 ? w + " " : w));
  seg ??= new Intl.Segmenter("th", { granularity: "word" });
  return [...seg.segment(text)].map((x) => x.segment);
}
if (typeof window !== "undefined") (window as unknown as { __missing: Set<string> }).__missing = missing;
