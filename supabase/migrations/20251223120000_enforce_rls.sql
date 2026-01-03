-- Ensure every table in the public schema has Row Level Security enabled
DO $$
DECLARE
  target RECORD;
BEGIN
  FOR target IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', target.schemaname, target.tablename);
  END LOOP;
END;
$$;
