-- Migration: Create Investments Table
-- Description: Tracks investor investments in properties with ownership percentages and returns
-- Created: 2025-02-16

CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,

    -- Relationships
    investor_id INTEGER NOT NULL REFERENCES investment_investors(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES investment_properties(id) ON DELETE CASCADE,

    -- Investment Details
    amount_invested DECIMAL(15, 2) NOT NULL,           -- Amount in EUR
    ownership_percentage DECIMAL(5, 2) NOT NULL,       -- e.g., 12.50 for 12.5%
    number_of_shares INTEGER DEFAULT 1,                -- Number of SPV shares owned

    -- Investment Timeline
    investment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    maturity_date DATE,                                -- When investment matures

    -- Returns & Performance
    expected_annual_return DECIMAL(5, 2),              -- Expected % return per year
    actual_return_to_date DECIMAL(15, 2) DEFAULT 0,    -- Actual returns received so far
    distributions_received DECIMAL(15, 2) DEFAULT 0,   -- Total distributions received

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('pending', 'active', 'matured', 'exited', 'cancelled')),

    -- Exit Details (when investment ends)
    exit_date DATE,
    exit_amount DECIMAL(15, 2),                        -- Final amount received on exit
    exit_type VARCHAR(20)                              -- 'maturity', 'early_exit', 'buyout'
        CHECK (exit_type IN ('maturity', 'early_exit', 'buyout', 'default')),

    -- Notes & Metadata
    notes TEXT,
    created_by INTEGER REFERENCES investment_admins(id),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_investor_property UNIQUE (investor_id, property_id),
    CONSTRAINT valid_percentage CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
    CONSTRAINT valid_amount CHECK (amount_invested > 0)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_property ON investments(property_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_date ON investments(investment_date);

-- Note: Calculations are done in the backend API for flexibility
