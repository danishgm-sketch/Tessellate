-- Email/password accounts and administration (D-037).
ALTER TABLE user ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE user ADD COLUMN banned INTEGER DEFAULT 0;
ALTER TABLE user ADD COLUMN banReason TEXT;
ALTER TABLE user ADD COLUMN banExpires INTEGER;
ALTER TABLE session ADD COLUMN impersonatedBy TEXT;

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  actorUserId TEXT NOT NULL,
  action TEXT NOT NULL,
  targetType TEXT NOT NULL,
  targetId TEXT,
  detail TEXT,
  createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log (createdAt);
