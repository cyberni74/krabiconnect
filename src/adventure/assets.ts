import manifest from "./manifest.json";

export type AssetKind = "bg" | "props" | "items" | "chars";
/** Stored px per logical unit for sprites. */
export const DENSITY = 4;
const sizes = manifest as unknown as Record<AssetKind, Record<string, [number, number]>>;

export const hasAsset = (kind: AssetKind, key: string) => !!sizes[kind]?.[key];

/** Stored pixel size of an asset (stored at DENSITY px per logical unit). */
export function sizeOf(kind: AssetKind, key: string): [number, number] | undefined {
  return sizes[kind]?.[key];
}

/** Logical size in scene units (DENSITY stored px per unit). */
export function logicalSize(kind: AssetKind, key: string): [number, number] | undefined {
  const s = sizes[kind]?.[key];
  return s && (kind === "bg" ? s : [s[0] / DENSITY, s[1] / DENSITY]);
}

export const assetUrl = (kind: AssetKind, key: string) => `/g/${kind}/${key}.webp`;

const cache = new Map<string, HTMLImageElement>();

/** Starts loading (once) and returns the image when it is ready, else null. */
export function getImg(kind: AssetKind, key: string): HTMLImageElement | null {
  if (typeof Image === "undefined") return null;
  const id = kind + "/" + key;
  let img = cache.get(id);
  if (!img) {
    img = new Image();
    img.src = assetUrl(kind, key);
    cache.set(id, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

export function preload(list: [AssetKind, string][]): Promise<void> {
  if (typeof Image === "undefined") return Promise.resolve();
  return Promise.all(
    list.map(
      ([k, key]) =>
        new Promise<void>((res) => {
          getImg(k, key);
          const img = cache.get(k + "/" + key)!;
          if (img.complete) return res();
          img.onload = () => res();
          img.onerror = () => res();
        }),
    ),
  ).then(() => undefined);
}
