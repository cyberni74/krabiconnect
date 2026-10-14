import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { audio } from "@/game/audio";
import { Game } from "@/game/engine";
import { itemIcon, itemName } from "@/game/items";
import { H, VERBS, W } from "@/game/types";

export function GameView() {
  const [game] = useState(() => new Game());
  const ui = useSyncExternalStore(game.subscribe, game.getSnapshot, game.getSnapshot);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let scale = 1;
    const resize = () => {
      const w = wrap.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const px = Math.min(2880, Math.round(w * dpr));
      canvas.width = px;
      canvas.height = Math.round((px * H) / W);
      scale = canvas.width / W;
      game.renderScale = Math.min(3, Math.max(1, Math.ceil(scale)));
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
    // redraw the cached background once web fonts are ready
    void document.fonts?.ready.then(() => game.refresh());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Escape" || e.key === ".") {
        if (game.skip()) e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [game]);

  const toLogical = (e: React.PointerEvent | React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const playing = ui.screen === "play";

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-2 px-2 pb-4 pt-2 sm:px-4 sm:pt-4">
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-xl border-2 border-[#5a3a20] bg-black shadow-[0_10px_40px_rgba(0,0,0,0.7)]"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full touch-manipulation"
          style={{ cursor: playing ? (ui.busy ? "wait" : "crosshair") : "default" }}
          onPointerMove={(e) => game.pointerMove(toLogical(e))}
          onPointerLeave={() => game.pointerMove({ x: -1, y: -1 })}
          onClick={(e) => game.click(toLogical(e))}
          onContextMenu={(e) => {
            e.preventDefault();
            game.click(toLogical(e), true);
          }}
        />
        {playing && (
          <div className="pointer-events-none absolute left-3 top-2 font-[Pirata_One] text-sm text-[#f3dfb0]/80 drop-shadow sm:text-lg">
            {ui.sceneTitle}
          </div>
        )}
        {playing && (
          <div className="absolute right-2 top-2 flex gap-1.5">
            <IconBtn label={ui.muted ? "Ton an" : "Ton aus"} onClick={() => { audio.unlock(); audio.toggleMute(); game.emit(); }}>
              {ui.muted ? "🔇" : "🔊"}
            </IconBtn>
            <IconBtn label="Zum Titelbild" onClick={() => game.toTitle()}>☰</IconBtn>
          </div>
        )}
        {ui.screen === "title" && <TitleScreen hasSave={ui.hasSave} onNew={() => { audio.unlock(); game.newGame(); }} onContinue={() => { audio.unlock(); game.continueGame(); }} />}
        {ui.screen === "end" && <EndScreen onAgain={() => game.newGame()} />}
      </div>

      {playing && (
        <>
          <div className="min-h-7 text-center font-[Kanit] text-base font-semibold tracking-wide text-[#9fe0ff] sm:text-lg">
            {ui.sentence || " "}
          </div>
          {ui.choices ? (
            <div className="flex flex-col gap-1 rounded-xl border border-[#3a2a1a] bg-[#120c08]/90 p-2 sm:p-3">
              {ui.choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => game.choose_(i)}
                  className="rounded-md px-3 py-2 text-left font-[Kanit] text-[15px] text-[#c8b4ff] transition hover:bg-[#2a1c12] hover:text-white sm:text-base"
                >
                  {c}
                </button>
              ))}
            </div>
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
                    {v.label}
                  </button>
                ))}
              </div>
              <div className="grid min-h-[108px] grid-cols-4 content-start gap-1.5 rounded-lg border border-[#3a2a1a] bg-[#100a07] p-1.5 sm:grid-cols-6 lg:grid-cols-8">
                {ui.inv.length === 0 && (
                  <div className="col-span-full self-center py-6 text-center font-[Kanit] text-sm text-[#7a6650]">Taschen leer. Noch.</div>
                )}
                {ui.inv.map((id) => (
                  <button
                    key={id}
                    title={itemName(id, game)}
                    onClick={() => game.clickItem(id)}
                    onPointerEnter={() => game.hoverInv(id)}
                    onPointerLeave={() => game.hoverInv(null)}
                    className={`flex aspect-square items-center justify-center rounded-md border transition ${
                      ui.sel === id ? "border-[#9fe0ff] bg-[#1c2a34]" : "border-[#2a1e14] bg-[#1a120c] hover:bg-[#2a1c12]"
                    }`}
                  >
                    <img src={itemIcon(id)} alt={itemName(id, game)} className="h-[80%] w-[80%] object-contain" draggable={false} />
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="text-center font-[Kanit] text-xs text-[#7a6650]">
            Verb wählen, dann auf etwas klicken · Rechtsklick = Anschauen / Reden · Leertaste überspringt Text · Spielstand speichert automatisch
          </p>
        </>
      )}
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#5a3a20] bg-black/55 text-base text-[#f3dfb0] backdrop-blur hover:bg-black/75"
    >
      {children}
    </button>
  );
}

function TitleScreen({ hasSave, onNew, onContinue }: { hasSave: boolean; onNew: () => void; onContinue: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/30 via-black/10 to-black/70 px-4 text-center">
      <div className="font-[Kanit] text-[10px] uppercase tracking-[0.35em] text-[#f3dfb0]/80 sm:text-sm">Ein Piraten-Abenteuer in zwei Kapiteln</div>
      <h1 className="mt-1 font-[Pirata_One] text-4xl leading-none text-[#f2c76b] drop-shadow-[0_4px_20px_rgba(255,160,60,0.6)] sm:text-7xl lg:text-8xl">
        Die Gezeiten von Krabbenbucht
      </h1>
      <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-8 sm:gap-3">
        <button onClick={onNew} className="rounded-full border-2 border-[#e9c873] bg-[#3a2410]/90 px-5 py-2 font-[Kanit] text-sm font-semibold text-[#ffe9a8] shadow-lg hover:bg-[#5a3818] sm:px-7 sm:py-3 sm:text-lg">
          Neues Spiel
        </button>
        {hasSave && (
          <button onClick={onContinue} className="rounded-full border-2 border-[#9fe0ff]/70 bg-[#0c1a24]/90 px-5 py-2 font-[Kanit] text-sm font-semibold text-[#cfefff] shadow-lg hover:bg-[#14283a] sm:px-7 sm:py-3 sm:text-lg">
            Weiterspielen
          </button>
        )}
      </div>
    </div>
  );
}

function EndScreen({ onAgain }: { onAgain: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-4 text-center">
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
