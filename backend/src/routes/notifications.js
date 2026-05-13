/**
 * Email Notification Routes
 * Handles sending email notifications for appointments and contact form
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Reusable transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * POST /api/notifications/contact
 * Send support contact form emails (to support team + confirmation to user)
 */
router.post('/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const fullName = `${firstName} ${lastName}`;
    const transporter = createTransporter();

    // 1. Email to support team
    await transporter.sendMail({
      from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
      to: 'support@opulanz.com',
      replyTo: email,
      subject: `[Support] ${subject} — ${fullName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
          <div style="background:#b59354;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">OPULANZ BANKING</h1>
            <p style="color:#fff;margin:8px 0 0;opacity:0.9;">New Support Message</p>
          </div>
          <div style="padding:32px;background:#fff;">
            <h2 style="color:#252623;margin-top:0;">Contact Details</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px;"><strong>Name:</strong></td><td style="padding:8px 0;">${fullName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;"><strong>Email:</strong></td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#b59354;">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding:8px 0;color:#6b7280;"><strong>Phone:</strong></td><td style="padding:8px 0;">${phone}</td></tr>` : ''}
              <tr><td style="padding:8px 0;color:#6b7280;"><strong>Subject:</strong></td><td style="padding:8px 0;">${subject}</td></tr>
            </table>
            <div style="margin-top:24px;background:#f6f8f8;border-left:4px solid #b59354;padding:16px 20px;border-radius:0 8px 8px 0;">
              <h3 style="margin-top:0;color:#252623;">Message</h3>
              <p style="white-space:pre-wrap;color:#4b5563;margin:0;">${message}</p>
            </div>
          </div>
          <div style="padding:16px 32px;background:#f6f8f8;text-align:center;color:#9ca3af;font-size:12px;">
            Submitted on ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
          </div>
        </div>
      `,
    });

    // 2. Confirmation email to user
    await transporter.sendMail({
      from: `"Opulanz Banking Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `We received your message — Opulanz Banking`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
          <div style="background:#b59354;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">OPULANZ BANKING</h1>
          </div>
          <div style="padding:32px;background:#fff;">
            <h2 style="color:#252623;margin-top:0;">Thank you, ${firstName}!</h2>
            <p style="color:#4b5563;">We have received your message and our support team will get back to you as soon as possible, typically within <strong>24–48 hours</strong>.</p>
            <div style="background:#f6f8f8;border-left:4px solid #b59354;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Your message</p>
              <p style="margin:0;font-weight:600;color:#252623;">${subject}</p>
              <p style="margin:8px 0 0;white-space:pre-wrap;color:#4b5563;">${message}</p>
            </div>
            <p style="color:#4b5563;">If your request is urgent, you can also reach us directly at:</p>
            <p style="margin:0;"><a href="mailto:support@opulanz.com" style="color:#b59354;font-weight:600;">support@opulanz.com</a></p>
          </div>
          <div style="padding:16px 32px;background:#f6f8f8;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Opulanz Banking. All rights reserved.</p>
            <p style="color:#9ca3af;font-size:12px;margin:4px 0 0;">Luxembourg | France</p>
          </div>
        </div>
      `,
    });

    console.log(`📧 Support contact from ${fullName} <${email}> — Subject: ${subject}`);

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ success: false, error: 'Failed to send message', message: error.message });
  }
});

/**
 * POST /api/notifications/appointment
 * Send appointment confirmation emails
 */
router.post('/appointment', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      appointmentDate,
      appointmentTime,
      meetingType,
      price,
      calendlyLink
    } = req.body;

    // Log the notification request (in production, this would send actual emails)
    console.log('📧 Email Notification Request:');
    console.log('================================');
    console.log(`To Customer: ${customerEmail}`);
    console.log(`Customer Name: ${customerName}`);
    console.log(`Meeting Type: ${meetingType}`);
    console.log(`Date: ${appointmentDate}`);
    console.log(`Time: ${appointmentTime}`);
    console.log(`Price: €${price}`);
    console.log(`Meeting Link: ${calendlyLink || 'Will be sent via Calendly'}`);
    console.log('================================');
    console.log('📧 Email also sent to: opulanz.banking@gmail.com');
    console.log('');

    // In production, integrate with email service like SendGrid, AWS SES, or Nodemailer
    // Example with Nodemailer:
    /*
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Email to customer
    await transporter.sendMail({
      from: 'Opulanz Banking <noreply@opulanz.com>',
      to: customerEmail,
      subject: `Appointment Confirmed: ${meetingType}`,
      html: `
        <h2>Appointment Confirmed</h2>
        <p>Dear ${customerName},</p>
        <p>Your appointment has been confirmed!</p>
        <ul>
          <li><strong>Service:</strong> ${meetingType}</li>
          <li><strong>Date:</strong> ${appointmentDate}</li>
          <li><strong>Time:</strong> ${appointmentTime}</li>
          <li><strong>Price:</strong> €${price}</li>
        </ul>
        <p>You will receive a meeting link via Calendly shortly.</p>
        <p>Best regards,<br>Opulanz Banking Team</p>
      `
    });

    // Email to Opulanz team
    await transporter.sendMail({
      from: 'Opulanz Banking <noreply@opulanz.com>',
      to: 'opulanz.banking@gmail.com',
      subject: `New Appointment: ${meetingType} - ${customerName}`,
      html: `
        <h2>New Appointment Booked</h2>
        <ul>
          <li><strong>Customer:</strong> ${customerName}</li>
          <li><strong>Email:</strong> ${customerEmail}</li>
          <li><strong>Service:</strong> ${meetingType}</li>
          <li><strong>Date:</strong> ${appointmentDate}</li>
          <li><strong>Time:</strong> ${appointmentTime}</li>
          <li><strong>Price:</strong> €${price}</li>
          <li><strong>Meeting Link:</strong> ${calendlyLink || 'Calendly will send'}</li>
        </ul>
      `
    });
    */

    res.json({
      success: true,
      message: 'Email notifications logged (email service not configured)',
      note: 'In production, emails would be sent to customer and opulanz.banking@gmail.com'
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notifications',
      message: error.message
    });
  }
});

module.exports = router;
