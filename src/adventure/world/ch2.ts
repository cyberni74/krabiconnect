import type { ChapterModule, G, SceneDef } from "../types";

export const scenes: SceneDef[] = [];
export const start = { scene: "dorfplatz", x: 480, y: 400, facing: 1 as const, inv: [] as string[], flags: { chapter: 2 }, intro: async (_g: G) => {} };
export const hint = (_g: G): string => "";
export default { scenes, start, hint } satisfies ChapterModule;
