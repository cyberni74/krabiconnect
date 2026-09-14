import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const previewFacebookProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { url: string }) => input)
  .handler(async ({ data }) => {
    const { resolveFacebookProfile } = await import("./facebook.server");
    return resolveFacebookProfile(data.url);
  });
