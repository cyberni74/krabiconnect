import { createFileRoute } from "@tanstack/react-router";
import { LOGO_URL } from "@/components/secret-islands/content";
import { SecretIslandsPage } from "@/components/secret-islands/page";

export const Route = createFileRoute("/secret-islands")({
  head: () => ({
    meta: [
      { title: "Krabi Secret Islands – Private Speedboat-Touren für max. 5 Gäste" },
      {
        name: "description",
        content:
          "Ultra-private Speedboat-Charter in Krabi für max. 5 Gäste: geheime Inseln, Koh Roi, Koh Kudu, Hong Island, 4-Islands Sunset & 4K Drohnen-Paket. Jetzt Wunschtermin anfragen.",
      },
      { name: "theme-color", content: "#0a192f" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: LOGO_URL },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: SecretIslandsPage,
});
