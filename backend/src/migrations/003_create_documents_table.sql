/**
 * Migration: Create Documents Table
 *
 * This table stores document metadata (IDs, proofs of address, etc.)
 * linked to applications. File URLs point to Azure Blob Storage or S3.
 */

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    type VARCHAR(100) NOT NULL CHECK (type IN ('passport', 'national_id', 'drivers_license', 'proof_of_address', 'bank_statement', 'utility_bill', 'company_registration', 'articles_of_association', 'shareholder_register', 'other')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    verification_notes TEXT,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_application
        FOREIGN KEY(application_id)
        REFERENCES applications(id)
        ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - comment out if not needed)
INSERT INTO documents (application_id, file_name, file_url, type, status, file_size, mime_type) VALUES
    (1, 'passport_john_doe.pdf', 'https://storage.example.com/docs/passport_john_doe.pdf', 'passport', 'verified', 2048576, 'application/pdf'),
    (1, 'proof_address_john_doe.pdf', 'https://storage.example.com/docs/proof_address_john_doe.pdf', 'proof_of_address', 'pending', 1024000, 'application/pdf'),
    (2, 'company_reg_cert.pdf', 'https://storage.example.com/docs/company_reg_cert.pdf', 'company_registration', 'verified', 3145728, 'application/pdf')
ON CONFLICT DO NOTHING;
