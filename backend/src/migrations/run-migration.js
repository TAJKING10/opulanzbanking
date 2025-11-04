/**
 * Database Migration Runner
 *
 * This script runs SQL migrations on your Azure PostgreSQL database.
 * Usage: node src/migrations/run-migration.js
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const runMigration = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting database migration...\n');

    // Read the SQL file
    const sqlFile = path.join(__dirname, '001_create_users_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Remove comments
    const cleanedSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '');

    // Smart split: handle dollar-quoted strings properly
    const statements = [];
    let current = '';
    let inDollarQuote = false;
    let dollarQuoteTag = '';

    for (let i = 0; i < cleanedSql.length; i++) {
      const char = cleanedSql[i];
      current += char;

      // Check for dollar quote start/end
      if (char === '$') {
        // Look ahead to find the complete dollar quote tag
        let tag = '$';
        let j = i + 1;
        while (j < cleanedSql.length && cleanedSql[j] !== '$') {
          tag += cleanedSql[j];
          j++;
        }
        if (j < cleanedSql.length) {
          tag += '$'; // closing $
        }

        if (!inDollarQuote) {
          // Starting a dollar quote
          inDollarQuote = true;
          dollarQuoteTag = tag;
        } else if (tag === dollarQuoteTag) {
          // Ending the dollar quote
          inDollarQuote = false;
          dollarQuoteTag = '';
        }
      }

      // Split on semicolon only if not inside dollar quotes
      if (char === ';' && !inDollarQuote) {
        const stmt = current.trim();
        if (stmt.length > 0) {
          statements.push(stmt);
        }
        current = '';
      }
    }

    // Add any remaining statement
    if (current.trim().length > 0) {
      statements.push(current.trim());
    }

    console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
        await client.query(statement);
      }
    }

    // Verify table exists
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'users'
    `);

    if (result.rows.length > 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log('✅ Users table created');

      // Show table structure
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);

      console.log('\n📋 Table structure:');
      console.table(columns.rows);

      // Show sample data
      const users = await client.query('SELECT id, name, email, role, created_at FROM users LIMIT 5');
      if (users.rows.length > 0) {
        console.log('\n👥 Sample users:');
        console.table(users.rows);
      }
    } else {
      console.log('❌ Migration failed - users table not found');
    }
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

// Run migration
runMigration();
