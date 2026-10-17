import { createRoot } from "react-dom/client";
import "./entry.css";
import { AdventureView } from "@/components/adventure/adventure-view";

createRoot(document.getElementById("root")!).render(
  <main className="min-h-dvh select-none bg-[radial-gradient(ellipse_at_top,#1a1210_0%,#050404_60%)]" style={{ overscrollBehavior: "none", WebkitTapHighlightColor: "transparent" }}>
    <AdventureView />
  </main>,
);
