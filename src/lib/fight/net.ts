import { P2PRoom, type PeerInfo } from "@/lib/multiplayer";
import type { CharId, StageId } from "./data";
import type { GameState } from "./engine";

export type NetRole = "host" | "guest";

export type NetMsg =
  | { t: "sel"; char: CharId; ready: boolean; stage?: StageId }
  | { t: "start"; p1: CharId; p2: CharId; stage: StageId }
  | { t: "in"; b: number }
  | { t: "snap"; s: GameState }
  | { t: "rematch" }
  | { t: "toSelect" }
  | { t: "bye" };

export type NetStatus = "connecting" | "waiting" | "connected" | "full" | "lost";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeRoomCode() {
  let s = "";
  for (let i = 0; i < 5; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}

export const normalizeCode = (raw: string) =>
  raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 5);

function randomId() {
  const a = new Uint8Array(9);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * One online 1v1 session on top of the shared P2P room helper. The host runs
 * the simulation; the guest streams its inputs and renders host snapshots.
 */
export class FightNet {
  readonly selfId = randomId();
  private room: P2PRoom;
  private peerId: string | null = null;
  status: NetStatus = "connecting";
  rtt: number | null = null;

  constructor(
    readonly code: string,
    readonly role: NetRole,
    private readonly handlers: {
      onStatus: (s: NetStatus) => void;
      onMessage: (m: NetMsg) => void;
    },
  ) {
    this.room = new P2PRoom({
      room: `kclash-${code}`,
      selfId: this.selfId,
      name: role,
      onConnected: () => this.setStatus(this.peerId ? "connected" : "waiting"),
      onPeersChanged: (peers) => this.onPeers(peers),
      onMessage: (from, data) => {
        if (from !== this.peerId) return;
        this.handlers.onMessage(data as NetMsg);
      },
    });
  }

  join() {
    return this.room.join();
  }

  private setStatus(s: NetStatus) {
    if (this.status === s) return;
    this.status = s;
    this.handlers.onStatus(s);
  }

  private onPeers(peers: PeerInfo[]) {
    // A guest joining a room that already holds two players gets "full".
    if (this.role === "guest" && peers.length >= 2 && !this.peerId) {
      this.setStatus("full");
      return;
    }
    const other = this.peerId ? peers.find((p) => p.id === this.peerId) : peers[0];
    if (!other) {
      if (this.peerId) {
        this.peerId = null;
        this.setStatus("lost");
      } else this.setStatus("waiting");
      return;
    }
    this.peerId = other.id;
    this.rtt = other.rttMs;
    if (other.connectionState === "connected") this.setStatus("connected");
    else if (other.connectionState === "failed" || other.connectionState === "closed") this.setStatus("lost");
    else if (this.status !== "connected") this.setStatus("connecting");
  }

  /** Reliable, ordered. */
  send(m: NetMsg) {
    if (this.peerId) this.room.send(m, this.peerId);
  }

  /** Unreliable, latest-wins (inputs and snapshots). */
  stream(m: NetMsg) {
    this.room.broadcast(m);
  }

  close() {
    try {
      this.send({ t: "bye" });
    } catch {
      // Channel may already be gone.
    }
    this.room.close();
  }
}
