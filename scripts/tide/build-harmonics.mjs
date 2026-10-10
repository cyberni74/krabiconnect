#!/usr/bin/env node
/**
 * Builds src/lib/tide/harmonics.json — harmonic tidal constants for the seven
 * CAPTAIN TIDE locations, so predictions run offline for years ahead.
 *
 * Method (secondary-port transfer):
 *  1. Reference = measured gauge Ko Taphao Noi (Phuket), TICON-4 / UHSLC, CC BY 4.0.
 *  2. Per location, fit M2/S2/K1/... to one year of Open-Meteo Marine tide-model
 *     data (CC BY 4.0) and compare with the model at the reference gauge.
 *     Only the *ratios and phase differences* are used (gain + lag per group:
 *     semidiurnal, diurnal, quarter-diurnal); the absolute values stay measured.
 *  3. Chart datum = lowest predicted low water over 2010-2029 (~LAT).
 *  4. Krabi Town only: calibrated against the Pak Nam Krabi tide table values
 *     shipped with the supplied image pack (manifest.json, 2026-10-10).
 *
 * Usage (needs network + the 30 MB database, which is NOT a project dependency):
 *   npm i --no-save @neaps/tide-database && node scripts/tide/build-harmonics.mjs
 */
import { writeFileSync } from "node:fs";
import { stationsById } from "@neaps/tide-database";
import { constituents as CONST, createTidePredictor } from "@neaps/tide-predictor";

const REF_ID = "ticon/ko_taphao_noi-148-tha-uhslc_fd";
const LOCATIONS = {
  "krabi-town": [8.02, 98.87],
  "ao-nang": [8.03, 98.81],
  railay: [8.01, 98.84],
  "phi-phi": [7.74, 98.77],
  "koh-lanta": [7.62, 99.03],
  "phang-nga": [8.27, 98.5],
  phuket: [7.815, 98.36],
};
/** Pak Nam Krabi table values for 2026-10-10 (Bangkok time) from the image pack manifest. */
const TABLE = {
  low: { t: Date.UTC(2026, 9, 10, 9, 44), cm: 84 },
  high: { t: Date.UTC(2026, 9, 10, 15, 59), cm: 388 },
};

const FIT = {
  M2: 28.9841042, S2: 30, N2: 28.4397295, K2: 30.0821373, "2N2": 27.8953548, MU2: 27.9682084,
  NU2: 28.5125831, L2: 29.5284789, T2: 29.9589333, K1: 15.0410686, O1: 13.9430356,
  P1: 14.9589314, Q1: 13.3986609, J1: 15.5854433, M4: 57.9682084, MS4: 58.9841042,
  MN4: 57.4238337, S4: 60, M6: 86.9523127,
};
const names = Object.keys(FIT);
const T0 = Date.UTC(2024, 0, 1);
const RAD = Math.PI / 180;
const wrap = (d) => ((d % 360) + 360) % 360;

function solve(A, b) {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]];
    [b[i], b[p]] = [b[p], b[i]];
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
      b[r] -= f * b[i];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c];
    x[i] = s / A[i][i];
  }
  return x;
}

function harmonicFit(times, heights) {
  const m = 1 + 2 * names.length;
  const N = Array.from({ length: m }, () => new Array(m).fill(0));
  const R = new Array(m).fill(0);
  const row = new Array(m);
  for (let i = 0; i < times.length; i++) {
    if (heights[i] == null) continue;
    const hr = (Date.parse(`${times[i]}:00Z`) - T0) / 3600e3;
    row[0] = 1;
    names.forEach((n, k) => {
      const a = FIT[n] * hr * RAD;
      row[1 + 2 * k] = Math.cos(a);
      row[2 + 2 * k] = Math.sin(a);
    });
    for (let r = 0; r < m; r++) {
      R[r] += row[r] * heights[i];
      for (let c = r; c < m; c++) N[r][c] += row[r] * row[c];
    }
  }
  for (let r = 0; r < m; r++) for (let c = 0; c < r; c++) N[r][c] = N[c][r];
  const x = solve(N, R);
  const out = {};
  names.forEach((n, k) => {
    out[n] = { A: Math.hypot(x[1 + 2 * k], x[2 + 2 * k]), phi: wrap(Math.atan2(x[2 + 2 * k], x[1 + 2 * k]) / RAD) };
  });
  return out;
}

async function modelYear([lat, lon]) {
  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=sea_level_height_msl&timezone=GMT&start_date=2024-01-01&end_date=2024-12-31&cell_selection=sea`;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const j = await (await fetch(url)).json();
      if (!j.hourly) throw new Error(JSON.stringify(j).slice(0, 120));
      return harmonicFit(j.hourly.time, j.hourly.sea_level_height_msl);
    } catch (e) {
      console.error("retry", lat, lon, e.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("Open-Meteo unavailable");
}

const speedOf = (name) => CONST[name]?.speed ?? 0;
const groupOf = (speed) => (speed > 55 ? "M4" : speed > 26 ? "M2" : speed > 12 ? "K1" : null);

const ref = stationsById.get(REF_ID);
const fits = {};
for (const [id, pos] of Object.entries(LOCATIONS)) fits[id] = await modelYear(pos);
const base = fits.phuket;

function transfer(id) {
  const f = fits[id];
  const k = {};
  for (const g of ["M2", "K1", "M4"]) {
    k[g] = {
      gain: base[g].A > 0.004 ? f[g].A / base[g].A : 1,
      dphi: ((f[g].phi - base[g].phi + 540) % 360) - 180,
    };
  }
  return ref.harmonic_constituents.map((c) => {
    const g = groupOf(speedOf(c.name));
    return g
      ? { name: c.name, amplitude: c.amplitude * k[g].gain, phase: wrap(c.phase + k[g].dphi) }
      : { name: c.name, amplitude: c.amplitude, phase: c.phase };
  });
}

function extremes(cons, start, end) {
  return createTidePredictor(cons).getExtremesPrediction({ start: new Date(start), end: new Date(end) });
}
const near = (list, high, t) =>
  list.filter((e) => e.high === high).sort((a, b) => Math.abs(a.time - t) - Math.abs(b.time - t))[0];

const lowestLow = (cons) =>
  Math.min(...extremes(cons, Date.UTC(2010, 0, 1), Date.UTC(2029, 0, 1)).filter((e) => !e.high).map((e) => e.level));

const out = {
  generated: new Date().toISOString().slice(0, 10),
  reference: {
    id: REF_ID,
    name: ref.name,
    lat: ref.latitude,
    lon: ref.longitude,
    source: ref.source?.name,
    url: ref.source?.url,
    license: ref.license?.type,
    epoch: ref.epoch,
  },
  locations: {},
};

for (const id of Object.keys(LOCATIONS)) {
  let cons = transfer(id);
  const lat = -lowestLow(cons);
  let offsetM = lat;
  let basis = "lat";
  let calibration = null;
  if (id === "krabi-town") {
    const win = [Date.UTC(2026, 9, 10, 6), Date.UTC(2026, 9, 10, 19)];
    const pick = (c) => {
      const ex = extremes(c, ...win);
      return { lo: near(ex, false, TABLE.low.t), hi: near(ex, true, TABLE.high.t) };
    };
    let p = pick(cons);
    const lagMin = ((TABLE.low.t - +p.lo.time) + (TABLE.high.t - +p.hi.time)) / 2 / 60000;
    cons = cons.map((c) => ({ ...c, phase: speedOf(c.name) > 1 ? wrap(c.phase + (speedOf(c.name) * lagMin) / 60) : c.phase }));
    p = pick(cons);
    const gain = (TABLE.high.cm - TABLE.low.cm) / 100 / (p.hi.level - p.lo.level);
    cons = cons.map((c) => ({ ...c, amplitude: speedOf(c.name) > 1 ? c.amplitude * gain : c.amplitude }));
    p = pick(cons);
    offsetM = (TABLE.high.cm + TABLE.low.cm) / 200 - (p.hi.level + p.lo.level) / 2;
    basis = "table";
    calibration = { lagMin: +lagMin.toFixed(1), gain: +gain.toFixed(4), datumShiftCm: Math.round((offsetM - lat) * 100) };
    console.log("calibration", calibration, "residual HW/LW time(min):",
      Math.round((+p.hi.time - TABLE.high.t) / 60000), Math.round((+p.lo.time - TABLE.low.t) / 60000),
      "height(cm):", Math.round((p.hi.level + offsetM) * 100 - TABLE.high.cm), Math.round((p.lo.level + offsetM) * 100 - TABLE.low.cm));
  }
  out.locations[id] = {
    basis,
    offsetM: +offsetM.toFixed(3),
    lowestLowAboveMslM: +lat.toFixed(3),
    calibration,
    constituents: cons.map((c) => ({ name: c.name, amplitude: +c.amplitude.toFixed(5), phase: +c.phase.toFixed(3) })),
  };
  console.log(id.padEnd(11), "MSL above chart datum:", Math.round(offsetM * 100), "cm", basis);
}

writeFileSync(new URL("../../src/lib/tide/harmonics.json", import.meta.url), JSON.stringify(out));
console.log("written", Object.keys(out.locations).length, "locations");
