import type { Pt, SceneDef } from "../types";

/** A walkable band: feet may stand between y=top and y=bottom, x between x0 and x1. */
const band = (top: number, bottom = 432, x0 = 28, x1 = 932): Pt[] => [
  { x: x0, y: top },
  { x: x1, y: top },
  { x: x1, y: bottom },
  { x: x0, y: bottom },
];
const scale = (top: number, s0 = 0.84, s1 = 1.12): SceneDef["scale"] => ({ y0: top, s0, y1: 432, s1 });

/**
 * Floor geometry of every background, measured on the generated images (see tools/).
 * `top` = highest feet-y that still stands on the floor; the hero is 131 units tall at scale 1.
 */
export const GEO = {
  dorfplatz: { walk: band(318), scale: scale(318), floorTop: 310 },
  schmiede: { walk: band(310), scale: scale(310), floorTop: 300 },
  kapelle: { walk: band(358), scale: scale(358), floorTop: 350 },
  gruft: { walk: band(350), scale: scale(350), floorTop: 340 },
  waldrand: { walk: band(345), scale: scale(345), floorTop: 335 },
  moorpfad: { walk: band(352, 410), scale: scale(352), floorTop: 345 },
  hexenhuette: { walk: band(326), scale: scale(326), floorTop: 316 },
  burgtor: { walk: band(352), scale: scale(352), floorTop: 342 },
  burghof: { walk: band(342), scale: scale(342), floorTop: 332 },
  ruestkammer: { walk: band(312), scale: scale(312), floorTop: 302 },
  bibliothek: { walk: band(346), scale: scale(346), floorTop: 336 },
  thronsaal: { walk: band(322), scale: scale(322), floorTop: 312 },
  kerker: { walk: band(302), scale: scale(302), floorTop: 292 },
  vulkanpfad: { walk: band(326), scale: scale(326), floorTop: 318 },
  drachenhoehle: { walk: band(332), scale: scale(332), floorTop: 322 },
} as const;

export type SceneKey = keyof typeof GEO;
