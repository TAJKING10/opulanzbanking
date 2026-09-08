const fs = require('fs');
const path = require('path');

// Try loading environment from .env file
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

async function uploadVideosToAzure() {
  console.log('==================================================');
  console.log(' ☁️  Uploading Videos (EN.mp4, FR.mp4) to Azure Storage');
  console.log('==================================================\n');

  const videoFiles = [
    { name: 'EN.mp4', path: path.join(__dirname, '..', 'EN.mp4') },
    { name: 'FR.mp4', path: path.join(__dirname, '..', 'FR.mp4') }
  ];

  for (const video of videoFiles) {
    if (!fs.existsSync(video.path)) {
      console.error(`❌ File not found: ${video.path}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(video.path);
    console.log(`📤 Uploading ${video.name} (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB)...`);

    try {
      const result = await azureStorage.uploadDocument(fileBuffer, video.name, 'video/mp4');
      console.log(`✅ Uploaded ${video.name} successfully!`);
      console.log(`   └─ URL: ${result.url}`);
      console.log(`   └─ Blob Name: ${result.blobName}\n`);
    } catch (err) {
      console.error(`❌ Failed to upload ${video.name}:`, err.message);
    }
  }
}

uploadVideosToAzure().catch(console.error);
