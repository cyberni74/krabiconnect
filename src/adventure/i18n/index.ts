import { TH } from "./th";

export type Lang = "de" | "th";
const LS = "rabenschwur-lang";

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
  "Rabenschwur": "ปฏิญาณอีกา",
  "Ein düsteres Ritterabenteuer": "การผจญภัยของอัศวินในยุคมืด",
  "Der Rabeneid": "คำสาบานอีกา",
  "Das Hexenmoor": "บึงแม่มด",
  "Burg Grauwacht": "ปราสาทเกราว็อคท์",
  "Der Vulkan": "ภูเขาไฟ",
  "Neues Spiel": "เกมใหม่",
  "Weiterspielen": "เล่นต่อ",
  "Kapitel wählen": "เลือกบท",
  "Kapitel 1": "บทที่ 1",
  "Kapitel 2": "บทที่ 2",
  "Kapitel 3": "บทที่ 3",
  "Kapitel 4": "บทที่ 4",
  "Zurück": "กลับ",
  "Schließen": "ปิด",
  "Leer.": "ว่างเปล่า",
  "Tippe einen Gegenstand an, um ihn einzustecken.": "แตะสิ่งของเพื่อเก็บใส่กระเป๋า",
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
  "Hinweis": "คำใบ้",
  "Ton an": "เปิดเสียง",
  "Ton aus": "ปิดเสียง",
  "Vollbild": "เต็มจอ",
  "Zum Titelbild": "กลับหน้าแรก",
  "Inventar": "สิ่งของ",
  "Tippen zum Fortfahren": "แตะเพื่อไปต่อ",
  "Klicken zum Fortfahren": "คลิกเพื่อไปต่อ",
  "Tippen zum Gehen · Gedrückt halten zum Anschauen · 🔍 zeigt Hotspots": "แตะเพื่อเดิน · กดค้างเพื่อดู · 🔍 แสดงจุดที่แตะได้",
  "Tippen = gehen / ansehen / reden · Gedrückt halten = anschauen · 🔍 zeigt alle Hotspots · speichert automatisch": "แตะ = เดิน / ดู / คุย · กดค้าง = ดู · 🔍 แสดงจุดทั้งหมด · บันทึกอัตโนมัติ",
  "Verb wählen, dann auf etwas klicken · Rechtsklick = Anschauen / Reden · Leertaste überspringt Text · Spielstand speichert automatisch": "เลือกคำสั่งแล้วคลิกที่สิ่งของ · คลิกขวา = ดู / คุย · ช่องว่างข้ามข้อความ · บันทึกอัตโนมัติ · Shift+L เปลี่ยนภาษา",
  "Das funktioniert so nicht.": "แบบนี้ไม่ได้ผล",
  "Wie soll das gehen?": "จะทำได้ยังไง?",
  "Netter Versuch, Bran.": "พยายามได้ดี แบรน",
  "Nichts Besonderes.": "ไม่มีอะไรพิเศษ",
  "Das lasse ich lieber hier.": "ปล่อยไว้ตรงนี้ดีกว่า",
  "Das kann ich nicht mitnehmen.": "เอาไปไม่ได้",
  "Was soll ich denn geben? Erst einen Gegenstand wählen.": "จะให้อะไรล่ะ? เลือกของก่อน",
  "Das passt nicht zusammen.": "สองอย่างนี้เข้ากันไม่ได้",
  "Ich gebe mir selbst etwas? Wie großzügig.": "ให้ของกับตัวเองเหรอ? ใจกว้างจริง",
};

const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [];

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
