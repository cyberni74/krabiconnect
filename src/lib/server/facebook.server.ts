import { facebookGraphId, facebookHandleLabel, parseFacebookUrl } from "@/lib/utils";

export type FacebookProfile = {
  url: string;
  id: string;
  name: string;
  photo: string;
};

const GRAPH = "https://graph.facebook.com/v21.0";

function env(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

async function appToken(): Promise<string | null> {
  const id = env("FACEBOOK_APP_ID");
  const secret = env("FACEBOOK_APP_SECRET");
  if (!id || !secret) return null;
  const g = globalThis as typeof globalThis & { __fbAppToken__?: { token: string; exp: number } };
  if (g.__fbAppToken__ && g.__fbAppToken__.exp > Date.now()) return g.__fbAppToken__.token;
  const url = new URL(`${GRAPH}/oauth/access_token`);
  url.searchParams.set("client_id", id);
  url.searchParams.set("client_secret", secret);
  url.searchParams.set("grant_type", "client_credentials");
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) return null;
  g.__fbAppToken__ = { token: json.access_token, exp: Date.now() + 50 * 60 * 1000 };
  return json.access_token;
}

async function graphJson(path: string, token: string | null): Promise<Record<string, unknown> | null> {
  const url = new URL(path.startsWith("http") ? path : `${GRAPH}/${path.replace(/^\//, "")}`);
  if (token) url.searchParams.set("access_token", token);
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) return null;
  const json = (await res.json()) as Record<string, unknown>;
  if (json.error) return null;
  return json;
}

export async function resolveFacebookProfile(raw: string): Promise<FacebookProfile | null> {
  const url = parseFacebookUrl(raw);
  const id = facebookGraphId(raw);
  if (!url || !id) return null;

  let name = facebookHandleLabel(id);
  let photo = `https://graph.facebook.com/${encodeURIComponent(id)}/picture?type=large`;

  const token = await appToken().catch(() => null);
  if (token) {
    const byUrl = await graphJson(
      `?id=${encodeURIComponent(url)}&fields=og_object{id,title,image}`,
      token,
    ).catch(() => null);
    const ogObj = (byUrl?.og_object ?? null) as
      | { title?: string; image?: { src?: string }[] | { src?: string } }
      | null;
    if (ogObj?.title) name = String(ogObj.title);
    const img = Array.isArray(ogObj?.image) ? ogObj.image[0] : ogObj?.image;
    if (img?.src) photo = img.src;

    const node = await graphJson(
      `${encodeURIComponent(id)}?fields=id,name,picture.type(large)`,
      token,
    ).catch(() => null);
    if (typeof node?.name === "string" && node.name.trim()) name = node.name;
    const pic = node?.picture as { data?: { url?: string } } | undefined;
    if (pic?.data?.url) photo = pic.data.url;
  } else {
    const picMeta = await graphJson(
      `https://graph.facebook.com/${encodeURIComponent(id)}/picture?redirect=false&type=large`,
      null,
    ).catch(() => null);
    const data = picMeta?.data as { url?: string; is_silhouette?: boolean } | undefined;
    if (data?.url && !data.is_silhouette) photo = data.url;
  }

  return { url, id, name, photo };
}
