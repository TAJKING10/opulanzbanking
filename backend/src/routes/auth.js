const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { pool } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'opulanz-super-secret-jwt-key-2025-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailOTP(email, otp, purpose) {
  const subject = purpose === 'signup'
    ? 'Opulanz - Verify Your Email Address'
    : 'Opulanz - Sign In Verification Code';

  await transporter.sendMail({
    from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#b59354;font-size:28px;margin:0;">OPULANZ</h1>
          <p style="color:#666;margin:4px 0 0;">Banking Platform</p>
        </div>
        <div style="background:#f6f8f8;border-radius:12px;padding:30px;text-align:center;">
          <p style="color:#252623;font-size:16px;margin:0 0 20px;">Your verification code:</p>
          <div style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#252623;background:#fff;border-radius:8px;padding:20px;display:inline-block;border:2px solid #b59354;">
            ${otp}
          </div>
          <p style="color:#888;font-size:14px;margin:20px 0 0;">Expires in 10 minutes. Do not share this code.</p>
        </div>
      </div>
    `,
  });
}

async function sendPhoneOTP(phone, email, otp) {
  // Dev mode: send phone OTP to email. Add Twilio for real SMS in production.
  console.log(`📱 [DEV] SMS OTP for ${phone}: ${otp}`);
  await transporter.sendMail({
    from: `"Opulanz Banking" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Opulanz - Phone Verification Code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#b59354;font-size:28px;margin:0;">OPULANZ</h1>
          <p style="color:#666;margin:4px 0 0;">Banking Platform</p>
        </div>
        <div style="background:#f6f8f8;border-radius:12px;padding:30px;text-align:center;">
          <p style="color:#252623;font-size:16px;margin:0 0 8px;">Your phone verification code for <strong>${phone}</strong>:</p>
          <div style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#252623;background:#fff;border-radius:8px;padding:20px;display:inline-block;border:2px solid #b59354;">
            ${otp}
          </div>
          <p style="color:#888;font-size:14px;margin:20px 0 0;">Expires in 10 minutes.</p>
          <p style="color:#bbb;font-size:11px;margin:8px 0 0;">(Development: SMS delivered via email)</p>
        </div>
      </div>
    `,
  });
}

async function saveOTP(userId, email, otp, type, purpose) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  // Invalidate previous unused OTPs of same type/purpose
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
    `SELECT * FROM otps WHERE user_id = $1 AND otp_code = $2 AND type = $3 AND purpose = $4 AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
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
    const otp = generateOTP();
    await saveOTP(user.id, email, otp, 'email', 'signup');
    await sendEmailOTP(email, otp, 'signup');

    res.json({ success: true, userId: user.id, message: 'Account created. Check your email for the verification code.' });
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

    const phoneOtp = generateOTP();
    await saveOTP(user.id, user.email, phoneOtp, 'phone', 'signup');
    await sendPhoneOTP(user.phone, user.email, phoneOtp);

    res.json({ success: true, message: 'Email verified. Phone code sent.' });
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

    // Partial token — allows KYC step
    const token = signToken(user, true);
    res.json({ success: true, token, userId: user.id, accountType: user.account_type });
  } catch (err) {
    console.error('Phone OTP verify error:', err);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// POST /api/auth/kyc-complete  — called after Sumsub returns GREEN
router.post('/kyc-complete', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    await pool.query('UPDATE users SET kyc_status = $1 WHERE id = $2', ['verified', userId]);

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    const token = signToken(user, false);

    res.json({ success: true, token });
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

    const otp = generateOTP();
    await saveOTP(user.id, user.email, otp, 'email', 'signin');
    await sendEmailOTP(user.email, otp, 'signin');

    res.json({ success: true, userId: user.id, message: 'Verification code sent to your email.' });
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

    const phoneOtp = generateOTP();
    await saveOTP(user.id, user.email, phoneOtp, 'phone', 'signin');
    await sendPhoneOTP(user.phone, user.email, phoneOtp);

    res.json({ success: true, message: 'Email verified. Phone code sent.' });
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
      user: { id: user.id, name: user.name, email: user.email, accountType: user.account_type, kycStatus: user.kyc_status },
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
    } else {
      await sendPhoneOTP(user.phone, user.email, otp);
    }
    res.json({ success: true, message: 'Code resent.' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend code' });
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
