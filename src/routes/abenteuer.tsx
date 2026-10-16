import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdventureView } from "@/components/adventure/adventure-view";

export const Route = createFileRoute("/abenteuer")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Rabenschwur" },
      { name: "theme-color", content: "#050404" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "description", content: "Rabenschwur: ein düsteres Point-&-Click-Ritterabenteuer im dunklen Mittelalter. Löse Rätsel, bestehe die Prüfungen und werde Ritter." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,400;0,600;1,400&family=Pirata+One&display=swap",
      },
    ],
  }),
  component: AdventurePage,
});

/** Points the installable-app metadata at the game, so "Add to Home Screen" opens it fullscreen and in landscape. */
function useGameAppMeta() {
  useEffect(() => {
    const setLink = (rel: string, href: string) => {
      let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
    };
    const setMeta = (name: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setLink("manifest", "/game/manifest.webmanifest");
    setLink("apple-touch-icon", "/game/icon-180.png");
    setMeta("apple-mobile-web-app-title", "Rabenschwur");
    setMeta("apple-mobile-web-app-capable", "yes");
    setMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
  }, []);
}

function AdventurePage() {
  useGameAppMeta();
  return (
    <main className="min-h-dvh select-none bg-[radial-gradient(ellipse_at_top,#1a1210_0%,#050404_60%)]" style={{ overscrollBehavior: "none", WebkitTapHighlightColor: "transparent" }}>
      <AdventureView />
    </main>
  );
}
