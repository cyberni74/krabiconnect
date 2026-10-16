import { IN } from "./engine";

type Bind = Record<string, number>;

export const P1_KEYS: Bind = {
  KeyA: IN.L,
  KeyD: IN.R,
  KeyW: IN.U,
  KeyS: IN.D,
  KeyF: IN.P,
  KeyC: IN.P,
  KeyG: IN.K,
  KeyV: IN.K,
  KeyH: IN.S,
  KeyB: IN.S,
};

export const P2_KEYS: Bind = {
  ArrowLeft: IN.L,
  ArrowRight: IN.R,
  ArrowUp: IN.U,
  ArrowDown: IN.D,
  KeyK: IN.P,
  Numpad1: IN.P,
  Comma: IN.P,
  KeyL: IN.K,
  Numpad2: IN.K,
  Period: IN.K,
  Semicolon: IN.S,
  Numpad3: IN.S,
  Slash: IN.S,
};

/**
 * Collects keyboard, gamepad and on-screen touch input. `read(slot)` returns
 * the input bits for player slot 0/1; `merged` routes every device to slot 0
 * (single-player and online, where the local human is always "you").
 */
export class InputHub {
  private down = new Set<string>();
  /** Keys pressed since the last read — a tap shorter than one frame still counts. */
  private tapped = new Set<string>();
  /** Bits pressed on the on-screen pad. */
  touch = 0;
  merged = false;

  private onDown = (e: KeyboardEvent) => {
    if (e.code in P1_KEYS || e.code in P2_KEYS) e.preventDefault();
    this.down.add(e.code);
    if (!e.repeat) this.tapped.add(e.code);
  };
  private onUp = (e: KeyboardEvent) => {
    this.down.delete(e.code);
  };
  private onBlur = () => {
    this.down.clear();
    this.tapped.clear();
    this.touch = 0;
  };

  attach() {
    window.addEventListener("keydown", this.onDown);
    window.addEventListener("keyup", this.onUp);
    window.addEventListener("blur", this.onBlur);
  }

  detach() {
    window.removeEventListener("keydown", this.onDown);
    window.removeEventListener("keyup", this.onUp);
    window.removeEventListener("blur", this.onBlur);
  }

  private keys(bind: Bind) {
    let b = 0;
    for (const code of this.down) b |= bind[code] ?? 0;
    for (const code of this.tapped) {
      if (code in bind) {
        b |= bind[code];
        this.tapped.delete(code);
      }
    }
    return b;
  }

  private pad(index: number) {
    const pads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
    const connected = [...pads].filter((p): p is Gamepad => !!p && p.connected);
    const g = connected[index];
    if (!g) return 0;
    const btn = (i: number) => !!g.buttons[i]?.pressed;
    const ax = g.axes[0] ?? 0;
    const ay = g.axes[1] ?? 0;
    let b = 0;
    if (btn(14) || ax < -0.5) b |= IN.L;
    if (btn(15) || ax > 0.5) b |= IN.R;
    if (btn(12) || ay < -0.6) b |= IN.U;
    if (btn(13) || ay > 0.5) b |= IN.D;
    if (btn(2) || btn(0)) b |= IN.P; // X / A
    if (btn(3) || btn(1)) b |= IN.K; // Y / B
    if (btn(5) || btn(7) || btn(4) || btn(6)) b |= IN.S; // shoulders
    return b;
  }

  read(slot: 0 | 1): number {
    if (this.merged) {
      return this.keys(P1_KEYS) | this.keys(P2_KEYS) | this.pad(0) | this.touch;
    }
    return slot === 0 ? this.keys(P1_KEYS) | this.pad(0) | this.touch : this.keys(P2_KEYS) | this.pad(1);
  }

  /** Any confirm-like press, for menus. */
  anyKey() {
    return this.down.size > 0;
  }
}
