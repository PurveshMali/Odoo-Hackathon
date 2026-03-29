-- Migration 006 — Create credential_send_logs table

CREATE TABLE IF NOT EXISTS credential_send_logs (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_by      UUID         NOT NULL REFERENCES users(id),
  sent_to_email VARCHAR(255) NOT NULL,
  ip_address   VARCHAR(45),
  created_at   TIMESTAMPTZ  DEFAULT NOW()
  -- NOTE: raw password is NEVER stored here — this is audit only
);

CREATE INDEX IF NOT EXISTS idx_credential_logs_user_id ON credential_send_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_credential_logs_sent_by  ON credential_send_logs(sent_by);
