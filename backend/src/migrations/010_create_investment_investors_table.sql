-- Migration: Create Investment Investors Table
-- Description: Stores investor/customer accounts for the investment portal
-- Created: 2025-02-12

CREATE TABLE IF NOT EXISTS investment_investors (
    id SERIAL PRIMARY KEY,
    access_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    investor_type VARCHAR(30) NOT NULL DEFAULT 'private' CHECK (investor_type IN ('institutional', 'professional', 'private')),
    profile_type VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (profile_type IN ('existing', 'new')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    company_name VARCHAR(255),
    address JSONB DEFAULT '{}',
    notes TEXT,
    total_invested DECIMAL(15, 2) DEFAULT 0,
    last_access TIMESTAMP,
    created_by INTEGER REFERENCES investment_admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on access_code for fast login lookups
CREATE INDEX IF NOT EXISTS idx_investment_investors_access_code ON investment_investors(access_code);

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_investment_investors_email ON investment_investors(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_investment_investors_status ON investment_investors(status);

-- Create index on investor_type for filtering
CREATE INDEX IF NOT EXISTS idx_investment_investors_type ON investment_investors(investor_type);
