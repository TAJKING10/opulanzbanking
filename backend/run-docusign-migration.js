/**
 * Run DocuSign migration directly
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'opulanz-pg.postgres.database.azure.com',
  user: process.env.DB_USER || 'opulanz_admin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🔄 Running DocuSign migration...\n');

    // Add columns
    await client.query(`
      ALTER TABLE documents
      ADD COLUMN IF NOT EXISTS blob_name VARCHAR(500),
      ADD COLUMN IF NOT EXISTS docusign_envelope_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS docusign_status VARCHAR(50),
      ADD COLUMN IF NOT EXISTS sent_for_signature_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS signed_document_url TEXT;
    `);
    console.log('✅ Added DocuSign columns');

    // Update type constraint
    await client.query(`
      ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_type_check;
    `);
    await client.query(`
      ALTER TABLE documents ADD CONSTRAINT documents_type_check
      CHECK (type IN (
        'passport', 'national_id', 'drivers_license',
        'proof_of_address', 'bank_statement', 'utility_bill',
        'company_registration', 'articles_of_association', 'shareholder_register',
        'regulatory_document', 'mission_letter', 'adequation_declaration',
        'qcc_form', 'der_document', 'other'
      ));
    `);
    console.log('✅ Updated type constraint');

    // Update status constraint
    await client.query(`
      ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check;
    `);
    await client.query(`
      ALTER TABLE documents ADD CONSTRAINT documents_status_check
      CHECK (status IN (
        'pending', 'verified', 'rejected',
        'generated', 'pending_signature', 'signed', 'declined'
      ));
    `);
    console.log('✅ Updated status constraint');

    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_docusign_envelope ON documents(docusign_envelope_id);
    `);
    console.log('✅ Created DocuSign index');

    // Verify columns exist
    const result = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'documents'
      AND column_name IN ('blob_name', 'docusign_envelope_id', 'docusign_status')
      ORDER BY column_name;
    `);

    console.log('\n📋 Verified columns:');
    result.rows.forEach(row => {
      console.log(`   ✅ ${row.column_name}`);
    });

    console.log('\n🎉 Migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
