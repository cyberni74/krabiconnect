import type { SceneDef } from "../types";
import { beach, clearing, lighthouse, pier, shop, street, tavern } from "./ch1";
import { deck, grotto, mangrove, temple } from "./ch2";

export const SCENES: Record<string, SceneDef> = { pier, street, tavern, shop, beach, clearing, lighthouse, deck, mangrove, temple, grotto };
