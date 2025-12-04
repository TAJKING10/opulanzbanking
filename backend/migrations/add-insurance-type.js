/**
 * Migration: Add "insurance" type to applications table
 *
 * This migration updates the CHECK constraint on the applications table
 * to allow the "insurance" type in addition to "individual", "company", and "accounting".
 */

const { pool } = require('../src/config/db');

async function migrate() {
  try {
    console.log('🔄 Starting migration: Add insurance type to applications table...');

    // Drop the old constraint
    await pool.query(`
      ALTER TABLE applications
      DROP CONSTRAINT IF EXISTS applications_type_check;
    `);
    console.log('✅ Dropped old type constraint');

    // Add new constraint with insurance type
    await pool.query(`
      ALTER TABLE applications
      ADD CONSTRAINT applications_type_check
      CHECK (type IN ('individual', 'company', 'accounting', 'insurance'));
    `);
    console.log('✅ Added new type constraint with "insurance" type');

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
