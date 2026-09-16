/**
 * Embedded DocuSign for the investment QCC flow.
 * The Capacitor APK has no Next.js API routes, so it posts here
 * (same contract as app/api/docusign/sign and /download).
 */

const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

function getEnv() {
  const raw = process.env.DOCUSIGN_PRIVATE_KEY || '';
  return {
    CLIENT_ID: process.env.DOCUSIGN_CLIENT_ID || process.env.DOCUSIGN_INTEGRATION_KEY || '',
    USER_ID: process.env.DOCUSIGN_USER_ID || '',
    ACCOUNT_ID: process.env.DOCUSIGN_ACCOUNT_ID || '',
    BASE_URI: (process.env.DOCUSIGN_BASE_URI || 'https://demo.docusign.net').replace(/\/restapi\/?$/, ''),
    AUTH_SERVER: process.env.DOCUSIGN_AUTH_SERVER || 'account-d.docusign.com',
    PRIVATE_KEY: raw.replace(/\\n/g, '\n'),
  };
}

async function getAccessToken() {
  const { CLIENT_ID, USER_ID, AUTH_SERVER, PRIVATE_KEY } = getEnv();
  if (!CLIENT_ID || !USER_ID || !PRIVATE_KEY) {
    throw new Error('DocuSign is not configured on the server');
  }
  const now = Math.floor(Date.now() / 1000);
  const jwtToken = jwt.sign(
    {
      iss: CLIENT_ID,
      sub: USER_ID,
      aud: AUTH_SERVER,
      iat: now,
      exp: now + 3600,
      scope: 'signature impersonation',
    },
    PRIVATE_KEY,
    { algorithm: 'RS256' }
  );

  const resp = await fetch(`https://${AUTH_SERVER}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`,
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`AUTH_FAILED:${body}`);
  }

  const data = await resp.json();
  return data.access_token;
}

router.post('/sign', async (req, res) => {
  try {
    const {
      pdfBase64,
      clientName,
      clientEmail,
      returnUrl,
      pdfPageCount = 1,
      locale = 'en',
    } = req.body || {};

    if (!pdfBase64 || !clientName) {
      return res.status(400).json({ success: false, error: 'pdfBase64 and clientName are required' });
    }

    const lastPage = String(pdfPageCount || 1);
    const { CLIENT_ID, ACCOUNT_ID, BASE_URI, AUTH_SERVER } = getEnv();

    let accessToken;
    try {
      accessToken = await getAccessToken();
    } catch (err) {
      const msg = String(err.message || err);
      if (msg.includes('consent_required')) {
        const appOrigin = process.env.FRONTEND_URL || 'https://www.opulanz.com';
        const consentUrl =
          `https://${AUTH_SERVER}/oauth/auth?response_type=code` +
          `&scope=signature%20impersonation` +
          `&client_id=${CLIENT_ID}` +
          `&redirect_uri=${encodeURIComponent(`${appOrigin}/api/docusign/callback`)}`;
        return res.status(401).json({ success: false, error: 'consent_required', consentUrl });
      }
      throw err;
    }

    const apiBase = `${BASE_URI}/restapi/v2.1/accounts/${ACCOUNT_ID}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const envelopeResp = await fetch(`${apiBase}/envelopes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        emailSubject: `Questionnaire QCC — ${clientName} — Opulanz Banking`,
        status: 'sent',
        documents: [
          {
            documentBase64: pdfBase64,
            name: `QCC-${clientName}.pdf`,
            fileExtension: 'pdf',
            documentId: '1',
          },
        ],
        recipients: {
          signers: [
            {
              email: clientEmail || 'client@opulanz.com',
              name: clientName,
              recipientId: '1',
              clientUserId: '1001',
              routingOrder: '1',
              tabs: {
                signHereTabs: [
                  {
                    anchorString: 'Lu et approuv',
                    anchorUnits: 'pixels',
                    anchorXOffset: '10',
                    anchorYOffset: '20',
                    anchorIgnoreIfNotPresent: 'true',
                    scaleValue: '0.8',
                  },
                  {
                    anchorString: 'Read and approved',
                    anchorUnits: 'pixels',
                    anchorXOffset: '10',
                    anchorYOffset: '20',
                    anchorIgnoreIfNotPresent: 'true',
                    scaleValue: '0.8',
                  },
                  {
                    documentId: '1',
                    pageNumber: lastPage,
                    xPosition: '60',
                    yPosition: '680',
                    scaleValue: '0.8',
                  },
                ],
                dateSignedTabs: [
                  {
                    anchorString: 'Lu et approuv',
                    anchorUnits: 'pixels',
                    anchorXOffset: '300',
                    anchorYOffset: '30',
                    anchorIgnoreIfNotPresent: 'true',
                  },
                  {
                    anchorString: 'Read and approved',
                    anchorUnits: 'pixels',
                    anchorXOffset: '280',
                    anchorYOffset: '25',
                    anchorIgnoreIfNotPresent: 'true',
                  },
                ],
              },
            },
          ],
        },
      }),
    });

    if (!envelopeResp.ok) {
      const err = await envelopeResp.text();
      throw new Error(`Envelope creation failed: ${err}`);
    }

    const envelopeData = await envelopeResp.json();
    const envelopeId = envelopeData.envelopeId;

    const publicReturn =
      returnUrl && !/localhost|127\.0\.0\.1/i.test(returnUrl)
        ? returnUrl
        : `${process.env.FRONTEND_URL || 'https://www.opulanz.com'}/api/docusign/return`;

    const viewResp = await fetch(`${apiBase}/envelopes/${envelopeId}/views/recipient`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        returnUrl: publicReturn,
        authenticationMethod: 'none',
        email: clientEmail || 'client@opulanz.com',
        userName: clientName,
        recipientId: '1',
        clientUserId: '1001',
      }),
    });

    if (!viewResp.ok) {
      const err = await viewResp.text();
      throw new Error(`Recipient view failed: ${err}`);
    }

    const viewData = await viewResp.json();
    return res.json({
      success: true,
      signingUrl: viewData.url,
      envelopeId,
    });
  } catch (err) {
    console.error('[docusign/sign]', err);
    return res.status(500).json({ success: false, error: String(err.message || err) });
  }
});

router.post('/download', async (req, res) => {
  try {
    const { envelopeId } = req.body || {};
    if (!envelopeId) {
      return res.status(400).json({ success: false, error: 'envelopeId required' });
    }

    const { ACCOUNT_ID, BASE_URI } = getEnv();
    const accessToken = await getAccessToken();
    const apiBase = `${BASE_URI}/restapi/v2.1/accounts/${ACCOUNT_ID}`;

    const docResp = await fetch(`${apiBase}/envelopes/${envelopeId}/documents/combined`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/pdf',
      },
    });

    if (!docResp.ok) {
      throw new Error(`DocuSign download failed (${docResp.status}): ${await docResp.text()}`);
    }

    const bytes = Buffer.from(await docResp.arrayBuffer());
    return res.json({ success: true, pdfBase64: bytes.toString('base64') });
  } catch (err) {
    console.error('[docusign/download]', err);
    return res.status(500).json({ success: false, error: String(err.message || err) });
  }
});

module.exports = router;
