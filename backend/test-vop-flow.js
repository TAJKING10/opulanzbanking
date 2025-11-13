/**
 * Test Narvi VOP (Verification of Payee) Flow
 *
 * This script demonstrates how to handle VOP confirmations in transactions
 */

const narviService = require('./src/services/narvi');

async function testVopFlow() {
  console.log('🧪 Testing Narvi VOP Flow\n');
  console.log('=' .repeat(80));

  try {
    // Step 1: Get account to use for transaction
    console.log('\n📋 STEP 1: Fetch Account Information');
    console.log('-'.repeat(80));

    const accountsResult = await narviService.listAccounts();

    if (!accountsResult.success || !accountsResult.data || !accountsResult.data.results || accountsResult.data.results.length === 0) {
      console.log('❌ No accounts available for testing');
      return;
    }

    const account = accountsResult.data.results[0];
    console.log('✅ Using account:', account.number);
    console.log('   Balance:', (account.balance / 100).toFixed(2), account.currency);
    console.log('   PID:', account.pid);

    // Step 2: Create a test transaction
    console.log('\n💸 STEP 2: Create Test Transaction');
    console.log('-'.repeat(80));

    const transactionData = {
      account_pid: account.pid,
      amount: 100, // 1.00 EUR (amount in cents)
      currency: 'EUR',
      recipient: {
        number: 'FI3379600112347627', // Test recipient IBAN
        name: 'Test Recipient Account',
        address: 'Test Street 123',
        city: 'Helsinki',
        zip_code: '00100',
        country: 'FI'
      },
      remittance_information: {
        ustrd: 'Test transaction for VOP flow demonstration'
      }
    };

    console.log('Creating transaction...');
    console.log('Amount:', (transactionData.amount / 100).toFixed(2), transactionData.currency);
    console.log('Recipient:', transactionData.recipient.name);
    console.log('Recipient IBAN:', transactionData.recipient.number);

    const txResult = await narviService.createTransaction(transactionData);

    if (!txResult.success) {
      console.log('❌ Transaction creation failed');
      console.log('Error:', txResult.error);
      return;
    }

    console.log('✅ Transaction created successfully');
    console.log('Transaction PID:', txResult.data.pid);
    console.log('Status:', txResult.data.status);

    // Step 3: Check VOP status
    console.log('\n🔍 STEP 3: Check VOP Status');
    console.log('-'.repeat(80));

    if (txResult.data.vop) {
      const vop = txResult.data.vop;
      console.log('VOP Match Type:', vop.match_type);
      console.log('Recipient Matching Name:', vop.recipient_matching_name || 'N/A');

      // Explain the match type
      switch (vop.match_type) {
        case 'MTCH':
          console.log('\n✅ MTCH (Perfect Match)');
          console.log('   The recipient name matches exactly with bank records.');
          console.log('   Transaction will proceed automatically.');
          break;

        case 'CMTC':
          console.log('\n⚠️  CMTC (Close Match)');
          console.log('   The recipient name is similar but not exactly matching.');
          console.log('   Manual confirmation is required.');
          console.log('\n   Would you like to accept this transaction? (In production, ask user)');

          // For demo, auto-accept close matches
          console.log('   [Demo Mode] Auto-accepting close match...');

          const vopResult = await narviService.acceptVop(txResult.data.pid, true);

          if (vopResult.success) {
            console.log('✅ VOP accepted successfully');
            console.log('   Transaction will now proceed');
          } else {
            console.log('❌ VOP acceptance failed');
            console.log('Error:', vopResult.error);
          }
          break;

        case 'NMTC':
          console.log('\n❌ NMTC (No Match)');
          console.log('   The recipient name does NOT match bank records.');
          console.log('   This transaction should be reviewed carefully.');
          console.log('   Consider rejecting or verifying with the recipient.');
          break;

        case 'NOAP':
          console.log('\nℹ️  NOAP (Not Applicable)');
          console.log('   The recipient bank does not support VOP verification.');
          console.log('   Transaction will proceed without verification.');
          break;

        default:
          console.log('\n⚠️  Unknown VOP status:', vop.match_type);
      }
    } else {
      console.log('ℹ️  No VOP data in transaction response');
      console.log('   This may occur if VOP is not enabled or not applicable');
    }

    // Step 4: Retrieve final transaction status
    console.log('\n📥 STEP 4: Retrieve Final Transaction Status');
    console.log('-'.repeat(80));

    const finalTx = await narviService.retrieveTransaction(txResult.data.pid);

    if (finalTx.success) {
      console.log('✅ Final transaction status retrieved');
      console.log('PID:', finalTx.data.pid);
      console.log('Status:', finalTx.data.status);
      console.log('Amount:', (finalTx.data.amount / 100).toFixed(2), finalTx.data.currency);

      if (finalTx.data.vop) {
        console.log('VOP Status:', finalTx.data.vop.match_type);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('VOP FLOW TEST COMPLETE');
    console.log('='.repeat(80));
    console.log('\n✅ Summary:');
    console.log('   1. Account retrieved successfully');
    console.log('   2. Transaction created with VOP check');
    console.log('   3. VOP status handled appropriately');
    console.log('   4. Final transaction status confirmed');
    console.log('\n💡 Next Steps:');
    console.log('   - Check Narvi dashboard for transaction details');
    console.log('   - Review VOP match results');
    console.log('   - Verify transaction status updates');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
console.log('⚠️  WARNING: This script will create a real transaction in the Narvi sandbox.');
console.log('   Make sure you want to proceed with this test.\n');

testVopFlow();
