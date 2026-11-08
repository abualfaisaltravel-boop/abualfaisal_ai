-- Cloudflare D1 private database. Do not place real customer data in GitHub.
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  wa_id TEXT NOT NULL,
  customer_name TEXT NOT NULL DEFAULT 'عميل واتساب',
  service TEXT NOT NULL DEFAULT 'غير محدد',
  status TEXT NOT NULL DEFAULT 'جديد',
  assigned_to TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_inbound_at TEXT NOT NULL,
  last_human_reply_at TEXT,
  automation_paused INTEGER NOT NULL DEFAULT 0 CHECK (automation_paused IN (0,1))
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_request_per_contact
  ON requests(wa_id) WHERE status NOT IN ('مكتمل', 'ملغي');
CREATE INDEX IF NOT EXISTS requests_updated_at ON requests(updated_at DESC);
CREATE TABLE IF NOT EXISTS inbound_messages (
  wa_message_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES requests(id),
  body TEXT NOT NULL DEFAULT '',
  received_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_request_id ON inbound_messages(request_id);
