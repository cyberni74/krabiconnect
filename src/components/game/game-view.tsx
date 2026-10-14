import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { audio } from "@/game/audio";
import { Game, type UiSnapshot } from "@/game/engine";
import { itemIcon, itemName } from "@/game/items";
import { H, VERBS, W } from "@/game/types";

type Layout = "desktop" | "landscape" | "portrait";

const VERB_ICON: Record<string, string> = { walk: "👣", look: "👁", take: "✋", use: "⚙", talk: "💬", give: "🎁" };

function useLayout(): { layout: Layout; touch: boolean } {
  const read = () => {
    if (typeof window === "undefined") return { layout: "desktop" as Layout, touch: false };
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const landscape = window.innerWidth > window.innerHeight;
    const small = Math.min(window.innerWidth, window.innerHeight) < 600;
    const layout: Layout = touch || small ? (landscape ? "landscape" : "portrait") : "desktop";
    return { layout, touch };
  };
  const [s, setS] = useState(read);
  useEffect(() => {
    const on = () => setS(read());
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("orientationchange", on);
    };
  }, []);
  return s;
}

export function GameView() {
  const [game] = useState(() => new Game());
  const ui = useSyncExternalStore(game.subscribe, game.getSnapshot, game.getSnapshot);
  const { layout, touch } = useLayout();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [verbMenu, setVerbMenu] = useState(false);
  const [bag, setBag] = useState(false);
  const [portraitOk, setPortraitOk] = useState(false);
  const [fs, setFs] = useState(false);
  const compact = layout === "landscape";

  useEffect(() => {
    game.touch = touch;
  }, [game, touch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let scale = 1;
    const resize = () => {
      const w = wrap.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const px = Math.min(2880, Math.round(w * dpr));
      canvas.width = px;
      canvas.height = Math.round((px * H) / W);
      scale = canvas.width / W;
      game.renderScale = Math.min(3, Math.max(1, Math.ceil(scale)));
      // keep speech readable on small screens (~15px minimum on screen)
      game.textScale = Math.min(1.9, Math.max(1, 760 / Math.max(1, w)));
    };
    resize();
    if (import.meta.env.DEV) (window as unknown as { __game?: Game }).__game = game;
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(loop);
      try {
        game.update(dt, now);
        ctx.imageSmoothingQuality = "high";
        game.draw(ctx, scale);
      } catch (err) {
        console.error(err);
      }
    };
    raf = requestAnimationFrame(loop);
    void document.fonts?.ready.then(() => game.refresh());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Escape" || e.key === ".") {
        if (game.skip()) e.preventDefault();
      }
    };
    const onFs = () => setFs(!!document.fullscreenElement);
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [game, layout]);

  // close popovers when a script starts
  useEffect(() => {
    if (ui.busy || ui.choices) {
      setVerbMenu(false);
      setBag(false);
    }
  }, [ui.busy, ui.choices]);

  const toLogical = (e: { clientX: number; clientY: number }) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  // long-press = look / talk
  const press = useRef<{ t: ReturnType<typeof setTimeout>; fired: boolean; x: number; y: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    const p = { clientX: e.clientX, clientY: e.clientY };
    const st = { fired: false, x: e.clientX, y: e.clientY, t: setTimeout(() => {
      st.fired = true;
      game.click(toLogical(p), true);
    }, 480) };
    press.current = st;
  };
  const cancelPress = (e?: React.PointerEvent) => {
    const st = press.current;
    if (!st) return;
    if (e && Math.hypot(e.clientX - st.x, e.clientY - st.y) < 12 && e.type === "pointermove") return;
    clearTimeout(st.t);
  };

  const goFullscreen = async () => {
    audio.unlock();
    const el = rootRef.current;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (el?.requestFullscreen) {
        await el.requestFullscreen({ navigationUI: "hide" });
        await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.("landscape").catch(() => {});
      }
    } catch {
      /* not allowed */
    }
  };
  const canFs = typeof document !== "undefined" && !!document.documentElement.requestFullscreen;

  const playing = ui.screen === "play";
  const start = (fn: () => void) => {
    audio.unlock();
    if (touch && canFs && !document.fullscreenElement) void goFullscreen();
    fn();
  };

  const canvasEl = (
    <canvas
      ref={canvasRef}
      className="block h-full w-full select-none"
      style={{ cursor: playing ? (ui.busy ? "wait" : "crosshair") : "default", touchAction: "none", WebkitTouchCallout: "none" }}
      onPointerDown={onDown}
      onPointerMove={(e) => {
        cancelPress(e);
        if (e.pointerType === "mouse") game.pointerMove(toLogical(e));
      }}
      onPointerUp={() => cancelPress()}
      onPointerCancel={() => cancelPress()}
      onPointerLeave={() => game.pointerMove({ x: -1, y: -1 })}
      onClick={(e) => {
        if (press.current?.fired) {
          press.current = null;
          return;
        }
        setVerbMenu(false);
        setBag(false);
        game.click(toLogical(e));
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!touch) game.click(toLogical(e), true);
      }}
    />
  );

  const overlays = (
    <>
      {ui.screen === "title" && (
        <TitleScreen hasSave={ui.hasSave} compact={layout !== "desktop"} onNew={() => start(() => game.newGame())} onContinue={() => start(() => game.continueGame())} />
      )}
      {ui.screen === "end" && <EndScreen onAgain={() => game.newGame()} />}
      {layout === "portrait" && playing && !portraitOk && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/90 p-4 text-center">
          <div className="animate-[spin_2.4s_ease-in-out_infinite] text-5xl">📱</div>
          <div className="font-[Pirata_One] text-3xl text-[#f2c76b]">Dreh dein Handy quer</div>
          <div className="font-[Kanit] text-sm text-[#e9dcc0]">Im Querformat siehst du die ganze Szene.</div>
          <button onClick={() => setPortraitOk(true)} className="mt-1 rounded-full border border-[#5a3a20] px-4 py-2 font-[Kanit] text-sm text-[#d9c39a]">
            Trotzdem hochkant spielen
          </button>
        </div>
      )}
    </>
  );

  const topButtons = playing && (
    <div className="absolute right-2 top-2 z-20 flex gap-1.5" style={compact ? { right: "max(0.5rem, env(safe-area-inset-right))" } : undefined}>
      {touch && <IconBtn label="Hotspots zeigen" onClick={() => game.reveal()}>🔍</IconBtn>}
      <IconBtn label={ui.muted ? "Ton an" : "Ton aus"} onClick={() => { audio.unlock(); audio.toggleMute(); game.emit(); }}>
        {ui.muted ? "🔇" : "🔊"}
      </IconBtn>
      {canFs && layout !== "desktop" && <IconBtn label="Vollbild" onClick={goFullscreen}>{fs ? "⤡" : "⛶"}</IconBtn>}
      <IconBtn label="Zum Titelbild" onClick={() => game.toTitle()}>☰</IconBtn>
    </div>
  );

  /* ---------- compact landscape: full-screen canvas + floating controls ---------- */
  if (compact) {
    const verbLabel = VERBS.find((v) => v.id === ui.verb)?.label ?? "";
    return (
      <div ref={rootRef} className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black" style={{ overscrollBehavior: "none" }}>
        <div ref={wrapRef} className="relative max-h-full w-full" style={{ aspectRatio: `${W} / ${H}`, maxWidth: `calc(100dvh * ${W / H})` }}>
          {canvasEl}
          {playing && <ExitZones ui={ui} game={game} />}
          {topButtons}
          {playing && (
            <div className="pointer-events-none absolute left-1/2 top-1.5 z-10 max-w-[60%] -translate-x-1/2 truncate rounded-full bg-black/45 px-3 py-0.5 text-center font-[Kanit] text-sm font-semibold text-[#9fe0ff]">
              {ui.sentence || ui.sceneTitle}
            </div>
          )}
          {playing && !ui.choices && (
            <>
              <div className="absolute bottom-2 z-20 flex items-end gap-2" style={{ left: "max(0.5rem, env(safe-area-inset-left))" }}>
                <button
                  onClick={() => { setBag(false); setVerbMenu((v) => !v); }}
                  className={`flex h-12 items-center gap-1.5 rounded-full border-2 px-3.5 font-[Kanit] text-sm font-semibold shadow-lg backdrop-blur ${ui.busy ? "opacity-50" : ""} ${ui.verb !== "walk" ? "border-[#e9c873] bg-[#3a2814]/90 text-[#ffe9a8]" : "border-[#5a3a20] bg-black/60 text-[#e9dcc0]"}`}
                >
                  <span className="text-lg">{VERB_ICON[ui.verb]}</span>
                  {ui.verb === "walk" ? "Aktion" : verbLabel}
                  {ui.sel && <img src={itemIcon(ui.sel)} alt="" className="h-7 w-7" />}
                </button>
              </div>
              <div className="absolute bottom-2 z-20" style={{ right: "max(0.5rem, env(safe-area-inset-right))" }}>
                <button
                  onClick={() => { setVerbMenu(false); setBag((b) => !b); }}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#5a3a20] bg-black/60 text-2xl shadow-lg backdrop-blur ${ui.busy ? "opacity-50" : ""}`}
                  aria-label="Inventar"
                >
                  🎒
                  {ui.inv.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c4423a] px-1 font-[Kanit] text-[11px] font-bold text-white">{ui.inv.length}</span>
                  )}
                </button>
              </div>
              {verbMenu && (
                <div className="absolute bottom-16 z-30 grid grid-cols-3 gap-1.5 rounded-2xl border border-[#5a3a20] bg-[#120c08]/95 p-2 shadow-2xl" style={{ left: "max(0.5rem, env(safe-area-inset-left))" }}>
                  {VERBS.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        game.setVerb(v.id);
                        setVerbMenu(false);
                        if ((v.id === "use" || v.id === "give") && ui.inv.length) setBag(true);
                      }}
                      className={`flex h-14 w-20 flex-col items-center justify-center rounded-xl border font-[Kanit] text-xs font-semibold ${ui.verb === v.id ? "border-[#e9c873] bg-[#3a2814] text-[#ffe9a8]" : "border-[#3a2a1a] bg-[#1a120c] text-[#d9c39a]"}`}
                    >
                      <span className="text-lg leading-none">{VERB_ICON[v.id]}</span>
                      {v.id === "walk" ? "Automatisch" : v.label}
                    </button>
                  ))}
                </div>
              )}
              {bag && (
                <div className="absolute inset-x-2 bottom-16 z-30 rounded-2xl border border-[#5a3a20] bg-[#120c08]/95 p-2 shadow-2xl">
                  <div className="mb-1 px-1 font-[Kanit] text-xs text-[#a89070]">
                    {ui.verb === "use" || ui.verb === "give" ? (ui.sel ? `${ui.sentence} … dann ins Bild tippen oder zweiten Gegenstand wählen` : "Gegenstand wählen") : "Tippen = anschauen · erst „Benutze“ oder „Gib“ wählen, um ihn einzusetzen"}
                  </div>
                  <InventoryGrid ui={ui} game={game} onPick={(id) => {
                    const wasSel = ui.sel;
                    game.clickItem(id);
                    if ((ui.verb === "use" || ui.verb === "give") && !wasSel) setBag(false);
                  }} cols="grid-cols-6" />
                </div>
              )}
            </>
          )}
          {ui.choices && <Choices ui={ui} game={game} className="absolute bottom-2 left-1/2 z-30 max-h-[55%] w-[min(92%,640px)] -translate-x-1/2 overflow-y-auto !gap-0 !p-1 bg-[#120c08]/85" />}
          {overlays}
        </div>
      </div>
    );
  }

  /* ---------- desktop / portrait: stacked ---------- */
  return (
    <div ref={rootRef} className="mx-auto flex w-full max-w-[1280px] flex-col gap-2 bg-[#0b0806] px-2 pb-4 pt-2 sm:px-4 sm:pt-4">
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-xl border-2 border-[#5a3a20] bg-black shadow-[0_10px_40px_rgba(0,0,0,0.7)]"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {canvasEl}
        {playing && <ExitZones ui={ui} game={game} />}
        {playing && (
          <div className="pointer-events-none absolute left-3 top-2 font-[Pirata_One] text-sm text-[#f3dfb0]/80 drop-shadow sm:text-lg">{ui.sceneTitle}</div>
        )}
        {topButtons}
        {overlays}
      </div>

      {playing && (
        <>
          <div className="min-h-7 text-center font-[Kanit] text-base font-semibold tracking-wide text-[#9fe0ff] sm:text-lg">{ui.sentence || " "}</div>
          {ui.choices ? (
            <Choices ui={ui} game={game} />
          ) : (
            <div className={`grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,320px)_1fr] ${ui.busy ? "opacity-60" : ""}`}>
              <div className="grid grid-cols-3 gap-1.5">
                {VERBS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => game.setVerb(v.id)}
                    className={`rounded-lg border px-2 py-2.5 font-[Kanit] text-sm font-semibold transition sm:text-[15px] ${
                      ui.verb === v.id
                        ? "border-[#e9c873] bg-[#3a2814] text-[#ffe9a8] shadow-[0_0_12px_rgba(233,200,115,0.35)]"
                        : "border-[#3a2a1a] bg-[#1a120c] text-[#d9c39a] hover:bg-[#2a1c12]"
                    }`}
                  >
                    {touch && v.id === "walk" ? "Automatisch" : v.label}
                  </button>
                ))}
              </div>
              <div className="min-h-[108px] rounded-lg border border-[#3a2a1a] bg-[#100a07] p-1.5">
                <InventoryGrid ui={ui} game={game} onPick={(id) => game.clickItem(id)} cols="grid-cols-4 sm:grid-cols-6 lg:grid-cols-8" />
              </div>
            </div>
          )}
          <p className="text-center font-[Kanit] text-xs text-[#7a6650]">
            {touch
              ? "Tippen = gehen / ansehen / reden · Gedrückt halten = anschauen · 🔍 zeigt alle Hotspots · speichert automatisch"
              : "Verb wählen, dann auf etwas klicken · Rechtsklick = Anschauen / Reden · Leertaste überspringt Text · Spielstand speichert automatisch"}
          </p>
        </>
      )}
    </div>
  );
}

/** Transparent tap targets over every exit: one tap walks there and changes the room. */
function ExitZones({ ui, game }: { ui: UiSnapshot; game: Game }) {
  return (
    <>
      {ui.exits.map((e) => (
        <button
          key={e.id}
          aria-label={`Weiter: ${e.name}`}
          onClick={() => game.useExit(e.id)}
          className="group absolute z-10 flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed border-[#9fe0ff]/35 bg-[#9fe0ff]/5 transition active:bg-[#9fe0ff]/25"
          style={{ left: `${e.left}%`, top: `${e.top}%`, width: `${e.width}%`, height: `${e.height}%`, minWidth: 64, minHeight: 64 }}
        >
          <span className="animate-pulse text-3xl leading-none text-[#e6f8ff]/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{e.arrow}</span>
          <span className="max-w-full truncate px-1 font-[Kanit] text-[11px] font-semibold text-[#e6f8ff]/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">{e.name}</span>
        </button>
      ))}
    </>
  );
}

function InventoryGrid({ ui, game, onPick, cols }: { ui: UiSnapshot; game: Game; onPick: (id: string) => void; cols: string }) {
  if (ui.inv.length === 0) return <div className="py-6 text-center font-[Kanit] text-sm text-[#7a6650]">Taschen leer. Noch.</div>;
  return (
    <div className={`grid content-start gap-1.5 ${cols}`}>
      {ui.inv.map((id) => (
        <button
          key={id}
          title={itemName(id, game)}
          onClick={() => onPick(id)}
          onPointerEnter={(e) => e.pointerType === "mouse" && game.hoverInv(id)}
          onPointerLeave={() => game.hoverInv(null)}
          className={`flex aspect-square flex-col items-center justify-center rounded-md border transition ${
            ui.sel === id ? "border-[#9fe0ff] bg-[#1c2a34]" : "border-[#2a1e14] bg-[#1a120c] hover:bg-[#2a1c12]"
          }`}
        >
          <img src={itemIcon(id)} alt={itemName(id, game)} className="h-[70%] w-[70%] object-contain" draggable={false} />
          <span className="w-full truncate px-0.5 text-center font-[Kanit] text-[9px] leading-tight text-[#a89070]">{itemName(id, game)}</span>
        </button>
      ))}
    </div>
  );
}

function Choices({ ui, game, className = "" }: { ui: UiSnapshot; game: Game; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 rounded-xl border border-[#3a2a1a] bg-[#120c08]/95 p-2 sm:p-3 ${className}`}>
      {ui.choices!.map((c, i) => (
        <button
          key={i}
          onClick={() => game.choose_(i)}
          className="rounded-md px-3 py-1.5 text-left font-[Kanit] text-[15px] text-[#c8b4ff] transition hover:bg-[#2a1c12] hover:text-white active:bg-[#2a1c12] sm:text-base"
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#5a3a20] bg-black/55 text-base text-[#f3dfb0] backdrop-blur hover:bg-black/75"
    >
      {children}
    </button>
  );
}

function TitleScreen({ hasSave, compact, onNew, onContinue }: { hasSave: boolean; compact: boolean; onNew: () => void; onContinue: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-b from-black/30 via-black/10 to-black/70 px-4 text-center">
      <div className="font-[Kanit] text-[10px] uppercase tracking-[0.35em] text-[#f3dfb0]/80 sm:text-sm">Ein Piraten-Abenteuer in zwei Kapiteln</div>
      <h1 className="mt-1 font-[Pirata_One] text-4xl leading-none text-[#f2c76b] drop-shadow-[0_4px_20px_rgba(255,160,60,0.6)] sm:text-7xl lg:text-8xl">
        Die Gezeiten von Krabbenbucht
      </h1>
      <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-8 sm:gap-3">
        <button onClick={onNew} className="rounded-full border-2 border-[#e9c873] bg-[#3a2410]/90 px-6 py-3 font-[Kanit] text-base font-semibold text-[#ffe9a8] shadow-lg hover:bg-[#5a3818] sm:px-7 sm:text-lg">
          Neues Spiel
        </button>
        {hasSave && (
          <button onClick={onContinue} className="rounded-full border-2 border-[#9fe0ff]/70 bg-[#0c1a24]/90 px-6 py-3 font-[Kanit] text-base font-semibold text-[#cfefff] shadow-lg hover:bg-[#14283a] sm:px-7 sm:text-lg">
            Weiterspielen
          </button>
        )}
      </div>
      {compact && <div className="mt-3 font-[Kanit] text-xs text-[#e9dcc0]/70">Tippen zum Gehen · Gedrückt halten zum Anschauen · 🔍 zeigt Hotspots</div>}
    </div>
  );
}

function EndScreen({ onAgain }: { onAgain: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 px-4 text-center">
      <h2 className="font-[Pirata_One] text-5xl text-[#f2c76b] sm:text-8xl">Ende</h2>
      <p className="mt-2 max-w-xl font-[Kanit] text-sm text-[#e9dcc0] sm:text-lg">
        Die Flut ist zurück, Morwenna ist eine Seegurke, und Finn Kielwasser ist offiziell Pirat. Ein bisschen jedenfalls.
      </p>
      <button onClick={onAgain} className="mt-5 rounded-full border-2 border-[#e9c873] bg-[#3a2410] px-6 py-2.5 font-[Kanit] font-semibold text-[#ffe9a8] hover:bg-[#5a3818]">
        Nochmal spielen
      </button>
    </div>
  );
}
