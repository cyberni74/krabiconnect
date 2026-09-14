import { createFileRoute } from "@tanstack/react-router";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
};

export const Route = createFileRoute("/api/agent")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        const { AGENT_SCHEMA } = await import("@/lib/server/agent.server");
        return Response.json(
          {
            name: "KrabiMarketplace agent API",
            schema: AGENT_SCHEMA,
            endpoints: {
              "GET /api/agent/listings": "Validate Bearer token → { ok, valid }",
              "POST /api/agent/listings":
                "Create listings. Duplicate sourceUrl/id is not a second row; empty/fbid-HTML images are upgraded from incoming images[].",
              "PATCH /api/agent/listings/:id": "Replace images (cover = images[0]). Bearer token required.",
              "GET /api/img?u=": "Public image proxy for listing heroes (fbcdn). No agent token.",
              "POST /api/agent/rehost":
                "Bearer token. { url } → Vercel Blob { ok, url }. 503 if BLOB_READ_WRITE_TOKEN is unset.",
            },
          },
          { headers: cors },
        );
      },
    },
  },
});
