import { createFileRoute } from "@tanstack/react-router";
import { agentJson, agentOptions, agentUnauthorized } from "@/lib/server/agent-http";

function listingIdFrom(request: Request, params: { id?: string } | undefined): string {
  if (params?.id?.trim()) return params.id.trim();
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export const Route = createFileRoute("/api/agent/listings/$id")({
  server: {
    handlers: {
      OPTIONS: () => agentOptions(),
      PATCH: async ({ request, params }) => {
        const { patchAgentListingImages, verifyAgentToken } = await import("@/lib/server/agent.server");
        const auth = await verifyAgentToken(request.headers.get("authorization"));
        if (!auth.ok) return agentUnauthorized(auth);
        const id = listingIdFrom(request, params);
        if (!id) return agentJson({ ok: false, error: "Listing id required" }, 400);
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return agentJson({ ok: false, error: "Invalid JSON" }, 400);
        }
        try {
          const result = await patchAgentListingImages(id, body);
          return agentJson(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          const status = (err as Error & { status?: number }).status === 404 ? 404 : 400;
          return agentJson({ ok: false, error: message }, status);
        }
      },
    },
  },
});
