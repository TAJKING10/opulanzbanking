/**
 * Opulanz Admin Routes
 *
 * POST /api/admin/login              - Validate admin password
 * GET  /api/admin/stats              - Overview stats for all services
 * GET  /api/admin/submissions         - All submissions across all services
 * PATCH /api/admin/submissions/:source/:id - Update submission status
 * POST /api/admin/reply             - Send email reply from service-specific inbox
 * POST /api/admin/support-reply      - Reply to support chat + send email
 * GET  /api/admin/contacts           - Support form messages
 * PATCH /api/admin/contacts/:id      - Update contact status
 * GET  /api/admin/documents/:id      - Documents for an application
 * GET  /api/admin/replies/:ref       - Reply history for a submission
 * GET  /api/admin/notes/:ref         - Internal notes for a submission
 * POST /api/admin/notes              - Add internal note (not emailed)
 * DELETE /api/admin/notes/:id        - Delete an internal note
 * GET  /api/admin/search             - Global search (submissions, contacts, chats)
 * POST /api/admin/link-document      - Link uploaded Azure doc to application
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const nodemailer = require('nodemailer');
const multer = require('multer');
const https = require('https');
const http = require('http');
const { adminAuth } = require('../middleware/adminAuth');
const azureStorage = require('../services/azureStorage');

function isFileLike(f) {
  if (!f || typeof f !== 'object' || Array.isArray(f)) return false;
  const url = f.url || f.fileUrl || f.file_url;
  const blob = f.blobName || f.blob_name;
  const name = f.filename || f.fileName || f.name;
  const hasUrl = typeof url === 'string' && /^https?:\/\//i.test(url);
  const hasBlob = typeof blob === 'string' && blob.length > 0;
  return (hasUrl || hasBlob) && !!(name || hasUrl || hasBlob);
}

function toAdminFile(f, fallbackType) {
  return {
    filename: f.filename || f.fileName || f.name || 'Document',
    size: f.size || f.fileSize || f.file_size || null,
    type: f.type || f.documentType || fallbackType || 'uploaded_file',
    id: f.id || f.blobName || f.blob_name || null,
    url: f.url || f.fileUrl || f.file_url || null,
    blobName: f.blobName || f.blob_name || null,
  };
}

function collectFilesFromPayload(payload) {
  const out = [];
  const seen = new Set();
  const push = (file) => {
    if (!file || (!file.url && !file.blobName)) return;
    const key = `${file.blobName || ''}|${file.url || ''}|${file.filename}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(file);
  };
  const walk = (node, hint) => {
    if (node == null) return;
    if (Array.isArray(node)) {
      node.forEach((item) => {
        if (isFileLike(item)) push(toAdminFile(item, hint));
        else walk(item, hint);
      });
      return;
    }
    if (typeof node !== 'object') return;
    if (isFileLike(node)) {
      push(toAdminFile(node, hint));
      return;
    }
    if (typeof node.signedDocumentUrl === 'string' && node.signedDocumentUrl) {
      push({
        filename: node.signedDocumentFilename || 'Signed_QCC_Agreement.pdf',
        size: node.signedDocumentSize || null,
        type: 'signed_contract',
        id: node.envelopeId || node.signedDocumentBlobName || null,
        url: node.signedDocumentUrl,
        blobName: node.signedDocumentBlobName || null,
      });
    }
    for (const [k, v] of Object.entries(node)) {
      if (['signedDocumentUrl', 'signedDocumentFilename', 'signedDocumentBlobName', 'signedDocumentSize'].includes(k)) {
        continue;
      }
      walk(v, k);
    }
  };
  walk(payload);
  return out;
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

/** Parse multipart when present; leave JSON body alone otherwise */
function optionalMultipart(req, res, next) {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) {
    return upload.array('attachments', 10)(req, res, next);
  }
  next();
}

// Auto-create admin-related tables
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS submission_replies (
        id SERIAL PRIMARY KEY,
        submission_ref VARCHAR(255) NOT NULL,
        service_type VARCHAR(100) NOT NULL,
        to_email VARCHAR(255) NOT NULL,
        to_name VARCHAR(255),
        subject TEXT,
        message TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_submission_replies_ref ON submission_replies(submission_ref);
      ALTER TABLE submission_replies ADD COLUMN IF NOT EXISTS attachments JSONB;

      CREATE TABLE IF NOT EXISTS support_contacts (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'replied', 'closed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_support_contacts_email ON support_contacts(email);
      CREATE INDEX IF NOT EXISTS idx_support_contacts_status ON support_contacts(status);

      CREATE TABLE IF NOT EXISTS submission_notes (
        id SERIAL PRIMARY KEY,
        submission_ref VARCHAR(255) NOT NULL,
        author_name VARCHAR(255) DEFAULT 'Admin',
        note TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_submission_notes_ref ON submission_notes(submission_ref);
    `);
    console.log('Admin tables (submission_replies, support_contacts, submission_notes) ready');
  } catch (err) {
    console.error('Admin tables init error:', err.message);
  }
})();

const ADMIN_EMAILS = {
  tax_advisory:        process.env.EMAIL_TAX_ADVISORY        || 'tax-ad@opulanz.com',
  investment_advisory: process.env.EMAIL_INVESTMENT_ADVISORY || 'invest-ad@opulanz.com',
  life_insurance:      process.env.EMAIL_LIFE_INSURANCE      || 'insurance@opulanz.com',
  open_account:        process.env.EMAIL_OPEN_ACCOUNT        || 'info@opulanz.com',
  individual:          process.env.EMAIL_OPEN_ACCOUNT        || 'info@opulanz.com',
  company:             process.env.EMAIL_COMPANY_FORMATION   || 'company-set@opulanz.com',
  company_formation:   process.env.EMAIL_COMPANY_FORMATION   || 'company-set@opulanz.com',
  accounting:          process.env.EMAIL_ACCOUNTING          || 'accounting@opulanz.com',
  mortgage:            process.env.EMAIL_MORTGAGE            || 'mortgages@opulanz.com',
};

const SERVICE_LABELS = {
  tax_advisory:        'Tax Advisory',
  investment_advisory: 'Investment Advisory',
  life_insurance:      'Life Insurance',
  open_account:        'Account Opening',
  individual:          'Individual Account',
  company:             'Company Account',
  company_formation:   'Company Formation',
  accounting:          'Accounting & Invoicing',
  mortgage:            'Mortgage Application',
};

const STATUS_BY_SOURCE = {
  application:         ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
  tax_booking:         ['pending', 'confirmed', 'completed', 'cancelled'],
  life_booking:        ['pending', 'confirmed', 'completed', 'cancelled'],
  appointment:         ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
  investment_inquiry:  ['new', 'contacted', 'qualified', 'converted', 'closed'],
};

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

// ─── POST /api/admin/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body || {};
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminPass) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({
          success: false,
          error: 'Admin access is not configured. Set ADMIN_PASSWORD.',
        });
      }
      return res.json({
        success: true,
        data: { token: password || 'dev-open', mode: 'dev' },
        message: 'ADMIN_PASSWORD not set — using open mode (development only)',
      });
    }

    if (!password || password !== adminPass) {
      return res.status(401).json({ success: false, error: 'Incorrect password.' });
    }

    res.json({ success: true, data: { token: adminPass } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/stats ────────────────────────────────────────────────────
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [
      apps, taxBookings, lifeBookings, invAppointments, invInquiries, chats,
      recentApps, recentTax, recentLife, recentAppts, recentInv, openChats,
    ] = await Promise.all([
      pool.query(`SELECT type, COUNT(*)::int AS count FROM applications GROUP BY type ORDER BY type`),
      pool.query(`SELECT COUNT(*)::int AS count FROM tax_advisory_bookings`).catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`SELECT COUNT(*)::int AS count FROM life_insurance_bookings`).catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`SELECT COUNT(*)::int AS count FROM appointments`).catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`SELECT COUNT(*)::int AS count FROM investment_inquiries`).catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`SELECT status, COUNT(*)::int AS count FROM support_chats GROUP BY status`).catch(() => ({ rows: [] })),
      pool.query(
        `SELECT id, type, status, payload, created_at FROM applications ORDER BY created_at DESC LIMIT 5`
      ).catch(() => ({ rows: [] })),
      pool.query(
        `SELECT id, confirmation_number, status, customer_info, created_at
         FROM tax_advisory_bookings ORDER BY created_at DESC LIMIT 5`
      ).catch(() => ({ rows: [] })),
      pool.query(
        `SELECT id, confirmation_number, status, customer_info, created_at
         FROM life_insurance_bookings ORDER BY created_at DESC LIMIT 5`
      ).catch(() => ({ rows: [] })),
      pool.query(
        `SELECT id, full_name, email, status, meeting_type, created_at
         FROM appointments ORDER BY created_at DESC LIMIT 5`
      ).catch(() => ({ rows: [] })),
      pool.query(
        `SELECT id, full_name, email, status, created_at
         FROM investment_inquiries ORDER BY created_at DESC LIMIT 5`
      ).catch(() => ({ rows: [] })),
      pool.query(`
        SELECT
          sc.id, sc.visitor_name, sc.visitor_email, sc.status, sc.last_message_at, sc.created_at,
          (SELECT content FROM support_messages WHERE chat_id = sc.id ORDER BY created_at DESC LIMIT 1) AS last_message
        FROM support_chats sc
        WHERE sc.status IN ('waiting', 'active')
        ORDER BY
          CASE WHEN sc.status = 'waiting' THEN 0 ELSE 1 END,
          sc.last_message_at DESC
        LIMIT 5
      `).catch(() => ({ rows: [] })),
    ]);

    const summary = {
      individual:          0,
      company:             0,
      accounting:          0,
      company_formation:   0,
      mortgage:            0,
      life_insurance:      (lifeBookings.rows[0]?.count || 0),
      tax_advisory:        (taxBookings.rows[0]?.count || 0),
      investment_advisory: (invAppointments.rows[0]?.count || 0) + (invInquiries.rows[0]?.count || 0),
      support_total:       chats.rows.reduce((s, r) => s + r.count, 0),
      support_open:        chats.rows.filter(r => r.status !== 'closed').reduce((s, r) => s + r.count, 0),
    };

    apps.rows.forEach(r => {
      if (r.type === 'individual')        summary.individual        += r.count;
      else if (r.type === 'company')      summary.company           += r.count;
      else if (r.type === 'accounting')   summary.accounting        += r.count;
      else if (r.type === 'company_formation') summary.company_formation += r.count;
      else if (r.type === 'insurance')    summary.life_insurance    += r.count;
      else if (r.type === 'mortgage')     summary.mortgage          += r.count;
      else if (r.type === 'investment_advisory') summary.investment_advisory += r.count;
    });

    const serviceMap = {
      individual: 'individual',
      company: 'company',
      accounting: 'accounting',
      company_formation: 'company_formation',
      insurance: 'life_insurance',
      mortgage: 'mortgage',
      investment_advisory: 'investment_advisory',
    };

    const recentSubmissions = [];

    recentApps.rows.forEach(r => {
      const p = r.payload || {};
      const service = serviceMap[r.type] || r.type;
      let clientEmail = p.email || p.clientEmail || p.contactEmail || p.directorEmail || null;
      let clientName = p.clientName || (p.firstName
        ? `${p.firstName} ${p.lastName || ''}`.trim()
        : (p.legalName || p.companyName || p.company_name || 'N/A'));

      if (service === 'company_formation' || service === 'accounting') {
        const pc = p.primaryContact || p.contact || {};
        const people = [...(p.shareholders || []), ...(p.managers || []), ...(p.directors || [])];
        const first = people[0] || pc;
        if (!clientEmail) clientEmail = first.email || pc.email || null;
        if (!clientName || clientName === 'N/A') {
          const personName = first.firstName ? `${first.firstName} ${first.lastName || ''}`.trim() : null;
          const compName = p.legalName || p.tradeName || p.companyName || p.company_name || null;
          clientName = personName && compName ? `${personName} (${compName})` : (personName || compName || 'N/A');
        }
      } else if (service === 'investment_advisory') {
        const fd = p.formData || {};
        const t1 = fd.titulaire1 || {};
        const ci = fd.companyIdentity || {};
        if (!clientEmail) clientEmail = t1.email || ci.email || fd.email || null;
        if (!clientName || clientName === 'N/A') {
          const personName = t1.firstName ? `${t1.firstName} ${t1.lastName || ''}`.trim() : null;
          const compName = ci.companyName || p.companyName || null;
          clientName = personName || compName || 'N/A';
        }
      }

      recentSubmissions.push({
        id: r.id,
        service,
        status: r.status,
        clientName,
        clientEmail,
        createdAt: r.created_at,
      });
    });

    recentTax.rows.forEach(r => {
      const ci = r.customer_info || {};
      recentSubmissions.push({
        id: `tax-${r.id}`,
        service: 'tax_advisory',
        status: r.status,
        clientName: ci.firstName ? `${ci.firstName} ${ci.lastName || ''}`.trim() : 'N/A',
        clientEmail: ci.email || null,
        createdAt: r.created_at,
      });
    });

    recentLife.rows.forEach(r => {
      const ci = r.customer_info || {};
      recentSubmissions.push({
        id: `life-${r.id}`,
        service: 'life_insurance',
        status: r.status,
        clientName: ci.firstName ? `${ci.firstName} ${ci.lastName || ''}`.trim() : 'N/A',
        clientEmail: ci.email || null,
        createdAt: r.created_at,
      });
    });

    recentAppts.rows.forEach(r => {
      const mt = (r.meeting_type || '').toLowerCase();
      let service = 'investment_advisory';
      if (mt.includes('tax')) service = 'tax_advisory';
      else if (mt.includes('account') || mt.includes('opening')) service = 'individual';
      else if (mt.includes('insurance')) service = 'life_insurance';
      recentSubmissions.push({
        id: `appt-${r.id}`,
        service,
        status: r.status || 'confirmed',
        clientName: r.full_name || 'N/A',
        clientEmail: r.email || null,
        createdAt: r.created_at,
      });
    });

    recentInv.rows.forEach(r => {
      recentSubmissions.push({
        id: `inv-${r.id}`,
        service: 'investment_advisory',
        status: r.status || 'new',
        clientName: r.full_name || 'N/A',
        clientEmail: r.email || null,
        createdAt: r.created_at,
      });
    });

    recentSubmissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: {
        summary,
        applications: apps.rows,
        supportChats: chats.rows,
        recentActivity: {
          submissions: recentSubmissions.slice(0, 5),
          openChats: openChats.rows,
        },
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/submissions ──────────────────────────────────────────────
router.get('/submissions', adminAuth, async (req, res) => {
  try {
    const { service, status, search } = req.query;
    const results = [];

    // 1. Applications (individual, company, accounting, company_formation, insurance)
    const appRows = await pool.query(
      `SELECT id, type, status, payload, created_at, updated_at FROM applications ORDER BY created_at DESC LIMIT 500`
    );
    appRows.rows.forEach(r => {
      const p = r.payload || {};
      const serviceMap = {
        individual: 'individual', company: 'company',
        accounting: 'accounting', company_formation: 'company_formation',
        insurance: 'life_insurance',
        mortgage: 'mortgage',
        investment_advisory: 'investment_advisory',
      };
      const mappedService = serviceMap[r.type] || r.type;

      // Extract email/name based on service type
      let clientEmail = p.email || p.clientEmail || p.contactEmail || p.directorEmail || null;
      let clientName = p.clientName || (p.firstName
        ? `${p.firstName} ${p.lastName || ''}`.trim()
        : (p.legalName || p.companyName || p.company_name || null));

      if (mappedService === 'company_formation') {
        const shareholders = p.shareholders || p.Shareholders || [];
        const managers = p.managers || p.Managers || [];
        const directors = p.directors || p.Directors || [];
        const firstPerson = shareholders[0] || managers[0] || directors[0] || {};
        if (!clientEmail) {
          clientEmail = firstPerson.email || null;
        }
        if (!clientName || clientName === 'N/A') {
          clientName = firstPerson.firstName
            ? `${firstPerson.firstName} ${firstPerson.lastName || ''}`.trim()
            : (p.companyName || p.company_name || null);
        }
      } else if (mappedService === 'accounting') {
        const pc = p.primaryContact || p.contact || {};
        if (!clientEmail) {
          clientEmail = pc.email || p.email || null;
        }
        const personName = pc.firstName ? `${pc.firstName} ${pc.lastName || ''}`.trim() : (p.contactName || null);
        const compName = p.legalName || p.tradeName || p.companyName || p.company_name || null;
        if (personName && compName) {
          clientName = `${personName} (${compName})`;
        } else {
          clientName = personName || compName || clientName || 'N/A';
        }
      } else if (mappedService === 'investment_advisory') {
        const fd = p.formData || {};
        const t1 = fd.titulaire1 || {};
        const ci = fd.companyIdentity || {};
        if (!clientEmail) {
          clientEmail = p.email || t1.email || ci.email || fd.email || null;
        }
        if (!clientName || clientName === 'N/A') {
          const personName = t1.firstName ? `${t1.firstName} ${t1.lastName || ''}`.trim() : null;
          const compName = ci.companyName || p.companyName || null;
          clientName = p.clientName || personName || compName || 'N/A';
        }
      }

      // Extract files from payload
      const payloadFiles = [];
      // company_formation: payload.uploads.{ids, leaseOrDomiciliation, capitalCertificate}
      if (p.uploads && typeof p.uploads === 'object') {
        const pushUpload = (f, fallbackType) => {
          if (!f || !(f.filename || f.name || f.id || f.fileName)) return;
          payloadFiles.push({
            filename: f.filename || f.fileName || f.name || f.id,
            size: f.size,
            type: f.type || fallbackType,
            id: f.id,
            url: f.url || f.fileUrl || null,
            blobName: f.blobName || null,
          });
        };
        if (Array.isArray(p.uploads.ids)) {
          p.uploads.ids.forEach((f) => pushUpload(f, 'id_document'));
        }
        if (Array.isArray(p.uploads.leaseOrDomiciliation)) {
          p.uploads.leaseOrDomiciliation.forEach((f) => pushUpload(f, 'lease'));
        }
        if (p.uploads.capitalCertificate) {
          pushUpload(p.uploads.capitalCertificate, 'capital_certificate');
        }
      }
      // company (business account) & accounting: payload.documents
      if (Array.isArray(p.documents)) {
        p.documents.forEach(f => {
          if (f.filename || f.name || f.id || f.fileName || f.url) {
            payloadFiles.push({
              filename: f.fileName || f.filename || f.name || 'Document',
              size: f.size,
              type: f.type || f.documentType || f.id,
              id: f.id || f.blobName,
              url: f.fileUrl || f.url || null,
              blobName: f.blobName || null,
            });
          }
        });
      }
      // individual/company: payload.uploadedFiles or payload.files
      const rawFiles = p.uploadedFiles || p.files || p.attachments || [];
      if (Array.isArray(rawFiles)) {
        rawFiles.forEach(f => {
          if (f && (f.filename || f.name || f.id || f.url)) {
            payloadFiles.push({
              filename: f.filename || f.name || f.id,
              size: f.size,
              type: f.type,
              id: f.id,
              url: f.url || f.fileUrl || null,
              blobName: f.blobName || null,
            });
          }
        });
      }
      // Signed contract from investment advisory or other digital signature flows
      if (p.signedDocumentUrl && !payloadFiles.some(f => f.url === p.signedDocumentUrl)) {
        payloadFiles.push({
          filename: p.signedDocumentFilename || 'Signed_QCC_Agreement.pdf',
          size: p.signedDocumentSize || null,
          type: 'signed_contract',
          id: p.envelopeId || p.signedDocumentBlobName || null,
          url: p.signedDocumentUrl,
          blobName: p.signedDocumentBlobName || null,
        });
      }

      collectFilesFromPayload(p).forEach((f) => {
        if (!payloadFiles.some((existing) =>
          (existing.url && existing.url === f.url) ||
          (existing.blobName && existing.blobName === f.blobName)
        )) {
          payloadFiles.push(f);
        }
      });

      results.push({
        id: r.id,
        rawId: r.id,
        source: 'application',
        service: mappedService,
        status: r.status,
        clientName: clientName || 'N/A',
        clientEmail: clientEmail || null,
        payload: p,
        payloadFiles,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      });
    });

    // 2. Tax Advisory bookings (columns: service, appointment, payment — NOT service_info etc.)
    const taxRows = await pool.query(
      `SELECT id, confirmation_number, status, customer_info, service, appointment, payment, created_at
       FROM tax_advisory_bookings ORDER BY created_at DESC LIMIT 500`
    ).catch(() => ({ rows: [] }));
    taxRows.rows.forEach(r => {
      const ci = r.customer_info || {};
      const svc = r.service || {};
      const appt = r.appointment || {};
      const pay = r.payment || {};
      results.push({
        id: `tax-${r.id}`,
        rawId: r.id,
        source: 'tax_booking',
        service: 'tax_advisory',
        status: r.status,
        clientName: ci.firstName ? `${ci.firstName} ${ci.lastName || ''}`.trim() : 'N/A',
        clientEmail: ci.email || null,
        confirmationNumber: r.confirmation_number,
        payload: {
          ...ci,
          serviceName: svc.title || svc.name || '',
          servicePrice: svc.price ? `€${svc.price}` : '',
          appointmentDate: appt.date || '',
          appointmentTime: appt.time || '',
          paymentStatus: pay.status || '',
          paypalOrderId: pay.orderId || '',
          confirmationNumber: r.confirmation_number,
        },
        createdAt: r.created_at,
      });
    });

    // 3. Life Insurance bookings (columns: service, appointment, payment)
    const lifeRows = await pool.query(
      `SELECT id, confirmation_number, status, customer_info, service, appointment, payment, created_at
       FROM life_insurance_bookings ORDER BY created_at DESC LIMIT 500`
    ).catch(() => ({ rows: [] }));
    lifeRows.rows.forEach(r => {
      const ci = r.customer_info || {};
      const svc = r.service || {};
      const appt = r.appointment || {};
      results.push({
        id: `life-${r.id}`,
        rawId: r.id,
        source: 'life_booking',
        service: 'life_insurance',
        status: r.status,
        clientName: ci.firstName ? `${ci.firstName} ${ci.lastName || ''}`.trim() : 'N/A',
        clientEmail: ci.email || null,
        confirmationNumber: r.confirmation_number,
        payload: {
          ...ci,
          serviceName: svc.title || svc.name || '',
          appointmentDate: appt.date || '',
          appointmentTime: appt.time || '',
          confirmationNumber: r.confirmation_number,
        },
        createdAt: r.created_at,
      });
    });

    // 4. All appointments (investment advisory, tax advisory via Calendly, account opening consultations)
    const apptRows = await pool.query(
      `SELECT id, full_name, email, phone, status, meeting_type, start_time, end_time, timezone, location, notes, created_at
       FROM appointments ORDER BY created_at DESC LIMIT 500`
    ).catch(() => ({ rows: [] }));
    apptRows.rows.forEach(r => {
      const mt = (r.meeting_type || '').toLowerCase();
      let svc = 'investment_advisory';
      if (mt.includes('investment')) svc = 'investment_advisory';
      else if (mt.includes('tax')) svc = 'tax_advisory';
      else if (mt.includes('account') || mt.includes('opening')) svc = 'individual';
      else if (mt.includes('insurance')) svc = 'life_insurance';
      results.push({
        id: `appt-${r.id}`,
        rawId: r.id,
        source: 'appointment',
        service: svc,
        status: r.status || 'confirmed',
        clientName: r.full_name || 'N/A',
        clientEmail: r.email || null,
        payload: {
          fullName: r.full_name, email: r.email, phone: r.phone,
          meetingType: r.meeting_type,
          startTime: r.start_time, endTime: r.end_time,
          timezone: r.timezone, location: r.location, notes: r.notes,
        },
        createdAt: r.created_at,
      });
    });

    // 5. Investment inquiries (SPV/investment portal contact forms)
    const invInqRows = await pool.query(
      `SELECT id, full_name, email, phone, investor_type, message, status, created_at
       FROM investment_inquiries ORDER BY created_at DESC LIMIT 500`
    ).catch(() => ({ rows: [] }));
    invInqRows.rows.forEach(r => {
      results.push({
        id: `inq-${r.id}`,
        rawId: r.id,
        source: 'investment_inquiry',
        service: 'investment_advisory',
        status: r.status || 'new',
        clientName: r.full_name || 'N/A',
        clientEmail: r.email || null,
        payload: {
          fullName: r.full_name, email: r.email, phone: r.phone,
          investorType: r.investor_type, message: r.message,
        },
        createdAt: r.created_at,
      });
    });

    // Filter by service
    let filtered = results;
    if (service && service !== 'all') {
      filtered = filtered.filter(r => r.service === service);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter(r => r.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r =>
        (r.clientName || '').toLowerCase().includes(q) ||
        (r.clientEmail || '').toLowerCase().includes(q) ||
        (r.confirmationNumber || '').toLowerCase().includes(q) ||
        String(r.rawId).includes(q)
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: filtered, total: filtered.length });
  } catch (err) {
    console.error('Admin submissions error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PATCH /api/admin/submissions/:source/:id ────────────────────────────────
// Update status for any submission source used by the admin dashboard
router.patch('/submissions/:source/:id', adminAuth, async (req, res) => {
  try {
    const { source, id } = req.params;
    const { status, rejection_reason } = req.body || {};

    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' });
    }

    const allowed = STATUS_BY_SOURCE[source];
    if (!allowed) {
      return res.status(400).json({
        success: false,
        error: `Invalid source. Must be one of: ${Object.keys(STATUS_BY_SOURCE).join(', ')}`,
      });
    }
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status for ${source}. Must be one of: ${allowed.join(', ')}`,
      });
    }

    let result;
    if (source === 'application') {
      const updates = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
      const params = [status];
      if (status === 'approved') updates.push('approved_at = CURRENT_TIMESTAMP');
      if (status === 'rejected') {
        updates.push('rejected_at = CURRENT_TIMESTAMP');
        if (rejection_reason !== undefined) {
          params.push(rejection_reason);
          updates.push(`rejection_reason = $${params.length}`);
        }
      }
      params.push(id);
      result = await pool.query(
        `UPDATE applications SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );
    } else if (source === 'tax_booking') {
      result = await pool.query(
        `UPDATE tax_advisory_bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [status, id]
      );
    } else if (source === 'life_booking') {
      result = await pool.query(
        `UPDATE life_insurance_bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [status, id]
      );
    } else if (source === 'appointment') {
      result = await pool.query(
        `UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [status, id]
      );
    } else if (source === 'investment_inquiry') {
      result = await pool.query(
        `UPDATE investment_inquiries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [status, id]
      );
    }

    if (!result || result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Admin status update error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/admin/reply ───────────────────────────────────────────────────
router.post('/reply', adminAuth, optionalMultipart, async (req, res) => {
  try {
    const { toEmail, toName, serviceType, subject, message, submissionRef, adminName = 'Opulanz Support Team' } = req.body;
    if (!toEmail || !message) {
      return res.status(400).json({ success: false, error: 'toEmail and message are required' });
    }

    const fromInbox = ADMIN_EMAILS[serviceType] || 'support@opulanz.com';
    const serviceLabel = SERVICE_LABELS[serviceType] || 'Opulanz Banking';
    const transporter = createTransporter();

    const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f6f8f8;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#b59354,#886844);padding:28px 32px;">
    <h1 style="color:#fff;font-size:22px;margin:0;letter-spacing:2px;">OPULANZ BANKING</h1>
    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">${serviceLabel}</p>
  </div>
  <div style="padding:36px 32px;">
    ${toName ? `<p style="color:#252623;font-size:15px;font-weight:600;margin:0 0 20px;">Dear ${toName},</p>` : ''}
    <div style="color:#444;font-size:14px;line-height:1.8;">${message.replace(/\n/g, '<br/>')}</div>
  </div>
  <div style="background:#f6f8f8;padding:20px 32px;border-top:1px solid #eee;">
    <p style="margin:0;font-size:12px;color:#aaa;">${adminName} · ${serviceLabel}<br/>
    <a href="mailto:${fromInbox}" style="color:#b59354;">${fromInbox}</a></p>
  </div>
</div>
</body></html>`;

    // Build attachments: uploaded files + any existingDocUrls fetched from Azure
    const mailAttachments = [];
    const dbAttachments = [];

    // 1. Files uploaded directly in the form — upload them permanently to Azure
    if (req.files && req.files.length > 0) {
      for (const f of req.files) {
        const safeName = f.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const blobPath = `reply-attachments/${Date.now()}-${safeName}`;
        let uploadResult;

        try {
          if (azureStorage.isConfigured) {
            uploadResult = await azureStorage.uploadDocument(f.buffer, blobPath, f.mimetype);
          } else {
            uploadResult = {
              url: `http://localhost:5000/mock-docs/mock-${Date.now()}-${safeName}`,
              blobName: `mock-${Date.now()}-${safeName}`,
            };
          }
        } catch (upErr) {
          console.warn('⚠️ Azure upload failed for reply attachment:', upErr.message);
          uploadResult = { url: '', blobName: '' };
        }

        mailAttachments.push({ filename: f.originalname, content: f.buffer, contentType: f.mimetype });
        dbAttachments.push({
          filename: f.originalname,
          url: uploadResult.url || null,
          blobName: uploadResult.blobName || null,
        });
      }
    }

    // 2. Existing document URLs passed from the frontend (fetch and attach)
    let existingDocUrls = [];
    try {
      existingDocUrls = JSON.parse(req.body.existingDocUrls || '[]');
    } catch {}

    for (const doc of existingDocUrls) {
      try {
        let buf = null;

        // Prefer Azure blob download when blobName is available (more reliable than SAS URL fetch)
        if (doc.blobName && azureStorage.isConfigured) {
          try {
            buf = await azureStorage.downloadDocument(doc.blobName);
          } catch (azureErr) {
            console.warn(`Azure download failed for ${doc.name}:`, azureErr.message);
          }
        }

        if (!buf && doc.url) {
          buf = await new Promise((resolve, reject) => {
            const mod = doc.url.startsWith('https') ? https : http;
            mod.get(doc.url, r => {
              if (r.statusCode && r.statusCode >= 400) {
                reject(new Error(`HTTP ${r.statusCode}`));
                return;
              }
              const chunks = [];
              r.on('data', c => chunks.push(c));
              r.on('end', () => resolve(Buffer.concat(chunks)));
              r.on('error', reject);
            }).on('error', reject);
          });
        }

        if (!buf) {
          console.warn(`Could not load existing doc ${doc.name} — skipped`);
          continue;
        }

        mailAttachments.push({ filename: doc.name, content: buf });
        dbAttachments.push({
          filename: doc.name,
          url: doc.url || null,
          blobName: doc.blobName || null,
        });
      } catch (e) {
        console.warn(`Could not fetch doc ${doc.name}:`, e.message);
      }
    }

    const mailOptions = {
      from: `"Opulanz — ${serviceLabel}" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      replyTo: fromInbox,
      subject: subject || `Re: Your ${serviceLabel} enquiry — Opulanz`,
      html,
      text: message,
    };
    if (mailAttachments.length > 0) mailOptions.attachments = mailAttachments;

    await transporter.sendMail(mailOptions);

    // Save reply to DB (including structured attachment metadata for View/Download in admin)
    try {
      await pool.query(
        `INSERT INTO submission_replies (submission_ref, service_type, to_email, to_name, subject, message, attachments)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [submissionRef || toEmail, serviceType || 'general', toEmail, toName || null,
         subject || null, message, JSON.stringify(dbAttachments)]
      );
    } catch (err) {
      console.error('Could not save reply to DB:', err.message);
      // Fallback without attachments column (older DBs)
      await pool.query(
        `INSERT INTO submission_replies (submission_ref, service_type, to_email, to_name, subject, message)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [submissionRef || toEmail, serviceType || 'general', toEmail, toName || null,
         subject || null, message]
      ).catch(e2 => console.error('Reply DB fallback also failed:', e2.message));
    }

    console.log(`[Admin Reply] → ${toEmail} | replyTo: ${fromInbox}${dbAttachments.length ? ` | ${dbAttachments.length} attachment(s)` : ''}`);
    res.json({ success: true, attachments: dbAttachments });
  } catch (err) {
    console.error('Admin reply error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/admin/link-document ───────────────────────────────────────────
// Called by public account-opening forms after upload — keep unauthenticated
// (only inserts metadata for an existing application_id; no privileged data returned)
router.post('/link-document', async (req, res) => {
  try {
    const { applicationId, fileName, fileUrl, blobName, type = 'other', size } = req.body;
    if (!applicationId || !fileUrl) {
      return res.status(400).json({ success: false, error: 'applicationId and fileUrl required' });
    }
    const typeMap = {
      'company-registration': 'company_registration',
      'articles': 'articles_of_association',
      'ubo-register': 'other',
      'director-ids': 'national_id',
      'ubo-ids': 'other',
      'business-address': 'other',
    };
    const dbType = typeMap[type] || 'other';
    await pool.query(
      `INSERT INTO documents (application_id, file_name, file_url, blob_name, type, file_size, mime_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       ON CONFLICT DO NOTHING`,
      [applicationId, fileName || blobName, fileUrl, blobName || null, dbType, size || null, null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/documents/:applicationId ─────────────────────────────────
router.get('/documents/:applicationId', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, file_name, file_url, mime_type, type, file_size, created_at, blob_name
       FROM documents WHERE application_id = $1 ORDER BY created_at DESC`,
      [req.params.applicationId]
    );
    // Refresh SAS URLs for private Azure blobs so View/Download works
    const data = result.rows.map((row) => {
      if (row.blob_name && azureStorage.isConfigured) {
        const sasUrl = azureStorage.getSasUrl(row.blob_name, 60 * 24);
        if (sasUrl) return { ...row, file_url: sasUrl };
      }
      return row;
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/file-url ─────────────────────────────────────────────────
// Returns a fresh SAS URL for an Azure blob (admin View)
router.get('/file-url', adminAuth, async (req, res) => {
  try {
    const blobName = req.query.blobName;
    if (!blobName || typeof blobName !== 'string') {
      return res.status(400).json({ success: false, error: 'blobName query param required' });
    }
    if (!azureStorage.isConfigured) {
      return res.status(503).json({
        success: false,
        error: 'Azure Storage is not configured on this server. Set AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER_NAME, then restart.',
      });
    }
    const url = azureStorage.getSasUrl(blobName, 60);
    if (!url) {
      return res.status(500).json({ success: false, error: 'Could not generate SAS URL' });
    }
    res.json({ success: true, url, blobName });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/download-file ────────────────────────────────────────────
// Streams an Azure blob with Content-Disposition: attachment (forces Save As)
router.get('/download-file', adminAuth, async (req, res) => {
  try {
    const blobName = req.query.blobName;
    const fileName = (typeof req.query.fileName === 'string' && req.query.fileName)
      ? req.query.fileName
      : (typeof blobName === 'string' ? blobName.split('/').pop() : 'download');

    if (!blobName || typeof blobName !== 'string') {
      return res.status(400).json({ success: false, error: 'blobName query param required' });
    }
    if (!azureStorage.isConfigured) {
      return res.status(503).json({
        success: false,
        error: 'Azure Storage is not configured on this server. Set AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER_NAME, then restart.',
      });
    }

    const buffer = await azureStorage.downloadDocument(blobName);
    const safeName = String(fileName).replace(/[^\w.\- ()[\]]+/g, '_');
    const lower = safeName.toLowerCase();
    const contentType =
      lower.endsWith('.png') ? 'image/png' :
      lower.endsWith('.jpg') || lower.endsWith('.jpeg') ? 'image/jpeg' :
      lower.endsWith('.pdf') ? 'application/pdf' :
      lower.endsWith('.webp') ? 'image/webp' :
      'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    // inline = preview in browser/iframe; default attachment = force download
    const inline = String(req.query.inline || '') === '1' || String(req.query.disposition || '') === 'inline';
    res.setHeader(
      'Content-Disposition',
      `${inline ? 'inline' : 'attachment'}; filename="${safeName}"`
    );
    res.setHeader('Cache-Control', 'no-store');
    res.send(buffer);
  } catch (err) {
    console.error('Admin download-file error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/replies/:ref ─────────────────────────────────────────────
router.get('/replies/:ref', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM submission_replies WHERE submission_ref = $1 ORDER BY sent_at ASC`,
      [req.params.ref]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/notes/:ref ───────────────────────────────────────────────
router.get('/notes/:ref', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, submission_ref, author_name, note, created_at
       FROM submission_notes WHERE submission_ref = $1 ORDER BY created_at ASC`,
      [req.params.ref]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/admin/notes ───────────────────────────────────────────────────
router.post('/notes', adminAuth, async (req, res) => {
  try {
    const { submissionRef, note, authorName } = req.body || {};
    if (!submissionRef || !note || !String(note).trim()) {
      return res.status(400).json({ success: false, error: 'submissionRef and note are required' });
    }
    const result = await pool.query(
      `INSERT INTO submission_notes (submission_ref, author_name, note)
       VALUES ($1, $2, $3)
       RETURNING id, submission_ref, author_name, note, created_at`,
      [
        String(submissionRef).trim(),
        (authorName || 'Admin').trim().slice(0, 255),
        String(note).trim(),
      ]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/admin/notes/:id ─────────────────────────────────────────────
router.delete('/notes/:id', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM submission_notes WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    res.json({ success: true, data: { id: result.rows[0].id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/admin/support-reply ──────────────────────────────────────────
router.post('/support-reply', adminAuth, async (req, res) => {
  try {
    const { chatId, message, adminName = 'Opulanz Support' } = req.body;
    if (!chatId || !message) {
      return res.status(400).json({ success: false, error: 'chatId and message are required' });
    }

    const chatResult = await pool.query('SELECT * FROM support_chats WHERE id = $1', [chatId]);
    if (!chatResult.rows.length) return res.status(404).json({ success: false, error: 'Chat not found' });
    const chat = chatResult.rows[0];

    await pool.query(
      `INSERT INTO support_messages (chat_id, sender_type, sender_name, content) VALUES ($1, 'admin', $2, $3)`,
      [chatId, adminName, message.trim()]
    );
    await pool.query(
      `UPDATE support_chats SET status = 'active', last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [chatId]
    );

    const transporter = createTransporter();
    const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f6f8f8;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#b59354,#886844);padding:28px 32px;">
    <h1 style="color:#fff;font-size:22px;margin:0;letter-spacing:2px;">OPULANZ BANKING</h1>
    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Support Team</p>
  </div>
  <div style="padding:36px 32px;">
    <p style="color:#252623;font-size:15px;font-weight:600;margin:0 0 20px;">Dear ${chat.visitor_name},</p>
    <div style="color:#444;font-size:14px;line-height:1.8;">${message.replace(/\n/g, '<br/>')}</div>
  </div>
  <div style="background:#f6f8f8;padding:20px 32px;border-top:1px solid #eee;">
    <p style="margin:0;font-size:12px;color:#aaa;">${adminName} · Opulanz Support<br/>
    <a href="mailto:support@opulanz.com" style="color:#b59354;">support@opulanz.com</a></p>
  </div>
</div>
</body></html>`;

    await transporter.sendMail({
      from: `"Opulanz Support" <${process.env.EMAIL_USER}>`,
      to: chat.visitor_email,
      replyTo: 'support@opulanz.com',
      subject: 'Reply from Opulanz Support',
      html,
      text: message,
    });

    console.log(`[Support Reply] Chat #${chatId} → ${chat.visitor_email}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Support reply error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/search ───────────────────────────────────────────────────
router.get('/search', adminAuth, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) {
      return res.json({
        success: true,
        data: { submissions: [], contacts: [], chats: [], query: q },
      });
    }

    const like = `%${q.toLowerCase()}%`;
    const [
      apps,
      taxRows,
      lifeRows,
      apptRows,
      invRows,
      contacts,
      chats,
    ] = await Promise.all([
      pool.query(
        `SELECT id, type, status, payload, created_at
         FROM applications
         WHERE CAST(id AS TEXT) ILIKE $1
            OR LOWER(type) LIKE $1
            OR LOWER(COALESCE(status, '')) LIKE $1
            OR LOWER(payload::text) LIKE $1
         ORDER BY created_at DESC
         LIMIT 8`,
        [like]
      ).catch(() => ({ rows: [] })),
      pool.query(
        `SELECT id, confirmation_number, status, customer_info, created_at
         FROM tax_advisory_bookings
         WHERE LOWER(COALESCE(confirmation_number, '')) LIKE $1
            OR LOWER(customer_info::text) LIKE $1
            OR CAST(id AS TEXT) LIKE $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [like]
      ).catch(() => ({ rows: [] })),
      pool.query(
        `SELECT id, confirmation_number, status, customer_info, created_at
         FROM life_insurance_bookings
         WHERE LOWER(COALESCE(confirmation_number, '')) LIKE $1
            OR LOWER(customer_info::text) LIKE $1
            OR CAST(id AS TEXT) LIKE $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [like]
      ).catch(() => ({ rows: [] })),
      pool.query(
        `SELECT id, full_name, email, status, meeting_type, created_at
         FROM appointments
         WHERE LOWER(COALESCE(full_name, '')) LIKE $1
            OR LOWER(COALESCE(email, '')) LIKE $1
            OR LOWER(COALESCE(meeting_type, '')) LIKE $1
            OR CAST(id AS TEXT) LIKE $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [like]
      ).catch(() => ({ rows: [] })),
      pool.query(
        `SELECT id, full_name, email, status, created_at
         FROM investment_inquiries
         WHERE LOWER(COALESCE(full_name, '')) LIKE $1
            OR LOWER(COALESCE(email, '')) LIKE $1
            OR LOWER(COALESCE(message, '')) LIKE $1
            OR CAST(id AS TEXT) LIKE $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [like]
      ).catch(() => ({ rows: [] })),
      pool.query(
        `SELECT id, first_name, last_name, email, subject, status, created_at
         FROM support_contacts
         WHERE LOWER(first_name) LIKE $1
            OR LOWER(last_name) LIKE $1
            OR LOWER(email) LIKE $1
            OR LOWER(subject) LIKE $1
            OR LOWER(message) LIKE $1
         ORDER BY created_at DESC
         LIMIT 8`,
        [like]
      ).catch(() => ({ rows: [] })),
      pool.query(
        `SELECT
           sc.id, sc.visitor_name, sc.visitor_email, sc.status, sc.last_message_at, sc.created_at,
           (SELECT content FROM support_messages WHERE chat_id = sc.id ORDER BY created_at DESC LIMIT 1) AS last_message
         FROM support_chats sc
         WHERE LOWER(sc.visitor_name) LIKE $1
            OR LOWER(sc.visitor_email) LIKE $1
            OR EXISTS (
              SELECT 1 FROM support_messages sm
              WHERE sm.chat_id = sc.id AND LOWER(sm.content) LIKE $1
            )
         ORDER BY sc.last_message_at DESC NULLS LAST
         LIMIT 8`,
        [like]
      ).catch(() => ({ rows: [] })),
    ]);

    const serviceMap = {
      individual: 'individual',
      company: 'company',
      accounting: 'accounting',
      company_formation: 'company_formation',
      insurance: 'life_insurance',
      mortgage: 'mortgage',
      investment_advisory: 'investment_advisory',
    };

    const submissions = [];

    apps.rows.forEach((r) => {
      const p = r.payload || {};
      const service = serviceMap[r.type] || r.type;
      let clientEmail = p.email || p.clientEmail || p.contactEmail || p.directorEmail || null;
      let clientName = p.clientName || (p.firstName
        ? `${p.firstName} ${p.lastName || ''}`.trim()
        : (p.legalName || p.companyName || p.company_name || null));

      if (service === 'accounting') {
        const pc = p.primaryContact || p.contact || {};
        if (!clientEmail) clientEmail = pc.email || null;
        const personName = pc.firstName ? `${pc.firstName} ${pc.lastName || ''}`.trim() : null;
        const compName = p.legalName || p.tradeName || p.companyName || null;
        clientName = personName && compName ? `${personName} (${compName})` : (personName || compName || clientName || 'N/A');
      } else if (service === 'investment_advisory') {
        const fd = p.formData || {};
        const t1 = fd.titulaire1 || {};
        const ci = fd.companyIdentity || {};
        if (!clientEmail) clientEmail = t1.email || ci.email || fd.email || null;
        if (!clientName || clientName === 'N/A') {
          const personName = t1.firstName ? `${t1.firstName} ${t1.lastName || ''}`.trim() : null;
          const compName = ci.companyName || p.companyName || null;
          clientName = p.clientName || personName || compName || 'N/A';
        }
      }

      clientName = clientName || 'N/A';

      submissions.push({
        type: 'submission',
        id: r.id,
        service,
        status: r.status,
        title: clientName,
        subtitle: clientEmail || service,
        createdAt: r.created_at,
      });
    });

    taxRows.rows.forEach((r) => {
      const ci = r.customer_info || {};
      submissions.push({
        type: 'submission',
        id: `tax-${r.id}`,
        service: 'tax_advisory',
        status: r.status,
        title: ci.firstName ? `${ci.firstName} ${ci.lastName || ''}`.trim() : 'N/A',
        subtitle: ci.email || r.confirmation_number || 'Tax advisory',
        createdAt: r.created_at,
      });
    });

    lifeRows.rows.forEach((r) => {
      const ci = r.customer_info || {};
      submissions.push({
        type: 'submission',
        id: `life-${r.id}`,
        service: 'life_insurance',
        status: r.status,
        title: ci.firstName ? `${ci.firstName} ${ci.lastName || ''}`.trim() : 'N/A',
        subtitle: ci.email || r.confirmation_number || 'Life insurance',
        createdAt: r.created_at,
      });
    });

    apptRows.rows.forEach((r) => {
      const mt = (r.meeting_type || '').toLowerCase();
      let service = 'investment_advisory';
      if (mt.includes('tax')) service = 'tax_advisory';
      else if (mt.includes('account') || mt.includes('opening')) service = 'individual';
      else if (mt.includes('insurance')) service = 'life_insurance';
      submissions.push({
        type: 'submission',
        id: `appt-${r.id}`,
        service,
        status: r.status || 'confirmed',
        title: r.full_name || 'N/A',
        subtitle: r.email || r.meeting_type || 'Appointment',
        createdAt: r.created_at,
      });
    });

    invRows.rows.forEach((r) => {
      submissions.push({
        type: 'submission',
        id: `inv-${r.id}`,
        service: 'investment_advisory',
        status: r.status || 'new',
        title: r.full_name || 'N/A',
        subtitle: r.email || 'Investment inquiry',
        createdAt: r.created_at,
      });
    });

    submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: {
        query: q,
        submissions: submissions.slice(0, 10),
        contacts: contacts.rows.map((c) => ({
          type: 'contact',
          id: c.id,
          status: c.status,
          title: `${c.first_name} ${c.last_name}`.trim(),
          subtitle: c.subject || c.email,
          email: c.email,
          createdAt: c.created_at,
        })),
        chats: chats.rows.map((c) => ({
          type: 'chat',
          id: c.id,
          status: c.status,
          title: c.visitor_name,
          subtitle: c.last_message || c.visitor_email,
          email: c.visitor_email,
          createdAt: c.last_message_at || c.created_at,
        })),
      },
    });
  } catch (err) {
    console.error('Admin search error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/contacts ─────────────────────────────────────────────────
router.get('/contacts', adminAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (status && status !== 'all') { params.push(status); where += ` AND status = $${params.length}`; }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      where += ` AND (LOWER(first_name) LIKE $${params.length} OR LOWER(last_name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(subject) LIKE $${params.length})`;
    }
    const result = await pool.query(
      `SELECT * FROM support_contacts ${where} ORDER BY created_at DESC LIMIT 500`,
      params
    );
    res.json({ success: true, data: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Admin contacts error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PATCH /api/admin/contacts/:id ──────────────────────────────────────────
router.patch('/contacts/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query(
      `UPDATE support_contacts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/inbox/test ───────────────────────────────────────────────
// Diagnose IMAP connectivity — returns raw server response on failure
router.get('/inbox/test', adminAuth, async (req, res) => {
  const { ImapFlow } = require('imapflow');
  const user = process.env.INBOX_USER;
  const pass = process.env.INBOX_PASS;

  if (!user || !pass) {
    return res.status(500).json({
      success: false,
      error: 'INBOX_USER or INBOX_PASS env var is missing on this server',
      user: user || '(not set)',
    });
  }

  const client = new ImapFlow({
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: parseInt(process.env.IMAP_PORT || '993'),
    secure: true,
    auth: { user, pass },
    logger: false,
    tls: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const status = await (async () => {
      const lock = await client.getMailboxLock('INBOX');
      try { return await client.status('INBOX', { messages: true, unseen: true }); }
      finally { lock.release(); }
    })();
    await client.logout();
    return res.json({
      success: true,
      user,
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      messages: status.messages,
      unseen: status.unseen,
    });
  } catch (err) {
    try { await client.logout(); } catch {}
    return res.status(500).json({
      success: false,
      user,
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      error: err.message,
      serverResponse: err.responseText || err.serverResponse || null,
      code: err.code || err.responseCode || null,
    });
  }
});

// ─── GET /api/admin/inbox ────────────────────────────────────────────────────
// List client emails from contact@opulanz.com (automated / Azure mail filtered out)
router.get('/inbox', adminAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);
    const { listInbox } = require('../services/imapInbox');
    const messages = await listInbox({ limit });
    res.json({ success: true, data: messages, total: messages.length });
  } catch (err) {
    console.error('Admin inbox list error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/inbox/:uid ───────────────────────────────────────────────
// Fetch + parse a single email by UID (also marks it as read)
router.get('/inbox/:uid', adminAuth, async (req, res) => {
  try {
    const uid = parseInt(req.params.uid, 10);
    if (!uid || isNaN(uid)) return res.status(400).json({ success: false, error: 'Invalid UID' });
    const { getEmail } = require('../services/imapInbox');
    const email = await getEmail(uid);
    if (!email) return res.status(404).json({ success: false, error: 'Email not found' });
    res.json({ success: true, data: email });
  } catch (err) {
    console.error('Admin inbox read error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
