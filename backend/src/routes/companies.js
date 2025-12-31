/**
 * Companies Routes
 *
 * Handles company information for business account applications.
 *
 * Endpoints:
 * - POST   /api/companies     - Create new company
 * - GET    /api/companies     - List all companies
 * - GET    /api/companies/:id - Get single company
 * - PATCH  /api/companies/:id - Update company
 * - DELETE /api/companies/:id - Delete company
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * POST /api/companies
 * Create a new company
 *
 * Body:
 * {
 *   "name": "Tech Solutions SA",
 *   "registration_number": "B123456",
 *   "country": "LU",
 *   "legal_form": "SA",
 *   "industry": "Technology",
 *   "email": "contact@techsolutions.lu",
 *   "phone": "+352-123-456",
 *   "registered_address": {
 *     "street": "1 Avenue de la Liberté",
 *     "city": "Luxembourg",
 *     "zip": "1009",
 *     "country": "LU"
 *   }
 * }
 *
 * Example (Postman):
 * POST http://localhost:5000/api/companies
 * Content-Type: application/json
 * {
 *   "name": "Advensys Trading SARL",
 *   "registration_number": "B234567",
 *   "country": "LU",
 *   "legal_form": "SARL",
 *   "industry": "Trading",
 *   "email": "contact@advensys-trading.lv",
 *   "phone": "+352-123-456-789"
 * }
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      registration_number,
      country,
      legal_form,
      industry,
      tax_id,
      incorporation_date,
      registered_address,
      business_address,
      website,
      phone,
      email,
      number_of_employees,
      annual_revenue
    } = req.body;

    // Validation
    if (!name || !registration_number || !country) {
      return res.status(400).json({
        success: false,
        error: 'name, registration_number, and country are required'
      });
    }

    if (country.length !== 2) {
      return res.status(400).json({
        success: false,
        error: 'country must be a 2-letter ISO code (e.g., LU, FR)'
      });
    }

    // Check for duplicate registration
    const duplicate = await pool.query(
      'SELECT id FROM companies WHERE registration_number = $1 AND country = $2',
      [registration_number, country]
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Company with this registration number already exists in this country'
      });
    }

    // Insert company
    const result = await pool.query(
      `INSERT INTO companies (
        name, registration_number, country, legal_form, industry, tax_id,
        incorporation_date, registered_address, business_address, website,
        phone, email, number_of_employees, annual_revenue
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        name,
        registration_number,
        country,
        legal_form,
        industry,
        tax_id,
        incorporation_date,
        registered_address ? JSON.stringify(registered_address) : null,
        business_address ? JSON.stringify(business_address) : null,
        website,
        phone,
        email,
        number_of_employees,
        annual_revenue
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/companies
 * List all companies with optional filters
 *
 * Query params:
 * - country: 2-letter ISO code (e.g., LU, FR)
 * - industry: industry name
 * - limit: number (default 50)
 * - offset: number (default 0)
 *
 * Example (Postman):
 * GET http://localhost:5000/api/companies
 * GET http://localhost:5000/api/companies?country=LU
 * GET http://localhost:5000/api/companies?industry=Technology
 */
router.get('/', async (req, res) => {
  try {
    const { country, industry, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM companies WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (country) {
      query += ` AND country = $${paramIndex}`;
      params.push(country);
      paramIndex++;
    }

    if (industry) {
      query += ` AND industry = $${paramIndex}`;
      params.push(industry);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM companies WHERE 1=1';
    const countParams = [];
    let countIndex = 1;

    if (country) {
      countQuery += ` AND country = $${countIndex}`;
      countParams.push(country);
      countIndex++;
    }

    if (industry) {
      countQuery += ` AND industry = $${countIndex}`;
      countParams.push(industry);
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
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/companies/:id
 * Get a single company by ID
 *
 * Example (Postman):
 * GET http://localhost:5000/api/companies/1
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/companies/:id
 * Update a company
 *
 * Body can include any company fields to update
 *
 * Example (Postman):
 * PATCH http://localhost:5000/api/companies/1
 * Content-Type: application/json
 * {
 *   "phone": "+352-999-888-777",
 *   "email": "new-contact@advensys-trading.lv",
 *   "narvi_company_id": "narvi_comp_abc123"
 * }
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      legal_form,
      industry,
      tax_id,
      incorporation_date,
      registered_address,
      business_address,
      website,
      phone,
      email,
      number_of_employees,
      annual_revenue,
      narvi_company_id
    } = req.body;

    // Check if company exists
    const checkResult = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
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

    if (legal_form !== undefined) {
      updates.push(`legal_form = $${paramIndex}`);
      params.push(legal_form);
      paramIndex++;
    }

    if (industry !== undefined) {
      updates.push(`industry = $${paramIndex}`);
      params.push(industry);
      paramIndex++;
    }

    if (tax_id !== undefined) {
      updates.push(`tax_id = $${paramIndex}`);
      params.push(tax_id);
      paramIndex++;
    }

    if (incorporation_date !== undefined) {
      updates.push(`incorporation_date = $${paramIndex}`);
      params.push(incorporation_date);
      paramIndex++;
    }

    if (registered_address !== undefined) {
      updates.push(`registered_address = $${paramIndex}`);
      params.push(JSON.stringify(registered_address));
      paramIndex++;
    }

    if (business_address !== undefined) {
      updates.push(`business_address = $${paramIndex}`);
      params.push(JSON.stringify(business_address));
      paramIndex++;
    }

    if (website !== undefined) {
      updates.push(`website = $${paramIndex}`);
      params.push(website);
      paramIndex++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      params.push(phone);
      paramIndex++;
    }

    if (email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }

    if (number_of_employees !== undefined) {
      updates.push(`number_of_employees = $${paramIndex}`);
      params.push(number_of_employees);
      paramIndex++;
    }

    if (annual_revenue !== undefined) {
      updates.push(`annual_revenue = $${paramIndex}`);
      params.push(annual_revenue);
      paramIndex++;
    }

    if (narvi_company_id !== undefined) {
      updates.push(`narvi_company_id = $${paramIndex}`);
      params.push(narvi_company_id);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    params.push(id);
    const query = `UPDATE companies SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/companies/:id
 * Delete a company
 *
 * Example (Postman):
 * DELETE http://localhost:5000/api/companies/1
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM companies WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    res.json({
      success: true,
      message: 'Company deleted successfully',
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
