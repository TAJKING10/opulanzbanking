/**
 * PostgreSQL Database Configuration for Azure
 *
 * This module sets up a connection pool to Azure PostgreSQL with SSL enabled.
 * The connection pool manages multiple database connections efficiently.
 */

const { Pool } = require('pg');
require('dotenv').config();

// Azure PostgreSQL requires SSL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'opulanz-pg.postgres.database.azure.com',
  user: process.env.DB_USER || 'opulanz_admin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false, // Azure requires SSL but uses a certificate
  },
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client can remain idle before being closed
  connectionTimeoutMillis: 10000, // How long to wait when connecting (10 seconds)
  statement_timeout: 30000, // Query timeout (30 seconds)
  query_timeout: 30000, // Alternative query timeout
});

// Event listeners for pool
pool.on('connect', () => {
  console.log('✅ Database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Helper function to test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection test successful');
    console.log('Server time:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    return false;
  }
};

// Helper function to run queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};
