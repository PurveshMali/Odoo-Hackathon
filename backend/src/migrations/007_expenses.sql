-- Migration 007: expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id                UUID          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id               UUID          NOT NULL REFERENCES users(id)    ON DELETE CASCADE,

  amount                    DECIMAL(14,2) NOT NULL CHECK (amount > 0),
  currency_code             VARCHAR(10)   NOT NULL,
  amount_in_company_currency DECIMAL(14,2),
  exchange_rate             DECIMAL(14,6),

  category                  VARCHAR(100)  NOT NULL,
  description               TEXT          NOT NULL,
  expense_date              DATE          NOT NULL,

  receipt_url               TEXT,
  receipt_hash              TEXT,
  receipt_original_name     VARCHAR(255),

  ocr_data                  JSONB         DEFAULT '{}',
  risk_score                INTEGER       DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_flags                JSONB         DEFAULT '[]',
  is_flagged_for_review     BOOLEAN       DEFAULT false,

  status                    VARCHAR(30)   NOT NULL DEFAULT 'pending'
    CHECK (status IN ('draft','pending','in_review','approved','rejected','cancelled')),
  current_approval_step     INTEGER       DEFAULT 0,
  approval_rule_id          UUID,

  employee_note             TEXT,
  rejection_reason          TEXT,

  metadata                  JSONB         DEFAULT '{}',
  created_at                TIMESTAMPTZ   DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_company_id   ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_employee_id  ON expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status       ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category     ON expenses(category);

CREATE TRIGGER set_updated_at_expenses
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
