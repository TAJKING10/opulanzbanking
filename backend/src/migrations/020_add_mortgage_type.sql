-- Migration 020: Expand applications type constraint to support mortgage
-- Adds mortgage to the permitted types list in applications_type_check

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_type_check;

ALTER TABLE applications
  ADD CONSTRAINT applications_type_check
  CHECK (type IN ('individual', 'company', 'company_formation', 'accounting', 'insurance', 'mortgage'));
