-- Migration 001: Create companies table
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS companies (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  country         VARCHAR(100) NOT NULL,
  currency_code   VARCHAR(10)  NOT NULL,
  currency_symbol VARCHAR(10),
  is_active       BOOLEAN      DEFAULT true,
  settings        JSONB        DEFAULT '{}',
  metadata        JSONB        DEFAULT '{}',
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  DEFAULT NOW()
);
