/**
 * Azure PostgreSQL Connection Test Script
 *
 * This script helps diagnose connection issues with your Azure database.
 * Run: node test-connection.js
 */

const { Client } = require('pg');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}▶${colors.reset} ${msg}`),
};

async function testConnection() {
  console.log('\n' + '='.repeat(60));
  console.log('Azure PostgreSQL Connection Diagnostic Tool');
  console.log('='.repeat(60) + '\n');

  // Step 1: Check environment variables
  log.step('Step 1: Checking environment variables...\n');

  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 5432,
  };

  const checks = [
    { name: 'DB_HOST', value: config.host },
    { name: 'DB_USER', value: config.user },
    { name: 'DB_PASSWORD', value: config.password ? '***' + config.password.slice(-4) : undefined },
    { name: 'DB_NAME', value: config.database },
    { name: 'DB_PORT', value: config.port },
  ];

  let missingVars = false;
  checks.forEach(({ name, value }) => {
    if (value) {
      log.success(`${name}: ${value}`);
    } else {
      log.error(`${name}: MISSING`);
      missingVars = true;
    }
  });

  if (missingVars) {
    console.log('\n');
    log.error('Missing environment variables! Check your .env file.');
    log.info('Copy .env.example to .env and fill in your credentials.');
    process.exit(1);
  }

  // Step 2: Test DNS resolution
  console.log('\n');
  log.step('Step 2: Testing DNS resolution...\n');

  try {
    const dns = require('dns').promises;
    const addresses = await dns.resolve4(config.host);
    log.success(`DNS resolved: ${config.host} → ${addresses.join(', ')}`);
  } catch (err) {
    log.error(`DNS resolution failed: ${err.message}`);
    log.warn('Check your internet connection or hostname spelling.');
    process.exit(1);
  }

  // Step 3: Test basic connection (without SSL first)
  console.log('\n');
  log.step('Step 3: Testing basic connection (without SSL)...\n');

  const basicClient = new Client({
    ...config,
    connectionTimeoutMillis: 5000,
  });

  try {
    await basicClient.connect();
    log.success('Basic connection successful!');
    await basicClient.end();
  } catch (err) {
    log.error(`Basic connection failed: ${err.message}`);

    if (err.message.includes('password')) {
      log.warn('Password authentication failed. Check your DB_PASSWORD in .env');
    } else if (err.message.includes('timeout')) {
      log.warn('Connection timeout. This usually means:');
      console.log('   1. Your IP is not allowed in Azure firewall');
      console.log('   2. Azure server is down or unreachable');
      console.log('\n   → Go to Azure Portal > opulanz-pg > Networking');
      console.log('   → Click "Add current client IP address"');
      console.log('   → Click "Save"\n');
    } else if (err.message.includes('SSL')) {
      log.info('SSL required (expected for Azure). Trying with SSL next...');
    }
  }

  // Step 4: Test with SSL (Azure requirement)
  console.log('\n');
  log.step('Step 4: Testing connection with SSL...\n');

  const sslClient = new Client({
    ...config,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
  });

  try {
    log.info('Connecting with SSL...');
    await sslClient.connect();
    log.success('SSL connection successful!');

    // Step 5: Run test query
    console.log('\n');
    log.step('Step 5: Running test query...\n');

    const result = await sslClient.query('SELECT version(), NOW() as server_time');
    log.success('Query executed successfully!');
    console.log('\nServer Information:');
    console.log('  Version:', result.rows[0].version);
    console.log('  Time:', result.rows[0].server_time);

    // Step 6: Check for users table
    console.log('\n');
    log.step('Step 6: Checking for users table...\n');

    const tableCheck = await sslClient.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users'
    `);

    if (tableCheck.rows.length > 0) {
      log.success('Users table exists!');

      const userCount = await sslClient.query('SELECT COUNT(*) FROM users');
      log.info(`Users in database: ${userCount.rows[0].count}`);
    } else {
      log.warn('Users table does not exist yet.');
      log.info('Run: npm run migrate');
    }

    await sslClient.end();

    // Success summary
    console.log('\n' + '='.repeat(60));
    log.success('All connection tests passed!');
    console.log('='.repeat(60));
    console.log('\nYou can now run:');
    console.log('  npm run migrate  → Create tables');
    console.log('  npm start        → Start the server');
    console.log('');

  } catch (err) {
    log.error(`SSL connection failed: ${err.message}`);
    console.log('\nFull error:', err);

    console.log('\n' + '='.repeat(60));
    log.error('Connection test failed!');
    console.log('='.repeat(60));

    console.log('\nTroubleshooting steps:');
    console.log('1. Check Azure Portal:');
    console.log('   → https://portal.azure.com');
    console.log('   → Navigate to: opulanz-pg');
    console.log('   → Status should be "Available"');
    console.log('');
    console.log('2. Add your IP to firewall:');
    console.log('   → opulanz-pg > Networking');
    console.log('   → Add current client IP address');
    console.log('   → Save');
    console.log('');
    console.log('3. Verify credentials:');
    console.log('   → Check .env file values');
    console.log('   → Compare with Azure Portal settings');
    console.log('');
    console.log('4. Read the setup guide:');
    console.log('   → See AZURE_SETUP.md');
    console.log('');

    process.exit(1);
  }
}

// Run the test
testConnection().catch(err => {
  log.error('Unexpected error:', err);
  process.exit(1);
});
