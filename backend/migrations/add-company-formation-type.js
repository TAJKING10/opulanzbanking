/**
 * Migration: Add "company_formation" type to applications table
 *
 * This migration updates the CHECK constraint on the applications table
 * to allow the "company_formation" type for all 5 company types (SARL, SARL-S, SA, SCSp, SOLE).
 */

const { pool } = require('../src/config/db');

async function migrate() {
  try {
    console.log('🔄 Starting migration: Add company_formation type to applications table...');

    // Drop the old constraint
    await pool.query(`
      ALTER TABLE applications
      DROP CONSTRAINT IF EXISTS applications_type_check;
    `);
    console.log('✅ Dropped old type constraint');

    // Add new constraint with company_formation type
    await pool.query(`
      ALTER TABLE applications
      ADD CONSTRAINT applications_type_check
      CHECK (type IN ('individual', 'company', 'accounting', 'insurance', 'company_formation'));
    `);
    console.log('✅ Added new type constraint with "company_formation" type');

    console.log('🎉 Migration completed successfully!');
    console.log('📝 Now all 5 company formation types (SARL, SARL-S, SA, SCSp, SOLE) can be saved');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
