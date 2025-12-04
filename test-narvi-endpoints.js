/**
 * Test Narvi API Endpoint Discovery
 *
 * This script tests different possible Narvi API endpoints
 */

const https = require('https');
const http = require('http');

const API_KEY = 'EY66Z3MKPW4K26K6';

// Common patterns for banking API sandbox URLs
const possibleEndpoints = [
  'https://api.narvi.io/v1',
  'https://sandbox.narvi.io/v1',
  'https://api-sandbox.narvi.io/v1',
  'https://sandbox-api.narvi.io/v1',
  'https://test.narvi.io/v1',
  'https://api.test.narvi.io/v1',
  'https://staging.narvi.io/v1',
  'https://api.staging.narvi.io/v1',
  'https://api.narvi.com/v1',
  'https://sandbox.narvi.com/v1',
  'https://api-sandbox.narvi.com/v1',
  'https://dev.narvi.io/v1',
  'https://api.dev.narvi.io/v1'
];

async function testEndpoint(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + '/health',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    const protocol = urlObj.protocol === 'https:' ? https : http;

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          accessible: true,
          response: data.substring(0, 200)
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        accessible: false,
        error: error.code || error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        accessible: false,
        error: 'TIMEOUT'
      });
    });

    req.end();
  });
}

async function discoverNarviEndpoint() {
  console.log('🔍 Testing Narvi API Endpoints...\n');
  console.log(`Using API Key: ${API_KEY}\n`);
  console.log('Testing the following endpoints:\n');

  const results = [];

  for (const endpoint of possibleEndpoints) {
    process.stdout.write(`Testing ${endpoint} ... `);
    const result = await testEndpoint(endpoint);
    results.push(result);

    if (result.accessible) {
      console.log(`✅ ACCESSIBLE (Status: ${result.status})`);
    } else {
      console.log(`❌ ${result.error}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(80) + '\n');

  const accessible = results.filter(r => r.accessible);
  const notAccessible = results.filter(r => !r.accessible);

  if (accessible.length > 0) {
    console.log('✅ ACCESSIBLE ENDPOINTS:\n');
    accessible.forEach(r => {
      console.log(`   ${r.url}`);
      console.log(`   Status: ${r.status}`);
      if (r.response) {
        console.log(`   Response: ${r.response}`);
      }
      console.log('');
    });
  } else {
    console.log('❌ NO ACCESSIBLE ENDPOINTS FOUND\n');
  }

  console.log('\nℹ️  POSSIBLE REASONS FOR FAILURES:\n');
  console.log('   1. Narvi API might use a custom domain not in our test list');
  console.log('   2. IP whitelist restriction (only 80.232.250.236 is whitelisted)');
  console.log('   3. API key might need activation or have limited access');
  console.log('   4. Endpoints might require different paths (not /health)');
  console.log('   5. Narvi might have provided documentation with the actual URL\n');

  console.log('\n📧 NEXT STEPS:\n');
  console.log('   1. Check your Narvi dashboard or email for API documentation');
  console.log('   2. Look for "API Base URL" or "Sandbox URL" in Narvi portal');
  console.log('   3. Check if your current IP needs to be added to whitelist');
  console.log('   4. Contact Narvi support for the correct sandbox endpoint');
  console.log('   5. Check if there\'s a developer portal or API docs page\n');

  // Show current IP
  console.log('💡 TIP: Your current public IP can be checked at https://api.ipify.org\n');
}

// Run the discovery
discoverNarviEndpoint().catch(console.error);
