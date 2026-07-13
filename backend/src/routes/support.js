const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/support/contact
router.post('/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    const subjectLabels = {
      account: 'Account Opening',
      technical: 'Technical Support',
      company: 'Company Formation',
      billing: 'Billing & Payments',
      other: 'Other',
    };
    const subjectLabel = subjectLabels[subject] || subject;

    // 1. Email to support team
    await emailTransporter.sendMail({
      from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
      to: 'support@opulanz.com',
      replyTo: email,
      subject: `[Support] ${subjectLabel} — ${firstName} ${lastName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f6f8f8;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#b59354,#886844);padding:28px 32px;">
              <h1 style="color:#fff;font-size:22px;margin:0;">New Support Request</h1>
              <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">${subjectLabel}</p>
            </div>
            <div style="padding:32px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#666;font-size:13px;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;color:#252623;">${firstName} ${lastName}</td></tr>
                <tr><td style="padding:8px 0;color:#666;font-size:13px;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#b59354;">${email}</a></td></tr>
                ${phone ? `<tr><td style="padding:8px 0;color:#666;font-size:13px;">Phone</td><td style="padding:8px 0;color:#252623;">${phone}</td></tr>` : ''}
                <tr><td style="padding:8px 0;color:#666;font-size:13px;">Subject</td><td style="padding:8px 0;color:#252623;">${subjectLabel}</td></tr>
              </table>
              <div style="margin-top:24px;padding:20px;background:#f6f8f8;border-radius:12px;border-left:4px solid #b59354;">
                <p style="margin:0 0 8px;font-weight:600;color:#252623;font-size:13px;">Message:</p>
                <p style="margin:0;color:#444;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</p>
              </div>
            </div>
            <div style="background:#f6f8f8;padding:16px 32px;border-top:1px solid #eee;">
              <p style="color:#aaa;font-size:11px;margin:0;">Sent from the Opulanz support form • ${new Date().toISOString()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // 2. Confirmation email to user
    await emailTransporter.sendMail({
      from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
      to: email,
      replyTo: 'support@opulanz.com',
      subject: 'We received your message — Opulanz Support',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f6f8f8;font-family:Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#b59354,#886844);padding:32px;text-align:center;">
              <h1 style="color:#fff;font-size:28px;margin:0;letter-spacing:2px;">OPULANZ</h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Banking Platform</p>
            </div>
            <div style="padding:40px;">
              <h2 style="color:#252623;font-size:20px;margin:0 0 8px;">We've received your message</h2>
              <p style="color:#666;font-size:14px;margin:0 0 24px;">Dear ${firstName},</p>
              <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 16px;">
                Thank you for contacting Opulanz. Your message has been received and our support team will get back to you within <strong>24 hours</strong>.
              </p>
              <div style="background:#f6f8f8;border-radius:12px;padding:20px;margin:24px 0;">
                <p style="margin:0 0 8px;font-weight:600;color:#252623;font-size:13px;">Your request summary:</p>
                <p style="margin:4px 0;color:#555;font-size:13px;"><strong>Subject:</strong> ${subjectLabel}</p>
                <p style="margin:4px 0;color:#555;font-size:13px;"><strong>Message:</strong> ${message.substring(0, 150)}${message.length > 150 ? '...' : ''}</p>
              </div>
              <p style="color:#555;font-size:14px;line-height:1.7;">
                You can also reach us directly at <a href="mailto:support@opulanz.com" style="color:#b59354;font-weight:600;">support@opulanz.com</a>
              </p>
            </div>
            <div style="background:#f6f8f8;padding:20px;text-align:center;border-top:1px solid #eee;">
              <p style="color:#aaa;font-size:11px;margin:0;">© 2026 Opulanz Banking • Regulated by ACPR • SEPA Licensed</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`📧 Support request from ${email} → sent to support@opulanz.com`);
    res.json({ success: true, message: 'Your message has been sent.' });
  } catch (err) {
    console.error('Support contact error:', err.message);
    res.status(500).json({ error: 'Failed to send message. Please email support@opulanz.com directly.' });
  }
});

module.exports = router;
