-- Migration: Create Investment Properties Table
-- Description: Stores investment properties/offerings for the investment portal
-- Created: 2025-02-12

CREATE TABLE IF NOT EXISTS investment_properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    property_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'coming' CHECK (status IN ('open', 'closing', 'closed', 'coming')),
    description TEXT,
    features JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',

    -- Property details
    size VARCHAR(50),
    year_built VARCHAR(10),

    -- Financial details
    total_value DECIMAL(15, 2),
    total_shares INTEGER,
    min_investment DECIMAL(15, 2),
    target_return VARCHAR(20),
    investment_term VARCHAR(50),
    distribution_frequency VARCHAR(50),

    -- Bank transfer details
    bank_name VARCHAR(255),
    bank_iban VARCHAR(50),
    bank_bic VARCHAR(20),
    bank_reference VARCHAR(100),

    -- Documents
    documents JSONB DEFAULT '[]',

    -- Metadata
    created_by INTEGER REFERENCES investment_admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_investment_properties_status ON investment_properties(status);

-- Create index on location for search
CREATE INDEX IF NOT EXISTS idx_investment_properties_location ON investment_properties(location);

-- Create index on property_type for filtering
CREATE INDEX IF NOT EXISTS idx_investment_properties_type ON investment_properties(property_type);
