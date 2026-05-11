-- Migration 018: Fix otps purpose check constraint to allow pre-register flow
-- The original constraint only allowed 'signup' and 'signin',
-- which blocked the pre-registration OTP flow used during account opening.

ALTER TABLE otps DROP CONSTRAINT IF EXISTS otps_purpose_check;

ALTER TABLE otps ADD CONSTRAINT otps_purpose_check
  CHECK (purpose IN ('signup', 'signin', 'pre-register', 'phone_fallback'));
