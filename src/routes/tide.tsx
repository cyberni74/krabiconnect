import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Anchor, AlertTriangle, ChartSpline, Map as MapIcon, Waves } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { CaptainView } from "@/components/tide/captain-view";
import { locateNearest, MapView } from "@/components/tide/map-view";
import { NowView } from "@/components/tide/now-view";
import { TideNotifier } from "@/components/tide/notifier";
import { TideBackground } from "@/components/tide/tide-background";
import { TidesView } from "@/components/tide/tides-view";
import { FRAME_LEVELS, frameIndexFor, frameSrc } from "@/lib/tide/frames";
import { fmtTime, useTT, type TideKey } from "@/lib/tide/i18n";
import { getLocation } from "@/lib/tide/locations";
import { tideStateAt } from "@/lib/tide/model";
import { useTideSettings, useTideView } from "@/lib/tide/store";
import { STALE_AFTER, useNow, useTide } from "@/lib/tide/use-tide";

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
      { name: "theme-color", content: "#031123" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      {
        name: "description",
        content:
          "Live-Gezeitenprognose für Kapitäne in Krabi: Wasserstand, Countdown bis Ebbe und Flut, 7-Tage-Kurve.",
      },
    ],
    links: [{ rel: "preload", as: "image", href: frameSrc(15), type: "image/webp" }],
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
  const locationId = useTideSettings((s) => s.locationId);
  const location = getLocation(locationId);
  const { data, forecast, isError, isLoading } = useTide(location.id);
  const now = useNow(1000);
  const previewAt = useTideView((s) => s.previewAt);
  const setPreviewAt = useTideView((s) => s.setPreviewAt);

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
  const state = useMemo(
    () => (forecast ? tideStateAt(forecast, shownAt) : null),
    [forecast, shownAt],
  );
  const frame = state ? frameIndexFor(state.cm) : Math.floor(FRAME_LEVELS.length / 2);

  const isDemo = forecast?.source === "demo";
  const stale = forecast && !isDemo && (now - forecast.fetchedAt > STALE_AFTER || isError);

  const status = (
    <div
      className="pointer-events-none absolute inset-x-0 z-20 flex flex-col items-center gap-1 px-4"
      style={{ top: tab === "now" ? "26%" : "calc(env(safe-area-inset-top) + 8px)" }}
    >
      {isDemo ? (
        <Pill tone="amber">
          <AlertTriangle className="size-3.5" />
          {t("demoBanner")}
        </Pill>
      ) : null}
      {stale ? (
        <Pill tone="amber">
          <AlertTriangle className="size-3.5" />
          {t("stale")} {fmtTime(forecast.fetchedAt, lang)}
        </Pill>
      ) : null}
      {!forecast && isError ? <Pill tone="amber">{t("noData")}</Pill> : null}
      {data?.notice && !isDemo && tab !== "now" ? <Pill tone="muted">{data.notice}</Pill> : null}
    </div>
  );

  return (
    <div className="tide-app fixed inset-0 overflow-hidden">
      {/* Wide screens: blurred continuation of the scene around the phone-shaped stage. */}
      <div className="absolute inset-0 hidden [@media(min-aspect-ratio:9/16)]:block">
        <TideBackground index={frame} blur dim={0.35} />
      </div>

      <main className="relative mx-auto h-full w-full max-w-[calc(100dvh*9/16)] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">
        <TideBackground index={frame} dim={tab === "now" ? 0 : 0.38} blur={tab !== "now"} />

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
                statusSlot={status}
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
              {status}
              <div className="mb-3 flex items-baseline justify-between px-2 pt-1">
                <h1 className="text-[26px] font-bold">{t(TABS.find((x) => x.id === tab)!.key)}</h1>
                <button
                  type="button"
                  onClick={() => setTab("map")}
                  className="text-[13px] font-semibold text-cyan-200"
                >
                  {location.name}
                </button>
              </div>
              {(isDemo || stale) && <div className="h-8" />}
              {tab === "tides" ? (
                forecast ? (
                  <TidesView forecast={forecast} state={state} now={now} />
                ) : (
                  <p className="tide-glass rounded-3xl p-5 text-white/80">
                    {isLoading ? t("loading") : t("noData")}
                  </p>
                )
              ) : null}
              {tab === "map" ? <MapView forecast={forecast} /> : null}
              {tab === "captain" ? <CaptainView forecast={forecast} now={now} /> : null}
              {forecast ? (
                <p className="px-2 pt-4 text-center text-[10.5px] leading-snug text-white/55">
                  {forecast.sourceLabel} · {forecast.station} · {forecast.datum}
                  <br />
                  {t("notMeasured")}
                </p>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        <nav
          className="absolute inset-x-3 z-30"
          style={{ bottom: "calc(8px + env(safe-area-inset-bottom))" }}
        >
          <ul className="tide-glass grid h-[60px] grid-cols-4 rounded-[22px] px-1">
            {TABS.map(({ id, key, icon: Icon }) => {
              const on = id === tab;
              return (
                <li key={id} className="flex">
                  <button
                    type="button"
                    onClick={() => setTab(id)}
                    aria-current={on ? "page" : undefined}
                    className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${on ? "text-cyan-200" : "text-white/60"}`}
                  >
                    {on ? (
                      <motion.span
                        layoutId="tide-tab"
                        className="absolute inset-x-1.5 inset-y-1.5 rounded-2xl bg-white/10"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    ) : null}
                    <Icon className="relative size-[21px]" strokeWidth={on ? 2.4 : 2} />
                    <span className="relative">{t(key)}</span>
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

function Pill({ children, tone }: { children: React.ReactNode; tone: "amber" | "muted" }) {
  return (
    <div
      className={`pointer-events-auto flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide backdrop-blur-md ${
        tone === "amber"
          ? "bg-amber-400/90 text-[#2a1600]"
          : "bg-black/40 text-white/80 normal-case"
      }`}
    >
      {children}
    </div>
  );
}
