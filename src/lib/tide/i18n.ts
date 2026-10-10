import { createElement, Fragment, type ReactNode } from "react";
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
  noData: "Keine Prognosedaten für diesen Zeitpunkt",
  loading: "Lade Gezeitenprognose …",
  source: "Quelle",
  station: "Prognosestandort",
  datum: "Höhenbezug",
  notMeasured: "Astronomisch-modellierte Prognose, keine Live-Messung. Nicht zur Navigation.",
  hourly: "Stündlicher Pegel",
  extremes: "Hoch- & Niedrigwasser",
  today: "Heute",
  tapChart: "Tippe oder ziehe über die Kurve, um den Pegel zu dieser Uhrzeit zu sehen.",
  locations: "Standorte",
  useGps: "Meinen Standort verwenden",
  gpsLocating: "Ortung läuft …",
  gpsDenied: "Standortzugriff nicht möglich",
  gpsFar: "Du bist ca. {km} km von den Prognosestandorten entfernt – bitte Standort von Hand wählen",
  sliderLabel: "Zeit verschieben (24 h)",
  predictionPoint: "Prognosepunkt",
  yourPosition: "Dein Standort",
  gpsNearest: "Nächster Prognosestandort",
  autoGps: "Beim Start automatisch per GPS wählen",
  favorites: "Favoriten",
  illustrationNote: "Hintergrund zeigt das Krabi-Deltabecken als Illustration des Pegels.",
  boat: "Mein Boot",
  boatName: "Bootsname",
  draft: "Tiefgang",
  reserve: "Sicherheitsreserve unter dem Kiel",
  homePort: "Heimathafen",
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
  reminderHigh: "Hochwasser in",
  reminderLow: "Niedrigwasser in",
  crossAbove: "Pegel steigt über",
  crossBelow: "Pegel fällt unter",
  at: "um",
  in: "in",
  pickTime: "Uhrzeit wählen",
  dialHint: "Am Rad drehen – eine Umdrehung = 24 Stunden, über Mitternacht in den nächsten Tag.",
  vsNow: "gegenüber jetzt",
  thenNext: "Danach",
  datePick: "Datum (bis 3 Jahre)",
  unitDay: "T",
  unitHour: "h",
  unitMin: "min",
  tour: "Tour",
  tourDrag: "← Diagramm ziehen = Start verschieben →",
  tourBtn: "Tour planen",
  tourDay: "Tag",
  tourTime: "Startzeit",
  tourDuration: "Dauer",
  tourStart: "Start",
  tourEnd: "Ende",
  tourChange: "Veränderung",
  tourLow: "Tiefster",
  tourHigh: "Höchster",
  tourRate: "max.",
  tourEvents: "Hoch-/Niedrigwasser in dieser Zeit",
  tourNone: "Kein Hoch- oder Niedrigwasser im Zeitraum",
  preview: "Vorschau",
  dragHint: "← seitlich ziehen = Vorschau →",
  boatModel: "Modell",
  boatEngine: "Motor",
  boatEnginePh: "z. B. Suzuki 300 PS",
  boatLength: "Länge (m)",
  boatBeam: "Breite (m)",
  boatWeight: "Gewicht ohne Motor (kg)",
  boatFuel: "Tank (l)",
  boatPersons: "Personen max.",
  boatCe: "CE-Kategorie",
  boatMaker: "Herstellerangaben – bitte prüfen.",
  draftMissing:
    "Tiefgang fehlt: bitte ausmessen (tiefster Punkt, z. B. Propeller oder Skeg, beladen). Ohne ihn zeigt die App keine roten Zonen.",
  level: "Pegel",
  zonesTitle: "Flachstellen & Tiefgang",
  zonesShow: "Rote Zonen anzeigen",
  zonesIntro:
    "Trage Flachstellen und Engpässe mit der Tiefe aus deiner Seekarte ein. Die App rechnet Kartentiefe + Gezeit − Tiefgang − Reserve und färbt zu flache Stellen rot.",
  zonesTime: "Zeitpunkt",
  zonesLow: "nächstes NW",
  zonesAdd: "Flachstelle eintragen",
  zonesPoint: "Punkt",
  zonesSegment: "Abschnitt",
  zonesTapA: "Auf die Karte tippen: Position wählen",
  zonesTapB: "Jetzt das Ende des Abschnitts antippen",
  zonesName: "Name",
  zonesDepth: "Kartentiefe (m)",
  zonesDepthHint: "Aus deiner Seekarte, bezogen auf Seekartennull. Trockenfallend: negativ.",
  zonesRadius: "Radius (m)",
  zonesHalfWidth: "Halbe Breite (m)",
  zonesSave: "Speichern",
  zonesDelete: "Löschen",
  zonesCancel: "Abbrechen",
  zonesEmpty: "Noch keine Flachstellen eingetragen.",
  zonesLegendRed: "Rot: unter Tiefgang + Reserve",
  zonesLegendAmber: "Gelb: knapp (< 30 cm)",
  zonesNoClaim: "Nicht markierte Stellen = keine Aussage, keine Freigabe.",
  zonesDatum:
    "Gezeit und Kartentiefe können unterschiedliche Bezugsflächen haben (Abweichung möglich).",
  zonesNeedDraft: "Tiefgang im Captain-Bereich eintragen",
  zonesClearance: "Freiraum",
  draftPublished:
    "Veröffentlichter Herstellerwert, meist für den Rumpf ohne Antrieb. Motor und Propeller können tiefer reichen: bitte am Boot ausmessen oder die Reserve erhöhen, sonst zeigt die App zu wenige rote Zonen.",
  method:
    "Berechnet aus harmonischen Konstanten der Messstation Phuket, lokal korrigiert. Wetter, Monsun und Luftdruck können Pegel um 10–30 cm und Zeiten um 10–20 min verschieben.",
  flood: "FLUT",
  ebb: "EBBE",
  turn: "WECHSEL",
  eventLine: "{type} um {time} Uhr",
  ago: "zurück",
  tplDeparture: "Bei deiner geplanten Abfahrt um {time} wird ein Pegel von {cm} prognostiziert.",
  tplReturn: "Bei deiner geplanten Rückkehr um {time} wird ein Pegel von {cm} prognostiziert.",
  gauge: "PEGEL",
  trend24: "VERLAUF 24 STD",
  hw: "HW",
  nw: "NW",
  scene: "Foto-Hintergrund",
  sceneNote: "Zeigt die Krabi-Illustrationen hinter den Instrumenten.",
  display: "Anzeige",
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
  noData: "No prediction data for this time",
  loading: "Loading tide prediction …",
  source: "Source",
  station: "Prediction point",
  datum: "Datum",
  notMeasured: "Astronomical/model prediction, not a live measurement. Not for navigation.",
  hourly: "Hourly level",
  extremes: "High & low water",
  today: "Today",
  tapChart: "Tap or drag across the curve to read the level at that time.",
  locations: "Locations",
  useGps: "Use my location",
  gpsLocating: "Locating …",
  gpsDenied: "Location access unavailable",
  gpsFar: "You are about {km} km from the prediction points – please pick a location by hand",
  sliderLabel: "Move time (24 h)",
  predictionPoint: "Prediction point",
  yourPosition: "Your position",
  gpsNearest: "Nearest prediction point",
  autoGps: "Pick automatically via GPS on start",
  favorites: "Favourites",
  illustrationNote: "The background shows the Krabi estuary as an illustration of the level.",
  boat: "My boat",
  boatName: "Boat name",
  draft: "Draft",
  reserve: "Under-keel safety reserve",
  homePort: "Home port",
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
  reminderHigh: "High water in",
  reminderLow: "Low water in",
  crossAbove: "Level rises above",
  crossBelow: "Level falls below",
  at: "at",
  in: "in",
  pickTime: "Pick a time",
  dialHint: "Spin the dial – one turn = 24 hours, past midnight rolls into the next day.",
  vsNow: "vs. now",
  thenNext: "Next after that",
  datePick: "Date (up to 3 years)",
  unitDay: "d",
  unitHour: "h",
  unitMin: "min",
  tour: "Tour",
  tourDrag: "← drag chart = move start →",
  tourBtn: "Plan tour",
  tourDay: "Day",
  tourTime: "Start time",
  tourDuration: "Duration",
  tourStart: "Start",
  tourEnd: "End",
  tourChange: "Change",
  tourLow: "Lowest",
  tourHigh: "Highest",
  tourRate: "max.",
  tourEvents: "High/low water during this time",
  tourNone: "No high or low water in this period",
  preview: "Preview",
  dragHint: "← drag sideways = preview →",
  boatModel: "Model",
  boatEngine: "Engine",
  boatEnginePh: "e.g. Suzuki 300 hp",
  boatLength: "Length (m)",
  boatBeam: "Beam (m)",
  boatWeight: "Hull weight, no engine (kg)",
  boatFuel: "Fuel tank (l)",
  boatPersons: "Max. persons",
  boatCe: "CE category",
  boatMaker: "Manufacturer figures – please verify.",
  draftMissing:
    "Draft missing: please measure it (lowest point, e.g. propeller or skeg, loaded). Without it the app shows no red zones.",
  level: "Level",
  zonesTitle: "Shallows & draft",
  zonesShow: "Show red zones",
  zonesIntro:
    "Enter shallows and narrow sections with the depth from your chart. The app computes charted depth + tide − draft − reserve and shades too-shallow spots red.",
  zonesTime: "Time",
  zonesLow: "next LW",
  zonesAdd: "Add shallow spot",
  zonesPoint: "Spot",
  zonesSegment: "Section",
  zonesTapA: "Tap the map to place it",
  zonesTapB: "Now tap the end of the section",
  zonesName: "Name",
  zonesDepth: "Charted depth (m)",
  zonesDepthHint: "From your chart, at chart datum. Drying: negative.",
  zonesRadius: "Radius (m)",
  zonesHalfWidth: "Half width (m)",
  zonesSave: "Save",
  zonesDelete: "Delete",
  zonesCancel: "Cancel",
  zonesEmpty: "No shallow spots yet.",
  zonesLegendRed: "Red: below draft + reserve",
  zonesLegendAmber: "Amber: tight (< 30 cm)",
  zonesNoClaim: "Unmarked spots = no statement, not cleared.",
  zonesDatum: "Tide and charted depth may use different datums (deviation possible).",
  zonesNeedDraft: "Enter your draft on the Captain page",
  zonesClearance: "Clearance",
  draftPublished:
    "Published maker figure, usually for the hull without the drive. Engine and propeller can reach deeper: please measure on the boat or raise the reserve, otherwise the app shows too few red zones.",
  method:
    "Computed from harmonic constants of the Phuket gauge, locally corrected. Weather, monsoon and air pressure can shift levels by 10–30 cm and times by 10–20 min.",
  flood: "FLOOD",
  ebb: "EBB",
  turn: "TURN",
  eventLine: "{type} at {time}",
  ago: "ago",
  tplDeparture: "At your planned departure at {time} a level of {cm} is predicted.",
  tplReturn: "At your planned return at {time} a level of {cm} is predicted.",
  gauge: "GAUGE",
  trend24: "24 H TREND",
  hw: "HW",
  nw: "LW",
  scene: "Photo background",
  sceneNote: "Shows the Krabi illustrations behind the instruments.",
  display: "Display",
};

const th: Record<TideKey, string> = {
  forecastNow: "พยากรณ์น้ำขึ้นน้ำลงปัจจุบัน",
  simulation: "จำลอง",
  rising: "น้ำขึ้น – ระดับน้ำสูงขึ้น",
  falling: "น้ำลง – ระดับน้ำลดลง",
  slack: "น้ำเปลี่ยนทิศ",
  nextHighIn: "น้ำขึ้นสูงสุดครั้งถัดไปในอีก",
  nextLowIn: "น้ำลงต่ำสุดครั้งถัดไปในอีก",
  highAt: "น้ำขึ้นสูงสุด",
  lowAt: "น้ำลงต่ำสุด",
  last30: "30 นาทีที่ผ่านมา",
  perHour: "ต่อชั่วโมง",
  toGo: "ถึงจุดสูง/ต่ำสุด",
  simulate: "จำลองน้ำขึ้นน้ำลง",
  close: "ปิด",
  backToNow: "กลับสู่ปัจจุบัน",
  now: "ตอนนี้",
  tides: "น้ำขึ้นน้ำลง",
  map: "แผนที่",
  captain: "กัปตัน",
  noData: "ไม่มีข้อมูลพยากรณ์สำหรับเวลานี้",
  loading: "กำลังโหลดข้อมูลพยากรณ์ …",
  source: "แหล่งข้อมูล",
  station: "จุดพยากรณ์",
  datum: "ระดับอ้างอิง",
  notMeasured: "เป็นการพยากรณ์ทางดาราศาสตร์/แบบจำลอง ไม่ใช่ค่าที่วัดสด ห้ามใช้เพื่อการเดินเรือ",
  hourly: "ระดับน้ำรายชั่วโมง",
  extremes: "น้ำขึ้นสูงสุดและน้ำลงต่ำสุด",
  today: "วันนี้",
  tapChart: "แตะหรือลากบนกราฟเพื่อดูระดับน้ำ ณ เวลานั้น",
  locations: "สถานที่",
  useGps: "ใช้ตำแหน่งของฉัน",
  gpsLocating: "กำลังหาตำแหน่ง …",
  gpsDenied: "ไม่สามารถเข้าถึงตำแหน่งได้",
  gpsFar: "คุณอยู่ห่างจากจุดพยากรณ์ประมาณ {km} กม. — กรุณาเลือกสถานที่เอง",
  sliderLabel: "เลื่อนเวลา (24 ชม.)",
  predictionPoint: "จุดพยากรณ์",
  yourPosition: "ตำแหน่งของคุณ",
  gpsNearest: "จุดพยากรณ์ที่ใกล้ที่สุด",
  autoGps: "เลือกด้วย GPS อัตโนมัติเมื่อเปิดแอป",
  favorites: "รายการโปรด",
  illustrationNote: "ภาพพื้นหลังเป็นภาพประกอบของระดับน้ำ",
  boat: "เรือของฉัน",
  boatName: "ชื่อเรือ",
  draft: "กินน้ำลึก",
  reserve: "ระยะปลอดภัยใต้กระดูกงู",
  homePort: "ท่าเรือประจำ",
  minDepth: "ความลึกน้ำที่ต้องการ (กินน้ำลึก + ระยะปลอดภัย)",
  depthHint:
    "ตรวจสอบกับแผนที่เดินเรือที่ยืนยันแล้วด้วยตนเอง: ความลึกในแผนที่ + ระดับน้ำที่พยากรณ์ ต้องไม่น้อยกว่าค่านี้",
  noUkc:
    "หากไม่มีข้อมูลความลึกจากแผนที่ที่ยืนยันแล้ว แอปไม่สามารถคำนวณความลึกน้ำจริงหรือระยะใต้กระดูกงูได้ และไม่ใช่การรับรองว่าผ่านได้อย่างปลอดภัย",
  alerts: "การแจ้งเตือน",
  beforeHigh: "เตือนก่อนน้ำขึ้นสูงสุด",
  beforeLow: "เตือนก่อนน้ำลงต่ำสุด",
  leadTime: "เตือนล่วงหน้า",
  minutes: "นาที",
  aboveAlarm: "แจ้งเตือนเมื่อระดับสูงกว่า",
  belowAlarm: "แจ้งเตือนเมื่อระดับต่ำกว่า",
  alertsNote:
    "การแจ้งเตือนอิงจากการพยากรณ์ของสถานที่ที่เลือก และทำงานขณะเปิด CAPTAIN TIDE หรือทำงานอยู่เบื้องหลัง",
  enableNotif: "อนุญาตการแจ้งเตือน",
  notifBlocked: "ถูกเบราว์เซอร์บล็อก",
  language: "ภาษา",
  play: "เล่น",
  pause: "หยุดชั่วคราว",
  reminderHigh: "น้ำขึ้นสูงสุดในอีก",
  reminderLow: "น้ำลงต่ำสุดในอีก",
  crossAbove: "ระดับน้ำสูงกว่า",
  crossBelow: "ระดับน้ำต่ำกว่า",
  at: "เวลา",
  in: "อีก",
  pickTime: "เลือกเวลา",
  dialHint: "หมุนวงล้อ – 1 รอบ = 24 ชั่วโมง ข้ามเที่ยงคืนไปวันถัดไป",
  vsNow: "เทียบกับตอนนี้",
  thenNext: "ถัดไป",
  datePick: "วันที่ (ล่วงหน้าได้ 3 ปี)",
  unitDay: "วัน",
  unitHour: "ชม.",
  unitMin: "นาที",
  tour: "ทริป",
  tourDrag: "← ลากกราฟเพื่อเลื่อนเวลาเริ่ม →",
  tourBtn: "วางแผนทริป",
  tourDay: "วัน",
  tourTime: "เวลาเริ่ม",
  tourDuration: "ระยะเวลา",
  tourStart: "เริ่ม",
  tourEnd: "สิ้นสุด",
  tourChange: "การเปลี่ยนแปลง",
  tourLow: "ต่ำสุด",
  tourHigh: "สูงสุด",
  tourRate: "สูงสุด",
  tourEvents: "น้ำขึ้นสูงสุด/น้ำลงต่ำสุดในช่วงนี้",
  tourNone: "ไม่มีน้ำขึ้นสูงสุดหรือน้ำลงต่ำสุดในช่วงนี้",
  preview: "ตัวอย่าง",
  dragHint: "← ลากด้านข้างเพื่อดูตัวอย่าง →",
  boatModel: "รุ่น",
  boatEngine: "เครื่องยนต์",
  boatEnginePh: "เช่น Suzuki 300 แรงม้า",
  boatLength: "ความยาว (ม.)",
  boatBeam: "ความกว้าง (ม.)",
  boatWeight: "น้ำหนักตัวเรือไม่รวมเครื่อง (กก.)",
  boatFuel: "ถังน้ำมัน (ลิตร)",
  boatPersons: "จำนวนคนสูงสุด",
  boatCe: "ประเภท CE",
  boatMaker: "ข้อมูลจากผู้ผลิต – โปรดตรวจสอบ",
  draftMissing:
    "ยังไม่มีค่ากินน้ำลึก: โปรดวัด (จุดต่ำสุด เช่น ใบจักรหรือสเกก ขณะบรรทุก) หากไม่มี แอปจะไม่แสดงโซนสีแดง",
  level: "ระดับน้ำ",
  zonesTitle: "จุดน้ำตื้นและกินน้ำลึก",
  zonesShow: "แสดงโซนสีแดง",
  zonesIntro:
    "บันทึกจุดน้ำตื้นและช่องแคบพร้อมความลึกจากแผนที่เดินเรือของคุณ แอปจะคำนวณความลึกในแผนที่ + ระดับน้ำ − กินน้ำลึก − ระยะปลอดภัย และแรเงาจุดที่ตื้นเกินไปเป็นสีแดง",
  zonesTime: "เวลา",
  zonesLow: "น้ำลงต่ำสุดถัดไป",
  zonesAdd: "เพิ่มจุดน้ำตื้น",
  zonesPoint: "จุด",
  zonesSegment: "ช่วง",
  zonesTapA: "แตะแผนที่เพื่อเลือกตำแหน่ง",
  zonesTapB: "แตะที่ปลายของช่วง",
  zonesName: "ชื่อ",
  zonesDepth: "ความลึกในแผนที่ (ม.)",
  zonesDepthHint: "จากแผนที่ของคุณ อ้างอิงระดับศูนย์แผนที่ ถ้าโผล่พ้นน้ำให้ใส่ค่าติดลบ",
  zonesRadius: "รัศมี (ม.)",
  zonesHalfWidth: "ครึ่งความกว้าง (ม.)",
  zonesSave: "บันทึก",
  zonesDelete: "ลบ",
  zonesCancel: "ยกเลิก",
  zonesEmpty: "ยังไม่มีจุดน้ำตื้น",
  zonesLegendRed: "แดง: ต่ำกว่ากินน้ำลึก + ระยะปลอดภัย",
  zonesLegendAmber: "เหลือง: เฉียด (< 30 ซม.)",
  zonesNoClaim: "จุดที่ไม่ได้ทำเครื่องหมาย = ไม่มีข้อมูล ไม่ใช่การรับรอง",
  zonesDatum: "ระดับน้ำและความลึกในแผนที่อาจใช้ระดับอ้างอิงต่างกัน (อาจคลาดเคลื่อน)",
  zonesNeedDraft: "กรอกค่ากินน้ำลึกที่หน้ากัปตัน",
  zonesClearance: "ระยะเหลือ",
  draftPublished:
    "ค่าที่ผู้ผลิตเผยแพร่ มักเป็นค่าของตัวเรือไม่รวมเครื่องยนต์ เครื่องและใบจักรอาจลึกกว่า โปรดวัดจริงที่เรือหรือเพิ่มระยะปลอดภัย มิฉะนั้นแอปจะแสดงโซนสีแดงน้อยเกินไป",
  method:
    "คำนวณจากค่าคงที่ฮาร์มอนิกของสถานีวัดน้ำภูเก็ต ปรับแก้ตามพื้นที่ สภาพอากาศ มรสุม และความกดอากาศอาจทำให้ระดับน้ำคลาดเคลื่อน 10–30 ซม. และเวลาคลาดเคลื่อน 10–20 นาที",
  flood: "น้ำขึ้น",
  ebb: "น้ำลง",
  turn: "เปลี่ยนทิศ",
  eventLine: "{type} เวลา {time} น.",
  ago: "ที่แล้ว",
  tplDeparture: "ที่เวลาออกเดินทางตามแผน {time} คาดการณ์ระดับน้ำ {cm}",
  tplReturn: "ที่เวลาเดินทางกลับตามแผน {time} คาดการณ์ระดับน้ำ {cm}",
  gauge: "เกจน้ำ",
  trend24: "แนวโน้ม 24 ชม.",
  hw: "สูงสุด",
  nw: "ต่ำสุด",
  scene: "ภาพพื้นหลัง",
  sceneNote: "แสดงภาพประกอบกระบี่ด้านหลังเครื่องมือวัด",
  display: "การแสดงผล",
};

const dicts: Record<TideLang, Record<TideKey, string>> = { de, en, th };

export function translate(lang: TideLang, k: TideKey): string {
  return dicts[lang][k];
}

export function useTT() {
  const lang = useTideSettings((s) => s.lang);
  const t = (k: TideKey) => dicts[lang][k];
  return { t, lang };
}

export const LOCALES: Record<TideLang, string> = {
  de: "de-DE",
  en: "en-GB",
  // Gregorian years and Latin digits: easier to read on a boat, matches the gauge numbers.
  th: "th-TH-u-ca-gregory-nu-latn",
};

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmt(lang: TideLang, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = lang + JSON.stringify(opts);
  let f = fmtCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(LOCALES[lang], { timeZone: TZ, ...opts });
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

/** Fill "{name}" slots with nodes (so values can be bold/coloured); word order stays per language. */
export function fill(template: string, vars: Record<string, ReactNode>): ReactNode[] {
  return template.split(/(\{\w+\})/g).map((part, i) => {
    const m = /^\{(\w+)\}$/.exec(part);
    return createElement(Fragment, { key: i }, m ? (vars[m[1]] ?? "") : part);
  });
}

export function fmtMeters(cm: number, lang: TideLang): string {
  return (cm / 100).toLocaleString(LOCALES[lang], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** "5 h 49 min" / "1 d 2 h 05 min" in the active language. */
export function fmtDuration(ms: number, lang: TideLang): string {
  const total = Math.round(Math.abs(ms) / 60_000);
  const d = Math.floor(total / 1440);
  const h = Math.floor((total % 1440) / 60);
  const m = total % 60;
  const u = (k: TideKey) => translate(lang, k);
  return `${d ? `${d} ${u("unitDay")} ` : ""}${h} ${u("unitHour")} ${String(m).padStart(2, "0")} ${u("unitMin")}`;
}
