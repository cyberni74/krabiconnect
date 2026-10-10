import { useRef, type KeyboardEvent, type PointerEvent } from "react";

/**
 * Horizontal slider built on pointer events, not a native <input type="range">.
 * iOS browsers let the native control swallow vertical swipes, so the page could
 * not be scrolled from that spot. Here sideways drags move the thumb and up/down
 * drags are left to the page (touch-action: pan-y).
 */
export function TimeSlider({
  value,
  max,
  onChange,
  label,
  valueText,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  valueText: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pct = max > 0 ? (value / max) * 100 : 0;

  const fromX = (clientX: number) => {
    const el = track.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    onChange(Math.round(f * max));
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    fromX(e.clientX);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) fromX(e.clientX);
  };
  const stop = () => {
    dragging.current = false;
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? Math.max(1, Math.round(max / 24)) : 1;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(max, value + step));
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(0, value - step));
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={track}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      onKeyDown={onKey}
      style={{ touchAction: "pan-y" }}
      className="relative h-11 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
    >
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded bg-white/15" />
      <div
        className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded bg-gradient-to-r from-sky-400 to-sky-300"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-1/2 flex h-7 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-cyan-300 bg-[#0b1826] shadow-[0_0_12px_rgb(103_232_249_/_0.35)]"
        style={{ left: `${pct}%` }}
      >
        <div className="h-3.5 w-px bg-cyan-200" />
      </div>
    </div>
  );
}
