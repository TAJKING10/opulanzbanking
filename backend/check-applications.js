/**
 * Check company_formation payloads to find advenaline92@gmail.com
 */
require('dotenv').config();
const { pool } = require('./src/config/db');

async function main() {
  try {
    // Check all company_formation records payload
    const rows = await pool.query(`
      SELECT id, type, status, payload
      FROM applications
      WHERE type = 'company_formation'
      ORDER BY id
    `);
    console.log('\n=== COMPANY FORMATION RECORDS ===');
    rows.rows.forEach(r => {
      console.log(`\n--- ID: ${r.id} | Status: ${r.status} ---`);
      console.log(JSON.stringify(r.payload, null, 2));
    });

    // Also search ALL records for advenaline92
    const search = await pool.query(`
      SELECT id, type, status, payload::text
      FROM applications
      WHERE payload::text ILIKE '%advenaline92%'
    `);
    console.log('\n\n=== RECORDS CONTAINING advenaline92 ===');
    console.log(`Found: ${search.rowCount}`);
    search.rows.forEach(r => {
      console.log(`ID: ${r.id}, Type: ${r.type}, Status: ${r.status}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
