/**
 * Storytelling FAQ "Why our speedboat instead of a longtail boat?"
 * Rendered by <LongtailFaq /> (sections-bottom.tsx, anchor #longtail-vs-speedboat).
 * Exported as plain data so FAQPage JSON-LD can be generated from the same source
 * (see `longtailAnswerText`).
 */
import type { L } from "./content";

export type LongtailStep = { time: string; text: L };

export const LONGTAIL_INTRO: {
  eyebrow: L;
  title: L;
  sub: L;
  storyTitle: L;
  story: L;
  them: { label: L; steps: LongtailStep[] };
  us: { label: L; steps: LongtailStep[] };
} = {
  eyebrow: { de: "Longtail vs. Speedboat", en: "Longtail vs. speedboat" },
  title: {
    de: "Warum unser Speedboat statt Longtail-Boot?",
    en: "Why our speedboat instead of a longtail boat?",
  },
  sub: {
    de: "Ehrliche Antworten auf die Fragen, die uns Gäste vor der Buchung am häufigsten stellen – erzählt so, wie sich der Tag auf dem Wasser wirklich anfühlt.",
    en: "Honest answers to the questions guests ask us most before booking – told the way the day on the water really feels.",
  },
  storyTitle: { de: "Zwei Boote, ein Morgen in Krabi", en: "Two boats, one morning in Krabi" },
  story: {
    de: "Derselbe Sonnenaufgang, dieselbe Andamanensee, dieselben Inseln am Horizont. Und doch erleben Sie zwei völlig verschiedene Tage – je nachdem, in welches Boot Sie steigen.",
    en: "The same sunrise, the same Andaman Sea, the same islands on the horizon. And yet you'll live two completely different days – depending on which boat you step into.",
  },
  them: {
    label: { de: "Ein typischer Longtail- & Gruppentag", en: "A typical longtail & group day" },
    steps: [
      {
        time: "08:00",
        text: {
          de: "Sie warten am Pier in der Hitze, während der Sammelbus noch weitere Hotels abklappert.",
          en: "You wait at the pier in the heat while the shuttle bus is still collecting other hotels.",
        },
      },
      {
        time: "09:15",
        text: {
          de: "Sie quetschen sich auf eine harte Holzbank, Schulter an Schulter mit Fremden.",
          en: "You squeeze onto a hard wooden bench, shoulder to shoulder with strangers.",
        },
      },
      {
        time: "09:30",
        text: {
          de: "Der Dieselmotor brüllt, Abgase ziehen über das Boot, Gischt durchnässt Ihre Tasche.",
          en: "The diesel engine roars, fumes drift across the boat, spray soaks your bag.",
        },
      },
      {
        time: "10:30",
        text: {
          de: "Ankunft an Koh Poda – zusammen mit Dutzenden anderer Boote. Der Strand ist voll.",
          en: "Arrival at Koh Poda – together with dozens of other boats. The beach is packed.",
        },
      },
      {
        time: "11:15",
        text: {
          de: "„Noch 20 Minuten!“ Der feste Zeitplan treibt alle zurück ins Boot. Gehetzt weiter.",
          en: "“20 more minutes!” The fixed schedule herds everyone back on board. Rushed onward.",
        },
      },
    ],
  },
  us: {
    label: { de: "Ihr Tag mit Krabi Secret Islands", en: "Your day with Krabi Secret Islands" },
    steps: [
      {
        time: "07:30",
        text: {
          de: "Ihr Fahrer holt Sie direkt am Hotel ab – nur Sie, keine Umwege.",
          en: "Your driver picks you up right at your hotel – just you, no detours.",
        },
      },
      {
        time: "07:50",
        text: {
          de: "Sie lassen sich auf gepolsterte Liegeflächen im Schatten sinken. Kalte Getränke warten.",
          en: "You sink onto cushioned sun pads in the shade. Cold drinks are waiting.",
        },
      },
      {
        time: "08:00",
        text: {
          de: "Leise, saubere Viertaktmotoren. Sie hören das Wasser – und sich gegenseitig.",
          en: "Quiet, clean four-stroke engines. You hear the water – and each other.",
        },
      },
      {
        time: "08:30",
        text: {
          de: "Sie erreichen die Inseln, bevor die Massen kommen. Der Sand trägt nur Ihre Fußspuren.",
          en: "You reach the islands before the crowds arrive. The sand carries only your footprints.",
        },
      },
      {
        time: "∞",
        text: {
          de: "Wie lange Sie bleiben, entscheiden Sie. Nur Ihre Gruppe, max. 5 Gäste, Ihr Tempo.",
          en: "You decide how long you stay. Only your group, max. 5 guests, your pace.",
        },
      },
    ],
  },
};

export type LongtailFaqItem = {
  id: string;
  emoji: string;
  q: L;
  story: L;
  rows: { them: L; us: L }[];
  insider?: L;
};

export const LONGTAIL_FAQ: LongtailFaqItem[] = [
  {
    id: "seats",
    emoji: "🛋️",
    q: {
      de: "Wie bequem sitzt man im Vergleich zum Longtail-Boot?",
      en: "How comfortable is it compared to a longtail boat?",
    },
    story: {
      de: "Auf einem Longtail sitzen Sie auf schmalen Holzbrettern – nach einer halben Stunde spüren Sie jede Welle im Rücken. Bei uns strecken Sie sich auf gepolsterten Liegeflächen aus, ein Sonnendach hält die Mittagshitze fern. Sie kommen am Strand an und fühlen sich ausgeruht statt durchgeschüttelt.",
      en: "On a longtail you sit on narrow wooden planks – after half an hour you feel every wave in your back. With us you stretch out on cushioned sun pads while a canopy keeps the midday heat away. You arrive at the beach feeling rested instead of rattled.",
    },
    rows: [
      {
        them: { de: "Harte Holzbänke ohne Lehne", en: "Hard wooden benches without backrest" },
        us: { de: "Gepolsterte Liegeflächen & Sitzpolster", en: "Cushioned sun pads & seats" },
      },
      {
        them: { de: "Oft kaum Schatten in der Mittagssonne", en: "Often barely any shade in the midday sun" },
        us: { de: "Sonnendach – Schatten, wann immer Sie möchten", en: "Canopy – shade whenever you want it" },
      },
      {
        them: { de: "Jeder Wellenschlag geht direkt in den Rücken", en: "Every wave goes straight into your back" },
        us: { de: "Ruhigere Fahrt, Platz zum Ausstrecken", en: "Smoother ride, room to stretch out" },
      },
    ],
    insider: {
      de: "Viele Gäste schlafen auf der Rückfahrt einfach ein – Kopf im Polster, Sonne im Gesicht, das Rauschen des Meeres im Ohr.",
      en: "Many guests simply fall asleep on the way back – head on a cushion, sun on their face, the sea whispering in their ears.",
    },
  },
  {
    id: "crowds",
    emoji: "👥",
    q: {
      de: "Teile ich das Boot mit fremden Gästen?",
      en: "Will I share the boat with strangers?",
    },
    story: {
      de: "Nein. Auf Gruppentouren sitzen Sie mit Menschen zusammen, die Sie nie zuvor gesehen haben – deren Musik, deren Zeitplan, deren Wünsche. Bei uns ist das Boot für den ganzen Tag nur für Ihre Gruppe reserviert, mit maximal 5 Gästen. Sie können lachen, schweigen, feiern oder einfach aufs Wasser schauen.",
      en: "No. On group tours you sit with people you've never met – their music, their schedule, their wishes. With us the boat is reserved for your group for the whole day, with a maximum of 5 guests. You can laugh, stay quiet, celebrate or just gaze at the water.",
    },
    rows: [
      {
        them: { de: "Volles Boot mit Fremden", en: "A full boat of strangers" },
        us: { de: "Nur Ihre Gruppe – max. 5 Gäste", en: "Only your group – max. 5 guests" },
      },
      {
        them: { de: "Der Guide muss es allen recht machen", en: "The guide has to please everyone" },
        us: { de: "Kapitän & Crew kümmern sich nur um Sie", en: "Captain & crew focus only on you" },
      },
      {
        them: { de: "Kaum Privatsphäre für besondere Momente", en: "Hardly any privacy for special moments" },
        us: { de: "Ideal für Anträge, Jubiläen & Familienzeit", en: "Ideal for proposals, anniversaries & family time" },
      },
    ],
    insider: {
      de: "Ein Heiratsantrag in einer leeren Lagune funktioniert nur, wenn niemand sonst an Bord ist. Genau dafür buchen viele Paare uns.",
      en: "A proposal in an empty lagoon only works when nobody else is on board. That's exactly why many couples book us.",
    },
  },
  {
    id: "noise",
    emoji: "🔇",
    q: {
      de: "Ist ein Speedboat nicht genauso laut wie ein Longtail?",
      en: "Isn't a speedboat just as loud as a longtail?",
    },
    story: {
      de: "Der typische Longtail-Motor ist ein offener Dieselmotor am langen Schaft – laut, vibrierend, mit Abgasen, die direkt über das Boot ziehen. Unsere Boote fahren mit modernen, sauberen Viertakt-Außenbordern. Sie können sich in normaler Lautstärke unterhalten und riechen das Meer statt Diesel.",
      en: "The typical longtail engine is an open diesel motor on a long shaft – loud, vibrating, with fumes drifting straight across the boat. Our boats run on modern, clean four-stroke outboards. You can talk at normal volume and smell the sea instead of diesel.",
    },
    rows: [
      {
        them: { de: "Röhrender, offener Dieselmotor", en: "Roaring open diesel engine" },
        us: { de: "Leise, moderne Viertaktmotoren", en: "Quiet, modern four-stroke engines" },
      },
      {
        them: { de: "Abgase & Dieselgeruch an Bord", en: "Exhaust fumes & diesel smell on board" },
        us: { de: "Saubere Luft – Sie riechen das Meer", en: "Clean air – you smell the sea" },
      },
      {
        them: { de: "Unterhaltung nur schreiend möglich", en: "Conversation only by shouting" },
        us: { de: "Entspannt reden während der Fahrt", en: "Relaxed conversation while cruising" },
      },
    ],
  },
  {
    id: "wet",
    emoji: "💧",
    q: {
      de: "Werde ich auf der Fahrt nass?",
      en: "Will I get wet during the ride?",
    },
    story: {
      de: "Longtails liegen tief im Wasser, und bei jeder Welle schwappt Gischt über die Bordwand – Handy, Kamera und Handtuch inklusive. Unsere Boote haben einen höheren Rumpf und trockenen Stauraum für Ihre Sachen. Nass werden Sie bei uns nur, wenn Sie es wollen: beim Sprung ins türkisfarbene Wasser.",
      en: "Longtails sit low in the water, and with every wave spray splashes over the side – phone, camera and towel included. Our boats have a higher hull and dry storage for your belongings. With us you only get wet when you want to: when you jump into the turquoise water.",
    },
    rows: [
      {
        them: { de: "Spritzwasser durchnässt Taschen & Kleidung", en: "Spray soaks bags & clothes" },
        us: { de: "Höherer Rumpf, deutlich trockenere Fahrt", en: "Higher hull, a much drier ride" },
      },
      {
        them: { de: "Kein geschützter Platz für Elektronik", en: "No protected spot for electronics" },
        us: { de: "Trockener Stauraum für Handy & Kamera", en: "Dry storage for phone & camera" },
      },
    ],
  },
  {
    id: "time",
    emoji: "⏱️",
    q: {
      de: "Verliert man auf Gruppentouren wirklich so viel Zeit?",
      en: "Do group tours really waste that much time?",
    },
    story: {
      de: "Ein Gruppentag besteht zu einem großen Teil aus Warten: auf den Sammelbus, auf andere Gäste, auf das Boot, auf den nächsten Programmpunkt. Langsame Überfahrten fressen den Rest. Bei uns beginnt der Urlaub an Ihrer Hoteltür – und die Zeit, die andere im Bus und auf dem Wasser verbringen, verbringen Sie an den Spots.",
      en: "A group day is largely made of waiting: for the shuttle bus, for other guests, for the boat, for the next item on the programme. Slow crossings eat up the rest. With us your holiday starts at your hotel door – and the time others spend on buses and in transit, you spend at the spots.",
    },
    rows: [
      {
        them: { de: "Sammel-Pickups durch mehrere Hotels", en: "Shared pick-ups across several hotels" },
        us: { de: "Direkter Transfer nur für Sie", en: "Direct transfer just for you" },
      },
      {
        them: { de: "Warten auf Nachzügler an jedem Stopp", en: "Waiting for latecomers at every stop" },
        us: { de: "Es geht los, wenn Sie bereit sind", en: "We leave when you're ready" },
      },
      {
        them: { de: "Langsame Überfahrten zwischen den Inseln", en: "Slow crossings between islands" },
        us: { de: "Schnelle Transfers – mehr Zeit an Land & im Wasser", en: "Fast transfers – more time ashore & in the water" },
      },
      {
        them: { de: "Starrer Zeitplan, egal wie schön es ist", en: "A rigid schedule, however beautiful it is" },
        us: { de: "Sie bleiben, solange es Ihnen gefällt", en: "You stay as long as you like" },
      },
    ],
  },
  {
    id: "timing",
    emoji: "🧭",
    q: {
      de: "Wie vermeiden Sie die überfüllten Buchten?",
      en: "How do you avoid the crowded bays?",
    },
    story: {
      de: "Fast alle Gruppenboote fahren nach demselben Takt – weil Pick-ups und Mittagessen fest geplant sind. Wir fahren antizyklisch: früher los oder später raus, und wir kennen Buchten, die auf keinem Gruppenprogramm stehen. Während die Massen an der einen Insel anlegen, haben Sie die nächste für sich.",
      en: "Almost all group boats run on the same clock – because pick-ups and lunch are fixed. We go against the flow: out earlier or later, and we know bays that aren't on any group itinerary. While the crowds land on one island, you have the next one to yourself.",
    },
    rows: [
      {
        them: { de: "Alle Boote zur gleichen Zeit am gleichen Strand", en: "Every boat at the same beach at the same time" },
        us: { de: "Antizyklisches Timing gegen den Strom", en: "Counter-cyclical timing against the flow" },
      },
      {
        them: { de: "Nur die bekanntesten Stopps", en: "Only the best-known stops" },
        us: { de: "Geheime Buchten & Lagunen abseits der Routen", en: "Secret bays & lagoons off the usual routes" },
      },
    ],
    insider: {
      de: "Unser Kapitän schaut morgens auf Gezeiten und Wind – und entscheidet dann, welche Bucht heute die schönste und leerste ist.",
      en: "Each morning our captain checks tides and wind – then decides which bay will be the most beautiful and emptiest today.",
    },
  },
  {
    id: "photos",
    emoji: "📸",
    q: {
      de: "Bekomme ich Urlaubsfotos ohne fremde Menschen im Bild?",
      en: "Will I get holiday photos without strangers in them?",
    },
    story: {
      de: "Das berühmte Foto auf der Sandbank – auf Gruppentouren ist es meist voller fremder Rücken, Selfiesticks und Boote. Weil wir zu anderen Zeiten und an andere Orte fahren, gehören Ihre Fotos wirklich Ihnen. Auf Wunsch filmt unser Drohnenpilot Ihre Gruppe aus der Luft – ohne fremde Gäste im Bild.",
      en: "The famous sandbar photo – on group tours it's usually full of strangers' backs, selfie sticks and boats. Because we go at different times and to different places, your photos truly belong to you. On request our drone pilot films your group from above – with no strangers in the frame.",
    },
    rows: [
      {
        them: { de: "Fremde, Boote & Selfiesticks im Hintergrund", en: "Strangers, boats & selfie sticks in the background" },
        us: { de: "Leere Strände als Kulisse", en: "Empty beaches as your backdrop" },
      },
      {
        them: { de: "Keine Zeit für das perfekte Licht", en: "No time to wait for the perfect light" },
        us: { de: "Wir warten auf das goldene Licht für Sie", en: "We wait for the golden light for you" },
      },
      {
        them: { de: "Drohnen auf Gruppentouren meist nicht möglich", en: "Drones usually not possible on group tours" },
        us: { de: "Optionales 4K-Drohnen-Paket nur von Ihrer Gruppe", en: "Optional 4K drone package of just your group" },
      },
    ],
  },
  {
    id: "family",
    emoji: "👨‍👩‍👧",
    q: {
      de: "Ist die Tour für Kinder und ältere Gäste geeignet?",
      en: "Is the tour suitable for children and older guests?",
    },
    story: {
      de: "Kinder werden auf harten Bänken schnell unruhig, und für ältere Gäste wird schon der Einstieg über eine wackelige Bordwand zur Herausforderung. Bei uns gibt es Schatten, Polster, Platz für eine Pause und eine Crew, die beim Ein- und Aussteigen die Hand reicht. Und weil nur Ihre Familie an Bord ist, bestimmen Sie das Tempo – inklusive Mittagsschlaf.",
      en: "Children quickly get restless on hard benches, and for older guests even climbing over a wobbly gunwale can be a challenge. With us there's shade, cushions, room for a break and a crew that offers a hand getting on and off. And because only your family is on board, you set the pace – nap time included.",
    },
    rows: [
      {
        them: { de: "Unbequem und kaum Schatten für Kinder", en: "Uncomfortable with little shade for kids" },
        us: { de: "Schatten & Polster – Platz zum Ausruhen", en: "Shade & cushions – room to rest" },
      },
      {
        them: { de: "Einstieg oft wackelig und ohne Hilfe", en: "Boarding often wobbly and unassisted" },
        us: { de: "Crew hilft beim Ein- & Aussteigen", en: "Crew helps you on and off the boat" },
      },
      {
        them: { de: "Tempo der Gruppe – keine Rücksicht auf Pausen", en: "Group pace – no room for breaks" },
        us: { de: "Ihr Tempo, Ihre Pausen", en: "Your pace, your breaks" },
      },
    ],
    insider: {
      de: "Unsere Crew kennt die flachen, ruhigen Buchten, in denen auch die Kleinsten sicher planschen können.",
      en: "Our crew knows the shallow, calm bays where even the little ones can splash around safely.",
    },
  },
  {
    id: "safety",
    emoji: "🛟",
    q: {
      de: "Wie sicher sind Ihre Boote?",
      en: "How safe are your boats?",
    },
    story: {
      de: "Sicherheit ist der Teil des Tages, über den Sie gar nicht nachdenken sollen. Unsere Boote fahren mit zwei Motoren, an Bord sind Rettungswesten in Erwachsenen- und Kindergrößen, Erste-Hilfe-Ausrüstung und Marine-Funk. Am Steuer stehen erfahrene Kapitäne, die die Gewässer um Krabi seit Jahren kennen.",
      en: "Safety is the part of the day you shouldn't have to think about. Our boats run on two engines, carry life jackets in adult and children's sizes, first-aid kits and marine radio. At the helm are experienced captains who have known the waters around Krabi for years.",
    },
    rows: [
      {
        them: { de: "Ein einzelner Motor", en: "A single engine" },
        us: { de: "Zwei Motoren – Reserve an Bord", en: "Two engines – backup on board" },
      },
      {
        them: { de: "Passende Kinderwesten nicht garantiert", en: "Child-sized life jackets not guaranteed" },
        us: { de: "Rettungswesten auch für Kinder", en: "Life jackets for children too" },
      },
      {
        them: { de: "Ausstattung sehr unterschiedlich", en: "Equipment varies widely" },
        us: { de: "Marine-Funk & Erste-Hilfe-Ausrüstung", en: "Marine radio & first-aid kit" },
      },
      {
        them: { de: "Wechselnde Bootsführer", en: "Changing boat drivers" },
        us: { de: "Erfahrene, lizenzierte Kapitäne", en: "Experienced, licensed captains" },
      },
    ],
  },
  {
    id: "flexibility",
    emoji: "🗺️",
    q: {
      de: "Kann ich Route und Zeiten selbst bestimmen?",
      en: "Can I choose the route and times myself?",
    },
    story: {
      de: "Ja – das ist der eigentliche Luxus. Sie wählen Ihre Wunschzeit, stellen Ihre Inseln zusammen oder lassen sich von unserem Kapitän überraschen. Und wenn die Lagune einfach zu schön ist, um zu gehen? Dann bleiben Sie. Verlängerungen sind nach Absprache mit der Crew oft spontan möglich.",
      en: "Yes – that's the real luxury. You choose your preferred time, put together your islands or let our captain surprise you. And if the lagoon is simply too beautiful to leave? Then you stay. Extensions are often possible on the spot, by arrangement with the crew.",
    },
    rows: [
      {
        them: { de: "Feste Route für alle", en: "One fixed route for everyone" },
        us: { de: "Eigene Route – oder unser Insider-Vorschlag", en: "Your own route – or our insider suggestion" },
      },
      {
        them: { de: "Feste Abfahrtszeit", en: "Fixed departure time" },
        us: { de: "Ihre Wunschzeit, auch früh oder zum Sunset", en: "Your preferred time, early or for sunset" },
      },
      {
        them: { de: "Kein Verlängern möglich", en: "No way to extend" },
        us: { de: "Spontan verlängern nach Absprache", en: "Extend spontaneously by arrangement" },
      },
    ],
  },
  {
    id: "food",
    emoji: "🍽️",
    q: {
      de: "Wie ist das mit Essen und Getränken an Bord?",
      en: "What about food and drinks on board?",
    },
    story: {
      de: "Auf Gruppentouren gibt es oft ein Buffet zur festen Zeit, an dem sich alle gleichzeitig anstellen. Bei uns stehen Wasser, Softdrinks und Obst gekühlt an Bord bereit. Und mit einem Klick bei der Buchung kommt unsere Verpflegung dazu: zwei frisch zubereitete Mahlzeiten plus Getränke für ฿500 pro Person – gegessen wird, wann und wo Sie Hunger haben.",
      en: "Group tours often have a buffet at a fixed time where everyone queues at once. With us, water, soft drinks and fruit wait chilled on board. And with one click when booking you can add our catering: two freshly prepared meals plus drinks for ฿500 per person – eaten whenever and wherever you're hungry.",
    },
    rows: [
      {
        them: { de: "Buffet zur festen Zeit, Schlange stehen", en: "Buffet at a fixed time, queuing" },
        us: { de: "Essen, wann & wo Sie möchten", en: "Eat when & where you like" },
      },
      {
        them: { de: "Getränke oft warm oder extra bezahlt", en: "Drinks often warm or paid extra" },
        us: { de: "Wasser, Softdrinks & Obst gekühlt inklusive", en: "Chilled water, soft drinks & fruit included" },
      },
      {
        them: { de: "Kaum Auswahl", en: "Little choice" },
        us: { de: "1-Klick-Verpflegung für ฿500 p. P. – bis Seafood-BBQ", en: "1-click catering for ฿500 p.p. – up to seafood BBQ" },
      },
    ],
  },
  {
    id: "price",
    emoji: "💎",
    q: {
      de: "Ist das nicht viel teurer?",
      en: "Isn't it much more expensive?",
    },
    story: {
      de: "Auf den ersten Blick ja – auf den zweiten oft weniger, als Sie denken. Unser Preis gilt pro Boot für bis zu 5 Gäste, nicht pro Person. Teilen Sie ihn durch Ihre Gruppe und rechnen Sie ehrlich mit, was Sie dafür bekommen: Zeit statt Warten, Komfort statt Holzbank, leere Buchten statt Gedränge. Viele Gäste sagen uns hinterher, es war der Tag, an den sie sich vom ganzen Urlaub am meisten erinnern.",
      en: "At first glance, yes – at second glance often less than you'd think. Our price is per boat for up to 5 guests, not per person. Divide it by your group and honestly count what you get: time instead of waiting, comfort instead of wooden benches, empty bays instead of crowds. Many guests tell us afterwards it was the day they remember most from their whole holiday.",
    },
    rows: [
      {
        them: { de: "Preis pro Person – günstig, aber geteilt mit Fremden", en: "Price per person – cheap, but shared with strangers" },
        us: { de: "Preis pro Boot für bis zu 5 Gäste", en: "Price per boat for up to 5 guests" },
      },
      {
        them: { de: "Viel Zeit verbringen Sie mit Warten", en: "Much of your time is spent waiting" },
        us: { de: "Mehr Zeit an den schönsten Spots", en: "More time at the most beautiful spots" },
      },
      {
        them: { de: "Erlebnis von der Masse geprägt", en: "An experience shaped by the crowd" },
        us: { de: "Ein Tag, der nur Ihnen gehört", en: "A day that belongs only to you" },
      },
    ],
    insider: {
      de: "Fragen Sie uns einfach nach einem Angebot für Ihre Gruppengröße – unverbindlich und meist innerhalb von 30 Minuten.",
      en: "Just ask us for a quote for your group size – no obligation and usually within 30 minutes.",
    },
  },
];

/** Plain-text answer (story + comparison) for FAQPage JSON-LD. Pass a translator, e.g. `(l) => l.de`. */
export function longtailAnswerText(item: LongtailFaqItem, tr: (l: L) => string): string {
  const rows = item.rows.map((r) => `✗ ${tr(r.them)} → ✓ ${tr(r.us)}`).join(" · ");
  return [tr(item.story), rows, item.insider ? tr(item.insider) : ""].filter(Boolean).join(" ");
}
