import { createServerFn } from "@tanstack/react-start";

export const getAgentAccess = createServerFn({ method: "GET" }).handler(async () => {
  const { agentTokenStatus, AGENT_SCHEMA } = await import("./agent.server");
  const status = await agentTokenStatus();
  return { ...status, schema: AGENT_SCHEMA };
});

export const rotateAgentToken = createServerFn({ method: "POST" }).handler(async () => {
  const { issueAgentToken, AGENT_SCHEMA } = await import("./agent.server");
  const token = await issueAgentToken();
  return { token, schema: AGENT_SCHEMA };
});
