/**
 * Applications Routes
 *
 * Handles KYC/KYB application submissions and management.
 *
 * Endpoints:
 * - POST   /api/applications        - Create new application
 * - GET    /api/applications        - List all applications (with filters)
 * - GET    /api/applications/:id    - Get single application
 * - PATCH  /api/applications/:id    - Update application
 * - DELETE /api/applications/:id    - Delete application
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { pool } = require('../config/db');
const { createNarviAccount } = require('../services/narvi');

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

/**
 * POST /api/applications
 * Create a new application
 *
 * Body:
 * {
 *   "type": "individual" | "company",
 *   "status": "draft" | "submitted" | "under_review" | "approved" | "rejected",
 *   "payload": { ...application data... }
 * }
 *
 * Example (Postman):
 * POST http://localhost:5000/api/applications
 * Content-Type: application/json
 * {
 *   "type": "individual",
 *   "status": "submitted",
 *   "payload": {
 *     "firstName": "Toufic",
 *     "lastName": "Jandah",
 *     "email": "toufic@advensys-trading.lv",
 *     "dob": "1992-08-13",
 *     "nationality": "FR",
 *     "address": {
 *       "street": "1 Rue Example",
 *       "city": "Luxembourg",
 *       "zip": "1009",
 *       "country": "LU"
 *     }
 *   }
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { type, status = 'draft', payload = {} } = req.body;

    // Validation
    if (!type || !['individual', 'company', 'accounting', 'insurance', 'company_formation'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be "individual", "company", "accounting", "insurance", or "company_formation"'
      });
    }

    const validStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Insert application
    const result = await pool.query(
      `INSERT INTO applications (type, status, payload)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [type, status, JSON.stringify(payload)]
    );

    const application = result.rows[0];

    // If application is submitted, send to Narvi
    let narviResponse = null;
    if (status === 'submitted' && (type === 'individual' || type === 'company')) {
      console.log(`🔄 Application #${application.id} is submitted, sending to Narvi...`);

      narviResponse = await createNarviAccount({
        id: application.id,
        type: application.type,
        payload: application.payload
      });

      // If Narvi account created successfully, update our database with Narvi ID
      if (narviResponse.success && narviResponse.narviAccountId) {
        const narviIdField = type === 'company' ? 'narvi_company_id' : 'narvi_customer_id';

        await pool.query(
          `UPDATE applications SET ${narviIdField} = $1 WHERE id = $2`,
          [narviResponse.narviAccountId, application.id]
        );

        console.log(`✅ Application #${application.id} linked to Narvi account: ${narviResponse.narviAccountId}`);

        // Update the application object with Narvi ID
        application[narviIdField] = narviResponse.narviAccountId;
      } else {
        console.warn(`⚠️ Application #${application.id} saved but Narvi integration failed:`, narviResponse.error);
      }
    }

    // Send confirmation email if submitted and email provided
    if (status === 'submitted' && payload.email) {
      const firstName = payload.firstName || payload.companyName || 'Client';
      const isCompany = type === 'company';
      emailTransporter.sendMail({
        from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
        to: payload.email,
        replyTo: 'support@opulanz.com',
        subject: 'Opulanz — Application Received',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#b59354,#886844);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
              <h1 style="color:white;margin:0;font-size:28px;letter-spacing:2px;">OPULANZ</h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Banking Platform</p>
            </div>
            <div style="background:#fff;padding:40px;border:1px solid #e5e7eb;border-radius:0 0 12px 12px;">
              <h2 style="color:#252623;margin:0 0 16px;">Application Received</h2>
              <p style="color:#555;font-size:15px;line-height:1.7;">Dear ${firstName},</p>
              <p style="color:#555;font-size:15px;line-height:1.7;">
                Thank you for submitting your ${isCompany ? 'company' : 'individual'} account application to Opulanz.
                We have received your information and our compliance team will review it shortly.
              </p>
              <div style="background:#f6f8f8;border-radius:12px;padding:20px;margin:24px 0;border-left:4px solid #b59354;">
                <p style="margin:0 0 8px;font-weight:600;color:#252623;">Your Application Reference:</p>
                <p style="margin:0;font-size:20px;font-weight:bold;color:#b59354;letter-spacing:1px;">${isCompany ? 'OPL-CORP' : 'OPL-IND'}-${application.id}</p>
              </div>
              <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:14px;margin:0 0 20px;">
                <p style="margin:0;font-size:13px;color:#856404;line-height:1.6;">
                  <strong>Next step:</strong> Look for a separate email from us with subject<br/>
                  <strong>"Opulanz - Verify Your Email Address"</strong> — it contains your 6-digit verification code.<br/>
                  Do <strong>not</strong> use your application reference number as a verification code.
                </p>
              </div>
              <p style="color:#555;font-size:14px;line-height:1.7;">
                You will be notified by email at every stage of the process.
                If you have any questions, contact us at
                <a href="mailto:support@opulanz.com" style="color:#b59354;font-weight:600;">support@opulanz.com</a>
              </p>
              <p style="color:#9ca3af;font-size:12px;margin-top:32px;">© 2026 Opulanz Banking. All rights reserved.</p>
            </div>
          </div>`,
      }).catch(e => console.error('Confirmation email failed:', e.message));

      // Notify support team
      emailTransporter.sendMail({
        from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
        to: 'support@opulanz.com',
        subject: `[New Application #${application.id}] ${isCompany ? 'Company' : 'Individual'} — ${firstName}`,
        html: `<p>New ${type} application submitted.</p><p><strong>Ref:</strong> #${application.id}</p><p><strong>Name:</strong> ${firstName}</p><p><strong>Email:</strong> ${payload.email}</p>`,
      }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      data: application,
      narvi: narviResponse ? {
        sent: true,
        success: narviResponse.success,
        accountId: narviResponse.narviAccountId,
        error: narviResponse.error
      } : {
        sent: false,
        reason: status !== 'submitted' ? 'Application not in submitted status' : 'Type not supported'
      }
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/applications
 * List all applications with optional filters
 *
 * Query params:
 * - type: individual | company
 * - status: draft | submitted | under_review | approved | rejected
 * - limit: number (default 50)
 * - offset: number (default 0)
 *
 * Example (Postman):
 * GET http://localhost:5000/api/applications
 * GET http://localhost:5000/api/applications?status=submitted
 * GET http://localhost:5000/api/applications?type=individual&limit=10
 */
router.get('/', async (req, res) => {
  try {
    const { type, status, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM applications WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM applications WHERE 1=1';
    const countParams = [];
    let countIndex = 1;

    if (type) {
      countQuery += ` AND type = $${countIndex}`;
      countParams.push(type);
      countIndex++;
    }

    if (status) {
      countQuery += ` AND status = $${countIndex}`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/applications/:id
 * Get a single application by ID
 *
 * Example (Postman):
 * GET http://localhost:5000/api/applications/1
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM applications WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/applications/:id
 * Update an application
 *
 * Body can include:
 * {
 *   "status": "approved",
 *   "payload": { ...updated data... },
 *   "narvi_customer_id": "narvi_cust_123",
 *   "rejection_reason": "Missing documents"
 * }
 *
 * Example (Postman):
 * PATCH http://localhost:5000/api/applications/1
 * Content-Type: application/json
 * {
 *   "status": "approved",
 *   "narvi_customer_id": "narvi_cust_abc123"
 * }
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payload, narvi_customer_id, narvi_company_id, rejection_reason } = req.body;

    // Check if application exists
    const checkResult = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (status !== undefined) {
      const validStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;

      // Set timestamp fields based on status
      if (status === 'approved') {
        updates.push(`approved_at = CURRENT_TIMESTAMP`);
      } else if (status === 'rejected') {
        updates.push(`rejected_at = CURRENT_TIMESTAMP`);
      }
    }

    if (payload !== undefined) {
      updates.push(`payload = $${paramIndex}`);
      params.push(JSON.stringify(payload));
      paramIndex++;
    }

    if (narvi_customer_id !== undefined) {
      updates.push(`narvi_customer_id = $${paramIndex}`);
      params.push(narvi_customer_id);
      paramIndex++;
    }

    if (narvi_company_id !== undefined) {
      updates.push(`narvi_company_id = $${paramIndex}`);
      params.push(narvi_company_id);
      paramIndex++;
    }

    if (rejection_reason !== undefined) {
      updates.push(`rejection_reason = $${paramIndex}`);
      params.push(rejection_reason);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    params.push(id);
    const query = `UPDATE applications SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/applications/:id
 * Delete an application
 *
 * Example (Postman):
 * DELETE http://localhost:5000/api/applications/1
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM applications WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully',
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
