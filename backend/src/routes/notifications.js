/**
 * Email Notification Routes
 * Handles sending email notifications for appointments
 */

const express = require('express');
const router = express.Router();

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
