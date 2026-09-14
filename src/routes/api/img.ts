import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/img")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleImageProxyRequest } = await import("@/lib/server/image-proxy");
        return handleImageProxyRequest(request);
      },
    },
  },
});
