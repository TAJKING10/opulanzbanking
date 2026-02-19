/**
 * Investment Properties Routes
 *
 * Handles property/offering management for the investment portal.
 *
 * Endpoints:
 * - GET    /api/investment/properties          - List all properties
 * - GET    /api/investment/properties/:id      - Get single property
 * - POST   /api/investment/properties          - Create new property
 * - PATCH  /api/investment/properties/:id      - Update property
 * - DELETE /api/investment/properties/:id      - Delete property
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Log activity
const logActivity = async (type, description, adminId, adminName, propertyId = null, metadata = {}) => {
  try {
    await pool.query(
      `INSERT INTO investment_activity_logs (log_type, description, admin_id, admin_name, property_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [type, description, adminId, adminName, propertyId, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

/**
 * GET /api/investment/properties
 * List all properties with optional filters
 *
 * Query params:
 * - status: open | closing | closed | coming
 * - property_type: residential | commercial | mixed
 * - search: search by title or location
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
router.get('/', async (req, res) => {
  try {
    const { status, property_type, search, limit = 50, offset = 0 } = req.query;

    let query = `SELECT * FROM investment_properties WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (property_type) {
      query += ` AND property_type = $${paramIndex}`;
      params.push(property_type);
      paramIndex++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM investment_properties WHERE 1=1`;
    const countParams = [];
    let countIndex = 1;

    if (status) {
      countQuery += ` AND status = $${countIndex}`;
      countParams.push(status);
      countIndex++;
    }

    if (property_type) {
      countQuery += ` AND property_type = $${countIndex}`;
      countParams.push(property_type);
      countIndex++;
    }

    if (search) {
      countQuery += ` AND (title ILIKE $${countIndex} OR location ILIKE $${countIndex})`;
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
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/properties/:id
 * Get single property by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM investment_properties WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/investment/properties
 * Create new property
 */
router.post('/', async (req, res) => {
  try {
    const {
      title,
      location,
      property_type,
      status = 'coming',
      description,
      features = [],
      images = [],
      size,
      year_built,
      total_value,
      total_shares,
      min_investment,
      target_return,
      investment_term,
      distribution_frequency,
      bank_name,
      bank_iban,
      bank_bic,
      bank_reference,
      documents = [],
      createdBy
    } = req.body;

    // Validation
    if (!title || !location || !property_type) {
      return res.status(400).json({
        success: false,
        error: 'Title, location, and property_type are required'
      });
    }

    // Create property
    const result = await pool.query(
      `INSERT INTO investment_properties
       (title, location, property_type, status, description, features, images,
        size, year_built, total_value, total_shares, min_investment, target_return,
        investment_term, distribution_frequency, bank_name, bank_iban, bank_bic,
        bank_reference, documents, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING *`,
      [
        title, location, property_type, status, description,
        JSON.stringify(features), JSON.stringify(images),
        size, year_built, total_value, total_shares, min_investment, target_return,
        investment_term, distribution_frequency, bank_name, bank_iban, bank_bic,
        bank_reference, JSON.stringify(documents), createdBy
      ]
    );

    const newProperty = result.rows[0];

    // Log activity
    if (createdBy) {
      const creatorResult = await pool.query(`SELECT name FROM investment_admins WHERE id = $1`, [createdBy]);
      const creatorName = creatorResult.rows[0]?.name || 'System';
      await logActivity('offering_created', `Created new property: ${title}`, createdBy, creatorName, newProperty.id);
    }

    res.status(201).json({
      success: true,
      data: newProperty,
      message: 'Property created successfully'
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/investment/properties/:id
 * Update property
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      location,
      property_type,
      status,
      description,
      features,
      images,
      size,
      year_built,
      total_value,
      total_shares,
      min_investment,
      target_return,
      investment_term,
      distribution_frequency,
      bank_name,
      bank_iban,
      bank_bic,
      bank_reference,
      documents,
      updatedBy
    } = req.body;

    // Check if property exists
    const checkResult = await pool.query('SELECT * FROM investment_properties WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    const fieldsToUpdate = {
      title, location, property_type, status, description, size, year_built,
      total_value, total_shares, min_investment, target_return, investment_term,
      distribution_frequency, bank_name, bank_iban, bank_bic, bank_reference
    };

    for (const [field, value] of Object.entries(fieldsToUpdate)) {
      if (value !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    // Handle JSON fields separately
    if (features !== undefined) {
      updates.push(`features = $${paramIndex}`);
      params.push(JSON.stringify(features));
      paramIndex++;
    }

    if (images !== undefined) {
      updates.push(`images = $${paramIndex}`);
      params.push(JSON.stringify(images));
      paramIndex++;
    }

    if (documents !== undefined) {
      updates.push(`documents = $${paramIndex}`);
      params.push(JSON.stringify(documents));
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

    const query = `UPDATE investment_properties SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, params);

    // Log activity
    if (updatedBy) {
      const updaterResult = await pool.query(`SELECT name FROM investment_admins WHERE id = $1`, [updatedBy]);
      const updaterName = updaterResult.rows[0]?.name || 'System';
      await logActivity('offering_updated', `Updated property: ${result.rows[0].title}`, updatedBy, updaterName, parseInt(id));
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/investment/properties/:id
 * Delete property
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy } = req.body;

    // Check if property exists
    const checkResult = await pool.query('SELECT * FROM investment_properties WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    const property = checkResult.rows[0];

    // Delete property
    await pool.query('DELETE FROM investment_properties WHERE id = $1', [id]);

    // Log activity
    if (deletedBy) {
      const deleterResult = await pool.query(`SELECT name FROM investment_admins WHERE id = $1`, [deletedBy]);
      const deleterName = deleterResult.rows[0]?.name || 'System';
      await logActivity('offering_deleted', `Deleted property: ${property.title}`, deletedBy, deleterName, null, { deletedPropertyId: id });
    }

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
