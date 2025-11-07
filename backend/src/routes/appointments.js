/**
 * Appointments Routes
 *
 * Handles appointment bookings from Calendly integration.
 *
 * Endpoints:
 * - POST   /api/appointments     - Create new appointment
 * - GET    /api/appointments     - List all appointments
 * - GET    /api/appointments/:id - Get single appointment
 * - PATCH  /api/appointments/:id - Update appointment
 * - DELETE /api/appointments/:id - Cancel appointment
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * POST /api/appointments
 * Create a new appointment (typically from Calendly webhook or redirect)
 *
 * Body:
 * {
 *   "full_name": "Toufic Jandah",
 *   "email": "toufic@advensys-trading.lv",
 *   "phone": "+352-123-456-789",
 *   "calendly_id": "evt_abc123",
 *   "calendly_event_uri": "https://api.calendly.com/scheduled_events/...",
 *   "meeting_type": "Account Opening Consultation",
 *   "start_time": "2025-11-05T10:00:00Z",
 *   "end_time": "2025-11-05T10:30:00Z",
 *   "timezone": "Europe/Luxembourg",
 *   "location": "Video Call"
 * }
 *
 * Example (Postman):
 * POST http://localhost:5000/api/appointments
 * Content-Type: application/json
 * {
 *   "full_name": "Toufic Jandah",
 *   "email": "toufic@advensys-trading.lv",
 *   "phone": "+352-123-456-789",
 *   "calendly_id": "evt_calendly_001",
 *   "meeting_type": "Account Opening Consultation",
 *   "start_time": "2025-11-05T10:00:00Z",
 *   "end_time": "2025-11-05T10:30:00Z",
 *   "timezone": "Europe/Luxembourg"
 * }
 */
router.post('/', async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      calendly_id,
      calendly_event_uri,
      meeting_type,
      status = 'scheduled',
      start_time,
      end_time,
      timezone,
      location,
      notes
    } = req.body;

    // Validation
    if (!full_name || !email || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        error: 'full_name, email, start_time, and end_time are required'
      });
    }

    const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check for duplicate Calendly ID
    if (calendly_id) {
      const duplicate = await pool.query(
        'SELECT id FROM appointments WHERE calendly_id = $1',
        [calendly_id]
      );

      if (duplicate.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Appointment with this Calendly ID already exists',
          data: duplicate.rows[0]
        });
      }
    }

    // Insert appointment
    const result = await pool.query(
      `INSERT INTO appointments (
        full_name, email, phone, calendly_id, calendly_event_uri,
        meeting_type, status, start_time, end_time, timezone, location, notes
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        full_name,
        email,
        phone,
        calendly_id,
        calendly_event_uri,
        meeting_type,
        status,
        start_time,
        end_time,
        timezone,
        location,
        notes
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/appointments
 * List all appointments with optional filters
 *
 * Query params:
 * - status: scheduled | confirmed | completed | cancelled | no_show
 * - email: filter by customer email
 * - from: start date (ISO 8601)
 * - to: end date (ISO 8601)
 * - limit: number (default 50)
 * - offset: number (default 0)
 *
 * Example (Postman):
 * GET http://localhost:5000/api/appointments
 * GET http://localhost:5000/api/appointments?status=scheduled
 * GET http://localhost:5000/api/appointments?email=toufic@advensys-trading.lv
 * GET http://localhost:5000/api/appointments?from=2025-11-01&to=2025-11-30
 */
router.get('/', async (req, res) => {
  try {
    const { status, email, from, to, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM appointments WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (email) {
      query += ` AND email = $${paramIndex}`;
      params.push(email);
      paramIndex++;
    }

    if (from) {
      query += ` AND start_time >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      query += ` AND start_time <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    query += ` ORDER BY start_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM appointments WHERE 1=1';
    const countParams = [];
    let countIndex = 1;

    if (status) {
      countQuery += ` AND status = $${countIndex}`;
      countParams.push(status);
      countIndex++;
    }

    if (email) {
      countQuery += ` AND email = $${countIndex}`;
      countParams.push(email);
      countIndex++;
    }

    if (from) {
      countQuery += ` AND start_time >= $${countIndex}`;
      countParams.push(from);
      countIndex++;
    }

    if (to) {
      countQuery += ` AND start_time <= $${countIndex}`;
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
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/appointments/:id
 * Get a single appointment by ID
 *
 * Example (Postman):
 * GET http://localhost:5000/api/appointments/1
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/appointments/:id
 * Update an appointment (status, notes, etc.)
 *
 * Body:
 * {
 *   "status": "completed",
 *   "notes": "Client opened individual account"
 * }
 *
 * Example (Postman):
 * PATCH http://localhost:5000/api/appointments/1
 * Content-Type: application/json
 * {
 *   "status": "completed",
 *   "notes": "Successful consultation - client will proceed with account opening"
 * }
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, cancel_reason } = req.body;

    // Check if appointment exists
    const checkResult = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (status !== undefined) {
      const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
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

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }

    if (cancel_reason !== undefined) {
      updates.push(`cancel_reason = $${paramIndex}`);
      params.push(cancel_reason);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    params.push(id);
    const query = `UPDATE appointments SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/appointments/:id
 * Delete an appointment (hard delete - consider using PATCH with status='cancelled' instead)
 *
 * Example (Postman):
 * DELETE http://localhost:5000/api/appointments/1
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM appointments WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
