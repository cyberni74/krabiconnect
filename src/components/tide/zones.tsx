import { CircleSlash, Plus, TriangleAlert, X } from "lucide-react";
import { useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import type * as Maplibre from "maplibre-gl";
import { create } from "zustand";
import { evaluateMark, markCenter, zonesGeoJSON, type ZoneEval } from "@/lib/tide/depth";
import { harmonicLevelAt } from "@/lib/tide/harmonic";
import { fmtDay, fmtSigned, fmtTime, useTT } from "@/lib/tide/i18n";
import { nearestLocation } from "@/lib/tide/locations";
import { MIN, nextExtreme, type TideForecast } from "@/lib/tide/model";
import { useTideSettings, type DepthMark } from "@/lib/tide/store";

const RED = "#ef4444";
const AMBER = "#fbbf24";
const SLATE = "#94a3b8";

type Adding = { kind: "point" | "segment"; a?: [number, number] } | null;
type Form = {
  id: string;
  isNew: boolean;
  kind: "point" | "segment";
  name: string;
  depth: string;
  radius: string;
  a: [number, number];
  b?: [number, number];
} | null;

type ZoneUi = {
  adding: Adding;
  form: Form;
  /** Minutes from now, or "low" = next low water. */
  offset: number | "low";
  setAdding: (a: Adding) => void;
  setForm: (f: Form) => void;
  setOffset: (o: number | "low") => void;
};

export const useZoneUi = create<ZoneUi>()((set) => ({
  adding: null,
  form: null,
  offset: 0,
  setAdding: (adding) => set({ adding }),
  setForm: (form) => set({ form }),
  setOffset: (offset) => set({ offset }),
}));

const OFFSETS: (number | "low")[] = [0, 60, 180, 360, 720, "low"];

/** Evaluation of every entered spot at the chosen time. */
export function useZoneEvals(forecast: TideForecast | null, now: number) {
  const marks = useTideSettings((s) => s.marks);
  const draft = useTideSettings((s) => s.boat.draft);
  const reserve = useTideSettings((s) => s.boat.reserve);
  const offset = useZoneUi((s) => s.offset);
  const lowAt = forecast ? (nextExtreme(forecast.extremes, now, "low")?.t ?? null) : null;
  const at = offset === "low" ? (lowAt ?? now) : now + offset * MIN;
  const atKey = Math.floor(at / MIN);
  const evals = useMemo<ZoneEval[]>(
    () =>
      marks.map((m) => {
        const { loc } = nearestLocation(...markCenter(m));
        return evaluateMark(m, harmonicLevelAt(loc.id, atKey * MIN), draft, reserve);
      }),
    [marks, atKey, draft, reserve],
  );
  return { evals, at: atKey * MIN, draft, reserve };
}

function hatch(color: string): ImageData {
  const size = 12;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.strokeStyle = color;
  g.lineWidth = 2.2;
  g.beginPath();
  for (const k of [-size, 0, size]) {
    g.moveTo(k, size);
    g.lineTo(k + size, 0);
  }
  g.stroke();
  return g.getImageData(0, 0, size, size);
}

/** Effects only: draws the zones on the map, owns the DOM markers and the tap-to-add handler. */
export function ZoneMapLayer({
  mapRef,
  ready,
  evals,
}: {
  mapRef: MutableRefObject<Maplibre.Map | null>;
  ready: boolean;
  evals: ZoneEval[];
}) {
  const show = useTideSettings((s) => s.showZones);
  const adding = useZoneUi((s) => s.adding);
  const addingRef = useRef<Adding>(null);
  addingRef.current = adding;
  const pins = useRef<Maplibre.Marker[]>([]);

  // Layers (once the map style is loaded).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || map.getSource("zones")) return;
    map.addImage("hatch-red", hatch(RED), { pixelRatio: 1 });
    map.addImage("hatch-amber", hatch(AMBER), { pixelRatio: 1 });
    map.addSource("zones", { type: "geojson", data: zonesGeoJSON([]) });
    const only = (state: string) => ["==", ["get", "state"], state] as Maplibre.FilterSpecification;
    map.addLayer({
      id: "zones-red-tint",
      type: "fill",
      source: "zones",
      filter: only("red"),
      paint: { "fill-color": RED, "fill-opacity": 0.28 },
    });
    map.addLayer({
      id: "zones-red-hatch",
      type: "fill",
      source: "zones",
      filter: only("red"),
      paint: { "fill-pattern": "hatch-red" },
    });
    map.addLayer({
      id: "zones-amber-hatch",
      type: "fill",
      source: "zones",
      filter: only("amber"),
      paint: { "fill-pattern": "hatch-amber", "fill-opacity": 0.85 },
    });
    map.addLayer({
      id: "zones-red-line",
      type: "line",
      source: "zones",
      filter: only("red"),
      paint: { "line-color": RED, "line-width": 2.5 },
    });
    map.addLayer({
      id: "zones-amber-line",
      type: "line",
      source: "zones",
      filter: only("amber"),
      paint: { "line-color": AMBER, "line-width": 2 },
    });
    map.addLayer({
      id: "zones-none-line",
      type: "line",
      source: "zones",
      filter: [
        "in",
        ["get", "state"],
        ["literal", ["none", "no-draft"]],
      ] as Maplibre.FilterSpecification,
      paint: { "line-color": SLATE, "line-width": 1.5, "line-dasharray": [2, 2] },
    });
  }, [mapRef, ready]);

  // Data, visibility and DOM markers.
  useEffect(() => {
    const map = mapRef.current;
    const src = map?.getSource("zones") as Maplibre.GeoJSONSource | undefined;
    if (!map || !src) return;
    src.setData(zonesGeoJSON(show ? evals : []));
    for (const p of pins.current) p.remove();
    pins.current = [];
    if (!show) return;
    let cancelled = false;
    void import("maplibre-gl").then((mod) => {
      if (cancelled) return;
      const gl = (mod as { default?: typeof Maplibre }).default ?? mod;
      for (const e of evals) {
        const el = document.createElement("button");
        el.type = "button";
        el.setAttribute("aria-label", e.mark.name || "spot");
        const color = e.state === "red" ? RED : e.state === "amber" ? AMBER : SLATE;
        el.style.cssText = `min-width:34px;height:22px;padding:0 6px;border-radius:3px;border:2px solid ${color};background:#070d14;color:#fff;font:600 11px/1 'IBM Plex Mono',monospace;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.5)`;
        el.textContent = e.clearanceCm == null ? "?" : fmtSigned(e.clearanceCm);
        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          useZoneUi.getState().setForm(formFor(e.mark, false));
        });
        const [lat, lon] = markCenter(e.mark);
        pins.current.push(new gl.Marker({ element: el }).setLngLat([lon, lat]).addTo(map));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mapRef, ready, evals, show]);

  // Tap-to-add.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const onClick = (e: Maplibre.MapMouseEvent) => {
      const mode = addingRef.current;
      if (!mode) return;
      const p: [number, number] = [e.lngLat.lat, e.lngLat.lng];
      const ui = useZoneUi.getState();
      if (mode.kind === "point") {
        ui.setAdding(null);
        ui.setForm(newForm("point", p));
      } else if (!mode.a) {
        ui.setAdding({ kind: "segment", a: p });
      } else {
        ui.setAdding(null);
        ui.setForm(newForm("segment", mode.a, p));
      }
    };
    map.on("click", onClick);
    map.getCanvas().style.cursor = adding ? "crosshair" : "";
    // While placing a spot, the location pins must not swallow the tap.
    map.getContainer().classList.toggle("zone-adding", !!adding);
    return () => {
      map.off("click", onClick);
    };
  }, [mapRef, ready, adding]);

  return null;
}

function newForm(kind: "point" | "segment", a: [number, number], b?: [number, number]): Form {
  return {
    id: `z${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    isNew: true,
    kind,
    name: "",
    depth: "1.0",
    radius: kind === "point" ? "80" : "40",
    a,
    b,
  };
}

function formFor(m: DepthMark, isNew: boolean): Form {
  return {
    id: m.id,
    isNew,
    kind: m.kind,
    name: m.name,
    depth: String(m.depthM),
    radius: String(m.radiusM),
    a: m.a,
    b: m.b,
  };
}

/** Switch chip on the map: shows/hides the red zones. */
export function ZoneOverlay() {
  const { t } = useTT();
  const show = useTideSettings((s) => s.showZones);
  const setShow = useTideSettings((s) => s.setShowZones);
  const adding = useZoneUi((s) => s.adding);
  const setAdding = useZoneUi((s) => s.setAdding);
  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={show}
        onClick={() => setShow(!show)}
        className={`absolute left-2 top-2 z-10 flex h-11 items-center gap-2 rounded border px-3 text-[13px] font-bold shadow-lg active:scale-95 ${
          show
            ? "border-red-400 bg-[#2a0d10] text-red-100"
            : "border-white/25 bg-[#070d14]/90 text-white/85"
        }`}
      >
        <span
          className="size-4 rounded-sm border border-red-400"
          style={{
            background: show
              ? "repeating-linear-gradient(135deg,#ef4444 0 2px,transparent 2px 5px)"
              : "transparent",
          }}
        />
        {t("zonesShow")}
      </button>
      {adding ? (
        <div className="absolute inset-x-2 top-[3.6rem] z-10 flex items-center justify-between gap-2 rounded border border-cyan-300/60 bg-[#070d14]/95 px-3 py-2 text-[13px] font-semibold text-cyan-100">
          <span>{adding.kind === "segment" && adding.a ? t("zonesTapB") : t("zonesTapA")}</span>
          <button
            type="button"
            onClick={() => setAdding(null)}
            aria-label={t("zonesCancel")}
            className="grid size-9 shrink-0 place-items-center rounded bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}
    </>
  );
}

/** Controls, form and list below the map. */
export function ZonePanel({
  evals,
  at,
  draft,
  reserve,
  levelAtNow,
}: {
  evals: ZoneEval[];
  at: number;
  draft: number | null;
  reserve: number;
  levelAtNow: number | null;
}) {
  const { t, lang } = useTT();
  const show = useTideSettings((s) => s.showZones);
  const setShow = useTideSettings((s) => s.setShowZones);
  const draftSource = useTideSettings((s) => s.boat.draftSource);
  const upsert = useTideSettings((s) => s.upsertMark);
  const remove = useTideSettings((s) => s.removeMark);
  const { adding, form, offset, setAdding, setForm, setOffset } = useZoneUi();

  /** Start placing: bring the map into view so the tap target is visible. */
  const startAdding = (kind: "point" | "segment") => {
    setAdding(adding?.kind === kind ? null : { kind });
    document
      .querySelector("[data-zone-map]")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const offsetLabel = (o: number | "low") =>
    o === "low" ? t("zonesLow") : o === 0 ? t("now") : `+${o / 60} h`;
  const state = (e: ZoneEval) => (e.state === "red" ? RED : e.state === "amber" ? AMBER : SLATE);

  const save = () => {
    if (!form) return;
    const depth = Number(form.depth.replace(",", "."));
    const radius = Number(form.radius.replace(",", "."));
    if (!Number.isFinite(depth) || !Number.isFinite(radius) || radius < 5) return;
    upsert({
      id: form.id,
      kind: form.kind,
      name: form.name.trim().slice(0, 40),
      depthM: Math.max(-20, Math.min(100, depth)),
      radiusM: Math.max(5, Math.min(3000, radius)),
      a: form.a,
      b: form.b,
    });
    setShow(true);
    setForm(null);
  };

  return (
    <section className="tide-glass p-4">
      <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-red-300">
        <TriangleAlert className="size-4" /> {t("zonesTitle")}
      </h3>
      <p className="mt-2 text-[12.5px] leading-snug text-white/70">{t("zonesIntro")}</p>

      {draft == null ? (
        <div className="mt-3 border border-amber-400 bg-amber-400/10 p-3 text-[12.5px] leading-snug text-amber-200">
          <b>{t("zonesNeedDraft")}.</b> {t("draftMissing")}
        </div>
      ) : (
        <div className="tide-digits mt-3 flex items-center justify-between border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px]">
          <span className="text-white/60">
            {t("draft")} {draft} + {t("reserve").split(" ")[0]} {reserve}
          </span>
          <b>{draft + reserve} cm</b>
        </div>
      )}

      {draft != null && draftSource === "published" ? (
        <p className="mt-2 text-[11.5px] leading-snug text-amber-200">{t("draftPublished")}</p>
      ) : null}

      <div className="tide-label mt-3 text-[10.5px] uppercase tracking-wider text-white/55">
        {t("zonesTime")}
      </div>
      <div className="mt-1 grid grid-cols-6 gap-1">
        {OFFSETS.map((o) => (
          <button
            key={String(o)}
            type="button"
            onClick={() => setOffset(o)}
            className={`tide-digits h-11 rounded px-0.5 text-[12px] font-medium active:scale-95 ${
              offset === o ? "bg-cyan-300 text-[#04131f]" : "bg-white/8 text-white/80"
            }`}
          >
            {offsetLabel(o)}
          </button>
        ))}
      </div>
      <div className="tide-digits mt-1 text-[12px] text-white/60">
        {fmtDay(at, lang)} {fmtTime(at, lang)}
        {offset === 0 && levelAtNow != null ? ` · ${t("level")} ${Math.round(levelAtNow)} cm` : ""}
      </div>

      {show ? (
        <div className="mt-3 space-y-1 text-[12px]">
          <div className="flex items-center gap-2">
            <span
              className="size-3 border border-red-400"
              style={{
                background: "repeating-linear-gradient(135deg,#ef4444 0 2px,transparent 2px 5px)",
              }}
            />
            {t("zonesLegendRed")}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="size-3 border border-amber-300"
              style={{
                background: "repeating-linear-gradient(135deg,#fbbf24 0 2px,transparent 2px 5px)",
              }}
            />
            {t("zonesLegendAmber")}
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <CircleSlash className="size-3 shrink-0" />
            {t("zonesNoClaim")}
          </div>
        </div>
      ) : null}

      {form ? (
        <div className="mt-3 border border-cyan-300/50 bg-cyan-300/[0.06] p-3">
          <div className="grid grid-cols-2 gap-2.5">
            <Field label={t("zonesName")} full>
              <input
                className="tide-input"
                value={form.name}
                maxLength={40}
                placeholder="Pak Nam Bar"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label={t("zonesDepth")}>
              <input
                className="tide-input tide-digits"
                inputMode="decimal"
                value={form.depth}
                onChange={(e) => setForm({ ...form, depth: e.target.value })}
              />
            </Field>
            <Field label={form.kind === "point" ? t("zonesRadius") : t("zonesHalfWidth")}>
              <input
                className="tide-input tide-digits"
                inputMode="numeric"
                value={form.radius}
                onChange={(e) => setForm({ ...form, radius: e.target.value })}
              />
            </Field>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-white/55">{t("zonesDepthHint")}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={save}
              className="h-12 flex-1 rounded bg-cyan-300 text-[14px] font-bold text-[#04131f] active:scale-[0.98]"
            >
              {t("zonesSave")}
            </button>
            {!form.isNew ? (
              <button
                type="button"
                onClick={() => {
                  remove(form.id);
                  setForm(null);
                }}
                className="h-12 rounded border border-red-400 px-4 text-[13px] font-bold text-red-300 active:scale-[0.98]"
              >
                {t("zonesDelete")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setForm(null)}
              className="h-12 rounded bg-white/10 px-4 text-[13px] font-semibold active:scale-[0.98]"
            >
              {t("zonesCancel")}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <AddButton active={adding?.kind === "point"} onClick={() => startAdding("point")}>
            {t("zonesAdd")} · {t("zonesPoint")}
          </AddButton>
          <AddButton active={adding?.kind === "segment"} onClick={() => startAdding("segment")}>
            {t("zonesAdd")} · {t("zonesSegment")}
          </AddButton>
        </div>
      )}

      <ul className="mt-3 divide-y divide-white/10">
        {evals.map((e) => (
          <li key={e.mark.id}>
            <button
              type="button"
              onClick={() => setForm(formFor(e.mark, false))}
              className="flex min-h-12 w-full items-center gap-3 py-2 text-left"
            >
              <span className="size-3 shrink-0" style={{ background: state(e) }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">
                  {e.mark.name || (e.mark.kind === "point" ? t("zonesPoint") : t("zonesSegment"))}
                </span>
                <span className="tide-digits block text-[11.5px] text-white/55">
                  {e.mark.depthM.toFixed(1)} m · {e.mark.kind === "point" ? "r" : "½b"}{" "}
                  {e.mark.radiusM} m
                </span>
              </span>
              <span className="text-right">
                <span
                  className="tide-digits block text-[15px] font-medium"
                  style={{ color: state(e) }}
                >
                  {e.clearanceCm == null ? "?" : `${fmtSigned(e.clearanceCm)} cm`}
                </span>
                <span className="tide-label block text-[10px] uppercase tracking-wider text-white/45">
                  {t("zonesClearance")}
                </span>
              </span>
            </button>
          </li>
        ))}
        {evals.length === 0 ? (
          <li className="py-2 text-[13px] text-white/60">{t("zonesEmpty")}</li>
        ) : null}
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-white/50">{t("zonesDatum")}</p>
    </section>
  );
}

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="tide-label mb-1 block text-[10.5px] uppercase tracking-wider text-white/55">
        {label}
      </span>
      {children}
    </label>
  );
}

function AddButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`tide-label flex min-h-12 items-center justify-center gap-1.5 border px-2 text-center text-[12px] font-bold uppercase leading-tight tracking-wide active:scale-95 ${
        active ? "border-cyan-300 bg-cyan-300/20 text-cyan-100" : "border-cyan-300/40 text-cyan-50"
      }`}
    >
      <Plus className="size-4 shrink-0 text-cyan-300" />
      {children}
    </button>
  );
}
