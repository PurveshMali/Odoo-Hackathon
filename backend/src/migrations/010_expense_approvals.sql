-- Migration 010: expense_approvals table
CREATE TABLE IF NOT EXISTS expense_approvals (
  id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id  UUID     NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  approver_id UUID     NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  step_order  INTEGER  NOT NULL,

  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','skipped')),

  comment     TEXT,
  decided_at  TIMESTAMPTZ,

  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(expense_id, approver_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_expense_approvals_expense_id  ON expense_approvals(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_approver_id ON expense_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_status      ON expense_approvals(status);

CREATE TRIGGER set_updated_at_expense_approvals
  BEFORE UPDATE ON expense_approvals
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
