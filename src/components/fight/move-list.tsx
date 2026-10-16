import { CHARS, CHAR_IDS } from "@/lib/fight/data";
import { ArcadeButton, DISPLAY, Kbd } from "./ui";

const ROWS: [string, React.ReactNode][] = [
  ["Laufen / Springen / Ducken", <><Kbd>←</Kbd> <Kbd>→</Kbd> <Kbd>↑</Kbd> <Kbd>↓</Kbd></>],
  ["Dash / Backdash", <><Kbd>→</Kbd><Kbd>→</Kbd> / <Kbd>←</Kbd><Kbd>←</Kbd> (Backdash ist kurz unverwundbar)</>],
  ["Jab (schnell, combofähig)", <Kbd>P</Kbd>],
  ["Roundhouse (stark)", <Kbd>K</Kbd>],
  ["Aufwärtshaken (Anti-Air, Launcher)", <><Kbd>→</Kbd> + <Kbd>P</Kbd></>],
  ["Tiefschlag / Feger (tief, Feger wirft um)", <><Kbd>↓</Kbd> + <Kbd>P</Kbd> / <Kbd>↓</Kbd> + <Kbd>K</Kbd></>],
  ["Sprungangriffe (Overhead – stehend blocken!)", <>in der Luft <Kbd>P</Kbd> / <Kbd>K</Kbd></>],
  ["Wurf (unblockbar)", <><Kbd>P</Kbd>+<Kbd>K</Kbd> nah am Gegner</>],
  ["Wurf-Konter (Tech)", <><Kbd>P</Kbd>+<Kbd>K</Kbd> kurz nachdem du gegriffen wirst</>],
  ["Spezialangriff", <><Kbd>S</Kbd> oder <Kbd>↓</Kbd><Kbd>↘</Kbd><Kbd>→</Kbd>+<Kbd>P</Kbd></>],
  ["SUPER (volle Leiste)", <><Kbd>↓</Kbd> + <Kbd>S</Kbd></>],
  ["Blocken (hoch / tief)", <>vom Gegner weg halten · mit <Kbd>↓</Kbd> tief</>],
  ["PARRY", <>Block erst im letzten Moment drücken → kein Schaden, +Energie</>],
];

const NOTES = [
  "Combos: Jab trifft → sofort in Kick, Spezial oder Super abbrechen. Schaden pro Treffer sinkt in langen Combos.",
  "Konter: Wer den Gegner in seiner Startphase trifft, macht +20 % Schaden.",
  "Guard-Leiste (blau unter der HP): Zu viel Blocken führt zum GUARD BREAK.",
  "Super-Energie füllt sich durch Treffen, Getroffenwerden, Blocken und Parrys – und bleibt zwischen Runden erhalten.",
  "Projektile: Zwei Feuerbälle löschen sich gegenseitig aus. Supers schießen durch.",
];

export function MoveList({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="my-6 w-full max-w-3xl rounded-2xl border border-white/10 bg-zinc-950/95 p-5 text-white shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl" style={DISPLAY}>
            Moves & Mechaniken
          </h2>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Schließen">
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs text-white/50">
          P = Schlag (F / K) · K = Kick (G / L) · S = Spezial (H / Ö) · Gamepad: A/X Schlag, B/Y Kick, Schultertasten Spezial
        </p>
        <div className="mt-4 divide-y divide-white/5 rounded-lg border border-white/10">
          {ROWS.map(([name, keys]) => (
            <div key={name} className="flex flex-col gap-1 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="text-white/85">{name}</span>
              <span className="text-xs text-white/70">{keys}</span>
            </div>
          ))}
        </div>
        <ul className="mt-4 space-y-1.5 text-sm text-white/75">
          {NOTES.map((n) => (
            <li key={n} className="flex gap-2">
              <span className="text-amber-300">▸</span>
              {n}
            </li>
          ))}
        </ul>
        <h3 className="mt-6 text-lg" style={DISPLAY}>
          Kämpfer
        </h3>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {CHAR_IDS.map((id) => {
            const c = CHARS[id];
            return (
              <div key={id} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <img src={`/fight/${id}_idle.webp`} alt="" className="h-20 w-12 object-contain" />
                <div className="text-xs leading-relaxed text-white/75">
                  <p className="text-sm text-white" style={{ ...DISPLAY, color: c.color }}>
                    {c.name}
                  </p>
                  <p>
                    <b className="text-white">Spezial:</b> {c.special.name}
                  </p>
                  <p>
                    <b className="text-white">Super:</b> {c.superMove.name}
                  </p>
                  <p>
                    <b className="text-white">{c.passive}:</b> {c.passiveDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-center">
          <ArcadeButton onClick={onClose}>Verstanden</ArcadeButton>
        </div>
      </div>
    </div>
  );
}
