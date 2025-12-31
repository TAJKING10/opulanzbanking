-- Migration: Add DocuSign tracking fields to documents table
-- Purpose: Enable electronic signature tracking for KYC documents
-- Date: 2025-12-04

-- Add columns for DocuSign integration
ALTER TABLE documents ADD COLUMN IF NOT EXISTS docusign_envelope_id VARCHAR(255);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS docusign_status VARCHAR(50);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signed_document_url TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sent_for_signature_at TIMESTAMP;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP;

-- Add index for faster lookups by envelope ID
CREATE INDEX IF NOT EXISTS idx_documents_envelope_id ON documents(docusign_envelope_id);

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_documents_docusign_status ON documents(docusign_status);

-- Add comments to describe the new columns
COMMENT ON COLUMN documents.docusign_envelope_id IS 'DocuSign envelope ID for tracking signature status';
COMMENT ON COLUMN documents.docusign_status IS 'Current status of the DocuSign envelope (sent, delivered, completed, declined, voided)';
COMMENT ON COLUMN documents.signed_document_url IS 'Azure Blob Storage URL of the signed document after completion';
COMMENT ON COLUMN documents.sent_for_signature_at IS 'Timestamp when document was sent to DocuSign';
COMMENT ON COLUMN documents.signed_at IS 'Timestamp when document was signed by all parties';
