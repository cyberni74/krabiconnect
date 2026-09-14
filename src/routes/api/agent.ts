import { createFileRoute } from "@tanstack/react-router";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const Route = createFileRoute("/api/agent")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        const { AGENT_SCHEMA } = await import("@/lib/server/agent.server");
        return Response.json({ name: "KrabiMarketplace agent API", schema: AGENT_SCHEMA }, { headers: cors });
      },
    },
  },
});
