/** The 32 supplied Pak Nam Krabi illustrations, highest water first. */
export const FRAME_LEVELS: number[] = [
  388, 378, 368, 358, 348, 338, 328, 318, 308, 298, 288, 278, 268, 258, 248, 238, 228, 218, 208,
  198, 188, 178, 168, 158, 148, 138, 128, 118, 108, 98, 88, 84,
];

export const FRAME_MAX = FRAME_LEVELS[0];
export const FRAME_MIN = FRAME_LEVELS[FRAME_LEVELS.length - 1];

export function frameSrc(index: number): string {
  const n = String(index + 1).padStart(2, "0");
  const cm = String(FRAME_LEVELS[index]).padStart(3, "0");
  return `/tide/frames/${n}_krabi_${cm}cm.webp`;
}

/**
 * Index of the illustration closest to `cm`. Values outside the illustrated
 * span clamp to the nearest end frame — the real number is shown separately.
 */
export function frameIndexFor(cm: number): number {
  if (!Number.isFinite(cm)) return Math.floor(FRAME_LEVELS.length / 2);
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < FRAME_LEVELS.length; i++) {
    const d = Math.abs(FRAME_LEVELS[i] - cm);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
