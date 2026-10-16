import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FightView } from "@/components/fight/fight-view";
import { MoveList } from "@/components/fight/move-list";
import { OnlineLobby } from "@/components/fight/online-lobby";
import { SelectScreen, type Mode } from "@/components/fight/select-screen";
import { ArcadeButton, DISPLAY } from "@/components/fight/ui";
import type { Difficulty } from "@/lib/fight/ai";
import { Sfx } from "@/lib/fight/audio";
import { CHARS, CHAR_IDS, stageUrl, spriteUrl, type CharId, type StageId } from "@/lib/fight/data";
import { FightNet, makeRoomCode, normalizeCode, type NetMsg, type NetStatus } from "@/lib/fight/net";
import { preloadAll } from "@/lib/fight/render";
import { cn } from "@/lib/utils";

type Screen = "title" | "lobby" | "select" | "fight";

export const Route = createFileRoute("/fight")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { room?: string } => {
    const room = typeof search.room === "string" ? normalizeCode(search.room) : "";
    return room.length === 5 ? { room } : {};
  },
  head: () => ({
    meta: [
      { title: "TikTok Fight – 2-Spieler-Fighting-Game" },
      { name: "theme-color", content: "#09090b" },
      {
        name: "description",
        content:
          "Arcade-Kampfspiel für zwei: lokal, gegen die CPU oder online. Vier Kämpfer, Supers, Parrys, Combos und Würfe.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bungee&family=Chakra+Petch:wght@400;600&display=swap",
      },
    ],
  }),
  component: FightPage,
});

const DIFFS: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Leicht" },
  { id: "normal", label: "Normal" },
  { id: "hard", label: "Hart" },
];

function readPref<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function writePref(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    // Storage unavailable (private mode) — preference just isn't remembered.
  }
}

function FightPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/fight" });
  const [screen, setScreen] = useState<Screen>("title");
  const [mode, setMode] = useState<Mode>("local");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [match, setMatch] = useState<{ p1: CharId; p2: CharId; stage: StageId } | null>(null);
  const [showMoves, setShowMoves] = useState(false);
  const [muted, setMuted] = useState(false);
  const [net, setNet] = useState<FightNet | null>(null);
  const [netStatus, setNetStatus] = useState<NetStatus | null>(null);
  const netMessageRef = useRef<((m: NetMsg) => void) | null>(null);
  const sfxRef = useRef<Sfx>(new Sfx());
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    setDifficulty(readPref<Difficulty>("kclash.diff", "normal", ["easy", "normal", "hard"]));
    const m = readPref("kclash.muted", "0", ["0", "1"]) === "1";
    setMuted(m);
    sfxRef.current.muted = m;
    void preloadAll();
  }, []);

  // Unlock audio on the first gesture (browser autoplay rules).
  useEffect(() => {
    const unlock = () => sfxRef.current.unlock();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Closing happens in the effect below whenever `net` is replaced or cleared.
  const closeNet = useCallback(() => {
    setNet(null);
    setNetStatus(null);
  }, []);

  useEffect(() => () => net?.close(), [net]);

  const openNet = useCallback(
    (code: string, role: "host" | "guest") => {
      const n = new FightNet(code, role, {
        onStatus: (s) => {
          setNetStatus(s);
          if (s === "connected" && screenRef.current === "lobby") setScreen("select");
          if (s === "lost" && screenRef.current !== "lobby" && screenRef.current !== "title") {
            toast.error("Verbindung zum Gegner verloren.");
            setScreen("lobby");
          }
        },
        onMessage: (m) => {
          if (m.t === "bye") {
            toast("Dein Gegner hat das Spiel verlassen.");
            setScreen("lobby");
            return;
          }
          if (m.t === "toSelect") {
            setScreen("select");
            return;
          }
          // A guest that missed the start message still joins on the first snapshot.
          if (m.t === "snap" && screenRef.current === "select") {
            setMatch({ p1: m.s.f[0].char, p2: m.s.f[1].char, stage: m.s.stage });
            setScreen("fight");
          }
          netMessageRef.current?.(m);
        },
      });
      setMode("online");
      setNet(n);
      setNetStatus("connecting");
      setScreen("lobby");
      void n.join();
    },
    [],
  );

  // Invite link: /fight?room=CODE joins as guest.
  const autoJoined = useRef(false);
  useEffect(() => {
    if (autoJoined.current || !search.room) return;
    autoJoined.current = true;
    openNet(search.room, "guest");
    void navigate({ search: {}, replace: true });
  }, [search.room, openNet, navigate]);

  const startMode = (m: Mode) => {
    sfxRef.current.unlock();
    if (m === "online") {
      setMode("online");
      setScreen("lobby");
      return;
    }
    closeNet();
    setMode(m);
    setScreen("select");
  };

  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    sfxRef.current.muted = m;
    writePref("kclash.muted", m ? "1" : "0");
  };

  const exitFight = (to: "select" | "title") => {
    if (mode === "online") {
      if (to === "select") {
        net?.send({ t: "toSelect" });
        setScreen("select");
      } else {
        closeNet();
        setScreen("title");
      }
      return;
    }
    setScreen(to);
  };

  const bg = match?.stage ?? "berlin";

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-zinc-950 text-white" style={{ fontFamily: `"Chakra Petch", ui-sans-serif, system-ui, sans-serif` }}>
      <div className="pointer-events-none fixed inset-0">
        <img src={stageUrl(bg)} alt="" className="h-full w-full scale-110 object-cover opacity-40 blur-md" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header
          className={cn(
            "flex items-center justify-between px-4 py-3",
            screen === "fight" && "[@media(max-height:500px)]:hidden",
          )}
        >
          <button
            onClick={() => {
              if (screen === "fight") return;
              closeNet();
              setScreen("title");
            }}
            className="text-lg tracking-wide text-white"
            style={DISPLAY}
          >
            TIKTOK<span className="text-[#fe2c55]">FIGHT</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMoves(true)}
              className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-widest text-white/80 hover:bg-white/10"
            >
              Moves
            </button>
            <button
              onClick={toggleMute}
              className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-widest text-white/80 hover:bg-white/10"
              aria-label={muted ? "Ton an" : "Ton aus"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-2 pb-4">
          {screen === "title" && (
            <TitleScreen
              difficulty={difficulty}
              onDifficulty={(d) => {
                setDifficulty(d);
                writePref("kclash.diff", d);
              }}
              onMode={startMode}
              onMoves={() => setShowMoves(true)}
            />
          )}

          {screen === "lobby" && (
            <OnlineLobby
              code={net?.code ?? null}
              role={net?.role ?? null}
              status={netStatus}
              onCreate={() => openNet(makeRoomCode(), "host")}
              onJoin={(c) => openNet(c, "guest")}
              onBack={() => {
                closeNet();
                setScreen("title");
              }}
            />
          )}

          {screen === "select" && (
            <SelectScreen
              key={`${mode}-${net?.code ?? ""}`}
              mode={mode}
              net={net}
              initial={match ?? undefined}
              netMessageRef={netMessageRef}
              onBack={() => {
                if (mode === "online") closeNet();
                setScreen("title");
              }}
              onStart={(p1, p2, stage) => {
                setMatch({ p1, p2, stage });
                setScreen("fight");
              }}
            />
          )}

          {screen === "fight" && match && (
            <FightView
              key={`${match.p1}-${match.p2}-${match.stage}`}
              mode={mode}
              p1={match.p1}
              p2={match.p2}
              stage={match.stage}
              difficulty={difficulty}
              net={net}
              sfx={sfxRef.current}
              netMessageRef={netMessageRef}
              onExit={exitFight}
            />
          )}
        </main>
      </div>

      {showMoves && <MoveList onClose={() => setShowMoves(false)} />}
    </div>
  );
}

function TitleScreen({
  difficulty,
  onDifficulty,
  onMode,
  onMoves,
}: {
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
  onMode: (m: Mode) => void;
  onMoves: () => void;
}) {
  const [hero, setHero] = useState<[CharId, CharId]>(["king", "queen"]);
  useEffect(() => {
    const iv = setInterval(() => {
      setHero(() => {
        const a = CHAR_IDS[Math.floor(Math.random() * 4)];
        let b = CHAR_IDS[Math.floor(Math.random() * 4)];
        while (b === a) b = CHAR_IDS[Math.floor(Math.random() * 4)];
        return [a, b];
      });
    }, 3500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative mx-auto grid w-full max-w-6xl items-center gap-6 px-3 md:grid-cols-[1fr_minmax(320px,420px)_1fr]">
      <HeroArt char={hero[0]} side="left" />
      <div className="flex flex-col items-center gap-5 text-center">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-orange-300/80">Arcade Fighting</p>
          <h1
            className="mt-1 text-5xl leading-[0.9] text-white sm:text-7xl"
            style={{ ...DISPLAY, textShadow: "-3px -2px 0 #25f4ee, 3px 2px 0 #fe2c55, 0 10px 0 rgba(0,0,0,0.5)" }}
          >
            TIKTOK
            <br />
            FIGHT
          </h1>
          <p className="mt-3 text-sm text-white/70">Vier Kämpfer. Sechs deutsche Arenen. Supers, Parrys, Combos & Würfe.</p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <ArcadeButton onClick={() => onMode("local")}>2 Spieler · Lokal</ArcadeButton>
          <div className="rounded-lg border border-white/10 bg-black/40 p-2 backdrop-blur">
            <ArcadeButton tone="ghost" className="w-full" onClick={() => onMode("cpu")}>
              Gegen CPU
            </ArcadeButton>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {DIFFS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onDifficulty(d.id)}
                  className={cn(
                    "rounded px-2 py-1 text-xs transition-colors",
                    difficulty === d.id ? "bg-orange-500 text-zinc-950" : "bg-white/5 text-white/70 hover:bg-white/10",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <ArcadeButton tone="ghost" onClick={() => onMode("online")}>
            Online · 1 gegen 1
          </ArcadeButton>
          <button onClick={onMoves} className="text-xs uppercase tracking-widest text-white/50 hover:text-white">
            Steuerung & Mechaniken
          </button>
        </div>
      </div>
      <HeroArt char={hero[1]} side="right" />
    </div>
  );
}

function HeroArt({ char, side }: { char: CharId; side: "left" | "right" }) {
  const c = CHARS[char];
  return (
    <div className="relative hidden h-[460px] md:block">
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 65%, ${c.color}44, transparent 60%)` }} />
      <img
        key={char}
        src={spriteUrl(char, "idle")}
        alt={c.name}
        className={cn(
          "absolute bottom-0 left-1/2 h-full max-w-none -translate-x-1/2 animate-[fadeIn_.4s_ease-out] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.7)]",
          side === "right" && "-scale-x-100",
        )}
        draggable={false}
      />
      <p className={cn("absolute bottom-2 text-2xl text-white/90", side === "left" ? "left-2" : "right-2")} style={DISPLAY}>
        {c.name}
      </p>
    </div>
  );
}
