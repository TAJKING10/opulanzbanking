-- Investment Inquiries Table
-- Stores SPV investment contact form submissions

CREATE TABLE IF NOT EXISTS investment_inquiries (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    investor_type VARCHAR(50) NOT NULL CHECK (investor_type IN ('institutional', 'professional', 'private')),
    message TEXT,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    notes TEXT,
    assigned_to INTEGER REFERENCES investment_admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_investment_inquiries_status ON investment_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_investment_inquiries_email ON investment_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_investment_inquiries_created_at ON investment_inquiries(created_at DESC);

-- Comments
COMMENT ON TABLE investment_inquiries IS 'SPV investment inquiry submissions from landing page';
COMMENT ON COLUMN investment_inquiries.investor_type IS 'Type of investor: institutional, professional, or private';
COMMENT ON COLUMN investment_inquiries.status IS 'Inquiry status: new, contacted, qualified, converted, closed';
