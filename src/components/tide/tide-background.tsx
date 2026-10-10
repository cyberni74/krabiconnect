import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { FRAME_LEVELS, frameSrc } from "@/lib/tide/frames";

const loaded = new Set<number>();
const pending = new Map<number, Promise<void>>();

export function preloadFrame(i: number): Promise<void> {
  if (i < 0 || i >= FRAME_LEVELS.length || loaded.has(i)) return Promise.resolve();
  const existing = pending.get(i);
  if (existing) return existing;
  const p = new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.src = frameSrc(i);
    const done = () => {
      loaded.add(i);
      pending.delete(i);
      resolve();
    };
    (img.decode ? img.decode() : Promise.reject()).then(done, () => {
      img.onload = done;
      img.onerror = () => {
        pending.delete(i);
        resolve();
      };
      if (img.complete) done();
    });
  });
  pending.set(i, p);
  return p;
}

/**
 * Full-bleed illustration stack. The target frame is decoded before it is
 * shown, then cross-faded in, so scrubbing never flashes an empty layer.
 * Neighbouring frames (direction of travel first) are preloaded.
 */
export function TideBackground({
  index,
  dim = 0,
  blur = false,
}: {
  index: number;
  dim?: number;
  blur?: boolean;
}) {
  const [shown, setShown] = useState(index);

  useEffect(() => {
    let cancelled = false;
    preloadFrame(index).then(() => {
      if (!cancelled) setShown(index);
    });
    const dir = index >= shown ? 1 : -1;
    for (const d of [1, 2, 3, -1, -2]) void preloadFrame(index + d * dir);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#06223a]" aria-hidden>
      <AnimatePresence initial={false}>
        <motion.img
          key={shown}
          src={frameSrc(shown)}
          alt=""
          draggable={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{ filter: blur ? "blur(14px) saturate(1.1)" : undefined }}
        />
      </AnimatePresence>
      {dim > 0 ? (
        <div
          className="absolute inset-0 transition-colors duration-700"
          style={{ background: `rgba(3, 17, 35, ${dim})` }}
        />
      ) : null}
    </div>
  );
}
