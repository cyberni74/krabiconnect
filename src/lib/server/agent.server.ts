import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getDb } from "./helpers";
import { AGENT_USER_ID, writeListing, type ListingWriteResult } from "./listing-write";

export type AgentListingInput = {
  id?: string | null;
  title: string;
  description?: string;
  priceThb?: number | null;
  kind?: string | null;
  category?: string | null;
  offerType?: string | null;
  district?: string | null;
  images?: string[] | null;
  facebookUrl?: string | null;
  facebookName?: string | null;
  sourceUrl?: string | null;
  tasks?: string[] | null;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function hashesEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function issueAgentToken(label = "Grok agent"): Promise<string> {
  const sql = await getDb();
  const token = `kc_live_${randomBytes(24).toString("hex")}`;
  const id = randomBytes(8).toString("hex");
  await sql`delete from agent_tokens`;
  await sql`
    insert into agent_tokens (id, token_hash, label)
    values (${id}, ${hashToken(token)}, ${label})
  `;
  return token;
}

export async function agentTokenStatus(): Promise<{
  hasToken: boolean;
  lastUsedAt: string | null;
  createdAt: string | null;
  label: string | null;
}> {
  const sql = await getDb();
  const rows = await sql<{
    last_used_at: string | null;
    created_at: string;
    label: string;
  }>`select last_used_at, created_at, label from agent_tokens order by created_at desc limit 1`;
  const row = rows[0];
  return {
    hasToken: Boolean(row),
    lastUsedAt: row?.last_used_at ? String(row.last_used_at) : null,
    createdAt: row ? String(row.created_at) : null,
    label: row?.label ?? null,
  };
}

export type AgentAuthFail = {
  ok: false;
  error: "Unauthorized";
  code: "missing_token" | "invalid_token" | "unknown_token";
  hint: string;
};

export type AgentAuthOk = { ok: true; tokenId: string };

const AUTH_HINT =
  "Open /admin → Grok agents → Create new key. Send it as: Authorization: Bearer kc_live_…";

const TOKEN_RE = /^kc_live_[a-f0-9]{48}$/;

function fail(code: AgentAuthFail["code"]): AgentAuthFail {
  return { ok: false, error: "Unauthorized", code, hint: AUTH_HINT };
}

/** Strict parse of `Authorization: Bearer kc_live_<48 hex>`. */
export function parseAgentToken(header: string | null): { token: string } | AgentAuthFail {
  if (!header?.trim()) return fail("missing_token");
  const match = header.trim().match(/^Bearer\s+(\S+)\s*$/i);
  if (!match) return fail("invalid_token");
  const token = match[1];
  if (!TOKEN_RE.test(token)) return fail("invalid_token");
  return { token };
}

export async function verifyAgentToken(
  header: string | null,
  opts: { touch?: boolean } = { touch: true },
): Promise<AgentAuthOk | AgentAuthFail> {
  const parsed = parseAgentToken(header);
  if (!("token" in parsed)) return parsed;
  const sql = await getDb();
  const rows = await sql<{ id: string; token_hash: string }>`select id, token_hash from agent_tokens`;
  const incoming = hashToken(parsed.token);
  const found = rows.find((r) => hashesEqual(r.token_hash, incoming));
  if (!found) return fail("unknown_token");
  if (opts.touch !== false) {
    await sql`update agent_tokens set last_used_at = now() where id = ${found.id}`;
  }
  return { ok: true, tokenId: found.id };
}

export async function ingestAgentListings(
  input: AgentListingInput | { listings: AgentListingInput[] },
): Promise<{ ok: true; results: ListingWriteResult[] }> {
  const items = "listings" in input && Array.isArray(input.listings) ? input.listings : [input as AgentListingInput];
  if (items.length === 0) throw new Error("No listings");
  if (items.length > 20) throw new Error("Max 20 listings per request");
  const results: ListingWriteResult[] = [];
  for (const item of items) {
    if (!item?.title?.trim()) throw new Error("Each listing needs a title");
    results.push(
      await writeListing({
        userId: AGENT_USER_ID,
        id: item.id,
        title: item.title,
        description: item.description ?? "",
        kind: item.kind ?? "market",
        category: item.category,
        offerType: item.offerType ?? "offer",
        rateThb: item.priceThb ?? null,
        images: item.images,
        tasks: item.tasks,
        district: item.district,
        facebookUrl: item.facebookUrl,
        facebookName: item.facebookName,
        sourceUrl: item.sourceUrl,
      }),
    );
  }
  return { ok: true, results };
}

export async function patchAgentListingImages(id: string, body: unknown) {
  const { patchListingImages } = await import("./listing-write");
  const images =
    body && typeof body === "object" && "images" in body
      ? (body as { images: unknown }).images
      : undefined;
  return patchListingImages(id, images);
}

export const AGENT_SCHEMA = {
  endpoint: "/api/agent/listings",
  validate: "GET /api/agent/listings with Authorization: Bearer kc_live_…",
  method: "POST",
  auth: "Authorization: Bearer kc_live_<48 hex>",
  body: {
    id: "string (optional — match an existing listing by id)",
    title: "string (required)",
    description: "string",
    priceThb: "number",
    kind: "market | service | job",
    category: "vehicles | boats | property | electronics | furniture | fashion | other",
    district: "ao-nang | krabi-town | nong-thale | klong-muang | krabi-noi | railay",
    images: ["https://… (fbcdn or other HTTPS; Facebook photo.php?fbid= HTML is ignored)"],
    facebookUrl: "https://www.facebook.com/seller-profile",
    facebookName: "string",
    sourceUrl: "https://www.facebook.com/marketplace/item/…",
  },
  duplicate:
    "POST matching sourceUrl or id does not insert a second row. If the existing row has 0 usable images (empty/missing, or only Facebook fbid HTML) and images[] is non-empty, those HTTPS URLs are merged onto the existing row (cover = images[0]). Rows that already have usable photos are left unchanged.",
  patch: {
    endpoint: "PATCH /api/agent/listings/:id",
    body: { images: ["https://…"] },
    result: { ok: true, id: "string", images: ["https://…"], cover: "https://… | null" },
    notes: "Replaces listing images. cover is images[0]. Same Bearer token as POST.",
  },
  result: {
    ok: true,
    results: [
      {
        id: "string",
        kind: "market | service | job",
        duplicate: "boolean",
        imagesUpdated: "boolean (set when duplicate received photos)",
        cover: "https://… (when imagesUpdated)",
      },
    ],
  },
};
