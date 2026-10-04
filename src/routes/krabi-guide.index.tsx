import { createFileRoute } from "@tanstack/react-router";
import { LOGO_URL } from "@/components/secret-islands/content";
import { SITE_URL } from "@/components/krabi-guide/articles";
import { GuideHub } from "@/components/krabi-guide/guide-hub";

export const Route = createFileRoute("/krabi-guide/")({
  head: () => ({
    meta: [
      { title: "Krabi Insider Guide – Inseln, Geheimtipps & Reisewissen" },
      {
        name: "description",
        content:
          "Krabi Insider Guide: alle Inseln von Koh Poda bis Koh Roi, beste Reisezeit, Gezeiten, Schnorchelspots, Lagunen und Timing-Tipps lokaler Kapitäne aus Ao Nang.",
      },
      { name: "theme-color", content: "#0a192f" },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/krabi-guide` },
      { rel: "icon", type: "image/png", href: LOGO_URL },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: GuideHub,
});
