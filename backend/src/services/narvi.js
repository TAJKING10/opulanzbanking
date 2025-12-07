/**
 * Narvi API Service
 *
 * This service handles all communication with the Narvi banking API
 * using the correct authentication with cryptographic signatures.
 *
 * Documentation: https://api.narvi.com
 */

const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const canonicaljson = require('canonicaljson');
require('dotenv').config();

// Configuration
const NARVI_API_URL = process.env.NARVI_API_URL || 'https://api.narvi.com/rest/v1.0';
const NARVI_API_KEY_ID = process.env.NARVI_API_KEY_ID;
const NARVI_PRIVATE_KEY_PATH = process.env.NARVI_PRIVATE_KEY_PATH || '../banking_private.pem';

// Load private key
let privateKey;
try {
  // If absolute path, use directly; otherwise resolve relative to __dirname
  const keyPath = path.isAbsolute(NARVI_PRIVATE_KEY_PATH)
    ? NARVI_PRIVATE_KEY_PATH
    : path.resolve(__dirname, NARVI_PRIVATE_KEY_PATH);

  privateKey = fs.readFileSync(keyPath, 'utf8');
  console.log('✅ Narvi private key loaded successfully from:', keyPath);
} catch (error) {
  console.error('❌ Failed to load Narvi private key:', error.message);
  const keyPath = path.isAbsolute(NARVI_PRIVATE_KEY_PATH)
    ? NARVI_PRIVATE_KEY_PATH
    : path.resolve(__dirname, NARVI_PRIVATE_KEY_PATH);
  console.error('   Key path:', keyPath);
}

/**
 * Generate cryptographic signature for Narvi API request
 * @param {string} url - Full URL including base path
 * @param {string} method - HTTP method (GET, POST, PATCH, etc.)
 * @param {string} requestId - Unique request ID (UUID)
 * @param {Object} queryParams - Query parameters object
 * @param {Object} payload - Request body object
 * @returns {string} Base64-encoded signature
 */
function generateSignature(url, method, requestId, queryParams = {}, payload = {}) {
  try {
    // Step 1: Prepare canonical JSON strings
    const queryString = Object.keys(queryParams).length > 0
      ? canonicaljson.stringify(queryParams)
      : '';

    const payloadString = Object.keys(payload).length > 0
      ? canonicaljson.stringify(payload)
      : '';

    // Step 2: Build descriptor string
    const descriptorStr = `${url}${method.toUpperCase()}${requestId}${queryString}${payloadString}`;

    // Step 3: Hash the descriptor
    const descriptorHash = crypto.createHash('sha256').update(descriptorStr).digest();

    // Step 4: Sign the hash with private key
    const sign = crypto.createSign('SHA256');
    sign.update(descriptorHash);
    const signature = sign.sign(privateKey);

    return signature.toString('base64');
  } catch (error) {
    console.error('❌ Error generating signature:', error.message);
    throw error;
  }
}

/**
 * Make authenticated request to Narvi API
 * @param {string} endpoint - API endpoint path (e.g., '/account/list')
 * @param {string} method - HTTP method
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
async function makeNarviRequest(endpoint, method = 'GET', options = {}) {
  if (!privateKey) {
    throw new Error('Narvi private key not loaded. Cannot authenticate requests.');
  }

  if (!NARVI_API_KEY_ID) {
    throw new Error('NARVI_API_KEY_ID not configured in environment variables');
  }

  const { queryParams = {}, payload = {} } = options;
  const requestId = uuidv4();

  // BaaS endpoints use https://api.narvi.com directly, REST API uses https://api.narvi.com/rest/v1.0
  const baseUrl = endpoint.startsWith('/baas/') ? 'https://api.narvi.com' : NARVI_API_URL;
  const url = `${baseUrl}${endpoint}`;

  try {
    // Generate signature
    const signature = generateSignature(url, method, requestId, queryParams, payload);

    // Prepare headers
    const headers = {
      'API-KEY-ID': NARVI_API_KEY_ID,
      'API-REQUEST-ID': requestId,
      'API-REQUEST-SIGNATURE': signature,
      'Content-Type': 'application/json'
    };

    console.log(`📤 Narvi API Request: ${method} ${endpoint}`);
    console.log(`   Request ID: ${requestId}`);

    // Make request
    const config = {
      method,
      url,
      headers,
      timeout: 30000
    };

    if (method !== 'GET' && Object.keys(payload).length > 0) {
      config.data = payload;
    }

    if (Object.keys(queryParams).length > 0) {
      config.params = queryParams;
    }

    const response = await axios(config);

    console.log(`✅ Narvi API Response: ${response.status}`);

    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error(`❌ Narvi API Error: ${endpoint}`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    return {
      success: false,
      error: error.response?.data || error.message,
      errorCode: error.response?.status
    };
  }
}

/**
 * List all Narvi accounts
 * @returns {Promise<Object>} List of accounts
 */
async function listAccounts() {
  console.log('📋 Fetching Narvi account list...');
  return await makeNarviRequest('/account/list', 'GET');
}

/**
 * Retrieve specific account details
 * @param {string} accountPid - Account PID
 * @returns {Promise<Object>} Account details
 */
async function retrieveAccount(accountPid) {
  console.log(`📋 Fetching Narvi account: ${accountPid}`);
  return await makeNarviRequest(`/account/retrieve/${accountPid}`, 'GET');
}

/**
 * Create a new transaction
 * @param {Object} transactionData - Transaction details
 * @returns {Promise<Object>} Transaction response
 */
async function createTransaction(transactionData) {
  console.log('💸 Creating Narvi transaction...');
  return await makeNarviRequest('/transactions/create', 'POST', {
    payload: transactionData
  });
}

/**
 * List transactions for an account
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} List of transactions
 */
async function listTransactions(filters = {}) {
  console.log('📋 Fetching Narvi transactions...');
  return await makeNarviRequest('/transactions/list', 'GET', {
    queryParams: filters
  });
}

/**
 * Retrieve specific transaction details
 * @param {string} transactionPid - Transaction PID
 * @returns {Promise<Object>} Transaction details
 */
async function retrieveTransaction(transactionPid) {
  console.log(`📋 Fetching Narvi transaction: ${transactionPid}`);
  return await makeNarviRequest(`/transactions/retrieve/${transactionPid}`, 'GET');
}

/**
 * Update a transaction (e.g., for VOP confirmation)
 * @param {string} transactionPid - Transaction PID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Update response
 */
async function updateTransaction(transactionPid, updateData) {
  console.log(`📝 Updating Narvi transaction: ${transactionPid}`);
  return await makeNarviRequest(`/transactions/update/${transactionPid}`, 'PATCH', {
    payload: updateData
  });
}

/**
 * Accept or reject VOP (Verification of Payee) for a transaction
 *
 * VOP Match Types:
 * - MTCH: Perfect match (safe to process automatically)
 * - NMTC: No match (recipient name mismatch - reject or verify)
 * - CMTC: Close match (minor difference - requires manual confirmation)
 * - NOAP: Not applicable (bank doesn't support VOP)
 *
 * @param {string} transactionPid - Narvi transaction PID
 * @param {boolean} accept - true to accept VOP, false to reject
 * @returns {Promise<Object>} VOP update response
 */
async function acceptVop(transactionPid, accept = true) {
  console.log(`⚙️ ${accept ? 'Accepting' : 'Rejecting'} VOP for transaction: ${transactionPid}`);
  return await makeNarviRequest(`/transactions/update/${transactionPid}`, 'PATCH', {
    payload: { accept_vop: accept }
  });
}

/**
 * Create transaction with automatic VOP handling
 * @param {Object} transactionData - Transaction details
 * @param {Object} options - Options for VOP handling
 * @param {boolean} options.autoAcceptCloseMatch - Auto-accept CMTC matches (default: false)
 * @returns {Promise<Object>} Transaction response with VOP status
 */
async function createTransactionWithVop(transactionData, options = {}) {
  const { autoAcceptCloseMatch = false } = options;

  console.log('💸 Creating Narvi transaction with VOP handling...');

  // Create the transaction
  const result = await createTransaction(transactionData);

  if (!result.success) {
    return result;
  }

  // Check VOP status
  const vop = result.data?.vop;
  const transactionPid = result.data?.pid;

  if (vop && transactionPid) {
    console.log(`🔍 VOP Check Result: ${vop.match_type}`);
    console.log(`   Recipient Name: ${vop.recipient_matching_name || 'N/A'}`);

    // Handle based on match type
    switch (vop.match_type) {
      case 'MTCH':
        console.log('✅ Perfect match - transaction will proceed automatically');
        break;

      case 'CMTC':
        console.log('⚠️ Close match detected');
        if (autoAcceptCloseMatch) {
          console.log('🔄 Auto-accepting close match...');
          const vopResult = await acceptVop(transactionPid, true);
          result.vopAccepted = vopResult.success;
          result.vopResponse = vopResult;
        } else {
          console.log('⏸️ Manual confirmation required for close match');
          result.requiresVopConfirmation = true;
        }
        break;

      case 'NMTC':
        console.log('❌ No match - recipient name does not match');
        result.vopWarning = 'Recipient name mismatch - verify before accepting';
        break;

      case 'NOAP':
        console.log('ℹ️ VOP not applicable - bank does not support verification');
        break;
    }
  }

  return result;
}

/**
 * Create a private (individual) customer entity in Narvi
 * @param {Object} entityData - Private entity data
 * @returns {Promise<Object>} Entity creation response with PID
 */
async function createPrivateEntity(entityData) {
  console.log('👤 Creating private customer entity in Narvi...');

  const payload = {
    change_request: {
      data: {
        first_name: entityData.firstName,
        last_name: entityData.lastName,
        birthdate: entityData.birthdate, // Format: YYYY-MM-DD
        address: entityData.address,
        zip_code: entityData.zipCode,
        city: entityData.city,
        country: entityData.country,
        citizenship_countries: entityData.citizenshipCountries || [entityData.country],
        birth_country: entityData.birthCountry || entityData.country,
        tax_info: entityData.taxInfo || [],
        wealth_source: entityData.wealthSource || ['SALARY'],
        is_politically_exposed: entityData.isPoliticallyExposed || false,
        opening_account_reason: entityData.openingAccountReason || ['SAVINGS']
      }
    }
  };

  return await makeNarviRequest('/baas/v1.0/entity/private/create', 'POST', { payload });
}

/**
 * Create a business (company) entity in Narvi
 * @param {Object} entityData - Business entity data
 * @returns {Promise<Object>} Entity creation response with PID
 */
async function createBusinessEntity(entityData) {
  console.log('🏢 Creating business entity in Narvi...');

  const payload = {
    change_request: {
      data: {
        details: {
          name: entityData.companyName,
          registration_number: entityData.registrationNumber,
          country: entityData.country
        },
        activities: {
          nace: entityData.naceCode || '6201' // Default: Computer programming activities
        },
        beneficiaries: entityData.beneficiaries || [],
        directors: entityData.directors || [],
        files: entityData.files || {}
      }
    }
  };

  return await makeNarviRequest('/baas/v1.0/entity/business/create', 'POST', { payload });
}

/**
 * Issue a bank account for an entity (private or business)
 * @param {string} ownerKind - 'PRIVATE' or 'BUSINESS'
 * @param {string} ownerPid - Entity PID from Narvi
 * @param {string} currency - Currency code (default: 'EUR')
 * @returns {Promise<Object>} Account creation response with IBAN
 */
async function issueAccount(ownerKind, ownerPid, currency = 'EUR') {
  console.log(`🏦 Issuing ${currency} account for ${ownerKind} entity: ${ownerPid}`);

  const payload = {
    currency,
    owner_kind: ownerKind,
    owner_pid: ownerPid
  };

  return await makeNarviRequest('/baas/v1.0/account/create', 'POST', { payload });
}

/**
 * Create complete Narvi account from application data
 * This is a high-level function that:
 * 1. Creates entity (private or business)
 * 2. Issues bank account
 * 3. Returns complete account details
 *
 * @param {Object} applicationData - Application data from your database
 * @returns {Promise<Object>} Complete account creation response
 */
async function createNarviAccount(applicationData) {
  console.log('🏦 Creating complete Narvi account from application...');

  try {
    const { type, payload } = applicationData;

    let entityResult;
    let ownerKind;

    // Step 1: Create entity based on type
    if (type === 'individual') {
      console.log('📝 Step 1: Creating private entity...');

      const entityData = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        birthdate: payload.dateOfBirth,
        address: payload.address,
        zipCode: payload.postalCode,
        city: payload.city,
        country: payload.country,
        citizenshipCountries: [payload.nationality],
        birthCountry: payload.nationality,
        isPoliticallyExposed: payload.isPEP || false,
        wealthSource: [mapSourceOfFunds(payload.sourceOfFunds)],
        openingAccountReason: ['SAVINGS', 'TRANSACTIONS']
      };

      entityResult = await createPrivateEntity(entityData);
      ownerKind = 'PRIVATE';

    } else if (type === 'company') {
      console.log('📝 Step 1: Creating business entity...');

      const entityData = {
        companyName: payload.companyName,
        registrationNumber: payload.registrationNumber,
        country: payload.companyCountry,
        naceCode: payload.naceCode || '6201',
        beneficiaries: payload.beneficiaries || [],
        directors: payload.directors || []
      };

      entityResult = await createBusinessEntity(entityData);
      ownerKind = 'BUSINESS';

    } else {
      return {
        success: false,
        error: `Unsupported application type: ${type}`
      };
    }

    if (!entityResult.success) {
      console.error('❌ Entity creation failed:', entityResult.error);
      return entityResult;
    }

    const entityPid = entityResult.data.pid;
    console.log(`✅ Entity created with PID: ${entityPid}`);

    // Step 2: Issue account
    console.log('📝 Step 2: Issuing EUR account...');
    const accountResult = await issueAccount(ownerKind, entityPid, 'EUR');

    if (!accountResult.success) {
      console.error('❌ Account issuance failed:', accountResult.error);
      return {
        success: false,
        error: accountResult.error,
        entityPid // Return entity PID even if account creation fails
      };
    }

    console.log(`✅ Account issued: ${accountResult.data.number}`);

    // Return complete result
    return {
      success: true,
      entity: {
        pid: entityPid,
        kind: ownerKind,
        data: entityResult.data
      },
      account: {
        pid: accountResult.data.pid,
        iban: accountResult.data.number,
        bic: accountResult.data.bic,
        status: accountResult.data.status,
        currency: accountResult.data.currency
      }
    };

  } catch (error) {
    console.error('❌ Error creating Narvi account:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Helper function to map source of funds to Narvi wealth source
 * @param {string} sourceOfFunds - Source of funds from application
 * @returns {string} Narvi wealth source code
 */
function mapSourceOfFunds(sourceOfFunds) {
  const mapping = {
    'salary': 'SALARY',
    'business': 'BUSINESS_INCOME',
    'investment': 'INVESTMENT',
    'inheritance': 'INHERITANCE',
    'savings': 'SAVINGS',
    'pension': 'PENSION'
  };
  return mapping[sourceOfFunds?.toLowerCase()] || 'SALARY';
}

module.exports = {
  // Core API functions
  makeNarviRequest,
  generateSignature,

  // Account management (REST API)
  listAccounts,
  retrieveAccount,

  // BaaS - Entity management (Customer Onboarding)
  createPrivateEntity,
  createBusinessEntity,
  issueAccount,
  createNarviAccount, // High-level: creates entity + issues account

  // Transaction management
  createTransaction,
  listTransactions,
  retrieveTransaction,
  updateTransaction,

  // VOP (Verification of Payee) management
  acceptVop,
  createTransactionWithVop
};
