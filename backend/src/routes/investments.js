/**
 * Investments Routes
 *
 * Handles investment management - linking investors to properties with ownership percentages.
 *
 * Endpoints:
 * - GET    /api/investment/investments              - List all investments
 * - GET    /api/investment/investments/:id          - Get single investment
 * - GET    /api/investment/investments/investor/:id - Get investments by investor
 * - GET    /api/investment/investments/property/:id - Get investments by property
 * - POST   /api/investment/investments              - Create new investment
 * - PATCH  /api/investment/investments/:id          - Update investment
 * - DELETE /api/investment/investments/:id          - Delete investment
 * - POST   /api/investment/investments/:id/distribution - Record distribution payment
 * - GET    /api/investment/investments/:id/calculate    - Calculate returns
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const nodemailer = require('nodemailer');
const { requireSpvAdmin, requireSpvAuth } = require('../middleware/auth');

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

// Send investment request email to admin
const sendInvestmentRequestEmail = async (investor, property, investment) => {
  try {
    const transporter = createTransporter();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #b59354, #886844); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
          .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; font-size: 14px; }
          .highlight { background: #fef3c7; border-left: 4px solid #b59354; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .amount { font-size: 24px; font-weight: bold; color: #b59354; }
          .btn { display: inline-block; padding: 12px 24px; background: #b59354; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">New Investment Request</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Action Required</p>
          </div>
          <div class="content">
            <p style="text-align: center; margin-bottom: 20px;">
              <span class="amount">€${parseFloat(investment.amount_invested).toLocaleString()}</span>
              <br><span style="color: #666;">Investment Request</span>
            </p>

            <div class="field highlight">
              <div class="label">Property</div>
              <div class="value"><strong>${property.title}</strong><br>${property.location}</div>
            </div>

            <div class="field">
              <div class="label">Investor</div>
              <div class="value">
                <strong>${investor.name}</strong><br>
                ${investor.email}<br>
                Type: ${investor.investor_type}
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div class="field">
                <div class="label">Ownership Requested</div>
                <div class="value"><strong>${investment.ownership_percentage}%</strong></div>
              </div>
              <div class="field">
                <div class="label">Status</div>
                <div class="value"><span style="color: #f59e0b; font-weight: bold;">⏳ Pending Approval</span></div>
              </div>
            </div>

            <div class="field">
              <div class="label">Request Date</div>
              <div class="value">${new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Paris' })}</div>
            </div>

            <p style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/en/spv-investment/admin/requests" class="btn">
                Review in Admin Portal
              </a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from the Opulanz Investment Portal.</p>
            <p>Please review and process this request within 24-48 hours.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Opulanz Investment Portal" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `[Investment Request] ${investor.name} - €${parseFloat(investment.amount_invested).toLocaleString()} - ${property.title}`,
      html: emailHtml,
    });

    console.log(`✅ Investment request email sent to: ${process.env.ADMIN_EMAIL}`);
  } catch (error) {
    console.error('Error sending investment request email:', error);
  }
};

// Send investment approval email to investor
const sendInvestmentApprovalEmail = async (investor, property, investment, approved = true, rejectionReason = '') => {
  try {
    const transporter = createTransporter();

    const emailHtml = approved ? `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #ffffff; border: 1px solid #ddd; }
          .footer { padding: 20px; text-align: center; background: #f9f9f9; color: #666; font-size: 12px; }
          .highlight { color: #b59354; font-weight: bold; }
          .success-icon { font-size: 48px; }
          .amount { font-size: 28px; font-weight: bold; color: #16a34a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✓</div>
            <h1 style="margin: 10px 0 0;">Investment Approved!</h1>
          </div>
          <div class="content">
            <p>Dear <span class="highlight">${investor.name}</span>,</p>

            <p>Great news! Your investment request has been <strong>approved</strong>.</p>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #666;">Investment Amount</p>
              <p class="amount" style="margin: 5px 0;">€${parseFloat(investment.amount_invested).toLocaleString()}</p>
              <p style="margin: 0; color: #666;">${investment.ownership_percentage}% ownership in ${property.title}</p>
            </div>

            <h3>Next Steps:</h3>
            <ul>
              <li>Complete the bank transfer using the details provided in your portal</li>
              <li>Use reference: <strong>${property.bank_reference || 'SPV-' + property.id}</strong></li>
              <li>Sign the subscription agreement (available in Documents)</li>
              <li>Your investment will be confirmed once payment is received</li>
            </ul>

            <p>You can track your investment and access all documents through your <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/en/spv-investment/portal/dashboard" style="color: #b59354;">Investor Portal</a>.</p>

            <p>If you have any questions, please don't hesitate to contact our team.</p>

            <p>Best regards,</p>
            <p><strong>The Opulanz Investment Team</strong></p>
          </div>
          <div class="footer">
            <p>This email confirms the approval of your investment request.</p>
          </div>
        </div>
      </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #b59354, #886844); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #ffffff; border: 1px solid #ddd; }
          .footer { padding: 20px; text-align: center; background: #f9f9f9; color: #666; font-size: 12px; }
          .highlight { color: #b59354; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Investment Request Update</h1>
          </div>
          <div class="content">
            <p>Dear <span class="highlight">${investor.name}</span>,</p>

            <p>Thank you for your interest in investing in <strong>${property.title}</strong>.</p>

            <p>After careful review, we regret to inform you that we are unable to proceed with your investment request at this time.</p>

            ${rejectionReason ? `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;"><strong>Reason:</strong> ${rejectionReason}</div>` : ''}

            <p>This decision does not affect your eligibility for future investment opportunities. We encourage you to:</p>
            <ul>
              <li>Explore other available offerings in your portal</li>
              <li>Contact our advisory team to discuss alternative options</li>
              <li>Update your investor profile if any information has changed</li>
            </ul>

            <p>If you have any questions or would like to discuss this further, please contact our team.</p>

            <p>Best regards,</p>
            <p><strong>The Opulanz Investment Team</strong></p>
          </div>
          <div class="footer">
            <p>This email is regarding your investment request for ${property.title}.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Opulanz Investment Team" <${process.env.EMAIL_USER}>`,
      to: investor.email,
      subject: approved
        ? `Investment Approved - ${property.title} - Opulanz`
        : `Investment Request Update - ${property.title} - Opulanz`,
      html: emailHtml,
    });

    console.log(`✅ Investment ${approved ? 'approval' : 'rejection'} email sent to: ${investor.email}`);
  } catch (error) {
    console.error('Error sending investment status email:', error);
  }
};

// Log activity
const logActivity = async (type, description, adminId, adminName, investorId = null, propertyId = null, metadata = {}) => {
  try {
    await pool.query(
      `INSERT INTO investment_activity_logs (log_type, description, admin_id, admin_name, investor_id, property_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [type, description, adminId, adminName, investorId, propertyId, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

/**
 * GET /api/investment/investments/investor/:id
 * Get all investments for a specific investor
 * NOTE: This must be defined BEFORE /:id to prevent route conflicts
 */
router.get('/investor/:id', requireSpvAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // IDOR protection: if user is investor, can only access their own investments
    if (req.spvUser.role === 'spv_investor' && req.spvUser.id !== parseInt(id, 10)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Cannot access another investor\'s investments'
      });
    }

    const result = await pool.query(`
      SELECT
        i.*,
        p.title as property_title,
        p.location as property_location,
        p.property_type,
        p.status as property_status,
        p.images,
        p.target_return as property_target_return,
        COALESCE(CURRENT_DATE - i.investment_date::date, 0) as days_invested,
        COALESCE(ROUND((CURRENT_DATE - i.investment_date::date) / 365.0, 4), 0) as years_invested
      FROM investments i
      JOIN investment_properties p ON i.property_id = p.id
      WHERE i.investor_id = $1
      ORDER BY i.investment_date DESC
    `, [id]);

    // Calculate totals and returns for each investment
    const investments = result.rows.map(inv => {
      const yearsInvested = parseFloat(inv.years_invested) || 0;
      const expectedAnnualReturn = parseFloat(inv.expected_annual_return) || 0;
      const amountInvested = parseFloat(inv.amount_invested) || 0;
      const actualReturnToDate = parseFloat(inv.actual_return_to_date) || 0;

      const expectedReturnToDate = amountInvested * (expectedAnnualReturn / 100) * yearsInvested;
      const currentValue = amountInvested + actualReturnToDate;
      const roi = amountInvested > 0 ? (actualReturnToDate / amountInvested) * 100 : 0;

      return {
        ...inv,
        calculations: {
          expected_return_to_date: Math.round(expectedReturnToDate * 100) / 100,
          current_value: Math.round(currentValue * 100) / 100,
          roi_percentage: Math.round(roi * 100) / 100,
          profit_loss: Math.round(actualReturnToDate * 100) / 100,
          profit_loss_status: actualReturnToDate >= 0 ? 'profit' : 'loss'
        }
      };
    });

    // Calculate portfolio summary
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount_invested), 0);
    const totalReturns = investments.reduce((sum, inv) => sum + parseFloat(inv.actual_return_to_date || 0), 0);
    const totalDistributions = investments.reduce((sum, inv) => sum + parseFloat(inv.distributions_received || 0), 0);
    const portfolioValue = totalInvested + totalReturns;
    const portfolioRoi = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    res.json({
      success: true,
      data: investments,
      summary: {
        total_investments: investments.length,
        total_invested: Math.round(totalInvested * 100) / 100,
        total_returns: Math.round(totalReturns * 100) / 100,
        total_distributions: Math.round(totalDistributions * 100) / 100,
        portfolio_value: Math.round(portfolioValue * 100) / 100,
        portfolio_roi: Math.round(portfolioRoi * 100) / 100,
        overall_status: totalReturns >= 0 ? 'profit' : 'loss'
      }
    });
  } catch (error) {
    console.error('Error fetching investor investments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/investments/property/:id
 * Get all investments for a specific property
 * NOTE: This must be defined BEFORE /:id to prevent route conflicts
 */
router.get('/property/:id', requireSpvAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        i.*,
        inv.name as investor_name,
        inv.email as investor_email,
        inv.company_name as investor_company,
        inv.investor_type,
        COALESCE(CURRENT_DATE - i.investment_date::date, 0) as days_invested
      FROM investments i
      JOIN investment_investors inv ON i.investor_id = inv.id
      WHERE i.property_id = $1
      ORDER BY i.ownership_percentage DESC
    `, [id]);

    // Calculate property investment summary
    const totalRaised = result.rows.reduce((sum, inv) => sum + parseFloat(inv.amount_invested), 0);
    const totalOwnership = result.rows.reduce((sum, inv) => sum + parseFloat(inv.ownership_percentage), 0);
    const totalShares = result.rows.reduce((sum, inv) => sum + (inv.number_of_shares || 0), 0);

    res.json({
      success: true,
      data: result.rows,
      summary: {
        total_investors: result.rows.length,
        total_raised: Math.round(totalRaised * 100) / 100,
        total_ownership_sold: Math.round(totalOwnership * 100) / 100,
        ownership_available: Math.round((100 - totalOwnership) * 100) / 100,
        total_shares_sold: totalShares
      }
    });
  } catch (error) {
    console.error('Error fetching property investments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/investments
 * List all investments with optional filters
 */
router.get('/', requireSpvAuth, async (req, res) => {
  try {
    let { investor_id, property_id, status, limit = 100, offset = 0 } = req.query;

    // IDOR protection: if user is investor, enforce that they only query their own investments
    if (req.spvUser.role === 'spv_investor') {
      investor_id = req.spvUser.id;
    }

    let query = `
      SELECT
        i.*,
        inv.name as investor_name,
        inv.email as investor_email,
        inv.company_name as investor_company,
        p.title as property_title,
        p.location as property_location,
        p.status as property_status,
        p.target_return as property_target_return,
        -- Calculated fields
        COALESCE(CURRENT_DATE - i.investment_date::date, 0) as days_invested,
        COALESCE(ROUND((CURRENT_DATE - i.investment_date::date) / 365.0, 2), 0) as years_invested
      FROM investments i
      JOIN investment_investors inv ON i.investor_id = inv.id
      JOIN investment_properties p ON i.property_id = p.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (investor_id) {
      query += ` AND i.investor_id = $${paramIndex}`;
      params.push(investor_id);
      paramIndex++;
    }

    if (property_id) {
      query += ` AND i.property_id = $${paramIndex}`;
      params.push(property_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM investments i WHERE 1=1`;
    const countParams = [];
    let countIndex = 1;

    if (investor_id) {
      countQuery += ` AND i.investor_id = $${countIndex}`;
      countParams.push(investor_id);
      countIndex++;
    }

    if (property_id) {
      countQuery += ` AND i.property_id = $${countIndex}`;
      countParams.push(property_id);
      countIndex++;
    }

    if (status) {
      countQuery += ` AND i.status = $${countIndex}`;
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
    console.error('Error fetching investments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/investments/status/pending
 * Get all pending investment requests
 * NOTE: Defined before /:id to prevent route conflicts
 */
router.get('/status/pending', requireSpvAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.*,
        inv.name as investor_name,
        inv.email as investor_email,
        inv.investor_type,
        p.title as property_title,
        p.location as property_location,
        p.images
      FROM investments i
      JOIN investment_investors inv ON i.investor_id = inv.id
      JOIN investment_properties p ON i.property_id = p.id
      WHERE i.status = 'pending'
      ORDER BY i.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching pending investments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/investment/investments/:id
 * Get single investment with full details
 */
router.get('/:id', requireSpvAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        i.*,
        inv.name as investor_name,
        inv.email as investor_email,
        inv.phone as investor_phone,
        inv.company_name as investor_company,
        inv.investor_type,
        p.title as property_title,
        p.location as property_location,
        p.property_type,
        p.status as property_status,
        p.total_value as property_total_value,
        p.total_shares as property_total_shares,
        p.target_return as property_target_return,
        p.investment_term as property_investment_term,
        p.distribution_frequency,
        -- Calculated fields
        COALESCE(CURRENT_DATE - i.investment_date::date, 0) as days_invested,
        COALESCE(ROUND((CURRENT_DATE - i.investment_date::date) / 365.0, 4), 0) as years_invested
      FROM investments i
      JOIN investment_investors inv ON i.investor_id = inv.id
      JOIN investment_properties p ON i.property_id = p.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const investment = result.rows[0];

    // IDOR protection: if user is investor, ensure they own this investment
    if (req.spvUser.role === 'spv_investor' && investment.investor_id !== req.spvUser.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Cannot access another investor\'s investment'
      });
    }

    // Calculate returns
    const yearsInvested = parseFloat(investment.years_invested) || 0;
    const expectedAnnualReturn = parseFloat(investment.expected_annual_return) || 0;
    const amountInvested = parseFloat(investment.amount_invested) || 0;
    const actualReturnToDate = parseFloat(investment.actual_return_to_date) || 0;

    // Expected return to date (simple interest)
    const expectedReturnToDate = amountInvested * (expectedAnnualReturn / 100) * yearsInvested;

    // Current estimated value
    const currentValue = amountInvested + actualReturnToDate;

    // Performance vs expected
    const performanceVsExpected = actualReturnToDate - expectedReturnToDate;

    // ROI percentage
    const roi = amountInvested > 0 ? (actualReturnToDate / amountInvested) * 100 : 0;

    // Annualized return
    const annualizedReturn = yearsInvested > 0 ? roi / yearsInvested : 0;

    // Projected final value at maturity
    let projectedFinalValue = amountInvested;
    if (investment.maturity_date) {
      const totalYears = (new Date(investment.maturity_date) - new Date(investment.investment_date)) / (365 * 24 * 60 * 60 * 1000);
      projectedFinalValue = amountInvested * (1 + (expectedAnnualReturn / 100) * totalYears);
    }

    res.json({
      success: true,
      data: {
        ...investment,
        calculations: {
          expected_return_to_date: Math.round(expectedReturnToDate * 100) / 100,
          current_value: Math.round(currentValue * 100) / 100,
          performance_vs_expected: Math.round(performanceVsExpected * 100) / 100,
          roi_percentage: Math.round(roi * 100) / 100,
          annualized_return: Math.round(annualizedReturn * 100) / 100,
          projected_final_value: Math.round(projectedFinalValue * 100) / 100,
          profit_loss: Math.round(actualReturnToDate * 100) / 100,
          profit_loss_status: actualReturnToDate >= 0 ? 'profit' : 'loss'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching investment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/investment/investments
 * Create new investment
 */
router.post('/', requireSpvAuth, async (req, res) => {
  try {
    let {
      investor_id,
      property_id,
      amount_invested,
      ownership_percentage,
      number_of_shares = 1,
      investment_date,
      maturity_date,
      expected_annual_return,
      notes,
      createdBy
    } = req.body;

    // Authorization & IDOR enforcement:
    // If caller is an investor, force investor_id to match authenticated token and clear createdBy (pending status)
    if (req.spvUser.role === 'spv_investor') {
      investor_id = req.spvUser.id;
      createdBy = null;
    } else if (req.spvUser.role === 'spv_admin') {
      createdBy = createdBy || req.spvUser.id;
    }

    // Validation
    if (!investor_id || !property_id || !amount_invested || !ownership_percentage) {
      return res.status(400).json({
        success: false,
        error: 'Investor, property, amount, and ownership percentage are required'
      });
    }

    // Check if investor exists
    const investorCheck = await pool.query('SELECT * FROM investment_investors WHERE id = $1', [investor_id]);
    if (investorCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investor not found'
      });
    }

    // Check if property exists
    const propertyCheck = await pool.query('SELECT * FROM investment_properties WHERE id = $1', [property_id]);
    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }



    // Check total ownership doesn't exceed 100%
    const ownershipCheck = await pool.query(
      'SELECT COALESCE(SUM(ownership_percentage), 0) as total FROM investments WHERE property_id = $1',
      [property_id]
    );
    const currentOwnership = parseFloat(ownershipCheck.rows[0].total);
    if (currentOwnership + parseFloat(ownership_percentage) > 100) {
      return res.status(400).json({
        success: false,
        error: `Cannot add ${ownership_percentage}% ownership. Only ${(100 - currentOwnership).toFixed(2)}% available.`
      });
    }

    // Determine status - if created by admin, set as active; if by investor, set as pending
    const investmentStatus = createdBy ? 'active' : 'pending';

    // Create investment
    const result = await pool.query(`
      INSERT INTO investments (
        investor_id, property_id, amount_invested, ownership_percentage,
        number_of_shares, investment_date, maturity_date, expected_annual_return,
        notes, created_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      investor_id,
      property_id,
      amount_invested,
      ownership_percentage,
      number_of_shares,
      investment_date || new Date().toISOString().split('T')[0],
      maturity_date,
      expected_annual_return,
      notes,
      createdBy,
      investmentStatus
    ]);

    const newInvestment = result.rows[0];
    const investor = investorCheck.rows[0];
    const property = propertyCheck.rows[0];

    // Only update investor's total invested if status is active
    if (investmentStatus === 'active') {
      await pool.query(`
        UPDATE investment_investors
        SET total_invested = COALESCE(total_invested, 0) + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [amount_invested, investor_id]);
    }

    // Log activity
    if (createdBy) {
      const adminResult = await pool.query('SELECT name FROM investment_admins WHERE id = $1', [createdBy]);
      const adminName = adminResult.rows[0]?.name || 'System';
      await logActivity(
        'investment_created',
        `Created investment: ${investor.name} → ${property.title} (${ownership_percentage}%, €${amount_invested})`,
        createdBy,
        adminName,
        investor_id,
        property_id
      );
    } else {
      // Investment request from investor - send email to admin
      await sendInvestmentRequestEmail(investor, property, newInvestment);
      await logActivity(
        'investment_requested',
        `Investment request: ${investor.name} requested ${ownership_percentage}% of ${property.title} (€${amount_invested})`,
        null,
        'Investor Portal',
        investor_id,
        property_id
      );
    }

    res.status(201).json({
      success: true,
      data: newInvestment,
      message: investmentStatus === 'pending'
        ? `Investment request submitted. Awaiting approval.`
        : `Investment created: ${investor.name} now owns ${ownership_percentage}% of ${property.title}`
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/investment/investments/:id
 * Update investment
 */
router.patch('/:id', requireSpvAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount_invested,
      ownership_percentage,
      number_of_shares,
      expected_annual_return,
      actual_return_to_date,
      distributions_received,
      status,
      maturity_date,
      exit_date,
      exit_amount,
      exit_type,
      notes,
      updatedBy
    } = req.body;

    // Check if investment exists
    const checkResult = await pool.query('SELECT * FROM investments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const existingInvestment = checkResult.rows[0];

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (amount_invested !== undefined) {
      updates.push(`amount_invested = $${paramIndex}`);
      params.push(amount_invested);
      paramIndex++;
    }

    if (ownership_percentage !== undefined) {
      // Check total ownership
      const ownershipCheck = await pool.query(
        'SELECT COALESCE(SUM(ownership_percentage), 0) as total FROM investments WHERE property_id = $1 AND id != $2',
        [existingInvestment.property_id, id]
      );
      const otherOwnership = parseFloat(ownershipCheck.rows[0].total);
      if (otherOwnership + parseFloat(ownership_percentage) > 100) {
        return res.status(400).json({
          success: false,
          error: `Cannot set ${ownership_percentage}% ownership. Only ${(100 - otherOwnership).toFixed(2)}% available.`
        });
      }
      updates.push(`ownership_percentage = $${paramIndex}`);
      params.push(ownership_percentage);
      paramIndex++;
    }

    if (number_of_shares !== undefined) {
      updates.push(`number_of_shares = $${paramIndex}`);
      params.push(number_of_shares);
      paramIndex++;
    }

    if (expected_annual_return !== undefined) {
      updates.push(`expected_annual_return = $${paramIndex}`);
      params.push(expected_annual_return);
      paramIndex++;
    }

    if (actual_return_to_date !== undefined) {
      updates.push(`actual_return_to_date = $${paramIndex}`);
      params.push(actual_return_to_date);
      paramIndex++;
    }

    if (distributions_received !== undefined) {
      updates.push(`distributions_received = $${paramIndex}`);
      params.push(distributions_received);
      paramIndex++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (maturity_date !== undefined) {
      updates.push(`maturity_date = $${paramIndex}`);
      params.push(maturity_date);
      paramIndex++;
    }

    if (exit_date !== undefined) {
      updates.push(`exit_date = $${paramIndex}`);
      params.push(exit_date);
      paramIndex++;
    }

    if (exit_amount !== undefined) {
      updates.push(`exit_amount = $${paramIndex}`);
      params.push(exit_amount);
      paramIndex++;
    }

    if (exit_type !== undefined) {
      updates.push(`exit_type = $${paramIndex}`);
      params.push(exit_type);
      paramIndex++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `UPDATE investments SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);

    // Log activity
    if (updatedBy) {
      const adminResult = await pool.query('SELECT name FROM investment_admins WHERE id = $1', [updatedBy]);
      const adminName = adminResult.rows[0]?.name || 'System';
      await logActivity(
        'investment_updated',
        `Updated investment #${id}`,
        updatedBy,
        adminName,
        existingInvestment.investor_id,
        existingInvestment.property_id
      );
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating investment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/investment/investments/:id
 * Delete investment
 */
router.delete('/:id', requireSpvAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy } = req.body;

    const checkResult = await pool.query('SELECT * FROM investments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const investment = checkResult.rows[0];

    // Update investor's total invested
    await pool.query(`
      UPDATE investment_investors
      SET total_invested = GREATEST(COALESCE(total_invested, 0) - $1, 0),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [investment.amount_invested, investment.investor_id]);

    // Delete investment
    await pool.query('DELETE FROM investments WHERE id = $1', [id]);

    // Log activity
    if (deletedBy) {
      const adminResult = await pool.query('SELECT name FROM investment_admins WHERE id = $1', [deletedBy]);
      const adminName = adminResult.rows[0]?.name || 'System';
      await logActivity(
        'investment_deleted',
        `Deleted investment #${id}`,
        deletedBy,
        adminName,
        investment.investor_id,
        investment.property_id
      );
    }

    res.json({
      success: true,
      message: 'Investment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting investment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/investment/investments/:id/distribution
 * Record a distribution payment
 */
router.post('/:id/distribution', requireSpvAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, recordedBy } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Distribution amount must be greater than 0'
      });
    }

    const checkResult = await pool.query('SELECT * FROM investments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    // Update distributions and actual returns
    const result = await pool.query(`
      UPDATE investments
      SET distributions_received = COALESCE(distributions_received, 0) + $1,
          actual_return_to_date = COALESCE(actual_return_to_date, 0) + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [amount, id]);

    // Log activity
    if (recordedBy) {
      const adminResult = await pool.query('SELECT name FROM investment_admins WHERE id = $1', [recordedBy]);
      const adminName = adminResult.rows[0]?.name || 'System';
      await logActivity(
        'distribution_recorded',
        `Recorded €${amount} distribution for investment #${id}`,
        recordedBy,
        adminName,
        checkResult.rows[0].investor_id,
        checkResult.rows[0].property_id
      );
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `Distribution of €${amount} recorded successfully`
    });
  } catch (error) {
    console.error('Error recording distribution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/investments/:id/calculate
 * Calculate detailed returns for an investment
 */
router.get('/:id/calculate', requireSpvAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { projection_years } = req.query;

    const result = await pool.query(`
      SELECT
        i.*,
        inv.name as investor_name,
        p.title as property_title,
        p.total_value as property_total_value,
        COALESCE(CURRENT_DATE - i.investment_date::date, 0) as days_invested
      FROM investments i
      JOIN investment_investors inv ON i.investor_id = inv.id
      JOIN investment_properties p ON i.property_id = p.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const inv = result.rows[0];

    // IDOR protection: if user is investor, ensure they own this investment
    if (req.spvUser.role === 'spv_investor' && inv.investor_id !== req.spvUser.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Cannot access another investor\'s investment'
      });
    }

    const amountInvested = parseFloat(inv.amount_invested);
    const expectedReturn = parseFloat(inv.expected_annual_return) || 0;
    const actualReturn = parseFloat(inv.actual_return_to_date) || 0;
    const daysInvested = parseInt(inv.days_invested);
    const yearsInvested = daysInvested / 365;

    // Current performance
    const expectedToDate = amountInvested * (expectedReturn / 100) * yearsInvested;
    const currentValue = amountInvested + actualReturn;
    const roiPercent = amountInvested > 0 ? (actualReturn / amountInvested) * 100 : 0;

    // Projections
    const projectionYears = parseInt(projection_years) || 5;
    const projections = [];

    for (let year = 1; year <= projectionYears; year++) {
      const projectedReturn = amountInvested * (expectedReturn / 100) * year;
      const projectedValue = amountInvested + projectedReturn;
      const annualDistribution = projectedReturn / year;

      projections.push({
        year,
        projected_value: Math.round(projectedValue * 100) / 100,
        projected_return: Math.round(projectedReturn * 100) / 100,
        annual_distribution: Math.round(annualDistribution * 100) / 100,
        cumulative_roi: Math.round((projectedReturn / amountInvested) * 100 * 100) / 100
      });
    }

    res.json({
      success: true,
      data: {
        investment: {
          id: inv.id,
          investor_name: inv.investor_name,
          property_title: inv.property_title,
          amount_invested: amountInvested,
          ownership_percentage: parseFloat(inv.ownership_percentage),
          expected_annual_return: expectedReturn,
          investment_date: inv.investment_date,
          maturity_date: inv.maturity_date
        },
        current_performance: {
          days_invested: daysInvested,
          years_invested: Math.round(yearsInvested * 100) / 100,
          expected_return_to_date: Math.round(expectedToDate * 100) / 100,
          actual_return_to_date: Math.round(actualReturn * 100) / 100,
          performance_vs_expected: Math.round((actualReturn - expectedToDate) * 100) / 100,
          current_value: Math.round(currentValue * 100) / 100,
          roi_percentage: Math.round(roiPercent * 100) / 100,
          status: actualReturn >= expectedToDate ? 'on_track' : 'below_target'
        },
        projections,
        summary: {
          break_even_years: expectedReturn > 0 ? Math.round((100 / expectedReturn) * 100) / 100 : null,
          double_value_years: expectedReturn > 0 ? Math.round((100 / expectedReturn) * 100) / 100 : null,
          estimated_annual_income: Math.round((amountInvested * expectedReturn / 100) * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Error calculating investment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/investment/investments/:id/approve
 * Approve a pending investment request
 */
router.post('/:id/approve', requireSpvAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.body.adminId || req.spvUser.id;

    // Get investment details
    const investmentResult = await pool.query('SELECT * FROM investments WHERE id = $1', [id]);
    if (investmentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Investment not found' });
    }

    const investment = investmentResult.rows[0];

    if (investment.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Investment is not pending approval' });
    }

    // Get investor and property details
    const investorResult = await pool.query('SELECT * FROM investment_investors WHERE id = $1', [investment.investor_id]);
    const propertyResult = await pool.query('SELECT * FROM investment_properties WHERE id = $1', [investment.property_id]);

    const investor = investorResult.rows[0];
    const property = propertyResult.rows[0];

    // Update investment status to active
    await pool.query(`
      UPDATE investments
      SET status = 'active', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);

    // Update investor's total invested
    await pool.query(`
      UPDATE investment_investors
      SET total_invested = COALESCE(total_invested, 0) + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [investment.amount_invested, investment.investor_id]);

    // Send approval email to investor
    await sendInvestmentApprovalEmail(investor, property, investment, true);

    // Log activity
    if (adminId) {
      const adminResult = await pool.query('SELECT name FROM investment_admins WHERE id = $1', [adminId]);
      const adminName = adminResult.rows[0]?.name || req.spvUser.name || 'Admin';
      await logActivity(
        'investment_approved',
        `Approved investment: ${investor.name} → ${property.title} (${investment.ownership_percentage}%, €${investment.amount_invested})`,
        adminId,
        adminName,
        investment.investor_id,
        investment.property_id
      );
    }

    res.json({
      success: true,
      message: `Investment approved. Confirmation email sent to ${investor.email}.`
    });
  } catch (error) {
    console.error('Error approving investment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/investment/investments/:id/reject
 * Reject a pending investment request
 */
router.post('/:id/reject', requireSpvAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.body.adminId || req.spvUser.id;
    const { reason } = req.body;

    // Get investment details
    const investmentResult = await pool.query('SELECT * FROM investments WHERE id = $1', [id]);
    if (investmentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Investment not found' });
    }

    const investment = investmentResult.rows[0];

    if (investment.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Investment is not pending' });
    }

    // Get investor and property details
    const investorResult = await pool.query('SELECT * FROM investment_investors WHERE id = $1', [investment.investor_id]);
    const propertyResult = await pool.query('SELECT * FROM investment_properties WHERE id = $1', [investment.property_id]);

    const investor = investorResult.rows[0];
    const property = propertyResult.rows[0];

    // Update investment status to cancelled
    await pool.query(`
      UPDATE investments
      SET status = 'cancelled', notes = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id, reason || 'Rejected by administrator']);

    // Send rejection email to investor
    await sendInvestmentApprovalEmail(investor, property, investment, false, reason);

    // Log activity
    if (adminId) {
      const adminResult = await pool.query('SELECT name FROM investment_admins WHERE id = $1', [adminId]);
      const adminName = adminResult.rows[0]?.name || req.spvUser.name || 'Admin';
      await logActivity(
        'investment_rejected',
        `Rejected investment: ${investor.name} → ${property.title} (Reason: ${reason || 'Not specified'})`,
        adminId,
        adminName,
        investment.investor_id,
        investment.property_id
      );
    }

    res.json({
      success: true,
      message: `Investment rejected. Notification email sent to ${investor.email}.`
    });
  } catch (error) {
    console.error('Error rejecting investment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
