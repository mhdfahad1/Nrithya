-- DO $$
-- DECLARE
--     constraint_name text;
-- BEGIN
--     -- Find the unique constraint name that starts with 'UQ_' for the table 'courses'
--     SELECT conname INTO constraint_name
--     FROM pg_constraint
--     WHERE conrelid = 'courses'::regclass AND contype = 'u' AND conname LIKE 'UQ_%';

--     -- Drop the constraint if it exists
--     IF constraint_name IS NOT NULL THEN
--         EXECUTE 'ALTER TABLE courses DROP CONSTRAINT ' || quote_ident(constraint_name);
--     END IF;
-- END $$;

-- ALTER TABLE students
-- ALTER COLUMN performance TYPE float USING performance::float;

-- ALTER TABLE students
-- ALTER COLUMN assignment TYPE float USING assignment::float;

-- ALTER TABLE students
-- ALTER COLUMN attendance TYPE float USING attendance::float;


