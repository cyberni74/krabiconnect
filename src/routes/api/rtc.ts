import { createFileRoute } from "@tanstack/react-router";

/** A peer drops out of the roster after this long without polling. */
const PEER_TTL_SECONDS = 15;
const SIGNAL_TTL_SECONDS = 120;
const ID_RE = /^[A-Za-z0-9_-]{4,64}$/;
const KINDS = new Set(["offer", "answer", "ice"]);
const MAX_PAYLOAD = 16_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function db() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

/**
 * WebRTC signaling relay for KRABI CLASH online rooms (the contract
 * `src/lib/multiplayer/p2p.ts` polls). GET registers/refreshes the caller and
 * returns the room roster plus signals addressed to it; POST relays one signal
 * or leaves the room. Game data never passes through here.
 */
export const Route = createFileRoute("/api/rtc")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const room = url.searchParams.get("room") ?? "";
        const peer = url.searchParams.get("peer") ?? "";
        const name = (url.searchParams.get("name") ?? "").slice(0, 32);
        const since = Number(url.searchParams.get("since") ?? "0") || 0;
        if (!ID_RE.test(room) || !ID_RE.test(peer)) return json({ error: "bad id" }, 400);
        try {
          const sql = await db();
          await sql`
            insert into fight_peers (room, peer, name) values (${room}, ${peer}, ${name})
            on conflict (room, peer) do update set seen_at = now(), name = excluded.name`;
          if (Math.random() < 0.1) {
            await sql`delete from fight_peers where seen_at < now() - make_interval(secs => ${PEER_TTL_SECONDS * 4})`;
            await sql`delete from fight_signals where created_at < now() - make_interval(secs => ${SIGNAL_TTL_SECONDS})`;
          }
          const peers = await sql<{ id: string; name: string }>`
            select peer as id, name from fight_peers
            where room = ${room} and seen_at > now() - make_interval(secs => ${PEER_TTL_SECONDS})
            order by joined_at asc, peer asc`;
          const rows = await sql<{ id: number; from: string; kind: string; payload: string }>`
            select id, from_peer as "from", kind, payload from fight_signals
            where room = ${room} and to_peer = ${peer} and id > ${since}
            order by id asc limit 200`;
          const signals = rows.map((r) => {
            let payload: unknown = null;
            try {
              payload = JSON.parse(r.payload);
            } catch {
              payload = null;
            }
            return { id: Number(r.id), from: r.from, kind: r.kind, payload };
          });
          return json({ peers, signals });
        } catch (err) {
          console.error("[rtc] poll failed", err);
          return json({ error: "unavailable" }, 503);
        }
      },
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
        if (!body) return json({ error: "bad body" }, 400);
        const room = typeof body.room === "string" ? body.room : "";
        if (!ID_RE.test(room)) return json({ error: "bad room" }, 400);
        try {
          const sql = await db();
          if (body.op === "leave") {
            const peer = typeof body.peer === "string" ? body.peer : "";
            if (!ID_RE.test(peer)) return json({ error: "bad peer" }, 400);
            await sql`delete from fight_peers where room = ${room} and peer = ${peer}`;
            return json({ ok: true });
          }
          if (body.op === "signal") {
            const from = typeof body.from === "string" ? body.from : "";
            const to = typeof body.to === "string" ? body.to : "";
            const kind = typeof body.kind === "string" ? body.kind : "";
            if (!ID_RE.test(from) || !ID_RE.test(to) || !KINDS.has(kind)) {
              return json({ error: "bad signal" }, 400);
            }
            const payload = JSON.stringify(body.payload ?? null);
            if (payload.length > MAX_PAYLOAD) return json({ error: "too large" }, 413);
            await sql`
              insert into fight_signals (room, from_peer, to_peer, kind, payload)
              values (${room}, ${from}, ${to}, ${kind}, ${payload})`;
            return json({ ok: true });
          }
          return json({ error: "bad op" }, 400);
        } catch (err) {
          console.error("[rtc] post failed", err);
          return json({ error: "unavailable" }, 503);
        }
      },
    },
  },
});
