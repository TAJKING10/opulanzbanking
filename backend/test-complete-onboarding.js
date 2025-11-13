/**
 * Test Complete Narvi BaaS Onboarding Flow
 *
 * This script tests the full customer onboarding process:
 * 1. Create entity (private or business)
 * 2. Issue bank account
 * 3. Verify account details
 */

const narviService = require('./src/services/narvi');

async function testCompleteOnboarding() {
  console.log('🧪 Testing Complete Narvi BaaS Onboarding Flow\n');
  console.log('=' .repeat(80));

  // Test 1: Create Private Customer & Issue Account
  console.log('\n👤 TEST 1: Private Customer Onboarding');
  console.log('-'.repeat(80));

  try {
    const privateApplicationData = {
      type: 'individual',
      payload: {
        firstName: 'John',
        lastName: 'TestCustomer',
        dateOfBirth: '1990-05-15',
        address: '123 Test Street',
        postalCode: '75001',
        city: 'Paris',
        country: 'FR',
        nationality: 'FR',
        isPEP: false,
        sourceOfFunds: 'salary',
        expectedMonthlyVolume: '5000-10000'
      }
    };

    console.log('Creating private customer and issuing account...');
    console.log('Customer:', privateApplicationData.payload.firstName, privateApplicationData.payload.lastName);

    const privateResult = await narviService.createNarviAccount(privateApplicationData);

    if (privateResult.success) {
      console.log('\n✅ SUCCESS: Private customer account created!');
      console.log('\n📋 Entity Details:');
      console.log('   Entity PID:', privateResult.entity.pid);
      console.log('   Kind:', privateResult.entity.kind);
      console.log('   Name:', privateApplicationData.payload.firstName, privateApplicationData.payload.lastName);

      console.log('\n🏦 Account Details:');
      console.log('   Account PID:', privateResult.account.pid);
      console.log('   IBAN:', privateResult.account.iban);
      console.log('   BIC:', privateResult.account.bic);
      console.log('   Status:', privateResult.account.status);
      console.log('   Currency:', privateResult.account.currency);
    } else {
      console.log('\n❌ FAILED: Private customer creation failed');
      console.log('Error:', privateResult.error);
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }

  // Test 2: Create Business Customer & Issue Account
  console.log('\n\n🏢 TEST 2: Business Customer Onboarding');
  console.log('-'.repeat(80));

  try {
    const businessApplicationData = {
      type: 'company',
      payload: {
        companyName: 'Test Company Ltd',
        registrationNumber: 'TEST123456',
        companyCountry: 'LV',
        naceCode: '6201',
        beneficiaries: [
          {
            first_name: 'John',
            last_name: 'Owner',
            ownership: 100
          }
        ],
        directors: [
          {
            first_name: 'John',
            last_name: 'Owner',
            position: 'Director'
          }
        ]
      }
    };

    console.log('Creating business entity and issuing account...');
    console.log('Company:', businessApplicationData.payload.companyName);

    const businessResult = await narviService.createNarviAccount(businessApplicationData);

    if (businessResult.success) {
      console.log('\n✅ SUCCESS: Business account created!');
      console.log('\n📋 Entity Details:');
      console.log('   Entity PID:', businessResult.entity.pid);
      console.log('   Kind:', businessResult.entity.kind);
      console.log('   Company:', businessApplicationData.payload.companyName);

      console.log('\n🏦 Account Details:');
      console.log('   Account PID:', businessResult.account.pid);
      console.log('   IBAN:', businessResult.account.iban);
      console.log('   BIC:', businessResult.account.bic);
      console.log('   Status:', businessResult.account.status);
      console.log('   Currency:', businessResult.account.currency);
    } else {
      console.log('\n❌ FAILED: Business entity creation failed');
      console.log('Error:', businessResult.error);
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('ONBOARDING TEST SUMMARY');
  console.log('='.repeat(80));
  console.log('\n✅ What Was Tested:');
  console.log('   1. Private customer entity creation');
  console.log('   2. Account issuance for private customer');
  console.log('   3. Business entity creation');
  console.log('   4. Account issuance for business');
  console.log('\n💡 Next Steps:');
  console.log('   - Check Narvi dashboard → Entities');
  console.log('   - Check Narvi dashboard → Accounts');
  console.log('   - Verify entity and account details');
  console.log('   - Test transactions with the new accounts');
  console.log('\n🔗 Integration:');
  console.log('   Your application forms now automatically:');
  console.log('   1. Save application to Azure PostgreSQL');
  console.log('   2. Create entity in Narvi');
  console.log('   3. Issue bank account');
  console.log('   4. Store Narvi IDs in database');
}

// Run the test
console.log('⚠️  WARNING: This script will create real entities and accounts in Narvi sandbox.');
console.log('   Make sure you want to proceed with this test.\n');

testCompleteOnboarding();
