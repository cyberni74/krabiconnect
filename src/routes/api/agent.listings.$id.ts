import { createFileRoute } from "@tanstack/react-router";
import { agentJson, agentOptions, agentUnauthorized } from "@/lib/server/agent-http";

function listingIdFrom(request: Request, params: { id?: string } | undefined): string {
  if (params?.id?.trim()) return params.id.trim();
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  if (last === "translate-seed") return parts[parts.length - 2] ?? "";
  return last;
}

async function withAgent<T>(
  request: Request,
  run: () => Promise<T>,
): Promise<Response> {
  const { verifyAgentToken } = await import("@/lib/server/agent.server");
  const auth = await verifyAgentToken(request.headers.get("authorization"));
  if (!auth.ok) return agentUnauthorized(auth);
  try {
    return agentJson(await run());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const code = (err as Error & { status?: number }).status;
    const status = code === 404 ? 404 : code === 422 ? 422 : 400;
    return agentJson({ ok: false, error: message }, status);
  }
}

export const Route = createFileRoute("/api/agent/listings/$id")({
  server: {
    handlers: {
      OPTIONS: () => agentOptions(),
      PATCH: async ({ request, params }) => {
        const id = listingIdFrom(request, params);
        if (!id) return agentJson({ ok: false, error: "Listing id required" }, 400);
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return agentJson({ ok: false, error: "Invalid JSON" }, 400);
        }
        return withAgent(request, async () => {
          const { patchAgentListing } = await import("@/lib/server/agent.server");
          return patchAgentListing(id, body);
        });
      },
      POST: async ({ request, params }) => {
        const id = listingIdFrom(request, params);
        if (!id) return agentJson({ ok: false, error: "Listing id required" }, 400);
        return withAgent(request, async () => {
          const { seedAgentListingEnglish } = await import("@/lib/server/agent.server");
          return seedAgentListingEnglish(id);
        });
      },
    },
  },
});
