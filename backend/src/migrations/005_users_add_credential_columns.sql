-- Migration 005 — Add credential columns to users table

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS password_sent_at     TIMESTAMPTZ DEFAULT NULL;
