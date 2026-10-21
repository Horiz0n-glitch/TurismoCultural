DO $$
DECLARE
  sequence_column record;
BEGIN
  FOR sequence_column IN
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_default LIKE 'nextval(%'
  LOOP
    EXECUTE format(
      'SELECT setval(pg_get_serial_sequence(%L, %L), GREATEST(COALESCE(MAX(%I), 1), 1), MAX(%I) IS NOT NULL) FROM %I.%I',
      format('%I.%I', sequence_column.table_schema, sequence_column.table_name),
      sequence_column.column_name,
      sequence_column.column_name,
      sequence_column.column_name,
      sequence_column.table_schema,
      sequence_column.table_name
    );
  END LOOP;
END $$;
