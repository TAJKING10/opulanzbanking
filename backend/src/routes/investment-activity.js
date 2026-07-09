/**
 * Investment Activity Logs Routes
 *
 * Handles activity log retrieval for the investment portal.
 *
 * Endpoints:
 * - GET    /api/investment/activity          - List activity logs
 * - GET    /api/investment/activity/stats    - Get dashboard stats
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * GET /api/investment/activity
 * List activity logs with optional filters
 *
 * Query params:
 * - admin_id: filter by admin
 * - log_type: filter by type
 * - limit: number (default 100)
 * - offset: number (default 0)
 */
router.get('/', async (req, res) => {
  try {
    const { admin_id, log_type, limit = 100, offset = 0 } = req.query;

    let query = `SELECT * FROM investment_activity_logs WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (admin_id) {
      query += ` AND admin_id = $${paramIndex}`;
      params.push(admin_id);
      paramIndex++;
    }

    if (log_type) {
      query += ` AND log_type = $${paramIndex}`;
      params.push(log_type);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM investment_activity_logs WHERE 1=1`;
    const countParams = [];
    let countIndex = 1;

    if (admin_id) {
      countQuery += ` AND admin_id = $${countIndex}`;
      countParams.push(admin_id);
      countIndex++;
    }

    if (log_type) {
      countQuery += ` AND log_type = $${countIndex}`;
      countParams.push(log_type);
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
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/activity/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Get counts for dashboard
    const [
      totalInvestors,
      activeInvestors,
      totalProperties,
      openProperties,
      totalAdmins
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM investment_investors`),
      pool.query(`SELECT COUNT(*) FROM investment_investors WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*) FROM investment_properties`),
      pool.query(`SELECT COUNT(*) FROM investment_properties WHERE status = 'open'`),
      pool.query(`SELECT COUNT(*) FROM investment_admins`)
    ]);

    // Get recent activity (last 10)
    const recentActivity = await pool.query(
      `SELECT * FROM investment_activity_logs ORDER BY created_at DESC LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        totalInvestors: parseInt(totalInvestors.rows[0].count),
        activeInvestors: parseInt(activeInvestors.rows[0].count),
        totalProperties: parseInt(totalProperties.rows[0].count),
        openProperties: parseInt(openProperties.rows[0].count),
        totalAdmins: parseInt(totalAdmins.rows[0].count),
        recentActivity: recentActivity.rows
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
