import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { audio } from "@/adventure/audio";
import { ASSET_BASE, preload } from "@/adventure/assets";
import manifest from "@/adventure/manifest.json";
import { Game, type UiSnapshot } from "@/adventure/engine";
import { getLang, loadLang, onLang, setLang, tr } from "@/adventure/i18n";
import { H, VERBS, W } from "@/adventure/types";
import { CHAPTER_TITLES, world } from "@/adventure/world";

type Layout = "desktop" | "landscape" | "portrait";

const VERB_ICON: Record<string, string> = { walk: "👣", look: "👁️", take: "✋", use: "🔧", talk: "💬", give: "🎁" };
const itemIcon = (id: string) => `${ASSET_BASE}g/items/${id}.webp`;
const GOLD = "#d8b25a";

function useInstallHint(): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPod/.test(ua) || (/iPad/.test(ua) && !document.documentElement.requestFullscreen);
    const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem("rabenschwur-install-hint") === "1";
    } catch {
      /* storage unavailable */
    }
    setShow(ios && !standalone && !dismissed);
  }, []);
  return show;
}

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

/** Loads all sprites in the background (small batches) so scenes never pop in. */
function useBackgroundPreload() {
  useEffect(() => {
    let cancelled = false;
    const m = manifest as Record<string, Record<string, unknown>>;
    const list: ["bg" | "props" | "items" | "chars", string][] = [];
    for (const k of ["chars", "props", "items", "bg"] as const) for (const key of Object.keys(m[k])) list.push([k, key]);
    (async () => {
      for (let i = 0; i < list.length && !cancelled; i += 6) {
        await preload(list.slice(i, i + 6));
        await new Promise((r) => setTimeout(r, 60));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
}

export function AdventureView() {
  const [game] = useState(() => new Game(world));
  const ui = useSyncExternalStore(game.subscribe, game.getSnapshot, game.getSnapshot);
  const { layout, touch } = useLayout();
  const installHint = useInstallHint();
  const [hintGone, setHintGone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [portraitOk, setPortraitOk] = useState(false);
  const [fs, setFs] = useState(false);
  const compact = layout === "landscape";
  useBackgroundPreload();

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
    };
    resize();
    if (import.meta.env.DEV) (window as unknown as { __game?: Game }).__game = game;
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      try {
        game.update(now);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        game.draw(ctx, scale);
      } catch (err) {
        console.error(err);
      }
    };
    raf = requestAnimationFrame(loop);
    void document.fonts?.ready.then(() => game.refresh());
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "L" || e.key === "l")) {
        setLang(getLang() === "th" ? "de" : "th");
        e.preventDefault();
        return;
      }
      if (e.key === " " || e.key === "Escape" || e.key === ".") {
        if (game.panel) game.closePanel();
        else if (game.skip()) e.preventDefault();
      }
    };
    loadLang();
    const offLang = onLang(() => game.emit());
    game.emit();
    const onFs = () => setFs(!!document.fullscreenElement);
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      cancelAnimationFrame(raf);
      offLang();
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [game, layout]);

  const toLogical = (e: { clientX: number; clientY: number }) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  // long-press = look / talk
  const press = useRef<{ t: ReturnType<typeof setTimeout>; fired: boolean; x: number; y: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    const p = { clientX: e.clientX, clientY: e.clientY };
    const st = {
      fired: false,
      x: e.clientX,
      y: e.clientY,
      t: setTimeout(() => {
        st.fired = true;
        game.click(toLogical(p), true);
      }, 480),
    };
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
        if (e.pointerType === "mouse") game.hoverAt(toLogical(e));
      }}
      onPointerUp={() => cancelPress()}
      onPointerCancel={() => cancelPress()}
      onPointerLeave={() => game.hoverAt(null)}
      onClick={(e) => {
        if (press.current?.fired) {
          press.current = null;
          return;
        }
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
        <TitleScreen
          hasSave={ui.hasSave}
          compact={layout !== "desktop"}
          onNew={() => start(() => game.newGame())}
          onContinue={() => start(() => game.continueGame())}
          onChapter={(n) => start(() => game.newGame(n))}
          installHint={installHint && !hintGone}
          onHintDone={() => {
            setHintGone(true);
            try {
              localStorage.setItem("rabenschwur-install-hint", "1");
            } catch {
              /* ignore */
            }
          }}
        />
      )}
      {ui.screen === "end" && <EndScreen title={ui.endTitle} text={ui.endText} onAgain={() => game.toTitle()} />}
      {ui.panel && <PanelView ui={ui} game={game} />}
      {layout === "portrait" && !portraitOk && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/95 p-4 text-center">
          <div className="animate-[spin_2.4s_ease-in-out_infinite] text-5xl">📱</div>
          <div className="font-[Pirata_One] text-3xl" style={{ color: GOLD }}>{tr("Dreh dein Handy quer")}</div>
          <div className="font-[Kanit] text-sm text-[#cfc3a8]">{tr("Im Querformat siehst du die ganze Szene.")}</div>
          <LangToggle className="relative mt-1" />
          <button onClick={() => setPortraitOk(true)} className="mt-1 rounded-full border border-[#4a3a2a] px-4 py-2 font-[Kanit] text-sm text-[#b9a98a]">
            {tr("Trotzdem hochkant spielen")}
          </button>
        </div>
      )}
    </>
  );

  const topButtons = playing && (
    <div className="absolute right-2 top-2 z-20 flex gap-1.5" style={compact ? { right: "max(0.5rem, env(safe-area-inset-right))", top: "calc(0.5rem + env(safe-area-inset-top, 0px))" } : undefined}>
      <IconBtn label={tr("Hinweis")} onClick={() => game.showHint()}>💡</IconBtn>
      <IconBtn label={tr("Hotspots zeigen")} onClick={() => game.reveal()}>🔍</IconBtn>
      <IconBtn label={tr(ui.muted ? "Ton an" : "Ton aus")} onClick={() => { audio.unlock(); audio.toggleMute(); game.emit(); }}>
        {ui.muted ? "🔇" : "🔊"}
      </IconBtn>
      {canFs && layout !== "desktop" && <IconBtn label={tr("Vollbild")} onClick={goFullscreen}>{fs ? "⤡" : "⛶"}</IconBtn>}
      <IconBtn label={getLang() === "th" ? "Deutsch" : "ไทย"} onClick={() => setLang(getLang() === "th" ? "de" : "th")}>
        <span className="text-[11px] font-bold">{getLang() === "th" ? "DE" : "ไทย"}</span>
      </IconBtn>
      <IconBtn label={tr("Zum Titelbild")} onClick={() => game.toTitle()}>☰</IconBtn>
    </div>
  );

  /* ---------- compact landscape: full-screen canvas + floating controls ---------- */
  if (compact) {
    return (
      <div ref={rootRef} className="fixed inset-0 flex flex-col items-center justify-center gap-1 overflow-hidden bg-black" style={{ overscrollBehavior: "none" }}>
        <div ref={wrapRef} className="relative w-full" style={{ aspectRatio: `${W} / ${H}`, maxWidth: `calc((100dvh - 3.5rem) * ${W / H})` }}>
          {canvasEl}
          {topButtons}
          {playing && (
            <div style={{ top: "calc(3rem + env(safe-area-inset-top, 0px))" }} className="pointer-events-none absolute left-1/2 z-10 max-w-[70%] -translate-x-1/2 truncate rounded-full bg-black/50 px-3 py-0.5 text-center font-[Kanit] text-sm font-semibold text-[#e9d9a8]">
              {(ui.sel ? ui.sentence : "") || ui.target || ui.sceneTitle}
            </div>
          )}
          <InventoryStrip ui={ui} game={game} />
        {playing && !ui.choices && !ui.panel && (
            <>
            </>
          )}
          {ui.choices && <Choices ui={ui} game={game} className="absolute bottom-2 left-1/2 z-30 max-h-[55%] w-[min(92%,640px)] -translate-x-1/2 overflow-y-auto !gap-0 !p-1 bg-[#0f0b08]/88" />}
          {overlays}
        </div>
        {playing && !ui.choices && !ui.panel && (
              <div className="absolute z-30 flex items-center gap-1" style={{ left: "max(0.5rem, env(safe-area-inset-left))", top: "max(0.25rem, env(safe-area-inset-top, 0px))" }}>
                {VERBS.map((v) => (
                  <button
                    key={v.id}
                    title={tr(v.id === "walk" ? "Automatisch" : v.label)}
                    aria-label={tr(v.id === "walk" ? "Automatisch" : v.label)}
                    onClick={() => {
                      game.setVerb(v.id);
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-base shadow backdrop-blur ${ui.busy ? "opacity-50" : ""} ${ui.verb === v.id ? "border-[#d8b25a] bg-[#3a2a12]/95" : "border-[#4a3a2a] bg-black/60"}`}
                  >
                    {VERB_ICON[v.id]}
                  </button>
                ))}
                {ui.sel && <img src={itemIcon(ui.sel)} alt="" className="ml-1 h-8 w-8 rounded-md border border-[#d8b25a]/70 bg-black/60 p-0.5" />}
              </div>
        )}
      </div>
    );
  }

  /* ---------- desktop / portrait: stacked ---------- */
  return (
    <div ref={rootRef} className="mx-auto flex w-full max-w-[1280px] flex-col gap-2 bg-[#080605] px-2 pb-4 pt-2 sm:px-4 sm:pt-4">
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-xl border-2 border-[#4a3a24] bg-black shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {canvasEl}
        {playing && <div className="pointer-events-none absolute left-3 top-2 font-[Pirata_One] text-sm text-[#e9d9a8]/85 drop-shadow sm:text-lg">{ui.sceneTitle}</div>}
        {topButtons}
        {overlays}
      </div>
      {playing && (
        <>
          <div className="min-h-7 text-center font-[Kanit] text-base font-semibold tracking-wide text-[#e9d9a8] sm:text-lg">{ui.sentence || " "}</div>
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
                      ui.verb === v.id ? "border-[#d8b25a] bg-[#3a2a12] text-[#f2dc9a] shadow-[0_0_12px_rgba(216,178,90,0.35)]" : "border-[#3a2e20] bg-[#17120c] text-[#c9b78e] hover:bg-[#241a10]"
                    }`}
                  >
                    {tr(touch && v.id === "walk" ? "Automatisch" : v.label)}
                  </button>
                ))}
              </div>
              <div className="min-h-[108px] rounded-lg border border-[#3a2e20] bg-[#0d0906] p-1.5">
                <InventoryGrid ui={ui} game={game} onPick={(id) => game.clickItem(id)} cols="grid-cols-4 sm:grid-cols-6 lg:grid-cols-8" />
              </div>
            </div>
          )}
          <p className="text-center font-[Kanit] text-xs text-[#6a5c44]">
            {touch
              ? tr("Tippen = gehen / ansehen / reden · Gedrückt halten = anschauen · 🔍 zeigt alle Hotspots · speichert automatisch")
              : tr("Verb wählen, dann auf etwas klicken · Rechtsklick = Anschauen / Reden · Leertaste überspringt Text · Spielstand speichert automatisch")}
          </p>
        </>
      )}
    </div>
  );
}

function PanelView({ ui, game }: { ui: UiSnapshot; game: Game }) {
  const p = ui.panel!;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55" onClick={() => game.closePanel()}>
      <div className="max-w-[88%] rounded-2xl border border-[#5a4a30] bg-[#0f0b08]/96 p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between gap-6">
          <div className="font-[Pirata_One] text-xl" style={{ color: GOLD }}>{p.title}</div>
          <button onClick={() => game.closePanel()} className="rounded-full border border-[#5a4a30] px-3 py-1 font-[Kanit] text-xs text-[#cfc3a8] hover:bg-[#241a10]">{tr("Schließen")}</button>
        </div>
        {p.items.length === 0 ? (
          <div className="px-4 py-5 font-[Kanit] text-sm text-[#7a6a50]">{tr("Leer.")}</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {p.items.map((id) => (
              <button
                key={id}
                onClick={() => game.panelTake(id)}
                className="flex w-24 flex-col items-center gap-1 rounded-lg border border-[#3a2e20] bg-[#17120c] p-2 hover:border-[#d8b25a] hover:bg-[#241a10]"
              >
                <img src={itemIcon(id)} alt="" className="h-12 w-12 object-contain" draggable={false} />
                <span className="font-[Kanit] text-[11px] leading-tight text-[#cfc3a8]">{game.itemName(id)}</span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-2 font-[Kanit] text-[11px] text-[#6a5c44]">{tr("Tippe einen Gegenstand an, um ihn einzustecken.")}</div>
      </div>
    </div>
  );
}

function InventoryGrid({ ui, game, onPick, cols }: { ui: UiSnapshot; game: Game; onPick: (id: string) => void; cols: string }) {
  if (ui.inv.length === 0) return <div className="py-6 text-center font-[Kanit] text-sm text-[#6a5c44]">{tr("Taschen leer. Noch.")}</div>;
  return (
    <div className={`grid content-start gap-1.5 ${cols}`}>
      {ui.inv.map((id) => (
        <button
          key={id}
          title={game.itemName(id)}
          onClick={() => onPick(id)}
          onPointerEnter={(e) => e.pointerType === "mouse" && game.hoverInv(id)}
          onPointerLeave={() => game.hoverInv(null)}
          className={`flex aspect-square flex-col items-center justify-center rounded-md border transition ${
            ui.sel === id ? "border-[#d8b25a] bg-[#2a2212]" : "border-[#2a2016] bg-[#17120c] hover:bg-[#241a10]"
          }`}
        >
          <img src={itemIcon(id)} alt={game.itemName(id)} className="h-[64%] w-[64%] object-contain" draggable={false} />
          <span className="w-full truncate px-0.5 text-center font-[Kanit] text-[9px] leading-tight text-[#9a8a6a]">{game.itemName(id)}</span>
        </button>
      ))}
    </div>
  );
}

function Choices({ ui, game, className = "" }: { ui: UiSnapshot; game: Game; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 rounded-xl border border-[#3a2e20] bg-[#0f0b08]/95 p-2 sm:p-3 ${className}`}>
      {ui.choices!.map((c, i) => (
        <button
          key={i}
          onClick={() => game.choose_(i)}
          className="rounded-md px-3 py-1.5 text-left font-[Kanit] text-[15px] text-[#e2c98a] transition hover:bg-[#241a10] hover:text-white active:bg-[#241a10] sm:text-base"
        >
          {c}
        </button>
      ))}
    </div>
  );
}

/** Compact layout: the inventory is always visible as a strip. Tap an item to use it, tap another item to combine. */
function InventoryStrip({ ui, game }: { ui: UiSnapshot; game: Game }) {
  return (
    <div className="flex h-12 w-full items-center justify-center overflow-hidden px-2">
      {ui.inv.length > 0 && (
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-[#5a4a30] bg-black/70 p-1 shadow-xl backdrop-blur">
          {ui.inv.map((id) => (
            <button
              key={id}
              title={game.itemName(id)}
              aria-label={game.itemName(id)}
              onClick={() => {
                if (ui.sel === id) game.setVerb("walk");
                else if (ui.sel && (ui.verb === "use" || ui.verb === "give")) game.clickItem(id);
                else {
                  game.setVerb(ui.verb === "give" ? "give" : "use");
                  game.clickItem(id);
                }
              }}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${ui.sel === id ? "border-[#d8b25a] bg-[#2a2212]" : "border-[#3a2e20] bg-[#17120c]/90"} ${ui.busy ? "opacity-50" : ""}`}
            >
              <img src={itemIcon(id)} alt="" className="h-8 w-8 object-contain" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} title={label} onClick={onClick} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#5a4a30] bg-black/60 text-base text-[#e9d9a8] backdrop-blur hover:bg-black/80">
      {children}
    </button>
  );
}

function LangToggle({ className = "absolute right-3 top-3" }: { className?: string }) {
  const l = getLang();
  const b = (id: "de" | "th", label: string) => (
    <button
      key={id}
      onClick={() => setLang(id)}
      aria-pressed={l === id}
      className={`px-3 py-1.5 font-[Kanit] text-sm font-semibold transition ${l === id ? "bg-[#d8b25a] text-[#241808]" : "bg-[#0f0b08]/85 text-[#e0d4b8] hover:bg-[#2a2012]"}`}
    >
      {label}
    </button>
  );
  return <div className={`${className} z-30 flex overflow-hidden rounded-full border-2 border-[#d8b25a]/80 shadow-lg`}>{b("de", "Deutsch")}{b("th", "ไทย")}</div>;
}

function TitleScreen({ hasSave, compact, onNew, onContinue, onChapter, installHint, onHintDone }: { hasSave: boolean; compact: boolean; onNew: () => void; onContinue: () => void; onChapter: (n: number) => void; installHint: boolean; onHintDone: () => void }) {
  const [pick, setPick] = useState(false);
  const th = getLang() === "th";
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center" style={{ background: `#050404 url(${ASSET_BASE}g/title.webp) center/cover` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/80" />
      <LangToggle />
      <div className="relative flex flex-col items-center">
        <div className={`font-[Kanit] text-[10px] text-[#e9d9a8]/85 sm:text-sm ${th ? "tracking-wide" : "uppercase tracking-[0.4em]"}`}>{tr("Ein düsteres Ritterabenteuer")}</div>
        <h1 className={`mt-1 ${th ? "font-[Kanit] font-semibold" : "font-[Pirata_One]"} text-5xl leading-none sm:text-7xl lg:text-8xl`} style={{ color: "#e6cf94", textShadow: "0 4px 24px rgba(200,40,20,0.7), 0 2px 0 #3a1008" }}>
          {tr("Rabenschwur")}
        </h1>
        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-8 sm:gap-3">
          <button onClick={onNew} className="rounded-full border-2 border-[#d8b25a] bg-[#2a1c0c]/92 px-6 py-3 font-[Kanit] text-base font-semibold text-[#f2dc9a] shadow-lg hover:bg-[#4a3414] sm:px-7 sm:text-lg">
            {tr("Neues Spiel")}
          </button>
          {hasSave && (
            <button onClick={onContinue} className="rounded-full border-2 border-[#8a7a5a] bg-[#14100a]/92 px-6 py-3 font-[Kanit] text-base font-semibold text-[#dccfae] shadow-lg hover:bg-[#241a10] sm:px-7 sm:text-lg">
              {tr("Weiterspielen")}
            </button>
          )}
        </div>
        <button onClick={() => setPick((v) => !v)} className="mt-4 font-[Kanit] text-sm text-[#cdbd94] underline underline-offset-4 hover:text-white sm:mt-6">
          {tr("Kapitel wählen")}
        </button>
        {pick && (
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {CHAPTER_TITLES.map((t, i) => (
              <button key={t} onClick={() => onChapter(i + 1)} className="rounded-full border border-[#8a7a5a]/70 bg-[#14100a]/92 px-4 py-1.5 font-[Kanit] text-sm font-semibold text-[#dccfae] hover:bg-[#241a10]">
                {i + 1}. {tr(t)}
              </button>
            ))}
          </div>
        )}
        {installHint && (
          <div className="mt-3 max-w-md rounded-xl border border-[#d8b25a]/50 bg-black/70 px-3 py-2 font-[Kanit] text-xs text-[#e9d9a8] backdrop-blur">
            {th ? (<><b>เต็มจอไม่มีแถบเบราว์เซอร์:</b> แตะ <b>แชร์</b> ใน Safari แล้วเลือก <b>“เพิ่มลงในหน้าจอโฮม”</b> เกมจะเปิดเหมือนแอป</>) : (<><b>Vollbild ohne Browserleiste:</b> Tippe unten im Safari auf <b>Teilen</b> und wähle <b>„Zum Home-Bildschirm“</b>. Dann startet das Spiel wie eine App.</>)}
            <button onClick={onHintDone} className="ml-2 underline underline-offset-2 text-[#cdbd94]">{tr("Verstanden")}</button>
          </div>
        )}
        {compact && <div className="mt-3 font-[Kanit] text-xs text-[#dccfae]/70">{tr("Tippen zum Gehen · Gedrückt halten zum Anschauen · 🔍 zeigt Hotspots")}</div>}
      </div>
    </div>
  );
}

function EndScreen({ title, text, onAgain }: { title: string; text: string; onAgain: () => void }) {
  const th = getLang() === "th";
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/88 px-4 text-center">
      <h2 className={`${th ? "font-[Kanit] font-semibold" : "font-[Pirata_One]"} text-4xl sm:text-7xl`} style={{ color: "#e6cf94", textShadow: "0 4px 24px rgba(200,40,20,0.6)" }}>{title || tr("Ende")}</h2>
      <p className="mt-3 max-w-xl font-[Kanit] text-sm text-[#d9ccae] sm:text-lg">{text}</p>
      <button onClick={onAgain} className="mt-5 rounded-full border-2 border-[#d8b25a] bg-[#2a1c0c] px-6 py-2.5 font-[Kanit] font-semibold text-[#f2dc9a] hover:bg-[#4a3414]">
        {tr("Zum Titel")}
      </button>
    </div>
  );
}
