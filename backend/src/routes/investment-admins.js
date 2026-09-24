/**
 * Investment Admins Routes
 *
 * Handles admin authentication and management for the investment portal.
 *
 * Endpoints:
 * - POST   /api/investment/admins/login     - Admin login
 * - GET    /api/investment/admins           - List all admins (primary only)
 * - GET    /api/investment/admins/:id       - Get single admin
 * - POST   /api/investment/admins           - Create new admin (primary only)
 * - PATCH  /api/investment/admins/:id       - Update admin
 * - DELETE /api/investment/admins/:id       - Delete admin (primary only)
 * - POST   /api/investment/admins/:id/reset - Reset admin access code (primary only)
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { JWT_SECRET, requireSpvAdmin } = require('../middleware/auth');
const crypto = require('crypto');

// Generate unique access code
const generateAccessCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'INV-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Log activity
const logActivity = async (type, description, adminId, adminName, metadata = {}) => {
  try {
    await pool.query(
      `INSERT INTO investment_activity_logs (log_type, description, admin_id, admin_name, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [type, description, adminId, adminName, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

/**
 * POST /api/investment/admins/login
 * Admin login with access code
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
      `SELECT * FROM investment_admins WHERE access_code = $1 AND status = 'active'`,
      [accessCode]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid access code'
      });
    }

    const admin = result.rows[0];

    // Update last login
    await pool.query(
      `UPDATE investment_admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [admin.id]
    );

    // Log activity
    await logActivity('admin_login', `${admin.name} logged in`, admin.id, admin.name);

    // Sign JWT token for admin (7-day validity)
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: 'spv_admin',
        admin_role: admin.role,
        permissions: admin.permissions
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure cookie
    res.cookie('spv_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    // Return admin data (without access code) and token
    const { access_code, ...adminData } = admin;

    res.json({
      success: true,
      token,
      data: {
        ...adminData,
        last_login: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/admins
 * List all admins (requires admin role)
 */
router.get('/', requireSpvAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, role, status, permissions, last_login, created_at, updated_at
       FROM investment_admins
       ORDER BY role DESC, created_at ASC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/admins/:id
 * Get single admin by ID
 */
router.get('/:id', requireSpvAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, email, phone, role, status, permissions, last_login, created_at, updated_at
       FROM investment_admins WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/investment/admins
 * Create new admin (requires primary admin role)
 */
router.post('/', requireSpvAdmin, async (req, res) => {
  try {
    const { name, email, phone, role = 'admin', permissions = {}, createdBy } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Check if email already exists
    const existingEmail = await pool.query(
      `SELECT id FROM investment_admins WHERE email = $1`,
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Generate unique access code
    let accessCode;
    let codeExists = true;
    while (codeExists) {
      accessCode = generateAccessCode();
      const checkCode = await pool.query(
        `SELECT id FROM investment_admins WHERE access_code = $1`,
        [accessCode]
      );
      codeExists = checkCode.rows.length > 0;
    }

    // Create admin
    const result = await pool.query(
      `INSERT INTO investment_admins (access_code, name, email, phone, role, status, permissions)
       VALUES ($1, $2, $3, $4, $5, 'active', $6)
       RETURNING id, access_code, name, email, phone, role, status, permissions, created_at`,
      [accessCode, name, email, phone, role === 'primary' ? 'admin' : role, JSON.stringify(permissions)]
    );

    const newAdmin = result.rows[0];

    // Log activity
    if (createdBy) {
      const creatorResult = await pool.query(`SELECT name FROM investment_admins WHERE id = $1`, [createdBy]);
      const creatorName = creatorResult.rows[0]?.name || 'System';
      await logActivity('admin_created', `Created new admin: ${name}`, createdBy, creatorName, { newAdminId: newAdmin.id });
    }

    res.status(201).json({
      success: true,
      data: newAdmin,
      message: `Admin created successfully. Access code: ${accessCode}`
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/investment/admins/:id
 * Update admin
 */
router.patch('/:id', requireSpvAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, permissions, updatedBy } = req.body;

    // Check if admin exists
    const checkResult = await pool.query('SELECT * FROM investment_admins WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    const existingAdmin = checkResult.rows[0];

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
      // Check if email already exists for another admin
      const existingEmail = await pool.query(
        `SELECT id FROM investment_admins WHERE email = $1 AND id != $2`,
        [email, id]
      );
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
      updates.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      params.push(phone);
      paramIndex++;
    }

    if (status !== undefined) {
      // Cannot deactivate primary admin
      if (existingAdmin.role === 'primary' && status === 'inactive') {
        return res.status(400).json({
          success: false,
          error: 'Cannot deactivate primary admin'
        });
      }
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (permissions !== undefined) {
      updates.push(`permissions = $${paramIndex}`);
      params.push(JSON.stringify(permissions));
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No practical fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `UPDATE investment_admins SET ${updates.join(', ')} WHERE id = $${paramIndex}
                   RETURNING id, name, email, phone, role, status, permissions, last_login, created_at, updated_at`;

    const result = await pool.query(query, params);

    // Log activity
    if (updatedBy) {
      const updaterResult = await pool.query(`SELECT name FROM investment_admins WHERE id = $1`, [updatedBy]);
      const updaterName = updaterResult.rows[0]?.name || 'System';
      await logActivity('admin_updated', `Updated admin: ${result.rows[0].name}`, updatedBy, updaterName, { adminId: id });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/investment/admins/:id
 * Delete admin (requires primary admin role)
 */
router.delete('/:id', requireSpvAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy } = req.body;

    // Check if admin exists
    const checkResult = await pool.query('SELECT * FROM investment_admins WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    const admin = checkResult.rows[0];

    // Cannot delete primary admin
    if (admin.role === 'primary') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete primary admin'
      });
    }

    // Delete admin
    await pool.query('DELETE FROM investment_admins WHERE id = $1', [id]);

    // Log activity
    if (deletedBy) {
      const deleterResult = await pool.query(`SELECT name FROM investment_admins WHERE id = $1`, [deletedBy]);
      const deleterName = deleterResult.rows[0]?.name || 'System';
      await logActivity('admin_deleted', `Deleted admin: ${admin.name}`, deletedBy, deleterName, { deletedAdminId: id });
    }

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/investment/admins/:id/reset
 * Reset admin access code (requires primary admin role)
 */
router.post('/:id/reset', requireSpvAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { resetBy } = req.body;

    // Check if admin exists
    const checkResult = await pool.query('SELECT * FROM investment_admins WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    // Generate new access code
    let accessCode;
    let codeExists = true;
    while (codeExists) {
      accessCode = generateAccessCode();
      const checkCode = await pool.query(
        `SELECT id FROM investment_admins WHERE access_code = $1`,
        [accessCode]
      );
      codeExists = checkCode.rows.length > 0;
    }

    // Update access code
    const result = await pool.query(
      `UPDATE investment_admins SET access_code = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
       RETURNING id, access_code, name, email`,
      [accessCode, id]
    );

    // Log activity
    if (resetBy) {
      const resetterResult = await pool.query(`SELECT name FROM investment_admins WHERE id = $1`, [resetBy]);
      const resetterName = resetterResult.rows[0]?.name || 'System';
      await logActivity('password_reset', `Reset access code for: ${result.rows[0].name}`, resetBy, resetterName, { adminId: id });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `Access code reset successfully. New code: ${accessCode}`
    });
  } catch (error) {
    console.error('Error resetting admin access code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
