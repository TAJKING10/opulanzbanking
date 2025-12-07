/**
 * Test Script for Document Generation System
 *
 * This script tests the complete document generation workflow:
 * 1. Generate Word documents from templates
 * 2. Fill placeholders with test client data
 * 3. Save generated documents
 */

const testClientData = {
  clientData: {
    client_type: "PP", // PP = Personne Physique (Individual), PM = Personne Morale (Company)
    client: {
      id: "test_client_123",
      full_name: "Jean Dupont",
      first_name: "Jean",
      last_name: "Dupont",
      email: "jean.dupont@example.com",
      phone: "+352 123 456 789",
      address: "123 Rue de Luxembourg",
      city: "Luxembourg",
      postal_code: "L-1234",
      birthdate: "1985-03-15",
      nationality: "LU"
    },
    preferences: {
      email: true,
      mail: false,
      phone: true
    },
    objectives: {
      preservation: 1,  // Priority ranking
      growth: 2,
      income: 3
    },
    risk_profile: {
      category: "Équilibré",
      score: 50,
      max_drawdown_accepted: 20,
      horizon_years: 10
    },
    financial_profile: {
      income_range: "50k-100k",
      patrimony_range: "500k-1M",
      assets: {
        cash: 100000,
        financial: 250000,
        real_estate: 500000,
        professional: 0
      }
    }
  }
};

async function testDocumentGeneration() {
  console.log('\n🧪 Testing Document Generation System\n');
  console.log('━'.repeat(60));

  try {
    console.log('📤 Sending request to backend...\n');

    const response = await fetch('http://localhost:5000/api/document-generation/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testClientData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Documents generated\n');
      console.log('📊 Generation Details:');
      console.log(`   Generation ID: ${result.generation.id}`);
      console.log(`   Client ID: ${result.generation.client_id}`);
      console.log(`   Client Type: ${result.generation.client_type}`);
      console.log(`   Status: ${result.generation.status}`);
      console.log(`\n📄 Generated Documents (${result.documents.length}):`);

      result.documents.forEach((doc, index) => {
        console.log(`\n   ${index + 1}. ${doc.templateName}`);
        console.log(`      File: ${doc.filename}`);
        console.log(`      Path: ${doc.path}`);
      });

      console.log('\n━'.repeat(60));
      console.log('✅ Test completed successfully!');
      console.log(`\n📁 Check your documents in: backend/temp/test_client_123/`);
      console.log('\n💡 Next Steps:');
      console.log('   1. Open the generated Word documents to verify placeholders were filled');
      console.log('   2. Test PDF conversion (requires LibreOffice)');
      console.log('   3. Set up DocuSign to test full signing workflow');

    } else {
      console.error('❌ ERROR:', result.error || result.message);
      console.error('\n🔍 Troubleshooting:');
      console.error('   - Check that backend server is running on port 5000');
      console.error('   - Verify templates are in backend/templates/');
      console.error('   - Check backend console for detailed error messages');
    }

  } catch (error) {
    console.error('❌ FATAL ERROR:', error.message);
    console.error('\n🔍 Make sure:');
    console.error('   - Backend server is running: http://localhost:5000');
    console.error('   - Run: cd backend && node src/index.js');
  }

  console.log('\n');
}

// Run the test
testDocumentGeneration();
