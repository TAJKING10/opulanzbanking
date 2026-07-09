/**
 * ============================================================
 * MOCK NARVI API SERVER
 * ============================================================
 *
 * Simulates the Narvi BaaS (Banking as a Service) API for local
 * development and testing. Runs on port 5001 by default.
 *
 * Usage:
 *   node mock-narvi-server.js
 *   npm run mock-narvi
 *
 * Then set in your .env:
 *   NARVI_BASE_URL=http://localhost:5001
 *   USE_MOCK_NARVI=true
 *
 * Endpoints Mocked:
 *   REST API (under /rest/v1.0)
 *   ├─ GET  /rest/v1.0/account/list
 *   ├─ GET  /rest/v1.0/account/retrieve/:pid
 *   ├─ POST /rest/v1.0/transactions/create
 *   ├─ GET  /rest/v1.0/transactions/list
 *   ├─ GET  /rest/v1.0/transactions/retrieve/:pid
 *   └─ PATCH /rest/v1.0/transactions/update/:pid
 *
 *   BaaS API (under /baas/v1.0)
 *   ├─ POST /baas/v1.0/entity/private/create
 *   ├─ POST /baas/v1.0/entity/business/create
 *   └─ POST /baas/v1.0/account/create
 *
 *   Admin Dashboard (no auth required)
 *   ├─ GET  /mock/dashboard      → HTML dashboard with all data
 *   ├─ GET  /mock/state          → JSON dump of entire store
 *   ├─ POST /mock/reset          → Reset store to initial state
 *   └─ POST /mock/scenario/:name → Activate test scenario
 * ============================================================
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.MOCK_NARVI_PORT || 5001;

app.use(express.json());

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Generate a realistic-looking Luxembourg IBAN */
function generateIBAN(seq) {
  const num = String(seq).padStart(10, '0');
  return `LU28 0030 ${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8)}00`;
}

/** Generate a PID (platform ID) */
function pid(prefix) {
  return `${prefix}_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
}

/** Simulate realistic network delay (50–200ms) */
function mockDelay(min = 50, max = 200) {
  return new Promise(r => setTimeout(r, Math.random() * (max - min) + min));
}

/** Format date as ISO string with some jitter for realism */
function recentDate(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(Math.floor(Math.random() * 24));
  d.setMinutes(Math.floor(Math.random() * 60));
  return d.toISOString();
}

// ============================================================
// INITIAL SEED DATA
// ============================================================

const SEED_ENTITIES = [
  {
    pid: 'priv_demo_jean_dupont',
    kind: 'PRIVATE',
    status: 'VERIFIED',
    first_name: 'Jean',
    last_name: 'Dupont',
    birthdate: '1985-03-12',
    address: '14 Rue de la Paix',
    zip_code: '75001',
    city: 'Paris',
    country: 'FR',
    citizenship_countries: ['FR'],
    is_politically_exposed: false,
    wealth_source: ['SALARY'],
    created_at: recentDate(90),
    kyc_status: 'APPROVED'
  },
  {
    pid: 'priv_demo_marie_martin',
    kind: 'PRIVATE',
    status: 'VERIFIED',
    first_name: 'Marie',
    last_name: 'Martin',
    birthdate: '1990-07-25',
    address: '5 Avenue des Fleurs',
    zip_code: '1009',
    city: 'Luxembourg',
    country: 'LU',
    citizenship_countries: ['LU', 'FR'],
    is_politically_exposed: false,
    wealth_source: ['BUSINESS_INCOME'],
    created_at: recentDate(60),
    kyc_status: 'APPROVED'
  },
  {
    pid: 'biz_demo_acme_corp',
    kind: 'BUSINESS',
    status: 'VERIFIED',
    name: 'Acme Holdings S.A.',
    registration_number: 'LU20241234',
    country: 'LU',
    nace_code: '6420',
    created_at: recentDate(120),
    kyb_status: 'APPROVED'
  }
];

const SEED_ACCOUNTS = [
  {
    pid: 'acc_demo_jean_eur',
    number: generateIBAN(1),
    bic: 'NARVLULL',
    currency: 'EUR',
    status: 'ACTIVE',
    owner_pid: 'priv_demo_jean_dupont',
    owner_kind: 'PRIVATE',
    owner_name: 'Jean Dupont',
    balance: 48500.00,
    available_balance: 48200.00,
    created_at: recentDate(88)
  },
  {
    pid: 'acc_demo_jean_usd',
    number: generateIBAN(2),
    bic: 'NARVLULL',
    currency: 'USD',
    status: 'ACTIVE',
    owner_pid: 'priv_demo_jean_dupont',
    owner_kind: 'PRIVATE',
    owner_name: 'Jean Dupont',
    balance: 23450.00,
    available_balance: 23450.00,
    created_at: recentDate(87)
  },
  {
    pid: 'acc_demo_jean_gbp',
    number: generateIBAN(3),
    bic: 'NARVLULL',
    currency: 'GBP',
    status: 'ACTIVE',
    owner_pid: 'priv_demo_jean_dupont',
    owner_kind: 'PRIVATE',
    owner_name: 'Jean Dupont',
    balance: 15200.00,
    available_balance: 15200.00,
    created_at: recentDate(86)
  },
  {
    pid: 'acc_demo_marie_eur',
    number: generateIBAN(4),
    bic: 'NARVLULL',
    currency: 'EUR',
    status: 'ACTIVE',
    owner_pid: 'priv_demo_marie_martin',
    owner_kind: 'PRIVATE',
    owner_name: 'Marie Martin',
    balance: 12750.00,
    available_balance: 12750.00,
    created_at: recentDate(58)
  },
  {
    pid: 'acc_demo_acme_eur',
    number: generateIBAN(5),
    bic: 'NARVLULL',
    currency: 'EUR',
    status: 'ACTIVE',
    owner_pid: 'biz_demo_acme_corp',
    owner_kind: 'BUSINESS',
    owner_name: 'Acme Holdings S.A.',
    balance: 287000.00,
    available_balance: 285000.00,
    created_at: recentDate(118)
  }
];

const SEED_TRANSACTIONS = [
  {
    pid: 'txn_demo_001',
    account_pid: 'acc_demo_jean_eur',
    type: 'CREDIT',
    amount: 5000.00,
    currency: 'EUR',
    status: 'COMPLETED',
    counterparty_name: 'Advensys Trading',
    counterparty_iban: 'LV21 HABA 0551 0185 1980 0',
    reference: 'Salary March 2025',
    category: 'SALARY',
    created_at: recentDate(2),
    completed_at: recentDate(2)
  },
  {
    pid: 'txn_demo_002',
    account_pid: 'acc_demo_jean_eur',
    type: 'DEBIT',
    amount: 1250.00,
    currency: 'EUR',
    status: 'COMPLETED',
    counterparty_name: 'SFR Telecom',
    counterparty_iban: 'FR76 3000 6000 0112 3456 7890 189',
    reference: 'Invoice INV-2025-0342',
    category: 'UTILITIES',
    created_at: recentDate(3),
    completed_at: recentDate(3)
  },
  {
    pid: 'txn_demo_003',
    account_pid: 'acc_demo_jean_eur',
    type: 'DEBIT',
    amount: 89.99,
    currency: 'EUR',
    status: 'COMPLETED',
    counterparty_name: 'Adobe Systems',
    counterparty_iban: 'NL91 ABNA 0417 1643 00',
    reference: 'Adobe Creative Cloud',
    category: 'SOFTWARE',
    created_at: recentDate(5),
    completed_at: recentDate(5)
  },
  {
    pid: 'txn_demo_004',
    account_pid: 'acc_demo_jean_eur',
    type: 'CREDIT',
    amount: 2300.00,
    currency: 'EUR',
    status: 'COMPLETED',
    counterparty_name: 'Client Payment - Dupont SA',
    counterparty_iban: 'BE71 0961 2345 6769',
    reference: 'Project delivery Q1',
    category: 'BUSINESS_INCOME',
    created_at: recentDate(7),
    completed_at: recentDate(7)
  },
  {
    pid: 'txn_demo_005',
    account_pid: 'acc_demo_jean_eur',
    type: 'DEBIT',
    amount: 450.00,
    currency: 'EUR',
    status: 'PROCESSING',
    counterparty_name: 'Airbnb Luxembourg',
    counterparty_iban: 'IE29 AIBK 9311 5212 3456 78',
    reference: 'Booking CONF-9823764',
    category: 'TRAVEL',
    created_at: recentDate(0),
    completed_at: null
  },
  {
    pid: 'txn_demo_006',
    account_pid: 'acc_demo_jean_usd',
    type: 'CREDIT',
    amount: 8000.00,
    currency: 'USD',
    status: 'COMPLETED',
    counterparty_name: 'US Client Corp',
    counterparty_iban: 'US12 3456 7890 1234',
    reference: 'Consulting fee Feb',
    category: 'BUSINESS_INCOME',
    created_at: recentDate(10),
    completed_at: recentDate(10)
  },
  {
    pid: 'txn_demo_007',
    account_pid: 'acc_demo_jean_gbp',
    type: 'DEBIT',
    amount: 320.00,
    currency: 'GBP',
    status: 'COMPLETED',
    counterparty_name: 'Amazon UK',
    counterparty_iban: 'GB29 NWBK 6016 1331 9268 19',
    reference: 'Order #204-9876543',
    category: 'SHOPPING',
    created_at: recentDate(4),
    completed_at: recentDate(4)
  },
  {
    pid: 'txn_demo_008',
    account_pid: 'acc_demo_acme_eur',
    type: 'CREDIT',
    amount: 50000.00,
    currency: 'EUR',
    status: 'COMPLETED',
    counterparty_name: 'Investor Capital Ltd',
    counterparty_iban: 'LU28 0019 4006 4475 0000',
    reference: 'Seed investment round A',
    category: 'INVESTMENT',
    created_at: recentDate(15),
    completed_at: recentDate(15)
  },
  {
    pid: 'txn_demo_009',
    account_pid: 'acc_demo_jean_eur',
    type: 'DEBIT',
    amount: 2500.00,
    currency: 'EUR',
    status: 'COMPLETED',
    counterparty_name: 'Bureau Luxembourg Offices',
    counterparty_iban: 'LU12 0019 4006 4475 0001',
    reference: 'Office rent March 2025',
    category: 'RENT',
    created_at: recentDate(1),
    completed_at: recentDate(1)
  },
  {
    pid: 'txn_demo_010',
    account_pid: 'acc_demo_jean_eur',
    type: 'CREDIT',
    amount: 750.00,
    currency: 'EUR',
    status: 'COMPLETED',
    counterparty_name: 'Tax Refund - Centre Impots',
    counterparty_iban: 'FR76 1007 6020 0100 0000 0201 060',
    reference: 'Tax refund 2024',
    category: 'TAX_REFUND',
    created_at: recentDate(6),
    completed_at: recentDate(6)
  }
];

// ============================================================
// IN-MEMORY STORE
// ============================================================
let store = {
  entities: [...SEED_ENTITIES.map(e => ({ ...e }))],
  accounts: [...SEED_ACCOUNTS.map(a => ({ ...a }))],
  transactions: [...SEED_TRANSACTIONS.map(t => ({ ...t }))],
  ibanCounter: SEED_ACCOUNTS.length + 1,

  // Test scenarios (can be activated via /mock/scenario/:name)
  activeScenario: null
};

function resetStore() {
  store = {
    entities: [...SEED_ENTITIES.map(e => ({ ...e }))],
    accounts: [...SEED_ACCOUNTS.map(a => ({ ...a }))],
    transactions: [...SEED_TRANSACTIONS.map(t => ({ ...t }))],
    ibanCounter: SEED_ACCOUNTS.length + 1,
    activeScenario: null
  };
}

// ============================================================
// AUTH MIDDLEWARE
// Validates required Narvi headers, skips signature verification
// ============================================================
function validateNarviHeaders(req, res, next) {
  // Skip auth for admin and health endpoints
  if (req.path.startsWith('/mock') || req.path === '/health') return next();

  const apiKeyId = req.headers['api-key-id'];
  const requestId = req.headers['api-request-id'];
  const signature = req.headers['api-request-signature'];

  if (!apiKeyId || !requestId || !signature) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Missing required headers: API-KEY-ID, API-REQUEST-ID, API-REQUEST-SIGNATURE'
    });
  }

  // Simulate scenario: auth failure
  if (store.activeScenario === 'auth_failure') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Invalid API key or signature' });
  }

  console.log(`[MOCK NARVI] ${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
}

app.use(validateNarviHeaders);

// ============================================================
// SCENARIO HELPERS
// ============================================================

/** Check if current scenario forces a server error */
function shouldSimulateError(scenario) {
  return scenario === 'server_error';
}

/** Get VOP match type based on active scenario or random */
function getVopMatchType() {
  switch (store.activeScenario) {
    case 'vop_no_match': return 'NMTC';
    case 'vop_close_match': return 'CMTC';
    case 'vop_not_applicable': return 'NOAP';
    default: return 'MTCH'; // Perfect match by default
  }
}

// ============================================================
// BaaS ENTITY ENDPOINTS
// POST /baas/v1.0/entity/private/create
// POST /baas/v1.0/entity/business/create
// ============================================================

app.post('/baas/v1.0/entity/private/create', async (req, res) => {
  await mockDelay();

  if (shouldSimulateError(store.activeScenario)) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Narvi service unavailable' });
  }

  const data = req.body?.change_request?.data || {};

  const entity = {
    pid: pid('priv'),
    kind: 'PRIVATE',
    status: 'PENDING_KYC',
    first_name: data.first_name || 'Unknown',
    last_name: data.last_name || 'Unknown',
    birthdate: data.birthdate || null,
    address: data.address || null,
    zip_code: data.zip_code || null,
    city: data.city || null,
    country: data.country || 'LU',
    citizenship_countries: data.citizenship_countries || [],
    is_politically_exposed: data.is_politically_exposed || false,
    wealth_source: data.wealth_source || ['SALARY'],
    opening_account_reason: data.opening_account_reason || ['SAVINGS'],
    kyc_status: 'PENDING',
    created_at: new Date().toISOString()
  };

  store.entities.push(entity);

  console.log(`[MOCK NARVI] Created private entity: ${entity.pid} (${entity.first_name} ${entity.last_name})`);

  res.status(201).json({
    pid: entity.pid,
    kind: entity.kind,
    status: entity.status,
    kyc_status: entity.kyc_status,
    created_at: entity.created_at,
    data: {
      first_name: entity.first_name,
      last_name: entity.last_name,
      country: entity.country
    }
  });
});

app.post('/baas/v1.0/entity/business/create', async (req, res) => {
  await mockDelay();

  if (shouldSimulateError(store.activeScenario)) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Narvi service unavailable' });
  }

  const data = req.body?.change_request?.data || {};
  const details = data.details || {};

  const entity = {
    pid: pid('biz'),
    kind: 'BUSINESS',
    status: 'PENDING_KYB',
    name: details.name || 'Unknown Company',
    registration_number: details.registration_number || null,
    country: details.country || 'LU',
    nace_code: data.activities?.nace || '6201',
    kyb_status: 'PENDING',
    created_at: new Date().toISOString()
  };

  store.entities.push(entity);

  console.log(`[MOCK NARVI] Created business entity: ${entity.pid} (${entity.name})`);

  res.status(201).json({
    pid: entity.pid,
    kind: entity.kind,
    status: entity.status,
    kyb_status: entity.kyb_status,
    created_at: entity.created_at,
    data: {
      name: entity.name,
      registration_number: entity.registration_number,
      country: entity.country
    }
  });
});

// ============================================================
// BaaS ACCOUNT ENDPOINTS
// POST /baas/v1.0/account/create
// ============================================================

app.post('/baas/v1.0/account/create', async (req, res) => {
  await mockDelay();

  if (shouldSimulateError(store.activeScenario)) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Narvi service unavailable' });
  }

  const { currency = 'EUR', owner_kind, owner_pid } = req.body;

  // Validate entity exists
  const entity = store.entities.find(e => e.pid === owner_pid);
  if (!entity) {
    return res.status(404).json({
      error: 'ENTITY_NOT_FOUND',
      message: `Entity with PID ${owner_pid} not found`
    });
  }

  const accountSeq = store.ibanCounter++;
  const ownerName = entity.kind === 'PRIVATE'
    ? `${entity.first_name} ${entity.last_name}`
    : entity.name;

  const account = {
    pid: pid('acc'),
    number: generateIBAN(accountSeq),
    bic: 'NARVLULL',
    currency: currency.toUpperCase(),
    status: 'ACTIVE',
    owner_pid,
    owner_kind: owner_kind || entity.kind,
    owner_name: ownerName,
    balance: 0.00,
    available_balance: 0.00,
    created_at: new Date().toISOString()
  };

  store.accounts.push(account);

  console.log(`[MOCK NARVI] Issued ${currency} account: ${account.pid} → ${account.number} for ${ownerName}`);

  res.status(201).json({
    pid: account.pid,
    number: account.number,
    bic: account.bic,
    currency: account.currency,
    status: account.status,
    owner_pid: account.owner_pid,
    owner_kind: account.owner_kind,
    created_at: account.created_at
  });
});

// ============================================================
// REST API - ACCOUNT ENDPOINTS
// GET /rest/v1.0/account/list
// GET /rest/v1.0/account/retrieve/:pid
// ============================================================

app.get('/rest/v1.0/account/list', async (req, res) => {
  await mockDelay();

  const { owner_pid, currency, status, limit = 50, offset = 0 } = req.query;

  let accounts = [...store.accounts];

  if (owner_pid) accounts = accounts.filter(a => a.owner_pid === owner_pid);
  if (currency) accounts = accounts.filter(a => a.currency === currency.toUpperCase());
  if (status) accounts = accounts.filter(a => a.status === status.toUpperCase());

  const total = accounts.length;
  const page = accounts.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({
    items: page,
    pagination: { total, limit: parseInt(limit), offset: parseInt(offset) }
  });
});

app.get('/rest/v1.0/account/retrieve/:pid', async (req, res) => {
  await mockDelay();

  const account = store.accounts.find(a => a.pid === req.params.pid);

  if (!account) {
    return res.status(404).json({
      error: 'ACCOUNT_NOT_FOUND',
      message: `Account with PID ${req.params.pid} not found`
    });
  }

  res.json(account);
});

// ============================================================
// REST API - TRANSACTION ENDPOINTS
// POST /rest/v1.0/transactions/create
// GET  /rest/v1.0/transactions/list
// GET  /rest/v1.0/transactions/retrieve/:pid
// PATCH /rest/v1.0/transactions/update/:pid
// ============================================================

app.post('/rest/v1.0/transactions/create', async (req, res) => {
  await mockDelay(100, 400);

  if (shouldSimulateError(store.activeScenario)) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Narvi service unavailable' });
  }

  const {
    account_pid,
    amount,
    currency = 'EUR',
    counterparty_name,
    counterparty_iban,
    reference,
    type = 'DEBIT'
  } = req.body;

  // Validate account exists
  const account = store.accounts.find(a => a.pid === account_pid);
  if (!account) {
    return res.status(404).json({
      error: 'ACCOUNT_NOT_FOUND',
      message: `Account with PID ${account_pid} not found`
    });
  }

  // Check insufficient funds for debits
  if (type === 'DEBIT' && account.available_balance < amount) {
    if (store.activeScenario === 'insufficient_funds') {
      return res.status(422).json({
        error: 'INSUFFICIENT_FUNDS',
        message: 'Account does not have sufficient available balance'
      });
    }
  }

  // VOP simulation
  const vopMatchType = getVopMatchType();

  const transaction = {
    pid: pid('txn'),
    account_pid,
    type: type.toUpperCase(),
    amount: parseFloat(amount),
    currency: currency.toUpperCase(),
    status: vopMatchType === 'MTCH' || vopMatchType === 'NOAP' ? 'PROCESSING' : 'PENDING_VOP',
    counterparty_name: counterparty_name || 'Unknown',
    counterparty_iban: counterparty_iban || null,
    reference: reference || null,
    category: req.body.category || 'OTHER',
    vop: {
      match_type: vopMatchType,
      recipient_matching_name: vopMatchType !== 'NMTC' ? counterparty_name : 'Unknown Recipient',
      checked_at: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    completed_at: null
  };

  store.transactions.push(transaction);

  // Update account balance for auto-processed transactions
  if (transaction.status === 'PROCESSING') {
    if (type === 'DEBIT') {
      account.available_balance -= parseFloat(amount);
    }
  }

  console.log(`[MOCK NARVI] Transaction created: ${transaction.pid} | ${type} ${amount} ${currency} | VOP: ${vopMatchType}`);

  res.status(201).json({
    pid: transaction.pid,
    account_pid: transaction.account_pid,
    type: transaction.type,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    counterparty_name: transaction.counterparty_name,
    reference: transaction.reference,
    vop: transaction.vop,
    created_at: transaction.created_at
  });
});

app.get('/rest/v1.0/transactions/list', async (req, res) => {
  await mockDelay();

  const {
    account_pid,
    type,
    status,
    currency,
    date_from,
    date_to,
    limit = 50,
    offset = 0
  } = req.query;

  let transactions = [...store.transactions];

  if (account_pid) transactions = transactions.filter(t => t.account_pid === account_pid);
  if (type) transactions = transactions.filter(t => t.type === type.toUpperCase());
  if (status) transactions = transactions.filter(t => t.status === status.toUpperCase());
  if (currency) transactions = transactions.filter(t => t.currency === currency.toUpperCase());
  if (date_from) transactions = transactions.filter(t => new Date(t.created_at) >= new Date(date_from));
  if (date_to) transactions = transactions.filter(t => new Date(t.created_at) <= new Date(date_to));

  // Sort newest first
  transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const total = transactions.length;
  const page = transactions.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({
    items: page,
    pagination: { total, limit: parseInt(limit), offset: parseInt(offset) }
  });
});

app.get('/rest/v1.0/transactions/retrieve/:pid', async (req, res) => {
  await mockDelay();

  const transaction = store.transactions.find(t => t.pid === req.params.pid);

  if (!transaction) {
    return res.status(404).json({
      error: 'TRANSACTION_NOT_FOUND',
      message: `Transaction with PID ${req.params.pid} not found`
    });
  }

  res.json(transaction);
});

app.patch('/rest/v1.0/transactions/update/:pid', async (req, res) => {
  await mockDelay();

  const transaction = store.transactions.find(t => t.pid === req.params.pid);

  if (!transaction) {
    return res.status(404).json({
      error: 'TRANSACTION_NOT_FOUND',
      message: `Transaction with PID ${req.params.pid} not found`
    });
  }

  // Handle VOP acceptance/rejection
  if (req.body.accept_vop !== undefined) {
    const accepted = req.body.accept_vop === true;

    if (accepted) {
      transaction.status = 'PROCESSING';
      // Deduct from available balance
      const account = store.accounts.find(a => a.pid === transaction.account_pid);
      if (account && transaction.type === 'DEBIT') {
        account.available_balance -= transaction.amount;
      }
      console.log(`[MOCK NARVI] VOP accepted for ${transaction.pid}`);
    } else {
      transaction.status = 'CANCELLED';
      console.log(`[MOCK NARVI] VOP rejected for ${transaction.pid}`);
    }

    transaction.vop_accepted = accepted;
    transaction.vop_decided_at = new Date().toISOString();
  }

  // Handle general status update
  if (req.body.status) {
    transaction.status = req.body.status.toUpperCase();
    if (transaction.status === 'COMPLETED') {
      transaction.completed_at = new Date().toISOString();
      // Finalize balance update for debits
      const account = store.accounts.find(a => a.pid === transaction.account_pid);
      if (account) {
        if (transaction.type === 'DEBIT') {
          account.balance -= transaction.amount;
        } else if (transaction.type === 'CREDIT') {
          account.balance += transaction.amount;
          account.available_balance += transaction.amount;
        }
      }
    }
  }

  // Apply any other allowed fields
  const allowedUpdates = ['reference', 'category', 'metadata'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) transaction[field] = req.body[field];
  });

  res.json(transaction);
});

// ============================================================
// ADMIN DASHBOARD ROUTES (No auth required)
// ============================================================

/** GET /mock/state — JSON dump of entire store */
app.get('/mock/state', (req, res) => {
  res.json({
    entities: store.entities,
    accounts: store.accounts,
    transactions: store.transactions,
    activeScenario: store.activeScenario,
    ibanCounter: store.ibanCounter,
    counts: {
      entities: store.entities.length,
      accounts: store.accounts.length,
      transactions: store.transactions.length
    }
  });
});

/** POST /mock/reset — Reset store to seed data */
app.post('/mock/reset', (req, res) => {
  resetStore();
  console.log('[MOCK NARVI] Store reset to initial seed data');
  res.json({ success: true, message: 'Store reset to initial seed data' });
});

/** POST /mock/scenario/:name — Activate test scenario */
app.post('/mock/scenario/:name', (req, res) => {
  const { name } = req.params;
  const validScenarios = [
    'default',
    'auth_failure',
    'server_error',
    'vop_no_match',
    'vop_close_match',
    'vop_not_applicable',
    'insufficient_funds'
  ];

  if (!validScenarios.includes(name)) {
    return res.status(400).json({
      error: 'INVALID_SCENARIO',
      message: `Valid scenarios: ${validScenarios.join(', ')}`
    });
  }

  store.activeScenario = name === 'default' ? null : name;
  console.log(`[MOCK NARVI] Active scenario: ${store.activeScenario || 'default'}`);
  res.json({ success: true, activeScenario: store.activeScenario });
});

/** GET /mock/dashboard — HTML dashboard */
app.get('/mock/dashboard', (req, res) => {
  const totalBalance = store.accounts.reduce((sum, a) => {
    if (a.currency === 'EUR') return sum + a.balance;
    return sum;
  }, 0);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mock Narvi API Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    .header { background: linear-gradient(135deg, #1e293b, #0f172a); border-bottom: 1px solid #334155; padding: 20px 32px; display: flex; align-items: center; gap: 12px; }
    .header h1 { font-size: 20px; font-weight: 700; color: #f1f5f9; }
    .badge { background: #10b981; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge.warn { background: #f59e0b; }
    .container { max-width: 1400px; margin: 0 auto; padding: 32px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; }
    .stat-card .label { font-size: 13px; color: #94a3b8; margin-bottom: 8px; }
    .stat-card .value { font-size: 28px; font-weight: 700; color: #f1f5f9; }
    .stat-card .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
    .section { background: #1e293b; border: 1px solid #334155; border-radius: 12px; margin-bottom: 24px; overflow: hidden; }
    .section-header { padding: 16px 20px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; }
    .section-header h2 { font-size: 15px; font-weight: 600; color: #f1f5f9; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #334155; background: #0f172a; }
    td { padding: 12px 16px; font-size: 13px; color: #cbd5e1; border-bottom: 1px solid #1e293b; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,0.02); }
    .mono { font-family: 'SF Mono', Monaco, monospace; font-size: 12px; color: #94a3b8; }
    .pill { display: inline-flex; padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .pill.active, .pill.completed, .pill.verified { background: #064e3b; color: #34d399; }
    .pill.pending, .pill.processing { background: #451a03; color: #fbbf24; }
    .pill.cancelled, .pill.rejected { background: #450a0a; color: #f87171; }
    .pill.credit { background: #064e3b; color: #34d399; }
    .pill.debit { background: #450a0a; color: #f87171; }
    .scenarios { display: flex; flex-wrap: wrap; gap: 8px; padding: 20px; }
    .scenario-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #94a3b8; cursor: pointer; font-size: 13px; transition: all 0.2s; }
    .scenario-btn:hover { border-color: #b59354; color: #b59354; }
    .scenario-btn.active { background: #b59354; border-color: #b59354; color: #0f172a; font-weight: 600; }
    .actions { display: flex; gap: 12px; padding: 20px; }
    .btn { padding: 8px 20px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; }
    .btn-danger { background: #7f1d1d; color: #fca5a5; }
    .btn-danger:hover { background: #991b1b; }
    .scenario-info { padding: 16px 20px; background: #0f172a; border-top: 1px solid #334155; font-size: 13px; color: #94a3b8; }
    .amount.positive { color: #34d399; }
    .amount.negative { color: #f87171; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Mock Narvi API</h1>
    <span class="badge">RUNNING</span>
    <span style="color:#64748b;font-size:13px;margin-left:auto">Port ${PORT} &nbsp;·&nbsp; ${new Date().toLocaleString()}</span>
  </div>

  <div class="container">
    <!-- Stats -->
    <div class="grid">
      <div class="stat-card">
        <div class="label">Entities</div>
        <div class="value">${store.entities.length}</div>
        <div class="sub">${store.entities.filter(e => e.kind === 'PRIVATE').length} private · ${store.entities.filter(e => e.kind === 'BUSINESS').length} business</div>
      </div>
      <div class="stat-card">
        <div class="label">Accounts</div>
        <div class="value">${store.accounts.length}</div>
        <div class="sub">${store.accounts.filter(a => a.status === 'ACTIVE').length} active</div>
      </div>
      <div class="stat-card">
        <div class="label">Transactions</div>
        <div class="value">${store.transactions.length}</div>
        <div class="sub">${store.transactions.filter(t => t.status === 'COMPLETED').length} completed · ${store.transactions.filter(t => t.status === 'PROCESSING').length} processing</div>
      </div>
      <div class="stat-card">
        <div class="label">Total EUR Balance</div>
        <div class="value">€${totalBalance.toLocaleString('en', { minimumFractionDigits: 2 })}</div>
        <div class="sub">across EUR accounts</div>
      </div>
      <div class="stat-card">
        <div class="label">Active Scenario</div>
        <div class="value" style="font-size:18px;">${store.activeScenario || 'default'}</div>
        <div class="sub">testing mode</div>
      </div>
    </div>

    <!-- Scenarios -->
    <div class="section">
      <div class="section-header">
        <h2>Test Scenarios</h2>
        <span style="font-size:12px;color:#64748b">Click to activate a scenario for testing edge cases</span>
      </div>
      <div class="scenarios">
        ${['default','auth_failure','server_error','vop_no_match','vop_close_match','vop_not_applicable','insufficient_funds'].map(s => `
          <button class="scenario-btn ${store.activeScenario === s || (s === 'default' && !store.activeScenario) ? 'active' : ''}"
            onclick="activateScenario('${s}')">${s}</button>
        `).join('')}
      </div>
      <div class="scenario-info">
        <strong>Scenario descriptions:</strong>
        default = Normal operation &nbsp;|&nbsp;
        auth_failure = All requests return 403 &nbsp;|&nbsp;
        server_error = All requests return 500 &nbsp;|&nbsp;
        vop_no_match = Transactions return NMTC (name mismatch) &nbsp;|&nbsp;
        vop_close_match = Transactions return CMTC (requires confirmation) &nbsp;|&nbsp;
        vop_not_applicable = Transactions return NOAP &nbsp;|&nbsp;
        insufficient_funds = Debit transactions fail
      </div>
    </div>

    <!-- Actions -->
    <div class="section">
      <div class="section-header"><h2>Actions</h2></div>
      <div class="actions">
        <button class="btn btn-danger" onclick="resetStore()">Reset Store to Seed Data</button>
      </div>
    </div>

    <!-- Accounts -->
    <div class="section">
      <div class="section-header"><h2>Accounts (${store.accounts.length})</h2></div>
      <table>
        <thead>
          <tr><th>PID</th><th>IBAN</th><th>Owner</th><th>Currency</th><th>Balance</th><th>Available</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${store.accounts.map(a => `
            <tr>
              <td class="mono">${a.pid}</td>
              <td class="mono">${a.number}</td>
              <td>${a.owner_name || a.owner_pid}</td>
              <td>${a.currency}</td>
              <td class="amount ${a.balance >= 0 ? 'positive' : 'negative'}">${a.currency} ${a.balance.toLocaleString('en', { minimumFractionDigits: 2 })}</td>
              <td class="amount ${a.available_balance >= 0 ? 'positive' : 'negative'}">${a.currency} ${a.available_balance.toLocaleString('en', { minimumFractionDigits: 2 })}</td>
              <td><span class="pill ${a.status.toLowerCase()}">${a.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Entities -->
    <div class="section">
      <div class="section-header"><h2>Entities (${store.entities.length})</h2></div>
      <table>
        <thead>
          <tr><th>PID</th><th>Kind</th><th>Name</th><th>Country</th><th>Status</th><th>KYC/KYB</th></tr>
        </thead>
        <tbody>
          ${store.entities.map(e => `
            <tr>
              <td class="mono">${e.pid}</td>
              <td><span class="pill ${e.kind.toLowerCase()}" style="background:#1e3a5f;color:#93c5fd">${e.kind}</span></td>
              <td>${e.kind === 'PRIVATE' ? `${e.first_name} ${e.last_name}` : e.name}</td>
              <td>${e.country}</td>
              <td><span class="pill ${e.status.toLowerCase().includes('pending') ? 'pending' : 'active'}">${e.status}</span></td>
              <td><span class="pill ${(e.kyc_status || e.kyb_status || '').toLowerCase()}">${e.kyc_status || e.kyb_status || 'N/A'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Transactions -->
    <div class="section">
      <div class="section-header"><h2>Transactions (${store.transactions.length})</h2></div>
      <table>
        <thead>
          <tr><th>PID</th><th>Type</th><th>Amount</th><th>Counterparty</th><th>Reference</th><th>Status</th><th>VOP</th><th>Date</th></tr>
        </thead>
        <tbody>
          ${[...store.transactions].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).map(t => `
            <tr>
              <td class="mono">${t.pid}</td>
              <td><span class="pill ${t.type.toLowerCase()}">${t.type}</span></td>
              <td class="amount ${t.type === 'CREDIT' ? 'positive' : 'negative'}">${t.type === 'CREDIT' ? '+' : '-'}${t.currency} ${t.amount.toLocaleString('en', { minimumFractionDigits: 2 })}</td>
              <td>${t.counterparty_name}</td>
              <td style="color:#94a3b8;max-width:200px;overflow:hidden;text-overflow:ellipsis">${t.reference || '—'}</td>
              <td><span class="pill ${t.status.toLowerCase()}">${t.status}</span></td>
              <td><span class="mono" style="font-size:11px">${t.vop?.match_type || '—'}</span></td>
              <td class="mono">${new Date(t.created_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    async function activateScenario(name) {
      const res = await fetch('/mock/scenario/' + name, { method: 'POST' });
      if (res.ok) location.reload();
    }
    async function resetStore() {
      if (!confirm('Reset all data to initial seed state?')) return;
      const res = await fetch('/mock/reset', { method: 'POST' });
      if (res.ok) location.reload();
    }
    // Auto-refresh every 30 seconds
    setTimeout(() => location.reload(), 30000);
  </script>
</body>
</html>`;

  res.send(html);
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'Mock Narvi API',
    port: PORT,
    activeScenario: store.activeScenario || 'default',
    counts: {
      entities: store.entities.length,
      accounts: store.accounts.length,
      transactions: store.transactions.length
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
  console.warn(`[MOCK NARVI] 404 - ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'ENDPOINT_NOT_FOUND',
    message: `${req.method} ${req.path} is not a valid Narvi API endpoint`,
    hint: 'Check the mock server docs at GET /mock/dashboard'
  });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║         MOCK NARVI API SERVER RUNNING            ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  URL:       http://localhost:${PORT}                ║`);
  console.log(`║  Dashboard: http://localhost:${PORT}/mock/dashboard  ║`);
  console.log(`║  Health:    http://localhost:${PORT}/health           ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Entities:     ${SEED_ENTITIES.length} pre-seeded                       ║`);
  console.log(`║  Accounts:     ${SEED_ACCOUNTS.length} pre-seeded                       ║`);
  console.log(`║  Transactions: ${SEED_TRANSACTIONS.length} pre-seeded                      ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  Set in backend/.env:                            ║');
  console.log('║    NARVI_BASE_URL=http://localhost:5001          ║');
  console.log('║    USE_MOCK_NARVI=true                           ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
