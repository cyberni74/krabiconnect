import { createFileRoute } from "@tanstack/react-router";
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
      { name: "description", content: "Ein Point-&-Click-Piratenabenteuer in zwei Kapiteln – mit Reimduellen, einer Meerhexe und verschwundener Flut." },
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

function AdventurePage() {
  return (
    <main className="min-h-dvh select-none bg-[radial-gradient(ellipse_at_top,#2a1a10_0%,#0b0806_60%)]" style={{ overscrollBehavior: "none", WebkitTapHighlightColor: "transparent" }}>
      <GameView />
    </main>
  );
}
