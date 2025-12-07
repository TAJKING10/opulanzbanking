const docusign = require('docusign-esign');
const fs = require('fs');
const path = require('path');

class DocuSignService {
  constructor() {
    this.integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
    this.userId = process.env.DOCUSIGN_USER_ID;
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID;
    this.privateKeyPath = process.env.DOCUSIGN_PRIVATE_KEY_PATH;
    this.basePath = process.env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi';
    this.authServer = process.env.DOCUSIGN_AUTH_SERVER || 'account-d.docusign.com';

    if (!this.integrationKey || this.integrationKey.includes('YOUR_')) {
      console.warn('⚠️  DocuSign not configured. Electronic signature features will be disabled.');
      this.isConfigured = false;
      return;
    }

    this.isConfigured = true;
    this.apiClient = new docusign.ApiClient();
    this.apiClient.setBasePath(this.basePath);
  }

  async getAccessToken() {
    if (!this.isConfigured) {
      throw new Error('DocuSign is not configured');
    }

    try {
      if (!fs.existsSync(this.privateKeyPath)) {
        throw new Error(`DocuSign private key not found at: ${this.privateKeyPath}`);
      }

      const privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');
      const scopes = ['signature', 'impersonation'];

      const results = await this.apiClient.requestJWTUserToken(
        this.integrationKey,
        this.userId,
        scopes,
        privateKey,
        3600
      );

      return results.body.access_token;
    } catch (error) {
      console.error('DocuSign JWT authentication error:', error.message);
      throw error;
    }
  }

  async initializeClient() {
    const accessToken = await this.getAccessToken();
    this.apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
  }

  async sendEnvelopeForSignature({ documents, signer, emailSubject, emailBody, callbackUrl }) {
    if (!this.isConfigured) {
      throw new Error('DocuSign is not configured');
    }

    await this.initializeClient();
    const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
    const envelope = new docusign.EnvelopeDefinition();
    
    envelope.emailSubject = emailSubject || 'Please sign these documents';
    envelope.emailBlurb = emailBody || 'Please review and sign the attached documents';

    envelope.documents = documents.map((doc, index) => {
      const document = new docusign.Document();
      document.documentBase64 = doc.buffer.toString('base64');
      document.name = doc.name;
      // Extract file extension from filename (supports both .pdf and .docx)
      const fileExt = doc.name.split('.').pop() || 'docx';
      document.fileExtension = fileExt;
      document.documentId = String(index + 1);
      return document;
    });

    const docuSigner = docusign.Signer.constructFromObject({
      email: signer.email,
      name: signer.name,
      recipientId: '1',
      routingOrder: '1'
    });

    const signHere = docusign.SignHere.constructFromObject({
      documentId: '1',
      pageNumber: '1',
      xPosition: '100',
      yPosition: '700'
    });

    docuSigner.tabs = docusign.Tabs.constructFromObject({
      signHereTabs: [signHere]
    });

    envelope.recipients = docusign.Recipients.constructFromObject({
      signers: [docuSigner]
    });

    envelope.status = 'sent';

    if (callbackUrl) {
      envelope.eventNotification = docusign.EventNotification.constructFromObject({
        url: callbackUrl,
        loggingEnabled: 'true',
        requireAcknowledgment: 'true',
        envelopeEvents: [
          { envelopeEventStatusCode: 'completed' },
          { envelopeEventStatusCode: 'declined' },
          { envelopeEventStatusCode: 'voided' }
        ]
      });
    }

    try {
      const results = await envelopesApi.createEnvelope(this.accountId, {
        envelopeDefinition: envelope
      });

      console.log(`✅ DocuSign envelope sent: ${results.envelopeId}`);
      return {
        envelopeId: results.envelopeId,
        status: results.status,
        statusDateTime: results.statusDateTime
      };
    } catch (error) {
      console.error('Error creating DocuSign envelope:', error);
      throw new Error(`Failed to send envelope: ${error.message}`);
    }
  }

  async getEnvelopeStatus(envelopeId) {
    await this.initializeClient();
    const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
    const results = await envelopesApi.getEnvelope(this.accountId, envelopeId);
    return {
      status: results.status,
      statusDateTime: results.statusDateTime,
      completedDateTime: results.completedDateTime
    };
  }

  async downloadEnvelopeDocuments(envelopeId) {
    await this.initializeClient();
    const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
    const results = await envelopesApi.getDocument(this.accountId, envelopeId, 'combined');
    return Buffer.from(results, 'binary');
  }
}

module.exports = new DocuSignService();
