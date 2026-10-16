import { useState } from "react";
import { normalizeCode, type NetStatus } from "@/lib/fight/net";
import { ArcadeButton, DISPLAY } from "./ui";

interface Props {
  code: string | null;
  role: "host" | "guest" | null;
  status: NetStatus | null;
  onCreate: () => void;
  onJoin: (code: string) => void;
  onBack: () => void;
}

const STATUS_TEXT: Record<NetStatus, string> = {
  connecting: "Verbinde…",
  waiting: "Warte auf Gegner…",
  connected: "Verbunden!",
  full: "Raum ist voll.",
  lost: "Verbindung verloren.",
};

export function OnlineLobby({ code, role, status, onCreate, onJoin, onBack }: Props) {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const link = code && typeof window !== "undefined" ? `${window.location.origin}/fight?room=${code}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-10">
      <button
        onClick={onBack}
        className="self-start rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-widest text-white/80 hover:bg-white/10"
      >
        ← Zurück
      </button>
      <h2 className="text-3xl text-white" style={DISPLAY}>
        Online 1 gegen 1
      </h2>

      {!code ? (
        <>
          <div className="rounded-xl border border-white/10 bg-black/50 p-5 backdrop-blur">
            <p className="mb-3 text-sm text-white/70">Erstelle einen Raum und schicke den Code an deinen Gegner.</p>
            <ArcadeButton onClick={onCreate} className="w-full">
              Raum erstellen
            </ArcadeButton>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/50 p-5 backdrop-blur">
            <p className="mb-3 text-sm text-white/70">Oder tritt mit einem Code bei:</p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const c = normalizeCode(input);
                if (c.length === 5) onJoin(c);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(normalizeCode(e.target.value))}
                placeholder="CODE"
                inputMode="text"
                autoCapitalize="characters"
                className="min-w-0 flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-center text-2xl tracking-[0.4em] text-white placeholder:text-white/25 focus:border-amber-300 focus:outline-none"
                style={DISPLAY}
                aria-label="Raum-Code"
              />
              <ArcadeButton type="submit" disabled={input.length !== 5}>
                Beitreten
              </ArcadeButton>
            </form>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-white/10 bg-black/50 p-6 text-center backdrop-blur">
          <p className="text-xs uppercase tracking-widest text-white/60">{role === "host" ? "Dein Raum-Code" : "Raum"}</p>
          <p className="my-2 text-5xl tracking-[0.25em] text-amber-300" style={DISPLAY}>
            {code}
          </p>
          {role === "host" && (
            <button onClick={copy} className="mb-3 text-xs text-sky-300 underline-offset-2 hover:underline">
              {copied ? "Link kopiert!" : "Einladungslink kopieren"}
            </button>
          )}
          <div className="flex items-center justify-center gap-2 text-sm text-white/80">
            {status !== "connected" && status !== "full" && status !== "lost" && (
              <span className="h-2 w-2 animate-ping rounded-full bg-amber-300" />
            )}
            <span>{status ? STATUS_TEXT[status] : "…"}</span>
          </div>
          {(status === "full" || status === "lost") && (
            <ArcadeButton tone="ghost" className="mt-4" onClick={onBack}>
              Zurück
            </ArcadeButton>
          )}
        </div>
      )}
      <p className="text-center text-xs text-white/45">
        Direkte Peer-to-Peer-Verbindung. Der Host berechnet den Kampf, beide sehen dasselbe Match.
      </p>
    </div>
  );
}
