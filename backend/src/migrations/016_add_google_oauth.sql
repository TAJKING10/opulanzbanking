-- Add google_id column to users table for Google OAuth
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Allow null password_hash for Google OAuth users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
