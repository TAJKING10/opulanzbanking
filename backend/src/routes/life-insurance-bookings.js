/**
 * Life Insurance Bookings Routes
 *
 * Handles complete life insurance consultation bookings including
 * customer information, service selection, Calendly scheduling, and PayPal payments.
 *
 * Endpoints:
 * - POST   /api/life-insurance-bookings     - Create new booking
 * - GET    /api/life-insurance-bookings     - List all bookings
 * - GET    /api/life-insurance-bookings/:id - Get single booking
 * - GET    /api/life-insurance-bookings/confirmation/:confirmationNumber - Get booking by confirmation number
 * - PATCH  /api/life-insurance-bookings/:id - Update booking status
 * - DELETE /api/life-insurance-bookings/:id - Cancel booking
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * Generate a unique confirmation number
 */
function generateConfirmationNumber() {
  const prefix = 'LIFE';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * POST /api/life-insurance-bookings
 * Create a new life insurance booking
 *
 * Body:
 * {
 *   "type": "life_insurance",
 *   "status": "confirmed",
 *   "customer_info": {
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "email": "john.doe@example.com",
 *     "phone": "+352 123 456 789"
 *   },
 *   "service": {
 *     "id": "whole-life-insurance",
 *     "title": "Whole Life Insurance",
 *     "price": 349
 *   },
 *   "appointment": {
 *     "date": "2025-11-10T14:00:00Z",
 *     "time": "2:00 PM",
 *     "calendlyEventUrl": "https://...",
 *     "calendlyInviteeUrl": "https://..."
 *   },
 *   "payment": {
 *     "method": "paypal",
 *     "orderId": "ORDER-123456",
 *     "status": "COMPLETED",
 *     "payer": { "email": "john.doe@example.com" }
 *   }
 * }
 */
router.post('/', async (req, res) => {
  try {
    const {
      type = 'life_insurance',
      status = 'confirmed',
      customer_info,
      service,
      appointment,
      payment,
      created_at
    } = req.body;

    // Validation
    if (!customer_info || !customer_info.firstName || !customer_info.lastName || !customer_info.email) {
      return res.status(400).json({
        success: false,
        error: 'Customer information (firstName, lastName, email) is required'
      });
    }

    if (!service || !service.id || !service.title || !service.price) {
      return res.status(400).json({
        success: false,
        error: 'Service information (id, title, price) is required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Generate unique confirmation number
    let confirmationNumber;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      confirmationNumber = generateConfirmationNumber();

      // Check if confirmation number already exists
      const duplicate = await pool.query(
        'SELECT id FROM life_insurance_bookings WHERE confirmation_number = $1',
        [confirmationNumber]
      );

      if (duplicate.rows.length === 0) {
        break;
      }

      attempts++;
    }

    if (attempts === maxAttempts) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate unique confirmation number'
      });
    }

    // Insert booking
    const result = await pool.query(
      `INSERT INTO life_insurance_bookings (
        confirmation_number,
        type,
        status,
        customer_info,
        service,
        appointment,
        payment,
        created_at
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_TIMESTAMP))
       RETURNING *`,
      [
        confirmationNumber,
        type,
        status,
        JSON.stringify(customer_info),
        JSON.stringify(service),
        JSON.stringify(appointment || {}),
        JSON.stringify(payment || {}),
        created_at
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating life insurance booking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/life-insurance-bookings
 * List all bookings with optional filters
 *
 * Query params:
 * - status: pending | confirmed | completed | cancelled
 * - email: filter by customer email
 * - serviceId: filter by service ID
 * - from: start date (ISO 8601)
 * - to: end date (ISO 8601)
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
router.get('/', async (req, res) => {
  try {
    const { status, email, serviceId, from, to, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM life_insurance_bookings WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (email) {
      query += ` AND customer_info->>'email' = $${paramIndex}`;
      params.push(email);
      paramIndex++;
    }

    if (serviceId) {
      query += ` AND service->>'id' = $${paramIndex}`;
      params.push(serviceId);
      paramIndex++;
    }

    if (from) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM life_insurance_bookings WHERE 1=1';
    const countParams = [];
    let countIndex = 1;

    if (status) {
      countQuery += ` AND status = $${countIndex}`;
      countParams.push(status);
      countIndex++;
    }

    if (email) {
      countQuery += ` AND customer_info->>'email' = $${countIndex}`;
      countParams.push(email);
      countIndex++;
    }

    if (serviceId) {
      countQuery += ` AND service->>'id' = $${countIndex}`;
      countParams.push(serviceId);
      countIndex++;
    }

    if (from) {
      countQuery += ` AND created_at >= $${countIndex}`;
      countParams.push(from);
      countIndex++;
    }

    if (to) {
      countQuery += ` AND created_at <= $${countIndex}`;
      countParams.push(to);
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
    console.error('Error fetching life insurance bookings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/life-insurance-bookings/:id
 * Get a single booking by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM life_insurance_bookings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/life-insurance-bookings/confirmation/:confirmationNumber
 * Get a booking by confirmation number
 */
router.get('/confirmation/:confirmationNumber', async (req, res) => {
  try {
    const { confirmationNumber } = req.params;

    const result = await pool.query(
      'SELECT * FROM life_insurance_bookings WHERE confirmation_number = $1',
      [confirmationNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/life-insurance-bookings/:id
 * Update a booking (status, etc.)
 *
 * Body:
 * {
 *   "status": "completed"
 * }
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if booking exists
    const checkResult = await pool.query('SELECT * FROM life_insurance_bookings WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
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
      if (status === 'cancelled') {
        updates.push(`cancelled_at = CURRENT_TIMESTAMP`);
      } else if (status === 'completed') {
        updates.push(`completed_at = CURRENT_TIMESTAMP`);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    params.push(id);
    const query = `UPDATE life_insurance_bookings SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/life-insurance-bookings/:id
 * Delete a booking (hard delete - consider using PATCH with status='cancelled' instead)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM life_insurance_bookings WHERE id = $1 RETURNING id, confirmation_number',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
