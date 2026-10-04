import type { GuideSection } from "./types";

/**
 * Owner wish: every island article carries concrete snorkel / swim / relax insider info.
 * These sections are inserted before the last section of the matching island article (see articles.ts).
 */
export const SNORKEL_RELAX: Record<string, GuideSection> = {
  "koh-poda-guide": {
    id: "swim-relax-koh-poda",
    h2: { de: "Baden & Entspannen an Koh Poda", en: "Swimming & relaxing at Koh Poda" },
    body: {
      de: [
        "Zum sicheren Baden eignet sich der mittlere Abschnitt des Hauptstrands, abseits der Anlegezonen der Longtails an beiden Enden. Das Wasser fällt sanft ab und ist an ruhigen Tagen glasklar. Schatten finden Sie unter den Bäumen im hinteren Strandbereich – ideal für eine Pause zwischen zwei Schnorchelrunden.",
        "Zum Schnorcheln sind die Felsen am Nord- und Südende des Strandes die besten Stellen: Hier sehen Sie Rifffische, Seeigel in den Spalten und kleine Korallenstöcke. Am klarsten ist das Wasser morgens und in der Trockenzeit nach windstillen Tagen.",
      ],
      en: [
        "For safe swimming, use the middle section of the main beach, away from the longtail landing zones at either end. The water shelves gently and is crystal-clear on calm days. You will find shade under the trees at the back of the beach – ideal for a break between snorkels.",
        "The best snorkelling is along the rocks at the northern and southern ends of the beach: reef fish, sea urchins in the crevices and small coral heads. The water is clearest in the morning and in the dry season after windless days.",
      ],
    },
    tip: {
      de: "Ein UV-Shirt statt viel Sonnencreme schützt beim Schnorcheln den Rücken – und riffschonende Creme ist im Nationalpark ohnehin Pflicht.",
      en: "A rash guard instead of lots of sunscreen protects your back while snorkelling – and reef-safe sunscreen is required in the national park anyway.",
    },
  },
  "chicken-island-tup-sandbar": {
    id: "snorkel-swim-chicken-island",
    h2: { de: "Schnorcheln, Baden & Entspannen", en: "Snorkelling, swimming & relaxing" },
    body: {
      de: [
        "Die besten Schnorchelspots liegen an der Riffkante vor der Felsnase von Chicken Island. Dort ist das Wasser tiefer und klarer als an der Sandbank, und Sie sehen Schwärme kleiner Rifffische. Bleiben Sie etwas abseits der Stellen, an denen viele Boote gleichzeitig halten – dort ist das Wasser oft aufgewühlt.",
        "Zum Baden und Entspannen ist die Sandbank selbst ideal: knietiefes, warmes Wasser, perfekt zum Treibenlassen. Schatten gibt es nur am Rand von Koh Tup unter den Bäumen. Wer Ruhe sucht, läuft bei Ebbe ein Stück die Sandbank entlang, weg vom Anlegepunkt.",
      ],
      en: [
        "The best snorkel spots are along the reef edge off Chicken Island’s rocky headland. The water there is deeper and clearer than at the sandbar, and you will see schools of small reef fish. Keep a little away from where many boats stop at once – the water is often stirred up there.",
        "For swimming and relaxing, the sandbar itself is ideal: knee-deep warm water, perfect for floating. Shade is only found at the edge of Koh Tup under the trees. If you want quiet, walk a little way along the sandbar at low tide, away from the landing point.",
      ],
    },
    list: {
      de: ["Riffschonende Sonnencreme und UV-Shirt", "Wasserschuhe für die Sandbank", "Maske und Schnorchel für das Riff vor Chicken Island"],
      en: ["Reef-safe sunscreen and a rash guard", "Water shoes for the sandbar", "Mask and snorkel for the reef off Chicken Island"],
    },
  },
  "railay-phra-nang-cave": {
    id: "swim-snorkel-phra-nang",
    h2: { de: "Baden, Schnorcheln & Entspannen an Phra Nang", en: "Swimming, snorkelling & relaxing at Phra Nang" },
    body: {
      de: [
        "Phra Nang Beach hat einige der ruhigsten Badebedingungen der Region: geschütztes, sanft abfallendes Wasser mit feinem Sand. Schwimmen Sie in den abgegrenzten Badebereichen und halten Sie Abstand zu den Longtails am Strandrand. Schatten spenden am Vormittag die überhängenden Felswände am Ostende.",
        "Zum Schnorcheln eignen sich die Felsen am Rand der Bucht und, an ruhigen Tagen, der kurze Weg hinüber zu den vorgelagerten Felsen. Spektakuläre Riffe sollten Sie nicht erwarten, aber Fische gibt es genug. Railay East ist bei Ebbe dagegen schlammig und zum Baden ungeeignet.",
      ],
      en: [
        "Phra Nang Beach has some of the calmest swimming in the area: sheltered, gently shelving water with fine sand. Swim within the marked areas and keep clear of the longtails along the beach edge. In the morning, the overhanging cliffs at the eastern end give shade.",
        "For snorkelling, try the rocks at the edges of the bay and, on calm days, the short swim towards the offshore rocks. Don’t expect spectacular reefs, but there are plenty of fish. Railay East, by contrast, is muddy at low tide and unsuitable for swimming.",
      ],
    },
  },
  "hong-island-krabi": {
    id: "snorkel-relax-hong",
    h2: { de: "Schnorchelspots & Entspannen auf Koh Hong", en: "Snorkel spots & relaxing on Koh Hong" },
    body: {
      de: [
        "Die besten Schnorchelstellen auf Koh Hong liegen an den Felsen links und rechts des Hauptstrands. Das Wasser ist hier oft klarer als in der Lagune, und Sie sehen Rifffische direkt über dem felsigen Grund. Am klarsten ist es morgens in der Trockenzeit, bevor viele Boote anlegen und das Wasser aufwirbeln.",
        "Zum Entspannen gibt es am Strand Schatten unter Bäumen und an den Felsen. Wer Ruhe sucht, geht an das Ende des Strandes, weg vom Nationalpark-Kontrollpunkt. Schwimmen Sie nur in den Badebereichen – vor dem Strand fahren regelmäßig Boote ein und aus.",
      ],
      en: [
        "The best snorkel spots on Koh Hong are along the rocks to the left and right of the main beach. The water here is often clearer than in the lagoon, with reef fish right above the rocky bottom. It is clearest in the morning in the dry season, before many boats land and stir up the water.",
        "For relaxing, the beach has shade under trees and along the rocks. If you want quiet, head to the far end of the beach, away from the national park checkpoint. Only swim in the swimming areas – boats come and go in front of the beach regularly.",
      ],
    },
    tip: {
      de: "Packen Sie ein UV-Shirt ein: An den Felsen schnorcheln Sie oft länger als geplant – und Ihr Rücken ist die ganze Zeit in der Sonne.",
      en: "Pack a rash guard: you often snorkel the rocks longer than planned – and your back is in the sun the whole time.",
    },
  },
  "koh-lao-lading-koh-pakbia": {
    id: "snorkel-relax-pakbia",
    h2: { de: "Wo man hier am besten schnorchelt und entspannt", en: "Where to snorkel and relax here" },
    body: {
      de: [
        "Für Schnorchler ist Koh Pakbia die bessere Wahl: An den Felsen rund um die Insel finden Sie Korallen und Rifffische, bei höherem Wasserstand meist mit besserer Sicht. Koh Lao Lading ist dagegen eher eine Badeinsel – flaches, ruhiges Wasser, in dem man wunderbar treiben kann.",
        "Zum Entspannen ist Lao Lading kaum zu schlagen: Die Felswände werfen je nach Tageszeit Schatten auf den Strand, und das Wasser ist meist spiegelglatt. Bringen Sie Wasserschuhe mit, denn an beiden Inseln gibt es felsige Einstiege.",
      ],
      en: [
        "For snorkellers, Koh Pakbia is the better choice: around its rocks you will find coral and reef fish, usually with better visibility at higher water. Koh Lao Lading, on the other hand, is more of a swimming island – shallow, calm water that is wonderful for floating.",
        "For relaxing, Lao Lading is hard to beat: the cliffs cast shade on the beach depending on the time of day, and the water is usually mirror-smooth. Bring water shoes, as both islands have rocky entries.",
      ],
    },
  },
  "koh-roi-hidden-lagoon": {
    id: "swim-relax-koh-roi",
    h2: { de: "Schwimmen, Schnorcheln & Ruhe an Koh Roi", en: "Swimming, snorkelling & calm at Koh Roi" },
    body: {
      de: [
        "Rund um Koh Roi ist das Wasser in der Phang Nga Bucht meist ruhig, aber durch Sedimente aus den Mangroven weniger klar als an den Inseln weiter draußen. Für Schnorchler lohnt sich ein Blick an die Felswände außen, wo Fische zwischen den Felsen stehen – für bunte Riffe sind Koh Rok oder Chicken Island besser.",
        "Die eigentliche Stärke ist das Schwimmen und Entspannen: Das Boot ankert in ruhigem Wasser, Sie springen direkt vom Heck ins Meer und treiben vor einer Kulisse aus Karstfelsen. In der Lagune selbst ist es still und im Laufe des Tages teilweise schattig.",
      ],
      en: [
        "Around Koh Roi the water in Phang Nga Bay is usually calm, but sediment from the mangroves makes it less clear than at the islands further out. Snorkellers should check the outer rock walls, where fish gather between the rocks – for colourful reefs, Koh Rok or Chicken Island are better.",
        "The real strength here is swimming and relaxing: the boat anchors in calm water, you jump straight off the stern and float against a backdrop of karst towers. Inside the lagoon it is quiet and partly shaded during the day.",
      ],
    },
    tip: {
      de: "Nehmen Sie eine Schwimmnudel oder Schwimmweste mit in die Lagune – so können Sie sich ohne Anstrengung treiben lassen und die Felswände bestaunen.",
      en: "Take a pool noodle or life jacket into the lagoon – you can float effortlessly and gaze up at the cliffs.",
    },
  },
  "koh-kudu-koh-nok": {
    id: "swim-relax-koh-nok",
    h2: { de: "Baden, Schnorcheln & Entspannen", en: "Swimming, snorkelling & relaxing" },
    body: {
      de: [
        "Koh Nok ist der perfekte Badestopp: Das Wasser vor dem Strand ist meist ruhig und flach, ideal zum Schwimmen und für Kinder. An den Felsen am Rand des Strandes lässt sich entspannt schnorcheln, auch wenn die Sicht in der Phang Nga Bucht selten so klar ist wie an den Inseln im offenen Meer.",
        "Zum Entspannen suchen Sie sich am besten einen Platz im Schatten der Bäume am Strandrand – auf dem Boot gibt es zusätzlich Sonnensegel. Am klarsten ist das Wasser bei Flut und in der Trockenzeit.",
      ],
      en: [
        "Koh Nok is the perfect swim stop: the water off the beach is usually calm and shallow, ideal for swimming and for children. You can snorkel along the rocks at the edges of the beach, although visibility in Phang Nga Bay is rarely as clear as at the islands in the open sea.",
        "For relaxing, find a spot in the shade of the trees at the edge of the beach – the boat also has a sunshade. The water is clearest at high tide and in the dry season.",
      ],
    },
  },
  "phi-phi-maya-bay-early-morning": {
    id: "snorkel-swim-phi-phi",
    h2: { de: "Schnorcheln & Baden rund um Phi Phi", en: "Snorkelling & swimming around Phi Phi" },
    body: {
      de: [
        "Da in Maya Bay nicht gebadet werden darf, verlagert sich das Schwimmen an andere Orte. Die Pileh Lagoon ist der Klassiker: Das Boot ankert im smaragdgrünen Becken, und Sie schwimmen direkt vom Boot zwischen den Felswänden. Früh morgens ist sie am ruhigsten.",
        "Gute Schnorchelspots finden Sie an den Felswänden von Phi Phi Leh und rund um Bamboo Island, wo flaches Wasser in tieferes Riff übergeht. An Bamboo Island können Sie zudem am weißen Strand entspannen – Schatten gibt es unter den Bäumen im Inselinneren.",
      ],
      en: [
        "Since swimming is not allowed at Maya Bay, the swimming happens elsewhere. Pileh Lagoon is the classic: the boat anchors in the emerald basin and you swim straight off the boat between the cliffs. It is calmest early in the morning.",
        "Good snorkel spots are along the cliffs of Phi Phi Leh and around Bamboo Island, where shallow water drops into deeper reef. At Bamboo Island you can also relax on the white beach – there is shade under the trees inland.",
      ],
    },
    list: {
      de: ["Riffschonende Sonnencreme und UV-Shirt", "Maske und Schnorchel für Phi Phi Leh", "Wasserdichte Tasche für die Überfahrt"],
      en: ["Reef-safe sunscreen and a rash guard", "Mask and snorkel for Phi Phi Leh", "A dry bag for the crossing"],
    },
  },
  "koh-rok-koh-haa": {
    id: "swim-relax-koh-rok",
    h2: { de: "Baden und Entspannen auf Koh Rok", en: "Swimming and relaxing on Koh Rok" },
    body: {
      de: [
        "Zwischen den Schnorchelgängen ist der lange Sandstrand von Koh Rok Nok ideal zum Baden und Ausruhen. Das Wasser ist flach und klar, Schatten gibt es unter den Bäumen am Strandrand. Wer Ruhe sucht, geht ein Stück vom Hauptankerplatz weg.",
      ],
      en: [
        "Between snorkels, the long sandy beach of Koh Rok Nok is perfect for swimming and resting. The water is shallow and clear, and there is shade under the trees at the edge of the beach. For more quiet, walk a little away from the main anchorage.",
      ],
    },
  },
  "james-bond-island-phang-nga-bay": {
    id: "swim-relax-phang-nga",
    h2: { de: "Baden & Entspannen in der Phang Nga Bucht", en: "Swimming & relaxing in Phang Nga Bay" },
    body: {
      de: [
        "An James Bond Island selbst wird kaum gebadet – der Strand ist klein und voller Boote. Für eine Badepause eignen sich ruhigere Inseln der Bucht wie Koh Nok oder ein Ankerplatz zwischen den Karstfelsen, an dem Sie direkt vom Boot ins warme, ruhige Wasser springen.",
        "Schnorcheln ist in der Phang Nga Bucht wegen der Sedimente aus den Mangroven weniger spektakulär als im offenen Meer. Wer Riffe sehen will, kombiniert die Bucht mit einem anderen Tag an Chicken Island oder Koh Rok. Zum Entspannen bietet das Boot Schatten, und auf Koh Panyee gibt es überdachte Restaurants.",
      ],
      en: [
        "There is little swimming at James Bond Island itself – the beach is small and full of boats. For a swim break, quieter islands in the bay such as Koh Nok work better, or an anchorage between the karst towers where you jump straight off the boat into warm, calm water.",
        "Snorkelling in Phang Nga Bay is less spectacular than in the open sea because of mangrove sediment. If you want reefs, combine the bay with another day at Chicken Island or Koh Rok. For relaxing, the boat has shade and Koh Panyee has covered restaurants.",
      ],
    },
  },
};
