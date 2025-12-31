/**
 * API Test Script
 *
 * Comprehensive test of all API endpoints using Node.js fetch.
 * Run with: node test-api.js
 */

const BASE_URL = 'http://localhost:5000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.blue}▶${colors.reset} ${msg}`),
};

// Test counter
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    log.success(name);
    passed++;
  } catch (error) {
    log.error(`${name}: ${error.message}`);
    failed++;
  }
}

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok && response.status !== 201) {
    throw new Error(`${response.status}: ${data.error || JSON.stringify(data)}`);
  }

  return data;
}

// Store IDs for dependent tests
const testData = {
  applicationId: null,
  documentId: null,
  companyId: null,
  appointmentId: null,
};

async function runTests() {
  console.log('\n🚀 Starting API Tests...\n');
  console.log('━'.repeat(60));

  // ===== HEALTH CHECK =====
  log.section('Health Check');
  await test('GET /health', async () => {
    const data = await request('GET', '/health');
    if (data.status !== 'ok') throw new Error('Health check failed');
  });

  // ===== APPLICATIONS =====
  log.section('Applications API');

  await test('POST /api/applications (create individual)', async () => {
    const data = await request('POST', '/api/applications', {
      type: 'individual',
      status: 'submitted',
      payload: {
        firstName: 'Toufic',
        lastName: 'Jandah',
        email: 'toufic@advensys-trading.lv',
        dob: '1992-08-13',
        nationality: 'FR',
        address: {
          street: '1 Rue Example',
          city: 'Luxembourg',
          zip: '1009',
          country: 'LU',
        },
      },
    });
    if (!data.success) throw new Error('Failed to create application');
    testData.applicationId = data.data.id;
    log.info(`   Created application ID: ${testData.applicationId}`);
  });

  await test('GET /api/applications (list all)', async () => {
    const data = await request('GET', '/api/applications');
    if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid response');
    log.info(`   Found ${data.data.length} applications`);
  });

  await test('GET /api/applications?status=submitted (filter)', async () => {
    const data = await request('GET', '/api/applications?status=submitted');
    if (!data.success) throw new Error('Invalid response');
    log.info(`   Found ${data.data.length} submitted applications`);
  });

  await test('GET /api/applications/:id (get single)', async () => {
    const data = await request('GET', `/api/applications/${testData.applicationId}`);
    if (!data.success || data.data.id !== testData.applicationId) {
      throw new Error('Failed to get application');
    }
  });

  await test('PATCH /api/applications/:id (update status)', async () => {
    const data = await request('PATCH', `/api/applications/${testData.applicationId}`, {
      status: 'approved',
      narvi_customer_id: 'narvi_cust_test_123',
    });
    if (!data.success || data.data.status !== 'approved') {
      throw new Error('Failed to update application');
    }
  });

  // ===== DOCUMENTS =====
  log.section('Documents API');

  await test('POST /api/applications/:id/documents (upload metadata)', async () => {
    const data = await request('POST', `/api/applications/${testData.applicationId}/documents`, {
      file_name: 'passport_toufic.pdf',
      file_url: 'https://storage.example.com/docs/passport_toufic.pdf',
      type: 'passport',
      file_size: 2048576,
      mime_type: 'application/pdf',
    });
    if (!data.success) throw new Error('Failed to create document');
    testData.documentId = data.data.id;
    log.info(`   Created document ID: ${testData.documentId}`);
  });

  await test('GET /api/applications/:id/documents (list)', async () => {
    const data = await request('GET', `/api/applications/${testData.applicationId}/documents`);
    if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid response');
    log.info(`   Found ${data.data.length} documents for application`);
  });

  await test('GET /api/documents/:id (get single)', async () => {
    const data = await request('GET', `/api/documents/${testData.documentId}`);
    if (!data.success || data.data.id !== testData.documentId) {
      throw new Error('Failed to get document');
    }
  });

  await test('PATCH /api/documents/:id (verify)', async () => {
    const data = await request('PATCH', `/api/documents/${testData.documentId}`, {
      status: 'verified',
      verification_notes: 'Passport verified - valid until 2030',
    });
    if (!data.success || data.data.status !== 'verified') {
      throw new Error('Failed to update document');
    }
  });

  // ===== COMPANIES =====
  log.section('Companies API');

  await test('POST /api/companies (create)', async () => {
    const data = await request('POST', '/api/companies', {
      name: 'Test Company SARL',
      registration_number: 'B999999',
      country: 'LU',
      legal_form: 'SARL',
      industry: 'Technology',
      email: 'contact@testcompany.lu',
      phone: '+352-123-456-789',
      registered_address: {
        street: '1 Avenue Test',
        city: 'Luxembourg',
        zip: '1009',
        country: 'LU',
      },
    });
    if (!data.success) throw new Error('Failed to create company');
    testData.companyId = data.data.id;
    log.info(`   Created company ID: ${testData.companyId}`);
  });

  await test('GET /api/companies (list all)', async () => {
    const data = await request('GET', '/api/companies');
    if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid response');
    log.info(`   Found ${data.data.length} companies`);
  });

  await test('GET /api/companies?country=LU (filter)', async () => {
    const data = await request('GET', '/api/companies?country=LU');
    if (!data.success) throw new Error('Invalid response');
    log.info(`   Found ${data.data.length} companies in Luxembourg`);
  });

  await test('GET /api/companies/:id (get single)', async () => {
    const data = await request('GET', `/api/companies/${testData.companyId}`);
    if (!data.success || data.data.id !== testData.companyId) {
      throw new Error('Failed to get company');
    }
  });

  await test('PATCH /api/companies/:id (update)', async () => {
    const data = await request('PATCH', `/api/companies/${testData.companyId}`, {
      phone: '+352-999-888-777',
      narvi_company_id: 'narvi_comp_test_456',
    });
    if (!data.success) throw new Error('Failed to update company');
  });

  // ===== APPOINTMENTS =====
  log.section('Appointments API');

  await test('POST /api/appointments (create)', async () => {
    const data = await request('POST', '/api/appointments', {
      full_name: 'Toufic Jandah',
      email: 'toufic@advensys-trading.lv',
      phone: '+352-123-456-789',
      calendly_id: 'evt_test_12345',
      meeting_type: 'Account Opening Consultation',
      start_time: '2025-11-05T10:00:00Z',
      end_time: '2025-11-05T10:30:00Z',
      timezone: 'Europe/Luxembourg',
    });
    if (!data.success) throw new Error('Failed to create appointment');
    testData.appointmentId = data.data.id;
    log.info(`   Created appointment ID: ${testData.appointmentId}`);
  });

  await test('GET /api/appointments (list all)', async () => {
    const data = await request('GET', '/api/appointments');
    if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid response');
    log.info(`   Found ${data.data.length} appointments`);
  });

  await test('GET /api/appointments?status=scheduled (filter)', async () => {
    const data = await request('GET', '/api/appointments?status=scheduled');
    if (!data.success) throw new Error('Invalid response');
    log.info(`   Found ${data.data.length} scheduled appointments`);
  });

  await test('GET /api/appointments/:id (get single)', async () => {
    const data = await request('GET', `/api/appointments/${testData.appointmentId}`);
    if (!data.success || data.data.id !== testData.appointmentId) {
      throw new Error('Failed to get appointment');
    }
  });

  await test('PATCH /api/appointments/:id (update)', async () => {
    const data = await request('PATCH', `/api/appointments/${testData.appointmentId}`, {
      status: 'completed',
      notes: 'Successful consultation - client will proceed with account opening',
    });
    if (!data.success || data.data.status !== 'completed') {
      throw new Error('Failed to update appointment');
    }
  });

  // ===== SUMMARY =====
  console.log('\n' + '━'.repeat(60));
  console.log('\n📊 Test Summary:\n');
  console.log(`   ${colors.green}✓ Passed: ${passed}${colors.reset}`);
  console.log(`   ${colors.red}✗ Failed: ${failed}${colors.reset}`);
  console.log(`   Total: ${passed + failed}`);

  if (failed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed!${colors.reset}\n`);
    console.log('✨ Your backend is ready to use!\n');
    console.log('📝 Test data created:');
    console.log(`   Application ID: ${testData.applicationId}`);
    console.log(`   Document ID:    ${testData.documentId}`);
    console.log(`   Company ID:     ${testData.companyId}`);
    console.log(`   Appointment ID: ${testData.appointmentId}\n`);
  } else {
    console.log(`\n${colors.red}❌ Some tests failed. Please review the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
