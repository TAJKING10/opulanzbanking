/**
 * Migration: Add DocuSign columns to documents table
 *
 * This adds columns needed for DocuSign e-signature integration
 */

-- Add DocuSign and Azure Storage columns
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS blob_name VARCHAR(500),
ADD COLUMN IF NOT EXISTS docusign_envelope_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS docusign_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS sent_for_signature_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS signed_document_url TEXT;

-- Update type constraint to include new document types
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_type_check;
ALTER TABLE documents ADD CONSTRAINT documents_type_check
CHECK (type IN (
    'passport', 'national_id', 'drivers_license',
    'proof_of_address', 'bank_statement', 'utility_bill',
    'company_registration', 'articles_of_association', 'shareholder_register',
    'regulatory_document', 'mission_letter', 'adequation_declaration',
    'qcc_form', 'der_document', 'other'
));

-- Update status constraint to include DocuSign statuses
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check;
ALTER TABLE documents ADD CONSTRAINT documents_status_check
CHECK (status IN (
    'pending', 'verified', 'rejected',
    'generated', 'pending_signature', 'signed', 'declined'
));

-- Create index for DocuSign envelope lookups
CREATE INDEX IF NOT EXISTS idx_documents_docusign_envelope ON documents(docusign_envelope_id);
