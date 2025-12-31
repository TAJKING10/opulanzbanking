/**
 * Migration: Create Users Table
 *
 * This SQL script creates the 'users' table in your Azure PostgreSQL database.
 *
 * To run this migration:
 * 1. Connect to your Azure PostgreSQL database using psql or Azure Data Studio
 * 2. Run this SQL file
 *
 * OR use the migration script:
 * npm run migrate
 */

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - comment out if not needed)
INSERT INTO users (name, email, role) VALUES
    ('John Doe', 'john.doe@opulanz.com', 'admin'),
    ('Jane Smith', 'jane.smith@opulanz.com', 'user'),
    ('Mike Johnson', 'mike.johnson@opulanz.com', 'user')
ON CONFLICT (email) DO NOTHING;

-- Verify table creation
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
