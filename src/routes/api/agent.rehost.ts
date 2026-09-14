import { createFileRoute } from "@tanstack/react-router";
import { agentJson, agentOptions, agentUnauthorized } from "@/lib/server/agent-http";

export const Route = createFileRoute("/api/agent/rehost")({
  server: {
    handlers: {
      OPTIONS: () => agentOptions(),
      POST: async ({ request }) => {
        const { verifyAgentToken } = await import("@/lib/server/agent.server");
        const auth = await verifyAgentToken(request.headers.get("authorization"));
        if (!auth.ok) return agentUnauthorized(auth);
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return agentJson({ ok: false, error: "Invalid JSON" }, 400);
        }
        const url =
          body && typeof body === "object" && "url" in body && typeof (body as { url: unknown }).url === "string"
            ? (body as { url: string }).url
            : "";
        if (!url.trim()) return agentJson({ ok: false, error: "Body must include url: string" }, 400);
        try {
          const { rehostRemoteImage } = await import("@/lib/server/image-rehost");
          const result = await rehostRemoteImage(url);
          return agentJson(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          const status = (err as Error & { status?: number }).status;
          const code = status === 503 ? 503 : status === 400 ? 400 : 502;
          return agentJson({ ok: false, error: message }, code);
        }
      },
    },
  },
});
