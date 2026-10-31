CREATE TABLE IF NOT EXISTS inference_tickets (
  tokenNumber INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  clientTokenHash TEXT NOT NULL,
  clientId TEXT NOT NULL,
  prompt TEXT NOT NULL,
  screenAst TEXT NOT NULL,
  designDna TEXT,
  status TEXT NOT NULL CHECK(status IN ('queued', 'processing', 'completed', 'failed')),
  resultCommand TEXT,
  errorMessage TEXT,
  createdAt TEXT NOT NULL,
  createdAtMs INTEGER NOT NULL,
  startedAt TEXT,
  completedAt TEXT,
  expiresAt INTEGER NOT NULL,
  leaseId TEXT,
  leaseUntil INTEGER
);
CREATE INDEX IF NOT EXISTS inference_queue_status ON inference_tickets(status, tokenNumber);
CREATE INDEX IF NOT EXISTS inference_client_rate ON inference_tickets(clientId, createdAtMs);
CREATE TABLE IF NOT EXISTS host_workers (
  id TEXT PRIMARY KEY,
  deviceName TEXT NOT NULL,
  lastHeartbeat INTEGER NOT NULL,
  status TEXT NOT NULL
);
