import type { Ambient, Sfx } from "./types";

/** Loudness; a compressor behind it keeps peaks from clipping. */
const MASTER = 2.4;

/** Music mood per scene ambient. */
type Mood = "dusk" | "court" | "toil" | "dread" | "inferno";
const MOOD: Record<Ambient, Mood> = {
  village: "dusk",
  forest: "dusk",
  wind: "dusk",
  hut: "dusk",
  church: "court",
  library: "court",
  hall: "court",
  castle: "court",
  forge: "toil",
  crypt: "dread",
  dungeon: "dread",
  swamp: "dread",
  volcano: "inferno",
};
/** Scale degrees in semitones from the root (D). */
const SCALE: Record<Mood, number[]> = {
  dusk: [0, 2, 3, 5, 7, 9, 10], // dorian
  court: [0, 2, 3, 5, 7, 8, 10], // aeolian
  toil: [0, 1, 3, 5, 7, 8, 10], // phrygian
  dread: [0, 1, 3, 5, 6, 8, 10], // locrian with a tritone
  inferno: [0, 1, 4, 5, 7, 8, 10], // phrygian dominant
};
const ROOT = 73.42; // D2
const GRID = 0.25;
const MUSIC_LEVEL = 0.9;

/** Per-ambient noise bed: lowpass freq, volume, LFO rate (Hz), optional extra drone (Hz). */
const BEDS: Record<Ambient, [number, number, number, number?]> = {
  village: [900, 0.1, 0.1],
  forge: [400, 0.1, 0.25, 55],
  church: [300, 0.05, 0.05, 73],
  crypt: [260, 0.1, 0.06, 49],
  forest: [1500, 0.09, 0.15],
  swamp: [700, 0.1, 0.12, 62],
  hut: [350, 0.07, 0.3, 65],
  castle: [1100, 0.1, 0.12],
  hall: [280, 0.06, 0.05, 55],
  dungeon: [320, 0.09, 0.07, 46],
  volcano: [260, 0.2, 0.09, 41],
  library: [240, 0.05, 0.04, 82],
  wind: [1300, 0.12, 0.2],
};

/** Procedural WebAudio: ambient beds, a dark original theme and sound effects. */
class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  muted = false;
  private ambient: Ambient | null = null;
  private bed: { stop: () => void } | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicOut: GainNode | null = null;
  private mood: Mood | null = null;
  private step = 0;
  private nextT = 0;
  private noiseBuf: AudioBuffer | null = null;

  constructor() {
    try {
      this.muted = localStorage.getItem("rabenschwur-muted") === "1";
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
      localStorage.setItem("rabenschwur-muted", this.muted ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : MASTER, this.ctx.currentTime, 0.1);
  }

  setAmbient(a: Ambient) {
    if (a === this.ambient) return;
    this.ambient = a;
    this.setMood(a);
    if (!this.ctx || !this.master || !this.noiseBuf) return;
    this.bed?.stop();
    const ctx = this.ctx;
    const [freq, vol, rate, drone] = BEDS[a];
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = vol;
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = rate;
    lfoG.gain.value = vol * 0.7;
    lfo.connect(lfoG).connect(g.gain);
    src.connect(f).connect(g).connect(this.master);
    src.start();
    lfo.start();
    let osc: OscillatorNode | null = null;
    let og: GainNode | null = null;
    if (drone) {
      osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = drone;
      og = ctx.createGain();
      og.gain.value = 0.05;
      osc.connect(og).connect(this.master);
      osc.start();
    }
    this.bed = {
      stop: () => {
        g.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
        og?.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
        setTimeout(() => {
          src.stop();
          lfo.stop();
          osc?.stop();
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

  private noise(dur: number, freq: number, vol: number, when = 0, type: BiquadFilterType = "bandpass") {
    if (!this.ctx || !this.master || !this.noiseBuf) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const s = ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(this.master);
    s.start(t);
    s.stop(t + dur + 0.05);
  }

  /** Generative score: each mood is a mode plus a small set of recurring figures, scheduled on a 0.25 s grid. */
  private startMusic() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    this.musicOut = ctx.createGain();
    this.musicOut.gain.value = 0;
    this.musicOut.gain.setTargetAtTime(MUSIC_LEVEL, ctx.currentTime + 0.5, 0.8);
    const verb = ctx.createConvolver();
    verb.buffer = this.impulse(2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.6;
    this.musicOut.connect(this.master);
    this.musicOut.connect(verb).connect(wet).connect(this.master);
    this.nextT = ctx.currentTime + 0.1;
    this.musicTimer = setInterval(() => {
      if (!this.ctx) return;
      while (this.nextT < this.ctx.currentTime + 0.4) {
        this.beat(this.nextT, this.step++);
        this.nextT += GRID;
      }
    }, 100);
  }

  private impulse(sec: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return buf;
  }

  private setMood(a: Ambient) {
    const m = MOOD[a];
    if (m === this.mood) return;
    this.mood = m;
    if (!this.ctx || !this.musicOut) return;
    const t = this.ctx.currentTime;
    this.musicOut.gain.cancelScheduledValues(t);
    this.musicOut.gain.setTargetAtTime(0, t, 0.25);
    this.musicOut.gain.setTargetAtTime(MUSIC_LEVEL, t + 1.0, 0.5);
  }

  /** Pitch of scale degree n (0 = root D2), n may be negative. */
  private pitch(n: number): number {
    const sc = SCALE[this.mood ?? "dusk"];
    const k = ((n % 7) + 7) % 7;
    const oct = Math.floor(n / 7);
    return ROOT * Math.pow(2, (sc[k] + 12 * oct) / 12);
  }

  private beat(t: number, s: number) {
    const m = this.mood;
    if (!m || !this.ctx || !this.musicOut) return;
    const out = this.musicOut;
    const chord = [0, 3, 4, 0, 5, 3, 4, 0][(s >> 4) % 8]; // chord roots per bar (16 steps = 4 s)
    const rnd = (n: number) => Math.floor(Math.random() * n);
    const tn = (f: number, dur: number, type: OscillatorType, vol: number, when = 0) => this.toneTo(out, f, dur, type, vol, t + when);
    switch (m) {
      case "dusk": {
        if (s % 16 === 0) tn(this.pitch(chord - 7), 3.8, "sine", 0.05);
        if (s % 2 === 0 && Math.random() < 0.45) tn(this.pitch(chord + [0, 2, 4, 6][rnd(4)] + (Math.random() < 0.2 ? 7 : 0)), 1.4, "triangle", 0.035);
        break;
      }
      case "court": {
        if (s % 8 === 0) {
          tn(this.pitch(chord - 7), 6, "sine", 0.035);
          tn(this.pitch(chord), 6, "sine", 0.025);
        }
        if (s % 4 === 0 && Math.random() < 0.35) tn(this.pitch(chord + [2, 4, 5][rnd(3)]), 2.4, "sine", 0.03);
        if (s % 32 === 0) this.bell(t, this.pitch(chord + 7), 0.05);
        break;
      }
      case "toil": {
        if (s % 3 === 0) this.noiseTo(out, 0.12, 2400, 0.1, t);
        if (s % 2 === 0) tn(this.pitch(chord - 7), 0.2, "sawtooth", 0.018);
        if (s % 16 === 8 && Math.random() < 0.6) tn(this.pitch(chord + 6), 1.2, "triangle", 0.03);
        break;
      }
      case "dread": {
        if (s % 8 === 0) tn(55, 0.25, "sine", 0.12);
        if (s % 8 === 1) tn(50, 0.2, "sine", 0.1);
        if (s % 16 === 0) tn(this.pitch(-7), 4, "sine", 0.05);
        if (s % 20 === 10) this.noiseTo(out, 1.8, 1200 + rnd(900), 0.05, t, "bandpass");
        if (s % 24 === 12 && Math.random() < 0.7) this.bell(t, this.pitch([1, 3, 5][rnd(3)]), 0.06);
        break;
      }
      case "inferno": {
        if (s % 8 === 0) this.noiseTo(out, 3.5, 90, 0.5, t, "lowpass");
        if (s % 4 === 0) tn(this.pitch(chord - 14), 0.9, "sine", 0.1);
        if (s % 32 === 16) for (const d of [0, 4, 7]) tn(this.pitch(d - 7), 2.5, "sawtooth", 0.02);
        break;
      }
    }
  }

  private toneTo(out: AudioNode, freq: number, dur: number, type: OscillatorType, vol: number, t: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.05, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private noiseTo(out: AudioNode, dur: number, freq: number, vol: number, t: number, type: BiquadFilterType = "bandpass") {
    if (!this.ctx || !this.noiseBuf) return;
    const ctx = this.ctx;
    const s = ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(out);
    s.start(t);
    s.stop(t + dur + 0.05);
  }

  /** Church-like bell: inharmonic partials, long decay. */
  private bell(t: number, freq: number, vol: number) {
    for (const [r, v] of [
      [1, 1],
      [2.76, 0.4],
      [5.4, 0.2],
    ] as const) {
      this.toneTo(this.musicOut!, freq * r, 7, "sine", vol * v, t);
    }
  }

  blip(who: string) {
    if (!this.ctx) return;
    const base = who === "hero" ? 300 : 120 + (who.charCodeAt(0) % 9) * 22;
    for (let k = 0; k < 3; k++) this.tone(base + Math.random() * 60, 0.06, "square", 0.014, k * 0.07);
  }

  sfx(name: Sfx) {
    if (!this.ctx) return;
    switch (name) {
      case "pickup":
        this.tone(520, 0.1, "triangle", 0.13);
        this.tone(780, 0.16, "triangle", 0.11, 0.07);
        break;
      case "coin":
        this.tone(1320, 0.1, "square", 0.05);
        this.tone(1760, 0.3, "square", 0.05, 0.08);
        break;
      case "dig":
        this.noise(0.22, 400, 0.4);
        this.noise(0.22, 300, 0.35, 0.4);
        break;
      case "door":
        this.tone(110, 0.5, "sawtooth", 0.05, 0, 40);
        this.noise(0.4, 500, 0.15);
        break;
      case "creak":
        this.tone(190, 0.5, "sawtooth", 0.04, 0, 90);
        this.tone(230, 0.4, "sawtooth", 0.03, 0.15, -60);
        break;
      case "drawer":
        this.noise(0.25, 700, 0.3);
        this.tone(140, 0.2, "triangle", 0.05);
        break;
      case "unlock":
        this.tone(900, 0.06, "square", 0.05);
        this.tone(1200, 0.08, "square", 0.05, 0.08);
        this.noise(0.1, 2500, 0.2, 0.05);
        break;
      case "clank":
        this.tone(320, 0.25, "square", 0.05, 0, -120);
        this.noise(0.2, 3000, 0.25);
        break;
      case "hammer":
        this.tone(180, 0.18, "square", 0.08, 0, -100);
        this.noise(0.25, 2400, 0.4);
        this.tone(1500, 0.5, "sine", 0.03, 0.02);
        break;
      case "fire":
        this.noise(0.8, 1200, 0.25, 0, "highpass");
        break;
      case "magic":
        for (let k = 0; k < 8; k++) this.tone(500 + k * 130, 0.5, "sine", 0.045, k * 0.07);
        break;
      case "splash":
        this.noise(0.5, 900, 0.4);
        break;
      case "bell":
        this.tone(330, 2.4, "sine", 0.1);
        this.tone(660, 1.8, "sine", 0.05);
        break;
      case "roar":
        this.tone(70, 1.8, "sawtooth", 0.14, 0, -30);
        this.noise(1.6, 300, 0.4);
        break;
      case "fanfare":
        [0, 4, 7, 12, 7, 12].forEach((s, k) => this.tone(262 * Math.pow(2, s / 12), 0.4, "triangle", 0.12, k * 0.17));
        break;
      case "wrong":
        this.tone(200, 0.3, "square", 0.05, 0, -80);
        break;
    }
  }
}

export const audio = new AudioEngine();
