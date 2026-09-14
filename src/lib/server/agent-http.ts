export const AGENT_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
};

export function agentJson(data: unknown, status = 200) {
  return Response.json(data, { status, headers: AGENT_CORS });
}

export function agentUnauthorized(body: unknown) {
  return Response.json(body, {
    status: 401,
    headers: {
      ...AGENT_CORS,
      "WWW-Authenticate": 'Bearer realm="KrabiMarketplace agent", error="invalid_token"',
    },
  });
}

export function agentOptions() {
  return new Response(null, { status: 204, headers: AGENT_CORS });
}
