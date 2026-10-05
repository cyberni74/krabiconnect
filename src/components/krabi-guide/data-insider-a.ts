import { IMG } from "../secret-islands/content";
import type { GuideArticleInput } from "./types";

const PLANKTON_IMG = (n: number) => `/images/guide/krabi-leuchtendes-plankton-nacht-speedboat-${n}.webp`;

export const INSIDER_ARTICLES_A: GuideArticleInput[] = [
  /* ───────────────────────── Crowd avoidance ───────────────────────── */
  {
    slug: "avoid-crowds-krabi-timing",
    category: "insider",
    short: { de: "Ohne Massen", en: "Beat the crowds" },
    primaryKeyword: "Krabi ohne Touristenmassen",
    keywords: ["Krabi ohne Touristenmassen", "Krabi avoid crowds", "Krabi Geheimtipps", "beste Uhrzeit Inseltour Krabi", "Krabi quiet islands", "Phi Phi early morning"],
    title: {
      de: "Krabi ohne Touristenmassen: das Timing-Geheimnis",
      en: "Krabi Without the Crowds: the Timing Secret",
    },
    metaDescription: {
      de: "Krabi ohne Touristenmassen: Wann die Gruppenboote ankommen, wie Sie die Route umdrehen und welche Inseln ruhig bleiben – das Timing-Wissen lokaler Kapitäne.",
      en: "Krabi without the crowds: when the group boats arrive, how to reverse your route and which islands stay quiet – the timing knowledge of local captains.",
    },
    h1: {
      de: "Krabi ohne Touristenmassen – das Timing-Geheimnis der Kapitäne",
      en: "Krabi without the crowds – the captains’ timing secret",
    },
    intro: {
      de: "Die häufigste Enttäuschung bei Inselausflügen in Krabi lautet: Es war wunderschön, aber so voll. Dabei sind die meisten Strände nicht den ganzen Tag überlaufen, sondern nur in einem bestimmten Zeitfenster. Wer versteht, wie die großen Ausflugsboote ticken, kann sie fast immer umgehen. Dieser Artikel verrät die Muster, die lokale Kapitäne kennen – und wie Sie Krabi ohne Touristenmassen erleben.",
      en: "The most common disappointment on Krabi island trips is: it was beautiful, but so crowded. Yet most beaches are not overrun all day – only during a certain window. Once you understand how the big excursion boats operate, you can almost always avoid them. This article reveals the patterns local captains know – and how to experience Krabi without the crowds.",
    },
    sections: [
      {
        h2: { de: "Wie der Tagesrhythmus der Gruppentouren funktioniert", en: "How the group-tour rhythm works" },
        body: {
          de: [
            "Gruppentouren holen ihre Gäste morgens in den Hotels ab, sammeln sie am Pier oder Strand und starten meist am Vormittag. Dadurch erreichen sie die ersten Inseln etwa zur gleichen Zeit, folgen ähnlichen Routen und machen um die Mittagszeit an denselben Stränden Pause. Am Nachmittag geht es zurück.",
            "Das Ergebnis ist ein vorhersehbares Muster: Die Klassiker sind von späterem Vormittag bis frühem Nachmittag voll, davor und danach deutlich ruhiger. Dazu kommen Tagesausflügler aus Phuket, die besonders Phi Phi und James Bond Island ansteuern.",
          ],
          en: [
            "Group tours pick their guests up from hotels in the morning, gather them at the pier or beach and usually leave mid-morning. As a result they reach the first islands at about the same time, follow similar routes and break for lunch on the same beaches. In the afternoon they head back.",
            "The result is a predictable pattern: the classics are busy from late morning to early afternoon and much quieter before and after. Add the day-trippers from Phuket, who head especially for Phi Phi and James Bond Island.",
          ],
        },
      },
      {
        h2: { de: "Strategie 1: früher starten", en: "Strategy 1: start earlier" },
        body: {
          de: [
            "Die einfachste Strategie ist der frühe Start. Wer eine Stunde vor den Gruppen losfährt, hat die ersten zwei Stopps oft fast für sich. Das Licht ist weich, das Meer ruhig und die Temperaturen angenehm. Für Fotos ist das die beste Zeit des Tages.",
          ],
          en: [
            "The simplest strategy is an early start. Leave an hour before the groups and you often have the first two stops almost to yourself. The light is soft, the sea calm and the temperature pleasant. For photos it is the best time of day.",
          ],
        },
        tip: {
          de: "Ein früher Start lohnt sich besonders bei Phi Phi, Koh Poda und Phra Nang – den Orten, die später am vollsten werden.",
          en: "An early start pays off most at Phi Phi, Koh Poda and Phra Nang – the places that get busiest later on.",
        },
      },
      {
        h2: { de: "Strategie 2: die Route umdrehen", en: "Strategy 2: reverse the route" },
        body: {
          de: [
            "Fast alle 4-Islands-Touren fahren dieselbe Reihenfolge. Drehen Sie sie um, sind Sie immer dort, wo die Gruppen gerade nicht sind. Das funktioniert auch bei Hong: Wer zuerst die Nachbarinseln anfährt und die Lagune später besucht, wenn die Gruppen bereits weiter sind, erlebt sie ruhiger.",
            "Wichtig ist dabei die Abstimmung mit den Gezeiten. Die Tup-Sandbank braucht Niedrigwasser, die Hong-Lagune eher höheres Wasser. Ein guter Kapitän legt beide Pläne übereinander.",
          ],
          en: [
            "Almost every 4 Islands tour runs the same order. Reverse it and you are always where the groups are not. It works at Hong too: visit the neighbouring islands first and the lagoon later, once the groups have moved on, and you will find it calmer.",
            "The key is matching this with the tides. The Tup sandbar needs low water, the Hong lagoon rather higher water. A good captain lays both plans on top of each other.",
          ],
        },
      },
      {
        h2: { de: "Strategie 3: später Nachmittag und Sunset", en: "Strategy 3: late afternoon and sunset" },
        body: {
          de: [
            "Wenn die Gruppenboote am Nachmittag zurück nach Ao Nang fahren, beginnt die schönste Zeit auf dem Wasser. Strände leeren sich, das Licht wird golden, und der Sonnenuntergang hinter Koh Poda oder vor den Felsen von Railay gehört fast nur Ihnen. Eine Sunset-Tour ist deshalb nicht nur romantisch, sondern auch die entspannteste Art, die Klassiker zu sehen.",
          ],
          en: [
            "When the group boats head back to Ao Nang in the afternoon, the best time on the water begins. Beaches empty, the light turns golden, and the sunset behind Koh Poda or in front of the Railay cliffs belongs almost entirely to you. A sunset trip is therefore not just romantic but also the most relaxed way to see the classics.",
          ],
        },
      },
      {
        h2: { de: "Strategie 4: andere Inseln wählen", en: "Strategy 4: choose different islands" },
        body: {
          de: [
            "Manchmal ist die beste Strategie, den Klassikern ganz auszuweichen. Die Phang Nga Bucht mit Koh Roi, Koh Kudu und Koh Nok steht auf kaum einem Standardprogramm. Auch Koh Lao Lading oder entlegenere Strände sind oft ruhiger. Die Landschaft ist dabei keineswegs zweite Wahl – im Gegenteil.",
          ],
          en: [
            "Sometimes the best strategy is to skip the classics altogether. Phang Nga Bay with Koh Roi, Koh Kudu and Koh Nok appears on hardly any standard itinerary. Koh Lao Lading and more remote beaches are often quieter too. The scenery is by no means second-best – quite the opposite.",
          ],
        },
        list: {
          de: [
            "Statt Phi Phi am Mittag: Phi Phi früh morgens oder Phang Nga Bucht",
            "Statt Hong zur Hauptzeit: Hong früh oder Lao Lading und Pakbia",
            "Statt 4 Islands am Vormittag: umgekehrte Route oder Sunset-Variante",
            "Statt James Bond Island mittags: davor oder danach anfahren",
          ],
          en: [
            "Instead of Phi Phi at noon: Phi Phi early morning or Phang Nga Bay",
            "Instead of Hong at peak time: Hong early, or Lao Lading and Pakbia",
            "Instead of 4 Islands mid-morning: the reverse route or a sunset version",
            "Instead of James Bond Island at midday: visit before or after",
          ],
        },
      },
      {
        h2: { de: "Saison, Wochentage und Feiertage", en: "Season, weekdays and holidays" },
        body: {
          de: [
            "Auch der Kalender spielt eine Rolle. In der Hochsaison rund um Weihnachten, Neujahr und das chinesische Neujahr sind alle Klassiker voller. Thailändische Feiertage und lange Wochenenden bringen viele einheimische Ausflügler. In der Nebensaison und den Übergangsmonaten ist dagegen vieles entspannter.",
            "Am Ende gilt: Kein Plan garantiert leere Strände. Aber mit Timing, Flexibilität und einem kleinen Boot erhöhen Sie Ihre Chancen enorm.",
          ],
          en: [
            "The calendar matters too. In high season around Christmas, New Year and Chinese New Year, all the classics are busier. Thai public holidays and long weekends bring many local visitors. In low season and the shoulder months, things are much more relaxed.",
            "In the end: no plan guarantees empty beaches. But with timing, flexibility and a small boat, you improve your chances enormously.",
          ],
        },
        tip: {
          de: "Fragen Sie Ihren Kapitän am Vorabend, wie die Route aussehen soll. Wer die Wetter- und Gezeitenlage kennt, wird Ihnen einen klaren Plan nennen können.",
          en: "Ask your captain the evening before what the route will be. Anyone who knows the weather and tides will be able to give you a clear plan.",
        },
      },
    ],
    faq: [
      {
        q: { de: "Wann sind die Inseln in Krabi am vollsten?", en: "When are Krabi’s islands busiest?" },
        a: {
          de: "Meist vom späten Vormittag bis zum frühen Nachmittag, wenn die Gruppentouren ihre Hauptstopps und Mittagspausen machen.",
          en: "Usually from late morning to early afternoon, when group tours make their main stops and lunch breaks.",
        },
      },
      {
        q: { de: "Welche Inseln in Krabi sind ruhig?", en: "Which islands in Krabi are quiet?" },
        a: {
          de: "Koh Roi, Koh Kudu und Koh Nok in der Phang Nga Bucht sowie kleinere Inseln wie Koh Lao Lading sind meist deutlich ruhiger als die Klassiker.",
          en: "Koh Roi, Koh Kudu and Koh Nok in Phang Nga Bay, as well as smaller islands like Koh Lao Lading, are usually much quieter than the classics.",
        },
      },
      {
        q: { de: "Lohnt sich ein privates Boot, um Massen zu vermeiden?", en: "Is a private boat worth it to avoid crowds?" },
        a: {
          de: "Ja, weil Sie Startzeit und Route frei wählen können. Genau diese Flexibilität ist der Schlüssel, um den Gruppen aus dem Weg zu gehen.",
          en: "Yes, because you can choose the start time and route freely. That flexibility is exactly the key to avoiding the groups.",
        },
      },
    ],
    related: ["krabi-island-hopping-planner", "phi-phi-maya-bay-early-morning", "koh-kudu-koh-nok", "krabi-tides-guide"],
    tourIds: ["phi-phi-early-bird", "phang-nga-uncharted", "4islands-sunset"],
    image: IMG.poda,
  },

  /* ───────────────────────── Tides guide ───────────────────────── */
  {
    slug: "krabi-tides-guide",
    category: "insider",
    short: { de: "Gezeiten", en: "Tides" },
    primaryKeyword: "Krabi Gezeiten",
    keywords: ["Krabi Gezeiten", "Krabi tide table", "Ebbe und Flut Krabi", "Tup Sandbank Ebbe", "Springtide Krabi", "Krabi tides islands"],
    title: {
      de: "Krabi Gezeiten: Ebbe & Flut für Inseltouren",
      en: "Krabi Tides Explained: Low & High Tide Guide",
    },
    metaDescription: {
      de: "Krabi Gezeiten verstehen: wie Ebbe und Flut Sandbänke, Lagunen und Strände verändern, was Springtiden bedeuten und wie Sie Ihren Inseltag danach planen.",
      en: "Krabi tides explained: how low and high tide change sandbars, lagoons and beaches, what spring tides mean and how to plan your island day around them.",
    },
    h1: {
      de: "Krabi Gezeiten – wie Ebbe und Flut Ihren Inseltag bestimmen",
      en: "Krabi tides – how low and high water shape your island day",
    },
    intro: {
      de: "Kaum etwas beeinflusst einen Inseltag in Krabi so stark wie die Gezeiten – und kaum etwas wird so oft übersehen. Ob die Tup-Sandbank auftaucht, ob Sie in die Hong-Lagune fahren können oder ob der Strand von Railay East zum Baden taugt, entscheidet der Wasserstand. Dieser Guide erklärt die Krabi Gezeiten verständlich und zeigt, wie Sie sie für perfekte Momente nutzen.",
      en: "Hardly anything affects an island day in Krabi as much as the tides – and hardly anything is overlooked so often. Whether the Tup sandbar appears, whether you can enter the Hong lagoon or whether Railay East is any good for swimming all depends on the water level. This guide explains Krabi’s tides clearly and shows how to use them for perfect moments.",
    },
    sections: [
      {
        h2: { de: "Wie die Gezeiten in Krabi funktionieren", en: "How the tides work in Krabi" },
        body: {
          de: [
            "An der Andamanenküste gibt es in der Regel zwei Hochwasser und zwei Niedrigwasser pro Tag. Zwischen Hoch- und Niedrigwasser liegen also gut sechs Stunden. Jeden Tag verschieben sich die Zeiten um knapp eine Stunde nach hinten – was heute um 9 Uhr Ebbe ist, ist morgen um etwa 10 Uhr.",
            "Der Tidenhub, also der Unterschied zwischen Hoch- und Niedrigwasser, ist in Krabi deutlich spürbar und kann bei Springtiden mehrere Meter betragen. Strände, die bei Flut schmal sind, werden bei Ebbe breit; Buchten, die bei Flut befahrbar sind, fallen bei Ebbe teils trocken.",
          ],
          en: [
            "On the Andaman coast there are usually two high waters and two low waters a day, so a little over six hours lie between high and low. The times shift later by almost an hour every day – if low tide is at 9 am today, it will be around 10 am tomorrow.",
            "The tidal range, the difference between high and low water, is very noticeable in Krabi and can reach several metres during spring tides. Beaches that are narrow at high tide become wide at low tide; bays navigable at high tide partly dry out at low tide.",
          ],
        },
      },
      {
        h2: { de: "Springtide und Nipptide", en: "Spring tides and neap tides" },
        body: {
          de: [
            "Rund um Neumond und Vollmond wirken Sonne und Mond gemeinsam – das sind die Springtiden. Das Hochwasser steigt besonders hoch, das Niedrigwasser fällt besonders tief. Für Sandbänke ist das die beste Zeit. Um Halbmond sind die Unterschiede kleiner, man spricht von Nipptiden.",
          ],
          en: [
            "Around new moon and full moon, the sun and moon pull together – these are spring tides. High water rises especially high and low water falls especially low. For sandbars it is the best time. Around half moon the differences are smaller; these are called neap tides.",
          ],
        },
        tip: {
          de: "Ein Blick auf den Mondkalender verrät schon vor der Reise, an welchen Tagen die Sandbänke besonders eindrucksvoll sein dürften.",
          en: "A glance at the lunar calendar before your trip tells you which days the sandbars are likely to be most impressive.",
        },
      },
      {
        h2: { de: "Welche Spots brauchen Ebbe, welche Flut?", en: "Which spots need low tide, which high tide?" },
        body: {
          de: ["Als Faustregel für die wichtigsten Ziele ab Ao Nang gilt:"],
          en: ["As a rule of thumb for the main destinations from Ao Nang:"],
        },
        list: {
          de: [
            "Tup-Sandbank und Sandbänke bei Pakbia: Niedrigwasser",
            "Hong-Lagune: eher höherer Wasserstand, bei Ebbe teils zu flach",
            "Lagunen von Koh Roi und Koh Kudu: mittleres Fenster, Durchgang abhängig vom Wasserstand",
            "Railay East: zum Baden ungeeignet bei Ebbe (Schlick und Mangroven)",
            "Schnorcheln an Riffen: bei höherem Wasser oft angenehmer, weniger Gefahr, Korallen zu berühren",
          ],
          en: [
            "Tup sandbar and the sandbars at Pakbia: low water",
            "Hong lagoon: rather higher water, partly too shallow at low tide",
            "Koh Roi and Koh Kudu lagoons: a middle window, passage depends on the water level",
            "Railay East: unsuitable for swimming at low tide (mud and mangroves)",
            "Snorkelling on reefs: often nicer at higher water, less risk of touching coral",
          ],
        },
      },
      {
        h2: { de: "So lesen Sie eine Gezeitentabelle", en: "How to read a tide table" },
        body: {
          de: [
            "Gezeitentabellen für Krabi oder Ao Nang finden Sie online und in Apps. Sie zeigen für jeden Tag die Uhrzeiten von Hoch- und Niedrigwasser sowie die Höhe in Metern. Wichtig ist nicht nur die Uhrzeit, sondern auch die Höhe: Ein Niedrigwasser mit sehr geringem Wert bedeutet eine besonders große Sandbank.",
            "Beachten Sie, dass Tabellen für unterschiedliche Messpunkte gelten und die Werte vor Ort leicht abweichen können. Die Erfahrung des Kapitäns ist deshalb wertvoller als jede App.",
          ],
          en: [
            "Tide tables for Krabi or Ao Nang are available online and in apps. They show the times of high and low water for each day and the height in metres. Not only the time matters but also the height: a low water with a very low value means a particularly large sandbar.",
            "Note that tables refer to different gauging points and local values can differ slightly. That is why a captain’s experience is worth more than any app.",
          ],
        },
      },
      {
        h2: { de: "Den Inseltag nach den Gezeiten planen", en: "Planning your island day around the tides" },
        body: {
          de: [
            "Die Kunst besteht darin, die Stopps so anzuordnen, dass jeder Ort zum richtigen Wasserstand besucht wird – und das möglichst außerhalb der Gruppenzeiten. Liegt das Niedrigwasser zum Beispiel am frühen Morgen, startet der Tag an der Tup-Sandbank und endet an der Hong-Lagune bei steigendem Wasser.",
            "Gruppentouren mit festen Abläufen können darauf kaum reagieren. Ein privates Boot dagegen plant jeden Tag neu. Genau das ist der Grund, warum dieselbe Insel an zwei Tagen völlig unterschiedlich wirken kann.",
          ],
          en: [
            "The art is ordering the stops so each place is visited at the right water level – ideally outside group times. If low water is early in the morning, for example, the day starts at the Tup sandbar and ends at the Hong lagoon on a rising tide.",
            "Group tours with fixed schedules can barely respond to this. A private boat, by contrast, plans each day fresh. That is exactly why the same island can feel completely different on two different days.",
          ],
        },
        tip: {
          de: "Achten Sie auf steigendes Wasser an der Sandbank: Es kommt schneller zurück als erwartet. Taschen und Schuhe nie unbeaufsichtigt auf dem Sand liegen lassen.",
          en: "Watch for the rising tide on the sandbar: it comes back faster than expected. Never leave bags and shoes unattended on the sand.",
        },
      },
    ],
    faq: [
      {
        q: { de: "Wie oft ist in Krabi Ebbe?", en: "How often is low tide in Krabi?" },
        a: {
          de: "In der Regel zweimal täglich. Die Zeiten verschieben sich jeden Tag um knapp eine Stunde nach hinten.",
          en: "Usually twice a day. The times shift later by almost an hour each day.",
        },
      },
      {
        q: { de: "Wann ist die Tup-Sandbank am größten?", en: "When is the Tup sandbar biggest?" },
        a: {
          de: "Bei Springtiden rund um Neumond und Vollmond, zur Zeit des Niedrigwassers.",
          en: "During spring tides around new moon and full moon, at the time of low water.",
        },
      },
      {
        q: { de: "Wo finde ich eine Gezeitentabelle für Krabi?", en: "Where can I find a tide table for Krabi?" },
        a: {
          de: "Online und in Gezeiten-Apps, meist unter Krabi oder Ao Nang. Für die Tourplanung ist die Einschätzung des Kapitäns vor Ort zusätzlich hilfreich.",
          en: "Online and in tide apps, usually listed under Krabi or Ao Nang. For trip planning, the local captain’s judgement is an extra help.",
        },
      },
      {
        q: { de: "Ist die Hong-Lagune bei Ebbe zugänglich?", en: "Is the Hong lagoon accessible at low tide?" },
        a: {
          de: "Bei sehr niedrigem Wasser oft nur eingeschränkt, weil sie flach wird. Bei höherem Wasserstand ist sie am schönsten.",
          en: "At very low water often only partly, because it becomes shallow. It is at its best at higher water.",
        },
      },
    ],
    related: ["chicken-island-tup-sandbar", "hong-island-krabi", "koh-roi-hidden-lagoon", "krabi-island-hopping-planner"],
    tourIds: ["4islands-sunset", "family-sandbars", "hong-lagoons"],
    image: IMG.tup,
  },

  /* ───────────────────────── Bioluminescent plankton (private speedboat) ───────────────────────── */
  {
    slug: "krabi-bioluminescent-plankton-night-boat-tour",
    category: "insider",
    short: { de: "Leuchtendes Plankton", en: "Glowing plankton" },
    primaryKeyword: "leuchtendes Plankton Krabi",
    keywords: ["leuchtendes Plankton Krabi", "Krabi bioluminescent plankton", "Biolumineszenz Krabi", "Krabi night boat tour", "Plankton Tour Ao Nang", "glowing plankton Thailand"],
    title: {
      de: "Leuchtendes Plankton Krabi: Nachttour per Speedboat",
      en: "Krabi Bioluminescent Plankton: Private Night Boat",
    },
    metaDescription: {
      de: "Leuchtendes Plankton in Krabi erleben: privat per Speedboat (max. 5 Gäste) in eine dunkle Bucht, Schwimmen im Glitzerwasser – beste Zeit um Neumond, Tipps.",
      en: "See bioluminescent plankton in Krabi by private speedboat (max. 5 guests): a dark bay, swimming in glowing water, best around new moon – tips & what to expect.",
    },
    h1: {
      de: "Leuchtendes Plankton in Krabi – nachts mit dem privaten Speedboat",
      en: "Krabi bioluminescent plankton – at night by private speedboat",
    },
    intro: {
      de: "Es gibt Momente, die man nicht fotografieren kann, aber nie vergisst. Leuchtendes Plankton in Krabi ist so einer: Sie gleiten vom Boot ins warme, dunkle Wasser, bewegen die Hände – und um Sie herum funkeln Tausende winziger blaugrüner Lichtpunkte. Bei uns erleben Sie das nicht in einer großen Gruppe, sondern privat mit dem Speedboat für maximal fünf Gäste: Wir fahren nach Sonnenuntergang in eine dunkle Bucht abseits der Lichter von Ao Nang, und Sie schwimmen oder schnorcheln direkt vom Boot aus im Glitzerwasser.",
      en: "Some moments can’t be photographed but are never forgotten. Bioluminescent plankton in Krabi is one of them: you slip from the boat into warm, dark water, move your hands – and thousands of tiny blue-green sparks light up around you. With us you experience it not in a big group but privately, by speedboat for a maximum of five guests: after sunset we head to a dark bay away from the lights of Ao Nang, and you swim or snorkel straight from the boat in the glittering water.",
    },
    sections: [
      {
        h2: { de: "Was ist leuchtendes Plankton?", en: "What is bioluminescent plankton?" },
        body: {
          de: [
            "Das Leuchten stammt meist von winzigen Einzellern, sogenannten Dinoflagellaten. Werden sie durch Bewegung gereizt – eine Hand, ein Flossenschlag, die Bugwelle eines Bootes –, erzeugen sie durch eine chemische Reaktion ein kurzes, kaltes Licht. Dieses Phänomen heißt Biolumineszenz.",
            "Für das bloße Auge ist das Plankton tagsüber unsichtbar. Erst in echter Dunkelheit wird das Leuchten sichtbar – und je dunkler die Umgebung, desto intensiver wirkt es.",
          ],
          en: [
            "The glow usually comes from tiny single-celled organisms called dinoflagellates. When something disturbs them – a hand, a fin kick, a boat’s wake – a chemical reaction makes them emit a brief, cold light. This phenomenon is called bioluminescence.",
            "During the day the plankton is invisible to the naked eye. Only in real darkness does the glow appear – and the darker the surroundings, the more intense it looks.",
          ],
        },
      },
      {
        h2: { de: "So läuft unsere Nachtfahrt mit dem Speedboat ab", en: "How our night trip by speedboat works" },
        body: {
          de: [
            "Viele Gäste kombinieren die Nachtfahrt mit dem Sonnenuntergang: Wir starten am späten Nachmittag, genießen das Abendlicht vor den Felsen von Phra Nang oder Koh Poda und warten, bis es richtig dunkel ist. Dann fährt das Speedboat in eine ruhige, dunkle Bucht, weit weg von Strandbars und Hotelbeleuchtung.",
            "Dort schaltet die Crew die Lichter an Bord aus, Ihre Augen gewöhnen sich an die Dunkelheit, und Sie steigen über die Badeleiter ins Wasser. Mit Maske und Schnorchel sehen Sie das Funkeln sogar unter Wasser. Weil Sie mit maximal fünf Personen an Bord sind, ist es still, entspannt und ganz Ihr Moment.",
          ],
          en: [
            "Many guests combine the night trip with the sunset: we leave in the late afternoon, enjoy the evening light in front of the Phra Nang or Koh Poda cliffs and wait until it is truly dark. Then the speedboat heads to a quiet, dark bay far from beach bars and hotel lights.",
            "There the crew switches off the lights on board, your eyes adjust to the darkness and you climb down the swim ladder into the water. With mask and snorkel you can even see the sparkle underwater. With no more than five people on board, it is quiet, relaxed and entirely your moment.",
          ],
        },
        list: {
          de: [
            "Privates Speedboat, maximal 5 Gäste",
            "Optional: Sonnenuntergang vor den Kalkfelsen",
            "Dunkle Bucht abseits der Lichtverschmutzung",
            "Schwimmen und Schnorcheln direkt vom Boot, Schwimmwesten an Bord",
            "Kurze Rückfahrt nach Ao Nang unter dem Sternenhimmel",
          ],
          en: [
            "Private speedboat, maximum 5 guests",
            "Optional: sunset in front of the limestone cliffs",
            "A dark bay away from light pollution",
            "Swimming and snorkelling straight from the boat, life jackets on board",
            "Short ride back to Ao Nang under the stars",
          ],
        },
      },
      {
        h2: { de: "Beste Zeit: Neumond und dunkle Nächte", en: "Best time: new moon and dark nights" },
        body: {
          de: [
            "Der wichtigste Faktor ist Dunkelheit. Rund um Neumond, wenn der Mond nicht oder erst spät am Himmel steht, ist das Leuchten am eindrucksvollsten. Bei Vollmond ist es zwar oft noch sichtbar, wirkt aber deutlich schwächer.",
            "Ehrlicherweise gilt: Plankton ist Natur. Wie stark es an einem bestimmten Abend leuchtet, hängt auch von Wassertemperatur, Strömung und Jahreszeit ab und lässt sich nicht garantieren. Wir planen die Termine deshalb gern rund um die dunkelsten Nächte Ihres Aufenthalts.",
          ],
          en: [
            "The most important factor is darkness. Around new moon, when the moon is absent or rises late, the glow is most impressive. At full moon it is often still visible but noticeably weaker.",
            "To be honest: plankton is nature. How strongly it glows on a particular evening also depends on water temperature, currents and season, and cannot be guaranteed. That is why we like to plan dates around the darkest nights of your stay.",
          ],
        },
        tip: {
          de: "Schauen Sie vor der Buchung in den Mondkalender. Die Nächte kurz vor und nach Neumond sind meist die besten – und abends nach Sonnenuntergang ist der Mond dann ohnehin kaum zu sehen.",
          en: "Check the lunar calendar before booking. The nights just before and after new moon are usually the best – and after sunset the moon is then barely visible anyway.",
        },
      },
      {
        h2: { de: "Warum privat per Speedboat?", en: "Why by private speedboat?" },
        body: {
          de: [
            "Das Leuchten lebt von Dunkelheit und Ruhe. Auf einem großen, voll besetzten Boot mit Lichtern, Musik und vielen Menschen im Wasser geht genau das verloren. Mit einem kleinen, privaten Speedboat können wir eine abgelegene Bucht wählen, den Zeitpunkt flexibel anpassen und den Moment so gestalten, wie Sie ihn sich wünschen.",
            "Ein weiterer Vorteil ist die Sicherheit: Das Boot bleibt immer in Ihrer Nähe, die Crew behält alle Gäste im Blick, und Schwimmwesten sowie Licht für den Notfall sind an Bord.",
          ],
          en: [
            "The glow depends on darkness and calm. On a large, full boat with lights, music and lots of people in the water, that is exactly what gets lost. With a small private speedboat we can choose a secluded bay, adjust the timing flexibly and shape the moment the way you want it.",
            "Another advantage is safety: the boat always stays close, the crew keeps an eye on every guest, and life jackets and emergency lights are on board.",
          ],
        },
      },
      {
        h2: { de: "Tipps für Ihren Plankton-Abend", en: "Tips for your plankton evening" },
        body: {
          de: [
            "Lassen Sie Ihren Augen nach dem Ausschalten der Lichter ein paar Minuten Zeit. Je länger Sie im Dunkeln sind, desto mehr sehen Sie. Bewegen Sie Hände und Beine langsam durchs Wasser, und tauchen Sie mit Maske kurz unter – das Funkeln wirkt dann wie ein Sternenhimmel unter Wasser.",
            "Fotos und Videos sind schwierig: Das Licht ist schwach und kurz, Handykameras fangen es meist kaum ein. Genießen Sie den Moment lieber bewusst. Nehmen Sie Badesachen, ein Handtuch und eine leichte Jacke für die Rückfahrt mit, und verzichten Sie auf Insektenspray und Sonnencreme kurz vor dem Schwimmen.",
          ],
          en: [
            "Give your eyes a few minutes after the lights go off. The longer you are in the dark, the more you will see. Move your hands and legs slowly through the water and duck under briefly with a mask – the sparkle then looks like a starry sky underwater.",
            "Photos and videos are tricky: the light is faint and brief, and phone cameras rarely capture it. Better to enjoy the moment consciously. Bring swimwear, a towel and a light jacket for the ride back, and skip insect spray and sunscreen just before swimming.",
          ],
        },
      },
    ],
    faq: [
      {
        q: { de: "Wann sieht man leuchtendes Plankton in Krabi?", en: "When can you see bioluminescent plankton in Krabi?" },
        a: {
          de: "Nach Einbruch der Dunkelheit, am besten in mondlosen Nächten rund um Neumond und fernab von künstlichem Licht. Die Intensität schwankt natürlich und ist nicht garantiert.",
          en: "After dark, ideally on moonless nights around new moon and far from artificial light. The intensity varies naturally and is not guaranteed.",
        },
      },
      {
        q: { de: "Ist Schwimmen in der Nacht sicher?", en: "Is swimming at night safe?" },
        a: {
          de: "Bei uns schwimmen Sie in einer ruhigen Bucht direkt am Boot, mit Schwimmweste auf Wunsch und unter Aufsicht der Crew. Bei Wind oder Wellen findet der Schwimmstopp nicht statt.",
          en: "With us you swim in a calm bay right next to the boat, with a life jacket if you wish and under the crew’s supervision. In wind or waves the swim stop does not take place.",
        },
      },
      {
        q: { de: "Kann man das Plankton fotografieren?", en: "Can you photograph the plankton?" },
        a: {
          de: "Nur sehr eingeschränkt. Das Leuchten ist schwach und kurz – mit dem Handy gelingt das selten. Am schönsten ist es mit den eigenen Augen.",
          en: "Only to a limited extent. The glow is faint and brief – phones rarely manage it. It is most beautiful seen with your own eyes.",
        },
      },
      {
        q: { de: "Lässt sich die Plankton-Tour mit dem Sonnenuntergang kombinieren?", en: "Can the plankton trip be combined with sunset?" },
        a: {
          de: "Ja. Unsere Sunset & Night Glow Kombi startet am Nachmittag, zeigt den Sonnenuntergang vor den Kalkfelsen und endet mit dem Schwimmen im leuchtenden Plankton.",
          en: "Yes. Our Sunset & Night Glow Combo leaves in the afternoon, shows you the sunset in front of the limestone cliffs and ends with a swim in the glowing plankton.",
        },
      },
    ],
    related: ["koh-poda-guide", "railay-phra-nang-cave", "krabi-with-kids", "boat-day-packing-list-etiquette"],
    tourIds: ["plankton-night", "sunset-glow-combo"],
    image: IMG.plankton,
    images: [
      {
        src: PLANKTON_IMG(1),
        fallback: IMG.plankton,
        alt: { de: "Sonnenuntergang vom privaten Speedboat vor den Kalkfelsen bei Krabi", en: "Sunset from the private speedboat in front of Krabi’s limestone cliffs" },
      },
      {
        src: PLANKTON_IMG(2),
        fallback: IMG.boat,
        alt: { de: "Privates Speedboat in einer dunklen Bucht bei Ao Nang am Abend", en: "Private speedboat in a dark bay near Ao Nang in the evening" },
      },
      {
        src: PLANKTON_IMG(3),
        fallback: IMG.lagoon,
        alt: { de: "Leuchtendes Plankton im Wasser bei Krabi in der Nacht", en: "Bioluminescent plankton glowing in the water near Krabi at night" },
      },
      {
        src: PLANKTON_IMG(4),
        fallback: IMG.snorkel,
        alt: { de: "Gäste schwimmen nachts vom Speedboat im leuchtenden Plankton", en: "Guests swimming from the speedboat among glowing plankton at night" },
      },
    ],
  },

  /* ───────────────────────── Fishing in Krabi ───────────────────────── */
  {
    slug: "krabi-fishing-guide",
    category: "insider",
    short: { de: "Angeln", en: "Fishing" },
    primaryKeyword: "Krabi fishing trip",
    keywords: ["Krabi fishing trip", "Angeln Krabi", "Krabi Angeltour", "deep sea fishing Krabi", "squid fishing Krabi", "catch and cook Krabi"],
    title: {
      de: "Angeln in Krabi: Fischarten, Saison, Catch & Cook",
      en: "Krabi Fishing Trip Guide: Species, Season, Cook",
    },
    metaDescription: {
      de: "Angeln in Krabi: Riff-, Trolling- und Tintenfischangeln, typische Fischarten, beste Saison, Regeln in Nationalparks und Catch & Cook – alles für Ihre Angeltour.",
      en: "Krabi fishing trip guide: reef, trolling and squid fishing, typical species, the best season, national park rules and catch & cook – all for your day out.",
    },
    h1: {
      de: "Angeln in Krabi – Fischarten, Saison und Catch & Cook",
      en: "Fishing in Krabi – species, seasons and catch & cook",
    },
    intro: {
      de: "Krabi ist vor allem für Inseln und Strände bekannt – dabei ist die Andamanensee auch ein spannendes Angelrevier. Ob entspanntes Riffangeln mit der Familie, Trolling auf Raubfische oder Tintenfischangeln unter Lampen bei Nacht: Ein Krabi Fishing Trip bietet für Einsteiger wie Erfahrene etwas. Hier erfahren Sie, welche Fische Sie erwarten können, wann die beste Zeit ist und welche Regeln gelten.",
      en: "Krabi is best known for its islands and beaches – yet the Andaman Sea is also an exciting fishing ground. Whether relaxed reef fishing with the family, trolling for predators or squid fishing under lamps at night: a Krabi fishing trip has something for beginners and experienced anglers alike. Here is which fish you can expect, when the best time is and which rules apply.",
    },
    sections: [
      {
        h2: { de: "Die Angelarten in Krabi", en: "Types of fishing in Krabi" },
        body: {
          de: [
            "Beim Riff- oder Grundangeln ankert das Boot an Felsen und Riffkanten außerhalb der Schutzgebiete. Mit Köder am Grund fangen Sie typische Rifffische. Diese Methode ist ideal für Einsteiger und Kinder, weil schnell etwas beißt.",
            "Beim Trolling zieht das Boot Kunstköder hinter sich her, um schnell schwimmende Raubfische wie Makrelen oder Barrakudas zu fangen. Das ist sportlicher und braucht mehr Strecke, oft im offeneren Wasser. Nachts wiederum lockt Licht Tintenfische an, die mit speziellen Ködern, sogenannten Jigs, gefangen werden.",
          ],
          en: [
            "For reef or bottom fishing, the boat anchors at rocks and reef edges outside protected areas. With bait on the bottom you catch typical reef fish. This method is ideal for beginners and children because something usually bites quickly.",
            "Trolling means the boat pulls lures behind it to catch fast-swimming predators such as mackerel or barracuda. It is sportier and needs more distance, often in more open water. At night, on the other hand, lights attract squid, which are caught with special lures called jigs.",
          ],
        },
      },
      {
        h2: { de: "Typische Fischarten", en: "Typical species" },
        body: {
          de: ["Welche Fische beißen, hängt von Methode, Ort und Saison ab. Häufig gefangen werden unter anderem:"],
          en: ["What bites depends on method, location and season. Commonly caught species include:"],
        },
        list: {
          de: [
            "Zackenbarsch (Grouper) und Schnapper – Klassiker beim Riffangeln",
            "Makrelen, darunter Königsmakrele – beim Trolling",
            "Barrakuda – kräftiger Räuber an Riffkanten",
            "Stachelmakrelen (Trevally) – starke Kämpfer",
            "Tintenfisch – nachts beim Lichtangeln",
          ],
          en: [
            "Grouper and snapper – reef-fishing classics",
            "Mackerel, including king mackerel – on the troll",
            "Barracuda – a powerful predator along reef edges",
            "Trevally – strong fighters",
            "Squid – at night under lights",
          ],
        },
        tip: {
          de: "Fangergebnisse lassen sich nie garantieren. Ein guter Guide wechselt die Spots, wenn es nicht beißt – das ist bei einem privaten Boot problemlos möglich.",
          en: "Catches can never be guaranteed. A good guide changes spots if nothing is biting – easy to do on a private boat.",
        },
      },
      {
        h2: { de: "Beste Saison zum Angeln", en: "Best season for fishing" },
        body: {
          de: [
            "Riff- und Tintenfischangeln ist in geschützten Gewässern das ganze Jahr über möglich. Für längere Fahrten aufs offene Meer zum Trolling ist die Trockenzeit von etwa November bis April mit ihrer ruhigen See am angenehmsten. In der Regenzeit können Wind und Wellen weite Fahrten einschränken.",
            "Auch die Tageszeit spielt eine Rolle: Früh morgens und am späten Nachmittag sind viele Fische aktiver. Tintenfische werden in dunklen Nächten oft besser gefangen als bei Vollmond.",
          ],
          en: [
            "Reef and squid fishing is possible year-round in sheltered waters. For longer runs out to sea for trolling, the dry season from roughly November to April with its calm seas is most comfortable. In the rainy season, wind and waves can limit long trips.",
            "Time of day matters too: many fish are more active early in the morning and late in the afternoon. Squid are often caught better on dark nights than at full moon.",
          ],
        },
      },
      {
        h2: { de: "Regeln: Angeln und Nationalparks", en: "Rules: fishing and national parks" },
        body: {
          de: [
            "Viele Gewässer rund um Krabi liegen in Meeresnationalparks, in denen Angeln grundsätzlich nicht erlaubt ist. Seriöse Anbieter fischen deshalb außerhalb der Parkgrenzen. Fragen Sie im Zweifel nach, wo genau geangelt wird.",
            "Wir setzen auf verantwortungsvolles Angeln: Untermaßige Fische und Arten, die nicht gegessen werden, kommen schonend zurück ins Wasser. Behalten wird nur, was wirklich auf den Grill kommt.",
          ],
          en: [
            "Many waters around Krabi lie within marine national parks where fishing is generally not allowed. Reputable operators therefore fish outside park boundaries. If in doubt, ask exactly where the fishing will take place.",
            "We believe in responsible fishing: undersized fish and species that won’t be eaten are released gently. We only keep what is actually going on the grill.",
          ],
        },
      },
      {
        h2: { de: "Catch & Cook: vom Haken auf den Grill", en: "Catch & cook: from hook to grill" },
        body: {
          de: [
            "Der schönste Abschluss eines Angeltages ist ein frisch gegrillter Fang. Bei einer Catch-&-Cook-Tour wird der Fisch an Bord oder an einem ruhigen Strand zubereitet – thailändisch gewürzt mit Knoblauch, Chili und Limette, dazu Reis und Gemüse. Frischer geht es nicht.",
            "Zum Sonnenuntergang an einem Strand zu essen, was man ein paar Stunden zuvor selbst gefangen hat, gehört zu den Erlebnissen, an die sich besonders Kinder lange erinnern.",
          ],
          en: [
            "The best way to end a fishing day is with a freshly grilled catch. On a catch & cook trip, the fish is prepared on board or on a quiet beach – Thai-style with garlic, chilli and lime, served with rice and vegetables. It doesn’t get fresher.",
            "Eating at sunset on a beach what you caught yourself a few hours earlier is one of those experiences children in particular remember for a long time.",
          ],
        },
        tip: {
          de: "Sagen Sie vorher Bescheid, wenn jemand Allergien hat oder keinen scharfen Geschmack mag – die Crew passt die Zubereitung gern an.",
          en: "Let the crew know in advance about allergies or if someone doesn’t like spicy food – they are happy to adapt the cooking.",
        },
      },
    ],
    faq: [
      {
        q: { de: "Brauche ich Angelerfahrung?", en: "Do I need fishing experience?" },
        a: {
          de: "Nein. Ausrüstung und Anleitung stellt die Crew. Riff- und Tintenfischangeln sind besonders einsteigerfreundlich.",
          en: "No. The crew provides gear and instruction. Reef and squid fishing are especially beginner-friendly.",
        },
      },
      {
        q: { de: "Darf man in Krabi überall angeln?", en: "Can you fish anywhere in Krabi?" },
        a: {
          de: "Nein. In Meeresnationalparks ist Angeln grundsätzlich verboten. Seriöse Anbieter fischen außerhalb der Schutzgebiete.",
          en: "No. Fishing is generally prohibited in marine national parks. Reputable operators fish outside protected areas.",
        },
      },
      {
        q: { de: "Was passiert mit dem Fang?", en: "What happens to the catch?" },
        a: {
          de: "Speisefische können bei einer Catch-&-Cook-Tour direkt zubereitet werden. Untermaßige Fische und nicht benötigte Arten werden zurückgesetzt.",
          en: "Edible fish can be cooked right away on a catch & cook trip. Undersized fish and species not needed are released.",
        },
      },
      {
        q: { de: "Ist Angeln für Kinder geeignet?", en: "Is fishing suitable for children?" },
        a: {
          de: "Ja, vor allem Riff- und Tintenfischangeln. Kurze Halbtagestouren passen meist am besten.",
          en: "Yes, especially reef and squid fishing. Short half-day trips usually work best.",
        },
      },
    ],
    related: ["krabi-with-kids", "best-time-to-visit-krabi", "boat-day-packing-list-etiquette", "krabi-bioluminescent-plankton-night-boat-tour"],
    tourIds: ["fishing-reef-half", "fishing-deep-sea", "fishing-night-squid", "fishing-catch-cook"],
    image: IMG.fishReef,
  },
];
