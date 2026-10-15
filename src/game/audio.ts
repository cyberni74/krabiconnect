import type { Ambient } from "./types";

type Sfx = "pickup" | "coin" | "dig" | "door" | "magic" | "splash" | "fanfare" | "wrong" | "horn";

/** Master loudness; a compressor behind it keeps peaks from clipping. */
const MASTER = 2.6;

/** Procedural WebAudio: ambient beds, a small original melody loop and sound effects. */
class Audio {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  muted = false;
  private ambient: Ambient | null = null;
  private bed: { stop: () => void } | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private noiseBuf: AudioBuffer | null = null;

  constructor() {
    try {
      this.muted = localStorage.getItem("krabbenbucht-muted") === "1";
    } catch {
      /* ignore */
    }
  }

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : MASTER;
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 6;
      this.master.connect(comp).connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 2;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        d[i] = last * 3.5;
      }
      if (this.ambient) {
        const a = this.ambient;
        this.ambient = null;
        this.setAmbient(a);
      }
      this.startMusic();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem("krabbenbucht-muted", this.muted ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : MASTER, this.ctx.currentTime, 0.1);
  }

  setAmbient(a: Ambient) {
    if (a === this.ambient) return;
    this.ambient = a;
    if (!this.ctx || !this.master || !this.noiseBuf) return;
    this.bed?.stop();
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    f.type = "lowpass";
    const cfg: Record<Ambient, [number, number, number]> = {
      sea: [600, 0.2, 0.12],
      ship: [700, 0.18, 0.15],
      wind: [1200, 0.1, 0.25],
      tavern: [250, 0.05, 0.3],
      jungle: [2500, 0.035, 0.6],
      cave: [300, 0.12, 0.08],
    };
    const [freq, vol, rate] = cfg[a];
    f.frequency.value = freq;
    g.gain.value = vol;
    lfo.frequency.value = rate;
    lfoG.gain.value = vol * 0.8;
    lfo.connect(lfoG).connect(g.gain);
    src.connect(f).connect(g).connect(this.master);
    src.start();
    lfo.start();
    this.bed = {
      stop: () => {
        g.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
        setTimeout(() => {
          src.stop();
          lfo.stop();
        }, 1500);
      },
    };
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, when = 0, slide = 0) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private startMusic() {
    // An original, gently rolling 6/8 tune in D dorian, plucked.
    const D = 293.66;
    const st = (n: number) => D * Math.pow(2, n / 12);
    const melody = [0, 3, 5, 7, 5, 3, 2, -2, 0, 2, 3, 0, 7, 10, 12, 10, 7, 5, 3, 5, 7, 3, 2, 0];
    const bass = [-12, -12, -9, -9, -14, -14, -12, -12];
    let i = 0;
    this.musicTimer = setInterval(() => {
      if (!this.ctx || this.muted) {
        i++;
        return;
      }
      const amb = this.ambient;
      const vol = amb === "cave" ? 0.025 : amb === "tavern" ? 0.06 : 0.035;
      const n = melody[i % melody.length];
      if (i % 3 !== 2 || i % 6 === 2) this.tone(st(n), 0.5, "triangle", vol);
      if (i % 3 === 0) this.tone(st(bass[Math.floor(i / 3) % bass.length]), 0.9, "sine", vol * 1.3);
      i++;
    }, 260);
  }

  blip(who: string) {
    if (!this.ctx) return;
    const base = who === "hero" ? 520 : 300 + (who.charCodeAt(0) % 8) * 40;
    for (let k = 0; k < 3; k++) this.tone(base + Math.random() * 120, 0.05, "square", 0.012, k * 0.07);
  }

  sfx(name: Sfx) {
    if (!this.ctx) return;
    switch (name) {
      case "pickup":
        this.tone(660, 0.12, "triangle", 0.12);
        this.tone(990, 0.18, "triangle", 0.1, 0.08);
        break;
      case "coin":
        this.tone(1320, 0.1, "square", 0.05);
        this.tone(1760, 0.3, "square", 0.05, 0.08);
        break;
      case "dig":
        for (let k = 0; k < 3; k++) this.tone(120, 0.15, "sawtooth", 0.08, k * 0.35, -60);
        break;
      case "door":
        this.tone(180, 0.35, "sawtooth", 0.04, 0, 80);
        break;
      case "magic":
        for (let k = 0; k < 8; k++) this.tone(600 + k * 140, 0.4, "sine", 0.05, k * 0.06);
        break;
      case "splash":
        this.tone(300, 0.4, "sine", 0.1, 0, -250);
        break;
      case "fanfare":
        [0, 4, 7, 12, 7, 12].forEach((s, k) => this.tone(392 * Math.pow(2, s / 12), 0.35, "triangle", 0.12, k * 0.15));
        break;
      case "wrong":
        this.tone(220, 0.3, "square", 0.05, 0, -80);
        break;
      case "horn":
        this.tone(147, 1.6, "sawtooth", 0.08, 0, 6);
        this.tone(220, 1.6, "triangle", 0.06, 0.05, 4);
        break;
    }
  }
}

export const audio = new Audio();
