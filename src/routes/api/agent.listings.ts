import { createFileRoute } from "@tanstack/react-router";
import { agentJson, agentOptions, agentUnauthorized } from "@/lib/server/agent-http";

export const Route = createFileRoute("/api/agent/listings")({
  server: {
    handlers: {
      OPTIONS: () => agentOptions(),
      GET: async ({ request }) => {
        const { verifyAgentToken } = await import("@/lib/server/agent.server");
        const auth = await verifyAgentToken(request.headers.get("authorization"), { touch: true });
        if (!auth.ok) return agentUnauthorized(auth);
        return agentJson({ ok: true, valid: true });
      },
      POST: async ({ request }) => {
        const { ingestAgentListings, verifyAgentToken } = await import("@/lib/server/agent.server");
        const auth = await verifyAgentToken(request.headers.get("authorization"));
        if (!auth.ok) return agentUnauthorized(auth);
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return agentJson({ ok: false, error: "Invalid JSON" }, 400);
        }
        try {
          const result = await ingestAgentListings(body as Parameters<typeof ingestAgentListings>[0]);
          return agentJson(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          return agentJson({ ok: false, error: message }, 400);
        }
      },
    },
  },
});
