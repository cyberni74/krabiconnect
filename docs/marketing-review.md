# Marketing-Review: Krabi Secret Islands (`/secret-islands`, Buchungs-Wizard, `/krabi-guide`)

Stand: 04.10.2026 · Reviewer: Marketing (CRO / Offer / Brand / Performance)
Methode: Code-Review (`src/components/secret-islands/*`, `src/components/krabi-guide/*`), Playwright-Durchläufe auf dem Dev-Server mit 390×844 und 1366×860 (Honeymoon-Paar, Familie mit 2 Kindern, Angler, außerdem ein KO-Browser auf dem Guide), Wettbewerbsrecherche (GetYourGuide, Viator, TripAdvisor, FishingBooker, lokale Charter-Seiten).
Screenshots: `/tmp/claude-0/shots/mkt-*.png` (Remote-Bilder sind in der Sandbox blockiert, daher Verlaufs-Platzhalter).
Installierte Marketing-/SEO-Skills: keine. Grundlage sind Erfahrung und WebSearch.

---

## 0. Kurzfazit

Die Seite ist gut gebaut (starke USP-Story Longtail vs. Speedboat, Live-Preis, 1-Klick-Catering, Tour-Baukasten, 22 Guide-Artikel). Den Umsatz bremsen drei Dinge:

1. **Vertrauen steht auf Platzhaltern.** Rating 4.9, „1.200+ Touren“, „380+ Bewertungen / verifizierte Gäste“, TAT-Lizenz „34/01234“, „Marine Department geprüft“, „seit 2016“, CAAT/NBTC-Pilot, „10+ Jahre Kapitäne“, 4 erfundene Gästestimmen, Fake-WhatsApp-Nummer. Online-Werbung in Deutschland fällt unter das UWG, und erfundene Bewertungen sind seit 2022 ausdrücklich verboten. Das ist also auch rechtlich ein Risiko.
2. **Der Kalender erzeugt künstliche Knappheit.** „Wenige Plätze“ und „Ausgebucht“ werden per Zufalls-Hash erzeugt (`booking-data.ts → slotStatus`). Bei einem Privatboot ergibt „Plätze“ außerdem keinen Sinn.
3. **Das Upselling ist nicht kontextbewusst.** Es verkauft Leistungen doppelt (Catering oder Sekt zu Touren, die Dinner, Lunch oder Prosecco schon enthalten) und rechnet Kinderpositionen falsch. Das kostet Vertrauen genau in dem Moment, in dem der Gast den Gesamtpreis sieht.

Behebt man diese drei Punkte und ergänzt Preisanker pro Person und in Euro sowie eine Rückgewinnung über WhatsApp, dürfte das mehr bringen als jedes neue Feature.

---

## 1. Top 10 Quick Wins (je ≤ 1 Tag)

| # | Quick Win | Ort | Erwarteter Effekt |
|---|---|---|---|
| 1 | **Echte WhatsApp-Nummer eintragen.** Aktuell `66812345678` (TODO). Jeder WhatsApp-CTA landet bei einer fremden Nummer. | `content.ts → BRAND.whatsapp / whatsappDisplay` | Ohne diese Änderung kommen keine WhatsApp-Leads an (Hauptkanal). |
| 2 | **Platzhalter-Trust entfernen oder durch echte Daten ersetzen** (siehe Abschnitt 4). Bis echte Daten vorliegen, ehrliche Alternative verwenden: DE „Neu in Ao Nang – werden Sie einer unserer ersten Gäste“ / EN „New in Ao Nang – be one of our first guests“ und dazu ein echtes Gründer-Statement mit Foto. | `content.ts → UI.stats, UI.tat, UI.marine, UI.legalNote, UI.footerTagline, UI.droneFeatures[0], REVIEWS, FAQ (Sicherheit, Drohne)`, `sections-top.tsx:270`, `sections-bottom.tsx:274–298, 738–739` | Senkt das Rechtsrisiko (UWG, OTA-Richtlinien). Glaubwürdigkeit ist im Luxussegment wichtiger als eine Sternezahl. |
| 3 | **Künstliche Knappheit im Kalender abschalten.** „Wenige Plätze“ entfernen und „Ausgebucht“ nur aus echten Daten anzeigen. Bis dahin alle zukünftigen Tage als „Anfrage möglich“ zeigen. Text: DE „Wir bestätigen Ihren Wunschtermin persönlich – meist in unter 30 Minuten.“ / EN „We confirm your date personally – usually within 30 minutes.“ | `booking-data.ts → slotStatus/dayStatus`, `booking-steps.tsx:534–568, 613–616` | Mehr Ehrlichkeit, keine Gäste, die durch zufälliges „Ausgebucht“ abspringen. Hinweis: Diese Zufallsdaten blockieren auch echte freie Tage, das kostet direkt Anfragen. |
| 4 | **Preisanker pro Person und in Euro.** Unter jedem Bootspreis: DE „฿18.500 pro Boot · ab ฿3.700 p. P. bei 5 Gästen (≈ €…)“ / EN „฿18,500 per boat · from ฿3,700 p.p. with 5 guests (≈ €…)“. Für DE `formatTHB` auf de-DE-Format umstellen (18.500 statt 18,500). | Tour-Karten `sections-mid.tsx`, Wizard-Kacheln `booking-steps.tsx:194`, Live-Preis `booking.tsx:417–459`, `store.ts → formatTHB` | Wichtigster Hebel gegen den Preisschock. Wettbewerber auf GYG werben mit Preisen pro Person. |
| 5 | **Upsell-Dopplungen beseitigen.** Für Touren mit Dinner, Lunch oder Prosecco den 1-Klick-Catering- bzw. Sekt-Vorschlag ausblenden oder ersetzen (z. B. „Upgrade auf Moët“). Betroffen: Sunset Romance (Champagner + 3-Gänge-Dinner inkl.), 4-Islands Sunset und Sunset-&-Glow-Kombi (Prosecco inkl.), Koh Rok und Deep Sea (Thai-Lunch inkl.), Catch & Cook (BBQ inkl.). | `booking-model.tsx → quickAdds()`, `recommendation()`; Feld `includesMeal/includesBubbly` in `content.ts → Tour` | Verhindert, dass der Gast im Wizard „über den Tisch gezogen“ wirkt (getestet: Honeymoon-Paar bekam Catering + Sekt zu einer Tour, die Dinner + Champagner schon enthält). |
| 6 | **Kinderpreise korrekt berechnen.** Das Kindermenü wird × alle Gäste berechnet (Test: 4 × ฿300 bei 2 Kindern), Catering für Kinder zum Erwachsenenpreis. Neue Abrechnungsart `per: "kid"` einführen und optional ein Kinder-Catering (Vorschlag ฿300). | `booking-data.ts → AddOn.per, addOnTotal`, `booking-model.tsx → priceBreakdown, buildMessage` | Familien rechnen nach. Ein falscher Betrag in der WhatsApp-Nachricht kostet Vertrauen. |
| 7 | **Abfahrtszeiten vereinheitlichen.** Die Tour nennt „ab 15:30“ (Sunset Romance) bzw. „ab 07:00“ (Deep Sea, Phi Phi), der Kalender zeigt aber Slot 14:30 bzw. 08:00. Uhrzeiten pro Tour führen. | `content.ts → SLOTS` und `Tour.duration`, `booking-steps.tsx` Slot-Auswahl | Weniger Rückfragen, professionellerer Eindruck. |
| 8 | **Persona-Extras.** Bei „Familie“ Kindermenü, SUP und Unterwasser-Fotograf empfehlen; bei Paaren Romantik-Deko und Drohne („Ihr Antrag aus der Luft“). Bei Angeltouren Romantik-Deko ausblenden und Angler-Extras zeigen: Kühlbox für den Fang, „Fang im Restaurant zubereiten lassen“, Jigging-/Popping-Upgrade. Die Quick-Add-Leiste ergänzt um „Familien-Snackbox“. | `booking-data.ts → BOOKING_EXTRAS.recommendFor` erweitern, `booking-model.tsx → quickAdds`, `booking-steps.tsx` Extras-Schritt | Vermutlich deutlich höherer Bestellwert. Relevante Extras werden spürbar häufiger gewählt. |
| 9 | **Hero schärfen.** Headline mit Nutzen statt Markenname, Preisanker im sichtbaren Bereich und Mobile-LCP beheben (Hero war mobil nach 2,5 s noch leer, Reveal-Animation). DE „Ihr eigenes Speedboat. Ihre Inseln. Ohne Menschenmassen.“ Sub „Max. 5 Gäste · leise · Schatten & Polster · ab ฿11.500 pro Boot inkl. Hotel-Transfer“. EN „Your own speedboat. Your islands. No crowds.“ / „Max. 5 guests · quiet · shade & cushions · from ฿11,500 per boat incl. hotel transfer“. | `content.ts → UI.heroTitleA/B, heroSub`, `sections-top.tsx` Hero (Text ohne Opacity-0-Startzustand rendern) | Mehr Klicks auf den ersten CTA, bessere Core Web Vitals. |
| 10 | **Abschlussbildschirm und Rückgewinnung.** Heute heißt es „Anfrage vorbereitet – bitte senden Sie die Nachricht ab“. Sendet der Gast nicht, ist der Lead verloren. Stattdessen: (a) „Was passiert jetzt?“ in 3 Schritten, (b) großer Button „Nachricht noch nicht gesendet? Jetzt in WhatsApp öffnen“, (c) Entwurf in `localStorage` speichern + „Ihre Tour wartet noch“-Banner beim nächsten Besuch, (d) doppelte Anlass-Frage in Schritt 5 streichen (wird schon in Schritt 3 gefragt). | `booking.tsx:505–525`, `booking-steps.tsx:738 und 896`, `store.ts` | Spürbar weniger Abbrüche zwischen Wizard und WhatsApp. |

Copy für den Abschlussbildschirm:
- DE: „Fast geschafft! 1) Tippen Sie in WhatsApp auf *Senden*. 2) Wir prüfen Wetter, Gezeiten & Boot und bestätigen persönlich. 3) Erst dann zahlen Sie 30 % an – vorher ist alles unverbindlich.“
- EN: „Almost done! 1) Tap *Send* in WhatsApp. 2) We check weather, tides & boat and confirm personally. 3) Only then you pay a 30% deposit – nothing is binding before that.“

---

## 2. Angebot & Preise

### 2.1 Markt-Benchmark (Recherche Okt. 2026)

| Segment | Markt | Krabi Secret Islands | Bewertung |
|---|---|---|---|
| Gruppen-Tour 4 Islands / Hong | 900–1.300 ฿ p. P. | – | Anker für „Massentour“. |
| Privates Longtail 4 Islands (GYG) | ab ca. $143–435 pro Gruppe | – | Viele 4,2–4,8-Sterne-Listings, wenige Bewertungen pro Listing. |
| Privates Speedboat 4 Islands | ab ca. ฿10.995; Ganztag mit Sunset ca. ฿16.500 | 4-Islands VIP & Sunset ฿18.500 (6 h) | +10–70 %. Begründet durch max. 5 Gäste, Timing gegen die Masse, Prosecco und Transfer inklusive, aber das muss man **sehen**. |
| Privates Speedboat Hong | ab ca. ฿12.995; Ganztag ca. ฿18.500 | ฿21.500 (7 h, Parkgebühren + SUP inkl.) | Fair, wenn „Parkgebühren inkl.“ prominent steht. |
| Privates Speedboat Phi Phi | ab ca. ฿12.995 (1 Motor), ca. ฿17.500 für 4 Pers. (Luxus) | ฿28.500 | Deutlich teurer. Braucht starke Belege: Ankunft an der Maya Bay vor den Fähren, 2 Motoren, Parkgebühren (ca. 400 ฿ p. P.) inklusive. |
| Privater Angel-Charter Ao Nang | ฿7.500 (4 Angler, einfach) bis ฿22–25.000 (Offshore, 29 ft) | ฿13.500 halbtags / ฿29.500 Big Game | Oberes Ende. Angler kaufen nach Daten: Bootsspezifikation, Tackle-Liste, Saison pro Fischart, echte Fangfotos. |
| Plankton (Gruppe, GYG/Viator) | ca. $49–59 p. P., oft per Kajak oder SUP | Night Glow privat ฿14.500 | Häufiger Bewertungstenor bei Wettbewerbern: „Das Plankton sah nicht aus wie auf den Bildern.“ Das ist unsere Chance für ehrliche Erwartungssteuerung. |

Positionierung: nicht über den Preis konkurrieren, sondern über **Zeit, Ruhe und Kontrolle**. Kernaussage DE „Sie zahlen nicht für mehr Inseln – Sie zahlen für leere Inseln.“ / EN „You don’t pay for more islands – you pay for empty ones.“

### 2.2 Pakete und Bundles (Preise sind Vorschläge, die Entscheidung liegt beim Inhaber)

Bundles als **vorausgewählte Wizard-Konfiguration** umsetzen (Tour + Add-ons), nicht als neue Datenstruktur. Ein Klick lädt den Entwurf, und der Gast kann danach alles abwählen.

| Paket | Inhalt | Summe einzeln | Vorschlag Paketpreis |
|---|---|---|---|
| **Honeymoon „Nur wir zwei“** / „Just the Two of Us“ | Sunset & Night Glow Kombi + Sekt für Verliebte + Romantik-Deko + 4K-Drohne | ฿28.700 | ฿26.900 (bei Antrag zusätzlich: Ring-Übergabe durch den Kapitän, Kartenschild am Strand) |
| **Familie „Kleine Entdecker“** / „Little Explorers“ | Family Fun Day + Catering für 2 Erwachsene + 2 Kinder-Catering + SUP & Kajak + Unterwasser-Fotograf | ca. ฿21.800 | ฿19.900 |
| **Angler „Big Game Day“** | Deep Sea & Trolling + Bier-Kühlbox + Fang wird im Partner-Restaurant zubereitet | ฿30.700 + Restaurant | ฿31.500 inkl. Abendessen mit dem eigenen Fang |
| **„Best of Krabi in 2 Tagen“** | Hong Lagoons (Tag 1) + Sunset & Glow (Tag 2) | ฿41.000 | ฿38.500, zweiter Tag mit Umbuchungsgarantie |

Copy-Beispiel Honeymoon-Karte:
- DE: „Ihr erster Sonnenuntergang als Ehepaar – nur Sie zwei, Sekt, Blumen und danach Schwimmen im leuchtenden Meer. Die Drohne filmt, Sie genießen.“
- EN: „Your first sunset as newlyweds – just the two of you, bubbles, flowers, then a swim in the glowing sea. The drone films, you enjoy.“

### 2.3 Anchoring und Preisarchitektur

- **Gut/Besser/Am besten pro Tour** auf der Tour-Detailseite: „Pur“ (Boot) / „Komfort“ (+ Catering ฿500 p. P.) / „Signature“ (+ Catering + Getränke + Drohne). Die mittlere Option als „Unsere Empfehlung“ kennzeichnen. „Beliebteste“ nur verwenden, wenn die Daten das belegen.
- **Champagner ฿6.500 als Anker direkt neben Sekt ฿2.200** funktioniert bereits (Schritt 3). Reihenfolge so beibehalten.
- **Gruppenvergleich als ehrlicher Anker:** „Gruppentour: ca. 1.000–1.300 ฿ p. P. + 30–40 Fremde. Privat bei 5 Gästen: ab ฿2.300 p. P. – das ganze Boot für Sie.“ (Railay Half-Day ฿11.500 / 5)
- **Für Paare**, die das ganze Boot für 2 Personen zahlen: kein Preisnachlass nötig, aber Framing wie „Privatsphäre für zwei – das Boot gehört Ihnen“. Eventuell ein „Duo-Sunset“ mit 3 h für ca. ฿9.900 als Einstiegsprodukt.
- **„Bestseller“-Badges** (Tour + Drohne) nur mit echten Buchungsdaten. Bis dahin: „Unser Tipp“ / „Our pick“.

### 2.4 Add-on-Strategie

- Das 1-Klick-Catering (฿500 p. P., 2 Mahlzeiten + Wasser/Cola/Cola Zero) ist stark. Den Text gegen „Immer inklusive: Wasser, Softdrinks & Obst“ abgrenzen, sonst wirkt es doppelt. Vorschlag: DE „Rundum versorgt: 2 frisch gekochte Mahlzeiten + unbegrenzt kalte Getränke“ / EN „Fully fed: 2 freshly cooked meals + unlimited cold drinks“. Dazu klar: „Ohne Catering: Wasser, Softdrinks & Obst sind trotzdem inklusive.“
- **Sekt** für Paare/Honeymoon automatisch *empfehlen* (bereits umgesetzt, nie automatisch vorauswählen, das ist gut so). Bei Sunset-Touren mit Prosecco stattdessen das Upgrade auf Champagner vorschlagen.
- **Bier** für Angler (umgesetzt). Ergänzen: „Bier & Eis für den Fang“ als Kombi.
- **Drohne** (฿4.500): Beispiel-Reel direkt in der Add-on-Karte (Thumbnail + Play). Das ist der höchstmargige Impuls.
- **Night Glow:** niemals Kajak anbieten (eingehalten). Die Add-on-Liste zeigt jedoch generisch „SUP & Kajak“, das bei Night Glow ausblenden.

### 2.5 Anzahlung und Stornierung (muss vom Inhaber festgelegt werden)

Aktuell nur eine Zeile: „30 % Anzahlung nach Bestätigung · kostenlose Umbuchung bei Schlechtwetter“. Auf GYG/Viator ist „kostenlos stornierbar bis 24 h“ Standard. Eine klare, kurze Policy direkt im Wizard ist Pflicht:

- DE: „Unverbindlich anfragen. Nach unserer Bestätigung sichern 30 % Anzahlung Ihren Termin. Kostenlos stornierbar bis [72] Std. vorher. Bei Sturmwarnung: kostenlose Umbuchung oder 100 % Erstattung – Sie entscheiden.“
- EN: „Request with no obligation. After we confirm, a 30% deposit secures your date. Free cancellation up to [72] hrs before. Storm warning: free rebooking or 100% refund – your choice.“

Dieser Block gehört in Schritt 5 (über die Senden-Buttons), in die FAQ und unter den Live-Preis.

---

## 3. Booking-Funnel-CRO

### 3.1 Reibung pro Schritt (getestet als Paar, Familie und Angler)

| Schritt | Beobachtung | Empfehlung |
|---|---|---|
| **Einstieg** | Drei Einstiege (Verfügbarkeit prüfen / Eigene Tour / Tour buchen) sind gut. Mobil ist der Hero ca. 3 s leer. | Hero ohne Startanimation rendern. Primärer CTA: DE „Wunschtermin prüfen“ / EN „Check my date“. |
| **1 · Tour** | 15 Touren in einer langen Liste, mobil viel Scrollen. Filter vorhanden, aber nicht persona-basiert. Preise im en-US-Format. Keine Preise pro Person. | Vorschalt-Frage „Wer kommt mit?“ (Paar · Familie · Freunde · Angler) setzt Filter und Anlass in einem Klick. Danach 3 Empfehlungen oben und „Alle Touren“ darunter. Pro Karte: Dauer, Highlights in 3 Wörtern, Preis pro Person. |
| **2 · Datum** | Zufällige Verfügbarkeiten (siehe Quick Win 3). Slot-Zeit weicht von der Tour-Zeit ab. Kein Hinweis auf Gezeiten oder Mondphase, obwohl das ein Kern-USP ist. | Mondphasen-Icon im Kalender für Night Glow („Neumond = stärkstes Leuchten“), Ebbe-Hinweis für die Tup-Sandbank. Das ist ehrlich, nützlich und einzigartig. |
| **3 · Gäste & Verpflegung** | Sehr lang (Gäste, Kinder, Anlass, 8 Speisen, 5 Getränke). Anlass erscheint hier und in Schritt 5 noch einmal. Kinder werden falsch berechnet. | Anlass nach Schritt 1 verschieben (siehe oben). Catering als einzelne große Karte, „Premium-Upgrades“ einklappbar. Kinderpreise korrigieren. |
| **4 · Extras** | Für alle Personas gleich, Romantik-Deko auch beim Angler. „Bestseller“ ohne Datengrundlage. | Persona-Sortierung (Quick Win 8). Drohnen-Karte mit Beispiel-Reel. |
| **5 · Kontakt** | Gut: Name + E-Mail **oder** Telefon, „kein Callcenter“. Es fehlen eine Stornierungs-Policy, „Antwort in Ihrer Sprache“, Vorwahl-Auswahl und die bevorzugte Antwortkanal-Wahl. | Ergänzen. Text: DE „Wir antworten auf Deutsch, Englisch, 中文, 한국어 oder 日本語.“ / EN „We reply in English, German, Chinese, Korean or Japanese.“ (nur wenn das Team das wirklich leisten kann, sonst „Übersetzt mit Unterstützung“) |
| **Abschluss** | Der Lead liegt nur im WhatsApp- oder Mail-Entwurf des Gastes. Sendet er nicht, ist alles verloren. Auf dem Desktop ohne WhatsApp-App landet man auf einer Fehlerseite (Test: `chrome-error`). | Siehe Quick Win 10. Mittelfristig zusätzlich serverseitig benachrichtigen, z. B. per Mail an den Betreiber über einen API-Dienst. Wichtig: Laut Projektregeln keine personenbezogenen Daten in einer DB ohne Auth speichern. Für den Desktop „WhatsApp Web“ oder einen QR-Code anbieten. |

### 3.2 Fehlende Rückversicherung (an den passenden Stellen einblenden)

- Unter dem Live-Preis: „Kein Risiko: erst nach unserer persönlichen Bestätigung zahlen Sie an.“
- Im Datumsschritt: „Wetter-Garantie: Bei Sturmwarnung kostenlos umbuchen oder volle Erstattung.“
- Bei Kindern: „Kinder-Rettungswesten in allen Größen, Schatten, flacher Einstieg.“ (vorhanden, aber klein)
- Bei Night Glow: „Ehrlich gesagt: Plankton ist Natur. Wir planen nach Mondphase und Wetter und sagen Ihnen vorher offen, wie die Chancen stehen.“ / EN „Honestly: plankton is nature. We plan around moon phase and weather and tell you upfront how the odds look.“
- Echtes Gesicht: Foto und Name von Kapitän bzw. Inhaber im Wizard-Header oder Abschlussbildschirm („Ihre Anfrage geht direkt an [Name]“).

### 3.3 Abbruch-Rückgewinnung (WhatsApp)

1. **Entwurf speichern** (`localStorage`) und beim nächsten Besuch anzeigen: DE „Ihre Sunset-Tour am 12.11. ist noch offen – weitermachen?“ / EN „Your sunset trip on 12 Nov is still open – continue?“
2. **Exit-Intent** (Desktop) bzw. Zurück-Geste (Mobile) ab Schritt 2: „Fragen? Schreiben Sie uns kurz per WhatsApp – wir planen mit Ihnen.“ (kein Pop-up-Spam, einmal pro Sitzung)
3. **Antwort-SLA einhalten**, sonst die Aussage „< 30 Min.“ entfernen. WhatsApp-Business-Schnellantworten in 5 Sprachen vorbereiten.
4. **Follow-up nach 24 h** bei unbestätigten Anfragen (manuell über WhatsApp Business, Label „offen“): „Sollen wir den Termin für Sie noch 24 h reservieren?“ Ehrlich formulieren, keine Fake-Deadline.

### 3.4 Mobile UX

- Die sticky Bottom-Bar (WhatsApp / Tour buchen) und die Wizard-Fußleiste sind gut und daumenfreundlich.
- Die Quick-Add-Leiste im Wizard wird horizontal abgeschnitten („Sekt…“). Als zwei Zeilen darstellen oder mit sichtbarem Scroll-Hinweis versehen.
- Die Seite ist sehr lang (ca. 21.000 px mobil). Nach den Touren einen „Zwischen-CTA“ mit Preis setzen, Galerie und Guide-Teaser kürzen.

---

## 4. Trust & Social Proof

### 4.1 Platzhalter, die ersetzt oder entfernt werden müssen (niemals erfinden)

| Platzhalter | Ort | Aktion |
|---|---|---|
| Ø 4.9, „1.200+ Private Touren“ | `content.ts → UI.stats`, `sections-top.tsx:270` | Entfernen, bis echte Zahlen vorliegen. Ersatz: „Max. 5 Gäste“, „Hotel-Transfer inklusive“, „Antwort persönlich“. |
| „380+ Bewertungen“, „verifizierte Gäste“, 4,9-Zähler | `sections-bottom.tsx:274–298` | Entfernen. Später echte Google-/TripAdvisor-Daten per Widget oder Link. |
| 4 Gästestimmen (Julia & Markus, Familie Hoffmann, Sophie L., Daniel & Chris) | `content.ts → REVIEWS` | **Erfunden, sofort entfernen.** Ersatz: „Was Sie erwartet“ (Ablauf eines Tages) oder Gründer-Zitat, bis echte Stimmen mit Einwilligung vorliegen. |
| TAT-Lizenz „34/01234“, „Marine Department geprüft/zugelassen“ | `content.ts → UI.tat, UI.marine, UI.legalNote, FAQ`, `sections-bottom.tsx:738–739` | Nur mit echter Nummer bzw. echtem Nachweis anzeigen, Nummer verlinken oder als Foto. |
| „seit 2016“ | `UI.footerTagline` | Nur wenn wahr. |
| „Lizenzierter Pilot (CAAT/NBTC)“, „versichert“ | `UI.droneFeatures`, FAQ, Artikel `drone-thailand` | Nur mit echter Registrierung. |
| „Kapitäne mit 10+ Jahren Erfahrung“, „zwei Motoren“, „4-Takt-Motoren“, GPS, Funk | FAQ, `COMPARISON` | Gegen die echte Ausstattung prüfen. |
| „Antwort < 30 Min.“ | mehrfach | Nur wenn operativ gesichert, sonst „meist am selben Tag“. |
| „Bestseller“, „Beliebt“ | Touren, Add-ons | Durch „Unser Tipp“ ersetzen, bis Daten vorliegen. |
| Turtles im Titel „Family Fun Day – Sandbänke & Schildkröten“ | `content.ts` | Schildkröten sind an Tup/Chicken/Poda nicht garantiert. Zu „Sandbänke & Schnorcheln“ ändern oder als „mit Glück“ kennzeichnen. |
| AI-Bild „unser Boot“ (Romance) | `ROMANCE_IMGS` | Das Boot ist aus einer Textbeschreibung generiert. Nur als Stimmungsbild mit dem Vermerk „Illustration“ einsetzen, bis echte Fotos vorliegen (sonst irreführend). |
| Impressum/Datenschutz-Links | Footer | Mit echten Seiten befüllen. Deutsche Gäste erwarten das. |

### 4.2 Was fehlt (echte Belege)

1. **Echtes Bootsfoto und Specs-Box:** Länge, Motoren, Schatten, Polster, Toilette ja/nein, Leiter, Kühlbox. Das ist der stärkste USP-Beleg gegenüber Longtails.
2. **Gesicht und Geschichte:** Inhaber bzw. Kapitän mit Foto, 3 Sätze „Warum wir max. 5 Gäste mitnehmen“.
3. **Sicherheits-Checkliste mit Fotos:** Westen (inkl. Kindergrößen), Erste Hilfe, Funk, echte Lizenzen.
4. **Google Business Profile + TripAdvisor:** Bewertungen erst sammeln, dann einbinden (siehe Abschnitt 6).
5. **Unbearbeitete Night-Glow-Aufnahmen** mit Hinweis „echtes Handy-Video, nicht bearbeitet“. Das ist der direkte Gegenentwurf zu Wettbewerber-Bewertungen wie „nothing like the pictures“.
6. **Zahlungsarten-Logos** (Karte, Überweisung, bar) und die Stornierungs-Policy (siehe 2.5).
7. **Schema.org:** `TouristTrip`/`Product` mit `Offer` (Preis) ja, `AggregateRating` erst mit echten Bewertungen. Laut `docs/brand-assets.md` existieren zwei FAQPage-Markups auf einer Seite. Das konsolidieren.

---

## 5. Content & SEO

### 5.1 Technische Basis (wichtigster SEO-Punkt)

- **Sprachen sind nur clientseitig umschaltbar.** `<title>` und Meta-Description sind auf allen Seiten deutsch (z. B. `krabi-guide.$slug.tsx:19–20`). Ein koreanischer Browser bekam einen **englischen** Guide mit einzelnen koreanischen UI-Fetzen („5 분 소요“) und einen deutschen Titel. Google indexiert damit nur DE.
- Empfehlung: Sprach-URLs (`/de/…`, `/en/…`, `/zh/…`, `/ko/…`, `/ja/…`) bzw. ein `?lang`-Parameter mit SSR, dazu `hreflang` + `x-default`, übersetzte Titel und Descriptions. Der Guide ist nur DE/EN. Zuerst die 5 umsatzstärksten Artikel nach ZH, KO und JA übersetzen (Plankton, 4-Islands-Timing, Hong, Phi Phi früh, mit Kindern). Übersetzungen von Muttersprachlern prüfen lassen.

### 5.2 Neue Seiten und Artikel (nach kommerziellem Wert)

| Seite | Primär-Keyword DE / EN | Zweck |
|---|---|---|
| **Longtail vs. Speedboat Krabi** (eigene Landingpage aus `LongtailFaq`) | „Longtail oder Speedboat Krabi“ / „longtail vs speedboat Krabi“ | Vergleichsintention mit hoher Kaufnähe, Bild Longtail-Crowd vs. Romance |
| **Private vs. Gruppen-Tour: Was kostet was?** | „Krabi private Bootstour Preis“ / „Krabi private boat tour price“ | Ehrliche Preistabelle (Gruppe vs. privat Longtail vs. privat Speedboat), Preisanker |
| **Krabi Flitterwochen / Honeymoon** | „Krabi Flitterwochen“ / „Krabi honeymoon“ | Landingpage für das Honeymoon-Paket, Pinterest-tauglich |
| **Heiratsantrag auf dem Boot** | „Heiratsantrag Thailand Boot“ / „proposal boat Krabi“ | Nische mit hohem Bestellwert |
| **Plankton-Mondkalender 2026/27** | „leuchtendes Plankton Krabi wann“ / „Krabi plankton best time“ | Evergreen und verlinkbar, mit Mondphasen pro Monat und ehrlichen Chancen |
| **Krabi in der Regenzeit: Welche Touren fahren?** | „Krabi Regenzeit Bootstour“ / „Krabi monsoon boat trip“ | Monsun-Nachfrage abholen (siehe 6.7) |
| **Angeln in Krabi: Fischarten nach Monat** | „Angeln Krabi Saison“ / „Krabi fishing season“ | Datenhungrige Angler, Link zu FishingBooker-Listing |
| **Phi Phi ab Krabi vs. ab Phuket** | „Phi Phi ab Krabi“ / „Phi Phi from Krabi or Phuket“ | Hohes Volumen, Early-Bird-USP |
| **Hotel-Pickup-Karte Ao Nang/Railay/Klong Muang** | „Ao Nang Hotel Bootstour Abholung“ | Lokale Suche, Concierge-Partner |
| **Ruhige Strände Krabi ohne Touristen** | „Krabi ohne Touristen“ | stützt den USP |

### 5.3 Zielgruppen- und Sprach-Landingpages

- **DE:** Honeymoon, Familie, „Krabi mit Kindern Bootstour“. Deutsche buchen früh (3–6 Monate), Pinterest und Reiseblogs sind relevant.
- **EN:** Couples, Proposal, Fishing, „private speedboat Krabi“.
- **ZH:** Xiaohongshu-tauglich (Fotospots, Drohne, „包船“ privates Boot). Keine Klischees, Fokus auf Fotografie und Privatsphäre.
- **KO:** Honeymoon-Markt (Krabi ist ein klassisches Flitterwochenziel), Naver-Blog-SEO, MyRealTrip/Klook-Listings.
- **JA:** Sicherheit, Sauberkeit, Detailinfos (Ablauf, Zeiten, Toilette an Bord?), Klook/Veltra.
- Grundsatz für alle Sprachen: keine nationalen oder ethnischen Stereotype in Bildern und Texten. Die „Masse“ ist anonym und divers, der Kontrast liegt allein im Erlebnis.

### 5.4 Guide-Optimierung

- Der Artikel-CTA öffnet die passende Tour, das ist gut. Ergänzen um einen **Inline-CTA nach dem ersten Drittel** mit Preis und Persona-Text sowie eine sticky Mobile-Leiste im Artikel („Diese Tour privat: ab ฿14.500 pro Boot“).
- In jedem Insel-Artikel eine Box „Wann ist es hier leer?“ mit Uhrzeiten. Das ist USP-Content, der direkt zur Buchung führt.

---

## 6. Kanäle & Wachstum

### 6.1 Google Business Profile (Priorität 1)
- Kategorie „Bootstouranbieter“ / „Boat tour agency“, Pin in Ao Nang, Öffnungszeiten, WhatsApp-Chat aktivieren.
- **Produkte** mit Preisen (jede Tour), 20+ echte Fotos (Boot, Crew, Schatten, Catering), wöchentliche Posts (Mondphasen-Tipp, Ebbe-Termine).
- Q&A selbst mit echten FAQ befüllen (Kinder, Wetter, Stornierung).

### 6.2 Bewertungs-Flywheel (ohne Anreize, Google-Richtlinien einhalten)
1. Peak-End-Moment: Die Drohnen-Reel-Übergabe am Abend ist der Moment für die Bitte. WhatsApp: DE „Ihr Film ist da! Wenn Ihnen der Tag gefallen hat, hilft uns eine ehrliche Google-Bewertung sehr: [Link]“ / EN „Your film is ready! If you enjoyed the day, an honest Google review helps us a lot: [link]“.
2. QR-Karte an Bord, kein Rabatt gegen Bewertung (das ist verboten).
3. Auf negative Bewertungen innerhalb von 24 h sachlich antworten.
4. Erst ab ca. 15–20 echten Bewertungen Sterne auf der Website zeigen, mit Quelle und Link.

### 6.3 OTAs als Akquise-, nicht als Margenkanal
- Auf GetYourGuide, Viator, Klook (KO/ZH/JA), Trip.com und FishingBooker (Angeln) mit 2–3 Touren präsent sein. Viele private Listings dort haben wenige Bewertungen, mit Qualität ist das Ranking erreichbar.
- Direktbuchungs-Vorteil statt Preisunterbietung (Paritätsklauseln beachten): z. B. „Direkt gebucht: kostenlose Umbuchung bis 24 h + persönlicher Routenplan nach Gezeiten“.

### 6.4 Instagram / TikTok / Xiaohongshu
- Content-Säulen: (1) „Leere Insel um 16 Uhr“ (Timing-USP), (2) Drohnen-Reels von Gästen (nur mit schriftlicher Einwilligung), (3) Night Glow ungefiltert, (4) Kapitän-POV „Warum wir nur 5 Gäste mitnehmen“, (5) Catering-Zubereitung, (6) Angel-Fänge (Catch & Release zeigen).
- Jede Drohnen-Lieferung mit dezentem Logo-Endcard: Die Gäste posten, und das ist Gratis-Reichweite.
- Hook-Ideen: DE „Gleiche Insel, 3 Stunden später.“ / EN „Same island. 3 hours later.“ Dazu ein Split-Screen voller Strand vs. leerer Strand mit echtem eigenem Material.

### 6.5 Hotel-, Villa- und Concierge-Partnerschaften
- Zielliste: Boutique- und Luxushotels sowie Villen in Ao Nang, Railay, Klong Muang und Tubkaek. Dazu Hochzeits- und Honeymoon-Planer, Fotografen.
- Angebot: 10–15 % Provision, QR-Aufsteller mit Tracking-Code (`?ref=hotelname`), Concierge-Testfahrt. Ein einseitiges Partnerblatt in EN/TH.
- Reiseveranstalter und Reisebüros in DACH, KR und JP für Honeymoon-Pakete (B2B-Netto-Preisliste).

### 6.6 Empfehlungsprogramm und Nachfass-Sequenz
- Empfehlung: „Empfehlen Sie uns: Ihre Freunde bekommen Catering für 2 gratis, Sie bekommen ฿1.000 Gutschrift für den nächsten Trip.“ Code im WhatsApp-Text.
- WhatsApp- und E-Mail-Sequenz: T-48 h Packliste + Treffpunkt + Wetter, T-0 „Kapitän [Name] holt Sie um 07:30 ab“, T+0 abends Reel + Bewertungsbitte, T+30 Tage „Ihr Film einen Monat später“ + Empfehlungscode, T+11 Monate Jahrestags-Angebot für Paare.

### 6.7 Saisonalität (Monsun Mai–Oktober)
- Ehrlich kommunizieren: Westküste rauer, einzelne Nationalparkgebiete saisonal gesperrt (Koh Rok ist in der Regel Mitte Mai bis Mitte Oktober geschlossen). **Die Koh-Rok-Tour als saisonal kennzeichnen** und in der Nebensaison nicht buchbar anbieten.
- Monsun-Produkte: geschützte Phang-Nga-Bucht (Koh Roi, Kudu, James Bond), Night Glow, Riff- und Nacht-Tintenfischangeln, kurze Halbtags-Fenster zwischen Schauern.
- „Regen-Versprechen“: kostenlose Umbuchung + Wetter-Check am Vorabend per WhatsApp.
- Green-Season-Tarif (z. B. −10–15 % unter der Woche) statt Fake-Knappheit.
- Asiatische Feiertagsfenster für die Kampagnenplanung: Golden Week (JP, Ende April/Mai), Chuseok (KR, Sep/Okt), Nationalfeiertag (CN, 1.–7. Okt.). In diesen Wochen ZH/KO/JA-Ads und Klook-Promotions schalten.

---

## 7. Messung

### 7.1 Events (GA4 oder Plausible, mit Consent-Banner für EU-Besucher)

| Event | Parameter |
|---|---|
| `booking_open` | Quelle (hero / tour_card / bottom_bar / guide_article / final_cta), `tour_id` |
| `booking_step_view` | `step` (1–5), `mode` (preset/custom) |
| `booking_tour_select` | `tour_id`, Preis, Kategorie |
| `booking_date_select` | Tage bis zum Termin, Slot |
| `booking_guests` | Gäste, Kinder, Anlass |
| `addon_toggle` | `addon_id`, an/aus, Quelle (quick_bar / list), `recommended` true/false |
| `booking_submit` | Kanal (whatsapp/email), Gesamtpreis, Anzahl Add-ons |
| `whatsapp_click` | Ort (header / bottom_bar / faq / wizard / guide) |
| `guide_cta_click` | Slug, `tour_id` |
| `lang_switch` | von, nach |
| `booking_abandon` | letzter Schritt (über `visibilitychange` bzw. das Schließen-Event) |

**Attribution:** einen Referenzcode in den vorbefüllten WhatsApp-Text schreiben (z. B. „Ref: IG-REEL12 / GBP / HOTEL-XY“). Nur so lässt sich messen, welcher Kanal echte Buchungen bringt. In WhatsApp Business ein Label „bestätigt“ setzen und den Umsatz pro Ref-Code wöchentlich in einer Tabelle erfassen.

### 7.2 A/B-Tests (Reihenfolge nach erwartetem Hebel)
1. Preis pro Boot vs. Preis pro Boot + pro Person (Tour-Karten).
2. Hero-Headline mit Markenname vs. Nutzen-Headline („Ihr eigenes Speedboat …“).
3. Wizard mit vorgeschalteter Persona-Frage vs. ohne.
4. Catering-Quick-Add: Toggle-Leiste vs. große Karte mit Foto.
5. Honeymoon-Bundle als erste Karte bei Anlass „Hochzeitsreise“ vs. Einzel-Add-ons.
6. CTA-Text „Jetzt Verfügbarkeit prüfen“ vs. „Wunschtermin anfragen – unverbindlich“.
7. WhatsApp vs. E-Mail als primärer Senden-Button (je nach Sprache, z. B. JA eher E-Mail/LINE).

Hinweis: Bei geringem Traffic eher sequenziell testen (2 Wochen A, 2 Wochen B) und qualitativ auswerten (WhatsApp-Gesprächsqualität), nicht auf Signifikanz warten.

---

## 8. Brand-Assets: Einsatzplan (`docs/brand-assets.md`)

| Asset | Wo einsetzen | Wie |
|---|---|---|
| **Logo (cyan/gold)** | Header, Footer, Favicon/Apple-Touch, Profilbild für GBP, WhatsApp Business, Instagram, TikTok, Klook | Wasserzeichen und Endcard in Drohnen-Reels (dezent, unten rechts). Auf Bootsflagge und Crew-Shirts für echte Fotos. |
| **Überfülltes Longtail (Pain)** | Longtail-vs-Speedboat-Story (bereits eingesetzt), eigene Vergleichs-Landingpage, Meta-/TikTok-Carousel „Vorher/Nachher“ | Nur als linke Seite eines Vergleichs, nie als Hero und nie allein. Keine Wettbewerber-Namen und keine Herabwürdigung von Longtail-Kapitänen (lokale Branche). Die Menschen bleiben anonym und divers, ohne nationale Zuordnung. Copy DE „Gleicher Ozean. Anderer Tag.“ / EN „Same ocean. Different day.“ |
| **Paar mit Champagner auf unserem Boot (2 Varianten)** | Honeymoon-Landingpage (Hero), Karte „Sunset Romance“ und „Sunset & Glow Kombi“, Sekt- und Champagner-Add-on-Karte, Wizard-Header bei Anlass Paar/Hochzeitsreise/Antrag, Meta-Ads (DE/KO), Pinterest-Pins (DE-Honeymoon-Planer), E-Mail-Header der Honeymoon-Sequenz | **Vorher prüfen, ob das Boot dem echten Boot ähnelt.** Wenn nicht: „Illustration“ kennzeichnen oder durch ein echtes Foto ersetzen. Variante 1 im Hero, Variante 2 in Ads, Anzeigen-Varianten A/B testen. |
| **Echtes Bootsfoto (Inhaber-Upload)** | Hero (ersetzt Unsplash), Specs-Box, Wizard Schritt 1, GBP-Titelbild | Echtes Material ist stärker als jede Generierung. |
| **Night Glow mit unserem Boot (ausstehend)** | Night-Glow-Tour, Plankton-Artikel, Ads | Realistisch darstellen, nicht übersättigt. Als Illustration kennzeichnen und mit echtem Handyvideo daneben („So sieht es wirklich aus“). |

### Nächste Generierungen (Higgsfield) und Aufnahmen
1. **Familie im Schatten an Bord**, Kinder mit Schwimmwesten und Schnorchelmasken, Rückenansicht oder ohne erkennbare Gesichter (Family-Landing, Familien-Ads).
2. **Angler mit Fang am Heck** (realistische Art: Königsmakrele/Barrakuda), Kühlbox mit Bier (Angel-Sektion, FishingBooker).
3. **Top-down-Drohne: unser Boot allein in einer Lagune** (Koh-Roi-Typ), 9:16 und 16:9 (Hero-Video-Alternative).
4. **Catering-Szene an Bord:** 2 Thai-Gerichte, kalte Cola/Wasser im Eis, Hände im Bild (Catering-Karte, steigert die 1-Klick-Rate).
5. **Antrag in der Lagune aus der Luft** (Proposal-Landing). Achtung: als Illustration kennzeichnen.
6. **Video 9:16, 15 s:** „Gleiche Insel, 3 Stunden später“ (Split: Gruppenboote vs. leerer Strand). Besser mit echtem eigenem Footage.
7. **Video:** Sekt-Korken bei Sonnenuntergang, Slow-Motion (Honeymoon-Ad).
8. **Echtes Fotoshooting** (wichtiger als alles Generierte): Boot, Crew, Schattenplätze, Leiter, Westen, Kapitän-Porträt.

Grundsatz: Generierte Bilder nie als Beleg für Ausstattung oder echte Gäste verwenden. Keine Darstellung von Nationalitäten oder Ethnien als „störende Masse“.

---

## 9. Mutige Ideen ohne Grenzen

1. **„Glow Promise“ mit Mondkalender:** Ein Live-Kalender zeigt pro Nacht die Leucht-Chance (Mondphase, Wetter, Erfahrungswerte). Ist das Leuchten schwach, gibt es den zweiten Night-Glow-Trip zum Selbstkostenpreis (Inhaber legt die Konditionen fest). Das macht die größte Schwäche der Branche (enttäuschte Erwartungen) zum USP.
2. **„Der Film Ihres Tages“:** Drohne + Unterwasser + Handy-Clips werden zu einem 60-Sekunden-Film mit Musik geschnitten und beim Abendessen per WhatsApp geliefert. Optional als gerahmter Print oder Fotobuch. Das ist zugleich UGC-Motor und hochmargiges Add-on.
3. **„Sag Ja in Koh Roi“ – Antrags-Concierge:** Versteckte Drohne, der Kapitän übergibt den Ring, Blumen und Schild am leeren Strand, Fotograf, danach Sekt und Night Glow. Ein Festpreis-Paket mit Planungsgespräch per Video-Call vorab.
4. **„First Boat“-Garantie:** Abfahrt 06:15, damit Sie die Hong-Lagune bzw. Maya Bay vor allen anderen erreichen. Mit ehrlicher Uhrzeit-Prognose („in den letzten 10 Fahrten waren wir 9× zuerst“, sobald echte Daten vorliegen).
5. **Secret-Island-Pass:** Digitale Karte, auf der jede besuchte geheime Bucht „freigeschaltet“ wird. Ab 3 Trips gibt es eine exklusive Route, die nicht auf der Website steht, und einen Empfehlungscode. Das bindet Wiederkehrer und erzeugt Gesprächsstoff.
6. **Captain’s Table:** Catch & Cook endet in einem Partnerrestaurant am Wasser oder mit einem Beach-Chef. Die Angler essen ihren Fang mit Sundowner.
7. **Live-Bootstracker-Link** für Familien und Concierges („Wo ist mein Boot?“), der für Sicherheit und Wow-Effekt zugleich sorgt.
8. **Mehrtägige „Andaman Escape“-Expedition:** 2–3 Tage Inselhopping mit Übernachtung in einem Partnerresort auf Koh Yao Noi oder Koh Lanta. Bestellwert 5–10× einer Tagestour.
9. **Riff-Versprechen:** Pro Tour fließt ein fester Betrag in ein echtes, lokales Korallen- oder Strandreinigungsprojekt (nur mit echtem Partner und Nachweis). Dazu riffschonende Sonnencreme an Bord.
10. **Hotel-Concierge-Tablet-Widget:** Hotels betten den Wizard mit ihrem Ref-Code ein und buchen live für Gäste an der Rezeption.

---

## 10. Umsetzungsreihenfolge (Empfehlung)

1. **Diese Woche:** Quick Wins 1, 2, 3, 6, 7 (Ehrlichkeit und Korrektheit), danach 4, 5, 8, 9, 10.
2. **Nächste 2 Wochen:** Stornierungs-Policy, echtes Fotoshooting, GBP-Launch, Event-Tracking + Ref-Codes, Bundles im Wizard.
3. **Nächster Monat:** Sprach-URLs + hreflang, Übersetzung der Top-5-Artikel ZH/KO/JA, Vergleichs- und Honeymoon-Landingpages, OTA-Listings, Hotel-Partnerakquise.
4. **Quartal:** Glow Promise, Tagesfilm-Produkt, Antrags-Concierge, Bewertungs-Flywheel auf 20+ echte Bewertungen.

---

### Quellen (Wettbewerbsrecherche)
- [GetYourGuide – Krabi Premium Private Speedboat 4 Island/Hong Island](https://www.getyourguide.com/krabi-l2174/krabi-premium-private-speedboat-4-islandhong-island-tour-t874268/)
- [Krabi Boat Tours – Hong Islands vs 4 Islands (Preise privat/Gruppe)](https://krabiboat.tours/hong-islands-vs-4-islands)
- [Koh Tour Krabi – Private Tours](https://kohtourkrabi.com/private-tours)
- [GetYourGuide – Krabi Island Tours (private Longtail-Listings)](https://www.getyourguide.com/krabi-l2174/island-tours-tc313/)
- [GetYourGuide – From Krabi: 4 Islands Private Longtail with Picnic](https://www.getyourguide.com/krabi-l2174/krabi-private-luxury-long-tail-boat-4-islands-trip-t441745/)
- [Viator – Hong Islands Sunset & Bioluminescent Plankton](https://www.viator.com/tours/Krabi/Hong-Islands-Sunset-Bioluminescent-Plankton-Trip-From-Krabi/d348-110534P267)
- [Viator – Bioluminescent Swimming from Krabi](https://www.viator.com/tours/Krabi/Bio-Luminescent-Swimming-From-Krabi/d348-110534P119)
- [TripAdvisor – Private 4 Island Speed Boat Tour from Krabi](https://www.tripadvisor.com/AttractionProductReview-g1507054-d14902019-Private_4_Island_Speed_Boat_Tour_from_Krabi-Ao_Nang_Krabi_Province.html)
- [TripAdvisor – Krabi 4 Island Adventure (Bewertungstenor)](https://www.tripadvisor.com/Attraction_Review-g1507054-d15750352-Reviews-Krabi_4_Island_Adventure-Ao_Nang_Krabi_Province.html)
- [Big Tour Krabi – Phi Phi Private Speedboat](https://bigtourkrabi.com/en/thailand/ao-nang/tours/phi-phi-private-speedboat/)
- [Koh Tour Krabi – Private Phi Phi by Speedboat](https://kohtourkrabi.com/tours/private-phi-phi-islands-tour-speedboat/)
- [FishingBooker – Ao Nang](https://fishingbooker.com/destinations/location/th/ao-nang) · [FishingBooker – Krabi](https://fishingbooker.com/destinations/region/th/krabi)
- [Elyxta – Private Fishing Boat Ao Nang](https://elyxta.store/tours/krabi-private-fishing-boat-day-trip/)
- [TripAdvisor – Krabi Private Sunset Cruise](https://www.tripadvisor.com/AttractionProductReview-g1507054-d27139681-Krabi_Private_Sunset_Cruise_on_a_Luxury_Big_Boat-Ao_Nang_Krabi_Province.html)
