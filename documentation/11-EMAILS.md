# 11 — Email Setup

## Overview

Emails are sent via two methods:
1. **Gmail SMTP + Nodemailer** — backend sends transactional emails (confirmations, receipts, admin alerts)
2. **Calendly** — automatically sends booking confirmation emails when a meeting is scheduled

---

## Email Accounts Used

| Account | Password / App Password | Used For |
|---------|------------------------|---------|
| `opulanz.banking@gmail.com` | App Password: `dpbq smhg oqgb lbub` | All transactional emails |
| Calendly account email | — | Calendly booking notifications (automatic) |

---

## Gmail SMTP Setup (Nodemailer)

The backend uses Gmail to send emails via **SMTP**.

> **IMPORTANT:** Gmail requires an **App Password**, not your regular Gmail password. Regular password will not work with SMTP.

### How to Get/Change the Gmail App Password

1. Go to https://myaccount.google.com
2. Sign in with `opulanz.banking@gmail.com`
3. Click **Security** in the left menu
4. Under **How you sign in to Google**, ensure **2-Step Verification** is ON
5. Search for "App passwords" (or go to https://myaccount.google.com/apppasswords)
6. Under **App passwords**, click **+ Create**
7. Name: `Opulanz Nodemailer`
8. Click **Create**
9. Google shows a 16-character password like `dpbq smhg oqgb lbub`
10. Copy this and put it in `backend/.env` as `EMAIL_PASS=dpbqsmhgoqgblbub` (no spaces)

### Backend `.env` Email Settings
```env
EMAIL_USER=opulanz.banking@gmail.com
EMAIL_PASS=dpbqsmhgoqgblbub
ADMIN_EMAIL=opulanz.banking@gmail.com
```

---

## What Emails Are Sent Automatically

| Trigger | To | Subject | Content |
|---------|-----|---------|---------|
| Investment Advisory booking | Customer | "Booking Confirmed" | Confirmation number, date/time, advisor name |
| Investment Advisory booking | Admin | "New Booking" | Full client profile |
| Life Insurance booking | Customer | "Life Insurance Consultation Confirmed" | Details |
| Tax Advisory booking | Customer | "Tax Advisory Confirmed" | Details |
| KYC submission | Customer | "Application Received" | Application reference |
| KYC approved | Customer | "Your Account Application is Approved" | Next steps |
| DocuSign signature required | Customer | "Please sign your documents" | DocuSign signing link |
| PayPal payment captured | Customer | "Payment Receipt" | Amount, order ID |

---

## Email Service File

**File:** `backend/src/services/emailService.js`

Example usage:
```javascript
const emailService = require('./services/emailService');

// Send booking confirmation
await emailService.sendBookingConfirmation({
  to: "john.doe@example.com",
  name: "John Doe",
  service: "Investment Advisory",
  date: "Monday, July 10, 2026",
  time: "2:00 PM",
  confirmationNumber: "OPZ-20260707-1234"
});

// Send admin notification
await emailService.sendAdminNotification({
  subject: "New Investment Advisory Booking",
  data: { ...bookingDetails }
});
```

---

## Email Templates

Email templates are HTML strings in `backend/src/services/emailService.js`.

Colors used in emails:
- Header background: `#b59354` (gold)
- Text: `#252623` (dark)
- Background: `#f6f8f8` (off-white)

---

## Calendly Email Notifications

Calendly automatically sends emails to:
- The **customer** who books: confirmation with meeting link and calendar invite
- The **host** (opulanz-banking account): notification of new booking

These are configured in the Calendly account settings:
1. Log in at https://calendly.com
2. Go to **Account Settings** → **Notifications**
3. Customize confirmation and reminder emails

---

## Testing Email Sending

```bash
# From the backend folder, you can test email sending
cd C:\Users\Toufi\AndroidStudioProjects\azuree\backend
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'opulanz.banking@gmail.com', pass: 'dpbqsmhgoqgblbub' }
});
transporter.sendMail({
  from: 'opulanz.banking@gmail.com',
  to: 'your-test-email@example.com',
  subject: 'Test Email from Opulanz',
  text: 'Email is working!'
}, (err, info) => {
  if (err) console.error(err);
  else console.log('Sent:', info.response);
});
"
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid login: 535` | Wrong App Password | Generate new App Password |
| `Username and Password not accepted` | 2FA not enabled or wrong password | Enable 2FA first, then create App Password |
| `Connection refused` | Gmail SMTP blocked | Check that port 587 is not blocked by firewall |
| Emails go to spam | Missing SPF/DKIM | Set up email authentication for your domain |
| Emails not sent on production | Missing env vars | Add `EMAIL_USER` and `EMAIL_PASS` to Azure App Service settings |
