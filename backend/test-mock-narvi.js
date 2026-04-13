/**
 * Test script for Mock Narvi API
 *
 * Runs a full end-to-end test of all mock endpoints.
 *
 * Usage:
 *   1. Start mock server:  npm run mock-narvi
 *   2. In another terminal: node test-mock-narvi.js
 */

const axios = require('axios');

const MOCK_BASE = 'http://localhost:5001';

// Mock headers (signature is bypassed in mock mode)
const headers = {
  'API-KEY-ID': 'test-api-key',
  'API-REQUEST-ID': require('crypto').randomUUID(),
  'API-REQUEST-SIGNATURE': 'test-signature',
  'Content-Type': 'application/json'
};

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    console.log(`  ❌ ${name}: ${msg}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function run() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  Mock Narvi API - End-to-End Tests');
  console.log('══════════════════════════════════════════════\n');

  // ── Health Check ──────────────────────────────────────────
  console.log('── Health Check');
  await test('GET /health responds OK', async () => {
    const { data } = await axios.get(`${MOCK_BASE}/health`);
    assert(data.status === 'ok', 'Expected status ok');
    assert(data.server === 'Mock Narvi API', 'Expected Mock Narvi API');
  });

  // ── Account List ──────────────────────────────────────────
  console.log('\n── REST API: Accounts');
  await test('GET /rest/v1.0/account/list returns pre-seeded accounts', async () => {
    const { data } = await axios.get(`${MOCK_BASE}/rest/v1.0/account/list`, { headers });
    assert(data.items.length >= 5, `Expected at least 5 accounts, got ${data.items.length}`);
    assert(data.pagination.total >= 5, 'Expected pagination.total >= 5');
  });

  await test('GET /rest/v1.0/account/list filters by currency', async () => {
    const { data } = await axios.get(`${MOCK_BASE}/rest/v1.0/account/list?currency=EUR`, { headers });
    assert(data.items.every(a => a.currency === 'EUR'), 'All accounts should be EUR');
  });

  let accountPid;
  await test('GET /rest/v1.0/account/retrieve/:pid returns account', async () => {
    const list = await axios.get(`${MOCK_BASE}/rest/v1.0/account/list`, { headers });
    accountPid = list.data.items[0].pid;
    const { data } = await axios.get(`${MOCK_BASE}/rest/v1.0/account/retrieve/${accountPid}`, { headers });
    assert(data.pid === accountPid, 'PID should match');
    assert(data.number, 'Should have IBAN number');
    assert(data.bic, 'Should have BIC');
  });

  await test('GET /rest/v1.0/account/retrieve/:pid 404 for unknown', async () => {
    try {
      await axios.get(`${MOCK_BASE}/rest/v1.0/account/retrieve/nonexistent`, { headers });
      throw new Error('Should have returned 404');
    } catch (err) {
      assert(err.response?.status === 404, `Expected 404, got ${err.response?.status}`);
    }
  });

  // ── BaaS: Entity Creation ─────────────────────────────────
  console.log('\n── BaaS: Entity Creation');
  let privateEntityPid;
  await test('POST /baas/v1.0/entity/private/create creates individual entity', async () => {
    const { data } = await axios.post(`${MOCK_BASE}/baas/v1.0/entity/private/create`, {
      change_request: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          birthdate: '1990-05-15',
          address: '1 Test Street',
          zip_code: '75001',
          city: 'Paris',
          country: 'FR',
          citizenship_countries: ['FR'],
          is_politically_exposed: false,
          wealth_source: ['SALARY'],
          opening_account_reason: ['SAVINGS']
        }
      }
    }, { headers });
    assert(data.pid, 'Should return a PID');
    assert(data.kind === 'PRIVATE', 'Kind should be PRIVATE');
    assert(data.status === 'PENDING_KYC', 'Status should be PENDING_KYC');
    privateEntityPid = data.pid;
    console.log(`     → Created entity PID: ${privateEntityPid}`);
  });

  let businessEntityPid;
  await test('POST /baas/v1.0/entity/business/create creates company entity', async () => {
    const { data } = await axios.post(`${MOCK_BASE}/baas/v1.0/entity/business/create`, {
      change_request: {
        data: {
          details: {
            name: 'Test Corp S.A.',
            registration_number: 'LU20250001',
            country: 'LU'
          },
          activities: { nace: '6420' },
          beneficiaries: [],
          directors: []
        }
      }
    }, { headers });
    assert(data.pid, 'Should return a PID');
    assert(data.kind === 'BUSINESS', 'Kind should be BUSINESS');
    businessEntityPid = data.pid;
    console.log(`     → Created entity PID: ${businessEntityPid}`);
  });

  // ── BaaS: Account Issuance ────────────────────────────────
  console.log('\n── BaaS: Account Issuance');
  let newAccountPid, newAccountIBAN;
  await test('POST /baas/v1.0/account/create issues EUR account for private entity', async () => {
    const { data } = await axios.post(`${MOCK_BASE}/baas/v1.0/account/create`, {
      currency: 'EUR',
      owner_kind: 'PRIVATE',
      owner_pid: privateEntityPid
    }, { headers });
    assert(data.pid, 'Should return a PID');
    assert(data.number, 'Should return an IBAN');
    assert(data.bic === 'NARVLULL', 'BIC should be NARVLULL');
    assert(data.currency === 'EUR', 'Currency should be EUR');
    assert(data.status === 'ACTIVE', 'Status should be ACTIVE');
    newAccountPid = data.pid;
    newAccountIBAN = data.number;
    console.log(`     → Issued account: ${newAccountIBAN} (${newAccountPid})`);
  });

  await test('POST /baas/v1.0/account/create issues EUR account for business entity', async () => {
    const { data } = await axios.post(`${MOCK_BASE}/baas/v1.0/account/create`, {
      currency: 'EUR',
      owner_kind: 'BUSINESS',
      owner_pid: businessEntityPid
    }, { headers });
    assert(data.pid, 'Should return a PID');
    assert(data.currency === 'EUR', 'Currency should be EUR');
  });

  await test('POST /baas/v1.0/account/create returns 404 for unknown entity', async () => {
    try {
      await axios.post(`${MOCK_BASE}/baas/v1.0/account/create`, {
        currency: 'EUR',
        owner_kind: 'PRIVATE',
        owner_pid: 'nonexistent_pid'
      }, { headers });
      throw new Error('Should have returned 404');
    } catch (err) {
      assert(err.response?.status === 404, `Expected 404, got ${err.response?.status}`);
    }
  });

  // ── Transactions ──────────────────────────────────────────
  console.log('\n── REST API: Transactions');
  await test('GET /rest/v1.0/transactions/list returns pre-seeded transactions', async () => {
    const { data } = await axios.get(`${MOCK_BASE}/rest/v1.0/transactions/list`, { headers });
    assert(data.items.length >= 10, `Expected at least 10 transactions, got ${data.items.length}`);
  });

  await test('GET /rest/v1.0/transactions/list filters by account_pid', async () => {
    const { data } = await axios.get(
      `${MOCK_BASE}/rest/v1.0/transactions/list?account_pid=acc_demo_jean_eur`,
      { headers }
    );
    assert(data.items.every(t => t.account_pid === 'acc_demo_jean_eur'), 'All should be for Jean EUR account');
  });

  let newTxnPid;
  await test('POST /rest/v1.0/transactions/create creates a debit transaction', async () => {
    const { data } = await axios.post(`${MOCK_BASE}/rest/v1.0/transactions/create`, {
      account_pid: 'acc_demo_jean_eur',
      type: 'DEBIT',
      amount: 150.00,
      currency: 'EUR',
      counterparty_name: 'Netflix Luxembourg',
      counterparty_iban: 'LU00 0000 0000 0000 0001',
      reference: 'Netflix subscription'
    }, { headers });
    assert(data.pid, 'Should return a PID');
    assert(data.vop, 'Should return VOP info');
    assert(data.vop.match_type === 'MTCH', 'Default VOP should be MTCH');
    newTxnPid = data.pid;
    console.log(`     → Created transaction: ${newTxnPid} | VOP: ${data.vop.match_type}`);
  });

  await test('GET /rest/v1.0/transactions/retrieve/:pid returns transaction', async () => {
    const { data } = await axios.get(
      `${MOCK_BASE}/rest/v1.0/transactions/retrieve/${newTxnPid}`,
      { headers }
    );
    assert(data.pid === newTxnPid, 'PID should match');
    assert(data.amount === 150, 'Amount should be 150');
  });

  await test('PATCH /rest/v1.0/transactions/update/:pid updates status', async () => {
    const { data } = await axios.patch(
      `${MOCK_BASE}/rest/v1.0/transactions/update/${newTxnPid}`,
      { status: 'COMPLETED' },
      { headers }
    );
    assert(data.status === 'COMPLETED', 'Status should be COMPLETED');
    assert(data.completed_at, 'Should have completed_at timestamp');
  });

  // ── VOP Scenarios ─────────────────────────────────────────
  console.log('\n── VOP Scenarios');

  await test('VOP close_match scenario returns CMTC', async () => {
    await axios.post(`${MOCK_BASE}/mock/scenario/vop_close_match`);
    const { data } = await axios.post(`${MOCK_BASE}/rest/v1.0/transactions/create`, {
      account_pid: 'acc_demo_jean_eur',
      type: 'DEBIT',
      amount: 50,
      currency: 'EUR',
      counterparty_name: 'Test CMTC',
      counterparty_iban: 'LU00 0000 0000 0000 0002',
      reference: 'CMTC test'
    }, { headers });
    assert(data.vop.match_type === 'CMTC', `Expected CMTC, got ${data.vop.match_type}`);
    // Accept VOP
    const accepted = await axios.patch(
      `${MOCK_BASE}/rest/v1.0/transactions/update/${data.pid}`,
      { accept_vop: true },
      { headers }
    );
    assert(accepted.data.status === 'PROCESSING', 'After VOP accept, status should be PROCESSING');
    // Reset scenario
    await axios.post(`${MOCK_BASE}/mock/scenario/default`);
  });

  await test('VOP no_match scenario returns NMTC', async () => {
    await axios.post(`${MOCK_BASE}/mock/scenario/vop_no_match`);
    const { data } = await axios.post(`${MOCK_BASE}/rest/v1.0/transactions/create`, {
      account_pid: 'acc_demo_jean_eur',
      type: 'DEBIT',
      amount: 50,
      currency: 'EUR',
      counterparty_name: 'Wrong Name',
      counterparty_iban: 'LU00 0000 0000 0000 0003',
      reference: 'NMTC test'
    }, { headers });
    assert(data.vop.match_type === 'NMTC', `Expected NMTC, got ${data.vop.match_type}`);
    await axios.post(`${MOCK_BASE}/mock/scenario/default`);
  });

  // ── Admin Endpoints ───────────────────────────────────────
  console.log('\n── Admin Endpoints');

  await test('GET /mock/state returns full store', async () => {
    const { data } = await axios.get(`${MOCK_BASE}/mock/state`);
    assert(data.entities, 'Should have entities');
    assert(data.accounts, 'Should have accounts');
    assert(data.transactions, 'Should have transactions');
    assert(data.counts, 'Should have counts');
  });

  await test('POST /mock/reset resets store to seed data', async () => {
    const { data } = await axios.post(`${MOCK_BASE}/mock/reset`);
    assert(data.success, 'Reset should succeed');
    const state = await axios.get(`${MOCK_BASE}/mock/state`);
    assert(state.data.counts.entities === 3, `Expected 3 seed entities, got ${state.data.counts.entities}`);
    assert(state.data.counts.accounts === 5, `Expected 5 seed accounts, got ${state.data.counts.accounts}`);
    assert(state.data.counts.transactions === 10, `Expected 10 seed transactions, got ${state.data.counts.transactions}`);
  });

  // ── Auth Validation ───────────────────────────────────────
  console.log('\n── Auth Validation');
  await test('Request without headers returns 401', async () => {
    try {
      await axios.get(`${MOCK_BASE}/rest/v1.0/account/list`);
      throw new Error('Should have returned 401');
    } catch (err) {
      assert(err.response?.status === 401, `Expected 401, got ${err.response?.status}`);
    }
  });

  // ── Full Onboarding Flow ──────────────────────────────────
  console.log('\n── Full Onboarding Flow (entity → account)');
  await test('Complete individual onboarding: create entity → issue account → transact', async () => {
    // 1. Create private entity
    const entityRes = await axios.post(`${MOCK_BASE}/baas/v1.0/entity/private/create`, {
      change_request: {
        data: {
          first_name: 'Sophie',
          last_name: 'Laurent',
          birthdate: '1988-11-20',
          address: '10 Rue du Luxembourg',
          zip_code: '1009',
          city: 'Luxembourg',
          country: 'LU',
          citizenship_countries: ['LU'],
          is_politically_exposed: false,
          wealth_source: ['SALARY'],
          opening_account_reason: ['SAVINGS', 'TRANSACTIONS']
        }
      }
    }, { headers });
    const entityPid = entityRes.data.pid;
    assert(entityPid, 'Entity PID required');

    // 2. Issue EUR account
    const accountRes = await axios.post(`${MOCK_BASE}/baas/v1.0/account/create`, {
      currency: 'EUR',
      owner_kind: 'PRIVATE',
      owner_pid: entityPid
    }, { headers });
    const accountPidNew = accountRes.data.pid;
    const iban = accountRes.data.number;
    assert(accountPidNew, 'Account PID required');
    assert(iban.startsWith('LU'), 'IBAN should start with LU');

    // 3. Create a transaction on the new account
    const txnRes = await axios.post(`${MOCK_BASE}/rest/v1.0/transactions/create`, {
      account_pid: accountPidNew,
      type: 'CREDIT',
      amount: 1000.00,
      currency: 'EUR',
      counterparty_name: 'Initial Deposit',
      reference: 'Welcome transfer'
    }, { headers });
    assert(txnRes.data.pid, 'Transaction PID required');
    assert(txnRes.data.amount === 1000, 'Amount should be 1000');

    console.log(`     → Entity: ${entityPid}`);
    console.log(`     → IBAN:   ${iban}`);
    console.log(`     → Txn:    ${txnRes.data.pid}`);
  });

  // ── Summary ───────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n══════════════════════════════════════════════');
  console.log(`  Results: ${passed}/${total} passed  ${failed > 0 ? `(${failed} failed)` : '✅ All passed!'}`);
  console.log('══════════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('\n❌ Test runner error:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('   Is the mock server running? Start it with: npm run mock-narvi');
  }
  process.exit(1);
});
