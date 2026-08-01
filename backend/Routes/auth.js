const express = require('express');
const router = express.Router();
const { query } = require('../pg_db');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { parseLoginContext } = require('../utils/uaParser');
const { generateAndSendOTP, verifyOTP } = require('../utils/otpService');
const { verifyToken } = require('../Middleware/authMiddleware');
const { Resend } = require('resend');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_access_token_key_123';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super_secret_refresh_token_key_456';

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many login attempts. Try again in 15 mins.' } });
const signupLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { error: 'Too many signups from this IP.' } });
const forgotPasswordLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: { error: 'Too many password reset requests. Try again in an hour.' } });

// Log attempt helper
async function logAttempt(userId, context, status, blockReason = null) {
  if (!userId) return;
  await query(
    'INSERT INTO login_attempts (user_id, browser, os, device_type, ip_address, status, block_reason) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [userId, context.browser, context.os, context.deviceType, context.ip, status, blockReason]
  );
}

// Helper to set HTTP-only cookies
function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

/**
 * POST /api/auth/register
 */
router.post('/register', signupLimiter, [
  body('username').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { username, password, role = 'student', phone } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const roleRes = await query('SELECT id FROM roles WHERE name = $1', [role]);
    if (roleRes.rows.length === 0) return res.status(400).json({ error: 'Invalid role' });
    const roleId = roleRes.rows[0].id;

    const existing = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Username/Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await query(
      'INSERT INTO users (username, password_hash, role_id, phone) VALUES ($1, $2, $3, $4) RETURNING id, username',
      [username, passwordHash, roleId, phone || '']
    );

    const createdUserId = newUser.rows[0].id;

    if (role === 'employer') {
      await query('INSERT INTO companies (user_id, name) VALUES ($1, $2)', [createdUserId, username.split('@')[0] + "'s Company"]);
    }

    res.status(201).json({ success: true, message: 'Registration successful', userId: createdUserId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

  try {
    const context = parseLoginContext(req);
    const userRes = await query('SELECT * FROM users WHERE username = $1 OR phone = $1', [username]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = userRes.rows[0];

    let isPasswordValid = false;
    if (user.password_hash) {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    }

    if (!isPasswordValid) {
      await logAttempt(user.id, context, 'failed', 'invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }



    // Login complete
    await completeLogin(user, context, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/verify-login-otp
 */
router.post('/verify-login-otp', async (req, res) => {
  const { username, otp } = req.body;
  if (!username || !otp) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const context = parseLoginContext(req);
    const userRes = await query('SELECT * FROM users WHERE username = $1 OR phone = $1', [username]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = userRes.rows[0];
    const isValid = await verifyOTP(user.id, otp, 'login');

    if (!isValid) {
      await logAttempt(user.id, context, 'failed', 'invalid otp');
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await completeLogin(user, context, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function completeLogin(user, context, res) {
  const accessToken = jwt.sign({ id: user.id, username: user.username, role: user.role_id }, JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, refreshToken, expiresAt]);

  setAuthCookies(res, accessToken, refreshToken);
  await logAttempt(user.id, context, 'success');

  // Also return user info & token in JSON body for flexible client consumption
  res.status(200).json({
    success: true,
    message: 'Login successful',
    token: accessToken,
    user: {
      id: user.id,
      username: user.username,
      phone: user.phone,
      role_id: user.role_id,
      preferred_language: user.preferred_language || 'en'
    }
  });
}

/**
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    const tokenRes = await query('SELECT * FROM refresh_tokens WHERE user_id = $1 AND token = $2 AND expires_at > CURRENT_TIMESTAMP', [decoded.id, refreshToken]);
    if (tokenRes.rows.length === 0) return res.status(403).json({ error: 'Invalid refresh token' });

    const accessToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: '1d' });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({ success: true, token: accessToken });
  } catch (err) {
    res.status(403).json({ error: 'Token expired or invalid' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (refreshToken) {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }

  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userRes = await query('SELECT id, username, phone, role_id, profile_picture, preferred_language, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(userRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/login-history
 * Returns detailed login history for the user
 */
router.get('/login-history', verifyToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, browser, os, device_type, ip_address, status, block_reason, created_at FROM login_attempts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', [
  body('identifier').notEmpty().withMessage('Email or phone is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { identifier } = req.body;

  try {
    const userRes = await query('SELECT * FROM users WHERE username = $1 OR phone = $1', [identifier]);
    if (userRes.rows.length === 0) {
      // Don't leak user existence for generic errors, but here we can just say user not found or same success message.
      // The frontend expects error for rate limits, but for not found, we can send generic error.
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userRes.rows[0];



    // Generate token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]
    );

    await query(
      'UPDATE users SET last_password_reset_request_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetLink = `${clientUrl}/reset-password?token=${rawToken}`;
    console.log(`\n\n=== PASSWORD RESET LINK ===\n${resetLink}\n===========================\n\n`);

    // Send the reset link via email
    try {
      await resend.emails.send({
        from: 'InternArea <onboarding@resend.dev>',
        to: [user.username],
        subject: 'Reset Your InternArea Password',
        html: `
          <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #2563eb; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 0.5px;">InternArea</h1>
            </div>
            <div style="padding: 40px 32px; background-color: #ffffff;">
              <h2 style="color: #111827; font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">Password Reset Request</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                We received a request to reset your password for your <strong>InternArea</strong> account. Click the button below to securely set a new password.
              </p>
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 700; font-size: 16px; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);">
                  Reset Password
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
                If you didn't request this, you can safely ignore this email. Your password will not change until you create a new one.<br/><br/>
                <em>This secure link will expire in 1 hour.</em>
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0; font-weight: 500;">&copy; ${new Date().getFullYear()} InternArea. All rights reserved.</p>
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.error("Email send failed (check your RESEND_API_KEY):", e.message);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'A password reset link has been sent to your email.'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/reset-password
 * Restoring this endpoint just in case the frontend still tries to hit it
 * via the /reset-password page, though the primary flow is now the generator.
 */
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { token, newPassword } = req.body;

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date().toISOString();

    // Find valid token
    const resetRes = await query(
      'SELECT user_id FROM password_resets WHERE token_hash = $1 AND expires_at > $2 ORDER BY created_at DESC LIMIT 1',
      [tokenHash, now]
    );

    if (resetRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const userId = resetRes.rows[0].user_id;

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);

    // Invalidate all tokens for this user
    await query('DELETE FROM password_resets WHERE user_id = $1', [userId]);

    return res.status(200).json({ success: true, message: 'Password reset successfully. You may now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
