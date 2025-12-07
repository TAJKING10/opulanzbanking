/**
 * Migration: Add "accounting" type to applications table
 *
 * This migration updates the CHECK constraint on the applications table
 * to allow the "accounting" type in addition to "individual" and "company".
 */

const { pool } = require('../src/config/db');

async function migrate() {
  try {
    console.log('🔄 Starting migration: Add accounting type to applications table...');

    // Drop the old constraint
    await pool.query(`
      ALTER TABLE applications
      DROP CONSTRAINT IF EXISTS applications_type_check;
    `);
    console.log('✅ Dropped old type constraint');

    // Add new constraint with accounting type
    await pool.query(`
      ALTER TABLE applications
      ADD CONSTRAINT applications_type_check
      CHECK (type IN ('individual', 'company', 'accounting'));
    `);
    console.log('✅ Added new type constraint with "accounting" type');

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
