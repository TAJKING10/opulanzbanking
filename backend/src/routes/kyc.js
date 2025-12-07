const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const documentGenerator = require('../services/document-generator');
const { convertDocumentsToPDF } = require('../services/pdf-converter');
const azureStorage = require('../services/azureStorage');
const docusign = require('../services/docusign');

/**
 * Map KYC form data to document template format
 */
function mapKYCDataToTemplateFormat(kycData) {
  const isIndividual = kycData.clientType === 'PP';
  const isCompany = kycData.clientType === 'PM';

  // Extract holder/representative data
  const holder1 = kycData.holders?.holder1 || {};
  const representative = kycData.representatives?.[0] || {};
  const company = kycData.company || {};

  const clientInfo = isIndividual ? holder1 : representative;

  return {
    client_type: kycData.clientType,

    // Client information
    client: {
      id: kycData.applicationId || Date.now(),
      full_name: isIndividual
        ? `${holder1.title || ''} ${holder1.firstName || ''} ${holder1.lastName || ''}`.trim()
        : company.legalName || '',
      first_name: clientInfo.firstName || '',
      last_name: clientInfo.lastName || '',
      email: kycData.basicContact?.email || clientInfo.email || '',
      phone: kycData.basicContact?.mobile || clientInfo.mobile || '',
      address: holder1.address?.line1 || company.registeredAddress?.line1 || '',
      city: holder1.address?.city || company.registeredAddress?.city || '',
      postal_code: holder1.address?.postalCode || company.registeredAddress?.postalCode || '',
      country: holder1.address?.country || company.registeredAddress?.country || '',
      birthdate: holder1.dateOfBirth || '',
      nationality: holder1.nationality || '',
      place_of_birth: holder1.placeOfBirth || '',
    },

    // Company data (for PM)
    company: isCompany ? {
      name: company.legalName || '',
      trading_name: company.tradingName || '',
      legal_form: company.legalForm || '',
      rcs_number: company.registrationNumber || '',
      sector: company.sector || '',
      address: company.registeredAddress?.line1 || '',
      city: company.registeredAddress?.city || '',
      country: company.registeredAddress?.country || '',
      regulated_activity: false,
      regulator: '',
    } : null,

    // Representative (for PM)
    representative: isCompany ? {
      name: `${representative.title || ''} ${representative.firstName || ''} ${representative.lastName || ''}`.trim(),
      position: representative.position || '',
      email: representative.email || '',
      phone: representative.mobile || '',
    } : null,

    // Family situation (for PP)
    family: {
      marital_status: holder1.maritalStatus || '',
      marriage_date: '',
      children: [],
    },

    // Financial profile
    financial_profile: {
      income_range: kycData.financialSituation?.annualIncome || '',
      patrimony_range: kycData.financialSituation?.totalAssets || '',
      revenue: kycData.financialSituation?.annualRevenue || '',
      balance_sheet_total: kycData.financialSituation?.totalAssets || '',
      equity: kycData.financialSituation?.liquidAssets || '',
      debt_ratio: kycData.financialSituation?.outstandingDebts || '',
      origin_of_funds: kycData.originOfFunds?.primary || '',
      bank_name: '',
      assets: {
        cash: kycData.financialSituation?.liquidAssets || 0,
        financial: kycData.financialSituation?.liquidAssets || 0,
        real_estate: kycData.financialSituation?.realEstateValue || 0,
        professional: 0,
      },
      source_of_revenue: kycData.financialSituation?.incomeSource || '',
    },

    // Investment profile
    risk_profile: {
      category: kycData.investmentProfile?.riskTolerance || 'Équilibré',
      score: 0,
      max_drawdown_accepted: kycData.investmentProfile?.maxLossAcceptable || 0,
      horizon_years: kycData.investmentProfile?.investmentHorizon === 'short' ? 3 :
                     kycData.investmentProfile?.investmentHorizon === 'medium' ? 7 : 10,
    },

    // Knowledge & experience
    knowledge_experience: {
      stocks: kycData.investmentProfile?.experience !== 'beginner',
      bonds: kycData.investmentProfile?.experience === 'experienced',
      funds: true,
      derivatives: kycData.investmentProfile?.experience === 'experienced',
    },

    // Objectives
    objectives: {
      preservation: kycData.investmentProfile?.objective === 'capital_preservation' ? 1 : 3,
      growth: kycData.investmentProfile?.objective === 'growth' ? 1 : 2,
      income: kycData.investmentProfile?.objective === 'income' ? 1 : 4,
      diversification: 2,
      tax_optimization: 3,
      structuration: kycData.missionType === 'advisory',
      protection: true,
      investment_help: true,
      financing: false,
    },

    // Mission type
    mission: {
      diagnostic: true,
      followup: true,
      investment_advice: kycData.missionType === 'advisory',
    },

    // Fees
    fees: {
      study_fee: kycData.initialInvestment || '0',
      followup_rate: '1.5',
    },

    // Preferences
    preferences: {
      email: true,
      mail: false,
      phone: true,
    },

    // Investment plan
    investment_plan: {
      products: [],
    },

    // Follow-up
    followup: {
      frequency: 'semestriellement',
    },

    // Services
    services: {
      rto: false,
    },

    // Account
    account: {
      reference: `OPZ-${Date.now()}`,
    },
  };
}

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
      holders,
      company,
      representatives,
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

    // 2. Map KYC data to template format
    const templateData = mapKYCDataToTemplateFormat(req.body);

    // 3. Generate DOCX documents from templates
    const documents = await documentGenerator.generateOnboardingDocuments(templateData);
    console.log(`✅ Generated ${documents.length} DOCX documents from templates`);

    // Note: DocuSign accepts DOCX files directly - no PDF conversion needed!

    // 4. Upload documents to Azure Blob Storage
    const uploadedDocuments = [];

    for (const doc of documents) {
      try {
        const uploadResult = await azureStorage.uploadDocument(
          doc.buffer,
          doc.filename,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
            'regulatory_document',
            doc.filename,
            uploadResult.url,
            uploadResult.blobName,
            'generated'
          ]
        );

        uploadedDocuments.push({
          id: docResult.rows[0].id,
          name: doc.filename,
          url: uploadResult.url,
          buffer: doc.buffer
        });

        console.log(`✅ Uploaded ${doc.filename} to Azure Blob Storage`);
      } catch (error) {
        console.error(`Error uploading ${doc.filename}:`, error.message);
      }
    }

    // 4. Send to DocuSign (if configured)
    if (docusign.isConfigured && uploadedDocuments.length > 0) {
      try {
        const signerEmail = basicContact.email || basicContact?.email;
        const signerName = clientType === 'PP'
          ? `${holders?.holder1?.firstName || ''} ${holders?.holder1?.lastName || ''}`.trim() || 'Client'
          : company?.legalName || representatives?.[0]?.firstName + ' ' + representatives?.[0]?.lastName || 'Client';

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
