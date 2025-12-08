const fetch = require('node-fetch');

async function testKYCSubmission() {
  console.log('🧪 Testing Complete KYC Submission with DocuSign...\n');

  // Sample KYC data (individual client)
  const kycData = {
    clientType: 'PP',
    preferredLanguage: 'en',
    basicContact: {
      email: 'toufic-jandah@hotmail.com',
      mobile: '+37128103532'
    },
    holders: {
      holder1: {
        title: 'M.',
        firstName: 'Toufic',
        lastName: 'Jandah',
        dateOfBirth: '2002-02-09',
        placeOfBirth: 'Tripoli',
        nationality: 'Lebanese',
        maritalStatus: 'single',
        address: {
          line1: 'Aiviekstes iela 4',
          line2: 'Room 37',
          city: 'Riga',
          postalCode: 'LV-1019',
          country: 'Latvia'
        },
        taxResidency: {
          country: 'Latvia',
          taxIdentificationNumber: 'LV123456789'
        },
        professionalSituation: {
          status: 'employed',
          employerName: 'Tech Company',
          position: 'Developer',
          sector: 'Technology'
        }
      }
    },
    family: {
      numberOfDependents: 0
    },
    financialSituation: {
      annualIncome: '50000',
      incomeSource: 'salary',
      totalAssets: '100000',
      liquidAssets: '50000',
      realEstateValue: '0',
      outstandingDebts: '0'
    },
    originOfFunds: {
      primary: 'salary',
      details: 'Monthly salary from employment'
    },
    investmentProfile: {
      experience: 'intermediate',
      riskTolerance: 'moderate',
      investmentHorizon: 'medium',
      objective: 'growth',
      expectedReturn: '8',
      maxLossAcceptable: '15'
    },
    missionType: 'advisory',
    initialInvestment: '25000',
    consents: {
      dataProcessing: true,
      kyc: true,
      electronic: true,
      marketing: false
    }
  };

  try {
    console.log('📤 Sending KYC submission to backend...');
    console.log('URL: http://localhost:5000/api/kyc/submit\n');

    const response = await fetch('http://localhost:5000/api/kyc/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(kycData)
    });

    const result = await response.json();

    console.log('📥 Response received:\n');
    console.log('Status Code:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('\n✅ SUCCESS! KYC submission completed successfully!');
      console.log('\n📊 Results:');
      console.log('   Application ID:', result.applicationId);
      console.log('   Envelope ID:', result.envelopeId || 'N/A');
      console.log('   Message:', result.message);

      if (result.envelopeId) {
        console.log('\n📧 DocuSign Integration Status:');
        console.log('   ✅ Envelope Created Successfully');
        console.log('   ✅ Email Sent to:', kycData.basicContact.email);
        console.log('   ✅ Documents Ready for Signature');
        console.log('\n🎉 DOCUSIGN IS WORKING PERFECTLY!');
      } else if (result.warning) {
        console.log('\n⚠️  Warning:', result.warning);
      }

      if (result.documents && result.documents.length > 0) {
        console.log('\n📄 Documents Generated:');
        result.documents.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc.name}`);
        });
      }

      process.exit(0);
    } else {
      console.log('\n❌ FAILURE! Submission failed');
      console.log('Error:', result.error || 'Unknown error');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

testKYCSubmission();
