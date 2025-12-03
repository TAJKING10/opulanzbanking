/**
 * DocuSign Integration Service
 * Handles electronic signature workflow for client onboarding documents
 */

const docusign = require('docusign-esign');
const fs = require('fs').promises;
const path = require('path');

// DocuSign Configuration
const DOCUSIGN_CONFIG = {
  integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY,
  userId: process.env.DOCUSIGN_USER_ID,
  accountId: process.env.DOCUSIGN_ACCOUNT_ID,
  privateKey: process.env.DOCUSIGN_PRIVATE_KEY_PATH,
  oAuthBasePath: process.env.DOCUSIGN_OAUTH_BASE_PATH || 'account-d.docusign.com',
  basePath: process.env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi',
  redirectUrl: process.env.DOCUSIGN_REDIRECT_URL || 'http://localhost:3000/signature-complete',
};

/**
 * Get DocuSign API Client with JWT authentication
 */
async function getDocuSignClient() {
  try {
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath(DOCUSIGN_CONFIG.basePath);

    // Read private key
    const privateKeyPath = path.resolve(DOCUSIGN_CONFIG.privateKey);
    const privateKey = await fs.readFile(privateKeyPath, 'utf8');

    // Get JWT token
    const results = await apiClient.requestJWTUserToken(
      DOCUSIGN_CONFIG.integrationKey,
      DOCUSIGN_CONFIG.userId,
      ['signature', 'impersonation'],
      privateKey,
      3600 // 1 hour
    );

    // Set access token
    apiClient.addDefaultHeader('Authorization', `Bearer ${results.body.access_token}`);

    return apiClient;
  } catch (error) {
    console.error('❌ Error authenticating with DocuSign:', error);
    throw error;
  }
}

/**
 * Create envelope definition with documents and recipients
 */
async function createEnvelopeDefinition(documents, client, advisor) {
  const envelope = new docusign.EnvelopeDefinition();
  envelope.emailSubject = `Opulanz Banking - Documents à signer pour ${client.full_name}`;
  envelope.status = 'sent'; // Send immediately

  // Add documents
  envelope.documents = await Promise.all(
    documents.map(async (doc, index) => {
      const docDef = new docusign.Document();
      docDef.documentId = String(index + 1);
      docDef.name = doc.templateName;
      docDef.fileExtension = 'pdf';

      // Read file and convert to base64
      const fileBuffer = await fs.readFile(doc.path);
      docDef.documentBase64 = fileBuffer.toString('base64');

      return docDef;
    })
  );

  // Create recipients
  const signer1 = new docusign.Signer();
  signer1.email = client.email;
  signer1.name = client.full_name;
  signer1.recipientId = '1';
  signer1.routingOrder = '1';
  signer1.clientUserId = client.id; // For embedded signing

  // Add signature tabs for each document
  signer1.tabs = createSignatureTabs(documents.length);

  // Advisor signer (optional)
  const signers = [signer1];

  if (advisor) {
    const signer2 = new docusign.Signer();
    signer2.email = advisor.email;
    signer2.name = advisor.name;
    signer2.recipientId = '2';
    signer2.routingOrder = '2';
    signer2.tabs = createSignatureTabs(documents.length);
    signers.push(signer2);
  }

  envelope.recipients = new docusign.Recipients();
  envelope.recipients.signers = signers;

  return envelope;
}

/**
 * Create signature tabs for documents
 */
function createSignatureTabs(documentCount) {
  const tabs = new docusign.Tabs();
  tabs.signHereTabs = [];
  tabs.dateSignedTabs = [];

  for (let docId = 1; docId <= documentCount; docId++) {
    // Signature tab
    const signHere = new docusign.SignHere();
    signHere.documentId = String(docId);
    signHere.pageNumber = '1'; // Last page usually
    signHere.xPosition = '100';
    signHere.yPosition = '600';
    tabs.signHereTabs.push(signHere);

    // Date signed tab
    const dateSigned = new docusign.DateSigned();
    dateSigned.documentId = String(docId);
    dateSigned.pageNumber = '1';
    dateSigned.xPosition = '100';
    dateSigned.yPosition = '650';
    tabs.dateSignedTabs.push(dateSigned);
  }

  return tabs;
}

/**
 * Send envelope and get signing URL
 */
async function sendEnvelopeForSigning(documents, client, advisor = null) {
  try {
    console.log(`📤 Sending DocuSign envelope for ${client.full_name}...`);

    // Get authenticated client
    const apiClient = await getDocuSignClient();
    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    // Create envelope
    const envelopeDefinition = await createEnvelopeDefinition(documents, client, advisor);

    // Send envelope
    const results = await envelopesApi.createEnvelope(
      DOCUSIGN_CONFIG.accountId,
      { envelopeDefinition }
    );

    const envelopeId = results.envelopeId;
    console.log(`✅ Envelope created: ${envelopeId}`);

    // Get recipient view (embedded signing URL)
    const viewRequest = new docusign.RecipientViewRequest();
    viewRequest.returnUrl = `${DOCUSIGN_CONFIG.redirectUrl}?envelopeId=${envelopeId}`;
    viewRequest.authenticationMethod = 'none';
    viewRequest.email = client.email;
    viewRequest.userName = client.full_name;
    viewRequest.clientUserId = client.id;

    const recipientView = await envelopesApi.createRecipientView(
      DOCUSIGN_CONFIG.accountId,
      envelopeId,
      { recipientViewRequest: viewRequest }
    );

    return {
      envelopeId,
      signingUrl: recipientView.url,
      status: 'sent',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  } catch (error) {
    console.error('❌ Error sending DocuSign envelope:', error);
    throw error;
  }
}

/**
 * Check envelope status
 */
async function getEnvelopeStatus(envelopeId) {
  try {
    const apiClient = await getDocuSignClient();
    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    const envelope = await envelopesApi.getEnvelope(
      DOCUSIGN_CONFIG.accountId,
      envelopeId
    );

    return {
      envelopeId: envelope.envelopeId,
      status: envelope.status,
      sentDateTime: envelope.sentDateTime,
      statusChangedDateTime: envelope.statusChangedDateTime,
      completedDateTime: envelope.completedDateTime,
    };
  } catch (error) {
    console.error('❌ Error getting envelope status:', error);
    throw error;
  }
}

/**
 * Download signed documents from completed envelope
 */
async function downloadSignedDocuments(envelopeId, clientId) {
  try {
    console.log(`📥 Downloading signed documents for envelope ${envelopeId}...`);

    const apiClient = await getDocuSignClient();
    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    // Get list of documents
    const docsList = await envelopesApi.listDocuments(
      DOCUSIGN_CONFIG.accountId,
      envelopeId
    );

    const signedDocsDir = path.join(__dirname, '../../signed_documents', `client_${clientId}`);
    await fs.mkdir(signedDocsDir, { recursive: true });

    const downloadedDocs = [];

    for (const doc of docsList.envelopeDocuments) {
      if (doc.documentId === 'certificate') continue; // Skip certificate

      // Download document
      const document = await envelopesApi.getDocument(
        DOCUSIGN_CONFIG.accountId,
        envelopeId,
        doc.documentId
      );

      // Save to file
      const filename = `${doc.name}_signed.pdf`;
      const filePath = path.join(signedDocsDir, filename);
      await fs.writeFile(filePath, document);

      downloadedDocs.push({
        documentId: doc.documentId,
        name: doc.name,
        path: filePath,
        filename,
      });

      console.log(`✅ Downloaded: ${filename}`);
    }

    return downloadedDocs;
  } catch (error) {
    console.error('❌ Error downloading signed documents:', error);
    throw error;
  }
}

/**
 * Process DocuSign webhook event
 */
async function processWebhookEvent(event) {
  try {
    const { envelopeId, status, data } = event;

    console.log(`📨 DocuSign webhook: ${envelopeId} - ${status}`);

    switch (status) {
      case 'completed':
        console.log('✅ Envelope completed - downloading signed documents');
        // Download signed documents
        const clientId = data.clientId || extractClientIdFromEnvelope(data);
        const signedDocs = await downloadSignedDocuments(envelopeId, clientId);

        // Update database
        // await updateOnboardingStatus(clientId, 'completed', signedDocs);

        return {
          status: 'success',
          message: 'Signed documents downloaded',
          documents: signedDocs,
        };

      case 'declined':
        console.log('❌ Envelope declined');
        // await updateOnboardingStatus(clientId, 'declined');
        return { status: 'declined', message: 'Client declined to sign' };

      case 'voided':
        console.log('⚠️ Envelope voided');
        // await updateOnboardingStatus(clientId, 'voided');
        return { status: 'voided', message: 'Envelope was voided' };

      default:
        console.log(`ℹ️ Envelope status: ${status}`);
        return { status: 'info', message: `Envelope status: ${status}` };
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    throw error;
  }
}

/**
 * Extract client ID from envelope data
 */
function extractClientIdFromEnvelope(data) {
  // Try to extract from envelope custom fields or recipient info
  return data.customFields?.textCustomFields?.find(f => f.name === 'clientId')?.value || 'unknown';
}

module.exports = {
  getDocuSignClient,
  sendEnvelopeForSigning,
  getEnvelopeStatus,
  downloadSignedDocuments,
  processWebhookEvent,
  DOCUSIGN_CONFIG,
};
