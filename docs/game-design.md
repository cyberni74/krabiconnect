# RABENSCHWUR — Ein düsteres Ritterabenteuer (Design-Dokument)

Point-and-Click-Adventure im dunklen Mittelalter. Held **Bran** (17, Waise, Totengräber-Lehrling aus Aschenfurt) will **Ritter des Rabenordens** werden.
Ton: düster, trocken-schwarzer Humor, Pest, Hunger, Aberglaube, Hexen, ein sterbender König, ein schlafender Drache im Vulkan Kharn.

## Technik-Konventionen (verbindlich)
- Logische Szene 960×440. Hintergründe: `public/g/bg/<scene>.webp` (aus 21:9 → Höhe 440, Breite zentriert auf 960 beschnitten).
- Unteres Drittel jedes Hintergrunds = **durchgehendes, flaches Laufband** (kein Wasser/Graben/Treppe im Vordergrund). Laufpolygon pro Szene aus der Debug-Montage festgelegt.
- **Alle** interaktiven oder aufnehmbaren Objekte sind **eigene Sprites** (transparentes PNG), nie im Hintergrund eingemalt. Hintergründe zeigen nur Architektur/Landschaft/unbewegliche Deko.
- Props: `public/g/props/<id>.png` (+ `_open`, `_2` … Zustände). Items/Icons: `public/g/items/<id>.png`. Figuren: `public/g/chars/<name>_<pose>.png`.
- Items (auch Ablenkungs-Items) haben Icon + Szenen-Sprite (dasselbe Bild, kleiner in der Szene).
- Container (Schubladen, Truhen, Schränke) haben eigene Zustands-Sprites (geschlossen / offen / Schublade n offen). Inhalt erscheint als Item-Sprites über dem offenen Container.
- Flags: Kapitel-übergreifende Flags s. unten. Ehre: `g.flag("honor")` (Zahl, Start 0).

## Spielstruktur
Prolog-Karte → Kap. 1 Aschenfurt → Kap. 2 Hexenmoor → Kap. 3 Burg Grauwacht → Kap. 4 Der Vulkan → Epilog.

### Hauptquest-Kette
1. **Feldwebel Brandt** (Dorfplatz): Zur Prüfung des Rabenordens wird nur zugelassen, wer **Klinge, Segen, Bürgen** vorweist. (flag `q_start`)
2. Kap.1: Klinge (Schmiede), Segen (Kapelle), Bürge (Waldrand) beschaffen (flags `have_blade`, `have_blessing`, `have_sponsor`).
3. Kap.2: Der Weg nach Grauwacht führt durchs Hexenmoor. Nur mit Hexen-Talisman sicher. Die Hexe Morwenna braut das **Gegengift** gegen Schierlingsgift (für den König).
4. Kap.3: Burgtor → Burghof; **Drei Eide** des Rabenordens: *Demut* (Burghof/Stall/Küche), *Weisheit* (Bibliothek des Magiers Myrddin), *Mut* (Drache, Kap.4). Zwischendurch Intrige: Kanzler **Malvor** vergiftet König Aldemar.
5. Kap.4: Malvor hat das **Drachenei** gestohlen und will den Drachen **Aschenschlund** mit dem Horn beherrschen. Finale: Ei zurückbringen (Gnade, Wahrer-Ritter-Ende) oder Drachen erschlagen (Rache-Ende).

### Ehre (honor)
+1: Toten Respekt zollen, Almosen, ehrliche Wahl. −1: Grabraub (Münzbeutel am Leichenkarren, Eisenkreuze), Diebstahl, Bestechung annehmen. Ende „Wahrer Ritter" braucht honor ≥ 0 und Gnade beim Drachen.

## KAPITEL 1 — Aschenfurt
Szenen: `dorfplatz`, `schmiede`, `kapelle`, `gruft`, `waldrand`.

### dorfplatz
Hintergrund: Dorfplatz, Fachwerkhäuser, Kapelle rechts, Pinienwald, Burg in der Ferne, Krähen. Leerer Platz.
NPCs: **Feldwebel Brandt** (Soldat, Kettenhemd, Helm, Lanze), **Hilda** (alte Frau, Kopftuch, Enkelkind krank), **Rabe** (sitzt auf Galgen; Feder).
Props: Brunnen (Steinbrunnen mit Kurbel; Zustände: Eimer unten/oben), Leichenkarren (mit Tuch), Galgen (leer, Seil hängt: aufnehmbar → `seil`), Anschlagbrett (Dekret), Fass (Pech: `pechfass`, Zustand voll/leer), Heuhaufen (Nadel? Suche), Kiste (Schloss; Brecheisen nötig? → enthält Brot, Würfel).
Exits: links→schmiede, rechts→kapelle (Tür), rechts außen→waldrand.
Rätsel: 
- Brunnen: `eimer` (an Kurbel, fehlt Seil) + `seil` → Wasser holen (`wasser` im Eimer). 
- Leichenkarren: Münzbeutel (Grabraub honor −1) / Totentuch zurechtlegen (honor +1).
- Hilda: bittet um Fieberkraut (Nebenquest, Kap.2 gelöst, Belohnung `hildas_brosche`).
- Anschlagbrett: Dekret liefert Hinweis auf Runenreihenfolge (Rabe, Lamm, Kreuz) — wird im Sakristei-Rätsel gebraucht.

### schmiede
Hintergrund: Innenraum Schmiede (Esse, Fenster, Werkbank), düster, Glut. Leerer Boden.
NPC: **Meister Gero** (Schmied, einarmig/lahmes Bein, brummig).
Props: Esse (Zustände: kalt/glühend), Blasebalg (kaputt/geflickt), Amboss, Löschfass (Wasser), Schleifstein (Kurbel), Werkzeugschrank mit 3 Schubladen (alle Zustände), Kohlekiste (verschlossen/offen), Hammerhalterung, Wand-Eisenstangen.
Schubladen-Inhalt: S1: `nadel_zwirn`, `kreide`; S2: `feuerstein` (Schlageisen), `kohlekiste_schluessel`; S3: Rattennest (`tote_ratte`), `nagel`.
Klingenschmieden (Hauptmechanik, Reihenfolge erzwungen, Gero erklärt):
 1. Kohle in Esse (`kohle` aus Kohlekiste: Schlüssel S2).
 2. Esse anzünden (`feuerstein`).
 3. Blasebalg flicken (`stiefel_alt` + `nadel_zwirn`), dann pumpen (3×).
 4. `klingenbruch` (aus Gruft) in Esse legen, glühen lassen.
 5. Hammer (`hammer`, Halterung) → Amboss 4 Schläge (Hero-Pose swing).
 6. Löschfass: normal (Schwert) oder mit `weihwasser` (gesegnete Klinge: Bonus beim Drachen/Totenritter).
 7. Schleifstein kurbeln → `schwert`. (flag `have_blade`)
Gero verlangt am Ende 2 `silber` (aus Totengräberlohn) oder Arbeit (Bellows 10× pumpen).

### kapelle
Hintergrund: Kapelleninneres (Altar, Buntglasfenster mit 3 Symbolen: Rabe, Lamm, Kreuz), Kerzen. Plus Tür zur Sakristei (links), Treppe zur Gruft (Falltür, rechter Bereich flach).
NPC: **Pater Anselm** (Priester, hager, Pestmaske-Schal), draußen: **Totengräber Oswin** am Friedhofstor? (Oswin steht in der Kapelle-Szene an der Seitentür zum Friedhof).
Props: Altar (Kelch), Weihwasserbecken (Zustand leer/voll), Beichtstuhl (Schublade? Nein: Tür), Sakristeischrank mit 2 Schubladen + Fach (Zustände), Kerzenständer (kerzenstummel aufnehmbar), Opferstock (verschlossen), Falltür zur Gruft (Zustand zu/offen, Schloss), Bibel (Pult) mit Lesezeichen.
Rätsel: 
- Anselm verlangt `reliquie` (Heilige Fingerknochen, aus Gruft gestohlen) → er siegelt `siegelbrief` (Segen, `have_blessing`).
- Sakristeischrank: Schublade 1 `gruftschluessel`, Schublade 2 `weihrauch` + Leere; Fach hinter Bibel: Runenhinweis. Schrank ist durch Runen-Schiebeschloss (3 Knöpfe: Rabe, Lamm, Kreuz — Reihenfolge laut Anschlagbrett-Dekret) gesichert.
- Weihwasserbecken: `flasche_leer` → `weihwasser`.
- Oswin: Totengräber-Job (3 Gräber auf dem Friedhof-Ausgang: mit `schaufel` graben, Pose dig) → 2 `silber`, honor +1; 4. Grab gräbt `hildas_ring`?

### gruft
Hintergrund: Gruft, Sarkophage, Spinnweben, fahles Licht, Skelett-Wächter-Nische. Dunkel: ohne `fackel` sieht man nur Silhouette (Dunkel-Overlay mit Lichtkegel um den Helden).
NPC/Gegner: **Skelettwächter** (steht regungslos; wacht auf, wenn Reliquie genommen ohne Weihwasser).
Props: 3 Sarkophage (einer mit Deckel verschoben), Nische mit Reliquienschrein (Runenschloss: 3 Steinplatten), Sarg-Deckel, Fackelhalterung, Knochenhaufen, Schwertbruch auf Sarkophag (`klingenbruch`), Kerzenstummel, Ratten.
Rätsel: Fackel (`holzstab` + `pech` + angezündet mit `feuerstein` oder Kerze) leuchtet (begrenzt: 12 Aktionen, danach Rückweg dunkel → neue Fackel/Kerze). Reliquienschrein: Runenfolge wie Anselms Schrank (Rabe, Lamm, Kreuz). Skelett: mit `weihwasser` besprengen, bevor Reliquie genommen wird.

### waldrand
Hintergrund: Waldrand, Pfad, Baumstumpf, Nebel, verlassenes Wolfsrudel-Lager. Pfad führt weiter ins Moor (Kap.2).
NPC: **Ser Halvard** (sterbender Ritter, gerüstet, an Baum gelehnt), 2 **Wölfe** (Props/Sprites, laufen weg).
Props: Wolfsfalle (Eisen, Zustände aufgestellt/zugeschnappt), Köder-Stelle, Baumstumpf, Halvards Schild (aufnehmbar → später), Zelt?
Rätsel: Wölfe halten Bran fern → Köder (`fleisch_verdorben` von Leichenkarren? nein: `wurst` aus Kiste) in Falle legen, `seil` spannen → Wölfe gefangen/vertrieben. Halvard braucht Wasser (`wasser` aus Brunnen) → gibt `siegelring`, `halvard_brief` (have_sponsor).
Exit: Moorweg (gesperrt bis alle 3 Dinge → Brandt gibt Passierschein? Kap.2 Start nach Rückkehr zu Brandt: Brandt führt zum Tor des Moors).

## KAPITEL 2 — Das Hexenmoor
Szenen: `moorpfad`, `hexenhuette`.

### moorpfad
Hintergrund: Nebliges Moor, Holzsteg (Boardwalk) durchgehend, Irrlichter, tote Bäume. Boardwalk ist das Laufband.
Props: 3 Moorlaternen (Zustände aus/an), Fallende-Planke (fehlt, `brett` aufnehmbar vom Wrack), Schlange im Tümpel, Krähenschädel-Totem, Irrlicht (Sprite, schwebend).
NPC: **Morwenna** erscheint am Hexenhaus; **Katze** (schwarz).
Rätsel: Laternen in richtiger Reihenfolge entzünden (Fackel/Kerze) → Irrlichter weichen → Weg zur Hütte. Fehlende Planke ersetzen (`brett`).

### hexenhuette
Hintergrund: Hütteninneres (Kessel, Regale mit Gläsern, Kräuter, Knochen). Boden flach.
NPC: **Morwenna** (Hexe), **Katze** (Prop-Sprite, Pose), **Rabenvogel** im Käfig.
Props: Kessel (Zustände: kalt/kochend/Gegengift), Regal mit Gläsern, Kommode mit 3 Schubladen, Truhe (verschlossen), Besen, Spinnennetz, Spiegel (verhüllt), Käfig.
Rätsel (Alchemie): Gegengift braut man nur mit: `rabenfeder` (Rabe am Galgen, Kap.1: Feder fällt, wenn Bran Brot streut), `alraune` (Alraune im Moor ausgraben: schreit → `kerzenwachs` als Ohrstöpsel), `schlangenzunge` (Schlange mit `brot` ablenken), `moorwasser`. Reihenfolge am Kessel: Wasser, Feder, Wurzel, Zunge, dann `feuerstein`/Glut. Falsche Reihenfolge → Kessel stinkt/explodiert (Reset). Belohnung: `gegengift`, `hexentalisman` (Moor-Schutz), Hexe nennt Hinweis zum Drachen („Der Drache hütet kein Gold, sondern ein Ei.").
Nebenquest Hilda: `fieberkraut` aus Moorregal → zurück nach Aschenfurt optional (honor+1).

## KAPITEL 3 — Burg Grauwacht
Szenen: `burgtor`, `burghof`, `ruestkammer`, `bibliothek`, `thronsaal`, `kerker`.

### burgtor
Torturm, Zugbrücke (Zustände hoch/runter), Fallgitter (Zustände), Wachen, Graben (nur im Mittelgrund, Vordergrund flach!), Fackeln.
NPC: **Hauptmann Grimm**, **Wache**.
Rätsel: Prüfung der Drei Dinge: Schwert zeigen, Segensbrief geben, Siegelring/Halvards Brief → Grimm lässt Zugbrücke runter (Kurbel in Wachstube?). Optional: Bestechung/Täuschung.

### burghof
Burghof: Stall, Waffenschmiede, Brunnen, Übungspuppen, Treppe zum Palas, Tür zur Rüstkammer, Bibliothekturm, Küche, Kerkerabgang.
NPC: **Ser Roderic** (Ordensmeister), **Stallmeister Pip**, **Köchin Berta**, **Knappe** ( Konkurrent **Ser Eduard**).
Props: Übungspuppe, Pferd (Sprite) mit lockerem Hufeisen, Heukarren, Waffenständer, Suppenkessel, Wasserkarren.
**Prüfung der Demut** (flag `trial_demut`): Aufgabenliste von Roderic: Pferd beschlagen (`hufeisen`, `hammer` aus Kap.1 behalten?), Rüstung putzen (`lappen` + `sand`), Suppe an Gefangene bringen (führt in Kerker), und der „Test": Ser Eduard bietet Gold, wenn Bran die Aufgabe abgibt (ablehnen = honor +1).

### ruestkammer
Waffenkammer: Rüstungsständer, Waffenregale, Truhen, Kommode mit Schubladen.
Rätsel: Ritterrüstung zusammensetzen (Helm, Brustpanzer, Armschienen: Teile aus Truhen/Schubladen/Regalen) → Verkleidung; Spiegelschild (Schild + `sand`/`lappen` polieren) für Kap.4.

### bibliothek
Magierturm-Bibliothek: Bücherregale, Globus, Sternenkarte, Waage, Kamin.
NPC: **Magier Myrddin** (Greis, Bart, Augen glühen, Rätselstellend).
**Prüfung der Weisheit** (flag `trial_wissen`): 3 Rätsel: (1) Bücher in Reihenfolge (4 Bücher-Props, Hinweise im Regal/Globus), (2) Waage (Gewichte: `stein`, `totenkopf`, `silber`… Gleichgewicht), (3) Rätselschloss („Je mehr man nimmt, desto mehr bleibt zurück" → Antwort „Schritte"). Belohnung: `weisheitssiegel`, Myrddin enthüllt: Malvor ist ein Verräter (Beweis im Thronsaal).

### thronsaal
Thronsaal, Säulen, Banner, Tapisserie (geheimes Fach), Thron.
NPC: **König Aldemar** (siech), **Kanzler Malvor** (schwarzer Talar, Ring), Wachen.
Rätsel: Gegengift in den Weinkelch des Königs schmuggeln (Malvor ablenken: `gift_beweis`/Brief/Wache), Geheimfach hinter Tapisserie (Runenknöpfe) mit `giftflasche` (Beweis) und `drachenei_karte`; Malvor entlarven (Dialogbaum mit Beweisen); er flieht zum Vulkan.

### kerker
Kerker: Zellen, Gitter, Fackeln, Wachtisch.
NPC: **Gefangener Ser Aldric** (Zeuge), **Wärter Knorr** (betrunken).
Rätsel: Wärter einschläfern (`wein` + `schlafkraut` aus Kap. Moor oder Küche), `zellenschluessel`, Aldric befreien → Hinweis auf geheimen Gang in Malvors Gemach (Drachenei).

## KAPITEL 4 — Der Vulkan
Szenen: `vulkanpfad`, `drachenhoehle`.

### vulkanpfad
Ascheweg, Lavafluss, Schwefel, Steg (durchgehend). Rope-Bridge ersetzen (`seil`), Lava abkühlen (Wasser/`weihwasser`).
### drachenhoehle
Drachenhöhle mit Hort, Lavasee-Rand (Laufband flach!), Drache Aschenschlund (große Sprite, schlafend/wach), Malvor mit Horn.
**Prüfung des Mutes**: Drachenei zurückbringen (Gnade) / Spiegelschild gegen Feuer / Drachenhorn zerstören; Malvor wird vom Drachen verschlungen (Gnade-Ende) oder Kampf.
Epilog: Thronsaal, Ritterschlag (Karten + Ende).

## Figuren (Pose-Sheets, transparent, rechtsgewandt)
Bran: walk 4 + action 4 (bend, reach, swing, dig). NPCs: idle, talk (+1 Spezialpose je nach Rolle). Drache: sleep, awake, roar/breath.

## Asset-Listen (Items)
Kernitems: schaufel, eimer, seil, silber, stiefel_alt, nadel_zwirn, feuerstein, holzstab, pech, fackel, flasche_leer, weihwasser, gruftschluessel, reliquie, klingenbruch, kohle, hammer, schwert, wasser(eimer), brot, wurst, siegelbrief, siegelring, halvard_brief, rabenfeder, kerzenwachs, alraune, schlangenzunge, moorwasser, gegengift, hexentalisman, fieberkraut, hufeisen, lappen, sand, wein, schlafkraut, zellenschluessel, helm, brustpanzer, armschienen, schild, spiegelschild, weisheitssiegel, giftflasche, drachenei, horn, brett, kohlekiste_schluessel, kreide, weihrauch.
Ablenkungs-Items: totenkopf, kerzenstummel, rostiger_dolch, trockenes_brot, tote_ratte, knochen, apfelrest, wuerfel, zinnbecher, holzloeffel, nagel, tonscherbe, zahn, kamm, rosenkranz, pergamentfetzen, haarlocke, pilz, kreuzanhaenger, spielfigur, gaensefeder, rattenfalle, kerzenhalter, messingknopf, hufnagel, glasauge, rabenkralle.
