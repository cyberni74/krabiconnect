export type Lang = "en" | "th";
export type ListingKind = "service" | "job" | "market";
export type OfferType = "offer" | "wanted";

export const DISTRICTS = [
  { id: "ao-nang", nameEn: "Ao Nang", nameTh: "อ่าวนาง", lat: 8.0363, lng: 98.8222 },
  { id: "krabi-town", nameEn: "Krabi Town", nameTh: "ตัวเมืองกระบี่", lat: 8.0863, lng: 98.9063 },
  { id: "nong-thale", nameEn: "Nong Thale", nameTh: "หนองทะเล", lat: 8.0678, lng: 98.8481 },
  { id: "klong-muang", nameEn: "Klong Muang", nameTh: "คลองม่วง", lat: 8.0889, lng: 98.745 },
  { id: "krabi-noi", nameEn: "Krabi Noi", nameTh: "กระบี่น้อย", lat: 8.1395, lng: 98.9198 },
  { id: "railay", nameEn: "Railay", nameTh: "ไร่เลย์", lat: 8.0069, lng: 98.8374 },
] as const;

export type DistrictId = (typeof DISTRICTS)[number]["id"];

export const SERVICE_CATEGORIES = [
  { id: "trades", nameEn: "Trades & repair", nameTh: "ช่างและซ่อมแซม" },
  { id: "home", nameEn: "Home & garden", nameTh: "บ้านและสวน" },
  { id: "cleaning", nameEn: "Cleaning", nameTh: "ทำความสะอาด" },
  { id: "transport", nameEn: "Transport", nameTh: "ขนส่ง" },
  { id: "tours", nameEn: "Tours & activities", nameTh: "ทัวร์และกิจกรรม" },
  { id: "beauty", nameEn: "Beauty & wellness", nameTh: "ความงามและสปา" },
  { id: "health", nameEn: "Health", nameTh: "สุขภาพ" },
  { id: "education", nameEn: "Lessons & language", nameTh: "สอนและภาษา" },
  { id: "legal", nameEn: "Visa & legal", nameTh: "วีซ่าและกฎหมาย" },
  { id: "tech", nameEn: "Tech & digital", nameTh: "เทคโนโลยี" },
  { id: "events", nameEn: "Photo & events", nameTh: "ภาพถ่ายและงานอีเวนต์" },
  { id: "property", nameEn: "Property services", nameTh: "อสังหาริมทรัพย์" },
] as const;

export const JOB_CATEGORIES = [
  { id: "hospitality", nameEn: "Restaurant & bar", nameTh: "ร้านอาหารและบาร์" },
  { id: "tourism", nameEn: "Tours & boats", nameTh: "ทัวร์และเรือ" },
  { id: "retail", nameEn: "Retail & shop", nameTh: "ร้านค้า" },
  { id: "construction", nameEn: "Construction", nameTh: "งานก่อสร้าง" },
  { id: "office", nameEn: "Office & admin", nameTh: "ออฟฟิศ" },
  { id: "teaching", nameEn: "Teaching", nameTh: "สอน" },
  { id: "healthcare", nameEn: "Healthcare", nameTh: "สุขภาพ" },
  { id: "trades", nameEn: "Trades", nameTh: "ช่าง" },
  { id: "transport", nameEn: "Driver & logistics", nameTh: "ขับรถและโลจิสติกส์" },
  { id: "household", nameEn: "Housekeeping", nameTh: "แม่บ้าน" },
] as const;

export const MARKET_CATEGORIES = [
  { id: "vehicles", nameEn: "Vehicles", nameTh: "ยานยนต์" },
  { id: "boats", nameEn: "Boats", nameTh: "เรือ" },
  { id: "property", nameEn: "Property", nameTh: "อสังหาริมทรัพย์" },
  { id: "electronics", nameEn: "Electronics", nameTh: "อิเล็กทรอนิกส์" },
  { id: "furniture", nameEn: "Home & furniture", nameTh: "เฟอร์นิเจอร์" },
  { id: "fashion", nameEn: "Fashion", nameTh: "แฟชั่น" },
  { id: "other", nameEn: "Other", nameTh: "อื่นๆ" },
] as const;

export const TASK_GROUPS = [
  { id: "skills", nameEn: "Trades", nameTh: "ช่าง" },
  { id: "jobs", nameEn: "Hospitality", nameTh: "บริการ" },
  { id: "pro", nameEn: "Professional", nameTh: "วิชาชีพ" },
] as const;

export const TASKS = [
  { id: "ac", group: "skills", nameEn: "AC & cooling", nameTh: "แอร์" },
  { id: "electric", group: "skills", nameEn: "Electrician", nameTh: "ช่างไฟ" },
  { id: "moto", group: "skills", nameEn: "Motorbike repair", nameTh: "ซ่อมมอเตอร์ไซค์" },
  { id: "construction", group: "skills", nameEn: "Construction", nameTh: "งานก่อสร้าง" },
  { id: "painting", group: "skills", nameEn: "Painting", nameTh: "ทาสี" },
  { id: "garden", group: "skills", nameEn: "Garden", nameTh: "สวน" },
  { id: "cleaning", group: "skills", nameEn: "Cleaning", nameTh: "ทำความสะอาด" },
  { id: "hospitality", group: "jobs", nameEn: "Restaurant & bar", nameTh: "ร้านอาหารและบาร์" },
  { id: "kitchen", group: "jobs", nameEn: "Kitchen", nameTh: "ครัว" },
  { id: "housekeeping", group: "jobs", nameEn: "Housekeeping", nameTh: "แม่บ้าน" },
  { id: "tourism", group: "jobs", nameEn: "Tours & boats", nameTh: "ทัวร์และเรือ" },
  { id: "tech", group: "pro", nameEn: "Phones & computers", nameTh: "มือถือและคอม" },
  { id: "tutoring", group: "pro", nameEn: "Teaching", nameTh: "สอน" },
  { id: "paperwork", group: "pro", nameEn: "Visa & paperwork", nameTh: "วีซ่าและเอกสาร" },
] as const;

export type TaskId = (typeof TASKS)[number]["id"];

export const OFFER_TYPES = [
  { id: "offer", nameEn: "Offering", nameTh: "เสนอ" },
  { id: "wanted", nameEn: "Looking for", nameTh: "ตามหา" },
] as const;

export const PRICING_TYPES = [
  { id: "sale", nameEn: "Sale price", nameTh: "ราคาขาย" },
  { id: "hourly", nameEn: "Per hour", nameTh: "รายชั่วโมง" },
  { id: "daily", nameEn: "Per day", nameTh: "รายวัน" },
  { id: "monthly", nameEn: "Per month", nameTh: "รายเดือน" },
  { id: "flat", nameEn: "Fixed price", nameTh: "ราคาเหมา" },
] as const;

export const STOCK_PHOTOS: Record<string, string> = {
  trades: "/listings/ac.jpg",
  home: "/listings/garden.jpg",
  cleaning: "/listings/ac.jpg",
  transport: "/listings/pickup.jpg",
  tours: "/listings/kayak.jpg",
  beauty: "/listings/tent.jpg",
  health: "/listings/tent.jpg",
  education: "/listings/tent.jpg",
  legal: "/listings/tent.jpg",
  tech: "/listings/drill.jpg",
  events: "/listings/kayak.jpg",
  property: "/listings/ladder.jpg",
  hospitality: "/listings/tent.jpg",
  tourism: "/listings/kayak.jpg",
  retail: "/listings/scooter.jpg",
  construction: "/listings/ladder.jpg",
  office: "/listings/tent.jpg",
  teaching: "/listings/tent.jpg",
  healthcare: "/listings/tent.jpg",
  household: "/listings/ac.jpg",
  vehicles: "/listings/scooter.jpg",
  boats: "/listings/kayak.jpg",
  electronics: "/listings/drill.jpg",
  furniture: "/listings/stroller.jpg",
  fashion: "/listings/stroller.jpg",
  other: "/listings/pickup.jpg",
};

export function categoriesFor(kind: ListingKind) {
  if (kind === "job") return JOB_CATEGORIES;
  if (kind === "market") return MARKET_CATEGORIES;
  return SERVICE_CATEGORIES;
}

export function pricingFor(kind: ListingKind) {
  if (kind === "job") return PRICING_TYPES.filter((p) => ["hourly", "daily", "monthly", "flat"].includes(p.id));
  if (kind === "market") return PRICING_TYPES.filter((p) => ["sale", "flat"].includes(p.id));
  return PRICING_TYPES.filter((p) => ["hourly", "flat", "daily"].includes(p.id));
}

export function districtById(id: string) {
  return DISTRICTS.find((d) => d.id === id) ?? DISTRICTS[0];
}

export function districtName(id: string, lang: Lang) {
  const d = DISTRICTS.find((x) => x.id === id);
  if (!d) return id;
  return lang === "th" ? d.nameTh : d.nameEn;
}

export function categoryName(kind: ListingKind, id: string, lang: Lang): string {
  const c = categoriesFor(kind).find((x) => x.id === id);
  if (!c) return id;
  return lang === "th" ? c.nameTh : c.nameEn;
}

export function taskName(id: string, lang: Lang): string {
  const t = TASKS.find((x) => x.id === id);
  if (!t) return id;
  return lang === "th" ? t.nameTh : t.nameEn;
}

export function kindLabel(kind: ListingKind, lang: Lang): string {
  if (kind === "job") return lang === "th" ? "งาน" : "Job";
  if (kind === "market") return lang === "th" ? "ตลาด" : "Marketplace";
  return lang === "th" ? "บริการ" : "Service";
}

export const MAP_BOUNDS = {
  minLng: 98.68,
  maxLng: 99.02,
  minLat: 7.96,
  maxLat: 8.22,
};

export function projectMap(lat: number, lng: number): { x: number; y: number } {
  const x =
    ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y =
    ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return {
    x: Math.max(3, Math.min(97, x)),
    y: Math.max(4, Math.min(96, y)),
  };
}
