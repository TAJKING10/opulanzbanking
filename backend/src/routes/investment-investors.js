/**
 * Investment Investors Routes
 *
 * Handles investor/customer management for the investment portal.
 *
 * Endpoints:
 * - POST   /api/investment/investors/login    - Investor login
 * - GET    /api/investment/investors          - List all investors
 * - GET    /api/investment/investors/:id      - Get single investor
 * - POST   /api/investment/investors          - Create new investor
 * - PATCH  /api/investment/investors/:id      - Update investor
 * - DELETE /api/investment/investors/:id      - Delete investor
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { JWT_SECRET, requireSpvAdmin, requireSpvAuth } = require('../middleware/auth');

// Generate unique access code for investors
const generateAccessCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'OPL-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Log activity
const logActivity = async (type, description, adminId, adminName, investorId = null, metadata = {}) => {
  try {
    await pool.query(
      `INSERT INTO investment_activity_logs (log_type, description, admin_id, admin_name, investor_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [type, description, adminId, adminName, investorId, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

/**
 * POST /api/investment/investors/login
 * Investor login with access code
 */
router.post('/login', async (req, res) => {
  try {
    const { accessCode } = req.body;

    if (!accessCode) {
      return res.status(400).json({
        success: false,
        error: 'Access code is required'
      });
    }

    const result = await pool.query(
      `SELECT * FROM investment_investors WHERE access_code = $1 AND status = 'active'`,
      [accessCode]
    );

    if (result.rows.length === 0) {
      // Check if code belongs to an admin account to provide helpful feedback
      const adminCheck = await pool.query(
        `SELECT id, name FROM investment_admins WHERE access_code = $1 AND status = 'active'`,
        [accessCode]
      );
      if (adminCheck.rows.length > 0) {
        return res.status(401).json({
          success: false,
          isAdminCode: true,
          error: 'This is an Admin access code. Please use the Admin Portal.'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid access code'
      });
    }

    const investor = result.rows[0];

    // Update last access
    await pool.query(
      `UPDATE investment_investors SET last_access = CURRENT_TIMESTAMP WHERE id = $1`,
      [investor.id]
    );

    // Log activity (no admin for investor login)
    await logActivity('customer_login', `${investor.name} logged in to portal`, null, null, investor.id);

    // Sign JWT token for the investor (7-day validity)
    const token = jwt.sign(
      {
        id: investor.id,
        email: investor.email,
        name: investor.name,
        role: 'spv_investor',
        investor_type: investor.investor_type,
        profile_type: investor.profile_type,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure cookie
    res.cookie('spv_investor_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Return investor data (without access code) and bearer token
    const { access_code, ...investorData } = investor;

    res.json({
      success: true,
      token,
      data: {
        ...investorData,
        last_access: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error during investor login:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/investors
 * List all investors with optional filters
 *
 * Query params:
 * - status: active | inactive
 * - investor_type: institutional | professional | private
 * - search: search by name, email, or access code
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
router.get('/', requireSpvAdmin, async (req, res) => {
  try {
    const { status, investor_type, search, limit = 50, offset = 0 } = req.query;

    let query = `SELECT id, access_code, name, email, phone, investor_type, profile_type, status,
                        company_name, address, notes, total_invested, last_access, created_by, created_at, updated_at
                 FROM investment_investors WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (investor_type) {
      query += ` AND investor_type = $${paramIndex}`;
      params.push(investor_type);
      paramIndex++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR access_code ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM investment_investors WHERE 1=1`;
    const countParams = [];
    let countIndex = 1;

    if (status) {
      countQuery += ` AND status = $${countIndex}`;
      countParams.push(status);
      countIndex++;
    }

    if (investor_type) {
      countQuery += ` AND investor_type = $${countIndex}`;
      countParams.push(investor_type);
      countIndex++;
    }

    if (search) {
      countQuery += ` AND (name ILIKE $${countIndex} OR email ILIKE $${countIndex} OR access_code ILIKE $${countIndex})`;
      countParams.push(`%${search}%`);
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
    console.error('Error fetching investors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/investors/:id
 * Get single investor by ID
 */
router.get('/:id', requireSpvAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // IDOR Protection: only admin or the investor themselves can fetch their profile
    if (!req.admin && req.investor?.id !== parseInt(id, 10)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Access to this profile is not allowed'
      });
    }

    const result = await pool.query(
      `SELECT id, access_code, name, email, phone, investor_type, profile_type, status,
              company_name, address, notes, total_invested, last_access, created_by, created_at, updated_at
       FROM investment_investors WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investor not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching investor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/investment/investors
 * Create new investor
 */
router.post('/', requireSpvAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      investor_type = 'private',
      profile_type = 'new',
      company_name,
      address = {},
      notes,
      createdBy
    } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Generate unique access code
    let accessCode;
    let codeExists = true;
    while (codeExists) {
      accessCode = generateAccessCode();
      const checkCode = await pool.query(
        `SELECT id FROM investment_investors WHERE access_code = $1`,
        [accessCode]
      );
      codeExists = checkCode.rows.length > 0;
    }

    // Create investor
    const result = await pool.query(
      `INSERT INTO investment_investors
       (access_code, name, email, phone, investor_type, profile_type, status, company_name, address, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, $9, $10)
       RETURNING *`,
      [accessCode, name, email, phone, investor_type, profile_type, company_name, JSON.stringify(address), notes, createdBy]
    );

    const newInvestor = result.rows[0];

    // Log activity
    if (createdBy) {
      const creatorResult = await pool.query(`SELECT name FROM investment_admins WHERE id = $1`, [createdBy]);
      const creatorName = creatorResult.rows[0]?.name || 'System';
      await logActivity('customer_created', `Created new investor: ${name}`, createdBy, creatorName, newInvestor.id);
    }

    res.status(201).json({
      success: true,
      data: newInvestor,
      message: `Investor created successfully. Access code: ${accessCode}`
    });
  } catch (error) {
    console.error('Error creating investor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/investment/investors/:id
 * Update investor
 */
router.patch('/:id', requireSpvAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      investor_type,
      profile_type,
      status,
      company_name,
      address,
      notes,
      total_invested,
      updatedBy
    } = req.body;

    // Check if investor exists
    const checkResult = await pool.query('SELECT * FROM investment_investors WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investor not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    if (email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      params.push(phone);
      paramIndex++;
    }

    if (investor_type !== undefined) {
      updates.push(`investor_type = $${paramIndex}`);
      params.push(investor_type);
      paramIndex++;
    }

    if (profile_type !== undefined) {
      updates.push(`profile_type = $${paramIndex}`);
      params.push(profile_type);
      paramIndex++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (company_name !== undefined) {
      updates.push(`company_name = $${paramIndex}`);
      params.push(company_name);
      paramIndex++;
    }

    if (address !== undefined) {
      updates.push(`address = $${paramIndex}`);
      params.push(JSON.stringify(address));
      paramIndex++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }

    if (total_invested !== undefined) {
      updates.push(`total_invested = $${paramIndex}`);
      params.push(total_invested);
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

    const query = `UPDATE investment_investors SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, params);

    // Log activity
    if (updatedBy) {
      const updaterResult = await pool.query(`SELECT name FROM investment_admins WHERE id = $1`, [updatedBy]);
      const updaterName = updaterResult.rows[0]?.name || 'System';
      await logActivity('customer_updated', `Updated investor: ${result.rows[0].name}`, updatedBy, updaterName, parseInt(id));
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating investor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/investment/investors/:id
 * Delete investor
 */
router.delete('/:id', requireSpvAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy } = req.body;

    // Check if investor exists
    const checkResult = await pool.query('SELECT * FROM investment_investors WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investor not found'
      });
    }

    const investor = checkResult.rows[0];

    // Delete investor
    await pool.query('DELETE FROM investment_investors WHERE id = $1', [id]);

    // Log activity
    if (deletedBy) {
      const deleterResult = await pool.query(`SELECT name FROM investment_admins WHERE id = $1`, [deletedBy]);
      const deleterName = deleterResult.rows[0]?.name || 'System';
      await logActivity('customer_deleted', `Deleted investor: ${investor.name}`, deletedBy, deleterName, null, { deletedInvestorId: id });
    }

    res.json({
      success: true,
      message: 'Investor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting investor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/investment/investors/:id/reset
 * Reset investor access code
 */
router.post('/:id/reset', requireSpvAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { resetBy } = req.body;

    // Check if investor exists
    const checkResult = await pool.query('SELECT * FROM investment_investors WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investor not found'
      });
    }

    // Generate new access code
    let accessCode;
    let codeExists = true;
    while (codeExists) {
      accessCode = generateAccessCode();
      const checkCode = await pool.query(
        `SELECT id FROM investment_investors WHERE access_code = $1`,
        [accessCode]
      );
      codeExists = checkCode.rows.length > 0;
    }

    // Update access code
    const result = await pool.query(
      `UPDATE investment_investors SET access_code = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
       RETURNING id, access_code, name, email`,
      [accessCode, id]
    );

    // Log activity
    if (resetBy) {
      const resetterResult = await pool.query(`SELECT name FROM investment_admins WHERE id = $1`, [resetBy]);
      const resetterName = resetterResult.rows[0]?.name || 'System';
      await logActivity('password_reset', `Reset access code for investor: ${result.rows[0].name}`, resetBy, resetterName, parseInt(id));
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `Access code reset successfully. New code: ${accessCode}`
    });
  } catch (error) {
    console.error('Error resetting investor access code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
