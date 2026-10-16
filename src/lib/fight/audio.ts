import type { GameEvent } from "./engine";

/** Tiny WebAudio synth for punchy arcade SFX — no audio files needed. */
export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  muted = false;

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 0.5;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  private noise(dur: number, freq: number, q: number, vol: number, type: BiquadFilterType = "bandpass") {
    const c = this.ctx;
    if (!c || !this.master || !this.noiseBuf || this.muted) return;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    const t = c.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + dur);
  }

  private tone(f0: number, f1: number, dur: number, vol: number, type: OscillatorType = "sine", delay = 0) {
    const c = this.ctx;
    if (!c || !this.master || this.muted) return;
    const o = c.createOscillator();
    o.type = type;
    const g = c.createGain();
    const t = c.currentTime + delay;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  play(e: GameEvent) {
    switch (e.type) {
      case "hit":
        this.noise(0.12, 1800, 1.2, 0.7);
        this.tone(180, 60, 0.12, 0.5);
        break;
      case "heavyHit":
        this.noise(0.22, 900, 0.9, 0.9);
        this.tone(140, 40, 0.25, 0.8, "triangle");
        break;
      case "block":
        this.noise(0.06, 4200, 3, 0.4);
        this.tone(900, 500, 0.06, 0.15, "square");
        break;
      case "parry":
        this.tone(1400, 2600, 0.18, 0.3, "triangle");
        this.tone(2100, 3200, 0.22, 0.2, "sine", 0.04);
        break;
      case "armor":
        this.tone(300, 200, 0.2, 0.4, "square");
        break;
      case "throw":
        this.noise(0.3, 400, 0.7, 0.9, "lowpass");
        this.tone(110, 35, 0.35, 0.8, "triangle");
        break;
      case "tech":
        this.tone(800, 1200, 0.1, 0.3, "square");
        break;
      case "whiff":
        this.noise(0.09, (e.power ?? 40) > 60 ? 700 : 1300, 2, 0.25, "bandpass");
        break;
      case "jump":
        this.tone(220, 420, 0.1, 0.12, "sine");
        break;
      case "land":
        this.noise(0.1, 200, 1, (e.power ?? 1) > 1 ? 0.8 : 0.25, "lowpass");
        break;
      case "dash":
        this.noise(0.15, 1000, 1, 0.3, "highpass");
        break;
      case "special":
        this.tone(300, 900, 0.25, 0.3, "sawtooth");
        this.noise(0.3, 1500, 1, 0.3);
        break;
      case "super":
        this.tone(100, 800, 0.7, 0.35, "sawtooth");
        this.tone(150, 1200, 0.7, 0.25, "square", 0.05);
        this.noise(0.8, 600, 0.5, 0.4);
        break;
      case "projClash":
        this.noise(0.25, 2400, 1, 0.6);
        break;
      case "guardBreak":
        this.noise(0.35, 3000, 0.6, 0.8);
        this.tone(600, 100, 0.4, 0.4, "square");
        break;
      case "ko":
        this.tone(200, 30, 1.2, 0.8, "triangle");
        this.noise(1, 300, 0.5, 0.8, "lowpass");
        break;
      case "round":
        this.tone(440, 440, 0.12, 0.25, "square");
        this.tone(660, 660, 0.18, 0.25, "square", 0.14);
        break;
      case "fight":
        this.tone(520, 1040, 0.35, 0.35, "sawtooth");
        this.noise(0.3, 2000, 1, 0.3);
        break;
      case "burn":
        this.noise(0.08, 3000, 0.8, 0.12, "highpass");
        break;
    }
  }
}
