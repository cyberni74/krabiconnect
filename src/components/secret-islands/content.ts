export type Lang = "de" | "en" | "zh" | "ko" | "ja";
/** Source strings: German + English. zh/ko/ja are looked up by the German text in ./i18n. */
export type L = { de: string; en: string };

export const LANGS: { id: Lang; label: string; flag: string; html: string }[] = [
  { id: "de", label: "Deutsch", flag: "🇩🇪", html: "de" },
  { id: "en", label: "English", flag: "🇬🇧", html: "en" },
  { id: "zh", label: "中文", flag: "🇨🇳", html: "zh-Hans" },
  { id: "ko", label: "한국어", flag: "🇰🇷", html: "ko" },
  { id: "ja", label: "日本語", flag: "🇯🇵", html: "ja" },
];

export const BRAND = {
  name: "Krabi Secret Islands",
  domain: "krabi-secret-islands.com",
  email: "info@krabi-secret-islands.com",
  // TODO: replace with the real WhatsApp business number (international format, digits only).
  whatsapp: "66812345678",
  whatsappDisplay: "+66 81 234 5678",
  location: { de: "Ao Nang / Krabi, Thailand", en: "Ao Nang / Krabi, Thailand" },
};

/** Logo mark generated with Higgsfield (GPT Image 2.5). Move into /public/brand/ for production. */
export const LOGO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_37pB8NNBCXw21nrSwh5C0AozDjm/hf_20261004_044905_49752f2a-c380-4b9a-a061-294ac851b827.png";

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const IMG = {
  hero: u("1552465011-b4e21bf6e79a", 1800),
  sandbar: u("1559128010-7c1ad6e1b6a5"),
  lagoon: u("1537956965359-7573183d1f57"),
  beach: u("1507525428034-b723cf961d3e"),
  island: u("1504214208698-ea1916a2195a"),
  aerial: u("1506953823976-52e1fdc0149a"),
  sunset: u("1530053969600-caed2596d242"),
  snorkel: u("1544551763-46a013bb70d5"),
  snorkel2: u("1544551763-77ef2d0cfc6c"),
  boat: u("1567899378494-47b22a2ae96a"),
  cliffs: u("1589394815804-964ed0be2eb5"),
  bay: u("1519046904884-53103b34b206"),
};

export const VIDEO = {
  heroLoop: "https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4",
  reel1: "https://videos.pexels.com/video-files/3571264/3571264-uhd_1440_2560_30fps.mp4",
  reel2: "https://videos.pexels.com/video-files/4763824/4763824-uhd_1440_2560_24fps.mp4",
  cinematic: "https://videos.pexels.com/video-files/1918465/1918465-uhd_2560_1440_24fps.mp4",
};

export const UI = {
  navTours: { de: "Touren", en: "Tours" },
  navDrone: { de: "Drohne", en: "Drone" },
  navGallery: { de: "Galerie", en: "Gallery" },
  navGuide: { de: "Guide", en: "Guide" },
  navFaq: { de: "FAQ", en: "FAQ" },
  ctaInquire: { de: "Jetzt Wunschtermin anfragen", en: "Request your preferred date" },
  ctaTour: { de: "Tour anfragen", en: "Request tour" },
  ctaWhatsapp: { de: "WhatsApp Direkt", en: "WhatsApp Direct" },
  heroBadge: {
    de: "Max. 5 Personen • Absolute Privatsphäre • Geheime Spots",
    en: "Max. 5 guests • Total privacy • Secret spots",
  },
  heroTitleA: { de: "Krabi Secret Islands –", en: "Krabi Secret Islands –" },
  heroTitleB: { de: "Ihr privates Speedboat-Abenteuer", en: "your private speedboat adventure" },
  heroSub: {
    de: "Kein Massentourismus. Keine lauten Longtail-Boote. Nur Sie, kristallklares Wasser und unberührte Inselparadiese.",
    en: "No mass tourism. No noisy longtail boats. Just you, crystal-clear water and untouched island paradises.",
  },
  heroPrimary: { de: "Jetzt Verfügbarkeit prüfen", en: "Check availability" },
  heroSecondary: { de: "Drohnen-Videos ansehen", en: "Watch drone videos" },
  pills: [
    { de: "Max. 5 Gäste", en: "Max. 5 guests" },
    { de: "4K Drohnen-Paket", en: "4K drone package" },
    { de: "Flexible Abfahrtszeiten", en: "Flexible departures" },
    { de: "Inkl. Drinks & Snacks", en: "Drinks & snacks incl." },
  ],
  stats: [
    { v: "4.9", l: { de: "Ø Bewertung", en: "Avg. rating" } },
    { v: "1.200+", l: { de: "Private Touren", en: "Private tours" } },
    { v: "5", l: { de: "Gäste max.", en: "Guests max." } },
  ],
  compareEyebrow: { de: "Der Unterschied", en: "The difference" },
  compareTitle: { de: "Warum Krabi Secret Islands vs. Andere", en: "Why Krabi Secret Islands vs. the rest" },
  compareSub: {
    de: "Derselbe Ozean – ein völlig anderes Erlebnis. Tippen Sie auf eine Bootsart zum Vergleichen.",
    en: "Same ocean – a completely different experience. Tap a boat type to compare.",
  },
  toursEyebrow: { de: "Exklusive Touren", en: "Exclusive tours" },
  toursTitle: { de: "Ihre private Route. Ihr Tempo.", en: "Your private route. Your pace." },
  toursSub: {
    de: "Alle Touren ganztägig oder halbtägig buchbar – Preis gilt pro Boot, nicht pro Person.",
    en: "All tours available as full or half day – price is per boat, not per person.",
  },
  perBoat: { de: "pro Boot", en: "per boat" },
  from: { de: "ab", en: "from" },
  details: { de: "Details & Anfragen", en: "Details & inquire" },
  stops: { de: "Stopps", en: "Stops" },
  included: { de: "Inklusive", en: "Included" },
  duration: { de: "Dauer", en: "Duration" },
  droneEyebrow: { de: "Highlight", en: "Highlight" },
  droneTitle: { de: "4K Drohnen- & Content-Package", en: "4K drone & content package" },
  droneText: {
    de: "Halten Sie Ihre unvergesslichen Momente fest! Inklusive professioneller 4K Luftaufnahmen vom Boot, den Traumstränden und Lagunen. Fertig geschnitten für Instagram/TikTok oder als Rohmaterial am selben Tag direkt auf Ihr Smartphone.",
    en: "Capture your unforgettable moments! Professional 4K aerial footage of your boat, dream beaches and lagoons. Edited and ready for Instagram/TikTok, or as raw files delivered to your phone the same day.",
  },
  droneButton: { de: "Drohnen-Beispiele ansehen", en: "View drone samples" },
  droneFeatures: [
    { de: "Lizenzierter Pilot (CAAT/NBTC)", en: "Licensed pilot (CAAT/NBTC)" },
    { de: "30–60 Sek. Reel, vertikal geschnitten", en: "30–60 sec reel, vertical edit" },
    { de: "40+ bearbeitete Luftbilder", en: "40+ edited aerial photos" },
    { de: "Lieferung am selben Abend", en: "Same-evening delivery" },
  ],
  galleryEyebrow: { de: "Galerie", en: "Gallery" },
  galleryTitle: { de: "Sehen, was andere nie sehen", en: "See what others never see" },
  reelsTitle: { de: "Video-Reels & Cinematic Drone", en: "Video reels & cinematic drone" },
  guideEyebrow: { de: "Insider Blog & Reiseführer", en: "Insider blog & travel guide" },
  guideTitle: { de: "Krabi Secret Islands Guide", en: "Krabi Secret Islands Guide" },
  guideSub: {
    de: "Insider-Wissen für Ihren perfekten Tag auf dem Meer.",
    en: "Insider knowledge for your perfect day at sea.",
  },
  searchPlaceholder: { de: "Guide durchsuchen …", en: "Search the guide …" },
  readMore: { de: "Weiterlesen", en: "Read more" },
  minRead: { de: "Min. Lesezeit", en: "min read" },
  noResults: { de: "Keine Artikel gefunden.", en: "No articles found." },
  articleCta: { de: "Inseltour nach diesem Guide anfragen", en: "Request an island tour based on this guide" },
  reviewsEyebrow: { de: "Gästestimmen", en: "Guest reviews" },
  reviewsTitle: { de: "Privat. Leise. Unvergesslich.", en: "Private. Quiet. Unforgettable." },
  faqEyebrow: { de: "FAQ", en: "FAQ" },
  faqTitle: { de: "Häufige Fragen", en: "Frequently asked questions" },
  finalTitle: { de: "Ihr Inselparadies wartet – nur für Sie.", en: "Your island paradise awaits – just for you." },
  finalSub: {
    de: "Antwort meist innerhalb von 30 Minuten. Unverbindlich & kostenlos anfragen.",
    en: "Usually answered within 30 minutes. Free, no-obligation request.",
  },
  footerTagline: {
    de: "Private Speedboat-Charter für max. 5 Gäste. Abseits der Massen, seit 2016.",
    en: "Private speedboat charter for max. 5 guests. Away from the crowds, since 2016.",
  },
  imprint: { de: "Impressum", en: "Imprint" },
  privacy: { de: "Datenschutz", en: "Privacy policy" },
  tat: { de: "TAT Lizenz Nr. 34/01234", en: "TAT License No. 34/01234" },
  marine: { de: "Marine Department geprüft", en: "Marine Department certified" },
  contact: { de: "Kontakt", en: "Contact" },
  legalNote: {
    de: "Lizenzierter Tourveranstalter, registriert bei der Tourism Authority of Thailand. Alle Boote mit Rettungswesten, Erste-Hilfe-Ausrüstung und Marine-Funk.",
    en: "Licensed tour operator registered with the Tourism Authority of Thailand. All boats carry life jackets, first-aid kits and marine radio.",
  },
  close: { de: "Schließen", en: "Close" },
} satisfies Record<string, unknown>;

export type ComparisonId = "ksi" | "group" | "longtail";
export const COMPARISON: {
  id: ComparisonId;
  name: L;
  short: L;
  tag: L;
  good: boolean;
  points: L[];
}[] = [
  {
    id: "ksi",
    name: { de: "Krabi Secret Islands", en: "Krabi Secret Islands" },
    short: { de: "Secret Islands", en: "Secret Islands" },
    tag: { de: "Privat-Charter", en: "Private charter" },
    good: true,
    points: [
      { de: "Max. 5 Gäste – nur Ihre Gruppe", en: "Max. 5 guests – only your group" },
      { de: "Leise, saubere 4-Takt-Motoren", en: "Quiet, clean 4-stroke engines" },
      { de: "Schattige Liegeflächen & Bimini-Top", en: "Shaded sun pads & bimini top" },
      { de: "Optionale 4K Drohnenfotos", en: "Optional 4K drone photos" },
      { de: "Flexible Routen & geheime Spots", en: "Flexible routes & secret spots" },
    ],
  },
  {
    id: "group",
    name: { de: "Gruppen-Speedboote", en: "Group speedboats" },
    short: { de: "Gruppen-Speedboote", en: "Group speedboats" },
    tag: { de: "Massentour", en: "Mass tour" },
    good: false,
    points: [
      { de: "30–40 fremde Personen an Bord", en: "30–40 strangers on board" },
      { de: "Starrer Zeitplan, keine Pausen nach Wunsch", en: "Rigid schedule, no stops on request" },
      { de: "Überfüllte Buchten zur Hauptzeit", en: "Crowded bays at peak time" },
      { de: "Enge Sitzbänke, kaum Schatten", en: "Cramped benches, little shade" },
    ],
  },
  {
    id: "longtail",
    name: { de: "Klassische Longtail-Boote", en: "Classic longtail boats" },
    short: { de: "Longtail-Boote", en: "Longtail boats" },
    tag: { de: "Traditionell", en: "Traditional" },
    good: false,
    points: [
      { de: "Lauter, offener Dieselmotor", en: "Loud, open diesel engine" },
      { de: "Spritzendes Wasser – alles wird nass", en: "Spraying water – everything gets wet" },
      { de: "Unbequeme Holzsitze", en: "Uncomfortable wooden seats" },
      { de: "Langsam – weniger Zeit an den Spots", en: "Slow – less time at the spots" },
    ],
  },
];

export type TourCategory = "classic" | "secret" | "sunset";
export const TOUR_FILTERS: { id: "all" | TourCategory; label: L }[] = [
  { id: "all", label: { de: "Alle", en: "All" } },
  { id: "classic", label: { de: "Klassiker Neu Entdeckt", en: "Classics rediscovered" } },
  { id: "secret", label: { de: "Geheimtipps", en: "Hidden gems" } },
  { id: "sunset", label: { de: "Sunset & Romantik", en: "Sunset & romance" } },
];

export type Tour = {
  id: string;
  title: L;
  short: L;
  categories: TourCategory[];
  image: string;
  price: number;
  duration: L;
  badge?: L;
  stops: string[];
  description: L;
  includes: L[];
};

export const TOURS: Tour[] = [
  {
    id: "4islands-sunset",
    title: { de: "4-Islands VIP & Sunset Special", en: "4-Islands VIP & Sunset Special" },
    short: {
      de: "Die berühmten Inseln – aber dann, wenn die Massen weg sind.",
      en: "The famous islands – but when the crowds are gone.",
    },
    categories: ["classic", "sunset"],
    image: IMG.sunset,
    price: 18500,
    duration: { de: "13:00 – 19:00 (6 Std.)", en: "1 pm – 7 pm (6 hrs)" },
    badge: { de: "Bestseller", en: "Bestseller" },
    stops: ["Koh Poda", "Chicken Island", "Tup Sandbank", "Phra Nang Cave"],
    description: {
      de: "Wir starten, wenn die Gruppenboote zurückfahren. Sie laufen bei Ebbe über die Tup-Sandbank, schnorcheln an Chicken Island und genießen den Sonnenuntergang vor den Kalksteinfelsen von Phra Nang – mit gekühltem Prosecco an Bord.",
      en: "We depart as the group boats head home. Walk the Tup sandbar at low tide, snorkel at Chicken Island and watch the sunset in front of Phra Nang's limestone cliffs – with chilled prosecco on board.",
    },
    includes: [
      { de: "Privates Speedboat & Kapitän", en: "Private speedboat & captain" },
      { de: "Softdrinks, Obst & Snacks", en: "Soft drinks, fruit & snacks" },
      { de: "Sunset-Prosecco", en: "Sunset prosecco" },
      { de: "Schnorchel-Equipment", en: "Snorkel gear" },
      { de: "Hotel-Transfer Ao Nang", en: "Hotel transfer Ao Nang" },
    ],
  },
  {
    id: "hong-lagoons",
    title: { de: "Hong Island Secret Lagoons & Hidden Bays", en: "Hong Island Secret Lagoons & Hidden Bays" },
    short: {
      de: "Smaragdgrüne Lagunen und Buchten, die kein Gruppenboot anfährt.",
      en: "Emerald lagoons and bays no group boat visits.",
    },
    categories: ["secret", "classic"],
    image: IMG.lagoon,
    price: 21500,
    duration: { de: "08:00 – 15:00 (7 Std.)", en: "8 am – 3 pm (7 hrs)" },
    stops: ["Koh Hong", "Koh Lao Lading", "Koh Pakbia"],
    description: {
      de: "Früh am Morgen gehört die Hong-Lagune Ihnen. Danach geht's zur winzigen Bucht von Koh Lao Lading und zu den Doppelstränden von Koh Pakbia – ideal für ein langes Schwimm- und Schnorchelpicknick.",
      en: "Early in the morning, Hong Lagoon belongs to you. Then on to the tiny cove of Koh Lao Lading and the twin beaches of Koh Pakbia – perfect for a long swim and snorkel picnic.",
    },
    includes: [
      { de: "Privates Speedboat & Kapitän", en: "Private speedboat & captain" },
      { de: "Thai-Lunchbox oder Picknick", en: "Thai lunch box or picnic" },
      { de: "Nationalpark-Gebühren", en: "National park fees" },
      { de: "Schnorchel-Equipment & SUP", en: "Snorkel gear & SUP" },
      { de: "Hotel-Transfer Ao Nang", en: "Hotel transfer Ao Nang" },
    ],
  },
  {
    id: "phang-nga-uncharted",
    title: { de: "Uncharted Phang Nga & Secret Islands", en: "Uncharted Phang Nga & Secret Islands" },
    short: {
      de: "Koh Roi, Koh Kudu, Koh Nok – 100 % abseits der Massen.",
      en: "Koh Roi, Koh Kudu, Koh Nok – 100% off the beaten path.",
    },
    categories: ["secret"],
    image: IMG.cliffs,
    price: 26000,
    duration: { de: "08:00 – 16:30 (8,5 Std.)", en: "8 am – 4:30 pm (8.5 hrs)" },
    badge: { de: "100 % Geheimtipp", en: "100% hidden gem" },
    stops: ["Koh Roi", "Koh Kudu", "Koh Nok"],
    description: {
      de: "Unsere Expedition in die nördliche Phang-Nga-Bucht: Schwimmen Sie bei Flut durch den Felstunnel in die versteckte Lagune von Koh Roi, entdecken Sie das Kudu-Hong und picknicken Sie allein am Strand von Koh Nok.",
      en: "Our expedition into northern Phang Nga Bay: swim through the rock tunnel into Koh Roi's hidden lagoon at high tide, explore the Kudu hong and picnic alone on Koh Nok's beach.",
    },
    includes: [
      { de: "Privates Speedboat & Kapitän", en: "Private speedboat & captain" },
      { de: "Gourmet-Picknick am Strand", en: "Gourmet beach picnic" },
      { de: "Kajak für die Lagunen", en: "Kayak for the lagoons" },
      { de: "Nationalpark-Gebühren", en: "National park fees" },
      { de: "Hotel-Transfer Krabi/Ao Nang", en: "Hotel transfer Krabi/Ao Nang" },
    ],
  },
];

export const EXTRAS = [
  {
    id: "drone",
    label: { de: "4K Drohnen-Paket", en: "4K drone package" },
    desc: { de: "Pilot, Reel + 40 Luftbilder", en: "Pilot, reel + 40 aerial photos" },
    price: 4500,
    perPerson: false,
  },
  {
    id: "picnic",
    label: { de: "Gourmet-Picknick", en: "Gourmet picnic" },
    desc: { de: "Thai-Fusion am privaten Strand", en: "Thai fusion on a private beach" },
    price: 1200,
    perPerson: true,
  },
  {
    id: "champagne",
    label: { de: "Champagner & Deko", en: "Champagne & decor" },
    desc: { de: "Für Antrag, Jahrestag & Co.", en: "For proposals, anniversaries & more" },
    price: 3500,
    perPerson: false,
  },
] as const;
export type ExtraId = (typeof EXTRAS)[number]["id"];

export type GalleryCat = "drone" | "secret" | "reels" | "underwater";
export const GALLERY_TABS: { id: "all" | GalleryCat; label: L }[] = [
  { id: "all", label: { de: "Alle", en: "All" } },
  { id: "drone", label: { de: "Drohnen-Aufnahmen", en: "Drone shots" } },
  { id: "secret", label: { de: "Geheime Inseln", en: "Secret islands" } },
  { id: "reels", label: { de: "Video-Reels", en: "Video reels" } },
  { id: "underwater", label: { de: "Unterwasser/Schnorcheln", en: "Underwater/snorkeling" } },
];

export type GalleryItem = {
  id: string;
  cat: GalleryCat;
  src: string;
  title: L;
  video?: string;
  tall?: boolean;
};

export const GALLERY: GalleryItem[] = [
  { id: "g1", cat: "drone", src: IMG.sandbar, title: { de: "Tup-Sandbank bei Ebbe", en: "Tup sandbar at low tide" }, tall: true },
  { id: "g2", cat: "secret", src: IMG.cliffs, title: { de: "Koh Roi – versteckte Lagune", en: "Koh Roi – hidden lagoon" } },
  { id: "g3", cat: "reels", src: IMG.aerial, title: { de: "Reel: Ankunft Koh Kudu", en: "Reel: arriving at Koh Kudu" }, video: VIDEO.reel1, tall: true },
  { id: "g4", cat: "underwater", src: IMG.snorkel, title: { de: "Schnorcheln an Chicken Island", en: "Snorkeling at Chicken Island" } },
  { id: "g5", cat: "drone", src: IMG.island, title: { de: "Private Bucht von oben", en: "Private bay from above" } },
  { id: "g6", cat: "secret", src: IMG.bay, title: { de: "Koh Kudu – menschenleer", en: "Koh Kudu – deserted" }, tall: true },
  { id: "g7", cat: "underwater", src: IMG.snorkel2, title: { de: "Korallengarten Koh Pakbia", en: "Coral garden Koh Pakbia" } },
  { id: "g8", cat: "reels", src: IMG.lagoon, title: { de: "Reel: Hong-Lagune", en: "Reel: Hong Lagoon" }, video: VIDEO.reel2 },
  { id: "g9", cat: "drone", src: IMG.boat, title: { de: "Ihr privates Boot-Setup", en: "Your private boat setup" } },
  { id: "g10", cat: "secret", src: IMG.beach, title: { de: "Koh Nok – nur für Sie", en: "Koh Nok – just for you" } },
];

export type Article = {
  id: string;
  title: L;
  excerpt: L;
  category: L;
  image: string;
  minutes: number;
  tourId: string;
  body: { de: string[]; en: string[] };
};

export const ARTICLES: Article[] = [
  {
    id: "best-time-4-islands",
    title: {
      de: "Die beste Uhrzeit für die 4-Islands-Tour: Wie Sie den Massen entkommen",
      en: "The best time for the 4-Islands tour: how to escape the crowds",
    },
    excerpt: {
      de: "Zwischen 10 und 14 Uhr landen über 60 Boote an Poda. Wir zeigen, wann die Inseln wirklich leer sind.",
      en: "Between 10 am and 2 pm over 60 boats land at Poda. Here's when the islands are truly empty.",
    },
    category: { de: "Planung", en: "Planning" },
    image: IMG.sunset,
    minutes: 4,
    tourId: "4islands-sunset",
    body: {
      de: [
        "Die 4-Islands-Tour ist die beliebteste Tour in Krabi – und genau das ist ihr Problem. Zwischen 10:00 und 14:00 Uhr legen an Koh Poda und der Tup-Sandbank teils über 60 Boote gleichzeitig an.",
        "Der Trick: antizyklisch fahren. Entweder sehr früh (Abfahrt 07:30) oder spät (ab 13:30). Die Gruppenboote folgen alle demselben Fahrplan, weil Hotel-Pick-ups und Mittagessen fest getaktet sind.",
        "Mit einem privaten Speedboat starten wir, wenn die anderen gehen. Gegen 16:00 Uhr ist Koh Poda fast leer, das Licht wird golden und die Sandbank zeigt sich bei Ebbe von ihrer schönsten Seite.",
        "Unser Tipp: Kombinieren Sie die späte Abfahrt mit dem Sonnenuntergang vor Phra Nang. Kein anderes Boot bleibt so lange – das ist der Moment, den Sie nie vergessen werden.",
      ],
      en: [
        "The 4-Islands tour is Krabi's most popular trip – and that's exactly its problem. Between 10 am and 2 pm, more than 60 boats can be moored at Koh Poda and Tup sandbar at the same time.",
        "The trick: go against the flow. Either very early (7:30 am) or late (from 1:30 pm). Group boats all follow the same schedule because hotel pick-ups and lunch are fixed.",
        "With a private speedboat we leave when the others go home. Around 4 pm Koh Poda is almost empty, the light turns golden and the sandbar shines at low tide.",
        "Our tip: combine the late departure with sunset at Phra Nang. No other boat stays that long – it's the moment you will never forget.",
      ],
    },
  },
  {
    id: "tide-guide",
    title: {
      de: "Gezeiten-Guide Krabi: Wann sind die schönsten Sandbänke sichtbar?",
      en: "Krabi tide guide: when are the most beautiful sandbars visible?",
    },
    excerpt: {
      de: "Die Tup-Sandbank erscheint nur bei Ebbe. So planen Sie Ihren Tag nach dem Mond.",
      en: "Tup sandbar only appears at low tide. How to plan your day by the moon.",
    },
    category: { de: "Natur", en: "Nature" },
    image: IMG.sandbar,
    minutes: 5,
    tourId: "4islands-sunset",
    body: {
      de: [
        "Krabi hat einen Tidenhub von bis zu 3 Metern. Das verändert die Landschaft komplett: Sandbänke tauchen auf, Lagunen werden zugänglich – oder eben nicht.",
        "Die berühmte Tup-Sandbank zwischen Koh Tup und Chicken Island ist nur bei Wasserständen unter ca. 1,0 m begehbar. Am besten sind die Tage rund um Neu- und Vollmond (Springtide).",
        "Für Koh Roi in der Phang-Nga-Bucht gilt das Gegenteil: Der Tunnel in die versteckte Lagune ist nur bei mittlerem Wasserstand passierbar – bei Flut zu hoch, bei Ebbe zu flach.",
        "Wir planen jede private Tour nach der Tidentabelle. Sagen Sie uns Ihr Wunschdatum – wir stellen die perfekte Reihenfolge der Inseln zusammen.",
      ],
      en: [
        "Krabi has a tidal range of up to 3 metres. That completely changes the landscape: sandbars emerge, lagoons become accessible – or not.",
        "The famous Tup sandbar between Koh Tup and Chicken Island is only walkable below roughly 1.0 m. The best days are around new and full moon (spring tides).",
        "For Koh Roi in Phang Nga Bay it's the opposite: the tunnel into the hidden lagoon is only passable at mid-tide – too high at flood, too shallow at ebb.",
        "We plan every private tour around the tide table. Tell us your preferred date – we'll arrange the perfect island order.",
      ],
    },
  },
  {
    id: "drone-thailand",
    title: {
      de: "Drohnen-Fotografie in Thailand: Was Sie beachten müssen & unsere VIP-Lösung",
      en: "Drone photography in Thailand: what to know & our VIP solution",
    },
    excerpt: {
      de: "Registrierung bei CAAT und NBTC, Versicherung, Nationalpark-Regeln – und wie Sie sich all das sparen.",
      en: "CAAT and NBTC registration, insurance, national park rules – and how to skip all of it.",
    },
    category: { de: "Drohne", en: "Drone" },
    image: IMG.aerial,
    minutes: 6,
    tourId: "phang-nga-uncharted",
    body: {
      de: [
        "Wer in Thailand eine Drohne fliegen will, muss sie bei der NBTC und der CAAT registrieren und eine Haftpflichtversicherung nachweisen. Die Bearbeitung dauert oft mehrere Wochen.",
        "In Nationalparks wie Hat Noppharat Thara – Mu Ko Phi Phi gelten zusätzliche Regeln. Ohne Genehmigung drohen hohe Strafen und die Beschlagnahmung der Drohne.",
        "Starts von einem fahrenden Boot sind technisch anspruchsvoll: Rückkehr-Funktionen orientieren sich am Startpunkt – der aber bewegt sich. Viele Drohnen landen so im Meer.",
        "Unsere VIP-Lösung: Ein lizenzierter Pilot fliegt mit allen Genehmigungen von unserem Boot aus. Sie genießen den Moment – und bekommen am Abend ein fertig geschnittenes 4K-Reel aufs Handy.",
      ],
      en: [
        "Flying a drone in Thailand requires registration with both NBTC and CAAT plus proof of liability insurance. Processing often takes several weeks.",
        "National parks such as Hat Noppharat Thara – Mu Ko Phi Phi have additional rules. Flying without a permit risks heavy fines and confiscation.",
        "Launching from a moving boat is technically tricky: return-to-home uses the take-off point – which keeps moving. Many drones end up in the sea.",
        "Our VIP solution: a licensed pilot flies from our boat with all permits. You enjoy the moment – and receive a finished 4K reel on your phone that evening.",
      ],
    },
  },
  {
    id: "koh-roi-kudu",
    title: {
      de: "Koh Roi & Koh Kudu: Die geheimsten Inseln der Phang-Nga-Bucht",
      en: "Koh Roi & Koh Kudu: the most secret islands of Phang Nga Bay",
    },
    excerpt: {
      de: "Versteckte Lagunen, Felstunnel und kein einziges Gruppenboot. Ein Insider-Porträt.",
      en: "Hidden lagoons, rock tunnels and not a single group boat. An insider portrait.",
    },
    category: { de: "Geheimtipps", en: "Hidden gems" },
    image: IMG.cliffs,
    minutes: 5,
    tourId: "phang-nga-uncharted",
    body: {
      de: [
        "Nördlich der bekannten James-Bond-Insel liegen Inseln, die in keinem Reisekatalog stehen. Koh Roi ist eine davon: außen eine steile Kalksteinwand, innen eine smaragdgrüne Lagune.",
        "Der Zugang erfolgt schwimmend oder per Kajak durch einen niedrigen Felstunnel – nur bei passendem Wasserstand. Drinnen: Stille, Mangroven und manchmal Makaken.",
        "Koh Kudu besitzt ebenfalls ein „Hong“ – einen eingestürzten Höhlenraum, der zum Himmel offen ist. Am Nachmittag fällt das Licht senkrecht hinein.",
        "Weil die Anfahrt mit großen Booten zu lang ist, sind diese Inseln Privat-Chartern vorbehalten. Genau dafür ist unsere Uncharted-Tour gemacht.",
      ],
      en: [
        "North of the famous James Bond Island lie islands you won't find in any brochure. Koh Roi is one of them: a sheer limestone wall outside, an emerald lagoon inside.",
        "Access is by swimming or kayaking through a low rock tunnel – only at the right tide. Inside: silence, mangroves and sometimes macaques.",
        "Koh Kudu also has a 'hong' – a collapsed cave chamber open to the sky. In the afternoon the light falls straight in.",
        "Because the trip is too long for big boats, these islands are reserved for private charters. That's exactly what our Uncharted tour is made for.",
      ],
    },
  },
];

export const REVIEWS: { name: string; origin: L; type: L; text: L; tour: L }[] = [
  {
    name: "Julia & Markus",
    origin: { de: "München", en: "Munich" },
    type: { de: "Paar · Flitterwochen", en: "Couple · Honeymoon" },
    tour: { de: "4-Islands VIP & Sunset", en: "4-Islands VIP & Sunset" },
    text: {
      de: "Wir hatten Phra Nang zum Sonnenuntergang komplett für uns. Kein Lärm, kein Gedränge – der Kapitän hat uns jeden Wunsch erfüllt. Das Drohnenvideo war am Abend schon auf dem Handy!",
      en: "We had Phra Nang all to ourselves at sunset. No noise, no crowds – the captain fulfilled every wish. The drone video was on our phones that evening!",
    },
  },
  {
    name: "Familie Hoffmann",
    origin: { de: "Zürich", en: "Zurich" },
    type: { de: "Familie · 2 Kinder", en: "Family · 2 kids" },
    tour: { de: "Hong Island Secret Lagoons", en: "Hong Island Secret Lagoons" },
    text: {
      de: "Mit Kindern auf einem Longtail – nie wieder. Hier: Schatten, Polster, leiser Motor, kalte Getränke. Die Kids haben Schildkröten gesehen und wollen nächstes Jahr wieder hin.",
      en: "Kids on a longtail – never again. Here: shade, cushions, a quiet engine, cold drinks. The kids saw turtles and want to come back next year.",
    },
  },
  {
    name: "Sophie L.",
    origin: { de: "Hamburg", en: "Hamburg" },
    type: { de: "Paar · Heiratsantrag", en: "Couple · Proposal" },
    tour: { de: "Uncharted Phang Nga", en: "Uncharted Phang Nga" },
    text: {
      de: "Mein Freund hat mir in der Lagune von Koh Roi einen Antrag gemacht – die Drohne hat alles gefilmt. Diese Aufnahmen sind unbezahlbar. Danke für die perfekte Organisation!",
      en: "My boyfriend proposed in Koh Roi's lagoon – the drone filmed everything. That footage is priceless. Thank you for the perfect organisation!",
    },
  },
  {
    name: "Daniel & Chris",
    origin: { de: "London", en: "London" },
    type: { de: "Freunde · 4 Personen", en: "Friends · 4 people" },
    tour: { de: "Hong Island Secret Lagoons", en: "Hong Island Secret Lagoons" },
    text: {
      de: "Wir waren um 8 Uhr allein in der Hong-Lagune, während die Gruppenboote erst um 11 kamen. Absolut jeden Baht wert.",
      en: "We were alone in Hong Lagoon at 8 am, while group boats only arrived at 11. Worth every baht.",
    },
  },
];

export const FAQ: { q: L; a: L }[] = [
  {
    q: { de: "Warum maximal 5 Gäste?", en: "Why a maximum of 5 guests?" },
    a: {
      de: "Weil echte Privatsphäre und Komfort nur mit wenigen Gästen funktionieren. Jeder hat eine eigene Liegefläche im Schatten, das Boot bleibt ruhig und wir erreichen flache Buchten, in die große Boote nicht fahren können.",
      en: "Because real privacy and comfort only work with few guests. Everyone has their own shaded lounging spot, the boat stays calm and we reach shallow bays big boats can't enter.",
    },
  },
  {
    q: { de: "Ist das Drohnenfliegen legal und genehmigt?", en: "Is drone flying legal and permitted?" },
    a: {
      de: "Ja. Unser Pilot ist bei CAAT und NBTC registriert, versichert und kennt die Nationalpark-Regeln. Sie müssen sich um nichts kümmern – eigene Drohnen bitte vorher mit uns abstimmen.",
      en: "Yes. Our pilot is registered with CAAT and NBTC, insured and knows the national park rules. You don't need to arrange anything – please check with us before bringing your own drone.",
    },
  },
  {
    q: { de: "Wie sicher sind die Touren?", en: "How safe are the tours?" },
    a: {
      de: "Unsere Boote sind vom Marine Department zugelassen, mit zwei Motoren, Rettungswesten (auch für Kinder), Erste-Hilfe-Set, GPS und Marinefunk ausgestattet. Unsere Kapitäne haben über 10 Jahre Erfahrung in der Andamanensee.",
      en: "Our boats are Marine Department licensed, with twin engines, life jackets (incl. kids' sizes), first-aid kit, GPS and marine radio. Our captains have 10+ years of Andaman Sea experience.",
    },
  },
  {
    q: { de: "Was passiert bei schlechtem Wetter?", en: "What happens in bad weather?" },
    a: {
      de: "Sicherheit geht vor. Bei Sturmwarnung verschieben wir kostenlos auf einen anderen Tag oder erstatten 100 %. Leichter Regen ist in den Tropen meist nach 20 Minuten vorbei – wir passen die Route flexibel an.",
      en: "Safety first. With a storm warning we reschedule free of charge or refund 100%. Light tropical rain usually passes in 20 minutes – we adjust the route flexibly.",
    },
  },
  {
    q: { de: "Ab wann kann ich buchen und wie bezahle ich?", en: "When can I book and how do I pay?" },
    a: {
      de: "Anfragen sind jederzeit möglich. Nach Bestätigung genügt eine Anzahlung von 30 % per Karte oder Überweisung, der Rest wird am Tourtag bar oder per Karte bezahlt.",
      en: "You can request any time. After confirmation, a 30% deposit by card or bank transfer secures the date; the rest is paid on tour day in cash or by card.",
    },
  },
  {
    q: { de: "Sind die Touren für Kinder und Senioren geeignet?", en: "Are the tours suitable for kids and seniors?" },
    a: {
      de: "Absolut. Das Boot hat eine stabile Einstiegsleiter, gepolsterte Sitze und Schatten. Tempo und Wellengang passen wir an Ihre Gruppe an.",
      en: "Absolutely. The boat has a sturdy boarding ladder, cushioned seats and shade. We adjust speed and route to your group.",
    },
  },
];
