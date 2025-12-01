-- LOT 1 - Company Formation Database Tables
-- Run this migration on Azure PostgreSQL

-- 1. Company Formations Table
CREATE TABLE IF NOT EXISTS company_formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Link to users table when auth is implemented
    company_type VARCHAR(50) NOT NULL CHECK (company_type IN ('SARL', 'SARL-S', 'SA', 'SCSp', 'sole_proprietor')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'payment_pending', 'capital_deposit', 'certificate_issued', 'notary_pending', 'registered', 'completed')),

    -- Company Details
    company_name VARCHAR(255),
    alternative_names TEXT[],
    purpose TEXT,
    registered_office JSONB,
    capital_amount DECIMAL(15,2),
    share_split JSONB,
    duration INTEGER, -- in years

    -- People
    managers JSONB, -- Array of manager objects
    ubos JSONB, -- Array of UBO objects (>25% ownership)
    shareholders JSONB,

    -- Business Details
    nace_code VARCHAR(10),
    expected_turnover DECIMAL(15,2),
    countries_of_activity TEXT[],

    -- Service Providers
    notary_contact JSONB,
    domiciliation_provider VARCHAR(255),

    -- Olky Integration
    olky_capital_account_id VARCHAR(255),
    blocking_certificate_url VARCHAR(500),

    -- Luxembourg Registration
    rcs_number VARCHAR(50),
    vat_number VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_company_formations_user_id ON company_formations(user_id);
CREATE INDEX IF NOT EXISTS idx_company_formations_status ON company_formations(status);
CREATE INDEX IF NOT EXISTS idx_company_formations_created_at ON company_formations(created_at);

-- 2. Capital Deposits Table
CREATE TABLE IF NOT EXISTS capital_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID NOT NULL REFERENCES company_formations(id) ON DELETE CASCADE,

    -- Deposit Details
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',

    -- Olky Integration
    olky_account_id VARCHAR(255),
    olky_account_number VARCHAR(50),

    -- Status Tracking
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'account_created', 'deposited', 'blocked', 'certificate_issued', 'unblocked')),

    -- Certificate
    certificate_url VARCHAR(500),
    certificate_issued_at TIMESTAMP,
    notary_email VARCHAR(255),

    -- Unblocking
    unblocked_at TIMESTAMP,
    rcs_registration_date DATE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_capital_deposits_formation_id ON capital_deposits(formation_id);
CREATE INDEX IF NOT EXISTS idx_capital_deposits_status ON capital_deposits(status);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Link to users table
    formation_id UUID REFERENCES company_formations(id) ON DELETE SET NULL,
    appointment_id UUID, -- For tax advisory payments (already exists)

    -- Payment Details
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('setup_fee', 'accounting_package', 'tax_advisory', 'life_insurance', 'investment_advisory', 'mortgage_fee')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),

    -- Provider Details (PayPal/Stripe)
    provider VARCHAR(50) NOT NULL DEFAULT 'paypal' CHECK (provider IN ('paypal', 'stripe', 'bank_transfer')),
    provider_order_id VARCHAR(255),
    provider_payer_id VARCHAR(255),
    provider_payer_email VARCHAR(255),
    provider_transaction_id VARCHAR(255),

    -- Additional Data
    payment_details JSONB, -- Full PayPal/Stripe response
    failure_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_formation_id ON payments(formation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order_id ON payments(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- 4. Formation Documents Table (for file uploads)
CREATE TABLE IF NOT EXISTS formation_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID NOT NULL REFERENCES company_formations(id) ON DELETE CASCADE,

    -- Document Details
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'company_statute',
        'id_front',
        'id_back',
        'proof_of_address',
        'kbis',
        'rcs_extract',
        'lease_agreement',
        'domiciliation_agreement',
        'ubo_declaration',
        'manager_id',
        'shareholder_id',
        'draft_statute'
    )),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL, -- Azure Blob Storage URL
    file_size INTEGER, -- in bytes
    mime_type VARCHAR(100),
    file_hash VARCHAR(64), -- SHA-256 for integrity

    -- Upload Info
    uploaded_by UUID, -- user_id
    uploaded_at TIMESTAMP DEFAULT NOW(),

    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMP,
    verification_notes TEXT
);

-- Index
CREATE INDEX IF NOT EXISTS idx_formation_documents_formation_id ON formation_documents(formation_id);
CREATE INDEX IF NOT EXISTS idx_formation_documents_document_type ON formation_documents(document_type);

-- 5. Formation Audit Logs Table
CREATE TABLE IF NOT EXISTS formation_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID REFERENCES company_formations(id) ON DELETE CASCADE,

    -- Action Details
    action VARCHAR(100) NOT NULL, -- 'formation_created', 'status_changed', 'payment_completed', 'certificate_issued', etc.
    old_value JSONB,
    new_value JSONB,
    details TEXT,

    -- User Context
    performed_by UUID, -- user_id or 'system'
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_formation_audit_logs_formation_id ON formation_audit_logs(formation_id);
CREATE INDEX IF NOT EXISTS idx_formation_audit_logs_created_at ON formation_audit_logs(created_at);

-- 6. Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_company_formations_updated_at ON company_formations;
CREATE TRIGGER update_company_formations_updated_at
    BEFORE UPDATE ON company_formations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_capital_deposits_updated_at ON capital_deposits;
CREATE TRIGGER update_capital_deposits_updated_at
    BEFORE UPDATE ON capital_deposits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Done!
SELECT 'Company Formation tables created successfully!' AS status;
