-- Private Cloudflare D1 tables for the four-minute unanswered-message monitor.
-- These tables hold only sender ID, customer profile name and notification metadata.
-- Do not add real customer data to this GitHub repository.

CREATE TABLE IF NOT EXISTS monitor_chats (
  wa_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL DEFAULT 'عميل واتساب',
  pending_since TEXT,
  last_inbound_at TEXT NOT NULL,
  last_human_reply_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_monitor_pending ON monitor_chats(pending_since);

CREATE TABLE IF NOT EXISTS monitor_alerts (
  id TEXT PRIMARY KEY,
  wa_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  pending_since TEXT NOT NULL,
  alert_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','cancelled','delivered')),
  created_at TEXT NOT NULL,
  delivered_at TEXT,
  UNIQUE (wa_id, pending_since)
);
CREATE INDEX IF NOT EXISTS idx_monitor_alerts_status ON monitor_alerts(status, created_at);
