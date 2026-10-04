import ja from "./ja";
import ko from "./ko";
import zh from "./zh";

/** German source string → translation. Missing keys fall back to English. */
export const DICTS: Record<"zh" | "ko" | "ja", Record<string, string>> = { zh, ko, ja };
