/**
 * Pixel sprites. One sprite pixel = one pixel of the 240×110 world buffer,
 * so the 4× pixel pass in the game view turns each into a 4×4 block.
 * Maps are rows of characters; "." is transparent, every other character is looked up in the palette.
 */
type C = CanvasRenderingContext2D;

export interface Sprite {
  palette: Record<string, string>;
  /** Upper body, feet at the bottom of the last row. */
  body: string[];
  /** Two leg frames for the walk cycle (each 4 rows). */
  legsA: string[];
  legsB: string[];
  /** Standing legs. */
  legsIdle: string[];
}

const NOK: Sprite = {
  palette: { H: "#1e1410", L: "#fff2a0", s: "#d9a06c", S: "#b07a4c", e: "#111111", m: "#7a3a2a", w: "#1f8f9a", W: "#14606a", b: "#e8a33a", B: "#b87420", f: "#2a4a8a" },
  body: [
    "...HHHHHH...",
    "..HHHHHHHH..",
    "..HHLLLHHH..",
    ".HHssssssHH.",
    ".HsesssesHH.",
    "..ssssssss..",
    "..SssmmssS..",
    "...ssssss...",
    "..wwwwwwww..",
    ".wwwwwwwwww.",
    ".swwwwwwwws.",
    ".swwwwwwwws.",
    "..wwwwwwww..",
    "..bbbbbbbb..",
    ".bbBbbbbBbb.",
    ".bbbbbbbbbb.",
    "..BBBBBBBB..",
    "...bb..bb...",
  ],
  legsIdle: ["...ww..ww...", "...ww..ww...", "...ww..ww...", "..ffff.ffff."],
  legsA: ["..ww...ww...", "..ww...ww...", "..ww...ww...", ".ffff...ffff"],
  legsB: ["...wwww.....", "...wwww.....", "...wwww.....", "...ffffff..."],
};

const SORN: Sprite = {
  palette: { h: "#c9a24a", H: "#8a6a2a", s: "#b57a4e", e: "#111111", M: "#1a1a1a", t: "#c4422e", T: "#8a2a1e", b: "#2a1a10", p: "#3a4a6a", P: "#2a3450" },
  body: [
    ".....HH.....",
    "....hhhh....",
    "...hhhhhh...",
    "..hhhhhhhh..",
    "HHHHHHHHHHHH",
    "...sessss...",
    "...ssMMss...",
    "....ssss....",
    "..tttttttt..",
    ".tttTTTtttt.",
    ".tttttttttt.",
    ".stttttttts.",
    ".ssttttttss.",
    "..bbbbbbbb..",
    "..pppppppp..",
    "..pppppppp..",
    "..pPpppPpp..",
    "..pp..pp....",
  ],
  legsIdle: ["...pp..pp...", "...pp..pp...", "...pp..pp...", "..bbbb.bbbb."],
  legsA: ["..pp...pp...", "..pp...pp...", "..pp...pp...", ".bbbb...bbbb"],
  legsB: ["...pppp.....", "...pppp.....", "...pppp.....", "...bbbbbb..."],
};

const PLOY: Sprite = {
  palette: { B: "#c9c4bc", s: "#a66a40", g: "#e8e0c0", m: "#5a2a1a", G: "#3a8a5a", y: "#f2d24a", q: "#6a3a8a", Q: "#4a2470", b: "#4a2a18" },
  body: [
    "....BBBB....",
    "...BBBBBB...",
    "..BBssssBB..",
    "..BsgggsBB..",
    "..BssssssB..",
    "...ssmmss...",
    "....ssss....",
    "..GGGGGGGG..",
    ".GGyGGGGyGG.",
    ".GGGGGGGGGG.",
    ".sGGGGGGGGs.",
    ".ssGGGGGGss.",
    "..qqqqqqqq..",
    ".qqqQQQQqqq.",
    ".qqqqqqqqqq.",
    ".qqqqqqqqqq.",
    "..QQQQQQQQ..",
    "...qq..qq...",
  ],
  legsIdle: ["...qq..qq...", "...qq..qq...", "...qq..qq...", "..bbbb.bbbb."],
  legsA: ["..qq...qq...", "..qq...qq...", "..qq...qq...", ".bbbb...bbbb"],
  legsB: ["...qqqq.....", "...qqqq.....", "...qqqq.....", "...bbbbbb..."],
};

const MONKEY: Sprite = {
  palette: { m: "#7a4a2a", M: "#4a2a18", f: "#d8a878", e: "#111111" },
  body: ["..mmmm..", ".mmmmmm.", "mmfffffm", "mfeffefm", "mffffffm", ".mMMMMm.", ".mMMMMm.", "mmM..Mmm"],
  legsIdle: [],
  legsA: [],
  legsB: [],
};

export const SPRITES = { nok: NOK, sorn: SORN, ploy: PLOY, monkey: MONKEY };
export { NOK, SORN, PLOY, MONKEY };

/** Draws a sprite with its feet at (x, y) in logical scene coordinates. `px` = logical size of one sprite pixel. */
export function drawSprite(ctx: C, sp: Sprite, x: number, y: number, px: number, opts: { facing?: 1 | -1; legs?: "idle" | "a" | "b"; bob?: number; arms?: -1 | 0 | 1 } = {}) {
  const legs = opts.legs === "a" ? sp.legsA : opts.legs === "b" ? sp.legsB : sp.legsIdle;
  const rows = [...sp.body, ...legs];
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const left = x - (w * px) / 2;
  const top = y - h * px + (opts.bob ?? 0);
  ctx.save();
  if (opts.facing === -1) {
    ctx.translate(x, 0);
    ctx.scale(-1, 1);
    ctx.translate(-x, 0);
  }
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === ".") continue;
      const col = sp.palette[ch];
      if (!col) continue;
      // arm swing: outer columns in the arm rows move up or down by one pixel
      const inArms = r >= 8 && r <= 12 && opts.arms;
      const armDy = inArms ? (c < 2 ? opts.arms! : c >= w - 2 ? -opts.arms! : 0) : 0;
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(left + c * px), Math.round(top + (r + armDy) * px), Math.ceil(px), Math.ceil(px));
    }
  });
  ctx.restore();
}

/** Shadow under a character, in the same pixel grid. */
export function spriteShadow(ctx: C, x: number, y: number, px: number, w = 12) {
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(Math.round(x - (w * px) / 2), Math.round(y - px), Math.round(w * px), Math.ceil(px));
}
