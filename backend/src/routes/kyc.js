const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const pdfGenerator = require('../services/pdfGenerator');
const azureStorage = require('../services/azureStorage');
const docusign = require('../services/docusign');

/**
 * POST /api/kyc/submit
 * Submit KYC application data and generate documents
 */
router.post('/submit', async (req, res) => {
  const connection = await pool.connect();

  try {
    await connection.query('BEGIN');

    const {
      clientType,
      basicContact,
      identityData,
      companyData,
      preferredLanguage
    } = req.body;

    // Validate required fields
    if (!clientType || !basicContact) {
      return res.status(400).json({
        error: 'Missing required fields: clientType and basicContact are required'
      });
    }

    // 1. Save application to database
    const applicationResult = await connection.query(
      `INSERT INTO applications (type, status, payload, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id`,
      [
        clientType === 'PP' ? 'individual' : 'company',
        'submitted',
        JSON.stringify(req.body)
      ]
    );

    const applicationId = applicationResult.rows[0].id;
    console.log(`✅ Application ${applicationId} saved to database`);

    // 2. Generate PDF documents
    const kycData = {
      clientType,
      basicContact,
      identityData,
      companyData,
      preferredLanguage
    };

    const documents = await pdfGenerator.generateAllDocuments(kycData);
    console.log(`✅ Generated ${documents.length} PDF documents`);

    // 3. Upload documents to Azure Blob Storage
    const uploadedDocuments = [];

    for (const doc of documents) {
      try {
        const uploadResult = await azureStorage.uploadDocument(
          doc.buffer,
          doc.name,
          'application/pdf'
        );

        // Save document record to database
        const docResult = await connection.query(
          `INSERT INTO documents (
            application_id,
            type,
            file_name,
            file_url,
            blob_name,
            status,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
          RETURNING id`,
          [
            applicationId,
            doc.type,
            doc.name,
            uploadResult.url,
            uploadResult.blobName,
            'generated'
          ]
        );

        uploadedDocuments.push({
          id: docResult.rows[0].id,
          type: doc.type,
          name: doc.name,
          url: uploadResult.url,
          buffer: doc.buffer
        });

        console.log(`✅ Uploaded ${doc.name} to Azure Blob Storage`);
      } catch (error) {
        console.error(`Error uploading ${doc.name}:`, error.message);
      }
    }

    // 4. Send to DocuSign (if configured)
    if (docusign.isConfigured && uploadedDocuments.length > 0) {
      try {
        const signerEmail = basicContact.email;
        const signerName = clientType === 'PP'
          ? `${identityData.firstName} ${identityData.lastName}`
          : companyData.companyName;

        const envelopeResult = await docusign.sendEnvelopeForSignature({
          documents: uploadedDocuments,
          signer: {
            email: signerEmail,
            name: signerName
          },
          emailSubject: 'OPULANZ BANKING - Documents à signer / Documents to sign',
          emailBody: 'Veuillez signer les documents joints / Please sign the attached documents',
          callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/kyc/docusign-webhook`
        });

        // Update documents with DocuSign envelope ID
        for (const doc of uploadedDocuments) {
          await connection.query(
            `UPDATE documents
             SET docusign_envelope_id = $1,
                 docusign_status = $2,
                 sent_for_signature_at = NOW(),
                 status = 'pending_signature'
             WHERE id = $3`,
            [envelopeResult.envelopeId, envelopeResult.status, doc.id]
          );
        }

        console.log(`✅ Documents sent to DocuSign: ${envelopeResult.envelopeId}`);

        await connection.query('COMMIT');

        return res.status(201).json({
          success: true,
          applicationId,
          envelopeId: envelopeResult.envelopeId,
          message: 'Application submitted successfully. Signature request sent via email.',
          documents: uploadedDocuments.map(doc => ({
            id: doc.id,
            type: doc.type,
            name: doc.name
          }))
        });
      } catch (docusignError) {
        console.error('DocuSign error:', docusignError.message);

        // Still commit if DocuSign fails - documents are saved
        await connection.query('COMMIT');

        return res.status(201).json({
          success: true,
          applicationId,
          warning: 'Application submitted but signature request failed. Documents saved.',
          documents: uploadedDocuments.map(doc => ({
            id: doc.id,
            type: doc.type,
            name: doc.name,
            url: doc.url
          }))
        });
      }
    } else {
      // No DocuSign configured - just return success
      await connection.query('COMMIT');

      return res.status(201).json({
        success: true,
        applicationId,
        message: 'Application submitted successfully. Documents generated and saved.',
        documents: uploadedDocuments.map(doc => ({
          id: doc.id,
          type: doc.type,
          name: doc.name,
          url: doc.url
        }))
      });
    }
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Error submitting KYC application:', error);

    return res.status(500).json({
      error: 'Failed to submit application',
      details: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/kyc/docusign-webhook
 * Handle DocuSign webhook callbacks
 */
router.post('/docusign-webhook', async (req, res) => {
  try {
    const { event, envelopeId, status } = req.body;

    console.log(`📥 DocuSign webhook: ${event} - Envelope ${envelopeId} - Status: ${status}`);

    if (status === 'completed') {
      // Download signed documents
      const signedPdf = await docusign.downloadEnvelopeDocuments(envelopeId);

      // Upload signed document to Azure
      const uploadResult = await azureStorage.uploadDocument(
        signedPdf,
        `signed_${envelopeId}_${Date.now()}.pdf`,
        'application/pdf'
      );

      // Update database
      await pool.query(
        `UPDATE documents
         SET docusign_status = $1,
             signed_document_url = $2,
             signed_at = NOW(),
             status = 'signed'
         WHERE docusign_envelope_id = $3`,
        ['completed', uploadResult.url, envelopeId]
      );

      console.log(`✅ Signed document saved for envelope ${envelopeId}`);
    } else {
      // Update status for other events (declined, voided, etc.)
      await pool.query(
        `UPDATE documents
         SET docusign_status = $1
         WHERE docusign_envelope_id = $2`,
        [status, envelopeId]
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling DocuSign webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * GET /api/kyc/application/:id
 * Get application status and documents
 */
router.get('/application/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const appResult = await pool.query(
      'SELECT * FROM applications WHERE id = $1',
      [id]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const docsResult = await pool.query(
      'SELECT id, type, file_name, status, docusign_status, created_at, signed_at FROM documents WHERE application_id = $1',
      [id]
    );

    res.json({
      application: appResult.rows[0],
      documents: docsResult.rows
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

module.exports = router;
