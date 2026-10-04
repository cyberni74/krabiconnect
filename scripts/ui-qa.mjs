#!/usr/bin/env node
/**
 * UI QA – layout audit for /secret-islands (+ booking wizard, modals) and /krabi-guide.
 *
 * Detects clipped/ellipsised text, buttons whose label overflows, small touch targets,
 * 3+ line button labels, horizontal page overflow, off-screen elements, fixed bars covering
 * content at the end of the page, and console errors – per viewport × language × state.
 *
 * Usage:
 *   node scripts/ui-qa.mjs                       # full matrix
 *   node scripts/ui-qa.mjs --vp=390x844,1366x860 --lang=de,ja --state=page,wizard --conc=4
 * Env: UIQA_BASE (default http://127.0.0.1:8080), UIQA_OUT (default /tmp/claude-0)
 * Output: $UIQA_OUT/ui-qa-report.json, screenshots $UIQA_OUT/shots/uiqa-*.png
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "../node_modules/playwright/index.mjs";

const BASE = process.env.UIQA_BASE || "http://127.0.0.1:8080";
const OUT = process.env.UIQA_OUT || "/tmp/claude-0";
const SHOTS = path.join(OUT, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const ALL_VP = ["320x568", "360x740", "375x667", "390x844", "414x896", "768x1024", "1024x768", "1366x860", "1920x1080"];
const VPS = (arg("vp")?.split(",") ?? ALL_VP).map((s) => {
  const [w, h] = s.split("x").map(Number);
  return { w, h, id: s };
});
const LANGS = arg("lang")?.split(",") ?? ["de", "en", "zh", "ko", "ja"];
const STATES = arg("state")?.split(",") ?? ["page", "langmenu", "tour", "lightbox", "wizard", "custom", "guide", "article"];
const CONC = Number(arg("conc") ?? 4);
const MAX_SHOTS = Number(arg("shots") ?? 80);
const LOCALE = { de: "de-DE", en: "en-GB", zh: "zh-CN", ko: "ko-KR", ja: "ja-JP" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const url = (p, lang) => `${BASE}${p}${lang === "de" ? "" : `${p.includes("?") ? "&" : "?"}lang=${lang}`}`;

/* ─────────────── in-page audit (serialised into the browser) ─────────────── */
function auditInPage({ scope, band, checkFixed }) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mobile = vw < 768;
  const out = [];
  const root = scope ? document.querySelector(scope) : document.body;
  if (!root) return { issues: [{ issue: "scope-missing", selector: scope }], pageOverflow: 0 };

  const cssPath = (el) => {
    const parts = [];
    let e = el;
    for (let i = 0; e && e.nodeType === 1 && i < 4; i++, e = e.parentElement) {
      if (e.id) {
        parts.unshift(`#${e.id}`);
        break;
      }
      const cls = [...e.classList].filter((c) => !c.includes(":") && !c.includes("[")).slice(0, 3);
      parts.unshift(e.tagName.toLowerCase() + (cls.length ? `.${cls.join(".")}` : ""));
    }
    return parts.join(" > ");
  };
  const ownText = (el) =>
    [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join("")
      .trim();
  /** Union of the rects of all visible text nodes inside `el` (element boxes such as icons/images excluded). */
  const textRect = (el) => {
    const rects = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim() || hiddenish(n.parentElement)) continue;
      const r = document.createRange();
      r.selectNodeContents(n);
      for (const x of r.getClientRects()) if (x.width > 0.5 && x.height > 0.5) rects.push(x);
    }
    if (!rects.length) return null;
    const box = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
    for (const x of rects) {
      box.left = Math.min(box.left, x.left);
      box.right = Math.max(box.right, x.right);
      box.top = Math.min(box.top, x.top);
      box.bottom = Math.max(box.bottom, x.bottom);
    }
    return { ...box, rects };
  };
  const hiddenish = (el) => {
    let op = 1;
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      op *= Number(cs.opacity);
      // effectively invisible (e.g. hero content faded out by scroll parallax)
      if (cs.display === "none" || cs.visibility === "hidden" || op < 0.35) return true;
      if (cs.animationName && cs.animationName.includes("marquee")) return true;
      const r = e.getBoundingClientRect();
      if (r.width <= 1 && r.height <= 1) return true; // sr-only
    }
    return false;
  };
  const inBand = (r) => r.bottom > 0 && r.top < vh && (!band || (r.top >= 0 && r.top <= vh * band));
  const fixedAncestor = (el) => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const p = getComputedStyle(e).position;
      if (p === "fixed" || p === "sticky") return e;
    }
    return null;
  };
  const clipAncestor = (el) => {
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      const ox = cs.overflowX;
      const oy = cs.overflowY;
      if (ox === "auto" || ox === "scroll" || oy === "auto" || oy === "scroll") return { el: e, scroller: true };
      if (ox === "hidden" || ox === "clip" || oy === "hidden" || oy === "clip") return { el: e, scroller: false, ox, oy };
    }
    return null;
  };
  const inScroller = (el) => {
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (/auto|scroll/.test(cs.overflowX)) return true;
    }
    return false;
  };
  /** Max number of lines any single text node of `el` wraps into. */
  const lineCount = (el) => {
    let max = 0;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const r = document.createRange();
      r.selectNodeContents(n);
      const lines = [];
      for (const x of r.getClientRects()) {
        if (x.width < 1) continue;
        const same = lines.find((l) => Math.min(l.b, x.bottom) - Math.max(l.t, x.top) > Math.min(l.b - l.t, x.height) * 0.5);
        if (!same) lines.push({ t: x.top, b: x.bottom });
      }
      max = Math.max(max, lines.length);
    }
    return max;
  };
  const add = (el, issue, extra = {}) => {
    const r = el.getBoundingClientRect();
    // remember the element without touching the DOM (attributes would break React hydration)
    const reg = (window.__uiqaEls = window.__uiqaEls || []);
    let qa = reg.indexOf(el);
    if (qa < 0) qa = reg.push(el) - 1;
    out.push({
      issue,
      qa,
      selector: cssPath(el),
      text: (el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 80),
      rect: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
      ...extra,
    });
  };

  const interactiveSel = 'button, a[href], [role="button"], [role="tab"], [role="option"], summary, label';
  const els = root.querySelectorAll("*");
  for (const el of els) {
    if (el.closest("svg") || ["SCRIPT", "STYLE", "IMG", "VIDEO", "SVG", "PATH", "NOSCRIPT", "IFRAME"].includes(el.tagName)) continue;
    if (el.closest("grok-app-builder-extensions, [id^='grok'], [class*='grok-']")) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || !inBand(r)) continue;
    const txt = ownText(el);
    const interactive = el.matches(interactiveSel);
    if (!txt && !interactive) continue;
    if (hiddenish(el)) continue;
    const cs = getComputedStyle(el);

    // 1a. ellipsis truncating
    if (txt && cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) add(el, "ellipsis-truncated", { sw: el.scrollWidth, cw: el.clientWidth });
    // 1b. own overflow hidden/clip cutting text
    else if (txt && /hidden|clip/.test(cs.overflowX + cs.overflowY)) {
      const lc = cs.webkitLineClamp && cs.webkitLineClamp !== "none";
      if (el.scrollWidth > el.clientWidth + 1 && /hidden|clip/.test(cs.overflowX)) add(el, "clipped-x", { sw: el.scrollWidth, cw: el.clientWidth });
      else if (el.scrollHeight > el.clientHeight + 1 && /hidden|clip/.test(cs.overflowY))
        add(el, lc ? (el.innerText.trim().length > 60 || (el.tagName === "P" && Number(cs.fontWeight) < 600) ? "accepted:line-clamp-excerpt" : "line-clamp-label") : "clipped-y", { sh: el.scrollHeight, ch: el.clientHeight });
    }
    // 1c. text cut by a clipping ancestor (overflow hidden/clip). Line-clamped / ellipsised text is reported by 1a/1b.
    const clamped = (e) => {
      for (let x = e; x && x !== document.body; x = x.parentElement) {
        const c = getComputedStyle(x);
        if ((c.webkitLineClamp && c.webkitLineClamp !== "none") || c.textOverflow === "ellipsis") return true;
      }
      return false;
    };
    if (txt && !clamped(el)) {
      const tr = textRect(el);
      const ca = clipAncestor(el);
      if (tr && ca && !ca.scroller) {
        const cr = ca.el.getBoundingClientRect();
        const cx = /hidden|clip/.test(ca.ox) && (tr.left < cr.left - 1.5 || tr.right > cr.right + 1.5);
        // the text node's content box is taller than the line box (ascent/descent) – allow ~0.25em
        const tol = Math.max(2, parseFloat(cs.fontSize) * 0.25);
        const cy = /hidden|clip/.test(ca.oy) && (tr.top < cr.top - tol || tr.bottom > cr.bottom + tol);
        // ignore ancestors that are the page root clip (handled by off-screen) or viewport-wide
        if ((cx || cy) && cr.width < vw - 2) add(el, "cut-by-ancestor", { ancestor: cssPath(ca.el), axis: cx ? "x" : "y" });
      }
      // 4b. text partly outside the viewport horizontally (not inside a scroller)
      if (tr && (tr.left < -1 || tr.right > vw + 1) && !inScroller(el) && !clamped(el)) add(el, "offscreen-x", { left: Math.round(tr.left), right: Math.round(tr.right) });
    }

    // 2. buttons / links / chips
    if (interactive && cs.display !== "inline") {
      const tr = textRect(el);
      const hasClamp = clamped(el) || [...el.querySelectorAll("*")].some((x) => {
        const c = getComputedStyle(x);
        return (c.webkitLineClamp && c.webkitLineClamp !== "none") || c.textOverflow === "ellipsis";
      });
      if (tr && !hasClamp) {
        if (tr.left < r.left - 1.5 || tr.right > r.right + 1.5 || tr.top < r.top - Math.max(2, parseFloat(cs.fontSize) * 0.25) || tr.bottom > r.bottom + Math.max(2, parseFloat(cs.fontSize) * 0.25))
          add(el, "label-overflows-control", { text_box: [Math.round(tr.left), Math.round(tr.right)], box: [Math.round(r.left), Math.round(r.right)] });
        const label = (el.innerText || "").trim();
        if (el.matches('button, [role="button"], [role="tab"], [role="option"]') && label.length <= 32 && !el.hasAttribute("aria-expanded") && !el.querySelector('p, h2, h3, h4, li, img, [role="img"]')) {
          const lines = lineCount(el);
          if (lines >= 3) add(el, "label-3plus-lines", { lines });
        }
      }
      if (mobile && r.height < 44 - 0.5 && el.matches('button, [role="button"], [role="tab"], [role="option"]') && r.width < vw * 0.9)
        add(el, "small-touch-target", { h: Math.round(r.height), w: Math.round(r.width) });
    }
  }

  // 4. fixed bars covering interactive elements (only meaningful at end of page) / each other
  const covered = [];
  if (checkFixed) {
    for (const el of root.querySelectorAll(interactiveSel)) {
      if (fixedAncestor(el) || hiddenish(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || r.bottom <= 0 || r.top >= vh) continue;
      const cx = Math.min(vw - 1, Math.max(0, r.left + r.width / 2));
      const cy = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
      const hit = document.elementFromPoint(cx, cy);
      if (hit && !el.contains(hit) && !hit.contains(el)) {
        const fa = fixedAncestor(hit);
        if (fa && fa.getBoundingClientRect().top > vh * 0.5) covered.push({ el, by: cssPath(fa) });
      }
    }
    for (const c of covered) add(c.el, "covered-by-fixed", { by: c.by });
  }
  const pageOverflow = document.documentElement.scrollWidth - vw;
  return { issues: out, pageOverflow };
}

/* ─────────────── helpers ─────────────── */
const report = [];
const accepted = {};
const consoleErrors = [];
let shotCount = 0;
const seenShot = new Set();

const coverage = {};
async function runAudit(page, ctx, opts = {}) {
  coverage[ctx.state] = (coverage[ctx.state] || 0) + 1;
  const args = { scope: opts.scope ?? null, band: opts.band ?? null, checkFixed: !!opts.checkFixed };
  let res = await page.evaluate(auditInPage, args);
  // Re-verify after a pause: anything that disappears was an animation mid-flight.
  if (res.issues.some((i) => !i.issue.startsWith("accepted:"))) {
    await sleep(1000);
    const again = await page.evaluate(auditInPage, args);
    const keep = new Set(again.issues.map((i) => `${i.qa}|${i.issue}`));
    res = { pageOverflow: Math.min(res.pageOverflow, again.pageOverflow), issues: res.issues.filter((i) => keep.has(`${i.qa}|${i.issue}`)) };
  }
  if (res.pageOverflow > 0) res.issues.push({ issue: "page-overflow-x", selector: "html", text: `scrollWidth exceeds viewport by ${res.pageOverflow}px` });
  for (const i of res.issues) {
    if (i.issue.startsWith("accepted:")) {
      accepted[i.issue] = (accepted[i.issue] || 0) + 1;
      continue;
    }
    const rec = { ...ctx, ...i };
    const key = `${rec.vp}|${rec.lang}|${rec.state}|${rec.issue}|${rec.selector}|${rec.text}`;
    if (report.some((x) => x._k === key)) continue;
    rec._k = key;
    report.push(rec);
    const shotKey = `${rec.issue}|${rec.selector}|${rec.lang}`;
    if (shotCount < MAX_SHOTS && !seenShot.has(shotKey) && rec.rect) {
      seenShot.add(shotKey);
      shotCount++;
      const file = path.join(SHOTS, `uiqa-${shotCount}-${rec.state}-${rec.lang}-${rec.vp}-${rec.issue}.png`);
      try {
        await page.evaluate(([r, qa]) => {
          const el = (window.__uiqaEls || [])[qa];
          const b = el ? el.getBoundingClientRect() : { left: r.x, top: r.y, width: r.w, height: r.h };
          const d = document.createElement("div");
          d.id = "__uiqa_mark";
          Object.assign(d.style, { position: "fixed", left: `${b.left - 3}px`, top: `${b.top - 3}px`, width: `${b.width + 6}px`, height: `${b.height + 6}px`, outline: "3px solid #ff2d55", zIndex: 2147483647, pointerEvents: "none" });
          document.body.appendChild(d);
        }, [rec.rect, rec.qa]);
        await page.screenshot({ path: file, caret: "initial" });
        await page.evaluate(() => document.getElementById("__uiqa_mark")?.remove());
        rec.shot = file;
      } catch {
        /* ignore */
      }
    }
  }
}

async function newPage(browser, vp, lang, state) {
  const context = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 1,
    isMobile: vp.w < 768,
    hasTouch: vp.w < 768,
    locale: LOCALE[lang],
    reducedMotion: "reduce",
  });
  // remote images are blocked in the sandbox – abort them fast
  await context.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (r) => r.abort());
  const page = await context.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource|ERR_FAILED|net::/.test(m.text())) consoleErrors.push({ vp: vp.id, lang, state, text: m.text().slice(0, 4000) });
  });
  page.on("pageerror", (e) => consoleErrors.push({ vp: vp.id, lang, state, text: `pageerror: ${e.message}`.slice(0, 4000) }));
  return { context, page };
}

async function load(page, p, lang) {
  await page.goto(url(p, lang), { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForLoadState("load", { timeout: 20000 }).catch(() => {});
  await page.waitForFunction(() => document.documentElement.lang !== "", null, { timeout: 15000 }).catch(() => {});
  // hydrated + entry animations running: the Secret-Islands header fades in from opacity 0
  await page
    .waitForFunction(() => {
      const h = document.querySelector("header > div");
      return !h || Number(getComputedStyle(h).opacity) > 0.99;
    }, null, { timeout: 20000 })
    .catch(() => {});
  await sleep(2200);
}

async function scrollAudit(page, ctx) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = ctx.h;
  const step = Math.round(vh * 0.5);
  for (let y = 0; y <= total; y += step) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await sleep(450);
    await runAudit(page, ctx, { band: 0.9 });
  }
  // end of page: fixed bars covering content?
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await sleep(700);
  await runAudit(page, ctx, { checkFixed: true });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await sleep(300);
}

async function scrollWithin(page, sel, ctx) {
  const h = await page.evaluate((s) => document.querySelector(s)?.scrollHeight ?? 0, sel);
  const ch = await page.evaluate((s) => document.querySelector(s)?.clientHeight ?? 1, sel);
  for (let y = 0; y <= Math.max(0, h - ch) + 1; y += Math.max(200, Math.round(ch * 0.7))) {
    await page.evaluate(([s, yy]) => document.querySelector(s)?.scrollTo({ top: yy, behavior: "instant" }), [sel, y]);
    await sleep(300);
    await runAudit(page, ctx, { scope: '[role="dialog"]' });
  }
}

const WIZ = '[role="dialog"][aria-modal="true"]';
async function wizardScroller(page) {
  // mark the wizard's body scroller for scrollWithin
  await page.evaluate((w) => {
    const d = document.querySelector(w);
    const s = d && [...d.querySelectorAll("div")].find((x) => /auto|scroll/.test(getComputedStyle(x).overflowY) && x.scrollHeight > 0 && x.clientWidth > 200);
    document.querySelectorAll("[data-uiqa-scroll]").forEach((x) => x.removeAttribute("data-uiqa-scroll"));
    s?.setAttribute("data-uiqa-scroll", "1");
  }, WIZ);
  return "[data-uiqa-scroll]";
}
async function wizardStep(page, n) {
  await page.locator(`${WIZ} nav ol > li button`).nth(n).click({ timeout: 5000 });
  await sleep(700);
}

/** Click until a dialog shows up (the page may still be hydrating under load). */
async function openDialog(page, locator) {
  for (let i = 0; i < 4; i++) {
    await locator.scrollIntoViewIfNeeded().catch(() => {});
    await sleep(400);
    await locator.click({ timeout: 10000 }).catch(() => {});
    try {
      await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
      await sleep(700);
      return;
    } catch {
      /* retry */
    }
  }
  throw new Error("dialog did not open");
}

/* ─────────────── states ─────────────── */
async function job(browser, vp, lang, state) {
  const ctx = { vp: vp.id, w: vp.w, h: vp.h, lang, state };
  const { context, page } = await newPage(browser, vp, lang, state);
  try {
    if (state === "guide" || state === "article") {
      if (!["de", "en"].includes(lang)) return;
      await load(page, state === "guide" ? "/krabi-guide" : "/krabi-guide/koh-roi-hidden-lagoon", lang);
      await scrollAudit(page, ctx);
      return;
    }
    await load(page, "/secret-islands", lang);
    if (state === "page") return await scrollAudit(page, ctx);
    if (state === "langmenu") {
      await page.locator('header button[aria-label="Language"]').click();
      await sleep(500);
      return await runAudit(page, ctx, { scope: "header" });
    }
    if (state === "tour") {
      await openDialog(page, page.locator("#touren div.grid.grid-cols-2 > button").first());
      const sel = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]');
        const s = d && [d, ...d.querySelectorAll("*")].find((x) => /auto|scroll/.test(getComputedStyle(x).overflowY) && x.scrollHeight > x.clientHeight);
        s?.setAttribute("data-uiqa-scroll", "1");
        return s ? "[data-uiqa-scroll]" : null;
      });
      if (sel) await scrollWithin(page, sel, ctx);
      else await runAudit(page, ctx, { scope: '[role="dialog"]' });
      return;
    }
    if (state === "lightbox") {
      await openDialog(page, page.locator("#galerie button[aria-label]").first());
      return await runAudit(page, ctx, { scope: '[role="dialog"]' });
    }
    if (state === "wizard" || state === "custom") {
      // open from hero: primary = preset wizard, secondary = custom builder
      const heroBtns = page.locator("#top button");
      const texts = await heroBtns.allInnerTexts();
      // last two CTA buttons in the hero: [primary, custom]
      const idx = texts.map((t, i) => [t, i]).filter(([t]) => t.trim().length > 0).map(([, i]) => i);
      const target = state === "wizard" ? idx[0] : idx[1];
      await openDialog(page, heroBtns.nth(target));
      const ctx0 = { ...ctx, state: `${state}-1` };
      let sc = await wizardScroller(page);
      await scrollWithin(page, sc, ctx0);
      // step 1: choose tour / island
      if (state === "wizard") await page.locator(`${WIZ} button[aria-pressed]`).filter({ has: page.locator("p") }).first().click();
      else await page.locator(`${WIZ} button.h-28[aria-pressed]:not([disabled])`).first().click();
      await sleep(600);
      await runAudit(page, ctx0, { scope: WIZ });
      // step 2: date
      await wizardStep(page, 1);
      await page.locator(`${WIZ} [role="grid"] button:not([disabled])`).first().click();
      await sleep(700);
      await page.locator(`${WIZ} button.min-h-16:not([disabled])`).first().click();
      await sleep(500);
      sc = await wizardScroller(page);
      await scrollWithin(page, sc, { ...ctx, state: `${state}-2` });
      for (const n of [2, 3, 4]) {
        await wizardStep(page, n);
        sc = await wizardScroller(page);
        await scrollWithin(page, sc, { ...ctx, state: `${state}-${n + 1}` });
      }
      return;
    }
  } catch (e) {
    report.push({ ...ctx, issue: "script-error", selector: "", text: String(e.message).slice(0, 300) });
  } finally {
    await context.close();
  }
}

/* ─────────────── main ─────────────── */
const jobs = [];
for (const state of STATES)
  for (const vp of VPS)
    for (const lang of LANGS) {
      if ((state === "guide" || state === "article") && !["de", "en"].includes(lang)) continue;
      jobs.push([vp, lang, state]);
    }

const browser = await chromium.launch({ executablePath: process.env.UIQA_CHROMIUM || "/opt/pw-browsers/chromium" });
const t0 = Date.now();
let done = 0;
async function worker() {
  while (jobs.length) {
    const [vp, lang, state] = jobs.shift();
    await job(browser, vp, lang, state);
    done++;
    if (done % 10 === 0) process.stderr.write(`… ${done} jobs, ${report.length} issues, ${Math.round((Date.now() - t0) / 1000)}s\n`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
await browser.close();

for (const r of report) delete r._k;
const summary = {};
for (const r of report) summary[r.issue] = (summary[r.issue] || 0) + 1;
fs.writeFileSync(path.join(OUT, "ui-qa-report.json"), JSON.stringify({ base: BASE, generated: new Date().toISOString(), summary, accepted, coverage, consoleErrors, issues: report }, null, 2));
console.log(JSON.stringify({ summary, accepted, coverage, consoleErrors: consoleErrors.length, issues: report.length, seconds: Math.round((Date.now() - t0) / 1000), report: path.join(OUT, "ui-qa-report.json") }, null, 2));
