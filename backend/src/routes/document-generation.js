/**
 * Document Generation API Routes
 * Handles automated document generation from templates and DocuSign integration
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const {
  generateOnboardingDocuments,
  saveDocumentsToTemp,
} = require('../services/document-generator');
const {
  sendEnvelopeForSigning,
  getEnvelopeStatus,
  downloadSignedDocuments,
  processWebhookEvent,
} = require('../services/docusign');
const { convertDocumentsToPDF } = require('../services/pdf-converter');

/**
 * POST /api/document-generation/generate
 * Generate onboarding documents from templates
 */
router.post('/generate', async (req, res) => {
  try {
    const { clientData } = req.body;

    if (!clientData || !clientData.client || !clientData.client.id) {
      return res.status(400).json({
        success: false,
        error: 'Client data with client.id is required',
      });
    }

    console.log(`📄 Generating documents for client ${clientData.client.id}...`);

    // Generate DOCX documents from templates
    const documents = await generateOnboardingDocuments(clientData);

    // Save to temp directory
    const savedDocs = await saveDocumentsToTemp(documents, clientData.client.id);

    // Store generation record in database
    const result = await pool.query(
      `INSERT INTO document_generations
       (client_id, client_type, documents_generated, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        clientData.client.id,
        clientData.client_type || 'PP',
        JSON.stringify(savedDocs),
        'generated',
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Documents generated successfully',
      generation: result.rows[0],
      documents: savedDocs,
    });
  } catch (error) {
    console.error('❌ Error generating documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate documents',
      details: error.message,
    });
  }
});

/**
 * POST /api/document-generation/send-for-signing
 * Convert documents to PDF and send to DocuSign for signing
 */
router.post('/send-for-signing', async (req, res) => {
  try {
    const { generationId, clientData, advisorData } = req.body;

    if (!generationId) {
      return res.status(400).json({
        success: false,
        error: 'Generation ID is required',
      });
    }

    console.log(`📤 Sending documents for signing (Generation ${generationId})...`);

    // Get generated documents from database
    const genResult = await pool.query(
      'SELECT * FROM document_generations WHERE id = $1',
      [generationId]
    );

    if (genResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document generation not found',
      });
    }

    const generation = genResult.rows[0];
    const documents = generation.documents_generated;

    // Convert DOCX to PDF
    console.log('📄 Converting documents to PDF...');
    const pdfDocuments = await convertDocumentsToPDF(documents);

    // Send to DocuSign
    console.log('📧 Sending to DocuSign...');
    const envelopeData = await sendEnvelopeForSigning(
      pdfDocuments,
      clientData || {
        id: generation.client_id,
        full_name: clientData?.full_name || 'Client',
        email: clientData?.email || 'client@example.com',
      },
      advisorData
    );

    // Update database with envelope info
    await pool.query(
      `UPDATE document_generations
       SET envelope_id = $1,
           signing_url = $2,
           envelope_expires_at = $3,
           status = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [
        envelopeData.envelopeId,
        envelopeData.signingUrl,
        envelopeData.expiresAt,
        'sent_for_signing',
        generationId,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Documents sent for signing',
      envelopeId: envelopeData.envelopeId,
      signingUrl: envelopeData.signingUrl,
      expiresAt: envelopeData.expiresAt,
    });
  } catch (error) {
    console.error('❌ Error sending for signing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send documents for signing',
      details: error.message,
    });
  }
});

/**
 * GET /api/document-generation/status/:generationId
 * Check status of document generation and signing
 */
router.get('/status/:generationId', async (req, res) => {
  try {
    const { generationId } = req.params;

    // Get generation from database
    const result = await pool.query(
      'SELECT * FROM document_generations WHERE id = $1',
      [generationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document generation not found',
      });
    }

    const generation = result.rows[0];

    // If envelope exists, check DocuSign status
    let envelopeStatus = null;
    if (generation.envelope_id) {
      try {
        envelopeStatus = await getEnvelopeStatus(generation.envelope_id);
      } catch (error) {
        console.warn('Could not fetch envelope status:', error.message);
      }
    }

    res.status(200).json({
      success: true,
      generation: {
        id: generation.id,
        clientId: generation.client_id,
        clientType: generation.client_type,
        status: generation.status,
        documentsGenerated: generation.documents_generated,
        envelopeId: generation.envelope_id,
        signingUrl: generation.signing_url,
        envelopeExpiresAt: generation.envelope_expires_at,
        signedDocuments: generation.signed_documents,
        createdAt: generation.created_at,
        updatedAt: generation.updated_at,
      },
      envelopeStatus,
    });
  } catch (error) {
    console.error('❌ Error getting status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document status',
      details: error.message,
    });
  }
});

/**
 * GET /api/document-generation/signed/:clientId
 * Get all signed documents for a client
 */
router.get('/signed/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const result = await pool.query(
      `SELECT * FROM document_generations
       WHERE client_id = $1 AND status = 'completed'
       ORDER BY created_at DESC`,
      [clientId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      documents: result.rows,
    });
  } catch (error) {
    console.error('❌ Error getting signed documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get signed documents',
      details: error.message,
    });
  }
});

/**
 * POST /api/document-generation/docusign-webhook
 * Handle DocuSign webhook events
 */
router.post('/docusign-webhook', async (req, res) => {
  try {
    const event = req.body;

    console.log('📨 Received DocuSign webhook:', event);

    // Process webhook event
    const result = await processWebhookEvent(event);

    // If completed, download signed documents and update database
    if (result.status === 'success' && result.documents) {
      const envelopeId = event.envelopeId;

      // Find generation by envelope ID
      const genResult = await pool.query(
        'SELECT * FROM document_generations WHERE envelope_id = $1',
        [envelopeId]
      );

      if (genResult.rows.length > 0) {
        const generation = genResult.rows[0];

        // Download signed documents
        const signedDocs = await downloadSignedDocuments(
          envelopeId,
          generation.client_id
        );

        // Update database
        await pool.query(
          `UPDATE document_generations
           SET signed_documents = $1,
               status = $2,
               updated_at = CURRENT_TIMESTAMP
           WHERE envelope_id = $3`,
          [JSON.stringify(signedDocs), 'completed', envelopeId]
        );

        console.log(`✅ Updated generation ${generation.id} with signed documents`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed',
      result,
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
      details: error.message,
    });
  }
});

/**
 * POST /api/document-generation/complete-onboarding
 * Complete end-to-end onboarding: generate, convert, and send for signing
 */
router.post('/complete-onboarding', async (req, res) => {
  try {
    const { clientData, advisorData } = req.body;

    if (!clientData || !clientData.client || !clientData.client.id) {
      return res.status(400).json({
        success: false,
        error: 'Client data with client.id is required',
      });
    }

    console.log(`🚀 Starting complete onboarding for client ${clientData.client.id}...`);

    // Step 1: Generate documents
    console.log('📄 Step 1: Generating documents...');
    const documents = await generateOnboardingDocuments(clientData);
    const savedDocs = await saveDocumentsToTemp(documents, clientData.client.id);

    // Step 2: Store in database
    console.log('💾 Step 2: Storing in database...');
    const genResult = await pool.query(
      `INSERT INTO document_generations
       (client_id, client_type, documents_generated, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        clientData.client.id,
        clientData.client_type || 'PP',
        JSON.stringify(savedDocs),
        'generated',
      ]
    );

    const generation = genResult.rows[0];

    // Step 3: Convert to PDF
    console.log('📄 Step 3: Converting to PDF...');
    const pdfDocuments = await convertDocumentsToPDF(savedDocs);

    // Step 4: Send to DocuSign
    console.log('📧 Step 4: Sending to DocuSign...');
    const envelopeData = await sendEnvelopeForSigning(
      pdfDocuments,
      {
        id: clientData.client.id,
        full_name: clientData.client.full_name,
        email: clientData.client.email,
      },
      advisorData
    );

    // Step 5: Update database
    console.log('💾 Step 5: Updating database...');
    await pool.query(
      `UPDATE document_generations
       SET envelope_id = $1,
           signing_url = $2,
           envelope_expires_at = $3,
           status = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [
        envelopeData.envelopeId,
        envelopeData.signingUrl,
        envelopeData.expiresAt,
        'sent_for_signing',
        generation.id,
      ]
    );

    console.log('✅ Complete onboarding workflow finished successfully!');

    res.status(201).json({
      success: true,
      message: 'Complete onboarding workflow completed',
      generationId: generation.id,
      envelopeId: envelopeData.envelopeId,
      signingUrl: envelopeData.signingUrl,
      expiresAt: envelopeData.expiresAt,
      documents: pdfDocuments.map((d) => ({
        filename: d.filename,
        templateName: d.templateName,
      })),
    });
  } catch (error) {
    console.error('❌ Error in complete onboarding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete onboarding workflow',
      details: error.message,
    });
  }
});

module.exports = router;
