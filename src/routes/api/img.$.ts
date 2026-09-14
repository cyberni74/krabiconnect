import { createFileRoute } from "@tanstack/react-router";

function splatFrom(request: Request, params: { _splat?: string } | undefined): string {
  if (params?._splat?.trim()) return params._splat.trim();
  const path = new URL(request.url).pathname;
  const prefix = "/api/img/";
  return path.startsWith(prefix) ? path.slice(prefix.length) : "";
}

export const Route = createFileRoute("/api/img/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { handleImageProxyRequest } = await import("@/lib/server/image-proxy");
        return handleImageProxyRequest(request, splatFrom(request, params));
      },
    },
  },
});
