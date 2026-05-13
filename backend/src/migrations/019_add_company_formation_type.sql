-- Migration 019: Expand applications type constraint
-- Adds company_formation, accounting, and insurance types to support all formation flows

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_type_check;

ALTER TABLE applications
  ADD CONSTRAINT applications_type_check
  CHECK (type IN ('individual', 'company', 'company_formation', 'accounting', 'insurance'));
