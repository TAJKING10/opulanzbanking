/**
 * Investment Contact Routes
 * Handles SPV investment contact form submissions and sends emails to support
 */

const express = require('express');
const nodemailer = require('nodemailer');
const pool = require('../config/db');
const router = express.Router();

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * POST /api/investment/contact
 * Submit SPV investment inquiry and send email to support
 */
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, investorType, message } = req.body;

    // Validate required fields
    if (!fullName || !email || !investorType) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, and investor type are required',
      });
    }

    // Store inquiry in database
    const dbResult = await pool.query(
      `INSERT INTO investment_inquiries
       (full_name, email, phone, investor_type, message, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'new', CURRENT_TIMESTAMP)
       RETURNING *`,
      [fullName, email, phone || null, investorType, message || null]
    );

    const inquiry = dbResult.rows[0];

    // Log activity
    await pool.query(
      `INSERT INTO investment_activity_logs
       (log_type, description, metadata, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [
        'inquiry_received',
        `New SPV investment inquiry from ${fullName}`,
        JSON.stringify({ inquiryId: inquiry.id, investorType, email }),
      ]
    );

    // Send email to support
    const transporter = createTransporter();

    const investorTypeLabels = {
      institutional: 'Institutional Investor',
      professional: 'Professional Investor',
      private: 'Private Investor',
    };

    // Email to Opulanz support team
    const supportEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #b59354, #886844); color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #666; }
          .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .badge-institutional { background: #dbeafe; color: #1d4ed8; }
          .badge-professional { background: #fef3c7; color: #b45309; }
          .badge-private { background: #dcfce7; color: #16a34a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">New SPV Investment Inquiry</h1>
            <p style="margin: 10px 0 0;">Opulanz Investment Portal</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Inquiry ID</div>
              <div class="value">#INQ-${String(inquiry.id).padStart(6, '0')}</div>
            </div>
            <div class="field">
              <div class="label">Full Name</div>
              <div class="value">${fullName}</div>
            </div>
            <div class="field">
              <div class="label">Email Address</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            <div class="field">
              <div class="label">Phone Number</div>
              <div class="value">${phone || 'Not provided'}</div>
            </div>
            <div class="field">
              <div class="label">Investor Type</div>
              <div class="value">
                <span class="badge badge-${investorType}">
                  ${investorTypeLabels[investorType] || investorType}
                </span>
              </div>
            </div>
            ${message ? `
            <div class="field">
              <div class="label">Message / Investment Interests</div>
              <div class="value">${message}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Submitted At</div>
              <div class="value">${new Date().toLocaleString('en-GB', {
                dateStyle: 'full',
                timeStyle: 'short',
                timeZone: 'Europe/Paris'
              })}</div>
            </div>
          </div>
          <div class="footer">
            <p>This inquiry was submitted via the Opulanz SPV Investment Portal.</p>
            <p>Please respond within 24-48 hours.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Opulanz Investment Portal" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `[SPV Investment Inquiry] ${fullName} - ${investorTypeLabels[investorType]}`,
      html: supportEmailHtml,
    });

    // Auto-reply to the investor
    const autoReplyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #b59354, #886844); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #ffffff; }
          .footer { padding: 20px; text-align: center; background: #f9f9f9; color: #666; font-size: 12px; }
          .highlight { color: #b59354; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Thank You for Your Interest</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Opulanz Real Estate SPV Investment</p>
          </div>
          <div class="content">
            <p>Dear <span class="highlight">${fullName}</span>,</p>

            <p>Thank you for expressing your interest in Opulanz's Real Estate SPV investment opportunities.</p>

            <p>We have received your inquiry and our advisory team will review your profile. A member of our team will be in touch with you within <strong>24-48 business hours</strong> to discuss:</p>

            <ul>
              <li>Current SPV investment opportunities</li>
              <li>Investor qualification requirements</li>
              <li>Next steps in the process</li>
            </ul>

            <p>In the meantime, please note that:</p>
            <ul>
              <li>Our SPV investments are available exclusively through invitation-based access</li>
              <li>All investors undergo qualification review and KYC/AML verification</li>
              <li>Detailed investment documentation is provided through our secure portal</li>
            </ul>

            <p>If you have any urgent questions, please don't hesitate to contact us at <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #b59354;">${process.env.ADMIN_EMAIL}</a>.</p>

            <p>Best regards,</p>
            <p><strong>The Opulanz Investment Team</strong></p>
          </div>
          <div class="footer">
            <p>This email was sent in response to your inquiry on the Opulanz Investment Portal.</p>
            <p style="margin-top: 10px; font-size: 11px; color: #999;">
              This message contains confidential information. If you are not the intended recipient, please delete it.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Opulanz Investment Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank You for Your SPV Investment Inquiry - Opulanz',
      html: autoReplyHtml,
    });

    console.log(`✅ SPV Investment inquiry received and emails sent:`);
    console.log(`   - Support notified at: ${process.env.ADMIN_EMAIL}`);
    console.log(`   - Auto-reply sent to: ${email}`);

    res.json({
      success: true,
      message: 'Inquiry submitted successfully. Our team will contact you shortly.',
      data: {
        inquiryId: inquiry.id,
        submittedAt: inquiry.created_at,
      },
    });
  } catch (error) {
    console.error('Error processing investment contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit inquiry',
      message: error.message,
    });
  }
});

/**
 * GET /api/investment/contact
 * Get all investment inquiries (admin only)
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM investment_inquiries';
    const params = [];

    if (status) {
      params.push(status);
      query += ` WHERE status = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM investment_inquiries';
    if (status) {
      countQuery += ' WHERE status = $1';
    }
    const countResult = await pool.query(countQuery, status ? [status] : []);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inquiries',
    });
  }
});

/**
 * PATCH /api/investment/contact/:id
 * Update inquiry status
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedTo } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }
    if (assignedTo !== undefined) {
      updates.push(`assigned_to = $${paramCount++}`);
      values.push(assignedTo);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE investment_inquiries
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update inquiry',
    });
  }
});

module.exports = router;
