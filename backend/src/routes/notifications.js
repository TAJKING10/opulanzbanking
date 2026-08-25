/**
 * Email Notification Routes
 * Handles sending email notifications for appointments and contact form
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const emailService = require('../services/emailService');
const tempFileStore = require('../services/tempFileStore');
const azureStorage = require('../services/azureStorage');
const { pool } = require('../config/db');

// Auto-create support_contacts table
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_contacts (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'replied', 'closed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_support_contacts_email ON support_contacts(email);
      CREATE INDEX IF NOT EXISTS idx_support_contacts_status ON support_contacts(status);
    `);
    console.log('support_contacts table ready');
  } catch (err) {
    console.error('support_contacts table init error:', err.message);
  }
})();

// Rate limit for public contact form: 5 requests per IP per 15 minutes
const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many messages sent. Please try again in 15 minutes.' },
});

/**
 * Build a Nodemailer attachments array from an array of tempIds.
 * Missing / expired entries are silently skipped.
 * @param {string[]} tempIds
 * @returns {{ filename: string, content: Buffer, contentType: string }[]}
 */
function buildAttachments(tempIds = []) {
  const attachments = [];
  for (const tempId of tempIds) {
    const entry = tempFileStore.get(tempId);
    if (entry) {
      attachments.push({
        filename: entry.originalname,
        content: entry.buffer,
        contentType: entry.mimetype,
      });
    }
  }
  return attachments;
}

/**
 * Build attachments by downloading blobs from Azure Storage.
 * @param {Array<{ blobName: string, filename?: string, fileName?: string, mimeType?: string }>} azureFiles
 */
async function buildAzureAttachments(azureFiles = []) {
  const attachments = [];
  if (!azureStorage.isConfigured || !Array.isArray(azureFiles)) return attachments;

  for (const file of azureFiles) {
    if (!file?.blobName) continue;
    try {
      const buffer = await azureStorage.downloadDocument(file.blobName);
      attachments.push({
        filename: file.filename || file.fileName || file.blobName.split('/').pop() || 'document',
        content: buffer,
        contentType: file.mimeType || file.type || 'application/octet-stream',
      });
    } catch (err) {
      console.warn(`⚠️  Could not attach Azure blob ${file.blobName}:`, err.message);
    }
  }
  return attachments;
}

/**
 * Clean up temp store entries after they've been attached to an email.
 * @param {string[]} tempIds
 */
function cleanupTempFiles(tempIds = []) {
  tempIds.forEach((id) => tempFileStore.del(id));
}

// Reusable transporter — explicit SMTP to avoid Gmail "calendar invite" issue
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * POST /api/notifications/contact
 * Send support contact form emails (to support team + confirmation to user)
 */
router.post('/contact', contactRateLimit, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const fullName = `${firstName} ${lastName}`;
    const transporter = createTransporter();

    // 1. Email to support team
    await transporter.sendMail({
      from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
      to: 'support@opulanz.com',
      replyTo: email,
      subject: `[Support] ${subject} — ${fullName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
          <div style="background:#b59354;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">OPULANZ BANKING</h1>
            <p style="color:#fff;margin:8px 0 0;opacity:0.9;">New Support Message</p>
          </div>
          <div style="padding:32px;background:#fff;">
            <h2 style="color:#252623;margin-top:0;">Contact Details</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px;"><strong>Name:</strong></td><td style="padding:8px 0;">${fullName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;"><strong>Email:</strong></td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#b59354;">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding:8px 0;color:#6b7280;"><strong>Phone:</strong></td><td style="padding:8px 0;">${phone}</td></tr>` : ''}
              <tr><td style="padding:8px 0;color:#6b7280;"><strong>Subject:</strong></td><td style="padding:8px 0;">${subject}</td></tr>
            </table>
            <div style="margin-top:24px;background:#f6f8f8;border-left:4px solid #b59354;padding:16px 20px;border-radius:0 8px 8px 0;">
              <h3 style="margin-top:0;color:#252623;">Message</h3>
              <p style="white-space:pre-wrap;color:#4b5563;margin:0;">${message}</p>
            </div>
          </div>
          <div style="padding:16px 32px;background:#f6f8f8;text-align:center;color:#9ca3af;font-size:12px;">
            Submitted on ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
          </div>
        </div>
      `,
    });

    // 2. Confirmation email to user
    await transporter.sendMail({
      from: `"Opulanz Banking Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `We received your message — Opulanz Banking`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
          <div style="background:#b59354;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">OPULANZ BANKING</h1>
          </div>
          <div style="padding:32px;background:#fff;">
            <h2 style="color:#252623;margin-top:0;">Thank you, ${firstName}!</h2>
            <p style="color:#4b5563;">We have received your message and our support team will get back to you as soon as possible, typically within <strong>24–48 hours</strong>.</p>
            <div style="background:#f6f8f8;border-left:4px solid #b59354;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Your message</p>
              <p style="margin:0;font-weight:600;color:#252623;">${subject}</p>
              <p style="margin:8px 0 0;white-space:pre-wrap;color:#4b5563;">${message}</p>
            </div>
            <p style="color:#4b5563;">If your request is urgent, you can also reach us directly at:</p>
            <p style="margin:0;"><a href="mailto:support@opulanz.com" style="color:#b59354;font-weight:600;">support@opulanz.com</a></p>
          </div>
          <div style="padding:16px 32px;background:#f6f8f8;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Opulanz Banking. All rights reserved.</p>
            <p style="color:#9ca3af;font-size:12px;margin:4px 0 0;">Luxembourg | France</p>
          </div>
        </div>
      `,
    });

    // Save to DB so admin can view and reply
    await pool.query(
      `INSERT INTO support_contacts (first_name, last_name, email, phone, subject, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'open')`,
      [firstName, lastName, email, phone || null, subject, message]
    ).catch(err => console.warn('Could not save contact to DB:', err.message));

    console.log(`📧 Support contact from ${fullName} <${email}> — Subject: ${subject}`);

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ success: false, error: 'Failed to send message', message: error.message });
  }
});

/**
 * POST /api/notifications/appointment
 * Send appointment confirmation emails to customer and internal team
 */
router.post('/appointment', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      appointmentDate,
      appointmentTime,
      meetingType,
      price,
      calendlyLink
    } = req.body;

    if (!customerName || !customerEmail || !appointmentDate || !appointmentTime || !meetingType) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const transporter = createTransporter();
    const teamEmail = process.env.TEAM_EMAIL || 'support@opulanz.com';
    const priceDisplay = price ? `€${price}` : '€99.90';

    // 1. Confirmation email to customer
    await transporter.sendMail({
      from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `${meetingType} Invitation from Opulanz`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
          <div style="background:#b59354;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">OPULANZ BANKING</h1>
            <p style="color:#fff;margin:8px 0 0;opacity:0.9;">Appointment Confirmed</p>
          </div>
          <div style="padding:32px;background:#fff;">
            <h2 style="color:#252623;margin-top:0;">Your appointment is confirmed, ${customerName}!</h2>
            <p style="color:#4b5563;">Thank you for booking with Opulanz Banking. Here are your appointment details:</p>
            <div style="background:#f6f8f8;border-left:4px solid #b59354;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#6b7280;width:140px;"><strong>Service:</strong></td><td style="padding:8px 0;color:#252623;font-weight:600;">${meetingType}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;"><strong>Date:</strong></td><td style="padding:8px 0;">${appointmentDate}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;"><strong>Time:</strong></td><td style="padding:8px 0;">${appointmentTime}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;"><strong>Amount Paid:</strong></td><td style="padding:8px 0;color:#b59354;font-weight:600;">${priceDisplay}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;"><strong>Format:</strong></td><td style="padding:8px 0;">Video Conference</td></tr>
                ${calendlyLink ? `<tr><td style="padding:8px 0;color:#6b7280;"><strong>Meeting Link:</strong></td><td style="padding:8px 0;"><a href="${calendlyLink}" style="color:#b59354;">${calendlyLink}</a></td></tr>` : ''}
              </table>
            </div>
            <p style="color:#4b5563;">You will receive a meeting link via Calendly shortly. Please prepare any relevant documents before the session.</p>
            <p style="color:#4b5563;">Questions? <a href="mailto:support@opulanz.com" style="color:#b59354;">support@opulanz.com</a></p>
          </div>
          <div style="padding:16px 32px;background:#f6f8f8;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Opulanz Banking. All rights reserved.</p>
            <p style="color:#9ca3af;font-size:12px;margin:4px 0 0;">Luxembourg | France</p>
          </div>
        </div>
      `,
    });

    // 2. Internal notification to team
    await transporter.sendMail({
      from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
      to: teamEmail,
      subject: `[New Appointment] ${meetingType} — ${customerName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
          <div style="background:#252623;padding:24px;text-align:center;">
            <h1 style="color:#b59354;margin:0;font-size:20px;">New Appointment Booked</h1>
          </div>
          <div style="padding:32px;background:#fff;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px;"><strong>Customer:</strong></td><td style="padding:8px 0;">${customerName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;"><strong>Email:</strong></td><td style="padding:8px 0;"><a href="mailto:${customerEmail}" style="color:#b59354;">${customerEmail}</a></td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;"><strong>Service:</strong></td><td style="padding:8px 0;font-weight:600;">${meetingType}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;"><strong>Date:</strong></td><td style="padding:8px 0;">${appointmentDate}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;"><strong>Time:</strong></td><td style="padding:8px 0;">${appointmentTime}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;"><strong>Amount:</strong></td><td style="padding:8px 0;color:#b59354;font-weight:600;">${priceDisplay}</td></tr>
            </table>
          </div>
        </div>
      `,
    });

    console.log(`📧 Appointment confirmed: ${customerName} <${customerEmail}> — ${meetingType} on ${appointmentDate}`);
    res.json({ success: true, message: 'Confirmation emails sent to customer and team' });
  } catch (error) {
    console.error('Error sending appointment notification:', error);
    res.status(500).json({ success: false, error: 'Failed to send notifications', message: error.message });
  }
});

/**
 * POST /api/notifications/company-formation
 * Send company formation confirmation to client + notification to company-set@opulanz.com
 */
router.post('/company-formation', async (req, res) => {
  try {
    const {
      userEmail, userName, companyName, formType, reference,
      setupFeeAmount, shareholders, directors, managers,
      registeredOffice, naceCode, capitalAmount, domiciliationNeeded,
      tempIds = [],
      azureFiles = [],
    } = req.body;

    if (!reference) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const nameParts = (userName || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const tempAttachments = buildAttachments(tempIds);
    const azureAttachments = await buildAzureAttachments(azureFiles);
    const cfAttachments = [...tempAttachments, ...azureAttachments];

    await emailService.sendApplicationEmails('company_formation', {
      applicationId: reference,
      payload: {
        email: userEmail,
        firstName,
        lastName,
        'Company Name': companyName || '',
        'Company Structure': formType || '',
        'Registered Office': registeredOffice || '',
        'NACE Code': naceCode || '',
        'Share Capital': capitalAmount || '',
        'Shareholders': shareholders || '',
        'Directors': directors || '',
        'Managers': managers || '',
        'Domiciliation Requested': domiciliationNeeded ? 'Yes' : 'No',
        'Setup Fee': setupFeeAmount ? `€${setupFeeAmount}` : '',
        'Payment Status': 'PAID',
        'Reference': reference,
        'Submitted At': new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }),
      },
    }, cfAttachments);

    cleanupTempFiles(tempIds);
    console.log(`📧 [Company Formation] Emails sent → client: ${userEmail} · admin: company-set@opulanz.com${cfAttachments.length > 0 ? ` · ${cfAttachments.length} attachment(s)` : ''}`);
    res.json({ success: true, message: 'Company formation emails sent' });
  } catch (error) {
    console.error('Error sending company formation notification:', error);
    res.status(500).json({ success: false, error: 'Failed to send notifications', message: error.message });
  }
});

/**
 * POST /api/notifications/open-account
 * Send open account confirmation to client + full details to info@opulanz.com
 */
router.post('/open-account', async (req, res) => {
  try {
    const { applicationId, payload = {}, tempIds = [] } = req.body;

    const clientEmail = payload.email || payload.contactEmail || payload.repEmail;
    if (!clientEmail) {
      return res.status(400).json({ success: false, error: 'Missing client email' });
    }

    const attachments = buildAttachments(tempIds);

    await emailService.sendApplicationEmails(
      'open_account',
      { applicationId: applicationId || `OPL-${Date.now()}`, payload },
      attachments,
    );

    cleanupTempFiles(tempIds);

    console.log(`📧 [Open Account] Emails sent → client: ${clientEmail} · admin: info@opulanz.com`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending open account notification:', error);
    res.status(500).json({ success: false, error: 'Failed to send notifications', message: error.message });
  }
});

/**
 * POST /api/notifications/investment-advisory
 * Send investment advisory profile confirmation to client + notification to invest-ad@opulanz.com
 */
router.post('/investment-advisory', async (req, res) => {
  try {
    const { profile, tempIds = [] } = req.body;

    if (!profile || !profile.email) {
      return res.status(400).json({ success: false, error: 'Missing client email' });
    }

    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Client';
    const ref = `OPL-INV-${Date.now()}`;
    const invAttachments = buildAttachments(tempIds);

    await emailService.sendApplicationEmails('investment_advisory', {
      applicationId: ref,
      payload: {
        email: profile.email,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        'Title': profile.title || '',
        'Date of Birth': profile.dateOfBirth || '',
        'Place of Birth': profile.placeOfBirth || '',
        'Nationality': profile.nationality || '',
        'Marital Status': profile.maritalStatus || '',
        'Phone': profile.phone || '',
        'Address': [profile.addressLine1, profile.addressLine2, profile.city, profile.postalCode, profile.country].filter(Boolean).join(', '),
        'Document Type': profile.docType || '',
        'Document Number': profile.docNumber || '',
        'Document Expiry': profile.docExpiry || '',
        'Issuing Country': profile.docIssuingCountry || '',
        'Tax Country': profile.taxCountry || '',
        'Tax ID (TIN)': profile.taxId || '',
        'US Person (FATCA)': profile.usPerson ? 'Yes' : 'No',
        'Professional Status': profile.professionalStatus || '',
        'Employer': profile.employerName || '',
        'Position': profile.position || '',
        'Sector': profile.sector || '',
        'Dependants': profile.numberOfDependents || '',
        'Annual Income (EUR)': profile.annualIncome ? `€${Number(profile.annualIncome).toLocaleString()}` : '',
        'Income Source': profile.incomeSource || '',
        'Total Assets (EUR)': profile.totalAssets ? `€${Number(profile.totalAssets).toLocaleString()}` : '',
        'Liquid Assets (EUR)': profile.liquidAssets ? `€${Number(profile.liquidAssets).toLocaleString()}` : '',
        'Real Estate (EUR)': profile.realEstateValue ? `€${Number(profile.realEstateValue).toLocaleString()}` : '',
        'Outstanding Debts (EUR)': profile.outstandingDebts ? `€${Number(profile.outstandingDebts).toLocaleString()}` : '',
        'Origin of Funds': profile.originOfFunds || '',
        'Origin Details': profile.originDetails || '',
        'Investment Experience': profile.investmentExperience || '',
        'Risk Tolerance': profile.riskTolerance || '',
        'Investment Horizon': profile.investmentHorizon || '',
        'Investment Objective': profile.investmentObjective || '',
        'Expected Return (%)': profile.expectedReturn || '',
        'Max Acceptable Loss (%)': profile.maxLossAcceptable || '',
        'Service Type': profile.missionType || '',
        'Initial Investment (EUR)': profile.initialInvestment ? `€${Number(profile.initialInvestment).toLocaleString()}` : '',
        'Submitted At': new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }),
      },
    }, invAttachments);

    cleanupTempFiles(tempIds);
    console.log(`📧 [Investment Advisory] Emails sent → client: ${profile.email} · admin: invest-ad@opulanz.com`);
    res.json({ success: true, ref });
  } catch (error) {
    console.error('Error sending investment advisory notification:', error);
    res.status(500).json({ success: false, error: 'Failed to send notifications', message: error.message });
  }
});

/**
 * POST /api/notifications/investment-booking
 * Send investment advisory booking confirmation to client + notification to invest-ad@opulanz.com
 */
router.post('/investment-booking', async (req, res) => {
  try {
    const { confirmationNumber, customerInfo, service, appointment, payment } = req.body;
    if (!customerInfo || !customerInfo.email) {
      return res.status(400).json({ success: false, error: 'Missing client email' });
    }
    await emailService.sendBookingEmails('investment_advisory', {
      confirmationNumber: confirmationNumber || `CONF-${Date.now()}`,
      customerInfo,
      service: service || { id: 'investment-advisory', title: 'Investment Advisory Consultation', price: 99.90 },
      appointment: appointment || {},
      payment: payment || {},
    });
    console.log(`📧 [Investment Booking] Emails sent → client: ${customerInfo.email} · admin: invest-ad@opulanz.com`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending investment booking notification:', error);
    res.status(500).json({ success: false, error: 'Failed to send notifications', message: error.message });
  }
});

/**
 * POST /api/notifications/accounting
 * Send accounting onboarding confirmation to client + notification to accounting@opulanz.com
 */
router.post('/accounting', async (req, res) => {
  try {
    const {
      applicationId, legalName, tradeName, companyType,
      registrationNumber, vatNumber, countryOfIncorporation,
      businessActivity, employeesFTE,
      turnoverLastFY, turnoverCurrentFY,
      salesInvoicesMonth, purchaseInvoicesMonth,
      payrollNeeded, payrollEmployees,
      multiCurrencyEnabled, multiCurrencies,
      primaryContact, registeredAddress,
      tempIds = [],
    } = req.body;

    const clientEmail = primaryContact?.email;
    if (!clientEmail) {
      return res.status(400).json({ success: false, error: 'Missing client email' });
    }

    const clientName = `${primaryContact?.firstName || ''} ${primaryContact?.lastName || ''}`.trim() || 'Client';

    const accountingAttachments = buildAttachments(tempIds);

    await emailService.sendApplicationEmails('accounting', {
      applicationId: applicationId || `OPL-ACC-${Date.now()}`,
      payload: {
        email: clientEmail,
        firstName: primaryContact?.firstName || '',
        lastName: primaryContact?.lastName || '',
        'Legal Name': legalName || '',
        'Trade Name': tradeName || '',
        'Company Type': companyType || '',
        'Registration Number': registrationNumber || '',
        'VAT Number': vatNumber || '',
        'Country of Incorporation': countryOfIncorporation || '',
        'Business Activity': businessActivity || '',
        'Employees (FTE)': employeesFTE || 0,
        'Turnover Last FY': turnoverLastFY ? `${turnoverLastFY.amount} ${turnoverLastFY.currency}` : '',
        'Turnover Current FY': turnoverCurrentFY ? `${turnoverCurrentFY.amount} ${turnoverCurrentFY.currency}` : '',
        'Sales Invoices / Month': salesInvoicesMonth || 0,
        'Purchase Invoices / Month': purchaseInvoicesMonth || 0,
        'Payroll Needed': payrollNeeded ? `Yes (${payrollEmployees || 0} employees)` : 'No',
        'Multi-Currency': multiCurrencyEnabled ? `Yes (${(multiCurrencies || []).join(', ')})` : 'No',
        'Contact Role': primaryContact?.role || '',
        'Contact Phone': primaryContact?.phone || '',
        'Registered Address': registeredAddress
          ? `${registeredAddress.street}, ${registeredAddress.city} ${registeredAddress.postal}, ${registeredAddress.country}`
          : '',
        'Submitted At': new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }),
      },
    }, accountingAttachments);

    cleanupTempFiles(tempIds);
    console.log(`📧 [Accounting] Emails sent → client: ${clientEmail} · admin: accounting@opulanz.com`);
    res.json({ success: true, message: 'Accounting onboarding emails sent' });
  } catch (error) {
    console.error('Error sending accounting notification:', error);
    res.status(500).json({ success: false, error: 'Failed to send notifications', message: error.message });
  }
});

/**
 * POST /api/notifications/private-banking
 * Send private banking application to contact@opulanz.com + confirmation to user
 */
router.post('/private-banking', async (req, res) => {
  try {
    const { ref, applicationId, firstName, lastName, email, phone, residence, country, currencies, monthlyTransfers, sourceOfFunds, documentsCount } = req.body;

    const transporter = createTransporter();
    const TEAM_EMAIL = process.env.EMAIL_PRIVATE_BANKING || 'contact@opulanz.com';
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();

    // 1. Admin notification to contact@opulanz.com
    await transporter.sendMail({
      from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
      to: TEAM_EMAIL,
      subject: `Private Banking Application — ${fullName} [${ref}]`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
          <div style="background:#b59354;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">OPULANZ BANKING</h1>
            <p style="color:#fff;margin:8px 0 0;opacity:0.9;">New Private Banking Application</p>
          </div>
          <div style="padding:32px;background:#fff;">
            <h2 style="color:#252623;margin-top:0;">Applicant Details</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#888;width:180px;">Reference</td><td style="padding:8px 0;font-weight:bold;">${ref}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Application ID</td><td style="padding:8px 0;">${applicationId || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Full Name</td><td style="padding:8px 0;">${fullName}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;">${email}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Phone</td><td style="padding:8px 0;">${phone || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Country of Residence</td><td style="padding:8px 0;">${residence || country || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Currencies</td><td style="padding:8px 0;">${Array.isArray(currencies) ? currencies.join(', ') : (currencies || 'N/A')}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Monthly Transfers</td><td style="padding:8px 0;">€${(monthlyTransfers || 0).toLocaleString()}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Source of Funds</td><td style="padding:8px 0;">${sourceOfFunds || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Documents Uploaded</td><td style="padding:8px 0;">${documentsCount || 0}</td></tr>
            </table>
          </div>
        </div>
      `,
    });

    // 2. Confirmation to applicant
    if (email) {
      await transporter.sendMail({
        from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your Private Banking Application — Opulanz [${ref}]`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
            <div style="background:#b59354;padding:24px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">OPULANZ BANKING</h1>
              <p style="color:#fff;margin:8px 0 0;opacity:0.9;">Application Received</p>
            </div>
            <div style="padding:32px;background:#fff;">
              <h2 style="color:#252623;margin-top:0;">Dear ${fullName},</h2>
              <p>Thank you for your private banking application. Our team has received your request and a relationship manager will contact you within 1–2 business days.</p>
              <div style="background:#f9f6f0;border:1px solid #b59354;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
                <p style="margin:0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your Reference Number</p>
                <p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:#252623;font-family:monospace;">${ref}</p>
              </div>
              <p style="color:#888;font-size:13px;">If you have any questions, please contact us at <a href="mailto:contact@opulanz.com" style="color:#b59354;">contact@opulanz.com</a></p>
            </div>
          </div>
        `,
      });
    }

    return res.json({ success: true, ref });
  } catch (err) {
    console.error('Private banking notification error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send notification' });
  }
});

/**
 * POST /api/notifications/mortgage
 * Send mortgage application confirmation to client + notification to mortgages@opulanz.com
 */
router.post('/mortgage', async (req, res) => {
  try {
    const {
      applicationId, firstName, lastName, email, phone,
      market, propertyType, purchasePrice, contribution,
      monthlyIncome, employment, tempIds = [], files = []
    } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Missing client email' });
    }

    const name = `${firstName || ''} ${lastName || ''}`.trim() || 'Client';
    const attachments = buildAttachments(tempIds);

    // If files are permanently uploaded to Azure, download and attach them to the email
    if (files && Array.isArray(files)) {
      for (const file of files) {
        if (file.blobName) {
          try {
            const fileBuf = await azureStorage.downloadDocument(file.blobName);
            attachments.push({
              filename: file.filename || file.name || 'document',
              content: fileBuf,
            });
          } catch (azureErr) {
            console.error(`Error downloading Azure document ${file.blobName} for mortgage email:`, azureErr.message);
          }
        }
      }
    }

    await emailService.sendApplicationEmails('mortgage', {
      applicationId: applicationId || `OPL-${Date.now()}`,
      payload: {
        email,
        firstName,
        lastName,
        phone: phone || '',
        'Target Market': market || '',
        'Property Type': propertyType || '',
        'Purchase Price (EUR)': purchasePrice ? `€${Number(purchasePrice).toLocaleString()}` : '',
        'Contribution (EUR)': contribution ? `€${Number(contribution).toLocaleString()}` : '',
        'Monthly Income (EUR)': monthlyIncome ? `€${Number(monthlyIncome).toLocaleString()}` : '',
        'Employment Status': employment || '',
        'Submitted At': new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }),
      },
    }, attachments);

    cleanupTempFiles(tempIds);

    console.log(`📧 [Mortgage] Emails sent → client: ${email} · admin: mortgages@opulanz.com`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending mortgage notification:', error);
    res.status(500).json({ success: false, error: 'Failed to send notifications', message: error.message });
  }
});

module.exports = router;
