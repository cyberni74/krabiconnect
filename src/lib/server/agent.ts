import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

async function requireAdminCaller(userId: string) {
  const { requireAdmin } = await import("./admin-boot.server");
  await requireAdmin(userId);
}

export const getAgentAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdminCaller(context.userId);
    const { agentTokenStatus, AGENT_SCHEMA } = await import("./agent.server");
    const status = await agentTokenStatus();
    return { ...status, schema: AGENT_SCHEMA };
  });

export const rotateAgentToken = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdminCaller(context.userId);
    const { issueAgentToken, AGENT_SCHEMA } = await import("./agent.server");
    const token = await issueAgentToken();
    return { token, schema: AGENT_SCHEMA };
  });
