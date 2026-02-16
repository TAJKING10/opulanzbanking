-- Migration: Create Investment Admins Table
-- Description: Stores admin users for the investment portal (primary admin and sub-admins)
-- Created: 2025-02-12

CREATE TABLE IF NOT EXISTS investment_admins (
    id SERIAL PRIMARY KEY,
    access_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('primary', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    permissions JSONB DEFAULT '{}',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on access_code for fast login lookups
CREATE INDEX IF NOT EXISTS idx_investment_admins_access_code ON investment_admins(access_code);

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_investment_admins_email ON investment_admins(email);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_investment_admins_role ON investment_admins(role);

-- Insert primary admin (default access code: OPULANZ-ADMIN-2025)
INSERT INTO investment_admins (access_code, name, email, role, status)
VALUES ('OPULANZ-ADMIN-2025', 'Primary Administrator', 'admin@opulanz.com', 'primary', 'active')
ON CONFLICT (access_code) DO NOTHING;
