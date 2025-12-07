/**
 * Documents Routes
 *
 * Handles document metadata for applications (passports, IDs, proofs, etc.)
 *
 * Endpoints:
 * - POST   /api/applications/:id/documents  - Upload document metadata
 * - GET    /api/applications/:id/documents  - List documents for application
 * - GET    /api/documents/:id               - Get single document
 * - PATCH  /api/documents/:id               - Update document (e.g., verification status)
 * - DELETE /api/documents/:id               - Delete document
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * POST /api/applications/:id/documents
 * Add document metadata to an application
 *
 * Body:
 * {
 *   "file_name": "passport.pdf",
 *   "file_url": "https://storage.example.com/docs/passport.pdf",
 *   "type": "passport" | "national_id" | "proof_of_address" | ...,
 *   "file_size": 2048576,
 *   "mime_type": "application/pdf"
 * }
 *
 * Example (Postman):
 * POST http://localhost:5000/api/applications/1/documents
 * Content-Type: application/json
 * {
 *   "file_name": "passport_toufic.pdf",
 *   "file_url": "https://storage.example.com/docs/passport_toufic.pdf",
 *   "type": "passport",
 *   "file_size": 2048576,
 *   "mime_type": "application/pdf"
 * }
 */
router.post('/applications/:id/documents', async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const { file_name, file_url, type, file_size, mime_type, status = 'pending' } = req.body;

    // Validation
    if (!file_name || !file_url || !type) {
      return res.status(400).json({
        success: false,
        error: 'file_name, file_url, and type are required'
      });
    }

    const validTypes = [
      'passport',
      'national_id',
      'drivers_license',
      'proof_of_address',
      'bank_statement',
      'utility_bill',
      'company_registration',
      'articles_of_association',
      'shareholder_register',
      'other'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Check if application exists
    const appCheck = await pool.query('SELECT id FROM applications WHERE id = $1', [applicationId]);
    if (appCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Insert document
    const result = await pool.query(
      `INSERT INTO documents (application_id, file_name, file_url, type, file_size, mime_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [applicationId, file_name, file_url, type, file_size, mime_type, status]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/applications/:id/documents
 * List all documents for an application
 *
 * Example (Postman):
 * GET http://localhost:5000/api/applications/1/documents
 */
router.get('/applications/:id/documents', async (req, res) => {
  try {
    const { id: applicationId } = req.params;

    // Check if application exists
    const appCheck = await pool.query('SELECT id FROM applications WHERE id = $1', [applicationId]);
    if (appCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    const result = await pool.query(
      'SELECT * FROM documents WHERE application_id = $1 ORDER BY created_at DESC',
      [applicationId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/documents/:id
 * Get a single document by ID
 *
 * Example (Postman):
 * GET http://localhost:5000/api/documents/1
 */
router.get('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/documents/:id
 * Update document metadata or verification status
 *
 * Body:
 * {
 *   "status": "verified" | "rejected",
 *   "verification_notes": "Document verified successfully"
 * }
 *
 * Example (Postman):
 * PATCH http://localhost:5000/api/documents/1
 * Content-Type: application/json
 * {
 *   "status": "verified",
 *   "verification_notes": "Passport verified - valid until 2030"
 * }
 */
router.patch('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verification_notes, file_url } = req.body;

    // Check if document exists
    const checkResult = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (status !== undefined) {
      const validStatuses = ['pending', 'verified', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;

      if (status === 'verified') {
        updates.push(`verified_at = CURRENT_TIMESTAMP`);
      }
    }

    if (verification_notes !== undefined) {
      updates.push(`verification_notes = $${paramIndex}`);
      params.push(verification_notes);
      paramIndex++;
    }

    if (file_url !== undefined) {
      updates.push(`file_url = $${paramIndex}`);
      params.push(file_url);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    params.push(id);
    const query = `UPDATE documents SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document
 *
 * Example (Postman):
 * DELETE http://localhost:5000/api/documents/1
 */
router.delete('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM documents WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document deleted successfully',
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
