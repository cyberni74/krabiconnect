import { createFileRoute } from "@tanstack/react-router";

/** A browser tab counts as online for this long after its last heartbeat. */
const ONLINE_SECONDS = 75;
/** Rows older than this are deleted. */
const KEEP_MINUTES = 10;
const ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function countOnline(): Promise<number> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ n: number }>`
    select count(*)::int as n from tide_presence
    where seen_at > now() - make_interval(secs => ${ONLINE_SECONDS})`;
  return Number(rows[0]?.n ?? 0);
}

/**
 * Anonymous presence counter for CAPTAIN TIDE. The page sends a random per-tab id every
 * 30 s; the count is how many ids were seen in the last minute or so. No IP, no cookie.
 * Any failure (no database, etc.) answers { online: null } and the page hides the counter.
 */
export const Route = createFileRoute("/api/presence")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return json({ online: await countOnline() });
        } catch {
          return json({ online: null });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
          const id = typeof body?.id === "string" ? body.id : "";
          if (!ID_RE.test(id)) return json({ online: null }, 400);
          const { getSql } = await import("@/lib/db");
          const sql = await getSql();
          await sql`
            insert into tide_presence (id, seen_at) values (${id}, now())
            on conflict (id) do update set seen_at = now()`;
          // Housekeeping on roughly every tenth heartbeat keeps the table tiny.
          if (Math.random() < 0.1) {
            await sql`delete from tide_presence where seen_at < now() - make_interval(mins => ${KEEP_MINUTES})`;
          }
          return json({ online: await countOnline() });
        } catch {
          return json({ online: null });
        }
      },
    },
  },
});
