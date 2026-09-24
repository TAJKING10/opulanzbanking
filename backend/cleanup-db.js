/**
 * Database Cleanup Script:
 * Keep only the single record for advenaline92@gmail.com (ID: 158) in company_formation.
 * Delete all other test/sample records across all submission tables for a clean slate.
 */
require('dotenv').config();
const { pool } = require('./src/config/db');

async function cleanupDB() {
  try {
    console.log('🚀 Starting Database Cleanup...\n');

    // 1. Clean applications table (keep ID 158)
    const delApps = await pool.query(`
      DELETE FROM applications
      WHERE id != 158
    `);
    console.log(`✅ Deleted ${delApps.rowCount} test records from 'applications' table.`);

    // Check remaining application record
    const remainingApps = await pool.query(`
      SELECT id, type, status, payload->>'contactEmail' as contact_email, created_at
      FROM applications
    `);
    console.log('\n=== REMAINING APPLICATIONS ===');
    console.table(remainingApps.rows);

    // 2. Clean other booking/appointment tables if they exist
    try {
      const delTax = await pool.query(`TRUNCATE TABLE tax_advisory_bookings`);
      console.log(`✅ Cleared 'tax_advisory_bookings' table.`);
    } catch (e) {
      console.log(`ℹ️ tax_advisory_bookings: ${e.message}`);
    }

    try {
      const delInsurance = await pool.query(`TRUNCATE TABLE life_insurance_bookings`);
      console.log(`✅ Cleared 'life_insurance_bookings' table.`);
    } catch (e) {
      console.log(`ℹ️ life_insurance_bookings: ${e.message}`);
    }

    try {
      const delAppointments = await pool.query(`TRUNCATE TABLE appointments`);
      console.log(`✅ Cleared 'appointments' table.`);
    } catch (e) {
      console.log(`ℹ️ appointments: ${e.message}`);
    }

    console.log('\n🎉 Database cleanup complete!');
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
  } finally {
    await pool.end();
  }
}

cleanupDB();
