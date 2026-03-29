-- Migration 009: approval_rule_steps table
CREATE TABLE IF NOT EXISTS approval_rule_steps (
  id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id     UUID     NOT NULL REFERENCES approval_rules(id) ON DELETE CASCADE,
  approver_id UUID     NOT NULL REFERENCES users(id)          ON DELETE CASCADE,
  step_order  INTEGER  NOT NULL CHECK (step_order >= 1),
  is_required BOOLEAN  DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(rule_id, step_order),
  UNIQUE(rule_id, approver_id)
);

CREATE INDEX IF NOT EXISTS idx_rule_steps_rule_id ON approval_rule_steps(rule_id);
