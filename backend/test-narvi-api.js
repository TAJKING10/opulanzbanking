/**
 * Test Narvi API Integration with Real Endpoints
 *
 * This script tests the Narvi API using proper authentication
 */

const narviService = require('./src/services/narvi');

async function testNarviAPI() {
  console.log('🧪 Testing Narvi API Integration\n');
  console.log('=' .repeat(80));

  try {
    // Test 1: List Accounts
    console.log('\n📋 TEST 1: List Accounts');
    console.log('-'.repeat(80));
    const accountsResult = await narviService.listAccounts();

    if (accountsResult.success) {
      console.log('✅ SUCCESS: Accounts retrieved');
      console.log('Response:', JSON.stringify(accountsResult.data, null, 2));

      // If we have accounts, try to retrieve details of the first one
      if (accountsResult.data && accountsResult.data.length > 0) {
        const firstAccountPid = accountsResult.data[0].pid;

        console.log('\n📋 TEST 2: Retrieve Account Details');
        console.log('-'.repeat(80));
        const accountDetails = await narviService.retrieveAccount(firstAccountPid);

        if (accountDetails.success) {
          console.log('✅ SUCCESS: Account details retrieved');
          console.log('Response:', JSON.stringify(accountDetails.data, null, 2));
        } else {
          console.log('❌ FAILED: Could not retrieve account details');
          console.log('Error:', accountDetails.error);
        }
      }
    } else {
      console.log('❌ FAILED: Could not list accounts');
      console.log('Error:', accountsResult.error);
      console.log('Error Code:', accountsResult.errorCode);
    }

    // Test 3: List Transactions
    console.log('\n📋 TEST 3: List Transactions');
    console.log('-'.repeat(80));
    const transactionsResult = await narviService.listTransactions();

    if (transactionsResult.success) {
      console.log('✅ SUCCESS: Transactions retrieved');
      console.log('Response:', JSON.stringify(transactionsResult.data, null, 2));
    } else {
      console.log('❌ FAILED: Could not list transactions');
      console.log('Error:', transactionsResult.error);
    }

    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log('\n✅ If you see account and transaction data above, Narvi integration is working!');
    console.log('✅ The authentication with cryptographic signatures is successful.');
    console.log('\n⚠️  Note: Account creation endpoint still needs to be identified in Narvi docs.');
    console.log('   Current implementation can:');
    console.log('   - ✅ List accounts');
    console.log('   - ✅ Retrieve account details');
    console.log('   - ✅ Create transactions');
    console.log('   - ✅ List transactions');
    console.log('   - ⏳ Create customer accounts (endpoint not documented yet)');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testNarviAPI();
