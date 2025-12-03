// Quick script to update application type constraint
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },
});

async function updateConstraint() {
  try {
    console.log('🔄 Updating applications type constraint...');

    // Drop old constraint
    await pool.query(`
      ALTER TABLE applications
      DROP CONSTRAINT IF EXISTS applications_type_check;
    `);
    console.log('✅ Dropped old constraint');

    // Add new constraint
    await pool.query(`
      ALTER TABLE applications
      ADD CONSTRAINT applications_type_check
      CHECK (type IN ('individual', 'company', 'accounting', 'insurance', 'company_formation'));
    `);
    console.log('✅ Added new constraint with company_formation type');

    console.log('🎉 Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateConstraint();
