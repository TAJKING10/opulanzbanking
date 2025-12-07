# EmailJS Setup Guide for Opulanz Banking

This guide will help you set up EmailJS to send receipt emails to customers and admin after successful payments.

## 📋 Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Click "Sign Up" and create a free account
3. Verify your email address

## 📧 Step 2: Add Email Service

1. Go to **Email Services** in the left sidebar
2. Click **Add New Service**
3. Choose **Gmail** (or your preferred email provider)
4. Follow the instructions to connect your `opulanz.banking@gmail.com` account:
   - Click "Connect Account"
   - Sign in with your Gmail
   - Allow EmailJS to send emails on your behalf
5. **Service ID** will be generated (e.g., `service_abc1234`)
6. Keep this Service ID - you'll need it later

## 📝 Step 3: Create Customer Receipt Template

1. Go to **Email Templates** in the left sidebar
2. Click **Create New Template**
3. **Template Name**: `Customer Receipt`
4. **Template ID** will be auto-generated (e.g., `template_xyz5678`)
5. Configure the template:

### Template Settings:
- **To Email**: `{{to_email}}`
- **From Name**: `Opulanz Banking`
- **From Email**: `opulanz.banking@gmail.com`
- **Subject**: `Payment Receipt - {{service_name}} - Order #{{order_id}}`

### Email Content (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #252623;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #b59354 0%, #886844 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f6f8f8;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .info-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #b59354;
        }
        .info-row {
            display: flex;
            justify-between;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #666;
        }
        .value {
            color: #252623;
        }
        .total {
            font-size: 24px;
            color: #b59354;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Confirmed!</h1>
            <p>Thank you for your payment</p>
        </div>
        <div class="content">
            <p>Dear {{to_name}},</p>
            <p>Your payment for <strong>{{service_name}}</strong> has been successfully processed.</p>

            <div class="info-box">
                <h3>Appointment Details</h3>
                <div class="info-row">
                    <span class="label">Service:</span>
                    <span class="value">{{service_name}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Date:</span>
                    <span class="value">{{appointment_date}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Time:</span>
                    <span class="value">{{appointment_time}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Duration:</span>
                    <span class="value">60 minutes</span>
                </div>
            </div>

            <div class="info-box">
                <h3>Payment Details</h3>
                <div class="info-row">
                    <span class="label">Order ID:</span>
                    <span class="value">{{order_id}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Service Fee (excl. VAT):</span>
                    <span class="value">{{service_fee}}</span>
                </div>
                <div class="info-row">
                    <span class="label">VAT (17%):</span>
                    <span class="value">{{vat}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Total (incl. VAT):</span>
                    <span class="value total">{{amount}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Payment Status:</span>
                    <span class="value">{{payment_status}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Payment Date:</span>
                    <span class="value">{{payment_date}}</span>
                </div>
            </div>

            <p><strong>What's Next?</strong></p>
            <ul>
                <li>✓ Check your email for the Google Meet link from Calendly</li>
                <li>✓ Prepare any questions or documents for the consultation</li>
                <li>✓ Join the meeting at the scheduled time</li>
            </ul>

            <p>If you have any questions, please don't hesitate to contact us at opulanz.banking@gmail.com</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Opulanz Banking. All rights reserved.</p>
            <p>This is an automated receipt. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
```

6. Click **Save**
7. **Copy the Template ID** (you'll need it later)

## 📝 Step 4: Create Admin Notification Template

1. Click **Create New Template** again
2. **Template Name**: `Admin Notification`
3. **Template ID** will be auto-generated (e.g., `template_admin789`)
4. Configure the template:

### Template Settings:
- **To Email**: `{{to_email}}` (will be opulanz.banking@gmail.com)
- **From Name**: `Opulanz System`
- **From Email**: `opulanz.banking@gmail.com`
- **Subject**: `New Booking - {{service_name}} - {{to_name}}`

### Email Content (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #252623;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #252623;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .alert {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }
        .info-box {
            background: #f6f8f8;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .info-row {
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        strong {
            color: #b59354;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔔 New Booking Alert</h2>
        </div>
        <div class="content">
            <div class="alert">
                <strong>⚠️ Action Required:</strong> A new consultation has been booked and paid.
            </div>

            <h3>Client Information</h3>
            <div class="info-box">
                <div class="info-row"><strong>Name:</strong> {{to_name}}</div>
                <div class="info-row"><strong>Email:</strong> {{to_email}}</div>
                <div class="info-row"><strong>Service:</strong> {{service_name}}</div>
            </div>

            <h3>Appointment Details</h3>
            <div class="info-box">
                <div class="info-row"><strong>Date:</strong> {{appointment_date}}</div>
                <div class="info-row"><strong>Time:</strong> {{appointment_time}}</div>
                <div class="info-row"><strong>Duration:</strong> 60 minutes</div>
            </div>

            <h3>Payment Details</h3>
            <div class="info-box">
                <div class="info-row"><strong>Order ID:</strong> {{order_id}}</div>
                <div class="info-row"><strong>Amount Paid:</strong> {{amount}}</div>
                <div class="info-row"><strong>Status:</strong> {{payment_status}}</div>
                <div class="info-row"><strong>Payment Time:</strong> {{payment_date}}</div>
            </div>

            <hr>
            <p><small>This is an automated notification from Opulanz Banking System</small></p>
        </div>
    </div>
</body>
</html>
```

5. Click **Save**
6. **Copy the Template ID** (you'll need it later)

## 🔑 Step 5: Get Your Public Key

1. Go to **Account** → **General**
2. Find **Public Key** section
3. **Copy your Public Key** (e.g., `user_abc123xyz`)

## ⚙️ Step 6: Update Your Code

Now you need to update the tax advisory service files with your EmailJS credentials.

### Files to update (all 5 services):
1. `app/[locale]/tax-advisory/tax-compliance/page.tsx`
2. `app/[locale]/tax-advisory/personal-tax-advisory/page.tsx`
3. `app/[locale]/tax-advisory/tax-return-preparation/page.tsx`
4. `app/[locale]/tax-advisory/international-tax/page.tsx`
5. `app/[locale]/tax-advisory/corporate-tax/page.tsx`

### Find and replace these placeholders in each file:

1. **Replace** `'YOUR_PUBLIC_KEY'` with your EmailJS Public Key (appears 3 times per file)
2. **Replace** `'YOUR_SERVICE_ID'` with your EmailJS Service ID (appears 2 times per file)
3. **Replace** `'YOUR_TEMPLATE_ID'` with your Customer Template ID (appears 1 time per file)
4. **Replace** `'YOUR_ADMIN_TEMPLATE_ID'` with your Admin Template ID (appears 1 time per file)

### Example:
```typescript
// BEFORE
emailjs.init('YOUR_PUBLIC_KEY');

// AFTER (example with your actual keys)
emailjs.init('user_abc123xyz');
```

```typescript
// BEFORE
await emailjs.send(
  'YOUR_SERVICE_ID',
  'YOUR_TEMPLATE_ID',
  templateParams,
  'YOUR_PUBLIC_KEY'
);

// AFTER (example with your actual keys)
await emailjs.send(
  'service_abc1234',
  'template_xyz5678',
  templateParams,
  'user_abc123xyz'
);
```

## 🧪 Step 7: Test the Email System

1. Start your development server: `npm run dev`
2. Navigate to any tax advisory service
3. Complete a test booking:
   - Book a time slot in Calendly
   - Complete PayPal payment
   - Check your email for the receipt
4. Check `opulanz.banking@gmail.com` for the admin notification

## 📊 Step 8: Monitor Email Sending

1. Go to EmailJS Dashboard
2. Check **Email History** to see sent emails
3. Free tier includes 200 emails/month
4. Upgrade if you need more

## 🔧 Troubleshooting

### Emails not sending?
1. Check browser console for errors
2. Verify all 4 credentials are correctly replaced
3. Check EmailJS dashboard for error logs
4. Ensure Gmail account is properly connected

### Wrong template received?
1. Verify Template IDs match your dashboard
2. Check template variables match the code

### Need help?
- EmailJS Documentation: https://www.emailjs.com/docs/
- Contact: support@emailjs.com

## ✅ You're All Set!

Once configured, the system will automatically:
- ✅ Send receipt to customer after payment
- ✅ Send notification to admin (opulanz.banking@gmail.com)
- ✅ Include all booking and payment details
- ✅ Allow customers to download receipt

---

**Last Updated**: January 2025
