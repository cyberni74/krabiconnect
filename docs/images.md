# Bilder – Übersicht (SEO-Namen & Komprimierung)

| Pfad | Quelle | Größe / Format |
|---|---|---|
| `/images/koh-hong-krabi-luftaufnahme-strand-lagune.webp` (+ `-720.webp`) | Owner-Foto (Hero) | 186 KB / 111 KB WebP, Metadaten entfernt |
| `/images/krabi-secret-islands-privates-speedboat.webp` (+ `-900.webp`, `.jpg`) | Owner-Foto (Boot, og:image) | 229 KB / 96 KB WebP, 325 KB JPG (progressiv) |
| `/bilder/<seo-name>.webp` (21 Dateien, Liste in `src/components/secret-islands/image-map.ts`) | Higgsfield (KI, 2K, `_min.webp`) | über Same-Origin-Proxy, 1 Jahr Edge-Cache |

`/bilder/*` wird von `src/routes/bilder.$file.ts` aus dem Higgsfield-CDN geladen und von Vercel gecacht.
Umbenannte Dateien (`RENAMED_IMAGES` in `image-map.ts`) antworten unter dem alten Namen mit **301** auf den neuen Namen.

Alt-Texte stehen zentral in `IMAGE_ALT` (`src/components/secret-islands/content.ts`, Schlüssel = Bild-URL). Neue Bilder
dort eintragen; jede neue deutsche Alt-Zeile braucht Einträge in `i18n/{zh,ko,ja}.ts` (Check: `extract.ts --missing`).

## TODO: Umzug nach /public/images (sobald `d8j0ntlcm91z4.cloudfront.net` erreichbar ist)

1. Alle Dateien aus `SEO_IMAGES` herunterladen und unter **demselben** Namen nach `public/images/` legen.
2. Komprimieren (WebP q≈78 + 900-px-Variante). **Achtung Metadaten** (siehe unten): bei KI-Bildern **nicht** `convert -strip`
   verwenden, bzw. danach `DigitalSourceType` wieder setzen.
3. `seoImage()` auf `/images/${name}` umstellen.
4. `src/routes/bilder.$file.ts` zum reinen Redirect-Handler machen: **alte** Namen (`RENAMED_IMAGES`) **und** aktuelle
   `/bilder/`-Namen jeweils direkt (ein Hop, keine Kette) per 301 auf `/images/<aktueller-name>`. Redirects ≥ 1 Jahr behalten.
5. Danach nie wieder umbenennen – KI-Szene später durch echtes Foto **unter demselben Dateinamen** ersetzen.
6. Alt-Texte gegen die echten Bilder prüfen (sie wurden aus den Generierungs-Prompts abgeleitet, weil das CDN beim Erstellen
   gesperrt war).

## KI-Kennzeichnung (IPTC DigitalSourceType)

Google liest den IPTC-Wert `DigitalSourceType` aus der Bilddatei und kann KI-Bilder in „Über dieses Bild“ als KI-generiert
ausweisen; Merchant Center verlangt ihn für KI-Bilder sogar. Google bittet ausdrücklich, diese Metadaten **nicht zu entfernen**.
Es gibt dafür keine schema.org-/JSON-LD-Eigenschaft – die Kennzeichnung gehört in die Datei.

| Bild | Wert |
|---|---|
| Alle Higgsfield-Szenen + Logo (`/bilder/*`) | `http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia` |
| Owner-Fotos, die mit generativer KI bearbeitet wurden (In-/Outpainting, Himmel getauscht …) | `http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia` |
| Unbearbeitete Owner-Fotos | kein DigitalSourceType nötig; stattdessen `Creator` + `CopyrightNotice` setzen |

```sh
# KI-Szenen (nach dem Komprimieren):
exiftool -overwrite_original \
  -XMP-iptcExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia" \
  public/images/<name>.webp
# Owner-Fotos: EXIF/GPS entfernen, Urheber wieder setzen
exiftool -overwrite_original -all= -XMP-dc:Creator="Krabi Secret Islands" \
  -XMP-dc:Rights="© Krabi Secret Islands" public/images/<name>.webp
```

TODO(owner): bestätigen, ob das Bootsfoto (`krabi-secret-islands-privates-speedboat.*`) KI-bearbeitet ist – dann
`compositeWithTrainedAlgorithmicMedia` setzen. Ebenso klären, ob das Hero-Foto von Koh Hong eigenes Material ist
(Nutzungsrechte).

Quellen: [Google – Image metadata](https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata),
[IPTC – Google announces use of IPTC metadata for generative AI images](https://iptc.org/news/google-announces-use-of-iptc-metadata-for-generative-ai-images/),
[IPTC – Google: don't strip metadata](https://iptc.org/news/google-reminds-publishers-and-merchants-not-to-strip-metadata-from-images/),
[Google – Using gen-AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content).
