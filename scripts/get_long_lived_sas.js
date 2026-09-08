const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
}

const azureStorage = require('../backend/src/services/azureStorage');

// Generate 5-year SAS token for EN and FR video blobs
const enBlob = '1788860571210-EN.mp4';
const frBlob = '1788860584974-FR.mp4';

// 5 years in minutes: 5 * 365 * 24 * 60 = 2628000
const enSasUrl = azureStorage.getSasUrl(enBlob, 2628000);
const frSasUrl = azureStorage.getSasUrl(frBlob, 2628000);

console.log('==================================================');
console.log(' 🔑 Long-Lived Azure Blob SAS URLs Generated');
console.log('==================================================\n');
console.log('EN.mp4 SAS URL:');
console.log(enSasUrl);
console.log('\nFR.mp4 SAS URL:');
console.log(frSasUrl);
