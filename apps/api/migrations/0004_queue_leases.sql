-- Fair queue + crash recovery (Phase 27): claimed tickets carry a lease; expired leases are
-- re-queued (up to 3 attempts) so a daemon crash or restart never loses a ticket.
ALTER TABLE inference_tickets ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inference_tickets ADD COLUMN leaseExpiresAt TEXT;
CREATE INDEX IF NOT EXISTS idx_inference_tickets_lease ON inference_tickets (status, leaseExpiresAt);
CREATE INDEX IF NOT EXISTS idx_inference_tickets_owner_started ON inference_tickets (ownerKey, startedAt);
