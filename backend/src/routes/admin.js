/**
 * Opulanz Admin Routes
 *
 * GET  /api/admin/stats          - Overview stats for all 6 services
 * GET  /api/admin/submissions    - All submissions across all services
 * POST /api/admin/reply          - Send email reply from service-specific inbox
 * POST /api/admin/support-reply  - Reply to support chat + send email
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const nodemailer = require('nodemailer');
const multer = require('multer');
const https = require('https');
const http = require('http');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// Auto-create submission_replies table
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
    `);
    console.log('submission_replies table ready');
  } catch (err) {
    console.error('submission_replies table init error:', err.message);
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
};

function adminAuth(req, res, next) {
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminPass) return next();
  const token = req.headers['x-admin-token'];
  if (token !== adminPass) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

// ─── GET /api/admin/stats ────────────────────────────────────────────────────
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [apps, taxBookings, lifeBookings, invAppointments, invInquiries, chats] = await Promise.all([
      pool.query(`SELECT type, COUNT(*)::int AS count FROM applications GROUP BY type ORDER BY type`),
      pool.query(`SELECT COUNT(*)::int AS count FROM tax_advisory_bookings`).catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`SELECT COUNT(*)::int AS count FROM life_insurance_bookings`).catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`SELECT COUNT(*)::int AS count FROM appointments`).catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`SELECT COUNT(*)::int AS count FROM investment_inquiries`).catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`SELECT status, COUNT(*)::int AS count FROM support_chats GROUP BY status`),
    ]);

    const summary = {
      individual:          0,
      company:             0,
      accounting:          0,
      company_formation:   0,
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
    });

    res.json({ success: true, data: { summary, applications: apps.rows, supportChats: chats.rows } });
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
      };
      const mappedService = serviceMap[r.type] || r.type;

      // Extract email/name based on service type
      let clientEmail = p.email || p.contactEmail || p.directorEmail || null;
      let clientName = p.firstName
        ? `${p.firstName} ${p.lastName || ''}`.trim()
        : (p.companyName || p.company_name || null);

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
          clientEmail = pc.email || null;
        }
        if (!clientName || clientName === 'N/A') {
          clientName = pc.firstName
            ? `${pc.firstName} ${pc.lastName || ''}`.trim()
            : (p.companyName || p.company_name || null);
        }
      }

      // Extract files from payload
      const payloadFiles = [];
      // company_formation: payload.uploads.ids
      if (p.uploads && Array.isArray(p.uploads.ids)) {
        p.uploads.ids.forEach(f => {
          payloadFiles.push({ filename: f.filename || f.name || f.id, size: f.size, type: f.type, id: f.id });
        });
      }
      // company (business account) & accounting: payload.documents
      if (Array.isArray(p.documents)) {
        p.documents.forEach(f => {
          if (f.filename || f.name || f.id || f.fileName) {
            payloadFiles.push({
              filename: f.fileName || f.filename || f.name || f.id,
              size: f.size,
              type: f.type || f.documentType || f.id,
              id: f.id,
              url: f.fileUrl || f.url || null,
            });
          }
        });
      }
      // individual/company: payload.uploadedFiles or payload.files
      const rawFiles = p.uploadedFiles || p.files || p.attachments || [];
      if (Array.isArray(rawFiles)) {
        rawFiles.forEach(f => {
          if (f && (f.filename || f.name || f.id)) {
            payloadFiles.push({ filename: f.filename || f.name || f.id, size: f.size, type: f.type, id: f.id, url: f.url });
          }
        });
      }

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
      if (mt.includes('tax')) svc = 'tax_advisory';
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

// ─── POST /api/admin/reply ───────────────────────────────────────────────────
router.post('/reply', adminAuth, upload.array('attachments', 10), async (req, res) => {
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

    // 1. Files uploaded directly in the form
    if (req.files && req.files.length > 0) {
      req.files.forEach(f => {
        mailAttachments.push({ filename: f.originalname, content: f.buffer, contentType: f.mimetype });
      });
    }

    // 2. Existing document URLs passed from the frontend (fetch and attach)
    let existingDocUrls = [];
    try {
      existingDocUrls = JSON.parse(req.body.existingDocUrls || '[]');
    } catch {}

    for (const doc of existingDocUrls) {
      try {
        const buf = await new Promise((resolve, reject) => {
          const mod = doc.url.startsWith('https') ? https : http;
          mod.get(doc.url, r => {
            const chunks = [];
            r.on('data', c => chunks.push(c));
            r.on('end', () => resolve(Buffer.concat(chunks)));
            r.on('error', reject);
          }).on('error', reject);
        });
        mailAttachments.push({ filename: doc.name, content: buf });
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

    // Save reply to DB
    const attachmentNames = mailAttachments.map(a => a.filename).join(', ');
    await pool.query(
      `INSERT INTO submission_replies (submission_ref, service_type, to_email, to_name, subject, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [submissionRef || toEmail, serviceType || 'general', toEmail, toName || null,
       subject || null, message + (attachmentNames ? `\n\n[Attachments: ${attachmentNames}]` : '')]
    ).catch(err => console.warn('Could not save reply to DB:', err.message));

    console.log(`[Admin Reply] → ${toEmail} | replyTo: ${fromInbox}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Admin reply error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/admin/link-document ───────────────────────────────────────────
// Called by frontend after application is created to register uploaded Azure docs
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
    res.json({ success: true, data: result.rows });
  } catch (err) {
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

module.exports = router;
