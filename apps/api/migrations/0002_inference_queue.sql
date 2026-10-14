-- Host daemon inference queue (D-033/D-035). The previous inference code wrote to a table
-- that no migration ever created; this migration is the first real definition.
CREATE TABLE IF NOT EXISTS inference_tickets (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  ownerKey TEXT NOT NULL,
  ticketTokenHash TEXT NOT NULL,
  tokenNumber INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  result TEXT,
  errorMessage TEXT,
  deviceId TEXT,
  createdAt TEXT NOT NULL,
  startedAt TEXT,
  completedAt TEXT
);

CREATE INDEX IF NOT EXISTS idx_inference_tickets_status_token ON inference_tickets (status, tokenNumber);
CREATE INDEX IF NOT EXISTS idx_inference_tickets_owner_status ON inference_tickets (ownerKey, status);

CREATE TABLE IF NOT EXISTS daemon_devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tokenHash TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL,
  lastSeenAt TEXT,
  revokedAt TEXT
);
