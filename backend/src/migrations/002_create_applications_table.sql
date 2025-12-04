/**
 * Migration: Create Applications Table
 *
 * This table stores KYC/KYB application submissions from customers.
 * Supports both individual and company account opening flows.
 */

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('individual', 'company')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
    payload JSONB NOT NULL DEFAULT '{}',
    narvi_customer_id VARCHAR(255),
    narvi_company_id VARCHAR(255),
    rejection_reason TEXT,
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(type);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_narvi_customer_id ON applications(narvi_customer_id);
CREATE INDEX IF NOT EXISTS idx_applications_narvi_company_id ON applications(narvi_company_id);

-- Add GIN index for JSONB payload queries
CREATE INDEX IF NOT EXISTS idx_applications_payload ON applications USING GIN (payload);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - comment out if not needed)
INSERT INTO applications (type, status, payload) VALUES
    ('individual', 'submitted', '{"firstName": "John", "lastName": "Doe", "email": "john.doe@example.com", "nationality": "FR", "dob": "1990-01-15"}'),
    ('company', 'under_review', '{"companyName": "Tech Solutions SA", "registrationNumber": "B123456", "country": "LU", "industry": "Technology"}'),
    ('individual', 'approved', '{"firstName": "Jane", "lastName": "Smith", "email": "jane.smith@example.com", "nationality": "LU", "dob": "1985-06-20"}')
ON CONFLICT DO NOTHING;
