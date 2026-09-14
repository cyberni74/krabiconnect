import { createFileRoute } from "@tanstack/react-router";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: cors });
}

function unauthorized(body: unknown) {
  return Response.json(body, {
    status: 401,
    headers: {
      ...cors,
      "WWW-Authenticate": 'Bearer realm="KrabiMarketplace agent", error="invalid_token"',
    },
  });
}

export const Route = createFileRoute("/api/agent/listings")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        const { verifyAgentToken } = await import("@/lib/server/agent.server");
        const auth = await verifyAgentToken(request.headers.get("authorization"), { touch: true });
        if (!auth.ok) return unauthorized(auth);
        return json({ ok: true, valid: true });
      },
      POST: async ({ request }) => {
        const { ingestAgentListings, verifyAgentToken } = await import("@/lib/server/agent.server");
        const auth = await verifyAgentToken(request.headers.get("authorization"));
        if (!auth.ok) return unauthorized(auth);
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "Invalid JSON" }, 400);
        }
        try {
          const result = await ingestAgentListings(body as Parameters<typeof ingestAgentListings>[0]);
          return json(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          return json({ ok: false, error: message }, 400);
        }
      },
    },
  },
});
