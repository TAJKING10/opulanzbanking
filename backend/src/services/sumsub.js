const crypto = require('crypto');
const https = require('https');

const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;

function createSignature(secret, ts, method, path) {
  const data = ts + method.toUpperCase() + path;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function httpsRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) reject(parsed);
          else resolve(parsed);
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.end(); // no body
  });
}

async function generateAccessToken(userId, levelName, ttlInSecs = 600) {
  const ts = Math.floor(Date.now() / 1000).toString();
  const path = `/resources/accessTokens?userId=${encodeURIComponent(userId)}&levelName=${encodeURIComponent(levelName)}&ttlInSecs=${ttlInSecs}`;

  const signature = createSignature(SUMSUB_SECRET_KEY, ts, 'POST', path);

  return httpsRequest({
    hostname: 'api.sumsub.com',
    path,
    method: 'POST',
    headers: {
      'X-App-Token': SUMSUB_APP_TOKEN,
      'X-App-Access-Sig': signature,
      'X-App-Access-Ts': ts,
    },
  });
}

module.exports = { generateAccessToken };
