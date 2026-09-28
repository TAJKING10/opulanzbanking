/**
 * Run All Migrations Script
 *
 * Runs all SQL migration files in order (001_*.sql, 002_*.sql, etc.)
 * Usage: node src/migrations/run-all-migrations.js
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const runAllMigrations = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting database migrations...\n');

    // Get all SQL files in migrations directory
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure correct order (001, 002, 003, etc.)

    console.log(`📁 Found ${files.length} migration files:\n`);
    files.forEach(file => console.log(`   - ${file}`));
    console.log('');

    // Run each migration file
    for (const file of files) {
      console.log(`\n📄 Running migration: ${file}`);
      console.log('━'.repeat(50));

      const sqlFile = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlFile, 'utf8');

      // Remove comments
      const cleanedSql = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
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
          let tag = '$';
          let j = i + 1;
          while (j < cleanedSql.length && cleanedSql[j] !== '$') {
            tag += cleanedSql[j];
            j++;
          }
          if (j < cleanedSql.length) {
            tag += '$';
          }

          if (!inDollarQuote) {
            inDollarQuote = true;
            dollarQuoteTag = tag;
          } else if (tag === dollarQuoteTag) {
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

      console.log(`   ⚙️  Executing ${statements.length} SQL statements...`);

      // Execute each statement
      let successCount = 0;
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          try {
            await client.query(statement);
            successCount++;
          } catch (err) {
            // Ignore "already exists" errors
            if (err.code === '42P07' || err.code === '42710') {
              console.log(`   ⚠️  Skipped (already exists): statement ${i + 1}`);
              successCount++;
            } else {
              throw err;
            }
          }
        }
      }

      console.log(`   ✅ Completed ${successCount}/${statements.length} statements`);
    }

    console.log('\n━'.repeat(50));
    console.log('✅ All migrations completed successfully!\n');

    // Show all created tables
    console.log('📊 Database tables:');
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.table(tables.rows.map(row => ({ table: row.table_name })));

    // Show counts for each table
    console.log('\n📈 Record counts:');
    const counts = [];
    for (const table of tables.rows) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table.table_name)) {
        continue;
      }
      // eslint-disable-next-line no-unsafe-sql -- safe internal schema inspection with regex-validated identifier
      const result = await client.query(`SELECT COUNT(*) FROM "${table.table_name}"`);
      counts.push({
        table: table.table_name,
        count: parseInt(result.rows[0].count)
      });
    }
    console.table(counts);

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

// Run migrations
runAllMigrations();
