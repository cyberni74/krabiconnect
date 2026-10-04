import type { GuideSection } from "./types";

/** Additional in-depth sections, inserted before the final section of the matching article (see articles.ts). */
export const EXTRA_SECTIONS: Record<string, GuideSection[]> = {
  "railay-phra-nang-cave": [
    {
      h2: { de: "Railay vom Wasser aus erleben", en: "Seeing Railay from the water" },
      body: {
        de: ["Viele Besucher sehen Railay nur vom Strand aus. Vom Boot zeigt sich die Halbinsel von ihrer eindrucksvollsten Seite: die überhängenden Wände von Phra Nang, Kletterer, die wie kleine Punkte im Fels hängen, und die vorgelagerten Felsinseln im Gegenlicht."],
        en: ["Many visitors only ever see Railay from the beach. From the boat the peninsula shows its most impressive side: the overhanging walls of Phra Nang, climbers hanging like tiny dots on the rock, and the offshore islets backlit by the sun."],
      },
    },
  ],
  "koh-lao-lading-koh-pakbia": [
    {
      h2: { de: "Beste Zeit für Lao Lading und Pakbia", en: "Best time for Lao Lading and Pakbia" },
      body: {
        de: [
          "Wie das ganze Hong-Archipel sind die beiden Inseln in der Trockenzeit von etwa November bis April am schönsten: ruhige See, klares Wasser, verlässliche Anlandungen. In der Regenzeit sind Fahrten an vielen Tagen möglich, der Kapitän wählt dann aber eher geschützte Ankerplätze.",
          "Innerhalb des Tages gilt die bekannte Regel: früh oder spät. Die großen Hong-Touren legen meist um die Mittagszeit an Lao Lading an – davor und danach ist der Strand deutlich leerer.",
        ],
        en: [
          "Like the whole Hong archipelago, both islands are at their best in the dry season from roughly November to April: calm seas, clear water and reliable landings. In the rainy season trips are possible on many days, but the captain will then favour sheltered anchorages.",
          "Within the day, the familiar rule applies: early or late. The big Hong tours usually land at Lao Lading around midday – before and after, the beach is much emptier.",
        ],
      },
    },
  ],
  "koh-kudu-koh-nok": [
    {
      h2: { de: "Beste Reisezeit für die Phang Nga Bucht", en: "Best season for Phang Nga Bay" },
      body: {
        de: [
          "Die Bucht ist durch Inseln und Festland gut vor dem offenen Meer geschützt. Deshalb ist die Route zu Koh Kudu und Koh Nok auch während des Südwestmonsuns an vielen Tagen machbar, wenn Fahrten Richtung Phi Phi oder Koh Rok zu unruhig wären.",
          "Am angenehmsten ist es trotzdem in der Trockenzeit. Morgens ist die Bucht oft spiegelglatt, und die Karstfelsen spiegeln sich im Wasser – ein Anblick, für den sich das frühe Aufstehen lohnt.",
        ],
        en: [
          "The bay is well protected from the open sea by islands and mainland. That is why the route to Koh Kudu and Koh Nok is doable on many days even during the southwest monsoon, when trips towards Phi Phi or Koh Rok would be too rough.",
          "It is still most pleasant in the dry season. In the morning the bay is often glassy and the karst towers are mirrored in the water – a sight worth getting up early for.",
        ],
      },
    },
  ],
  "koh-rok-koh-haa": [
    {
      h2: { de: "So läuft ein Koh-Rok-Tag ab", en: "How a Koh Rok day works" },
      body: {
        de: [
          "Ein guter Koh-Rok-Tag beginnt früh. Die lange Anfahrt am Morgen ist bei ruhiger See am angenehmsten, und Sie erreichen die Inseln vor oder mit den ersten Booten. Dann folgen zwei bis drei Schnorchelgänge an unterschiedlichen Riffseiten, dazwischen Pausen am Strand.",
          "Die Crew wählt die Spots nach Strömung und Sicht des Tages. Ein Stopp an Koh Haa auf dem Hin- oder Rückweg ergänzt den Tag, wenn das Meer es zulässt. Zurück in Ao Nang sind Sie meist am späten Nachmittag.",
        ],
        en: [
          "A good Koh Rok day starts early. The long morning ride is most comfortable on a calm sea, and you reach the islands before or alongside the first boats. Then come two or three snorkels on different sides of the reef, with beach breaks in between.",
          "The crew chooses the spots based on the day’s current and visibility. A stop at Koh Haa on the way out or back rounds off the day when the sea allows. You are usually back in Ao Nang by late afternoon.",
        ],
      },
      list: {
        de: ["Früher Start, ruhige Überfahrt", "Erster Schnorchelgang am Kanal zwischen Rok Nai und Rok Nok", "Mittagspause am Strand von Koh Rok Nok", "Zweiter Schnorchelgang an einer anderen Riffseite", "Optional: Koh Haa Lagune auf dem Rückweg"],
        en: ["Early start, calm crossing", "First snorkel in the channel between Rok Nai and Rok Nok", "Lunch break on the beach of Koh Rok Nok", "Second snorkel on a different side of the reef", "Optional: the Koh Haa lagoon on the way back"],
      },
    },
  ],
  "james-bond-island-phang-nga-bay": [
    {
      h2: { de: "Die perfekte Reihenfolge des Tages", en: "The perfect order for the day" },
      body: {
        de: ["Wer James Bond Island als ersten oder letzten Stopp plant, umgeht die Mittagswelle der Phuket-Touren. Dazwischen passen Mangroven, Koh Panyee zum Mittagessen und eine ruhige Lagune wie Koh Roi oder Koh Kudu."],
        en: ["Plan James Bond Island as the first or last stop and you avoid the midday wave of Phuket tours. In between, fit in the mangroves, Koh Panyee for lunch and a quiet lagoon such as Koh Roi or Koh Kudu."],
      },
    },
  ],
  "avoid-crowds-krabi-timing": [
    {
      h2: { de: "Ein Beispieltag ohne Massen", en: "A sample day without crowds" },
      body: {
        de: ["So könnte ein Inseltag aussehen, der konsequent gegen den Strom geplant ist – angepasst an die Gezeiten des Tages:"],
        en: ["Here is what an island day planned consistently against the flow might look like – adjusted to that day’s tides:"],
      },
      list: {
        de: [
          "Früh: Abfahrt in Ao Nang, erster Stopp an Phra Nang, solange der Strand leer ist",
          "Vormittag: Tup-Sandbank, wenn das Niedrigwasser passt",
          "Mittag: Schnorcheln an einer ruhigen Riffseite statt am vollen Hauptstrand",
          "Nachmittag: Badepause im Schatten, Lunch an Bord",
          "Später Nachmittag: Koh Poda, wenn die Gruppen abfahren, Sunset vom Boot",
        ],
        en: [
          "Early: leave Ao Nang, first stop Phra Nang while the beach is empty",
          "Morning: the Tup sandbar, if low water fits",
          "Midday: snorkelling on a quiet reef side instead of the busy main beach",
          "Afternoon: a swim break in the shade, lunch on board",
          "Late afternoon: Koh Poda as the groups leave, sunset from the boat",
        ],
      },
    },
  ],
  "krabi-tides-guide": [
    {
      h2: { de: "Gezeiten und Sicherheit", en: "Tides and safety" },
      body: {
        de: [
          "Gezeiten bedeuten auch Strömung. Zwischen Hoch- und Niedrigwasser fließt viel Wasser durch Kanäle und um Inselspitzen – genau dort, wo Schnorchler gern unterwegs sind. Kurz vor und nach dem Gezeitenwechsel ist die Strömung meist am schwächsten.",
          "In Lagunen mit engen Zugängen wie bei Koh Roi kann steigendes Wasser den Rückweg erschweren. Halten Sie sich an die Zeitvorgaben der Crew und schwimmen Sie bei spürbarer Strömung nur mit Schwimmweste.",
        ],
        en: [
          "Tides also mean current. Between high and low water, a lot of water flows through channels and around island tips – exactly where snorkellers like to go. Just before and after the turn of the tide, the current is usually weakest.",
          "In lagoons with narrow entrances, such as Koh Roi, a rising tide can make the way back harder. Follow the crew’s timing and only swim in noticeable current with a life jacket.",
        ],
      },
    },
  ],
  "krabi-fishing-guide": [
    {
      h2: { de: "Tintenfischangeln bei Nacht", en: "Night squid fishing" },
      body: {
        de: [
          "Eine besondere Erfahrung ist das Tintenfischangeln nach Sonnenuntergang. Das Boot ankert in einer ruhigen Bucht, helle Lampen werden ins Wasser gerichtet und locken Plankton und kleine Fische an – und damit auch Tintenfische. Mit leichten Ruten und bunten Jigs wird dann direkt neben dem Boot geangelt.",
          "Das Angeln ist einfach zu lernen und deshalb bei Familien besonders beliebt. Der Fang landet auf Wunsch frisch gegrillt oder mit Knoblauch und Pfeffer angebraten auf dem Teller.",
        ],
        en: [
          "Squid fishing after sunset is a special experience. The boat anchors in a calm bay, bright lamps shine into the water and attract plankton and small fish – and with them, squid. Using light rods and colourful jigs, you fish right next to the boat.",
          "It is easy to learn and therefore especially popular with families. If you like, the catch ends up freshly grilled or stir-fried with garlic and pepper on your plate.",
        ],
      },
    },
    {
      h2: { de: "Halbtag oder Ganztag?", en: "Half day or full day?" },
      body: {
        de: ["Für Einsteiger und Familien reicht ein Halbtag mit Riffangeln vollkommen. Wer auf größere Raubfische beim Trolling aus ist, braucht mehr Zeit und Strecke – hier lohnt sich ein Ganztag, idealerweise in der Trockenzeit bei ruhiger See."],
        en: ["For beginners and families, a half day of reef fishing is plenty. If you are after bigger predators on the troll, you need more time and distance – a full day is worth it here, ideally in the dry season on a calm sea."],
      },
    },
  ],
  "best-snorkeling-spots-krabi": [
    {
      h2: { de: "Welche Tour für welchen Schnorchler?", en: "Which trip for which snorkeller?" },
      body: {
        de: ["Einsteiger und Familien sind mit der Poda-Gruppe und Hong bestens bedient. Wer bereits Erfahrung hat und das klarste Wasser sucht, plant einen Ganztag nach Koh Rok und Koh Haa – in der Saison von etwa November bis April."],
        en: ["Beginners and families are well served by the Poda group and Hong. If you are experienced and want the clearest water, plan a full day to Koh Rok and Koh Haa – in the season from roughly November to April."],
      },
    },
  ],
  "krabi-with-kids": [
    {
      h2: { de: "Sicherheit an Bord", en: "Safety on board" },
      body: {
        de: [
          "Auf einem Speedboat sollten Kinder während der Fahrt immer sitzen, am besten in der Mitte oder hinten, wo das Boot am ruhigsten liegt. Schwimmwesten werden bei Kindern idealerweise die ganze Fahrt über getragen, nicht erst beim Baden.",
          "Fragen Sie vor der Buchung, ob passende Kinderwesten an Bord sind, wie viel Schatten das Boot bietet und ob die Crew Erfahrung mit Familien hat. Ein kleines, privates Boot hat den Vorteil, dass sich die Crew wirklich um Ihre Kinder kümmern kann.",
        ],
        en: [
          "On a speedboat, children should always be seated during the ride, ideally in the middle or at the back where the boat moves least. Ideally, children wear life jackets for the whole ride, not just when swimming.",
          "Before booking, ask whether suitable children’s vests are on board, how much shade the boat offers and whether the crew is experienced with families. A small private boat has the advantage that the crew can really look after your children.",
        ],
      },
    },
  ],
  "boat-day-packing-list-etiquette": [
    {
      h2: { de: "Sonnenschutz richtig planen", en: "Planning sun protection properly" },
      body: {
        de: [
          "Die Sonne in Krabi wird häufig unterschätzt, vor allem auf dem Wasser, wo die Oberfläche das Licht zusätzlich reflektiert und der Fahrtwind die Hitze kaschiert. Am stärksten trifft es Schultern, Nacken, Fußrücken und die Kniekehlen beim Schnorcheln.",
          "Die beste Lösung ist Kleidung: ein UV-Shirt mit langen Ärmeln, eine leichte Hose für die Fahrt und ein Hut mit Kinnband. Ergänzen Sie das mit riffschonender Sonnencreme, die Sie vor dem Schwimmen gut einziehen lassen. So schützen Sie Haut und Riff gleichzeitig.",
        ],
        en: [
          "The sun in Krabi is often underestimated, especially on the water, where the surface reflects extra light and the breeze from the ride hides the heat. Shoulders, neck, the tops of the feet and the backs of the knees get hit hardest while snorkelling.",
          "The best solution is clothing: a long-sleeved UV shirt, light trousers for the ride and a hat with a chin strap. Add reef-safe sunscreen and let it soak in well before swimming. That way you protect your skin and the reef at the same time.",
        ],
      },
    },
    {
      h2: { de: "Essen und Trinken an Bord", en: "Food and drink on board" },
      body: {
        de: [
          "Trinken Sie mehr, als Sie denken – mindestens einen bis zwei Liter Wasser pro Person für einen halben Tag, bei Hitze mehr. Auf vielen Booten ist Wasser inklusive, fragen Sie aber nach. Leichte Snacks wie Obst, Nüsse oder Kekse helfen gegen Seekrankheit besser als ein leerer Magen.",
          "Alkohol und Schwimmen vertragen sich schlecht. Das Bier zum Sonnenuntergang schmeckt am besten, wenn der letzte Schnorchelgang vorbei ist.",
        ],
        en: [
          "Drink more than you think – at least one to two litres of water per person for half a day, more in the heat. Water is included on many boats, but ask. Light snacks like fruit, nuts or biscuits help against seasickness better than an empty stomach.",
          "Alcohol and swimming don’t mix well. The sunset beer tastes best once the last snorkel is over.",
        ],
      },
    },
  ],
  "krabi-photo-drone-spots": [
    {
      h2: { de: "Unterwasserfotos beim Schnorcheln", en: "Underwater photos while snorkelling" },
      body: {
        de: [
          "Für Unterwasserbilder brauchen Sie keine teure Ausrüstung. Eine Action-Cam oder ein Handy in einer geprüften wasserdichten Hülle reicht für schöne Erinnerungen. Am besten gelingen Fotos in flachem, klarem Wasser bei hoher Sonne – zum Beispiel an den Felsen von Koh Hong, an Chicken Island oder im Kanal von Koh Rok.",
          "Nähern Sie sich Fischen langsam, fotografieren Sie leicht von unten gegen das Licht und halten Sie Abstand zu Korallen. Ein Handgelenkband verhindert, dass die Kamera in die Tiefe sinkt.",
        ],
        en: [
          "You don’t need expensive gear for underwater pictures. An action cam or a phone in a tested waterproof case is enough for great memories. Photos work best in shallow, clear water with a high sun – for example at the Koh Hong rocks, at Chicken Island or in the Koh Rok channel.",
          "Approach fish slowly, shoot slightly from below towards the light and keep your distance from coral. A wrist strap stops the camera from sinking.",
        ],
      },
    },
  ],
  "secret-beaches-lagoons-krabi": [
    {
      h2: { de: "Das richtige Timing für Geheimtipps", en: "The right timing for hidden gems" },
      body: {
        de: [
          "Fast jeder dieser Orte hat ein bestimmtes Zeitfenster. Lagunen mit engen Zugängen brauchen den passenden Wasserstand, Strände sind außerhalb der Gruppenzeiten am ruhigsten, und das Licht in den Lagunen ist am schönsten, wenn die Sonne über die Felskante fällt.",
          "Mit einem kleinen, privaten Boot lassen sich diese Fenster an einem Tag kombinieren. Ihr Kapitän kennt die Gezeiten, die üblichen Routen der Ausflugsboote und weiß, welche Bucht an diesem Tag die ruhigste ist.",
        ],
        en: [
          "Almost every one of these places has a particular window. Lagoons with narrow entrances need the right water level, beaches are quietest outside group times, and the light in the lagoons is most beautiful when the sun spills over the rim of the cliffs.",
          "With a small private boat, these windows can be combined in one day. Your captain knows the tides and the usual routes of the excursion boats, and knows which bay is quietest that day.",
        ],
      },
    },
    {
      h2: { de: "Schnorcheln an den Geheimtipps", en: "Snorkelling at the hidden gems" },
      body: {
        de: ["Die versteckten Lagunen der Phang Nga Bucht sind eher zum Schwimmen und Staunen als zum Schnorcheln gemacht. Für Fische und Korallen kombinieren Sie sie mit Koh Pakbia, Chicken Island oder – für das klarste Wasser – Koh Rok."],
        en: ["The hidden lagoons of Phang Nga Bay are made for swimming and marvelling rather than snorkelling. For fish and coral, combine them with Koh Pakbia, Chicken Island or – for the clearest water – Koh Rok."],
      },
    },
  ],
};
