/**
 * Opulanz Email Service
 *
 * Central email service for all transactional emails.
 * Sends:
 *   1. A confirmation email to the CLIENT
 *   2. A notification email to the relevant ADMIN inbox
 *
 * Admin email routing:
 *   tax_advisory       → tax-ad@opulanz.com
 *   investment_advisory→ invest-ad@opulanz.com
 *   life_insurance     → insurance@opulanz.com
 *   open_account       → info@opulanz.com
 *   company_formation  → company-set@opulanz.com
 *   accounting         → accounting@opulanz.com
 */

const nodemailer = require('nodemailer');

// ─── Admin email mapping ────────────────────────────────────────────────────
const ADMIN_EMAILS = {
  tax_advisory:        process.env.EMAIL_TAX_ADVISORY        || 'tax-ad@opulanz.com',
  investment_advisory: process.env.EMAIL_INVESTMENT_ADVISORY || 'invest-ad@opulanz.com',
  life_insurance:      process.env.EMAIL_LIFE_INSURANCE      || 'insurance@opulanz.com',
  open_account:        process.env.EMAIL_OPEN_ACCOUNT        || 'info@opulanz.com',
  company_formation:   process.env.EMAIL_COMPANY_FORMATION   || 'company-set@opulanz.com',
  accounting:          process.env.EMAIL_ACCOUNTING          || 'accounting@opulanz.com',
};

// ─── Service display names ──────────────────────────────────────────────────
const SERVICE_LABELS = {
  tax_advisory:        'Tax Advisory',
  investment_advisory: 'Investment Advisory',
  life_insurance:      'Life Insurance',
  open_account:        'Account Opening',
  company_formation:   'Company Formation',
  accounting:          'Accounting & Invoicing',
};

// ─── Transporter factory ────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// ─── Standard headers that prevent Gmail treating email as a calendar invite ─
const TRANSACTIONAL_HEADERS = {
  'X-Entity-Ref-ID': `opulanz-${Date.now()}`,
  'X-Mailer': 'Opulanz Banking Mailer',
  'Precedence': 'bulk',
  'Auto-Submitted': 'auto-generated',
};

// ─── Strip HTML tags for plain-text fallback ─────────────────────────────────
function htmlToText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, '  ')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Shared HTML layout helpers ─────────────────────────────────────────────
function emailHeader(title, subtitle) {
  return `
    <div style="background:linear-gradient(135deg,#b59354,#886844);padding:28px 32px;border-radius:10px 10px 0 0;">
      <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:2px;font-family:Arial,sans-serif;">OPULANZ BANKING</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-family:Arial,sans-serif;">${subtitle || 'Financial Services'}</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;padding:36px 32px;border-radius:0 0 10px 10px;">
      <h2 style="margin:0 0 20px;color:#252623;font-size:20px;font-family:Arial,sans-serif;">${title}</h2>`;
}

function emailFooter() {
  return `
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 20px;"/>
      <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;text-align:center;">
        © ${new Date().getFullYear()} Opulanz Banking · Luxembourg &amp; France ·
        <a href="mailto:support@opulanz.com" style="color:#b59354;text-decoration:none;">support@opulanz.com</a>
      </p>
    </div>`;
}

function row(label, value) {
  if (!value && value !== 0) return '';
  return `<tr>
    <td style="padding:8px 0;color:#6b7280;font-size:13px;font-family:Arial,sans-serif;width:190px;vertical-align:top;"><strong>${label}:</strong></td>
    <td style="padding:8px 0;color:#252623;font-size:13px;font-family:Arial,sans-serif;">${value}</td>
  </tr>`;
}

function section(title, rows) {
  return `
    <div style="background:#f6f8f8;border-left:4px solid #b59354;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0;">
      <p style="margin:0 0 12px;font-weight:600;color:#252623;font-size:13px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">${title}</p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>`;
}

function adminHeader(serviceType, clientName) {
  return `
    <div style="background:#252623;padding:20px 28px;border-radius:10px 10px 0 0;">
      <h2 style="margin:0;color:#b59354;font-size:18px;font-family:Arial,sans-serif;">🔔 New ${SERVICE_LABELS[serviceType] || serviceType} Submission</h2>
      <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;font-family:Arial,sans-serif;">Client: <strong style="color:#fff;">${clientName}</strong> · Received: ${new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;padding:28px;border-radius:0 0 10px 10px;">`;
}

function adminFooter() {
  return `
      <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;">
        This is an automated notification from the Opulanz backend.<br/>
        Reply directly to the client at the email listed above.
      </p>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BOOKING EMAIL — Tax Advisory / Life Insurance
//    data: { confirmationNumber, customerInfo, service, appointment, payment }
// ─────────────────────────────────────────────────────────────────────────────
async function sendBookingEmails(serviceType, data) {
  const { confirmationNumber, customerInfo, service, appointment, payment } = data;
  const fullName = `${customerInfo.firstName} ${customerInfo.lastName}`.trim();
  const adminEmail = ADMIN_EMAILS[serviceType];
  const serviceLabel = SERVICE_LABELS[serviceType] || serviceType;

  const appointmentDate = appointment && appointment.date
    ? new Date(appointment.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'To be confirmed';
  const appointmentTime = appointment && appointment.time ? appointment.time : '';

  const transporter = createTransporter();

  const paymentDate = new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' });
  const amountFormatted = service.price > 0 ? `€${Number(service.price).toFixed(2)}` : 'Free consultation';

  // ── 1a. Email to CLIENT ────────────────────────────────────────────────────
  const clientHtml = `<div style="max-width:600px;margin:0 auto;">
    ${emailHeader(`Booking Confirmed — ${service.title}`, 'Your appointment is confirmed')}
    <p style="color:#4b5563;font-size:14px;font-family:Arial,sans-serif;">Dear ${customerInfo.firstName},</p>
    <p style="color:#4b5563;font-size:14px;font-family:Arial,sans-serif;line-height:1.7;">
      Thank you for booking with Opulanz Banking. Your <strong>${service.title}</strong> session is confirmed.
      You will receive a video conference link from Calendly shortly.
    </p>
    ${section('Your Booking Details',
      row('Confirmation #', `<strong style="color:#b59354;">${confirmationNumber}</strong>`) +
      row('Service', `<strong>${service.title}</strong>`) +
      row('Date', appointmentDate) +
      (appointmentTime ? row('Time', appointmentTime) : '') +
      row('Format', 'Video Conference')
    )}
    ${service.price > 0 ? section('Payment Confirmation ✅',
      row('Amount Paid', `<strong style="color:#b59354;font-size:15px;">${amountFormatted}</strong>`) +
      row('Payment Method', 'PayPal') +
      (payment && payment.orderId ? row('PayPal Order ID', payment.orderId) : '') +
      row('Payment Date', paymentDate) +
      row('Status', '<span style="color:#16a34a;font-weight:600;">COMPLETED</span>')
    ) : ''}
    ${section('Your Contact Details',
      row('Name', fullName) +
      row('Email', customerInfo.email) +
      (customerInfo.phone ? row('Phone', customerInfo.phone) : '')
    )}
    <p style="color:#4b5563;font-size:13px;font-family:Arial,sans-serif;line-height:1.7;">
      Questions? Contact us at
      <a href="mailto:support@opulanz.com" style="color:#b59354;">support@opulanz.com</a>
    </p>
    ${emailFooter()}
  </div>`;

  await transporter.sendMail({
    from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
    to: customerInfo.email,
    subject: `Booking Confirmed - ${service.title} - Ref ${confirmationNumber}`,
    html: clientHtml,
    text: htmlToText(clientHtml),
    headers: TRANSACTIONAL_HEADERS,
  });

  // ── 1b. Email to ADMIN ─────────────────────────────────────────────────────
  const adminHtml = `<div style="max-width:650px;margin:0 auto;">
    <div style="background:#252623;padding:20px 28px;border-radius:10px 10px 0 0;">
      <h2 style="margin:0;color:#b59354;font-size:18px;font-family:Arial,sans-serif;">🔔 New Booking — ${service.title}</h2>
      <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;font-family:Arial,sans-serif;">Client: <strong style="color:#fff;">${fullName}</strong> · Received: ${paymentDate}</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;padding:28px;border-radius:0 0 10px 10px;">
    ${section('Client Information',
      row('Full Name', fullName) +
      row('Email', `<a href="mailto:${customerInfo.email}" style="color:#b59354;">${customerInfo.email}</a>`) +
      (customerInfo.phone ? row('Phone', customerInfo.phone) : '')
    )}
    ${section('Booking Details',
      row('Confirmation #', `<strong>${confirmationNumber}</strong>`) +
      row('Service Category', serviceLabel) +
      row('Specific Service', `<strong>${service.title}</strong>`) +
      row('Date', appointmentDate) +
      (appointmentTime ? row('Time', appointmentTime) : '') +
      row('Amount', `<strong>${amountFormatted}</strong>`)
    )}
    ${section('Payment',
      row('Method', 'PayPal') +
      (payment && payment.orderId ? row('Order ID', payment.orderId) : '') +
      row('Status', payment && payment.status ? payment.status : 'COMPLETED') +
      (payment && payment.payer && payment.payer.email ? row('Payer Email', payment.payer.email) : '') +
      row('Payment Date', paymentDate)
    )}
    ${appointment && appointment.calendlyEventUrl ? section('Calendly',
      row('Event URL', `<a href="${appointment.calendlyEventUrl}" style="color:#b59354;">${appointment.calendlyEventUrl}</a>`) +
      (appointment.calendlyInviteeUrl ? row('Invitee URL', `<a href="${appointment.calendlyInviteeUrl}" style="color:#b59354;">${appointment.calendlyInviteeUrl}</a>`) : '')
    ) : ''}
    ${adminFooter()}
  </div>`;

  await transporter.sendMail({
    from: `"Opulanz Notifications" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    replyTo: customerInfo.email,
    subject: `[${service.title}] New Booking - ${fullName} - ${amountFormatted} - ${appointmentDate}`,
    html: adminHtml,
    text: htmlToText(adminHtml),
    headers: TRANSACTIONAL_HEADERS,
  });

  console.log(`📧 [${serviceLabel}] Emails sent → client: ${customerInfo.email} · admin: ${adminEmail}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. INVESTMENT ADVISORY EMAIL — full KYC profile included
//    data: { fullName, email, phone, startTime, notes (JSON string), paypalOrderId }
// ─────────────────────────────────────────────────────────────────────────────
async function sendInvestmentAdvisoryEmails(data) {
  const { fullName, email, startTime, notes, paypalOrderId } = data;
  const adminEmail = ADMIN_EMAILS.investment_advisory;

  let profile = {};
  try { profile = typeof notes === 'string' ? JSON.parse(notes) : (notes || {}); } catch {}

  const appointmentDate = startTime
    ? new Date(startTime).toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'To be confirmed';

  const transporter = createTransporter();

  // ── 2a. Email to CLIENT ────────────────────────────────────────────────────
  const clientHtml = `<div style="max-width:600px;margin:0 auto;">
    ${emailHeader('Investment Advisory Session Confirmed', 'Your consultation is booked')}
    <p style="color:#4b5563;font-size:14px;font-family:Arial,sans-serif;line-height:1.7;">
      Dear ${fullName.split(' ')[0]},<br/><br/>
      Your Investment Advisory consultation has been confirmed. Our advisor will contact you ahead of the meeting.
      You will also receive a video conference link from Calendly.
    </p>
    ${section('Appointment Details',
      row('Date &amp; Time', appointmentDate) +
      row('Format', 'Video Conference') +
      row('Service', 'Investment Advisory Consultation') +
      (profile.amountPaid ? row('Amount Paid', profile.amountPaid) : '') +
      (paypalOrderId ? row('PayPal Order ID', paypalOrderId) : '')
    )}
    <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#92400e;font-family:Arial,sans-serif;line-height:1.7;">
        <strong>📋 To prepare for your session, please have ready:</strong><br/>
        • Overview of your current financial situation<br/>
        • Any existing investment portfolio details<br/>
        • Your financial goals and questions<br/>
        • A copy of your identity document
      </p>
    </div>
    <p style="color:#4b5563;font-size:13px;font-family:Arial,sans-serif;">
      Questions? <a href="mailto:invest-ad@opulanz.com" style="color:#b59354;">invest-ad@opulanz.com</a>
    </p>
    ${emailFooter()}
  </div>`;

  await transporter.sendMail({
    from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Investment Advisory Session Confirmed - ${appointmentDate}`,
    html: clientHtml,
    text: htmlToText(clientHtml),
    headers: TRANSACTIONAL_HEADERS,
  });

  // ── 2b. Email to ADMIN ─────────────────────────────────────────────────────
  const adminHtml = `<div style="max-width:700px;margin:0 auto;">
    ${adminHeader('investment_advisory', fullName)}
    ${section('Appointment',
      row('Date &amp; Time', appointmentDate) +
      row('PayPal Order', paypalOrderId || 'N/A') +
      row('Amount Paid', profile.amountPaid || 'N/A')
    )}
    ${section('Contact',
      row('Full Name', fullName) +
      row('Email', `<a href="mailto:${email}" style="color:#b59354;">${email}</a>`) +
      (profile.phone ? row('Phone', profile.phone) : '')
    )}
    ${profile.nationality || profile.address ? section('Identity & Address',
      (profile.nationality ? row('Nationality', profile.nationality) : '') +
      (profile.address ? row('Address', profile.address) : '') +
      (profile.docType ? row('Document Type', profile.docType) : '') +
      (profile.docNumber ? row('Document Number', profile.docNumber) : '')
    ) : ''}
    ${profile.profession || profile.annualIncome ? section('Financial Profile',
      (profile.profession ? row('Profession', profile.profession) : '') +
      (profile.annualIncome ? row('Annual Income', `€${profile.annualIncome}`) : '') +
      (profile.initialInvestment ? row('Initial Investment', `€${profile.initialInvestment}`) : '') +
      (profile.missionType ? row('Mission Type', profile.missionType) : '') +
      (profile.riskTolerance ? row('Risk Tolerance', profile.riskTolerance) : '')
    ) : ''}
    <p style="font-size:12px;color:#6b7280;font-family:Arial,sans-serif;margin-top:16px;">
      Full KYC profile is saved in the database under <strong>appointments</strong> → notes column.
    </p>
    ${adminFooter()}
  </div>`;

  await transporter.sendMail({
    from: `"Opulanz Notifications" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    replyTo: email,
    subject: `[Investment Advisory] New Booking - ${fullName} - ${appointmentDate}`,
    html: adminHtml,
    text: htmlToText(adminHtml),
    headers: TRANSACTIONAL_HEADERS,
  });

  console.log(`📧 [Investment Advisory] Emails sent → client: ${email} · admin: ${adminEmail}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. APPLICATION EMAIL — Open Account / Company Formation / Accounting
//    data: { applicationId, type, payload }
//    attachments: optional Nodemailer attachments array added to admin email only
//      e.g. [{ filename, content (Buffer), contentType }]
// ─────────────────────────────────────────────────────────────────────────────
async function sendApplicationEmails(applicationType, data, attachments = []) {
  const { applicationId, payload = {} } = data;

  const adminEmail = ADMIN_EMAILS[applicationType] || ADMIN_EMAILS.open_account;
  const serviceLabel = SERVICE_LABELS[applicationType] || applicationType;

  const clientEmail = payload.email || payload.contactEmail || payload.directorEmail;
  if (!clientEmail) {
    console.warn(`[emailService] No client email found for application #${applicationId} — skipping client email`);
    return;
  }

  const clientName = payload.firstName
    ? `${payload.firstName} ${payload.lastName || ''}`.trim()
    : (payload.companyName || 'Client');

  const refCode = applicationType === 'company' || applicationType === 'company_formation'
    ? `OPL-CORP-${applicationId}`
    : `OPL-${applicationId}`;

  const transporter = createTransporter();

  // ── 3a. Email to CLIENT ────────────────────────────────────────────────────
  const nextStep = {
    open_account: 'Our compliance team will review your KYC/KYB documents. We will contact you within 2 business days.',
    company_formation: 'Our company formation specialists will review your submission and contact you to begin the registration process.',
    accounting: 'Our accounting team will review your requirements and contact you to set up your account.',
  }[applicationType] || 'Our team will review your submission and contact you shortly.';

  const clientHtml = `<div style="max-width:600px;margin:0 auto;">
    ${emailHeader(`${serviceLabel} — Application Received`, 'We have received your submission')}
    <p style="color:#4b5563;font-size:14px;font-family:Arial,sans-serif;">Dear ${clientName},</p>
    <p style="color:#4b5563;font-size:14px;font-family:Arial,sans-serif;line-height:1.7;">
      Thank you for submitting your application to Opulanz Banking.
      We have received all your information and our team is reviewing it.
    </p>
    ${section('Application Details',
      row('Reference Number', `<strong style="color:#b59354;">${refCode}</strong>`) +
      row('Service', serviceLabel) +
      row('Status', 'Submitted — Under Review') +
      row('Submitted At', new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }))
    )}
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#166534;font-family:Arial,sans-serif;line-height:1.7;">
        <strong>What happens next?</strong><br/>
        ${nextStep}
      </p>
    </div>
    <p style="color:#4b5563;font-size:13px;font-family:Arial,sans-serif;">
      Questions? <a href="mailto:support@opulanz.com" style="color:#b59354;">support@opulanz.com</a>
    </p>
    ${emailFooter()}
  </div>`;

  await transporter.sendMail({
    from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: `Application Received - ${serviceLabel} - Ref ${refCode}`,
    html: clientHtml,
    text: htmlToText(clientHtml),
    headers: TRANSACTIONAL_HEADERS,
  });

  // ── 3b. Email to ADMIN ─────────────────────────────────────────────────────
  // Build a table of all payload fields dynamically
  const payloadRows = Object.entries(payload)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return row(label, val);
    }).join('');

  const adminHtml = `<div style="max-width:700px;margin:0 auto;">
    ${adminHeader(applicationType, clientName)}
    ${section('Application Summary',
      row('Reference', `<strong>${refCode}</strong>`) +
      row('Service', serviceLabel) +
      row('Client Name', clientName) +
      row('Client Email', `<a href="mailto:${clientEmail}" style="color:#b59354;">${clientEmail}</a>`) +
      row('Submitted', new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }))
    )}
    <div style="background:#f6f8f8;border-left:4px solid #b59354;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0;">
      <p style="margin:0 0 12px;font-weight:600;color:#252623;font-size:13px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">All Submitted Data</p>
      <table style="width:100%;border-collapse:collapse;">${payloadRows}</table>
    </div>
    ${adminFooter()}
  </div>`;

  const adminMailOptions = {
    from: `"Opulanz Notifications" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    replyTo: clientEmail,
    subject: `[${serviceLabel}] New Application #${applicationId} - ${clientName}`,
    html: adminHtml,
    text: htmlToText(adminHtml),
    headers: TRANSACTIONAL_HEADERS,
  };
  if (attachments.length > 0) {
    adminMailOptions.attachments = attachments;
  }
  await transporter.sendMail(adminMailOptions);

  console.log(`📧 [${serviceLabel}] Emails sent → client: ${clientEmail} · admin: ${adminEmail}${attachments.length > 0 ? ` · ${attachments.length} attachment(s)` : ''}`);
}

module.exports = {
  ADMIN_EMAILS,
  sendBookingEmails,
  sendInvestmentAdvisoryEmails,
  sendApplicationEmails,
};
