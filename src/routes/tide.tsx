import { createFileRoute, redirect } from "@tanstack/react-router";

type Tab = "tides" | "tour" | "map" | "captain";

/** Old address of the app (bookmarks, installed icons): the app now lives at "/". */
export const Route = createFileRoute("/tide")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => {
    const tab = search.tab;
    return tab === "tides" || tab === "tour" || tab === "map" || tab === "captain" ? { tab } : {};
  },
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/", search, replace: true });
  },
});
