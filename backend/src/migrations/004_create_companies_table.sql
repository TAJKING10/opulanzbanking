/**
 * Migration: Create Companies Table
 *
 * This table stores company information for business account applications.
 * Links to applications table and can be synced with Narvi later.
 */

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    country VARCHAR(2) NOT NULL,
    legal_form VARCHAR(100),
    industry VARCHAR(100),
    tax_id VARCHAR(100),
    incorporation_date DATE,
    registered_address JSONB,
    business_address JSONB,
    website VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    number_of_employees INTEGER,
    annual_revenue DECIMAL(15, 2),
    narvi_company_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_registration UNIQUE (registration_number, country)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_country ON companies(country);
CREATE INDEX IF NOT EXISTS idx_companies_registration_number ON companies(registration_number);
CREATE INDEX IF NOT EXISTS idx_companies_narvi_company_id ON companies(narvi_company_id);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- Add GIN index for JSONB address queries
CREATE INDEX IF NOT EXISTS idx_companies_registered_address ON companies USING GIN (registered_address);
CREATE INDEX IF NOT EXISTS idx_companies_business_address ON companies USING GIN (business_address);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - comment out if not needed)
INSERT INTO companies (name, registration_number, country, legal_form, industry, email, phone, registered_address) VALUES
    ('Tech Solutions SA', 'B123456', 'LU', 'SA', 'Technology', 'contact@techsolutions.lu', '+352-123-456', '{"street": "1 Avenue de la Liberté", "city": "Luxembourg", "zip": "1009", "country": "LU"}'),
    ('Finance Consulting SARL', 'B789012', 'LU', 'SARL', 'Financial Services', 'info@financeconsult.lu', '+352-789-012', '{"street": "15 Boulevard Royal", "city": "Luxembourg", "zip": "2449", "country": "LU"}'),
    ('Green Energy SAS', '123456789', 'FR', 'SAS', 'Energy', 'contact@greenenergy.fr', '+33-1-23-45-67-89', '{"street": "10 Rue de la Paix", "city": "Paris", "zip": "75002", "country": "FR"}')
ON CONFLICT (registration_number, country) DO NOTHING;
