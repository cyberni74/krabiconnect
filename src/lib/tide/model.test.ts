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
  type TideForecast,
} from "./model.ts";
import { frameIndexFor, FRAME_LEVELS } from "./frames.ts";
import { demoForecast } from "./providers.ts";
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
    source: "open-meteo",
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
  it("demo forecast has alternating extremes", () => {
    const f = demoForecast(getLocation("krabi-town"), T0);
    assert.equal(f.source, "demo");
    assert.ok(f.extremes.length > 20);
  });
  it("finds the nearest location", () => {
    assert.equal(nearestLocation(7.75, 98.77).loc.id, "phi-phi");
    assert.equal(nearestLocation(7.9, 98.4).loc.id, "phuket");
  });
});
