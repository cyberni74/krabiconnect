# Übergabe – Krabi Secret Islands (Branch `feat/krabi-secret-islands`, PR #26)

## Nächster Schritt: Datenbank anlegen (Vercel)
Vercel-Projekt `krabimarketplace` (prj_yW3310eRxxNLq7JINKWIdQxcwrGU), Team `bernhardehmer-3885s-projects` (team_Sewsn2eWj2JUvmZVNX3GDcLq).

1. Prüfen, ob `DATABASE_URL` existiert (filter_project_envs). Wenn ja: für **Preview** freischalten.
2. Wenn nein: Neon Postgres (Region Singapore / ap-southeast-1, Free-Tarif) anlegen und mit dem Projekt
   für **Production + Preview** verbinden (setzt `DATABASE_URL`).
3. Optional E-Mail-Benachrichtigung: `RESEND_API_KEY`, `BOOKING_NOTIFY_EMAIL`, `BOOKING_FROM_EMAIL` (Production + Preview) – Werte vom Owner.
4. Neueste Preview des Branches neu deployen. Der Build führt `npm run db:migrate` aus → legt u. a. `booking_requests` an (migrations/0011).
5. Testen: `/secret-islands` → Buchung absenden → `/login?next=/secret-islands/anfragen` (Admin) → Anfrage sichtbar, Status ändern.

## Offene Punkte beim Owner
- Echte WhatsApp-Nummer (`BRAND.whatsapp` in `src/components/secret-islands/content.ts`, aktuell Platzhalter).
- Admin-Passwort steht im Code (`src/lib/server/admin-boot.server.ts`) → ändern bzw. auf Env `ADMIN_PASSWORD` umstellen.
- TAT-Lizenznummer, echte Bewertungen (`REVIEWS_VERIFIED`), Telefon/Adresse für JSON-LD.
- Netzwerkfreigabe `d8j0ntlcm91z4.cloudfront.net` → Higgsfield-Bilder nach `public/images/` holen (siehe `docs/images.md`).
- Hero-Foto: Querformat ≥ 1200 px; Rechte am Koh-Hong-Foto klären.

## Wichtige Doku
`docs/seo-report.md`, `docs/seo-plan.md`, `docs/image-seo-plan.md`, `docs/images.md`, `docs/marketing-review.md`, `docs/brand-assets.md`.
Agenten: `.claude/agents/{seo-content,google-seo,marketing,ui-qa,image-seo}.md`. QA-Skript: `node scripts/ui-qa.mjs`.
