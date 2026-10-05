# Bilder – Übersicht (SEO-Namen & Komprimierung)

| Pfad | Quelle | Größe / Format |
|---|---|---|
| `/images/koh-hong-krabi-luftaufnahme-strand-lagune.webp` (+ `-720.webp`) | Owner-Foto (Hero) | 186 KB / 111 KB WebP, Metadaten entfernt |
| `/images/krabi-secret-islands-privates-speedboat.webp` (+ `-900.webp`, `.jpg`) | Owner-Foto (Boot, og:image) | 229 KB / 96 KB WebP, 325 KB JPG (progressiv) |
| `/bilder/<seo-name>.webp` (21 Dateien, Liste in `src/components/secret-islands/image-map.ts`) | Higgsfield (2K, `_min.webp`) | über Same-Origin-Proxy, 1 Jahr Edge-Cache |

`/bilder/*` wird von `src/routes/bilder.$file.ts` aus dem Higgsfield-CDN geladen und von Vercel gecacht.
Sobald `d8j0ntlcm91z4.cloudfront.net` im Netzwerkzugang erlaubt ist: Dateien herunterladen, nach `public/images/`
legen (Namen aus `image-map.ts` übernehmen), mit `convert -strip -quality 78` + 900px-Variante komprimieren und
`seoImage()` auf `/images/` umstellen.
