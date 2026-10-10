import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Anchor, ChartSpline, Map as MapIcon, Waves } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { CaptainView } from "@/components/tide/captain-view";
import { locateNearest, MapView } from "@/components/tide/map-view";
import { NowView } from "@/components/tide/now-view";
import { TideNotifier } from "@/components/tide/notifier";
import { LangSwitch } from "@/components/tide/lang-switch";
import { TideBackground } from "@/components/tide/tide-background";
import { TidesView } from "@/components/tide/tides-view";
import { FRAME_LEVELS, frameIndexFor } from "@/lib/tide/frames";
import { useTT, type TideKey } from "@/lib/tide/i18n";
import { getLocation } from "@/lib/tide/locations";
import { useTideSettings, useTideView } from "@/lib/tide/store";
import { useNow, useTide, useTideStateAt } from "@/lib/tide/use-tide";

type Tab = "now" | "tides" | "map" | "captain";
const TABS: { id: Tab; key: TideKey; icon: typeof Waves }[] = [
  { id: "now", key: "now", icon: Waves },
  { id: "tides", key: "tides", icon: ChartSpline },
  { id: "map", key: "map", icon: MapIcon },
  { id: "captain", key: "captain", icon: Anchor },
];

export const Route = createFileRoute("/tide")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => {
    const tab = search.tab;
    return tab === "tides" || tab === "map" || tab === "captain" ? { tab } : {};
  },
  head: () => ({
    meta: [
      { title: "CAPTAIN TIDE – Gezeiten Krabi" },
      { name: "theme-color", content: "#070d14" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      {
        name: "description",
        content:
          "Live-Gezeitenprognose für Kapitäne in Krabi: Wasserstand, Countdown bis Ebbe und Flut, 7-Tage-Kurve.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Condensed:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap",
      },
    ],
  }),
  pendingComponent: Splash,
  component: CaptainTide,
});

function Splash() {
  return <div className="tide-app fixed inset-0" />;
}

function CaptainTide() {
  const { tab = "now" } = Route.useSearch();
  const navigate = useNavigate({ from: "/tide" });
  const setTab = (next: Tab) =>
    navigate({ search: next === "now" ? {} : { tab: next }, replace: true });
  const { t, lang } = useTT();
  const scene = useTideSettings((s) => s.scene);
  const locationId = useTideSettings((s) => s.locationId);
  const location = getLocation(locationId);
  const now = useNow(1000);
  const forecast = useTide(location.id, now);
  const previewAt = useTideView((s) => s.previewAt);
  const setPreviewAt = useTideView((s) => s.setPreviewAt);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // A picked/simulated time only lives inside one tab; every tab opens on "now".
  useEffect(() => {
    setPreviewAt(null);
  }, [tab, setPreviewAt]);

  // Optional GPS pick on launch.
  const gpsTried = useRef(false);
  useEffect(() => {
    if (gpsTried.current) return;
    gpsTried.current = true;
    if (!useTideSettings.getState().autoGps) return;
    locateNearest(
      (id, km) => {
        useTideSettings.getState().setLocation(id);
        toast.success(`${getLocation(id).name} (${Math.round(km)} km)`);
      },
      () => undefined,
    );
  }, []);

  const shownAt = previewAt ?? now;
  const { state } = useTideStateAt(location.id, forecast, shownAt);
  const frame = state ? frameIndexFor(state.cm) : Math.floor(FRAME_LEVELS.length / 2);

  return (
    <div className="tide-app fixed inset-0 overflow-hidden">
      {/* Wide screens + photo mode: blurred scene around the phone-shaped stage. */}
      {scene ? (
        <div className="absolute inset-0 hidden [@media(min-aspect-ratio:9/16)]:block">
          <TideBackground index={frame} blur dim={0.5} />
        </div>
      ) : null}

      <main
        className={`relative mx-auto h-full w-full max-w-[calc(100dvh*9/16)] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] ${scene ? "" : "tide-instrument-bg"}`}
      >
        {scene ? (
          <>
            <TideBackground index={frame} dim={tab === "now" ? 0.28 : 0.55} blur={tab !== "now"} />
            {/* The supplied photos carry their own title box at the top; fade it out. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-[#070d14] via-[#070d14]/95 to-transparent" />
          </>
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          {tab === "now" ? (
            <motion.div
              key="now"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <NowView
                forecast={forecast}
                state={state}
                now={now}
                previewAt={previewAt}
                location={location}
                onOpenMap={() => setTab("map")}
              />
            </motion.div>
          ) : (
            <motion.div
              key={tab}
              className="hide-scroll absolute inset-0 overflow-y-auto overscroll-contain px-3"
              style={{
                paddingTop: "calc(env(safe-area-inset-top) + 16px)",
                paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-3 flex items-end justify-between gap-2 px-0.5 pt-1">
                <div className="min-w-0 border-l-2 border-cyan-400/70 pl-2 leading-tight">
                  <h1 className="text-[22px] font-bold uppercase tracking-wide">
                    {t(TABS.find((x) => x.id === tab)!.key)}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setTab("map")}
                    className="tide-label truncate text-[12px] font-semibold text-cyan-200"
                  >
                    {location.name}
                  </button>
                </div>
                <LangSwitch />
              </div>
              {tab === "tides" ? (
                <TidesView location={location} live={forecast} state={state} now={now} />
              ) : null}
              {tab === "map" ? <MapView forecast={forecast} /> : null}
              {tab === "captain" ? <CaptainView forecast={forecast} now={now} /> : null}
              <p className="px-2 pt-4 text-center text-[10.5px] leading-snug text-white/55">
                {forecast.sourceLabel} · {forecast.station} · {forecast.datum}
                <br />
                {t("notMeasured")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <nav
          className="absolute inset-x-0 bottom-0 z-30 border-t border-[var(--tide-line)] bg-[rgb(6_12_19/0.96)] backdrop-blur"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <ul className="grid h-[58px] grid-cols-4">
            {TABS.map(({ id, key, icon: Icon }) => {
              const on = id === tab;
              return (
                <li key={id} className="flex">
                  <button
                    type="button"
                    onClick={() => setTab(id)}
                    aria-current={on ? "page" : undefined}
                    className={`tide-label relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] transition-colors ${on ? "bg-cyan-300/[0.08] text-cyan-200" : "text-white/55"}`}
                  >
                    {on ? <span className="absolute inset-x-0 top-0 h-[2px] bg-cyan-300" /> : null}
                    <Icon className="size-[20px]" strokeWidth={on ? 2.4 : 1.9} />
                    <span>{t(key)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </main>

      <TideNotifier forecast={forecast} />
    </div>
  );
}
