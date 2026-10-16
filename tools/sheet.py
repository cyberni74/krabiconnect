#!/usr/bin/env python3
"""Cut a transparent sprite sheet into single trimmed sprites.

usage: sheet.py SHEET.png OUTDIR name1,name2,... [--cols N] [--maxh PX] [--ref IDX --refh PX] [--align feet|center] [--pad]
Components are found on the alpha channel (dilated so detached parts like a hammer stay with their sprite),
ordered row-major, trimmed, scaled and saved as OUTDIR/<name>.png.
"""
import sys, argparse, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

def components(im, dil=14, minarea=900, thr=40):
    a = np.array(im.split()[3]) > thr
    d = ndi.binary_dilation(a, iterations=dil)
    lab, n = ndi.label(d)
    out = []
    for i in range(1, n + 1):
        ys, xs = np.nonzero((lab == i) & a)
        if len(xs) < minarea: continue
        out.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    return out

def order(boxes, rows):
    if rows <= 1: return sorted(boxes, key=lambda b: b[0])
    ys = sorted(boxes, key=lambda b: (b[1] + b[3]) / 2)
    per = len(boxes) // rows
    res = []
    for r in range(rows):
        row = ys[r * per:(r + 1) * per] if r < rows - 1 else ys[r * per:]
        res += sorted(row, key=lambda b: b[0])
    return res

def main():
    p = argparse.ArgumentParser()
    p.add_argument('sheet'); p.add_argument('out'); p.add_argument('names')
    p.add_argument('--rows', type=int, default=1)
    p.add_argument('--maxh', type=int, default=0)       # scale so the tallest sprite is at most this
    p.add_argument('--maxw', type=int, default=0)
    p.add_argument('--ref', type=int, default=-1)       # index of reference sprite
    p.add_argument('--refh', type=int, default=0)       # height the reference sprite should get
    p.add_argument('--scale', type=float, default=0)    # fixed scale (overrides)
    p.add_argument('--heights', default='')           # per-sprite logical heights (stored at 2x)
    p.add_argument('--minarea', type=int, default=250)
    p.add_argument('--dil', type=int, default=14)
    p.add_argument('--density', type=int, default=2)   # stored px per logical unit
    p.add_argument('--thr', type=int, default=40)
    p.add_argument('--canvas', action='store_true')     # pad all to common canvas, feet at bottom, centered
    a = p.parse_args()
    im = Image.open(a.sheet).convert('RGBA')
    names = a.names.split(',')
    k = im.width / 1344.0   # sheets generated at 2k are ~2x larger: scale thresholds
    boxes = [b for b in components(im, dil=round(a.dil * k), minarea=round(a.minarea * k * k), thr=a.thr) if not ((b[3]-b[1]) > 700 * k and (b[2]-b[0]) < 130 * k)]
    boxes = order(boxes, a.rows)
    if len(boxes) != len(names):
        print(f'ERROR found {len(boxes)} components, expected {len(names)}: {boxes}'); sys.exit(2)
    crops = [im.crop(b) for b in boxes]
    if a.scale: s = a.scale
    elif a.ref >= 0 and a.refh: s = a.refh * a.density / crops[a.ref].height
    elif a.maxh: s = a.maxh / max(c.height for c in crops)
    else: s = 1.0
    if a.maxw: s = min(s, a.maxw / max(c.width for c in crops))
    if a.heights:
        hs = [int(x) * a.density for x in a.heights.split(',')]
        outs = [c.resize((max(1, round(c.width * h / c.height)), h), Image.LANCZOS) for c, h in zip(crops, hs)]
    else:
        outs = [c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS) for c in crops]
    os.makedirs(a.out, exist_ok=True)
    if a.canvas:
        W = max(o.width for o in outs); H = max(o.height for o in outs)
        res = []
        for o in outs:
            c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); c.paste(o, ((W - o.width) // 2, H - o.height)); res.append(c)
        outs = res
    for n, o in zip(names, outs):
        o.save(os.path.join(a.out, n + '.png'), optimize=True)
    print('ok', len(outs), 'scale %.3f' % s, [o.size for o in outs][:4])

main()
