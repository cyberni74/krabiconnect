-- CAPTAIN TIDE: anonymous "visitors online" counter.
-- One row per open browser tab (random id, no personal data); rows older than a few
-- minutes are deleted by the API.
CREATE TABLE IF NOT EXISTS tide_presence (
  id text PRIMARY KEY,
  seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tide_presence_seen_at_idx ON tide_presence (seen_at);
