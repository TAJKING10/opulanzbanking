-- Migration: Create Investment Activity Logs Table
-- Description: Stores activity audit trail for the investment portal
-- Created: 2025-02-12

CREATE TABLE IF NOT EXISTS investment_activity_logs (
    id SERIAL PRIMARY KEY,
    log_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    admin_id INTEGER REFERENCES investment_admins(id),
    admin_name VARCHAR(255),
    investor_id INTEGER REFERENCES investment_investors(id),
    property_id INTEGER REFERENCES investment_properties(id),
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on log_type for filtering
CREATE INDEX IF NOT EXISTS idx_investment_activity_logs_type ON investment_activity_logs(log_type);

-- Create index on admin_id for filtering by admin
CREATE INDEX IF NOT EXISTS idx_investment_activity_logs_admin ON investment_activity_logs(admin_id);

-- Create index on created_at for sorting/filtering by date
CREATE INDEX IF NOT EXISTS idx_investment_activity_logs_created ON investment_activity_logs(created_at DESC);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_investment_activity_logs_admin_type ON investment_activity_logs(admin_id, log_type);
