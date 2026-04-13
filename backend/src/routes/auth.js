const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { OAuth2Client } = require('google-auth-library');
const { pool } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { createNarviAccount, provisionBankAccount } = require('../services/narvi');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const IS_DEMO = process.env.NODE_ENV !== 'production';

const JWT_SECRET = process.env.JWT_SECRET || 'opulanz-super-secret-jwt-key-2025-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ─── EMAIL TRANSPORTER (Gmail SMTP) ────────────────────────────────────────
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify email transport on startup
emailTransporter.verify((err) => {
  if (err) {
    console.error('❌ Email transporter error:', err.message);
  } else {
    console.log('✅ Email transporter ready (Gmail SMTP)');
  }
});

// ─── TWILIO SMS ──────────────────────────────────────────────────────────────
function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || sid === 'your_twilio_account_sid_here') return null;
  return twilio(sid, token);
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailOTP(email, otp, purpose) {
  const isSignup = purpose === 'signup';
  const subject = isSignup ? 'Opulanz - Verify Your Email Address' : 'Opulanz - Sign In Verification Code';
  const title = isSignup ? 'Verify your email address' : 'Sign in verification code';

  await emailTransporter.sendMail({
    from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f6f8f8;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#b59354,#886844);padding:32px;text-align:center;">
            <h1 style="color:#fff;font-size:28px;margin:0;letter-spacing:2px;">OPULANZ</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Banking Platform</p>
          </div>
          <div style="padding:40px;text-align:center;">
            <h2 style="color:#252623;font-size:20px;margin:0 0 8px;">${title}</h2>
            <p style="color:#666;font-size:14px;margin:0 0 32px;">Use the code below to complete your verification</p>
            <div style="display:inline-block;background:#f6f8f8;border:2px solid #b59354;border-radius:12px;padding:20px 40px;">
              <div style="font-size:44px;font-weight:bold;letter-spacing:14px;color:#252623;font-family:monospace;">${otp}</div>
            </div>
            <p style="color:#888;font-size:13px;margin:24px 0 0;">This code expires in <strong>10 minutes</strong>.</p>
            <p style="color:#aaa;font-size:12px;margin:8px 0 0;">If you did not request this, please ignore this email.</p>
          </div>
          <div style="background:#f6f8f8;padding:20px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#aaa;font-size:11px;margin:0;">© 2025 Opulanz Banking • Regulated by ACPR • SEPA Licensed</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
  console.log(`📧 Email OTP sent to ${email} (purpose: ${purpose})`);
}

async function sendSmsOTP(phone, otp, email, purpose) {
  const client = getTwilioClient();

  if (!client) {
    // Twilio not configured — fall back to email delivery
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 SMS OTP for ${phone}: ${otp}`);
    console.log('   ⚠️  Twilio not configured — sending via email');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    if (email) {
      const purposeLabel = purpose === 'signup' ? 'signup' : 'signin';
      await emailTransporter.sendMail({
        from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Opulanz - Phone Verification Code',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#f6f8f8;font-family:Arial,sans-serif;">
            <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <div style="background:linear-gradient(135deg,#b59354,#886844);padding:32px;text-align:center;">
                <h1 style="color:#fff;font-size:28px;margin:0;letter-spacing:2px;">OPULANZ</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Banking Platform</p>
              </div>
              <div style="padding:40px;text-align:center;">
                <h2 style="color:#252623;font-size:20px;margin:0 0 8px;">Phone verification code</h2>
                <p style="color:#666;font-size:14px;margin:0 0 8px;">This code was meant for your phone <strong>${phone}</strong></p>
                <p style="color:#999;font-size:13px;margin:0 0 32px;">(SMS not configured — delivered to email for testing)</p>
                <div style="display:inline-block;background:#f6f8f8;border:2px solid #b59354;border-radius:12px;padding:20px 40px;">
                  <div style="font-size:44px;font-weight:bold;letter-spacing:14px;color:#252623;font-family:monospace;">${otp}</div>
                </div>
                <p style="color:#888;font-size:13px;margin:24px 0 0;">This code expires in <strong>10 minutes</strong>.</p>
                <p style="color:#aaa;font-size:12px;margin:8px 0 0;">If you did not request this, please ignore this email.</p>
              </div>
              <div style="background:#f6f8f8;padding:20px;text-align:center;border-top:1px solid #eee;">
                <p style="color:#aaa;font-size:11px;margin:0;">© 2025 Opulanz Banking • Regulated by ACPR • SEPA Licensed</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`📧 Phone OTP sent to email ${email} (Twilio fallback)`);
    }

    return { sent: false, fallbackEmail: !!email };
  }

  try {
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
      body: `Your Opulanz verification code: ${otp}\nExpires in 10 minutes. Do not share.`,
    });
    console.log(`📱 SMS OTP sent to ${phone} via Twilio`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ SMS failed to ${phone}:`, err.message);
    return { sent: false, reason: err.message };
  }
}

async function saveOTP(userId, email, otp, type, purpose) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  // Invalidate any previous unused OTPs of same type/purpose for this user
  await pool.query(
    `UPDATE otps SET used = TRUE WHERE user_id = $1 AND type = $2 AND purpose = $3 AND used = FALSE`,
    [userId, type, purpose]
  );
  await pool.query(
    `INSERT INTO otps (user_id, email, otp_code, type, purpose, expires_at) VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, email, otp, type, purpose, expiresAt]
  );
}

async function verifyOTP(userId, otp, type, purpose) {
  const result = await pool.query(
    `SELECT * FROM otps
     WHERE user_id = $1 AND otp_code = $2 AND type = $3 AND purpose = $4
       AND used = FALSE AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [userId, otp, type, purpose]
  );
  if (result.rows.length === 0) return null;
  await pool.query(`UPDATE otps SET used = TRUE WHERE id = $1`, [result.rows[0].id]);
  return result.rows[0];
}

function signToken(user, partial = false) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      accountType: user.account_type,
      kycStatus: user.kyc_status,
      partial,
    },
    JWT_SECRET,
    { expiresIn: partial ? '1h' : JWT_EXPIRES_IN }
  );
}

// ─── SIGNUP ────────────────────────────────────────────────────────────────

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, accountType } = req.body;

    if (!firstName || !lastName || !email || !phone || !password || !accountType) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!['individual', 'corporate'].includes(accountType)) {
      return res.status(400).json({ error: 'accountType must be individual or corporate' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, name, email, phone, password_hash, account_type, kyc_type, email_verified, phone_verified, kyc_status, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, FALSE, 'pending', 'user') RETURNING *`,
      [firstName, lastName, `${firstName} ${lastName}`, email, phone, passwordHash, accountType, accountType]
    );

    const user = result.rows[0];

    // Send EMAIL OTP to email address
    const emailOtp = generateOTP();
    await saveOTP(user.id, email, emailOtp, 'email', 'signup');
    await sendEmailOTP(email, emailOtp, 'signup');

    res.json({
      success: true,
      userId: user.id,
      message: 'Account created. A verification code has been sent to your email.',
      ...(IS_DEMO && { demoOtp: emailOtp, demoNote: 'OTP visible in demo mode only' }),
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/auth/verify-email-otp
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ error: 'userId and otp required' });

    const valid = await verifyOTP(parseInt(userId), otp, 'email', 'signup');
    if (!valid) return res.status(400).json({ error: 'Invalid or expired code' });

    await pool.query('UPDATE users SET email_verified = TRUE WHERE id = $1', [userId]);

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    // Send SMS OTP to phone number
    const phoneOtp = generateOTP();
    await saveOTP(user.id, user.email, phoneOtp, 'phone', 'signup');
    const smsResult = await sendSmsOTP(user.phone, phoneOtp, user.email, 'signup');

    res.json({
      success: true,
      smsSent: smsResult.sent,
      message: smsResult.sent
        ? 'Email verified. SMS code sent to your phone.'
        : 'Email verified. SMS not configured — phone code sent to your email.',
      ...(IS_DEMO && { demoOtp: phoneOtp, demoNote: 'Phone OTP visible in demo mode only' }),
    });
  } catch (err) {
    console.error('Email OTP verify error:', err);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// POST /api/auth/verify-phone-otp
router.post('/verify-phone-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ error: 'userId and otp required' });

    const valid = await verifyOTP(parseInt(userId), otp, 'phone', 'signup');
    if (!valid) return res.status(400).json({ error: 'Invalid or expired code' });

    await pool.query('UPDATE users SET phone_verified = TRUE WHERE id = $1', [userId]);

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    // Return partial token — allows KYC step
    const token = signToken(user, true);
    res.json({ success: true, token, userId: user.id, accountType: user.account_type });
  } catch (err) {
    console.error('Phone OTP verify error:', err);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// POST /api/auth/kyc-complete
router.post('/kyc-complete', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    await pool.query('UPDATE users SET kyc_status = $1 WHERE id = $2', ['verified', userId]);

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    const token = signToken(user, false);

    // Auto-create Narvi entity + bank account after KYC
    let narviAccount = null;
    try {
      const isCompany = user.account_type === 'corporate';
      const narviResult = await createNarviAccount({
        type: isCompany ? 'company' : 'individual',
        payload: {
          // Individual fields
          firstName: user.first_name || 'Demo',
          lastName: user.last_name || 'User',
          dateOfBirth: '1990-01-01',
          nationality: 'FR',
          address: '1 Rue de la Paix',
          postalCode: '75001',
          city: 'Paris',
          country: 'FR',
          sourceOfFunds: 'salary',
          isPEP: false,
          // Company fields
          companyName: user.name || `${user.first_name} ${user.last_name}`,
          registrationNumber: `RCS${userId}${Date.now().toString().slice(-6)}`,
          companyCountry: 'FR',
        },
      });

      if (narviResult.success) {
        narviAccount = narviResult.account;
        console.log(`✅ Narvi account created for user ${userId}: ${narviAccount.iban}`);
        // Store narvi account PID in applications table if an application exists
        try {
          await pool.query(
            `UPDATE applications SET narvi_customer_id = $1 WHERE id = (
              SELECT id FROM applications WHERE payload->>'email' = $2 OR payload->>'companyName' IS NOT NULL
              ORDER BY created_at DESC LIMIT 1
            )`,
            [narviResult.entity.pid, user.email]
          );
        } catch (_) { /* non-blocking */ }
      }
    } catch (narviErr) {
      console.warn(`⚠️  Narvi account creation skipped: ${narviErr.message}`);
    }

    res.json({
      success: true,
      token,
      ...(narviAccount && {
        narviAccount: {
          pid: narviAccount.pid,
          iban: narviAccount.iban,
          bic: narviAccount.bic,
          currency: narviAccount.currency,
          status: narviAccount.status,
        },
      }),
    });
  } catch (err) {
    console.error('KYC complete error:', err);
    res.status(500).json({ error: 'Failed to complete KYC' });
  }
});

// ─── SIGNIN ────────────────────────────────────────────────────────────────

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0 || !result.rows[0].password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    // Send EMAIL OTP to email address
    const emailOtp = generateOTP();
    await saveOTP(user.id, user.email, emailOtp, 'email', 'signin');
    await sendEmailOTP(user.email, emailOtp, 'signin');

    res.json({
      success: true,
      userId: user.id,
      message: 'Verification code sent to your email.',
      ...(IS_DEMO && { demoOtp: emailOtp, demoNote: 'OTP visible in demo mode only' }),
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// POST /api/auth/verify-signin-email-otp
router.post('/verify-signin-email-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const valid = await verifyOTP(parseInt(userId), otp, 'email', 'signin');
    if (!valid) return res.status(400).json({ error: 'Invalid or expired code' });

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    // Send SMS OTP to phone number
    const phoneOtp = generateOTP();
    await saveOTP(user.id, user.email, phoneOtp, 'phone', 'signin');
    const smsResult = await sendSmsOTP(user.phone, phoneOtp, user.email, 'signin');

    res.json({
      success: true,
      smsSent: smsResult.sent,
      message: smsResult.sent
        ? 'Email verified. SMS code sent to your phone.'
        : 'Email verified. SMS not configured — phone code sent to your email.',
      ...(IS_DEMO && { demoOtp: phoneOtp, demoNote: 'Phone OTP visible in demo mode only' }),
    });
  } catch (err) {
    console.error('Signin email OTP error:', err);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// POST /api/auth/verify-signin-phone-otp
router.post('/verify-signin-phone-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const valid = await verifyOTP(parseInt(userId), otp, 'phone', 'signin');
    if (!valid) return res.status(400).json({ error: 'Invalid or expired code' });

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    const token = signToken(user, false);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountType: user.account_type,
        kycStatus: user.kyc_status,
      },
    });
  } catch (err) {
    console.error('Signin phone OTP error:', err);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// ─── SHARED ────────────────────────────────────────────────────────────────

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId, type, purpose } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    const otp = generateOTP();
    await saveOTP(user.id, user.email, otp, type, purpose);

    if (type === 'email') {
      await sendEmailOTP(user.email, otp, purpose);
      res.json({ success: true, message: 'Email code resent.' });
    } else {
      const smsResult = await sendSmsOTP(user.phone, otp, user.email, purpose);
      res.json({
        success: true,
        smsSent: smsResult.sent,
        message: smsResult.sent ? 'SMS code resent.' : 'SMS not configured — code sent to your email.',
      });
    }
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend code' });
  }
});

// ─── GOOGLE OAUTH ────────────────────────────────────────────────────────────

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { credential, accountType } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential required' });

    // Detect implicit-flow "fake" credential: frontend fetches userinfo from Google
    // then encodes it as header.{base64json}.sig — signature is literally "sig"
    const isImplicitFlowCredential = credential.endsWith('.sig');
    const noClientId = !process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here';

    let googleUser;
    if (isImplicitFlowCredential || noClientId) {
      // Parse user info from the base64 payload (user info was fetched from Google)
      try {
        const parts = credential.split('.');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        googleUser = {
          sub: payload.sub || 'demo-google-id',
          email: payload.email || 'demo@gmail.com',
          name: payload.name || 'Demo User',
          given_name: payload.given_name || 'Demo',
          family_name: payload.family_name || 'User',
          picture: payload.picture || null,
        };
        console.log('🔑 Google OAuth implicit flow — user info parsed from access token');
      } catch {
        return res.status(400).json({ error: 'Invalid Google credential format' });
      }
    } else {
      // Production: verify the Google ID token (from GoogleLogin component)
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleUser = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture,
      };
    }

    const { sub: googleId, email, name, given_name: firstName, family_name: lastName } = googleUser;

    // Find or create user
    let user;
    const existing = await pool.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);

    if (existing.rows.length > 0) {
      user = existing.rows[0];
      // Link Google ID if not already linked
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
        user.google_id = googleId;
      }
    } else {
      // New user — create account
      const resolvedAccountType = accountType || 'individual';
      const result = await pool.query(
        `INSERT INTO users (google_id, first_name, last_name, name, email, account_type, kyc_type, email_verified, phone_verified, kyc_status, role, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, FALSE, 'pending', 'user', '')
         RETURNING *`,
        [googleId, firstName || name, lastName || '', name, email, resolvedAccountType, resolvedAccountType]
      );
      user = result.rows[0];
      console.log(`✅ New Google user created: ${email} (${resolvedAccountType})`);
    }

    const needsKyc = user.kyc_status !== 'verified';
    const token = signToken(user, needsKyc);

    res.json({
      success: true,
      token,
      needsKyc,
      kycStatus: user.kyc_status,
      accountType: user.account_type,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: googleUser.picture,
      },
    });
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// ─── POST /api/auth/register-post-kyc ────────────────────────────────────────
// Called after Sumsub KYC completes. Creates the user, generates a TOTP secret
// for Google Authenticator, and returns a QR code + temp token.
// The user must verify a TOTP code (POST /verify-totp-setup) to get the full JWT.
router.post('/register-post-kyc', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, accountType, applicationId } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'firstName, lastName, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const fullName = `${firstName} ${lastName}`;

    // Generate TOTP secret for Google Authenticator
    const totpSecret = speakeasy.generateSecret({
      name: `Opulanz (${email})`,
      issuer: 'Opulanz Banking',
      length: 20,
    });

    const result = await pool.query(
      `INSERT INTO users
         (name, first_name, last_name, email, phone, password_hash,
          account_type, kyc_status, email_verified, phone_verified, totp_secret, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'verified',TRUE,TRUE,$8,NOW(),NOW())
       RETURNING id, email, account_type, kyc_status`,
      [fullName, firstName, lastName, email, phone || null, passwordHash, accountType || 'individual', totpSecret.base32]
    );

    const user = result.rows[0];

    // Link application to user if applicationId provided
    if (applicationId) {
      await pool.query(
        'UPDATE applications SET payload = payload || $1 WHERE id = $2',
        [JSON.stringify({ userId: user.id }), applicationId]
      ).catch(() => {});
    }

    // Generate QR code as base64 data URL
    const totpQrCode = await QRCode.toDataURL(totpSecret.otpauth_url);

    // Issue a short-lived temp token for the TOTP setup verification step
    const tempToken = jwt.sign(
      { userId: user.id, purpose: '2fa-setup' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.status(201).json({
      success: true,
      tempToken,
      totpQrCode,
      totpSecret: totpSecret.base32, // manual entry fallback
      user: { id: user.id, email: user.email, firstName, accountType: user.account_type },
    });
  } catch (err) {
    console.error('register-post-kyc error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// ─── POST /api/auth/verify-totp-setup ────────────────────────────────────────
// Verifies the first TOTP code after account creation (confirms Google Authenticator
// is set up correctly). Returns the full JWT on success.
router.post('/verify-totp-setup', async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) return res.status(400).json({ error: 'tempToken and code are required' });

    let payload;
    try {
      payload = jwt.verify(tempToken, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Setup session expired. Please start over.' });
    }
    if (payload.purpose !== '2fa-setup') return res.status(401).json({ error: 'Invalid setup token' });

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, account_type, kyc_status, totp_secret FROM users WHERE id = $1',
      [payload.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!verified) return res.status(400).json({ error: 'Invalid code. Please check Google Authenticator and try again.' });

    // ── Provision bank account (mock Narvi) ──────────────────────────────────
    let iban = null, bic = null;
    try {
      const appResult = await pool.query(
        "SELECT * FROM applications WHERE payload->>'userId' = $1 OR (payload->>'email' = $2) LIMIT 1",
        [String(user.id), user.email]
      );
      const appData = appResult.rows[0] || { type: user.account_type === 'corporate' ? 'company' : 'individual', payload: {} };

      const banking = await provisionBankAccount(appData);
      iban = banking.iban;
      bic = banking.bic;

      await pool.query(
        'UPDATE users SET iban=$1, bic=$2, narvi_customer_pid=$3, narvi_account_pid=$4, bank_account_status=$5 WHERE id=$6',
        [iban, bic, banking.narviCustomerPid, banking.narviAccountPid, 'active', user.id]
      );
    } catch (provErr) {
      console.error('Bank provisioning error (non-blocking):', provErr.message);
    }

    // Send welcome email with IBAN
    emailTransporter.sendMail({
      from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to Opulanz — Your Account is Ready',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#b59354,#886844);padding:32px;text-align:center;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:28px">Welcome to Opulanz</h1>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-radius:0 0 12px 12px">
            <p style="font-size:16px;color:#374151">Dear ${user.first_name},</p>
            <p style="color:#6b7280">Your identity has been verified and your Opulanz account is now active.</p>
            ${iban ? `
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0">
              <p style="margin:0 0 8px;font-weight:600;color:#111827">Your Bank Account Details:</p>
              <p style="margin:4px 0;color:#374151"><strong>IBAN:</strong> ${iban}</p>
              <p style="margin:4px 0;color:#374151"><strong>BIC/SWIFT:</strong> ${bic}</p>
            </div>` : ''}
            <p style="color:#6b7280;font-size:14px">Sign in at <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color:#b59354">opulanz.com</a> to access your dashboard.</p>
            <p style="color:#9ca3af;font-size:12px;margin-top:32px">© 2026 Opulanz. All rights reserved.</p>
          </div>
        </div>`,
    }).catch(() => {});

    const token = jwt.sign(
      { userId: user.id, email: user.email, accountType: user.account_type, kycStatus: user.kyc_status },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      iban,
      bic,
      user: { id: user.id, email: user.email, accountType: user.account_type },
    });
  } catch (err) {
    console.error('verify-totp-setup error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ─── POST /api/auth/signin-password ─────────────────────────────────────────
// Email + password sign in. If user has Google Authenticator (totp_secret),
// returns { requires2FA: true, tempToken } instead of a full JWT.
router.post('/signin-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, password_hash, account_type, kyc_status, totp_secret FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = result.rows[0];
    if (!user.password_hash) return res.status(401).json({ error: 'This account uses Google sign-in. Please use "Continue with Google".' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    // If user has 2FA set up, require Google Authenticator code
    if (user.totp_secret) {
      const tempToken = jwt.sign(
        { userId: user.id, purpose: '2fa-signin' },
        JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({ success: true, requires2FA: true, tempToken });
    }

    // No 2FA — return full JWT directly (Google OAuth users without TOTP)
    const token = jwt.sign(
      { userId: user.id, email: user.email, accountType: user.account_type, kycStatus: user.kyc_status },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.json({ success: true, token, user: { id: user.id, email: user.email, firstName: user.first_name, accountType: user.account_type } });
  } catch (err) {
    console.error('signin-password error:', err);
    res.status(500).json({ error: 'Sign in failed' });
  }
});

// ─── POST /api/auth/verify-totp ─────────────────────────────────────────────
// Verifies Google Authenticator code during sign in.
router.post('/verify-totp', async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) return res.status(400).json({ error: 'tempToken and code are required' });

    let payload;
    try {
      payload = jwt.verify(tempToken, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    if (payload.purpose !== '2fa-signin') return res.status(401).json({ error: 'Invalid token' });

    const result = await pool.query(
      'SELECT id, email, first_name, account_type, kyc_status, totp_secret FROM users WHERE id = $1',
      [payload.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!verified) return res.status(400).json({ error: 'Invalid code. Please check Google Authenticator.' });

    const token = jwt.sign(
      { userId: user.id, email: user.email, accountType: user.account_type, kycStatus: user.kyc_status },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ success: true, token, user: { id: user.id, email: user.email, accountType: user.account_type } });
  } catch (err) {
    console.error('verify-totp error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, first_name, last_name, email, phone, account_type, kyc_status, email_verified, phone_verified FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
