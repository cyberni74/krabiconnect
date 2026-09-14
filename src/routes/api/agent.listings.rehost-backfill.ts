import { createFileRoute } from "@tanstack/react-router";
import { agentJson, agentOptions, agentUnauthorized } from "@/lib/server/agent-http";

export const Route = createFileRoute("/api/agent/listings/rehost-backfill")({
  server: {
    handlers: {
      OPTIONS: () => agentOptions(),
      POST: async ({ request }) => {
        const { rehostBackfillAgentListings, verifyAgentToken } = await import(
          "@/lib/server/agent.server"
        );
        const auth = await verifyAgentToken(request.headers.get("authorization"));
        if (!auth.ok) return agentUnauthorized(auth);
        let body: unknown = {};
        const ct = request.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          try {
            body = await request.json();
          } catch {
            return agentJson({ ok: false, error: "Invalid JSON" }, 400);
          }
        }
        try {
          const result = await rehostBackfillAgentListings(body);
          return agentJson(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          const status = (err as Error & { status?: number }).status;
          const code = (err as Error & { code?: string }).code;
          return agentJson(
            { ok: false, error: message, ...(code ? { code } : {}) },
            typeof status === "number" ? status : 400,
          );
        }
      },
    },
  },
});
