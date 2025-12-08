require('dotenv').config();
const docusign = require('./src/services/docusign');

async function test() {
  try {
    console.log('🧪 Testing DocuSign configuration...');
    console.log('DocuSign configured:', docusign.isConfigured);

    if (!docusign.isConfigured) {
      console.log('❌ DocuSign is not configured');
      process.exit(1);
    }

    console.log('🔐 Testing authentication...');
    const token = await docusign.getAccessToken();
    console.log('✅ DocuSign authentication successful!');
    console.log('✅ Access token obtained');
    console.log('✅ Ready to send documents for signature!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    if (error.response && error.response.body) {
      console.error('Error details:', JSON.stringify(error.response.body, null, 2));
    }
    process.exit(1);
  }
}

test();
