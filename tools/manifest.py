#!/usr/bin/env python3
"""Writes src/adventure/manifest.json: sprite sizes (stored px) for every asset under public/g."""
import json, os, glob
from PIL import Image
root = 'public/g'
m = {}
for kind in ('props', 'items', 'chars', 'bg'):
    m[kind] = {}
    for f in sorted(glob.glob(f'{root}/{kind}/*.*')):
        k = os.path.splitext(os.path.basename(f))[0]
        w, h = Image.open(f).size
        m[kind][k] = [w, h]
json.dump(m, open('src/adventure/manifest.json', 'w'), separators=(',', ':'))
print({k: len(v) for k, v in m.items()})
