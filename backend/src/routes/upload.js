/**
 * File Upload Route
 * POST /api/upload
 *
 * Receives a file via multipart/form-data, uploads it to Azure Blob Storage,
 * optionally saves a document record to PostgreSQL, and returns the blob URL.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const azureStorage = require('../services/azureStorage');
const { pool } = require('../config/db');
const tempFileStore = require('../services/tempFileStore');

// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_MIMES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ── Multer config (permanent upload → Azure Blob) ─────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB hard cap
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, PNG, JPG, DOC, and DOCX files are allowed'));
    }
  },
});

// ── Multer config (temp upload → in-memory store for email attachments) ───────
const uploadTemp = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED_MIMES.includes(file.mimetype));
  },
});

/**
 * POST /api/upload
 *
 * Form fields:
 *   file          (required)  — the file binary
 *   type          (optional)  — document type label stored in DB
 *                               e.g. incorporation_certificate | articles |
 *                                    vat_certificate | director_id | other
 *   applicationId (optional)  — if provided, saves a row in the documents table
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const { type = 'other', applicationId } = req.body;

    // Build a safe, unique blob path: type/timestamp-originalname
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const blobPath  = `${type}/${Date.now()}-${safeName}`;

    console.log(`📤 Uploading "${req.file.originalname}" (${(req.file.size / 1024).toFixed(1)} KB) → Azure Blob: ${blobPath}`);

    // ── Upload to Azure Blob Storage ─────────────────────────────────────────
    const uploadResult = await azureStorage.uploadDocument(
      req.file.buffer,
      blobPath,
      req.file.mimetype
    );

    console.log(uploadResult.isMock
      ? `📁 Mock upload (Azure Storage not configured): ${uploadResult.url}`
      : `✅ Uploaded to Azure: ${uploadResult.url}`
    );

    // ── Optionally save document record to PostgreSQL ────────────────────────
    let documentId = null;
    if (applicationId) {
      try {
        // Map frontend doc types to the valid types in the documents table
        const typeMap = {
          incorporation_certificate: 'company_registration',
          articles:                  'articles_of_association',
          vat_certificate:           'other',
          director_id:               'national_id',
        };
        const dbType = typeMap[type] || 'other';

        const result = await pool.query(
          `INSERT INTO documents
             (application_id, file_name, file_url, blob_name, type, file_size, mime_type, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
           RETURNING id`,
          [
            applicationId,
            req.file.originalname,
            uploadResult.url,
            uploadResult.blobName || null,
            dbType,
            req.file.size,
            req.file.mimetype,
          ]
        );
        documentId = result.rows[0].id;
        console.log(`💾 Document record saved — id: ${documentId}`);
      } catch (dbErr) {
        // Non-blocking: the file is already uploaded; don't fail the request
        console.warn('⚠️  DB record save failed (non-blocking):', dbErr.message);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        fileId:     uploadResult.blobName,
        fileName:   req.file.originalname,
        fileSize:   req.file.size,
        mimeType:   req.file.mimetype,
        fileUrl:    uploadResult.url,
        blobName:   uploadResult.blobName,
        isMock:     uploadResult.isMock || false,
        documentId,
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/upload/temp
 *
 * Stores the file in the in-memory temp store (30-min TTL) and returns a
 * tempId. Used by the frontend to hold files until a form is submitted, at
 * which point notification routes fetch the buffers and attach them to the
 * admin email.
 */
router.post('/temp', uploadTemp.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file provided' });
  }
  const tempId = tempFileStore.put(req.file.buffer, req.file.originalname, req.file.mimetype);
  console.log(`🗂️  Temp file stored: "${req.file.originalname}" (${(req.file.size / 1024).toFixed(1)} KB) → tempId: ${tempId}`);
  res.status(201).json({
    success: true,
    tempId,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
  });
});

// ── Multer error handler ──────────────────────────────────────────────────────
router.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10 MB.' });
  }
  res.status(400).json({ success: false, error: err.message });
});

module.exports = router;
