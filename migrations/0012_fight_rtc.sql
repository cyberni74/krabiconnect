-- KRABI CLASH: WebRTC signaling relay for online 1v1 rooms.
-- Rows are unowned and short-lived (anonymous random peer ids, no personal data);
-- the API deletes stale peers and delivered signals.
CREATE TABLE IF NOT EXISTS fight_peers (
  room text NOT NULL,
  peer text NOT NULL,
  name text NOT NULL DEFAULT '',
  joined_at timestamptz NOT NULL DEFAULT now(),
  seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room, peer)
);
CREATE INDEX IF NOT EXISTS fight_peers_seen_idx ON fight_peers (seen_at);

CREATE TABLE IF NOT EXISTS fight_signals (
  id bigserial PRIMARY KEY,
  room text NOT NULL,
  from_peer text NOT NULL,
  to_peer text NOT NULL,
  kind text NOT NULL,
  payload text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fight_signals_to_idx ON fight_signals (room, to_peer, id);
