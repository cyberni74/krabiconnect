import { useCallback, useEffect, useRef, useState } from "react";
import { CHARS, CHAR_IDS, STAGES, STAGE_IDS, spriteUrl, stageUrl, type CharId, type StageId } from "@/lib/fight/data";
import type { FightNet, NetMsg } from "@/lib/fight/net";
import { cn } from "@/lib/utils";
import { ArcadeButton, DISPLAY, Kbd, StatBar } from "./ui";

export type Mode = "local" | "cpu" | "online";

interface Props {
  mode: Mode;
  net: FightNet | null;
  initial?: { p1: CharId; p2: CharId; stage: StageId };
  onStart: (p1: CharId, p2: CharId, stage: StageId) => void;
  onBack: () => void;
  /** Online: messages from the peer are forwarded here while this screen is up. */
  netMessageRef: React.MutableRefObject<((m: NetMsg) => void) | null>;
}

const KEYMAP: [Record<string, "l" | "r" | "ok" | "back">, Record<string, "l" | "r" | "ok" | "back">] = [
  { KeyA: "l", KeyD: "r", KeyF: "ok", KeyC: "ok", KeyG: "back", KeyV: "back" },
  {
    ArrowLeft: "l",
    ArrowRight: "r",
    KeyK: "ok",
    Numpad1: "ok",
    Comma: "ok",
    KeyL: "back",
    Numpad2: "back",
    Period: "back",
  },
];

const idx = (c: CharId) => CHAR_IDS.indexOf(c);

export function SelectScreen({ mode, net, initial, onStart, onBack, netMessageRef }: Props) {
  const localSlot: 0 | 1 = mode === "online" && net?.role === "guest" ? 1 : 0;
  const [cursor, setCursor] = useState<[number, number]>([
    initial ? idx(initial.p1) : 0,
    initial ? idx(initial.p2) : 1,
  ]);
  const [ready, setReady] = useState<[boolean, boolean]>([false, false]);
  const [stageIdx, setStageIdx] = useState(initial ? STAGE_IDS.indexOf(initial.stage) : 0);
  const [stageLocked, setStageLocked] = useState(false);
  const bothReady = ready[0] && ready[1];
  const stageChooser = mode === "online" ? net?.role === "host" : true;

  const stateRef = useRef({ cursor, ready, stageIdx, bothReady, stageLocked });
  stateRef.current = { cursor, ready, stageIdx, bothReady, stageLocked };

  const startedRef = useRef(false);
  const start = useCallback(
    (si: number) => {
      if (startedRef.current) return;
      startedRef.current = true;
      const s = stateRef.current;
      const stage = STAGE_IDS[si] ?? "berlin";
      const p1 = CHAR_IDS[s.cursor[0]];
      const p2 = CHAR_IDS[s.cursor[1]];
      if (mode === "online" && net?.role === "host") net.send({ t: "start", p1, p2, stage });
      onStart(p1, p2, stage);
    },
    [mode, net, onStart],
  );

  const act = useCallback(
    (slot: 0 | 1, a: "l" | "r" | "ok" | "back") => {
      const s = stateRef.current;
      if (s.bothReady) {
        if (!stageChooser || slot !== localSlot || s.stageLocked) {
          if (a === "back" && slot === localSlot && !s.stageLocked) {
            setReady((r) => {
              const n: [boolean, boolean] = [...r];
              n[slot] = false;
              return n;
            });
          }
          return;
        }
        if (a === "l") setStageIdx((i) => (i + STAGE_IDS.length) % (STAGE_IDS.length + 1));
        if (a === "r") setStageIdx((i) => (i + 1) % (STAGE_IDS.length + 1));
        if (a === "ok") {
          const si = s.stageIdx === STAGE_IDS.length ? Math.floor(Math.random() * STAGE_IDS.length) : s.stageIdx;
          setStageIdx(si);
          setStageLocked(true);
          setTimeout(() => start(si), 450);
        }
        if (a === "back") {
          setReady((r) => {
            const n: [boolean, boolean] = [...r];
            n[slot] = false;
            return n;
          });
        }
        return;
      }
      if (a === "back") {
        if (s.ready[slot]) {
          setReady((r) => {
            const n: [boolean, boolean] = [...r];
            n[slot] = false;
            return n;
          });
        } else if (slot === localSlot) onBack();
        return;
      }
      if (s.ready[slot]) return;
      if (a === "ok") {
        setReady((r) => {
          const n: [boolean, boolean] = [...r];
          n[slot] = true;
          return n;
        });
        return;
      }
      setCursor((c) => {
        const n: [number, number] = [...c];
        n[slot] = (n[slot] + (a === "r" ? 1 : CHAR_IDS.length - 1)) % CHAR_IDS.length;
        return n;
      });
    },
    [localSlot, onBack, stageChooser, start],
  );

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === "Escape") {
        onBack();
        return;
      }
      if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        act(localSlot, "ok");
        return;
      }
      for (const slot of [0, 1] as const) {
        const a = KEYMAP[slot][e.code];
        if (!a) continue;
        e.preventDefault();
        // Single human modes: every key drives the local slot.
        if (mode === "local") act(slot, a);
        else act(localSlot, a);
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act, localSlot, mode, onBack]);

  // CPU picks a fighter once the player is ready.
  useEffect(() => {
    if (mode !== "cpu" || !ready[0] || ready[1]) return;
    let spins = 0;
    const iv = setInterval(() => {
      spins++;
      setCursor((c) => [c[0], (c[1] + 1) % CHAR_IDS.length]);
      if (spins > 8 + Math.floor(Math.random() * 6)) {
        clearInterval(iv);
        setReady([true, true]);
      }
    }, 90);
    return () => clearInterval(iv);
  }, [mode, ready]);

  // Online: sync our cursor/ready/stage to the peer, apply theirs.
  useEffect(() => {
    if (mode !== "online" || !net) return;
    const sync = () => {
      const s = stateRef.current;
      net.send({
        t: "sel",
        char: CHAR_IDS[s.cursor[localSlot]],
        ready: s.ready[localSlot],
        stage: net.role === "host" ? STAGE_IDS[Math.min(s.stageIdx, STAGE_IDS.length - 1)] : undefined,
      });
    };
    sync();
    const iv = setInterval(sync, 400);
    return () => clearInterval(iv);
  }, [mode, net, localSlot, cursor, ready, stageIdx]);

  useEffect(() => {
    if (mode !== "online") return;
    netMessageRef.current = (m) => {
      const remote: 0 | 1 = localSlot === 0 ? 1 : 0;
      if (m.t === "sel") {
        setCursor((c) => {
          const n: [number, number] = [...c];
          n[remote] = idx(m.char);
          return n;
        });
        setReady((r) => {
          if (r[remote] === m.ready) return r;
          const n: [boolean, boolean] = [...r];
          n[remote] = m.ready;
          return n;
        });
        if (m.stage) setStageIdx(STAGE_IDS.indexOf(m.stage));
      } else if (m.t === "start" && !startedRef.current) {
        startedRef.current = true;
        onStart(m.p1, m.p2, m.stage);
      }
    };
    return () => {
      netMessageRef.current = null;
    };
  }, [mode, localSlot, netMessageRef, onStart]);

  const clickCard = (i: number) => {
    const s = stateRef.current;
    let slot: 0 | 1 = localSlot;
    if (mode === "local" && s.ready[0]) slot = 1;
    if (s.ready[slot] || s.bothReady) return;
    setCursor((c) => {
      const n: [number, number] = [...c];
      n[slot] = i;
      return n;
    });
    if (s.cursor[slot] === i) act(slot, "ok");
  };

  const labels: [string, string] =
    mode === "cpu"
      ? ["DU", "CPU"]
      : mode === "online"
        ? localSlot === 0
          ? ["DU", "GEGNER"]
          : ["GEGNER", "DU"]
        : ["P1", "P2"];

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:py-8">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-widest text-white/80 hover:bg-white/10"
        >
          ← Zurück
        </button>
        <h2 className="text-center text-xl text-white sm:text-3xl" style={DISPLAY}>
          {bothReady ? "Wähle die Arena" : "Wähle deinen Kämpfer"}
        </h2>
        <span className="w-[74px]" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <Preview slot={0} char={CHAR_IDS[cursor[0]]} ready={ready[0]} label={labels[0]} />
        <div className="order-last col-span-2 grid grid-cols-4 gap-2 self-center md:order-none md:col-span-1 md:w-[420px]">
          {CHAR_IDS.map((c, i) => {
            const d = CHARS[c];
            const p1 = cursor[0] === i;
            const p2 = cursor[1] === i;
            return (
              <button
                key={c}
                onClick={() => clickCard(i)}
                className={cn(
                  "relative aspect-[3/4] overflow-hidden rounded-lg border-2 bg-gradient-to-b from-zinc-800 to-zinc-950 transition-transform",
                  p1 && p2 ? "border-fuchsia-400" : p1 ? "border-rose-500" : p2 ? "border-sky-400" : "border-white/10",
                  (p1 || p2) && "scale-[1.04]",
                )}
                aria-label={d.name}
              >
                <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 50% 30%, ${d.color}55, transparent 70%)` }} />
                <img src={spriteUrl(c, "idle")} alt="" className="absolute inset-x-0 bottom-0 mx-auto h-[115%] max-w-none object-contain object-top" style={{ objectPosition: "50% 0%" }} draggable={false} />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent pb-1 pt-4 text-center text-[11px] text-white sm:text-xs" style={DISPLAY}>
                  {d.name}
                </span>
                {p1 && <span className="absolute left-1 top-1 rounded bg-rose-500 px-1 text-[10px] font-bold text-white">{labels[0]}</span>}
                {p2 && <span className="absolute right-1 top-1 rounded bg-sky-500 px-1 text-[10px] font-bold text-white">{labels[1]}</span>}
              </button>
            );
          })}
        </div>
        <Preview slot={1} char={CHAR_IDS[cursor[1]]} ready={ready[1]} label={labels[1]} />
      </div>

      {bothReady && (
        <div className="rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {[...STAGE_IDS, "random" as const].map((st, i) => {
              const sel = stageIdx === i;
              return (
                <button
                  key={st}
                  disabled={!stageChooser || stageLocked}
                  onClick={() => {
                    if (sel) act(localSlot, "ok");
                    else setStageIdx(i);
                  }}
                  className={cn(
                    "relative aspect-video overflow-hidden rounded-lg border-2 transition-transform disabled:cursor-default",
                    sel ? "scale-[1.03] border-amber-300" : "border-white/10 opacity-70",
                  )}
                >
                  {st === "random" ? (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900 text-3xl text-white" style={DISPLAY}>
                      ?
                    </div>
                  ) : (
                    <img src={stageUrl(st)} alt="" className="h-full w-full object-cover" />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 pb-1 pt-4 text-left text-[11px] text-white" style={DISPLAY}>
                    {st === "random" ? "Zufall" : `${STAGES[st].name}`}
                    {st !== "random" && <span className="block font-sans text-[10px] font-normal text-white/60">{STAGES[st].place}</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            {stageChooser ? (
              <ArcadeButton onClick={() => act(localSlot, "ok")} disabled={stageLocked}>
                {stageLocked ? "Los geht's…" : "Kampf starten"}
              </ArcadeButton>
            ) : (
              <p className="text-sm text-white/70">Der Host wählt die Arena…</p>
            )}
          </div>
        </div>
      )}

      {!bothReady && (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
          {mode === "local" ? (
            <>
              <span>
                P1: <Kbd>A</Kbd> <Kbd>D</Kbd> wählen · <Kbd>F</Kbd> bestätigen
              </span>
              <span>
                P2: <Kbd>←</Kbd> <Kbd>→</Kbd> wählen · <Kbd>K</Kbd> bestätigen
              </span>
            </>
          ) : (
            <span>Tippe zweimal auf einen Kämpfer oder nutze <Kbd>←</Kbd> <Kbd>→</Kbd> + <Kbd>Enter</Kbd></span>
          )}
          {mode === "online" && !ready[localSlot === 0 ? 1 : 0] && <span className="text-amber-300">Gegner wählt noch…</span>}
        </div>
      )}
      {!bothReady && !ready[localSlot] && (
        <div className="flex justify-center">
          <ArcadeButton onClick={() => act(localSlot, "ok")}>
            {CHARS[CHAR_IDS[cursor[localSlot]]].name} wählen
          </ArcadeButton>
        </div>
      )}
      {!bothReady && mode === "local" && ready[0] && !ready[1] && (
        <div className="flex justify-center">
          <ArcadeButton onClick={() => act(1, "ok")}>P2: {CHARS[CHAR_IDS[cursor[1]]].name} wählen</ArcadeButton>
        </div>
      )}
    </div>
  );
}

function Preview({ slot, char, ready, label }: { slot: 0 | 1; char: CharId; ready: boolean; label: string }) {
  const d = CHARS[char];
  return (
    <div
      className={cn(
        "relative flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/70 p-3 backdrop-blur sm:min-h-[380px]",
        slot === 1 && "items-end text-right",
      )}
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at ${slot === 0 ? "30%" : "70%"} 60%, ${d.color}50, transparent 65%)` }} />
      <img
        key={char}
        src={spriteUrl(char, ready ? "special" : "idle")}
        alt={d.name}
        className={cn(
          "pointer-events-none absolute bottom-0 h-[78%] max-w-none animate-[fadeIn_.25s_ease-out] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]",
          slot === 0 ? "left-1/2 -translate-x-1/2" : "right-1/2 translate-x-1/2 -scale-x-100",
        )}
        draggable={false}
      />
      <div className="relative z-10">
        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold text-white", slot === 0 ? "bg-rose-500" : "bg-sky-500")}>{label}</span>
        <h3 className="mt-1 text-2xl leading-none text-white sm:text-4xl" style={DISPLAY}>
          {d.name}
        </h3>
        <p className="text-xs text-white/70 sm:text-sm">{d.title}</p>
      </div>
      <div className="relative z-10 mt-auto w-full space-y-1 rounded-lg bg-black/60 p-2 text-left backdrop-blur-sm">
        <StatBar label="Kraft" value={d.stats.power} color={d.color} />
        <StatBar label="Tempo" value={d.stats.speed} color={d.color} />
        <StatBar label="Abwehr" value={d.stats.defense} color={d.color} />
        <StatBar label="Reichw." value={d.stats.range} color={d.color} />
        <div className="hidden pt-1 text-[11px] leading-snug text-white/80 sm:block">
          <p>
            <span style={{ color: d.color }}>Spezial:</span> {d.special.name}
          </p>
          <p>
            <span style={{ color: d.color }}>Super:</span> {d.superMove.name}
          </p>
          <p>
            <span style={{ color: d.color }}>{d.passive}:</span> {d.passiveDesc}
          </p>
        </div>
      </div>
      {ready && (
        <div className="absolute inset-x-0 top-1/3 z-20 -rotate-6 bg-amber-400 py-1 text-center text-lg text-zinc-950 shadow-lg" style={DISPLAY}>
          BEREIT
        </div>
      )}
    </div>
  );
}
