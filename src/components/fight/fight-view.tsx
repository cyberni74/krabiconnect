import { useEffect, useRef, useState } from "react";
import { FightAI, type Difficulty } from "@/lib/fight/ai";
import type { Sfx } from "@/lib/fight/audio";
import { CHARS, spriteUrl, type CharId, type StageId } from "@/lib/fight/data";
import { IN, VIEW_H, VIEW_W, createGame, step, type GameState } from "@/lib/fight/engine";
import { InputHub } from "@/lib/fight/input";
import type { FightNet, NetMsg } from "@/lib/fight/net";
import { createRenderState, preload, processEvents, render } from "@/lib/fight/render";
import { cn } from "@/lib/utils";
import type { Mode } from "./select-screen";
import { ArcadeButton, DISPLAY, Kbd } from "./ui";

interface Props {
  mode: Mode;
  p1: CharId;
  p2: CharId;
  stage: StageId;
  difficulty: Difficulty;
  net: FightNet | null;
  sfx: Sfx;
  netMessageRef: React.MutableRefObject<((m: NetMsg) => void) | null>;
  onExit: (to: "select" | "title") => void;
}

const STEP_MS = 1000 / 60;

export function FightView({ mode, p1, p2, stage, difficulty, net, sfx, netMessageRef, onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<InputHub | null>(null);
  const gameRef = useRef<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;
  const [matchWinner, setMatchWinner] = useState<0 | 1 | -1 | null>(null);
  const [round, setRound] = useState(0);
  const [touch, setTouch] = useState(false);
  const isGuest = mode === "online" && net?.role === "guest";
  const localSlot: 0 | 1 = isGuest ? 1 : 0;

  useEffect(() => {
    setTouch(typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0));
  }, []);

  useEffect(() => {
    let alive = true;
    void preload([p1, p2], stage).then(() => {
      if (alive) setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [p1, p2, stage]);

  // Main loop.
  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const hub = new InputHub();
    hub.merged = mode !== "local";
    hub.attach();
    hubRef.current = hub;

    gameRef.current = createGame(p1, p2, stage);
    const labels: [string, string] =
      mode === "cpu" ? ["DU", "CPU"] : mode === "online" ? (isGuest ? ["GEGNER", "DU"] : ["DU", "GEGNER"]) : ["P1", "P2"];
    const rs = createRenderState(labels);
    const ai = mode === "cpu" ? new FightAI(1, difficulty) : null;
    let remoteInput = 0;
    let lastSnapAt = performance.now();
    let lastRound = 0;
    let shownWinner: 0 | 1 | -1 | null = null;

    netMessageRef.current = (m) => {
      if (m.t === "in" && !isGuest) remoteInput = m.b;
      // Guest asked for a rematch: the host restarts, snapshots follow.
      if (m.t === "rematch" && !isGuest && gameRef.current?.phase === "matchEnd") {
        gameRef.current = createGame(p1, p2, stage);
      }
      if (m.t === "snap" && isGuest) {
        gameRef.current = m.s;
        lastSnapAt = performance.now();
        processEvents(rs, m.s, m.s.events);
        for (const e of m.s.events) sfx.play(e);
      }
    };

    const resize = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = wrap.clientWidth;
      const h = (w * VIEW_H) / VIEW_W;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform((w * dpr) / VIEW_W, 0, 0, (h * dpr) / VIEW_H, 0, 0);
      ctx.imageSmoothingQuality = "high";
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);

    let raf = 0;
    let acc = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(100, now - last);
      last = now;
      const g = gameRef.current;
      if (!g) return;

      if (isGuest) {
        net?.stream({ t: "in", b: hub.read(0) });
      } else if (!pausedRef.current) {
        acc += dt;
        let steps = 0;
        while (acc >= STEP_MS && steps < 4) {
          acc -= STEP_MS;
          steps++;
          const i0 = hub.read(0);
          const i1 = mode === "cpu" && ai ? ai.input(g) : mode === "online" ? remoteInput : hub.read(1);
          step(g, [i0, i1]);
          processEvents(rs, g, g.events);
          for (const e of g.events) sfx.play(e);
          if (mode === "online") net?.stream({ t: "snap", s: g });
        }
      } else {
        acc = 0;
      }

      render(ctx, g, rs, now);
      if (isGuest && now - lastSnapAt > 1500) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, VIEW_H / 2 - 30, VIEW_W, 60);
        ctx.fillStyle = "#fff";
        ctx.font = `22px "Bungee", sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("Verbindung wird gesucht…", VIEW_W / 2, VIEW_H / 2 + 8);
      }

      if (g.round !== lastRound) {
        lastRound = g.round;
        setRound(g.round);
      }
      if (g.phase === "matchEnd" && shownWinner === null && g.phaseT > 20) {
        shownWinner = g.matchWinner ?? -1;
        setMatchWinner(shownWinner);
      } else if (g.phase !== "matchEnd" && shownWinner !== null) {
        shownWinner = null;
        setMatchWinner(null);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      hub.detach();
      hubRef.current = null;
      netMessageRef.current = null;
    };
  }, [loaded, mode, p1, p2, stage, difficulty, net, isGuest, sfx, netMessageRef]);

  // Pause (not online).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape" || e.code === "KeyP") {
        if (mode === "online") {
          if (e.code === "Escape") setPaused((p) => !p);
          return;
        }
        if (gameRef.current?.phase !== "matchEnd") setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const rematch = () => {
    if (isGuest) {
      net?.send({ t: "rematch" });
      return;
    }
    gameRef.current = createGame(p1, p2, stage);
    setMatchWinner(null);
    setPaused(false);
    if (mode === "online") net?.send({ t: "rematch" });
  };

  const winnerChar = matchWinner === 0 ? p1 : matchWinner === 1 ? p2 : null;
  const youWon = mode !== "local" && matchWinner === localSlot;

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div
        ref={wrapRef}
        className="relative w-full max-w-[min(100%,calc((100dvh-24px)*16/9))] overflow-hidden rounded-xl border border-white/10 bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
      >
        <canvas ref={canvasRef} className="block touch-none select-none" />
        {!loaded && (
          <div className="absolute inset-0 flex aspect-video w-full items-center justify-center bg-zinc-950 text-white" style={DISPLAY}>
            Lade Arena…
          </div>
        )}

        <button
          onClick={() => setPaused(true)}
          className="absolute left-1/2 top-[13%] -translate-x-1/2 rounded bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white/60 hover:text-white sm:hidden"
        >
          Pause
        </button>

        {touch && loaded && <TouchPad hubRef={hubRef} overlay />}

        {paused && matchWinner === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
            <h3 className="text-3xl text-white sm:text-5xl" style={DISPLAY}>
              {mode === "online" ? "MENÜ" : "PAUSE"}
            </h3>
            {mode === "online" && <p className="text-xs text-white/60">Das Spiel läuft online weiter.</p>}
            <div className="flex flex-col gap-2 sm:flex-row">
              <ArcadeButton onClick={() => setPaused(false)}>Weiter</ArcadeButton>
              {mode !== "online" && (
                <ArcadeButton tone="ghost" onClick={rematch}>
                  Neustart
                </ArcadeButton>
              )}
              {mode !== "online" && (
                <ArcadeButton tone="ghost" onClick={() => onExit("select")}>
                  Charakterwahl
                </ArcadeButton>
              )}
              <ArcadeButton tone="danger" onClick={() => onExit("title")}>
                {mode === "online" ? "Verlassen" : "Hauptmenü"}
              </ArcadeButton>
            </div>
          </div>
        )}

        {matchWinner !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <div className="flex w-full max-w-xl flex-col items-center gap-3 px-4 text-center">
              {winnerChar && (
                <img src={spriteUrl(winnerChar, "special")} alt="" className="h-24 object-contain drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] sm:h-40" />
              )}
              <h3 className="text-3xl leading-none text-white sm:text-5xl" style={DISPLAY}>
                {matchWinner === -1 ? "UNENTSCHIEDEN" : mode === "local" ? `P${matchWinner + 1} GEWINNT` : youWon ? "SIEG!" : "NIEDERLAGE"}
              </h3>
              {winnerChar && (
                <p className="text-sm text-amber-300" style={DISPLAY}>
                  {CHARS[winnerChar].name} – {CHARS[winnerChar].title}
                </p>
              )}
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <ArcadeButton onClick={rematch}>{isGuest ? "Revanche anfragen" : "Revanche"}</ArcadeButton>
                <ArcadeButton tone="ghost" onClick={() => onExit("select")}>
                  Charakterwahl
                </ArcadeButton>
                <ArcadeButton tone="ghost" onClick={() => onExit("title")}>
                  Menü
                </ArcadeButton>
              </div>
            </div>
          </div>
        )}
      </div>


      {touch && <TouchPad hubRef={hubRef} />}

      {!touch && (
        <div className="flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-2 text-[11px] text-white/55">
          {mode === "local" ? (
            <>
              <span>
                P1 <Kbd>WASD</Kbd> · <Kbd>F</Kbd> Schlag <Kbd>G</Kbd> Kick <Kbd>H</Kbd> Spezial
              </span>
              <span>
                P2 <Kbd>Pfeile</Kbd> · <Kbd>K</Kbd> Schlag <Kbd>L</Kbd> Kick <Kbd>Ö</Kbd> Spezial
              </span>
            </>
          ) : (
            <span>
              <Kbd>WASD</Kbd>/<Kbd>Pfeile</Kbd> · <Kbd>F</Kbd>/<Kbd>K</Kbd> Schlag · <Kbd>G</Kbd>/<Kbd>L</Kbd> Kick · <Kbd>H</Kbd>/<Kbd>Ö</Kbd> Spezial
            </span>
          )}
          <span>
            <Kbd>Esc</Kbd> Pause · Runde {round || 1}
          </span>
        </div>
      )}
    </div>
  );
}

function TouchPad({ hubRef, overlay = false }: { hubRef: React.MutableRefObject<InputHub | null>; overlay?: boolean }) {
  const set = (bit: number, on: boolean) => {
    const hub = hubRef.current;
    if (!hub) return;
    hub.touch = on ? hub.touch | bit : hub.touch & ~bit;
  };
  const Btn = ({ bit, label, className }: { bit: number; label: string; className?: string }) => (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        set(bit, true);
      }}
      onPointerUp={() => set(bit, false)}
      onPointerCancel={() => set(bit, false)}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "flex select-none items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur active:scale-95 active:bg-white/30",
        className,
      )}
      style={DISPLAY}
    >
      {label}
    </button>
  );
  return (
    <div
      className={cn(
        "w-full touch-none items-center justify-between",
        overlay
          ? "pointer-events-none absolute inset-x-0 bottom-[12%] hidden px-2 opacity-70 landscape:flex [&_button]:pointer-events-auto"
          : "flex max-w-3xl px-3 pb-3 landscape:hidden",
      )}
    >
      <div className="grid grid-cols-3 grid-rows-3 gap-1">
        <span />
        <Btn bit={IN.U} label="▲" className="h-12 w-12 rounded-lg text-sm" />
        <span />
        <Btn bit={IN.L} label="◀" className="h-12 w-12 rounded-lg text-sm" />
        <Btn bit={IN.D} label="▼" className="h-12 w-12 rounded-lg text-sm" />
        <Btn bit={IN.R} label="▶" className="h-12 w-12 rounded-lg text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Btn bit={IN.P} label="P" className="h-14 w-14 bg-rose-500/30 text-lg" />
        <Btn bit={IN.K} label="K" className="h-14 w-14 bg-sky-500/30 text-lg" />
        <Btn bit={IN.S} label="S" className="h-14 w-14 bg-amber-500/30 text-lg" />
        <Btn bit={IN.P | IN.K} label="P+K" className="h-14 w-14 text-xs" />
      </div>
    </div>
  );
}
