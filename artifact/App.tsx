import { useEffect, useRef, useState } from "react";
import { FightView } from "../src/components/fight/fight-view";
import { MoveList } from "../src/components/fight/move-list";
import { SelectScreen, type Mode } from "../src/components/fight/select-screen";
import { ArcadeButton, DISPLAY } from "../src/components/fight/ui";
import type { Difficulty } from "../src/lib/fight/ai";
import { Sfx } from "../src/lib/fight/audio";
import { CHARS, CHAR_IDS, STAGES, STAGE_IDS, spriteUrl, stageUrl, type CharId, type StageId } from "../src/lib/fight/data";
import type { NetMsg } from "../src/lib/fight/net";
import { preloadAll } from "../src/lib/fight/render";

type Screen = "title" | "select" | "fight";
type Match = { p1: CharId; p2: CharId; stage: StageId };

const DIFFS: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Leicht" },
  { id: "normal", label: "Normal" },
  { id: "hard", label: "Hart" },
];

export function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [mode, setMode] = useState<Mode>("local");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [match, setMatch] = useState<Match | null>(null);
  const [showMoves, setShowMoves] = useState(false);
  const [muted, setMuted] = useState(false);
  const netMessageRef = useRef<((m: NetMsg) => void) | null>(null);
  const sfx = useRef(new Sfx());

  useEffect(() => {
    void preloadAll();
    const unlock = () => sfx.current.unlock();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    sfx.current.muted = m;
  };

  const start = (m: Mode) => {
    sfx.current.unlock();
    setMode(m);
    setScreen("select");
  };

  const bg = match?.stage ?? "berlin";

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-zinc-950 text-white" style={{ fontFamily: `"Chakra Petch", ui-sans-serif, system-ui, sans-serif` }}>
      <div className="pointer-events-none fixed inset-0">
        <img src={stageUrl(bg)} alt="" className="h-full w-full scale-110 object-cover opacity-40 blur-md" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-4 py-3">
          <button onClick={() => screen !== "fight" && setScreen("title")} className="text-lg tracking-wide text-white" style={DISPLAY}>
            TIKTOK<span className="text-[#fe2c55]">FIGHT</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMoves(true)} className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-widest text-white/80 hover:bg-white/10">
              Moves
            </button>
            <button onClick={toggleMute} className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10" aria-label={muted ? "Ton an" : "Ton aus"}>
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-2 pb-4">
          {screen === "title" && (
            <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5 px-3 text-center">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-orange-300/80">Arcade Fighting</p>
                <h1 className="mt-1 text-5xl leading-[0.9] text-white sm:text-7xl" style={{ ...DISPLAY, textShadow: "-3px -2px 0 #25f4ee, 3px 2px 0 #fe2c55, 0 10px 0 rgba(0,0,0,0.5)" }}>
                  TIKTOK
                  <br />
                  FIGHT
                </h1>
                <p className="mt-3 text-sm text-white/70">Vier Kämpfer. Sechs deutsche Arenen. Supers, Parrys, Combos & Würfe.</p>
              </div>
              <div className="flex w-full flex-col gap-3">
                <ArcadeButton onClick={() => start("local")}>2 Spieler · Lokal</ArcadeButton>
                <div className="rounded-lg border border-white/10 bg-black/40 p-2 backdrop-blur">
                  <ArcadeButton tone="ghost" className="w-full" onClick={() => start("cpu")}>Gegen CPU</ArcadeButton>
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    {DIFFS.map((d) => (
                      <button key={d.id} onClick={() => setDifficulty(d.id)} className={`rounded px-2 py-1 text-xs ${difficulty === d.id ? "bg-orange-500 text-zinc-950" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowMoves(true)} className="text-xs uppercase tracking-widest text-white/50 hover:text-white">Steuerung & Mechaniken</button>
                <p className="text-[11px] text-white/40">Online-Modus gibt es nur in der vollen Version.</p>
              </div>
            </div>
          )}

          {screen === "select" && (
            <SelectScreen
              key={mode}
              mode={mode}
              net={null}
              netMessageRef={netMessageRef}
              onBack={() => setScreen("title")}
              onStart={(p1, p2, stage) => {
                setMatch({ p1, p2, stage });
                setScreen("fight");
              }}
            />
          )}

          {screen === "fight" && match && (
            <FightView
              key={`${match.p1}-${match.p2}-${match.stage}-${Date.now()}`}
              mode={mode}
              p1={match.p1}
              p2={match.p2}
              stage={match.stage}
              difficulty={difficulty}
              net={null}
              sfx={sfx.current}
              netMessageRef={netMessageRef}
              onExit={(to) => setScreen(to === "select" ? "select" : "title")}
            />
          )}
        </main>
      </div>

      {showMoves && <MoveList onClose={() => setShowMoves(false)} />}
    </div>
  );
}

// Keeps the imports used even if a screen is trimmed.
export const _unused = { CHARS, CHAR_IDS, STAGES, STAGE_IDS, spriteUrl };
