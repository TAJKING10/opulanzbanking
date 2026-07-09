/**
 * Narvi API Routes
 *
 * Exposes all Narvi banking operations through the backend API.
 * Requires mock server (port 5001) or real Narvi credentials.
 */

const express = require('express');
const router = express.Router();
const narvi = require('../services/narvi');

// ── Health / Connection Test ────────────────────────────────────────────────

// GET /api/narvi/ping
// Quick check that the Narvi service (mock or real) is reachable
router.get('/ping', async (req, res) => {
  try {
    const result = await narvi.listAccounts();
    if (result.success) {
      res.json({
        success: true,
        message: 'Narvi API is reachable',
        mode: process.env.USE_MOCK_NARVI === 'true' ? 'MOCK' : 'PRODUCTION',
        baseUrl: process.env.NARVI_BASE_URL,
        accountCount: Array.isArray(result.data) ? result.data.length : 'N/A',
      });
    } else {
      res.status(502).json({
        success: false,
        message: 'Narvi API not reachable',
        error: result.error,
        mode: process.env.USE_MOCK_NARVI === 'true' ? 'MOCK' : 'PRODUCTION',
        baseUrl: process.env.NARVI_BASE_URL,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Accounts ────────────────────────────────────────────────────────────────

// GET /api/narvi/accounts
router.get('/accounts', async (req, res) => {
  const result = await narvi.listAccounts();
  res.status(result.success ? 200 : 502).json(result);
});

// GET /api/narvi/accounts/:pid
router.get('/accounts/:pid', async (req, res) => {
  const result = await narvi.retrieveAccount(req.params.pid);
  res.status(result.success ? 200 : 502).json(result);
});

// ── Transactions ────────────────────────────────────────────────────────────

// GET /api/narvi/transactions
router.get('/transactions', async (req, res) => {
  const result = await narvi.listTransactions(req.query);
  res.status(result.success ? 200 : 502).json(result);
});

// GET /api/narvi/transactions/:pid
router.get('/transactions/:pid', async (req, res) => {
  const result = await narvi.retrieveTransaction(req.params.pid);
  res.status(result.success ? 200 : 502).json(result);
});

// POST /api/narvi/transactions
// Accepts both snake_case (narvi native) and camelCase (frontend) field names
router.post('/transactions', async (req, res) => {
  const body = req.body;
  const normalized = {
    account_pid: body.account_pid || body.accountPid || 'acc_demo_jean_eur',
    counterparty_iban: body.counterparty_iban || body.counterpartIban || body.recipient_iban || '',
    counterparty_name: body.counterparty_name || body.counterpartName || body.recipient_name || 'Recipient',
    amount: body.amount,
    currency: body.currency || 'EUR',
    reference: body.reference || 'Transfer',
    type: body.type || 'DEBIT',
  };
  const result = await narvi.createTransactionWithVop(normalized, {
    autoAcceptCloseMatch: body.autoAcceptCloseMatch !== undefined ? body.autoAcceptCloseMatch : true,
  });
  res.status(result.success ? 201 : 502).json(result);
});

// PATCH /api/narvi/transactions/:pid/vop
// Body: { accept: true|false }
router.patch('/transactions/:pid/vop', async (req, res) => {
  const { accept = true } = req.body;
  const result = await narvi.acceptVop(req.params.pid, accept);
  res.status(result.success ? 200 : 502).json(result);
});

// ── Entity / Customer Onboarding ────────────────────────────────────────────

// POST /api/narvi/entities/private
// Body: { firstName, lastName, birthdate, address, zipCode, city, country, ... }
router.post('/entities/private', async (req, res) => {
  const result = await narvi.createPrivateEntity(req.body);
  res.status(result.success ? 201 : 502).json(result);
});

// POST /api/narvi/entities/business
// Body: { companyName, registrationNumber, country, naceCode, beneficiaries, directors }
router.post('/entities/business', async (req, res) => {
  const result = await narvi.createBusinessEntity(req.body);
  res.status(result.success ? 201 : 502).json(result);
});

// POST /api/narvi/accounts/issue
// Body: { ownerKind: 'PRIVATE'|'BUSINESS', ownerPid, currency }
router.post('/accounts/issue', async (req, res) => {
  const { ownerKind, ownerPid, currency = 'EUR' } = req.body;
  if (!ownerKind || !ownerPid) {
    return res.status(400).json({ success: false, error: 'ownerKind and ownerPid are required' });
  }
  const result = await narvi.issueAccount(ownerKind, ownerPid, currency);
  res.status(result.success ? 201 : 502).json(result);
});

// ── Full Onboarding Flow ────────────────────────────────────────────────────

// POST /api/narvi/onboard
// High-level: create entity + issue account in one call
// Body: applicationData from your DB ({ type: 'individual'|'company', payload: { ... } })
router.post('/onboard', async (req, res) => {
  const result = await narvi.createNarviAccount(req.body);
  res.status(result.success ? 201 : 502).json(result);
});

// ── Full Test Suite ─────────────────────────────────────────────────────────

// GET /api/narvi/test
// Runs all Narvi API tests and returns a summary report
router.get('/test', async (req, res) => {
  const results = [];
  const pass = (name, data) => results.push({ test: name, status: 'PASS', data });
  const fail = (name, error) => results.push({ test: name, status: 'FAIL', error });

  // 1. List accounts
  try {
    const r = await narvi.listAccounts();
    r.success ? pass('List Accounts', r.data) : fail('List Accounts', r.error);

    // 2. Retrieve first account
    if (r.success && Array.isArray(r.data) && r.data.length > 0) {
      const pid = r.data[0].pid;
      const r2 = await narvi.retrieveAccount(pid);
      r2.success ? pass('Retrieve Account', r2.data) : fail('Retrieve Account', r2.error);
    } else {
      results.push({ test: 'Retrieve Account', status: 'SKIP', reason: 'No accounts to retrieve' });
    }
  } catch (e) {
    fail('List Accounts', e.message);
  }

  // 3. List transactions
  try {
    const r = await narvi.listTransactions();
    r.success ? pass('List Transactions', r.data) : fail('List Transactions', r.error);
  } catch (e) {
    fail('List Transactions', e.message);
  }

  // 4. Create private entity
  try {
    const r = await narvi.createPrivateEntity({
      firstName: 'Test',
      lastName: 'User',
      birthdate: '1990-01-15',
      address: '1 Rue de la Paix',
      zipCode: '75001',
      city: 'Paris',
      country: 'FR',
      citizenshipCountries: ['FR'],
      birthCountry: 'FR',
      isPoliticallyExposed: false,
      wealthSource: ['SALARY'],
      openingAccountReason: ['SAVINGS'],
    });
    r.success ? pass('Create Private Entity', r.data) : fail('Create Private Entity', r.error);

    // 5. Issue account for entity
    if (r.success && r.data?.pid) {
      const r2 = await narvi.issueAccount('PRIVATE', r.data.pid, 'EUR');
      r2.success ? pass('Issue EUR Account (Private)', r2.data) : fail('Issue EUR Account (Private)', r2.error);
    }
  } catch (e) {
    fail('Create Private Entity', e.message);
  }

  // 6. Create business entity
  try {
    const r = await narvi.createBusinessEntity({
      companyName: 'Test Corp SAS',
      registrationNumber: 'FR-TEST-' + Date.now(),
      country: 'FR',
      naceCode: '6201',
      beneficiaries: [],
      directors: [],
    });
    r.success ? pass('Create Business Entity', r.data) : fail('Create Business Entity', r.error);

    // 7. Issue account for business
    if (r.success && r.data?.pid) {
      const r2 = await narvi.issueAccount('BUSINESS', r.data.pid, 'EUR');
      r2.success ? pass('Issue EUR Account (Business)', r2.data) : fail('Issue EUR Account (Business)', r2.error);
    }
  } catch (e) {
    fail('Create Business Entity', e.message);
  }

  // 8. Create a test transaction
  try {
    const accountsR = await narvi.listAccounts();
    if (accountsR.success && Array.isArray(accountsR.data) && accountsR.data.length > 0) {
      const sourceAccount = accountsR.data[0].pid;
      const r = await narvi.createTransaction({
        source_account_pid: sourceAccount,
        amount: 100,
        currency: 'EUR',
        recipient_iban: 'LU280030000000010000',
        recipient_name: 'Test Recipient',
        reference: 'API Test Payment',
      });
      r.success ? pass('Create Transaction', r.data) : fail('Create Transaction', r.error);
    } else {
      results.push({ test: 'Create Transaction', status: 'SKIP', reason: 'No source account available' });
    }
  } catch (e) {
    fail('Create Transaction', e.message);
  }

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  res.json({
    summary: {
      total: results.length,
      passed,
      failed,
      skipped,
      mode: process.env.USE_MOCK_NARVI === 'true' ? 'MOCK' : 'PRODUCTION',
      narviUrl: process.env.NARVI_BASE_URL,
    },
    results,
  });
});

module.exports = router;
