-- Document Generations Table
-- Stores records of generated onboarding documents and DocuSign envelopes

CREATE TABLE IF NOT EXISTS document_generations (
  id SERIAL PRIMARY KEY,

  -- Client Information
  client_id VARCHAR(255) NOT NULL,
  client_type VARCHAR(10) NOT NULL CHECK (client_type IN ('PP', 'PM')),

  -- Generated Documents (JSONB array of document metadata)
  documents_generated JSONB DEFAULT '[]',

  -- DocuSign Integration
  envelope_id VARCHAR(255),
  signing_url TEXT,
  envelope_expires_at TIMESTAMP,

  -- Signed Documents (JSONB array after completion)
  signed_documents JSONB DEFAULT '[]',

  -- Status Tracking
  status VARCHAR(50) DEFAULT 'generated' CHECK (status IN (
    'generated',          -- Documents created from templates
    'sent_for_signing',   -- Sent to DocuSign
    'completed',          -- Fully signed
    'declined',           -- Client declined to sign
    'voided',             -- Envelope voided
    'expired'             -- Signing URL expired
  )),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_generations_client_id ON document_generations(client_id);
CREATE INDEX IF NOT EXISTS idx_document_generations_envelope_id ON document_generations(envelope_id);
CREATE INDEX IF NOT EXISTS idx_document_generations_status ON document_generations(status);
CREATE INDEX IF NOT EXISTS idx_document_generations_created_at ON document_generations(created_at DESC);

-- Comments
COMMENT ON TABLE document_generations IS 'Tracks automated document generation and DocuSign signing workflow';
COMMENT ON COLUMN document_generations.client_id IS 'Reference to client (matches application or user ID)';
COMMENT ON COLUMN document_generations.client_type IS 'PP (Personne Physique) or PM (Personne Morale)';
COMMENT ON COLUMN document_generations.documents_generated IS 'Array of generated document metadata (paths, filenames, template names)';
COMMENT ON COLUMN document_generations.envelope_id IS 'DocuSign envelope ID';
COMMENT ON COLUMN document_generations.signing_url IS 'Embedded signing URL for client';
COMMENT ON COLUMN document_generations.signed_documents IS 'Array of signed document metadata after completion';
