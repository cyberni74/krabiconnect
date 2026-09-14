import { createFileRoute } from "@tanstack/react-router";
import { agentJson, agentOptions, agentUnauthorized } from "@/lib/server/agent-http";

export const Route = createFileRoute("/api/agent/listings/$id/translate-seed")({
  server: {
    handlers: {
      OPTIONS: () => agentOptions(),
      POST: async ({ request, params }) => {
        const { seedAgentListingEnglish, verifyAgentToken } = await import("@/lib/server/agent.server");
        const auth = await verifyAgentToken(request.headers.get("authorization"));
        if (!auth.ok) return agentUnauthorized(auth);
        const id = params.id?.trim();
        if (!id) return agentJson({ ok: false, error: "Listing id required" }, 400);
        try {
          return agentJson(await seedAgentListingEnglish(id));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          const code = (err as Error & { status?: number }).status;
          const status = code === 404 ? 404 : code === 422 ? 422 : 400;
          return agentJson({ ok: false, error: message }, status);
        }
      },
    },
  },
});
