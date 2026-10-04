import { IMG } from "../secret-islands/content";
import type { GuideArticleInput } from "./types";

export const PILLAR_ARTICLES: GuideArticleInput[] = [
  /* ───────────────────────── Pillar 1: Krabi islands overview ───────────────────────── */
  {
    slug: "krabi-islands-insider-guide",
    category: "pillar",
    short: { de: "Alle Inseln", en: "All islands" },
    primaryKeyword: "Krabi Inseln",
    keywords: ["Krabi Inseln", "Krabi islands", "Inseln bei Krabi", "Krabi Geheimtipps", "Ao Nang Inseln", "best islands Krabi"],
    title: {
      de: "Krabi Inseln – der komplette Insider-Guide",
      en: "Krabi Islands – the Complete Insider Guide",
    },
    metaDescription: {
      de: "Krabi Inseln im Überblick: Koh Poda, Hong, Koh Roi, Phi Phi & versteckte Lagunen – mit Insider-Tipps zu Gezeiten, Timing und Routen ohne Menschenmassen.",
      en: "All Krabi islands in one guide: Koh Poda, Hong, Koh Roi, Phi Phi and hidden lagoons – with insider tips on tides, timing and routes that avoid the crowds.",
    },
    h1: {
      de: "Krabi Inseln – der komplette Insider-Guide",
      en: "Krabi islands – the complete insider guide",
    },
    intro: {
      de: "Die Krabi Inseln gehören zu den schönsten Küstenlandschaften Südostasiens: senkrechte Kalksteinfelsen, die direkt aus türkisem Wasser wachsen, Sandbänke, die nur bei Ebbe auftauchen, und Lagunen, die man nur durch einen schmalen Felsspalt erreicht. Gleichzeitig sind die bekanntesten Strände zur Mittagszeit voll. Dieser Guide zeigt Ihnen alle wichtigen Inselgruppen vor Ao Nang, erklärt, welche Insel zu welcher Reiseart passt, und verrät, wie Sie mit dem richtigen Timing die ruhigen Momente erwischen.",
      en: "The Krabi islands are among the most beautiful coastlines in Southeast Asia: sheer limestone towers rising straight out of turquoise water, sandbars that only appear at low tide and lagoons you reach through a narrow gap in the rock. At the same time, the best-known beaches are packed by midday. This guide walks you through every important island group off Ao Nang, explains which island suits which kind of trip, and shows how the right timing gets you the quiet moments.",
    },
    sections: [
      {
        h2: { de: "Die Krabi Inseln auf einen Blick", en: "The Krabi islands at a glance" },
        body: {
          de: [
            "Vor der Küste der Provinz Krabi liegen weit über hundert Inseln und Felsen. Für Tagesausflüge ab Ao Nang sind vor allem vier Gebiete relevant: die Poda-Gruppe direkt vor der Küste mit Koh Poda, Chicken Island und der Tup-Sandbank, das Hong-Archipel im Nordwesten mit seiner berühmten Lagune, die Phi-Phi-Inseln im Süden und die Phang Nga Bucht im Norden mit Koh Roi, Koh Kudu und der James-Bond-Insel.",
            "Railay und Phra Nang gehören streng genommen zum Festland, sind aber nur per Boot erreichbar und fühlen sich deshalb wie eine Insel an. Weiter südlich, Richtung Koh Lanta, liegen Koh Rok und Koh Haa, die zu den besten Schnorchelrevieren der Region zählen, aber eine längere Anfahrt bedeuten.",
          ],
          en: [
            "Well over a hundred islands and rocks lie off the coast of Krabi province. For day trips from Ao Nang, four areas really matter: the Poda group right off the coast with Koh Poda, Chicken Island and the Tup sandbar; the Hong archipelago to the northwest with its famous lagoon; the Phi Phi islands to the south; and Phang Nga Bay to the north with Koh Roi, Koh Kudu and James Bond Island.",
            "Strictly speaking, Railay and Phra Nang belong to the mainland, but they can only be reached by boat, so they feel like an island. Further south, towards Koh Lanta, lie Koh Rok and Koh Haa – some of the best snorkelling spots in the region, but a longer ride away.",
          ],
        },
        list: {
          de: [
            "Poda-Gruppe (15–30 Min.): Koh Poda, Chicken Island, Tup-Sandbank, Phra Nang Cave Beach",
            "Hong-Archipel (ca. 30–45 Min.): Koh Hong, Koh Lao Lading, Koh Pakbia",
            "Phang Nga Bucht (ca. 45–75 Min.): Koh Roi, Koh Kudu, Koh Nok, James Bond Island",
            "Phi Phi (ca. 45–60 Min.): Maya Bay, Pileh Lagoon, Bamboo Island",
            "Süden (ca. 90+ Min.): Koh Rok und Koh Haa",
          ],
          en: [
            "Poda group (15–30 min): Koh Poda, Chicken Island, Tup sandbar, Phra Nang Cave Beach",
            "Hong archipelago (approx. 30–45 min): Koh Hong, Koh Lao Lading, Koh Pakbia",
            "Phang Nga Bay (approx. 45–75 min): Koh Roi, Koh Kudu, Koh Nok, James Bond Island",
            "Phi Phi (approx. 45–60 min): Maya Bay, Pileh Lagoon, Bamboo Island",
            "The south (approx. 90+ min): Koh Rok and Koh Haa",
          ],
        },
        tip: {
          de: "Die angegebenen Fahrzeiten gelten für ein Speedboat bei ruhiger See ab Ao Nang. Bei Wellengang – vor allem in der Regenzeit – kann es deutlich länger dauern.",
          en: "The travel times above assume a speedboat from Ao Nang in calm seas. In choppy conditions – especially in the rainy season – it can take noticeably longer.",
        },
      },
      {
        h2: { de: "Die Klassiker: Poda-Gruppe und Railay", en: "The classics: the Poda group and Railay" },
        body: {
          de: [
            "Die berühmte 4-Islands-Tour verbindet Koh Poda, Chicken Island, die Tup-Sandbank und Phra Nang Cave Beach. Die Inseln liegen so nah beieinander, dass Sie mit einem schnellen Boot kaum Zeit auf dem Wasser verlieren. Genau deshalb sind sie aber auch das Ziel fast aller Gruppentouren aus Ao Nang.",
            "Der Trick ist die Reihenfolge: Die meisten Boote starten am Vormittag und fahren eine ähnliche Route. Wer früh startet oder die Route umdreht, erlebt Koh Poda und die Sandbank oft fast leer. Die Tup-Sandbank selbst ist nur bei niedrigem Wasserstand begehbar – ein Blick in die Gezeitentabelle entscheidet, wann Sie dort sein sollten.",
          ],
          en: [
            "The famous 4 Islands tour links Koh Poda, Chicken Island, the Tup sandbar and Phra Nang Cave Beach. The islands sit so close together that a fast boat barely loses any time on the water. That is exactly why nearly every group tour from Ao Nang heads there too.",
            "The trick is the order: most boats leave mid-morning and follow a similar route. Start early or run the route in reverse and you will often find Koh Poda and the sandbar almost empty. The Tup sandbar itself is only walkable at low water – the tide table decides when you should be there.",
          ],
        },
      },
      {
        h2: { de: "Lagunen und Geheimtipps im Norden", en: "Lagoons and hidden gems to the north" },
        body: {
          de: [
            "Nordwestlich von Ao Nang liegt Koh Hong mit einer fast vollständig von Felsen umschlossenen Lagune. Kombiniert wird sie meist mit Koh Lao Lading, einem winzigen Strand zwischen zwei Felswänden, und Koh Pakbia mit seinen Sandbänken. Noch weiter in Richtung Phang Nga Bucht wird es ruhiger: Koh Roi versteckt eine Lagune hinter einem engen Durchgang, Koh Kudu hat eine Innenlagune und Koh Nok einen stillen Strand.",
            "Diese Inseln sind für viele große Boote zu weit oder zu unbequem für ein festes Tagesprogramm. Mit einem kleinen, schnellen Boot werden sie dagegen zum Highlight – und genau hier liegt der Unterschied zwischen einem Massenausflug und einem echten Entdeckertag.",
          ],
          en: [
            "Northwest of Ao Nang lies Koh Hong, with a lagoon almost completely enclosed by cliffs. It is usually combined with Koh Lao Lading, a tiny beach between two rock walls, and Koh Pakbia with its sandbars. Further towards Phang Nga Bay things get quieter: Koh Roi hides a lagoon behind a narrow passage, Koh Kudu has an inner lagoon and Koh Nok a peaceful beach.",
            "For many big boats these islands are too far away or too awkward for a fixed day schedule. With a small, fast boat they become the highlight – and that is the difference between a mass excursion and a real day of exploring.",
          ],
        },
        tip: {
          de: "Lagunen wie Koh Roi oder Koh Kudu sind gezeitenabhängig: Mal ist der Zugang zu flach, mal zu tief. Ein ortskundiger Kapitän plant die Route rund um das passende Zeitfenster.",
          en: "Lagoons like Koh Roi and Koh Kudu depend on the tide: sometimes the entrance is too shallow, sometimes too deep. A local captain plans the route around the right window.",
        },
      },
      {
        h2: { de: "Weiter draußen: Phi Phi, Koh Rok und James Bond Island", en: "Further out: Phi Phi, Koh Rok and James Bond Island" },
        body: {
          de: [
            "Die Phi-Phi-Inseln sind die bekannteste Inselgruppe Thailands. Maya Bay wird inzwischen streng geschützt: Baden ist dort nicht erlaubt, die Besuchszeit ist begrenzt und die Bucht schließt jedes Jahr für eine Erholungspause, in den letzten Jahren meist von August bis September. Wer Phi Phi schön erleben will, kommt sehr früh am Morgen.",
            "Koh Rok und Koh Haa im Süden belohnen die lange Fahrt mit klarem Wasser und Korallen. Sie liegen in einem Nationalpark, der während des Südwestmonsuns in der Regel schließt. James Bond Island in der Phang Nga Bucht ist dagegen ganzjährig ein Klassiker, vor allem in Kombination mit dem Stelzendorf Koh Panyee und den Mangroven.",
          ],
          en: [
            "The Phi Phi islands are Thailand’s best-known island group. Maya Bay is now strictly protected: swimming is not allowed, visiting time is limited and the bay closes every year for a recovery break, in recent years usually from August to September. If you want to see Phi Phi at its best, come very early in the morning.",
            "Koh Rok and Koh Haa in the south reward the long ride with clear water and coral. They lie in a national park that usually closes during the southwest monsoon. James Bond Island in Phang Nga Bay, on the other hand, is a year-round classic, especially combined with the stilt village of Koh Panyee and the mangroves.",
          ],
        },
      },
      {
        h2: { de: "Welche Krabi Insel passt zu Ihnen?", en: "Which Krabi island suits you?" },
        body: {
          de: [
            "Es gibt nicht die eine schönste Insel – es kommt darauf an, was Sie suchen. Für den ersten Tag in Krabi ist die Poda-Gruppe ideal, weil die Wege kurz sind und Sie viel sehen. Fotografen und Paare lieben Koh Hong und Railay zum Sonnenuntergang. Wer Ruhe sucht, fährt in die Phang Nga Bucht nach Koh Roi und Koh Kudu.",
          ],
          en: [
            "There is no single most beautiful island – it depends on what you are after. For your first day in Krabi the Poda group is ideal: short hops, lots to see. Photographers and couples love Koh Hong and Railay at sunset. If you want peace and quiet, head into Phang Nga Bay to Koh Roi and Koh Kudu.",
          ],
        },
        list: {
          de: [
            "Familien: Tup-Sandbank, Koh Poda, Railay – kurze Wege, flaches Wasser",
            "Schnorcheln: Koh Rok, Koh Haa, Koh Pakbia",
            "Fotografie und Drohne: Koh Hong, Phang Nga Bucht, Tup-Sandbank von oben",
            "Ruhe und Entdeckergefühl: Koh Roi, Koh Kudu, Koh Nok",
            "Romantik: Sunset an Koh Poda oder vor Railay",
          ],
          en: [
            "Families: Tup sandbar, Koh Poda, Railay – short rides, shallow water",
            "Snorkelling: Koh Rok, Koh Haa, Koh Pakbia",
            "Photography and drone: Koh Hong, Phang Nga Bay, the Tup sandbar from above",
            "Peace and a sense of discovery: Koh Roi, Koh Kudu, Koh Nok",
            "Romance: sunset at Koh Poda or off Railay",
          ],
        },
      },
      {
        h2: { de: "Nationalparks, Gebühren und Respekt vor der Natur", en: "National parks, fees and respect for nature" },
        body: {
          de: [
            "Viele Krabi Inseln liegen in Meeresnationalparks, etwa Hat Noppharat Thara–Mu Ko Phi Phi, Than Bok Khorani oder Ao Phang Nga. Dort wird in der Regel eine Eintrittsgebühr pro Person erhoben, deren Höhe sich ändern kann – fragen Sie Ihren Anbieter, ob sie im Preis enthalten ist.",
            "In den Parks gilt: keine Korallen berühren, keine Fische füttern, keinen Müll hinterlassen. In thailändischen Meeresnationalparks sind zudem Sonnencremes mit bestimmten Inhaltsstoffen wie Oxybenzon verboten. Riffschonende Sonnencreme ist also nicht nur gut für die Natur, sondern auch Pflicht.",
          ],
          en: [
            "Many Krabi islands lie within marine national parks such as Hat Noppharat Thara–Mu Ko Phi Phi, Than Bok Khorani or Ao Phang Nga. A per-person entrance fee is usually charged, and the amount can change – ask your operator whether it is included.",
            "The rules in the parks are simple: don’t touch coral, don’t feed fish, leave no rubbish. Thai marine national parks also ban sunscreens containing certain ingredients such as oxybenzone. Reef-safe sunscreen is therefore not just kind to nature but required.",
          ],
        },
      },
      {
        h2: { de: "Unser Insider-Fazit", en: "Our insider verdict" },
        body: {
          de: [
            "Die Krabi Inseln sind nicht überbewertet – sie werden nur oft zur falschen Zeit besucht. Wer Gezeiten, Abfahrtszeiten der großen Boote und die Saison im Blick hat, erlebt selbst die berühmten Spots in Ruhe.",
          ],
          en: [
            "The Krabi islands are not overrated – they are just often visited at the wrong time. Keep an eye on the tides, the departure times of the big boats and the season, and even the famous spots can be enjoyed in peace.",
          ],
        },
      },
    ],
    faq: [
      {
        q: { de: "Welche ist die schönste Insel bei Krabi?", en: "Which is the most beautiful island near Krabi?" },
        a: {
          de: "Das hängt vom Geschmack ab. Koh Hong mit seiner Lagune und Koh Poda mit dem Postkartenfelsen werden am häufigsten genannt. Für Ruhe sind Koh Roi und Koh Kudu in der Phang Nga Bucht die stärkeren Geheimtipps.",
          en: "It depends on your taste. Koh Hong with its lagoon and Koh Poda with its postcard rock are mentioned most often. For peace and quiet, Koh Roi and Koh Kudu in Phang Nga Bay are the better hidden gems.",
        },
      },
      {
        q: { de: "Wie viele Inseln schafft man an einem Tag?", en: "How many islands can you visit in one day?" },
        a: {
          de: "Mit einem Speedboat sind vier bis fünf Stopps an einem Tag gut machbar, ohne zu hetzen. Bei weiten Zielen wie Phi Phi oder Koh Rok sind es eher drei, damit genug Zeit im Wasser bleibt.",
          en: "With a speedboat, four or five stops in a day are comfortable without rushing. For distant destinations such as Phi Phi or Koh Rok, three stops is more realistic so there is enough time in the water.",
        },
      },
      {
        q: { de: "Brauche ich eine Tour oder kann ich die Inseln selbst besuchen?", en: "Do I need a tour or can I visit the islands myself?" },
        a: {
          de: "Die nahen Inseln erreichen Sie auch mit Longtail-Booten vom Strand in Ao Nang. Für entferntere Ziele, flexible Routen und gutes Timing ist ein privates Speedboat mit ortskundigem Kapitän deutlich komfortabler.",
          en: "You can reach the nearby islands with longtail boats from Ao Nang beach. For more distant destinations, flexible routes and good timing, a private speedboat with a local captain is far more comfortable.",
        },
      },
      {
        q: { de: "Wann ist die beste Zeit für Inselausflüge in Krabi?", en: "When is the best time for island trips in Krabi?" },
        a: {
          de: "Die Trockenzeit von etwa November bis April bietet in der Regel die ruhigste See. Auch in der Regenzeit gibt es viele gute Tage, dann ist aber mehr Flexibilität bei der Routenwahl nötig.",
          en: "The dry season from roughly November to April usually brings the calmest seas. There are plenty of good days in the rainy season too, but you need more flexibility with the route.",
        },
      },
    ],
    related: ["krabi-island-hopping-planner", "best-time-to-visit-krabi", "hong-island-krabi", "koh-roi-hidden-lagoon"],
    tourIds: ["4islands-sunset", "hong-lagoons", "phang-nga-uncharted"],
    image: IMG.hero,
  },

  /* ───────────────────────── Pillar 2: best time / monsoon ───────────────────────── */
  {
    slug: "best-time-to-visit-krabi",
    category: "pillar",
    short: { de: "Reisezeit", en: "Best time" },
    primaryKeyword: "Krabi beste Reisezeit",
    keywords: ["Krabi beste Reisezeit", "best time to visit Krabi", "Krabi Regenzeit", "Krabi Monsun", "Krabi Wetter", "Krabi weather by month"],
    title: {
      de: "Krabi beste Reisezeit: Monsun, Wetter & Inseln",
      en: "Best Time to Visit Krabi: Monsoon, Weather & Seas",
    },
    metaDescription: {
      de: "Krabi beste Reisezeit: Trockenzeit, Monsun und Übergangsmonate im Check – wann die See ruhig ist, welche Inseln schließen und wie Regenzeit trotzdem klappt.",
      en: "Best time to visit Krabi: dry season, monsoon and shoulder months explained – when the sea is calm, which islands close and how the rainy season still works.",
    },
    h1: {
      de: "Krabi beste Reisezeit – Wetter, Monsun und Inselsaison",
      en: "Best time to visit Krabi – weather, monsoon and island season",
    },
    intro: {
      de: "Die beste Reisezeit für Krabi hängt davon ab, was Sie vorhaben. Für Inselausflüge zählt vor allem eines: der Seegang. Krabi liegt an der Andamanensee und wird von zwei Monsunen geprägt – dem trockenen Nordostmonsun im Winter und dem feuchten Südwestmonsun im Sommer. Hier erfahren Sie, wie sich das auf Boote, Inseln und Ihre Planung auswirkt, und warum die Regenzeit besser ist als ihr Ruf.",
      en: "The best time to visit Krabi depends on what you plan to do. For island trips one thing matters most: the state of the sea. Krabi sits on the Andaman Sea and is shaped by two monsoons – the dry northeast monsoon in winter and the wet southwest monsoon in summer. Here is how that affects boats, islands and your planning, and why the rainy season is better than its reputation.",
    },
    sections: [
      {
        h2: { de: "Das Klima in Krabi kurz erklärt", en: "Krabi’s climate in a nutshell" },
        body: {
          de: [
            "Krabi ist das ganze Jahr über warm, die Temperaturen liegen tagsüber meist um die 30 Grad. Den Unterschied machen Regen und Wind. Von etwa November bis April weht der Nordostmonsun über das Festland – an der Andamanenküste bedeutet das trockene Tage, viel Sonne und meist spiegelglattes Wasser.",
            "Ab etwa Mai dreht der Wind. Der Südwestmonsun bringt feuchte Luft vom Indischen Ozean, mehr Wolken, kräftige Schauer und an manchen Tagen deutlich mehr Wellen. Die nassesten Monate sind in der Regel September und Oktober. Das bedeutet aber nicht, dass es den ganzen Tag regnet: Oft kommen Schauer am Nachmittag oder nachts, dazwischen scheint die Sonne.",
          ],
          en: [
            "Krabi is warm all year round, with daytime temperatures usually around 30 °C. Rain and wind make the difference. From roughly November to April, the northeast monsoon blows across the mainland – on the Andaman coast that means dry days, plenty of sunshine and often glassy water.",
            "From around May the wind turns. The southwest monsoon brings humid air from the Indian Ocean, more cloud, heavy showers and, on some days, noticeably bigger waves. The wettest months are usually September and October. That does not mean it rains all day: showers often come in the afternoon or at night, with sunshine in between.",
          ],
        },
      },
      {
        h2: { de: "Hauptsaison November bis April", en: "High season: November to April" },
        body: {
          de: [
            "Die Hauptsaison ist die sicherste Wahl für Inselhopping. Das Meer ist ruhig, die Sicht unter Wasser meist gut und alle Ziele – auch Koh Rok und Koh Haa – sind erreichbar. Dezember bis Februar gelten als ideal: angenehm warm, wenig Regen. März und April werden heißer, dafür ist das Wasser oft besonders klar.",
            "Der Nachteil: Diese Monate sind auch für alle anderen ideal. Rund um Weihnachten, Neujahr und das chinesische Neujahr sind die bekannten Strände entsprechend voll. Gerade dann lohnt es sich, früh zu starten oder auf weniger bekannte Inseln auszuweichen.",
          ],
          en: [
            "High season is the safest choice for island hopping. The sea is calm, underwater visibility is usually good and every destination – including Koh Rok and Koh Haa – is accessible. December to February are considered ideal: pleasantly warm with little rain. March and April get hotter, but the water is often especially clear.",
            "The downside: these months are ideal for everyone else too. Around Christmas, New Year and Chinese New Year, the well-known beaches are busy. That is exactly when an early start or a switch to lesser-known islands pays off.",
          ],
        },
        tip: {
          de: "Wenn Sie in der Hochsaison reisen, buchen Sie Ihren wichtigsten Inseltag gleich für die ersten Tage. Fällt er wegen Wind aus, haben Sie noch Ausweichtermine.",
          en: "Travelling in high season? Book your most important island day early in your stay. If wind cancels it, you still have backup dates.",
        },
      },
      {
        h2: { de: "Regenzeit und Monsun: Mai bis Oktober", en: "Rainy season and monsoon: May to October" },
        body: {
          de: [
            "Die Regenzeit hat Vorteile: weniger Menschen, sattgrüne Landschaften und dramatische Wolkenstimmungen über den Felsen. Viele Tage sind morgens ruhig und sonnig. Für Bootsausflüge bedeutet die Regenzeit vor allem eines: Flexibilität. Ein guter Kapitän prüft morgens Wind und Wellen und wählt dann geschützte Routen.",
            "Die Phang Nga Bucht ist dabei ein echter Joker. Sie liegt geschützt hinter Inseln und Festland, sodass Ziele wie Koh Roi, Koh Kudu oder James Bond Island auch in der Regenzeit oft gut erreichbar sind. Offenere Gewässer Richtung Phi Phi oder Koh Rok sind dagegen stärker vom Wetter abhängig.",
          ],
          en: [
            "The rainy season has its perks: fewer people, lush green landscapes and dramatic clouds over the cliffs. Many days start calm and sunny. For boat trips, the rainy season mainly means one thing: flexibility. A good captain checks wind and waves in the morning and then picks sheltered routes.",
            "Phang Nga Bay is a real joker here. It is sheltered behind islands and mainland, so destinations like Koh Roi, Koh Kudu or James Bond Island are often reachable even in the rainy season. More open waters towards Phi Phi or Koh Rok depend much more on the weather.",
          ],
        },
        list: {
          de: [
            "Maya Bay auf Phi Phi schließt in der Regel jedes Jahr für rund zwei Monate (zuletzt August bis September)",
            "Der Nationalpark rund um Koh Rok und Koh Haa ist während des Südwestmonsuns meist geschlossen",
            "Bei Unwetterwarnungen können Behörden Bootsfahrten kurzfristig einschränken",
          ],
          en: [
            "Maya Bay on Phi Phi usually closes for around two months every year (most recently August to September)",
            "The national park around Koh Rok and Koh Haa is usually closed during the southwest monsoon",
            "During storm warnings, authorities can restrict boat traffic at short notice",
          ],
        },
      },
      {
        h2: { de: "Die Übergangsmonate als Geheimtipp", en: "The shoulder months as an insider tip" },
        body: {
          de: [
            "April, Mai sowie Ende Oktober und November sind oft die spannendsten Monate. Die großen Reisewellen sind vorbei oder noch nicht angekommen, die Preise für Unterkünfte sind häufig niedriger und das Wetter ist in vielen Jahren schon oder noch sehr gut. Im November startet die Saison, viele Nationalparks öffnen wieder, und die Landschaft ist nach dem Monsun besonders grün.",
            "Garantien gibt es in den Übergangsmonaten nicht – das Wetter schwankt von Jahr zu Jahr. Planen Sie einen oder zwei Puffertage ein, dann ist das Risiko gering.",
          ],
          en: [
            "April, May, late October and November are often the most interesting months. The big travel waves are over or have not arrived yet, accommodation is often cheaper, and in many years the weather is already – or still – very good. In November the season starts, many national parks reopen and the landscape is especially green after the monsoon.",
            "There are no guarantees in the shoulder months – the weather varies from year to year. Plan one or two buffer days and the risk stays low.",
          ],
        },
      },
      {
        h2: { de: "Krabi Wetter nach Monaten", en: "Krabi weather by month" },
        body: {
          de: ["Diese Übersicht ist eine Faustregel, kein Versprechen – sie hilft aber bei der groben Planung:"],
          en: ["This overview is a rule of thumb, not a promise – but it helps with rough planning:"],
        },
        list: {
          de: [
            "Dezember–Februar: trocken, ruhige See, Hochsaison",
            "März–April: heiß, sehr klares Wasser, meist ruhig",
            "Mai–Juni: erste Schauer, oft noch viele gute Bootstage",
            "Juli–August: wechselhaft, geschützte Routen bevorzugt",
            "September–Oktober: nasseste Monate, mehr Wellen, flexibel planen",
            "November: Saisonstart, grüne Landschaft, Nationalparks öffnen wieder",
          ],
          en: [
            "December–February: dry, calm seas, high season",
            "March–April: hot, very clear water, mostly calm",
            "May–June: first showers, often still plenty of good boat days",
            "July–August: changeable, sheltered routes preferred",
            "September–October: wettest months, more waves, plan flexibly",
            "November: season opener, green landscape, national parks reopen",
          ],
        },
      },
      {
        h2: { de: "Tageszeit schlägt Jahreszeit", en: "Time of day beats time of year" },
        body: {
          de: [
            "Fast noch wichtiger als der Monat ist die Uhrzeit. Morgens ist das Meer an der Andamanenküste oft am ruhigsten, das Licht weich und die Strände leer. Nachmittags frischt der Wind häufig auf, und in der Regenzeit bauen sich dann auch die Gewitterwolken auf. Ein früher Start ist deshalb in jeder Saison der beste Tipp – für Fotos, für ruhige Fahrten und für Inseln ohne Menschenmassen.",
          ],
          en: [
            "Even more important than the month is the time of day. In the morning, the sea on the Andaman coast is often at its calmest, the light soft and the beaches empty. In the afternoon the wind often picks up, and in the rainy season that is also when thunderclouds build. An early start is therefore the best tip in any season – for photos, for smooth rides and for islands without crowds.",
          ],
        },
        tip: {
          de: "Mit einem privaten Boot können Sie den Start an das Wetter anpassen: Bei einer Gewitterprognose für den Nachmittag fahren Sie einfach eine Stunde früher los.",
          en: "With a private boat you can adapt the start to the weather: if afternoon storms are forecast, simply leave an hour earlier.",
        },
      },
    ],
    faq: [
      {
        q: { de: "Wann ist die beste Reisezeit für Krabi?", en: "When is the best time to visit Krabi?" },
        a: {
          de: "Für Inselausflüge ist die Trockenzeit von etwa November bis April am zuverlässigsten, mit Dezember bis Februar als Idealmonaten. Die Übergangsmonate bieten oft gutes Wetter bei weniger Andrang.",
          en: "For island trips, the dry season from roughly November to April is the most reliable, with December to February as the ideal months. The shoulder months often offer good weather with fewer crowds.",
        },
      },
      {
        q: { de: "Kann man in der Regenzeit Inselausflüge machen?", en: "Can you do island trips in the rainy season?" },
        a: {
          de: "Ja, an vielen Tagen. Wichtig sind flexible Planung und geschützte Routen, etwa in der Phang Nga Bucht. Bei starkem Wind oder Warnungen werden Fahrten aus Sicherheitsgründen verschoben.",
          en: "Yes, on many days. What matters is flexible planning and sheltered routes, for example in Phang Nga Bay. In strong wind or official warnings, trips are postponed for safety.",
        },
      },
      {
        q: { de: "Ist Maya Bay das ganze Jahr geöffnet?", en: "Is Maya Bay open all year?" },
        a: {
          de: "Nein. Maya Bay schließt jedes Jahr für eine Erholungsphase von rund zwei Monaten, zuletzt von August bis September. Die genauen Daten legt die Nationalparkbehörde fest.",
          en: "No. Maya Bay closes every year for a recovery period of around two months, most recently from August to September. The exact dates are set by the national park authority.",
        },
      },
      {
        q: { de: "Welcher Monat ist in Krabi am regnerischsten?", en: "Which month is the rainiest in Krabi?" },
        a: {
          de: "In der Regel September und Oktober. Auch dann gibt es aber oft sonnige Stunden, vor allem am Vormittag.",
          en: "Usually September and October. Even then, there are often sunny hours, especially in the morning.",
        },
      },
    ],
    related: ["krabi-islands-insider-guide", "krabi-island-hopping-planner", "avoid-crowds-krabi-timing", "krabi-tides-guide"],
    tourIds: ["phang-nga-uncharted", "4islands-sunset", "phi-phi-early-bird"],
    image: IMG.sunset,
  },

  /* ───────────────────────── Pillar 3: island hopping planner ───────────────────────── */
  {
    slug: "krabi-island-hopping-planner",
    category: "pillar",
    short: { de: "Insel-Hopping", en: "Island hopping" },
    primaryKeyword: "Krabi Insel-Hopping",
    keywords: ["Krabi Insel-Hopping", "Krabi island hopping", "Krabi private boat tour", "Speedboat Krabi", "Longtail Boot Krabi", "Ao Nang Bootstour"],
    title: {
      de: "Krabi Insel-Hopping planen: Routen, Zeiten, Boote",
      en: "Krabi Island Hopping: Routes, Timing & Boats",
    },
    metaDescription: {
      de: "Krabi Insel-Hopping richtig planen: die besten Routen ab Ao Nang, Longtail vs. Speedboat vs. Privatboot, Fahrzeiten, Gezeiten und Insider-Tipps für Ihren Tag.",
      en: "Plan your Krabi island hopping: the best routes from Ao Nang, longtail vs speedboat vs private boat, travel times, tides and insider tips for a perfect day.",
    },
    h1: {
      de: "Krabi Insel-Hopping planen – Routen, Zeiten und das richtige Boot",
      en: "Planning Krabi island hopping – routes, timing and the right boat",
    },
    intro: {
      de: "Krabi Insel-Hopping ist für viele der Grund, überhaupt nach Krabi zu reisen. Doch zwischen einem perfekten Inseltag und einem hektischen Ausflug mit hundert anderen Menschen liegen oft nur ein paar Entscheidungen: welches Boot, welche Route, welche Uhrzeit. Dieser Planer fasst zusammen, was wir aus unzähligen Fahrten ab Ao Nang gelernt haben – von der Bootswahl bis zur Reihenfolge der Stopps.",
      en: "Krabi island hopping is the reason many people travel to Krabi in the first place. Yet the difference between a perfect island day and a hectic outing with a hundred other people often comes down to a few decisions: which boat, which route, what time. This planner sums up what we have learned from countless trips out of Ao Nang – from choosing the boat to the order of your stops.",
    },
    sections: [
      {
        h2: { de: "Longtail, Gruppen-Speedboat oder Privatboot?", en: "Longtail, group speedboat or private boat?" },
        body: {
          de: [
            "Das Longtail-Boot ist das Wahrzeichen Krabis: Holzboot, langer Propellerschaft, laut und charmant. Für kurze Strecken zur Poda-Gruppe oder nach Railay ist es eine gute Wahl. Für weitere Ziele wird es langsam, nass und bei Wellen unbequem.",
            "Gruppen-Speedboote sind schnell und günstig, folgen aber einem festen Plan. Sie teilen das Boot mit vielen Fremden und kommen meist dann an, wenn alle anderen auch da sind. Ein privates Speedboat kombiniert Tempo mit Freiheit: Sie bestimmen Startzeit, Route und Aufenthaltsdauer, und der Kapitän kann auf Gezeiten und Wetter reagieren.",
          ],
          en: [
            "The longtail boat is Krabi’s icon: wooden hull, long propeller shaft, loud and charming. For short hops to the Poda group or Railay it is a fine choice. For further destinations it becomes slow, wet and uncomfortable in waves.",
            "Group speedboats are fast and affordable but follow a fixed plan. You share the boat with many strangers and usually arrive when everyone else does. A private speedboat combines speed with freedom: you decide the start time, route and how long you stay, and the captain can react to tides and weather.",
          ],
        },
        list: {
          de: [
            "Longtail: ideal für 1–2 nahe Stopps, authentisch, wetterabhängig",
            "Gruppen-Speedboat: schnell und günstig, fester Ablauf, volle Spots",
            "Privates Speedboat: flexible Route, eigenes Timing, Platz für Sie allein",
          ],
          en: [
            "Longtail: ideal for 1–2 nearby stops, authentic, weather-dependent",
            "Group speedboat: fast and affordable, fixed schedule, busy spots",
            "Private speedboat: flexible route, your own timing, space just for you",
          ],
        },
      },
      {
        h2: { de: "Die besten Routen ab Ao Nang", en: "The best routes from Ao Nang" },
        body: {
          de: [
            "Ao Nang ist der ideale Ausgangspunkt, weil fast alle Inselgruppen in Reichweite liegen. Bewährt haben sich vier Routen, die sich je nach Interesse kombinieren lassen.",
          ],
          en: [
            "Ao Nang is the ideal base because nearly every island group is within reach. Four routes have proven themselves and can be combined depending on your interests.",
          ],
        },
        list: {
          de: [
            "4 Islands: Koh Poda, Chicken Island, Tup-Sandbank, Phra Nang Cave Beach – perfekt für den ersten Tag",
            "Hong-Route: Koh Hong Lagune, Koh Lao Lading, Koh Pakbia – Lagunen und Schnorcheln",
            "Phang-Nga-Route: Koh Roi, Koh Kudu, Koh Nok – Geheimtipps mit wenigen Besuchern",
            "Phi Phi Early Bird: Maya Bay (Saison beachten), Pileh Lagoon, Bamboo Island – sehr früh starten",
          ],
          en: [
            "4 Islands: Koh Poda, Chicken Island, Tup sandbar, Phra Nang Cave Beach – perfect for day one",
            "Hong route: Koh Hong lagoon, Koh Lao Lading, Koh Pakbia – lagoons and snorkelling",
            "Phang Nga route: Koh Roi, Koh Kudu, Koh Nok – hidden gems with few visitors",
            "Phi Phi Early Bird: Maya Bay (check the season), Pileh Lagoon, Bamboo Island – start very early",
          ],
        },
        tip: {
          de: "Planen Sie nicht mehr als einen weiten Ausflug pro zwei Tage. Ein ruhiger Strandtag dazwischen macht den nächsten Inseltag deutlich schöner.",
          en: "Plan no more than one long-distance trip every two days. A lazy beach day in between makes the next island day much better.",
        },
      },
      {
        h2: { de: "Timing: Gezeiten und Abfahrtszeiten", en: "Timing: tides and departure times" },
        body: {
          de: [
            "Zwei Uhren bestimmen Ihren Inseltag: die Gezeiten und der Fahrplan der großen Tourboote. Die Tup-Sandbank braucht Niedrigwasser, die Lagune von Koh Hong ist bei höherem Wasserstand am schönsten, und manche Lagunen in der Phang Nga Bucht sind nur in einem bestimmten Fenster zugänglich.",
            "Die meisten Gruppentouren verlassen Ao Nang am Vormittag. Wer eine Stunde früher startet, hat die ersten Stopps oft für sich. Eine andere Strategie ist die umgekehrte Route: Sie fahren dorthin, wo die Gruppen zuletzt ankommen, und sind wieder weg, bevor sie eintreffen.",
          ],
          en: [
            "Two clocks rule your island day: the tides and the timetable of the big tour boats. The Tup sandbar needs low water, the Koh Hong lagoon looks best at higher water, and some lagoons in Phang Nga Bay are only accessible within a certain window.",
            "Most group tours leave Ao Nang mid-morning. Start an hour earlier and you often have the first stops to yourself. Another strategy is the reverse route: go first to where the groups arrive last, and leave before they turn up.",
          ],
        },
      },
      {
        h2: { de: "Wie lange sollte ein Inseltag dauern?", en: "How long should an island day be?" },
        body: {
          de: [
            "Halbtagestouren von vier bis fünf Stunden reichen für die Poda-Gruppe oder Railay. Für Hong, die Phang Nga Bucht oder eine Kombination aus mehreren Gebieten sind sechs bis acht Stunden entspannter. Phi Phi und Koh Rok lohnen sich nur als Ganztagesausflug.",
            "Ein häufiger Fehler ist es, zu viele Stopps in einen Tag zu packen. Lieber vier Orte mit genug Zeit zum Schwimmen, Schnorcheln und Fotografieren als acht Orte im Schnelldurchlauf.",
          ],
          en: [
            "Half-day trips of four to five hours are enough for the Poda group or Railay. For Hong, Phang Nga Bay or a combination of areas, six to eight hours is more relaxed. Phi Phi and Koh Rok only make sense as full-day trips.",
            "A common mistake is cramming too many stops into one day. Better four places with enough time to swim, snorkel and take photos than eight places at a rush.",
          ],
        },
      },
      {
        h2: { de: "Was eine gute Bootstour ausmacht", en: "What makes a good boat trip" },
        body: {
          de: [
            "Achten Sie bei der Wahl des Anbieters auf Sicherheit und Transparenz: Schwimmwesten in passenden Größen, ein erfahrener Kapitän, klare Angaben zu Nationalparkgebühren und was im Preis enthalten ist. Ein gutes Boot hat Schatten, Süßwasser zum Abspülen und ausreichend Trinkwasser an Bord.",
            "Der größte Unterschied liegt jedoch im Wissen der Crew. Wer die Gezeiten kennt, weiß, wann die Sandbank auftaucht. Wer die Region kennt, weiß, welche Bucht gerade leer ist. Genau dieses lokale Wissen macht aus einer Bootsfahrt ein Erlebnis.",
          ],
          en: [
            "When choosing an operator, look for safety and transparency: life jackets in the right sizes, an experienced captain, clear information about national park fees and what the price includes. A good boat has shade, fresh water for rinsing off and enough drinking water on board.",
            "The biggest difference, though, is the crew’s knowledge. If they know the tides, they know when the sandbar appears. If they know the area, they know which bay is empty right now. That local knowledge is what turns a boat ride into an experience.",
          ],
        },
        tip: {
          de: "Fragen Sie vor der Buchung, ob die Route an die Gezeiten des Tages angepasst wird. Die Antwort verrät viel über die Qualität einer Tour.",
          en: "Before booking, ask whether the route is adjusted to that day’s tides. The answer tells you a lot about the quality of the trip.",
        },
      },
      {
        h2: { de: "Checkliste für Ihr Krabi Insel-Hopping", en: "Checklist for your Krabi island hopping" },
        body: {
          de: ["Mit diesen Punkten sind Sie für fast jeden Inseltag gerüstet:"],
          en: ["With these points covered, you are ready for almost any island day:"],
        },
        list: {
          de: [
            "Gezeitentabelle für den Tag prüfen (oder den Kapitän fragen)",
            "Früh starten – idealerweise vor den großen Tourbooten",
            "Riffschonende Sonnencreme, Hut und leichtes Langarmshirt",
            "Wasserschuhe für Sandbänke und felsige Einstiege",
            "Bargeld für Nationalparkgebühren, falls nicht inklusive",
            "Wasserdichte Tasche für Handy und Kamera",
          ],
          en: [
            "Check the day’s tide table (or ask the captain)",
            "Start early – ideally before the big tour boats",
            "Reef-safe sunscreen, a hat and a light long-sleeved shirt",
            "Water shoes for sandbars and rocky entries",
            "Cash for national park fees if not included",
            "A dry bag for your phone and camera",
          ],
        },
      },
    ],
    faq: [
      {
        q: { de: "Was kostet Insel-Hopping in Krabi?", en: "How much does island hopping in Krabi cost?" },
        a: {
          de: "Das hängt stark von Bootstyp, Strecke und Gruppengröße ab. Gruppen-Touren sind pro Person am günstigsten, private Boote werden pro Boot berechnet und lohnen sich besonders für Familien und kleine Gruppen. Nationalparkgebühren kommen je nach Ziel hinzu.",
          en: "It depends heavily on the boat type, distance and group size. Group tours are cheapest per person; private boats are priced per boat and are especially worthwhile for families and small groups. National park fees may be added depending on the destination.",
        },
      },
      {
        q: { de: "Speedboat oder Longtail – was ist besser?", en: "Speedboat or longtail – which is better?" },
        a: {
          de: "Für nahe Ziele ist das Longtail charmant und völlig ausreichend. Für weitere Strecken, mehrere Inselgruppen an einem Tag oder bei Wellengang ist ein Speedboat schneller und deutlich komfortabler.",
          en: "For nearby destinations the longtail is charming and perfectly adequate. For longer distances, several island groups in one day or choppy seas, a speedboat is faster and much more comfortable.",
        },
      },
      {
        q: { de: "Welche Route ist die beste für den ersten Tag?", en: "Which route is best for the first day?" },
        a: {
          de: "Die 4-Islands-Route mit Koh Poda, Chicken Island, Tup-Sandbank und Phra Nang ist ideal: kurze Wege, viel Abwechslung und ein guter Eindruck von der Landschaft.",
          en: "The 4 Islands route with Koh Poda, Chicken Island, the Tup sandbar and Phra Nang is ideal: short rides, plenty of variety and a great first impression of the landscape.",
        },
      },
      {
        q: { de: "Wird man auf dem Speedboat seekrank?", en: "Do people get seasick on a speedboat?" },
        a: {
          de: "Bei ruhiger See selten. Wer empfindlich ist, sitzt am besten mittig oder hinten, schaut zum Horizont und nimmt bei Bedarf vorher ein Mittel gegen Reiseübelkeit.",
          en: "Rarely in calm seas. If you are sensitive, sit in the middle or at the back, look at the horizon and take motion-sickness medication beforehand if needed.",
        },
      },
    ],
    related: ["krabi-islands-insider-guide", "avoid-crowds-krabi-timing", "krabi-tides-guide", "boat-day-packing-list-etiquette"],
    tourIds: ["4islands-sunset", "hong-lagoons", "phang-nga-uncharted"],
    image: IMG.boat,
  },
];
