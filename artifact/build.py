#!/usr/bin/env python3
"""Inlines the built JS/CSS into artifact/index.html (the hosted page); assets stay in public/g."""
import pathlib
d = pathlib.Path(__file__).parent
js = (d / "dist/game.js").read_text().replace("</script", "<\\/script")
css = (d / "dist/game.css").read_text()
html = f"""<title>Rabenschwur</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,400;0,600;1,400&family=Pirata+One&display=swap">
<style>
:root{{color-scheme:dark}}
html,body{{margin:0;height:100%;background:#050404;color:#e9d9a8}}
{css}
</style>
<div id="root"></div>
<script>window.__ASSET_BASE="./";</script>
<script>{js}</script>
"""
(d / "index.html").write_text(html)
print(len(html))
