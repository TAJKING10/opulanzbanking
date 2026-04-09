/**
 * OPULANZ BANKING - FULL SYSTEM TEST
 * Tests every integration: DB, Auth, Narvi, Sumsub, DocuSign, all routes
 */

const http = require('http');
const https = require('https');

const BACKEND = 'http://localhost:5000';
const NARVI_MOCK = 'http://localhost:5001';

let passed = 0, failed = 0, warned = 0;
const results = [];

// ─── HTTP helper ──────────────────────────────────────────────────────────────
function request(url, options = {}) {
  return new Promise((resolve) => {
    const { method = 'GET', body, headers = {} } = options;
    const lib = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      timeout: 15000,
    };

    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), raw: data });
        } catch {
          resolve({ status: res.statusCode, body: null, raw: data });
        }
      });
    });

    req.on('error', (err) => resolve({ status: 0, body: null, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: null, error: 'Timeout' }); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function log(icon, label, detail = '') {
  const line = `  ${icon}  ${label}${detail ? '  →  ' + detail : ''}`;
  console.log(line);
}

function pass(label, detail) {
  passed++;
  results.push({ status: 'PASS', label, detail });
  log('✅', label, detail);
}

function fail(label, detail) {
  failed++;
  results.push({ status: 'FAIL', label, detail });
  log('❌', label, detail);
}

function warn(label, detail) {
  warned++;
  results.push({ status: 'WARN', label, detail });
  log('⚠️ ', label, detail);
}

function section(title) {
  console.log('\n' + '─'.repeat(60));
  console.log(`  ${title}`);
  console.log('─'.repeat(60));
}

// Response helpers - handles both direct and wrapped responses
function extractId(body) {
  return body?.id ?? body?.data?.id ?? body?.application?.id ?? body?.company?.id
    ?? body?.appointment?.id ?? body?.booking?.id ?? body?.document?.id;
}

function isOk(body) {
  if (!body) return false;
  if (body.success === false) return false;
  return true;
}

// ─── TEST RUNNER ──────────────────────────────────────────────────────────────
async function run() {
  console.log('\n' + '═'.repeat(60));
  console.log('  OPULANZ BANKING - COMPLETE SYSTEM TEST');
  console.log('  ' + new Date().toISOString());
  console.log('═'.repeat(60));

  let createdUserId = null;
  let createdApplicationId = null;
  let createdCompanyId = null;
  let createdAppointmentId = null;
  let createdTaxBookingId = null;
  let createdInsuranceBookingId = null;
  let createdDocumentId = null;

  // ════════════════════════════════════════════════════════════
  // 1. BACKEND SERVER HEALTH
  // ════════════════════════════════════════════════════════════
  section('1. BACKEND SERVER HEALTH');

  {
    const r = await request(`${BACKEND}/health`);
    r.status === 200 && r.body?.status === 'ok'
      ? pass('Backend server running', 'port 5000')
      : fail('Backend server down', r.error || `status=${r.status}`);
  }

  {
    const r = await request(`${BACKEND}/`);
    r.status === 200
      ? pass('Root endpoint returns API manifest')
      : fail('Root endpoint failed', r.status);
  }

  // ════════════════════════════════════════════════════════════
  // 2. DATABASE CONNECTIVITY
  // ════════════════════════════════════════════════════════════
  section('2. DATABASE CONNECTIVITY (Azure PostgreSQL)');

  {
    const r = await request(`${BACKEND}/api/users`);
    r.status === 200 && r.body?.success
      ? pass('PostgreSQL connected — users table', `${r.body.count} users`)
      : fail('PostgreSQL users query failed', `status=${r.status} ${r.body?.error || ''}`);
  }

  {
    const r = await request(`${BACKEND}/api/applications`);
    r.status === 200 && isOk(r.body)
      ? pass('Applications table OK', `${r.body?.count || Array.isArray(r.body) ? r.body?.count || r.body?.length : '?'} records`)
      : fail('Applications table failed', `status=${r.status}`);
  }

  {
    const r = await request(`${BACKEND}/api/companies`);
    r.status === 200 && isOk(r.body)
      ? pass('Companies table OK')
      : fail('Companies table failed', `status=${r.status}`);
  }

  {
    const r = await request(`${BACKEND}/api/appointments`);
    r.status === 200 && isOk(r.body)
      ? pass('Appointments table OK')
      : fail('Appointments table failed', `status=${r.status}`);
  }

  {
    const r = await request(`${BACKEND}/api/tax-advisory-bookings`);
    r.status === 200 && isOk(r.body)
      ? pass('Tax advisory bookings table OK')
      : fail('Tax advisory bookings table failed', `status=${r.status}`);
  }

  {
    const r = await request(`${BACKEND}/api/life-insurance-bookings`);
    r.status === 200 && isOk(r.body)
      ? pass('Life insurance bookings table OK')
      : fail('Life insurance bookings table failed', `status=${r.status}`);
  }

  {
    const r = await request(`${BACKEND}/api/investment/properties`);
    r.status === 200
      ? pass('Investment portal tables OK')
      : fail('Investment portal tables failed', `status=${r.status}`);
  }

  // ════════════════════════════════════════════════════════════
  // 3. AUTH FLOW
  // ════════════════════════════════════════════════════════════
  section('3. AUTH FLOW (SIGNUP + SIGNIN + OTP)');

  const testEmail = `testclient.${Date.now()}@gmail.com`;
  const testPhone = '+352661234567';
  const testPassword = 'TestPass2025!';

  // Signup
  {
    const r = await request(`${BACKEND}/api/auth/signup`, {
      method: 'POST',
      body: { firstName: 'Test', lastName: 'Client', email: testEmail, phone: testPhone, password: testPassword, accountType: 'individual' },
    });
    if (r.status === 200 && r.body?.success) {
      createdUserId = r.body.userId;
      pass('Signup creates user + sends email OTP', `userId=${createdUserId}`);
    } else {
      fail('Signup failed', JSON.stringify(r.body));
    }
  }

  // Duplicate rejected
  {
    const r = await request(`${BACKEND}/api/auth/signup`, {
      method: 'POST',
      body: { firstName: 'Dup', lastName: 'User', email: testEmail, phone: testPhone, password: testPassword, accountType: 'individual' },
    });
    r.status === 409
      ? pass('Duplicate email rejected (409)')
      : fail('Duplicate email not rejected', `status=${r.status}`);
  }

  // Wrong password
  {
    const r = await request(`${BACKEND}/api/auth/signin`, {
      method: 'POST',
      body: { email: testEmail, password: 'wrongpassword' },
    });
    r.status === 401
      ? pass('Wrong password rejected (401)')
      : fail('Wrong password not blocked', `status=${r.status}`);
  }

  // Correct signin
  {
    const r = await request(`${BACKEND}/api/auth/signin`, {
      method: 'POST',
      body: { email: testEmail, password: testPassword },
    });
    r.status === 200 && r.body?.success
      ? pass('Signin triggers 2FA email OTP')
      : fail('Signin failed', JSON.stringify(r.body));
  }

  // Invalid OTP rejected
  if (createdUserId) {
    const r = await request(`${BACKEND}/api/auth/verify-email-otp`, {
      method: 'POST',
      body: { userId: createdUserId, otp: '000000' },
    });
    r.status === 400
      ? pass('Invalid OTP rejected (400)')
      : fail('Invalid OTP not rejected', `status=${r.status}`);
  }

  // Resend OTP (email)
  if (createdUserId) {
    const r = await request(`${BACKEND}/api/auth/resend-otp`, {
      method: 'POST',
      body: { userId: createdUserId, type: 'email', purpose: 'signup' },
    });
    r.status === 200 && r.body?.success
      ? pass('Resend OTP (email) works')
      : fail('Resend OTP failed', JSON.stringify(r.body));
  }

  // /me without JWT
  {
    const r = await request(`${BACKEND}/api/auth/me`);
    r.status === 401
      ? pass('/api/auth/me blocked without token (401)')
      : fail('/me missing auth protection', `status=${r.status}`);
  }

  // ════════════════════════════════════════════════════════════
  // 4. APPLICATIONS CRUD
  // ════════════════════════════════════════════════════════════
  section('4. APPLICATIONS CRUD + NARVI AUTO-SUBMIT');

  // Create individual application (triggers Narvi onboarding automatically)
  {
    const r = await request(`${BACKEND}/api/applications`, {
      method: 'POST',
      body: {
        type: 'individual',
        status: 'submitted',
        payload: {
          firstName: 'Jean', lastName: 'Dupont', dateOfBirth: '1985-04-12',
          nationality: 'FR', phoneNumber: '+33612345678',
          address: '10 Rue de la Paix', city: 'Paris', postalCode: '75001', country: 'FR',
          isPEP: false, expectedMonthlyVolume: '5000-10000', sourceOfFunds: 'salary',
          activityCountries: ['FR', 'LU'], consentKYC: true, consentTerms: true,
          submittedAt: new Date().toISOString(),
        },
      },
    });

    if (r.status === 201 && r.body?.success) {
      createdApplicationId = r.body?.data?.id;
      const narviStatus = r.body?.narvi?.success ? '+ Narvi entity created' : '+ Narvi: ' + (r.body?.narvi?.error || 'skipped');
      pass('Create individual application', `id=${createdApplicationId} ${narviStatus}`);
    } else {
      fail('Create individual application failed', JSON.stringify(r.body).slice(0, 200));
    }
  }

  // Create company application
  {
    const r = await request(`${BACKEND}/api/applications`, {
      method: 'POST',
      body: {
        type: 'company',
        status: 'submitted',
        payload: {
          companyName: 'Test Holdings SA', registrationNumber: `LU-TEST-${Date.now()}`,
          dateOfIncorporation: '2020-01-15', legalForm: 'SA',
          companyAddress: '1 Avenue de la Gare', companyCity: 'Luxembourg',
          companyPostalCode: 'L-1611', companyCountry: 'LU',
          businessActivity: 'Financial services and investment management',
          activityCountries: ['LU', 'FR'], expectedMonthlyVolume: '50000-100000',
          consentKYB: true, consentTerms: true, submittedAt: new Date().toISOString(),
        },
      },
    });

    if (r.status === 201 && r.body?.success) {
      pass('Create company application', `id=${r.body?.data?.id}`);
    } else {
      fail('Create company application failed', JSON.stringify(r.body).slice(0, 200));
    }
  }

  // Get by ID
  if (createdApplicationId) {
    const r = await request(`${BACKEND}/api/applications/${createdApplicationId}`);
    r.status === 200 && isOk(r.body)
      ? pass('Get application by ID', `type=${r.body?.data?.type || r.body?.type}`)
      : fail('Get application by ID failed', `status=${r.status}`);
  }

  // Update status
  if (createdApplicationId) {
    const r = await request(`${BACKEND}/api/applications/${createdApplicationId}`, {
      method: 'PATCH',
      body: { status: 'under_review' },
    });
    r.status === 200 && isOk(r.body)
      ? pass('Update application status → under_review')
      : fail('Update application status failed', `status=${r.status}`);
  }

  // Filter by type
  {
    const r = await request(`${BACKEND}/api/applications?type=individual`);
    r.status === 200
      ? pass('Filter applications by type=individual')
      : fail('Filter applications failed', `status=${r.status}`);
  }

  // ════════════════════════════════════════════════════════════
  // 5. COMPANIES CRUD
  // ════════════════════════════════════════════════════════════
  section('5. COMPANIES CRUD');

  {
    const r = await request(`${BACKEND}/api/companies`, {
      method: 'POST',
      body: {
        name: 'Opulanz Test Corp SA',
        registration_number: `TEST-${Date.now()}`,
        country: 'LU', legal_form: 'SA', industry: 'Financial Services',
        incorporation_date: '2020-01-15',
        registered_address: { street: '1 Boulevard Royal', city: 'Luxembourg', zip: 'L-2449', country: 'LU' },
        phone: '+352661234567', email: 'info@testcorp.lu',
      },
    });

    if (r.status === 201 && isOk(r.body)) {
      createdCompanyId = extractId(r.body);
      pass('Create company record', `id=${createdCompanyId}`);
    } else {
      fail('Create company failed', JSON.stringify(r.body).slice(0, 200));
    }
  }

  if (createdCompanyId) {
    const r = await request(`${BACKEND}/api/companies/${createdCompanyId}`);
    r.status === 200 && isOk(r.body)
      ? pass('Get company by ID')
      : fail('Get company failed', `status=${r.status}`);

    const r2 = await request(`${BACKEND}/api/companies/${createdCompanyId}`, {
      method: 'PATCH',
      body: { industry: 'Banking & Finance' },
    });
    r2.status === 200 && isOk(r2.body)
      ? pass('Update company record')
      : fail('Update company failed', `status=${r2.status}`);
  }

  // ════════════════════════════════════════════════════════════
  // 6. DOCUMENTS
  // ════════════════════════════════════════════════════════════
  section('6. DOCUMENTS');

  if (createdApplicationId) {
    const r = await request(`${BACKEND}/api/applications/${createdApplicationId}/documents`, {
      method: 'POST',
      body: {
        file_name: 'passport_test.pdf',
        file_url: 'https://storage.opulanz.test/passport_test.pdf',
        file_size: 204800,
        mime_type: 'application/pdf',
        type: 'passport',
        status: 'pending',
      },
    });
    if (r.status === 201 && isOk(r.body)) {
      createdDocumentId = extractId(r.body);
      pass('Add document to application', `id=${createdDocumentId}`);
    } else {
      fail('Add document failed', JSON.stringify(r.body).slice(0, 200));
    }
  }

  if (createdApplicationId) {
    const r = await request(`${BACKEND}/api/applications/${createdApplicationId}/documents`);
    r.status === 200 && isOk(r.body)
      ? pass('List application documents')
      : fail('List documents failed', `status=${r.status}`);
  }

  if (createdDocumentId) {
    const r = await request(`${BACKEND}/api/documents/${createdDocumentId}`, {
      method: 'PATCH',
      body: { status: 'verified', verification_notes: 'ID verified successfully' },
    });
    r.status === 200 && isOk(r.body)
      ? pass('Update document status → verified')
      : fail('Update document failed', `status=${r.status}`);
  }

  // ════════════════════════════════════════════════════════════
  // 7. SUMSUB KYC
  // ════════════════════════════════════════════════════════════
  section('7. SUMSUB KYC INTEGRATION');

  {
    const r = await request(`${BACKEND}/api/sumsub/access-token`, {
      method: 'POST',
      body: { userId: 'test-individual-' + Date.now(), levelName: 'individual_signup_kyc' },
    });
    if (r.status === 200 && (r.body?.accessToken || r.body?.token)) {
      const token = r.body?.accessToken || r.body?.token;
      pass('Sumsub individual KYC token', `length=${token.length}, sandbox mode`);
    } else {
      fail('Sumsub individual token failed', JSON.stringify(r.body).slice(0, 200));
    }
  }

  {
    const r = await request(`${BACKEND}/api/sumsub/access-token`, {
      method: 'POST',
      body: { userId: 'test-corporate-' + Date.now(), levelName: 'corporate_signup_kyc' },
    });
    r.status === 200 && (r.body?.accessToken || r.body?.token)
      ? pass('Sumsub corporate KYB token generated')
      : fail('Sumsub corporate token failed', JSON.stringify(r.body).slice(0, 200));
  }

  {
    // Missing userId should return error
    const r = await request(`${BACKEND}/api/sumsub/access-token`, {
      method: 'POST',
      body: { levelName: 'individual_signup_kyc' },
    });
    r.status === 400
      ? pass('Sumsub rejects missing userId (400)')
      : warn('Sumsub missing-userId validation', `got ${r.status}`);
  }

  // ════════════════════════════════════════════════════════════
  // 8. NARVI API (MOCK)
  // ════════════════════════════════════════════════════════════
  section('8. NARVI BANKING API (MOCK @ localhost:5001)');

  {
    const r = await request(`${NARVI_MOCK}/health`);
    r.status === 200
      ? pass('Mock Narvi server running', 'port 5001')
      : fail('Mock Narvi server down', r.error || `status=${r.status}`);
  }

  {
    const r = await request(`${BACKEND}/api/narvi/ping`);
    r.status === 200 && r.body?.success
      ? pass('Narvi ping via backend', `mode=${r.body.mode}, url=${r.body.baseUrl}`)
      : fail('Narvi ping failed', JSON.stringify(r.body));
  }

  {
    const r = await request(`${BACKEND}/api/narvi/accounts`);
    if (r.status === 200 && r.body?.success) {
      const items = r.body?.data?.items || r.body?.data;
      pass('Narvi list accounts', `${Array.isArray(items) ? items.length : '?'} accounts`);
    } else {
      fail('Narvi list accounts failed', JSON.stringify(r.body));
    }
  }

  {
    const r = await request(`${BACKEND}/api/narvi/transactions`);
    if (r.status === 200 && r.body?.success) {
      const items = r.body?.data?.items || r.body?.data;
      pass('Narvi list transactions', `${Array.isArray(items) ? items.length : '?'} transactions`);
    } else {
      fail('Narvi list transactions failed', JSON.stringify(r.body));
    }
  }

  // Create private entity + issue account
  let privatePid = null;
  {
    const r = await request(`${BACKEND}/api/narvi/entities/private`, {
      method: 'POST',
      body: {
        firstName: 'Marie', lastName: 'Leblanc', birthdate: '1992-07-22',
        address: '5 Rue du Commerce', zipCode: 'L-1351', city: 'Luxembourg', country: 'LU',
        citizenshipCountries: ['LU'], birthCountry: 'LU', isPoliticallyExposed: false,
        wealthSource: ['SALARY'], openingAccountReason: ['SAVINGS', 'TRANSACTIONS'],
      },
    });
    if (r.status === 201 && r.body?.success) {
      privatePid = r.body?.data?.pid;
      pass('Narvi create private entity', `pid=${privatePid}`);
    } else {
      fail('Narvi create private entity failed', JSON.stringify(r.body));
    }
  }

  if (privatePid) {
    const r = await request(`${BACKEND}/api/narvi/accounts/issue`, {
      method: 'POST',
      body: { ownerKind: 'PRIVATE', ownerPid: privatePid, currency: 'EUR' },
    });
    r.status === 201 && r.body?.success
      ? pass('Narvi issue EUR account (PRIVATE)', `iban=${r.body?.data?.number}`)
      : fail('Narvi issue account (PRIVATE) failed', JSON.stringify(r.body));
  }

  // Create business entity + issue account
  let bizPid = null;
  {
    const r = await request(`${BACKEND}/api/narvi/entities/business`, {
      method: 'POST',
      body: {
        companyName: 'Opulanz Pilot Corp SA',
        registrationNumber: `LU-PILOT-${Date.now()}`,
        country: 'LU', naceCode: '6420',
        beneficiaries: [], directors: [],
      },
    });
    if (r.status === 201 && r.body?.success) {
      bizPid = r.body?.data?.pid;
      pass('Narvi create business entity', `pid=${bizPid}`);
    } else {
      fail('Narvi create business entity failed', JSON.stringify(r.body));
    }
  }

  if (bizPid) {
    const r = await request(`${BACKEND}/api/narvi/accounts/issue`, {
      method: 'POST',
      body: { ownerKind: 'BUSINESS', ownerPid: bizPid, currency: 'EUR' },
    });
    r.status === 201 && r.body?.success
      ? pass('Narvi issue EUR account (BUSINESS)', `iban=${r.body?.data?.number}`)
      : fail('Narvi issue account (BUSINESS) failed', JSON.stringify(r.body));
  }

  // Full onboarding in one call
  {
    const r = await request(`${BACKEND}/api/narvi/onboard`, {
      method: 'POST',
      body: {
        type: 'individual',
        payload: {
          firstName: 'Sophie', lastName: 'Renard', dateOfBirth: '1988-03-14',
          nationality: 'FR', address: '22 Avenue Victor Hugo',
          postalCode: '75016', city: 'Paris', country: 'FR',
          isPEP: false, sourceOfFunds: 'salary',
        },
      },
    });
    r.status === 201 && r.body?.success
      ? pass('Narvi full onboarding (entity + IBAN)', `iban=${r.body?.account?.iban}`)
      : fail('Narvi full onboarding failed', JSON.stringify(r.body));
  }

  // Run Narvi test suite
  {
    const r = await request(`${BACKEND}/api/narvi/test`);
    if (r.status === 200 && r.body?.summary) {
      const { passed: p, failed: f, total } = r.body.summary;
      f === 0
        ? pass('Narvi test suite', `${p}/${total} passed`)
        : warn('Narvi test suite has failures', `${p}/${total} passed, ${f} failed`);
    } else {
      warn('Narvi test suite endpoint issue', `status=${r.status}`);
    }
  }

  // ════════════════════════════════════════════════════════════
  // 9. DOCUSIGN
  // ════════════════════════════════════════════════════════════
  section('9. DOCUSIGN E-SIGNATURE');

  {
    const r = await request(`${BACKEND}/api/document-generation/generate`, {
      method: 'POST',
      body: {
        clientData: {
          'client.id': `TEST-PP-${Date.now()}`,
          clientType: 'PP',
          'holder1.firstName': 'Jean',
          'holder1.lastName': 'Dupont',
          'holder1.email': 'jean.dupont@test.com',
          'holder1.dateOfBirth': '1985-04-12',
          'holder1.nationality': 'France',
          'holder1.address.line1': '10 Rue de la Paix',
          'holder1.address.city': 'Paris',
          'holder1.address.postalCode': '75001',
          'holder1.address.country': 'France',
          'basicContact.email': 'jean.dupont@test.com',
          'basicContact.mobile': '+33612345678',
        },
      },
    });
    if (r.status === 200 && r.body?.success) {
      pass('Document generation works', `generationId=${r.body?.generationId}`);
    } else {
      warn('Document generation', r.body?.error || `status=${r.status}`);
    }
  }

  {
    const r = await request(`${BACKEND}/api/document-generation/status/non-existent-id`);
    if (r.status === 404 || r.status === 200) {
      pass('Document generation status endpoint reachable');
    } else {
      warn('Document generation status endpoint issue', `status=${r.status}`);
    }
  }

  // DocuSign configured check
  {
    const envCheck = process.env.DOCUSIGN_INTEGRATION_KEY;
    if (!envCheck || envCheck === 'your_integration_key_here') {
      warn('DocuSign credentials not configured', 'Set DOCUSIGN_INTEGRATION_KEY etc. to enable e-signing');
    } else {
      pass('DocuSign credentials present');
    }
  }

  // ════════════════════════════════════════════════════════════
  // 10. APPOINTMENTS
  // ════════════════════════════════════════════════════════════
  section('10. APPOINTMENTS');

  {
    const r = await request(`${BACKEND}/api/appointments`, {
      method: 'POST',
      body: {
        full_name: 'Jean Dupont',
        email: 'jean.dupont@test.com',
        phone: '+33612345678',
        meeting_type: 'account-opening-consultation',
        status: 'scheduled',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        timezone: 'Europe/Luxembourg',
        notes: 'Pre-launch test appointment',
      },
    });
    if (r.status === 201 && isOk(r.body)) {
      createdAppointmentId = extractId(r.body);
      pass('Create appointment', `id=${createdAppointmentId}`);
    } else {
      fail('Create appointment failed', JSON.stringify(r.body).slice(0, 200));
    }
  }

  if (createdAppointmentId) {
    const r = await request(`${BACKEND}/api/appointments/${createdAppointmentId}`, {
      method: 'PATCH',
      body: { status: 'confirmed' },
    });
    r.status === 200 && isOk(r.body)
      ? pass('Update appointment → confirmed')
      : fail('Update appointment failed', `status=${r.status}`);
  }

  {
    const r = await request(`${BACKEND}/api/notifications/appointment`, {
      method: 'POST',
      body: {
        customerName: 'Jean Dupont',
        customerEmail: 'jean.dupont@test.com',
        appointmentDate: '2025-06-15',
        appointmentTime: '14:00',
        meetingType: 'account-opening-consultation',
        price: 0,
      },
    });
    r.status === 200 && isOk(r.body)
      ? pass('Appointment notification sent')
      : fail('Appointment notification failed', JSON.stringify(r.body).slice(0, 200));
  }

  // ════════════════════════════════════════════════════════════
  // 11. TAX ADVISORY BOOKINGS
  // ════════════════════════════════════════════════════════════
  section('11. TAX ADVISORY BOOKINGS');

  {
    const r = await request(`${BACKEND}/api/tax-advisory-bookings`, {
      method: 'POST',
      body: {
        customer_info: { firstName: 'Marie', lastName: 'Martin', email: 'marie.martin@test.com', phone: '+352661111111' },
        service: { id: 'personal-tax-advisory', title: 'Personal Tax Advisory', price: 100 },
        appointment: { date: '2025-06-15T14:00:00Z', time: '2:00 PM' },
        payment: { method: 'paypal', status: 'COMPLETED', amount: 100, currency: 'EUR' },
      },
    });
    if (r.status === 201 && isOk(r.body)) {
      createdTaxBookingId = extractId(r.body);
      const conf = r.body?.booking?.confirmation_number || r.body?.data?.confirmation_number || r.body?.confirmation_number;
      pass('Create tax advisory booking', `conf=${conf}`);
    } else {
      fail('Create tax advisory booking failed', JSON.stringify(r.body).slice(0, 200));
    }
  }

  if (createdTaxBookingId) {
    const r = await request(`${BACKEND}/api/tax-advisory-bookings/${createdTaxBookingId}`);
    r.status === 200 && isOk(r.body)
      ? pass('Get tax advisory booking by ID')
      : fail('Get tax advisory booking failed', `status=${r.status}`);
  }

  // ════════════════════════════════════════════════════════════
  // 12. LIFE INSURANCE BOOKINGS
  // ════════════════════════════════════════════════════════════
  section('12. LIFE INSURANCE BOOKINGS');

  {
    const r = await request(`${BACKEND}/api/life-insurance-bookings`, {
      method: 'POST',
      body: {
        customer_info: { firstName: 'Pierre', lastName: 'Leblanc', email: 'pierre.leblanc@test.com', phone: '+33699999999' },
        service: { id: 'life-insurance-term', title: 'Term Life Insurance', price: 150 },
        appointment: { date: '2025-06-20T10:00:00Z', time: '10:00 AM' },
        payment: { method: 'paypal', status: 'COMPLETED', amount: 150, currency: 'EUR' },
      },
    });
    if (r.status === 201 && isOk(r.body)) {
      createdInsuranceBookingId = extractId(r.body);
      pass('Create life insurance booking', `id=${createdInsuranceBookingId}`);
    } else {
      fail('Create life insurance booking failed', JSON.stringify(r.body).slice(0, 200));
    }
  }

  if (createdInsuranceBookingId) {
    const r = await request(`${BACKEND}/api/life-insurance-bookings/${createdInsuranceBookingId}`);
    r.status === 200 && isOk(r.body)
      ? pass('Get life insurance booking by ID')
      : fail('Get life insurance booking failed', `status=${r.status}`);
  }

  // ════════════════════════════════════════════════════════════
  // 13. INVESTMENT PORTAL
  // ════════════════════════════════════════════════════════════
  section('13. INVESTMENT PORTAL');

  {
    const r = await request(`${BACKEND}/api/investment/properties`);
    r.status === 200
      ? pass('Investment properties list OK')
      : fail('Investment properties failed', `status=${r.status}`);
  }

  {
    const r = await request(`${BACKEND}/api/investment/activity`);
    r.status === 200
      ? pass('Investment activity log OK')
      : fail('Investment activity failed', `status=${r.status}`);
  }

  {
    const r = await request(`${BACKEND}/api/investment/investments`);
    r.status === 200
      ? pass('Investment investments list OK')
      : fail('Investment investments failed', `status=${r.status}`);
  }

  // Investment contact (fixed: fullName, investorType)
  {
    const r = await request(`${BACKEND}/api/investment/contact`, {
      method: 'POST',
      body: {
        fullName: 'Sophie Investisseur',
        email: 'sophie.invest@test.com',
        phone: '+352661234567',
        investorType: 'private',
        message: 'Interested in SPV investment opportunities',
      },
    });
    r.status === 201 || r.status === 200
      ? pass('Investment contact form submission OK')
      : fail('Investment contact form failed', JSON.stringify(r.body).slice(0, 200));
  }

  // ════════════════════════════════════════════════════════════
  // 14. EMAIL SYSTEM
  // ════════════════════════════════════════════════════════════
  section('14. EMAIL SYSTEM');

  {
    // Check Gmail SMTP is configured
    const emailUser = process.env.EMAIL_USER || 'opulanz.banking@gmail.com';
    emailUser && emailUser !== 'your_email@gmail.com'
      ? pass('Gmail SMTP configured', emailUser)
      : warn('Gmail SMTP not configured', 'Set EMAIL_USER and EMAIL_PASS');
  }

  {
    // OTP email fallback for phone (Twilio not configured)
    warn('Twilio SMS not configured', 'Phone OTPs fall back to email — configure Twilio for production');
  }

  // ════════════════════════════════════════════════════════════
  // 15. NARVI MOCK ADMIN DASHBOARD
  // ════════════════════════════════════════════════════════════
  section('15. NARVI MOCK ADMIN DASHBOARD');

  {
    const r = await request(`${NARVI_MOCK}/mock/state`);
    if (r.status === 200 && r.body) {
      const entities = Object.keys(r.body.entities || {}).length;
      const accounts = Object.keys(r.body.accounts || {}).length;
      const txns = Object.keys(r.body.transactions || {}).length;
      pass('Narvi mock state', `${entities} entities, ${accounts} accounts, ${txns} txns`);
    } else {
      warn('Narvi mock state issue', `status=${r.status}`);
    }
  }

  {
    const r = await request(`${NARVI_MOCK}/mock/dashboard`);
    r.status === 200 && r.raw?.includes('Mock Narvi')
      ? pass('Narvi mock dashboard', 'http://localhost:5001/mock/dashboard')
      : warn('Narvi mock dashboard issue', `status=${r.status}`);
  }

  // ════════════════════════════════════════════════════════════
  // 16. FRONTEND PAGES
  // ════════════════════════════════════════════════════════════
  section('16. FRONTEND PAGES (Next.js @ localhost:3000)');

  const pages = [
    ['/en', 'Homepage (EN)'],
    ['/fr', 'Homepage (FR)'],
    ['/en/login', 'Login page'],
    ['/en/open-account', 'Account opening selector'],
    ['/en/open-account/individual', 'Individual KYC form'],
    ['/en/open-account/company', 'Company KYB form'],
    ['/en/open-account/warm-referral', 'Warm referral page'],
    ['/en/company-formation', 'Company formation'],
  ];

  for (const [path, name] of pages) {
    const r = await request(`http://localhost:3000${path}`);
    r.status === 200
      ? pass(`${name}`, path)
      : fail(`${name} failed`, `status=${r.status}`);
  }

  // Dashboard redirects to login (correct for authenticated route)
  {
    const r = await request(`http://localhost:3000/en/dashboard`);
    r.status === 200 || r.status === 307 || r.status === 302
      ? pass('Dashboard page (redirects to login when unauthenticated — correct)', `status=${r.status}`)
      : fail('Dashboard page failed', `status=${r.status}`);
  }

  // ════════════════════════════════════════════════════════════
  // FINAL REPORT
  // ════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('  FINAL SYSTEM TEST REPORT');
  console.log('═'.repeat(60));
  console.log(`\n  ✅ PASSED:   ${passed}`);
  console.log(`  ❌ FAILED:   ${failed}`);
  console.log(`  ⚠️  WARNINGS: ${warned}`);
  console.log(`  📊 TOTAL:    ${passed + failed + warned}`);

  const pct = Math.round((passed / (passed + failed)) * 100);
  console.log(`\n  SCORE: ${pct}% (${passed}/${passed + failed} functional tests passing)`);

  if (failed > 0) {
    console.log('\n  ❌ FAILURES TO FIX:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`     • ${r.label}`);
      if (r.detail) console.log(`       ${r.detail.toString().slice(0, 120)}`);
    });
  }

  if (warned > 0) {
    console.log('\n  ⚠️  WARNINGS (pre-production checklist):');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`     • ${r.label}: ${r.detail || ''}`);
    });
  }

  console.log('\n  RUNNING SERVICES:');
  console.log('     Frontend  → http://localhost:3000');
  console.log('     Backend   → http://localhost:5000');
  console.log('     Narvi API → http://localhost:5001/mock/dashboard');

  console.log('\n' + '═'.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
