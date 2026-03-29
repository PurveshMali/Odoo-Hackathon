-- Migration 008: approval_rules table
CREATE TABLE IF NOT EXISTS approval_rules (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name                  VARCHAR(255)  NOT NULL,
  description           TEXT,

  category              VARCHAR(100),
  min_amount            DECIMAL(14,2),
  max_amount            DECIMAL(14,2),

  is_manager_first      BOOLEAN       DEFAULT false,

  approval_type         VARCHAR(20)   NOT NULL
    CHECK (approval_type IN ('sequential','percentage','specific','hybrid')),

  percentage_threshold  INTEGER
    CHECK (percentage_threshold > 0 AND percentage_threshold <= 100),

  specific_approver_id  UUID          REFERENCES users(id) ON DELETE SET NULL,

  is_active             BOOLEAN       DEFAULT true,
  metadata              JSONB         DEFAULT '{}',
  created_at            TIMESTAMPTZ   DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_rules_company_id ON approval_rules(company_id);

CREATE TRIGGER set_updated_at_approval_rules
  BEFORE UPDATE ON approval_rules
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
