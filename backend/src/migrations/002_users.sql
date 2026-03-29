-- Migration 002: Create users table
CREATE TABLE IF NOT EXISTS users (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  password_hash     TEXT         NOT NULL,
  role              VARCHAR(30)  NOT NULL DEFAULT 'employee'
                    CHECK (role IN ('admin', 'manager', 'employee')),
  manager_id        UUID         REFERENCES users(id) ON DELETE SET NULL,
  is_active         BOOLEAN      DEFAULT true,
  is_email_verified BOOLEAN      DEFAULT false,
  last_login_at     TIMESTAMPTZ,
  permissions       JSONB        DEFAULT '{}',
  metadata          JSONB        DEFAULT '{}',
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(email, company_id)
);

CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id  ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_manager_id  ON users(manager_id);
