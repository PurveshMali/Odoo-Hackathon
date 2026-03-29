-- Migration 011: updated_at trigger for audit_logs (was missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_audit_logs'
  ) THEN
    CREATE TRIGGER set_updated_at_audit_logs
      BEFORE UPDATE ON audit_logs
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END;
$$;
