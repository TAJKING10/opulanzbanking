-- Add TOTP secret for Google Authenticator 2FA
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(255);
