import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { GameView } from "@/components/game/game-view";

export const Route = createFileRoute("/abenteuer")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Die Gezeiten von Krabbenbucht" },
      { name: "theme-color", content: "#0b0806" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "description", content: "Ein Point-&-Click-Piratenabenteuer in drei Kapiteln: Reimduelle, eine Meerhexe, verschwundene Flut und eine Höhle bei Ebbe." },
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
    setMeta("apple-mobile-web-app-title", "Krabbenbucht");
    setMeta("apple-mobile-web-app-capable", "yes");
    setMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
  }, []);
}

function AdventurePage() {
  useGameAppMeta();
  return (
    <main className="min-h-dvh select-none bg-[radial-gradient(ellipse_at_top,#2a1a10_0%,#0b0806_60%)]" style={{ overscrollBehavior: "none", WebkitTapHighlightColor: "transparent" }}>
      <GameView />
    </main>
  );
}
