import { CHARS } from "./data";
import { IN, moveOf, type GameState } from "./engine";

export type Difficulty = "easy" | "normal" | "hard";

const PROFILE: Record<Difficulty, { react: number; block: number; aggro: number; antiAir: number }> = {
  easy: { react: 22, block: 0.25, aggro: 0.25, antiAir: 0.15 },
  normal: { react: 13, block: 0.55, aggro: 0.45, antiAir: 0.45 },
  hard: { react: 7, block: 0.85, aggro: 0.65, antiAir: 0.8 },
};

/**
 * A small decision-making CPU. It re-plans every few frames (its "reaction
 * time"), holding the chosen input in between, so it feels human rather than
 * frame-perfect.
 */
export class FightAI {
  private plan = 0;
  private holdUntil = 0;
  private seq: number[] = [];
  constructor(
    private readonly me: 0 | 1,
    private readonly diff: Difficulty,
  ) {}

  input(s: GameState): number {
    if (this.seq.length) return this.seq.shift() ?? 0;
    if (s.frame < this.holdUntil) return this.plan;
    const p = PROFILE[this.diff];
    const f = s.f[this.me];
    const o = s.f[this.me === 0 ? 1 : 0];
    const dist = Math.abs(o.x - f.x);
    const toward = o.x > f.x ? IN.R : IN.L;
    const away = o.x > f.x ? IN.L : IN.R;
    const r = Math.random();
    const c = CHARS[f.char];
    const om = moveOf(o);
    let plan = 0;
    let hold = p.react;

    const incoming = s.proj.find(
      (pr) => pr.owner !== this.me && Math.abs(pr.x - f.x) < 360 && Math.sign(f.x - pr.x) === pr.dir,
    );

    if (f.state === "hitstun" || f.state === "down") {
      plan = 0;
    } else if (incoming && r < p.block + 0.1) {
      // Jump over ground shots or block them.
      plan = incoming.def.guard === "low" ? away | IN.D : r < 0.4 ? IN.U | toward : away;
      hold = 18;
    } else if (o.y > 30 && dist < 260 && r < p.antiAir) {
      plan = toward | IN.P; // uppercut anti-air
      hold = 4;
    } else if (o.state === "attack" && om && dist < 300 && r < p.block) {
      plan = om.guard === "low" ? away | IN.D : away;
      hold = 16;
    } else if (f.meter >= 100 && dist < 380 && r < p.aggro) {
      this.seq = [IN.D, IN.D, IN.D | IN.S, 0];
      return IN.D;
    } else if (dist > 420) {
      if (c.special.proj && r < 0.35 + p.aggro * 0.3) {
        plan = IN.S;
        hold = 3;
      } else if (r < 0.25) {
        this.seq = [toward, 0, toward, toward];
        return 0;
      } else {
        plan = toward;
        hold = 16;
      }
    } else if (dist > 200) {
      if (r < 0.2 * p.aggro + 0.1) {
        plan = IN.U | toward;
        hold = 6;
        this.seq = [IN.U | toward, ...Array(12).fill(toward), IN.K];
      } else if (r < 0.45 && f.char === "king") {
        plan = IN.S;
        hold = 3;
      } else if (r < 0.55) {
        plan = toward;
        hold = 14;
      } else if (r < 0.7 && c.special.proj) {
        plan = IN.S;
        hold = 3;
      } else {
        plan = away;
        hold = 12;
      }
    } else {
      // Close range: pressure, combos, throws.
      const pick = Math.random();
      if (pick < 0.18) {
        this.seq = [IN.P, 0, 0, 0, 0, 0, IN.P | IN.K, 0];
        return IN.P;
      }
      if (pick < 0.4 * (0.5 + p.aggro)) {
        this.seq = [IN.P, 0, 0, 0, 0, 0, 0, IN.K, 0, 0, 0, 0, 0, 0, 0, IN.S];
        return 0;
      }
      if (pick < 0.55) plan = IN.D | IN.K;
      else if (pick < 0.65) plan = IN.D | IN.P;
      else if (pick < 0.75) plan = IN.K;
      else if (pick < 0.88) {
        plan = away;
        hold = 10;
      } else plan = IN.P | IN.K;
      hold = Math.max(hold, 3);
      if (plan !== away) {
        this.seq = [plan, 0, 0];
        this.plan = 0;
        this.holdUntil = s.frame + hold;
        return plan;
      }
    }
    this.plan = plan;
    this.holdUntil = s.frame + hold;
    return plan;
  }
}
