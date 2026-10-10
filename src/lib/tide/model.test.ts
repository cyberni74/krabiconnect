import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  findExtremes,
  formatCountdown,
  HOUR,
  levelAt,
  MIN,
  nextCrossing,
  tideStateAt,
  tourStats,
  type TideForecast,
} from "./model.ts";
import { frameIndexFor, FRAME_LEVELS } from "./frames.ts";
import { harmonicForecast, harmonicLevelAt, horizonEnd } from "./harmonic.ts";
import { capsuleRing, circleRing, evaluateMark } from "./depth.ts";
import { isTideOnlyHost, isTidePath } from "./hosts.ts";
import { getLocation, nearestLocation } from "./locations.ts";

const T0 = Date.UTC(2026, 9, 10, 0, 0);
const PERIOD = 12.42 * HOUR;

/** Pure semidiurnal cosine sampled hourly: highs at T0 + k·PERIOD. */
function cosineForecast(): TideForecast {
  const t: number[] = [];
  const cm: number[] = [];
  for (let i = 0; i <= 72; i++) {
    const x = T0 + i * HOUR;
    t.push(x);
    cm.push(236 + 150 * Math.cos((2 * Math.PI * (x - T0)) / PERIOD));
  }
  return {
    locationId: "test",
    source: "harmonic",
    sourceLabel: "test",
    station: "test",
    stationLat: null,
    stationLon: null,
    datum: "CD",
    fetchedAt: T0,
    t,
    cm,
    extremes: findExtremes(t, cm),
  };
}

describe("levelAt", () => {
  const f = cosineForecast();
  it("hits samples exactly and interpolates smoothly between them", () => {
    assert.equal(levelAt(f, T0 + 5 * HOUR), f.cm[5]);
    const mid = levelAt(f, T0 + 5.5 * HOUR)!;
    const exact = 236 + 150 * Math.cos((2 * Math.PI * 5.5 * HOUR) / PERIOD);
    assert.ok(Math.abs(mid - exact) < 2, `${mid} vs ${exact}`);
  });
  it("returns null outside the forecast window", () => {
    assert.equal(levelAt(f, T0 - MIN), null);
    assert.equal(levelAt(f, T0 + 73 * HOUR), null);
  });
});

describe("findExtremes", () => {
  it("finds alternating highs and lows close to the true turning points", () => {
    const f = cosineForecast();
    const ex = f.extremes;
    assert.ok(ex.length >= 10);
    for (let i = 1; i < ex.length; i++) assert.notEqual(ex[i].type, ex[i - 1].type);
    const firstLow = ex.find((e) => e.type === "low")!;
    const trueLow = T0 + PERIOD / 2;
    assert.ok(Math.abs(firstLow.t - trueLow) < 10 * MIN, "low time within 10 min");
    assert.ok(Math.abs(firstLow.cm - 86) < 3, `low height ${firstLow.cm}`);
  });
});

describe("tideStateAt", () => {
  const f = cosineForecast();
  it("is falling after high water and counts down to the next low", () => {
    const s = tideStateAt(f, T0 + 2 * HOUR)!;
    assert.equal(s.rising, false);
    assert.equal(s.next.type, "low");
    assert.equal(s.following?.type, "high");
    assert.ok(s.perHour! < 0);
    assert.ok(s.change30! < 0);
    assert.ok(s.toNext < 0);
  });
  it("switches to rising once the low has passed", () => {
    const s = tideStateAt(f, T0 + PERIOD / 2 + 30 * MIN)!;
    assert.equal(s.rising, true);
    assert.equal(s.next.type, "high");
  });
  it("flags the turn of the tide near an extreme", () => {
    const s = tideStateAt(f, T0 + PERIOD / 2 - 3 * MIN)!;
    assert.ok(s.slack);
  });
});

describe("nextCrossing", () => {
  it("finds when the level falls below a threshold", () => {
    const f = cosineForecast();
    const c = nextCrossing(f, 236, "below", T0 + HOUR)!;
    assert.ok(Math.abs(c - (T0 + PERIOD / 4)) < 10 * MIN);
  });
});

describe("frames", () => {
  it("maps levels to the nearest illustration and clamps outside the span", () => {
    assert.equal(FRAME_LEVELS.length, 32);
    assert.equal(frameIndexFor(388), 0);
    assert.equal(frameIndexFor(500), 0);
    assert.equal(frameIndexFor(84), 31);
    assert.equal(frameIndexFor(-40), 31);
    assert.equal(FRAME_LEVELS[frameIndexFor(251)], 248);
  });
});

describe("misc", () => {
  it("formats countdowns", () => {
    assert.equal(formatCountdown(2 * HOUR + 34 * MIN + 18_000), "02:34:18");
    assert.equal(formatCountdown(-5), "00:00:00");
  });
  it("finds the nearest location", () => {
    assert.equal(nearestLocation(7.75, 98.77).loc.id, "phi-phi");
    assert.equal(nearestLocation(7.9, 98.4).loc.id, "phuket");
  });
});

describe("harmonic forecast", () => {
  const BKK = 7 * HOUR;
  const bangkok = (m: number, d: number, h: number, min: number) =>
    Date.UTC(2026, m - 1, d, h, min) - BKK;
  const day = (loc: string) =>
    harmonicForecast(getLocation(loc), bangkok(10, 10, 0, 0), bangkok(10, 11, 0, 0));

  it("alternates high and low water and stays in a sane range", () => {
    for (const id of ["krabi-town", "phuket", "phang-nga", "koh-lanta", "phi-phi"]) {
      const f = harmonicForecast(getLocation(id), bangkok(10, 1, 0, 0), bangkok(10, 31, 0, 0));
      assert.ok(f.extremes.length > 55, `${id}: ${f.extremes.length} extremes in 30 days`);
      for (let i = 1; i < f.extremes.length; i++) {
        assert.notEqual(f.extremes[i].type, f.extremes[i - 1].type);
      }
      assert.ok(Math.min(...f.cm) > -40 && Math.max(...f.cm) < 560, id);
    }
  });

  it("matches the Pak Nam Krabi table values the Krabi Town constants were calibrated on", () => {
    const f = day("krabi-town");
    const low = f.extremes.find(
      (e) => e.type === "low" && Math.abs(e.t - bangkok(10, 10, 16, 44)) < 2 * HOUR,
    )!;
    const high = f.extremes.find(
      (e) => e.type === "high" && Math.abs(e.t - bangkok(10, 10, 22, 59)) < 2 * HOUR,
    )!;
    assert.ok(Math.abs(low.t - bangkok(10, 10, 16, 44)) < 6 * MIN, "low water time");
    assert.ok(Math.abs(high.t - bangkok(10, 10, 22, 59)) < 6 * MIN, "high water time");
    assert.ok(Math.abs(low.cm - 84) < 6, `low ${low.cm}`);
    assert.ok(Math.abs(high.cm - 388) < 6, `high ${high.cm}`);
  });

  it("reproduces the measured Phuket gauge (Ko Taphao Noi) for the same day", () => {
    const f = day("phuket");
    const low = f.extremes.find(
      (e) => e.type === "low" && Math.abs(e.t - bangkok(10, 10, 16, 17)) < HOUR,
    )!;
    const high = f.extremes.find(
      (e) => e.type === "high" && Math.abs(e.t - bangkok(10, 10, 22, 32)) < HOUR,
    )!;
    assert.ok(Math.abs(low.t - bangkok(10, 10, 16, 17)) < 5 * MIN);
    assert.ok(Math.abs(high.t - bangkok(10, 10, 22, 32)) < 5 * MIN);
    assert.ok(Math.abs(high.cm - 308) < 6, `high ${high.cm}`);
  });

  it("predicts three years ahead with the same rhythm (springs and neaps)", () => {
    const far = Date.UTC(2029, 8, 1);
    assert.ok(far < horizonEnd(Date.UTC(2026, 9, 10)) + 40 * 24 * HOUR);
    const f = harmonicForecast(getLocation("krabi-town"), far, far + 15 * 24 * HOUR);
    const ex = f.extremes;
    assert.ok(ex.length > 50 && ex.length < 64, `${ex.length} extremes in 15 days`);
    const ranges = ex.slice(1).map((e, i) => Math.abs(e.cm - ex[i].cm));
    assert.ok(Math.min(...ranges) < 160, "neap range");
    assert.ok(Math.max(...ranges) > 260 && Math.max(...ranges) < 460, "spring range");
  });
});

describe("tourStats", () => {
  const f = cosineForecast();
  it("summarises a falling tour through low water", () => {
    // High at T0, low at T0 + 6.21 h: tour from +3 h to +9 h covers the low.
    const s = tourStats(f, T0 + 3 * HOUR, T0 + 9 * HOUR)!;
    assert.equal(s.startRising, false);
    assert.equal(s.endRising, true);
    assert.equal(s.events.length, 1);
    assert.equal(s.events[0].type, "low");
    assert.ok(Math.abs(s.min.t - (T0 + PERIOD / 2)) < 15 * MIN);
    assert.ok(s.min.cm < s.startCm && s.min.cm < s.endCm);
    assert.ok(s.maxRate > 20 && s.maxRate < 120, `rate ${s.maxRate}`);
    assert.ok(Math.abs(s.net - (s.endCm - s.startCm)) < 1e-9);
  });
  it("returns null when the window leaves the forecast", () => {
    assert.equal(tourStats(f, T0 + 70 * HOUR, T0 + 80 * HOUR), null);
  });
});

describe("depth zones", () => {
  const mark = (depthM: number) => ({
    id: "m",
    kind: "point" as const,
    name: "bar",
    depthM,
    radiusM: 100,
    a: [8.0, 98.9] as [number, number],
  });
  it("flags insufficient depth red, tight amber, and says nothing otherwise", () => {
    // draft 90 + reserve 50 = 140 cm needed; charted 0.5 m
    assert.equal(evaluateMark(mark(0.5), 80, 90, 50).state, "red"); // 50+80 = 130 < 140
    assert.equal(evaluateMark(mark(0.5), 100, 90, 50).state, "amber"); // 150 -> +10
    assert.equal(evaluateMark(mark(0.5), 200, 90, 50).state, "none"); // +110
    assert.equal(evaluateMark(mark(0.5), 80, 90, 50).clearanceCm, -10);
  });
  it("never rates a spot without a measured draft", () => {
    const e = evaluateMark(mark(5), 300, null, 50);
    assert.equal(e.state, "no-draft");
    assert.equal(e.clearanceCm, null);
  });
  it("treats drying heights (negative depth) as needing more water", () => {
    assert.equal(evaluateMark(mark(-0.3), 150, 90, 50).state, "red"); // -30+150 = 120 < 140
  });
  it("builds closed rings of the right size", () => {
    const ring = circleRing([8, 98.9], 100);
    assert.deepEqual(ring[0], ring[ring.length - 1]);
    const lons = ring.map((p) => p[0]);
    const widthM =
      (Math.max(...lons) - Math.min(...lons)) * 111_320 * Math.cos((8 * Math.PI) / 180);
    assert.ok(Math.abs(widthM - 200) < 3, `width ${widthM}`);
    const cap = capsuleRing([8, 98.9], [8, 98.91], 50);
    assert.deepEqual(cap[0], cap[cap.length - 1]);
    const capLons = cap.map((p) => p[0]);
    const lenM =
      (Math.max(...capLons) - Math.min(...capLons)) * 111_320 * Math.cos((8 * Math.PI) / 180);
    assert.ok(Math.abs(lenM - (1100 + 100)) < 25, `length ${lenM}`);
  });
  it("harmonicLevelAt agrees with the forecast samples", () => {
    const t = Date.UTC(2026, 9, 10, 9, 44);
    const f = harmonicForecast(getLocation("krabi-town"), t - HOUR, t + HOUR, 5);
    assert.ok(Math.abs(harmonicLevelAt("krabi-town", t) - levelAt(f, t)!) < 1.5);
  });
});

describe("tide-only hosts", () => {
  it("recognises cyberni.de and www, ignoring case, port and proxy lists", () => {
    for (const h of [
      "cyberni.de",
      "www.cyberni.de",
      "CYBERNI.DE",
      "cyberni.de:443",
      "cyberni.de, proxy.example",
    ]) {
      assert.equal(isTideOnlyHost(h), true, h);
    }
  });
  it("does not match look-alikes or other hosts", () => {
    for (const h of [
      "",
      null,
      undefined,
      "cyberni.de.evil.com",
      "evilcyberni.de",
      "sub.cyberni.de",
      "krabiconnect.vercel.app",
      "localhost:8080",
    ]) {
      assert.equal(isTideOnlyHost(h), false, String(h));
    }
  });
  it("knows tide paths", () => {
    assert.equal(isTidePath("/tide"), true);
    assert.equal(isTidePath("/tide/x"), true);
    assert.equal(isTidePath("/tides"), false);
    assert.equal(isTidePath("/"), false);
  });
});
