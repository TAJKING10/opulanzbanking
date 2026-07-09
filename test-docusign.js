require('dotenv').config({ path: './backend/.env' });
const docusign = require('./backend/src/services/docusign');

async function testDocuSignConnection() {
  console.log('Testing DocuSign configuration...\n');

  console.log('Config values:');
  console.log('Integration Key:', process.env.DOCUSIGN_INTEGRATION_KEY);
  console.log('User ID:', process.env.DOCUSIGN_USER_ID);
  console.log('Account ID:', process.env.DOCUSIGN_ACCOUNT_ID);
  console.log('Private Key Path:', process.env.DOCUSIGN_PRIVATE_KEY_PATH);
  console.log('Base Path:', process.env.DOCUSIGN_BASE_PATH);
  console.log('\nAttempting to get access token...\n');

  try {
    const token = await docusign.getAccessToken();
    console.log('✅ SUCCESS! DocuSign authentication working!');
    console.log('Access token (first 50 chars):', token.substring(0, 50) + '...');
  } catch (error) {
    console.error('❌ FAILED:', error.message);

    if (error.message.includes('consent_required')) {
      console.log('\n⚠️  You need to grant consent first!');
      console.log('Visit this URL to grant consent:');
      console.log(`https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=${process.env.DOCUSIGN_INTEGRATION_KEY}&redirect_uri=https://www.docusign.com`);
    } else if (error.message.includes('private key')) {
      console.log('\n⚠️  Private key file not found or invalid!');
      console.log('Make sure you downloaded the RSA private key and saved it at:');
      console.log(process.env.DOCUSIGN_PRIVATE_KEY_PATH);
    }
  }
}

testDocuSignConnection();
