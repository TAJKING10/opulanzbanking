/**
 * Test Narvi API Integration
 *
 * This script tests the Narvi integration by creating a test application
 */

const testNarviIntegration = async () => {
  console.log('🧪 Testing Narvi API Integration\n');

  // Test data for individual account
  const testApplication = {
    type: 'individual',
    status: 'submitted',
    payload: {
      firstName: 'John',
      lastName: 'Test',
      email: 'john.test@example.com',
      phoneNumber: '+33612345678',
      phoneCode: '+33',
      dateOfBirth: '1990-01-15',
      nationality: 'FR',
      address: '123 Test Street',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
      isPEP: false,
      expectedMonthlyVolume: '5000-10000',
      sourceOfFunds: 'salary',
      consentKYC: true,
      consentTerms: true
    }
  };

  try {
    console.log('📤 Sending test application to backend...\n');

    const response = await fetch('http://localhost:5000/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testApplication)
    });

    const result = await response.json();

    console.log('📥 Response received:\n');
    console.log('Status:', response.status);
    console.log('Success:', result.success);

    if (result.success) {
      console.log('\n✅ Application created successfully!');
      console.log('Application ID:', result.data.id);
      console.log('Application Type:', result.data.type);
      console.log('Application Status:', result.data.status);

      if (result.narvi) {
        console.log('\n🔗 Narvi Integration:');
        console.log('Sent to Narvi:', result.narvi.sent);
        console.log('Narvi Success:', result.narvi.success);
        console.log('Narvi Account ID:', result.narvi.accountId || 'N/A');

        if (result.narvi.error) {
          console.log('⚠️  Narvi Error:', result.narvi.error);
          console.log('\nNote: This error is expected if Narvi API is not yet configured or in test mode.');
        } else if (result.narvi.success) {
          console.log('\n🎉 Narvi account created successfully!');
          console.log('You can check the database to see the narvi_customer_id field populated.');
        }
      }

      // Test retrieving the application
      console.log('\n📥 Retrieving created application...');
      const getResponse = await fetch(`http://localhost:5000/api/applications/${result.data.id}`);
      const getResult = await getResponse.json();

      if (getResult.success) {
        console.log('✅ Application retrieved successfully');
        console.log('Narvi Customer ID:', getResult.data.narvi_customer_id || 'Not set');
      }
    } else {
      console.log('\n❌ Failed to create application');
      console.log('Error:', result.error);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
};

// Run the test
testNarviIntegration();
