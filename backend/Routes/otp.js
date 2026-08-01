const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Initialize Nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL || 'mehulsain1603@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || ''
  }
});

// Simple in-memory store for OTPs: { "email": { otp: "123456", expiresAt: timestamp } }
const otpStore = new Map();

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * POST /api/otp/send
 * Body: { email }
 */
router.post('/send', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!process.env.GMAIL_APP_PASSWORD) {
      return res.status(500).json({ error: 'Gmail App Password is not configured in .env file.' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email, { otp, expiresAt });

    // Send email using Nodemailer directly to the user's email
    await transporter.sendMail({
      from: `"Internshala Clone" <${process.env.ADMIN_EMAIL || 'mehulsain1603@gmail.com'}>`,
      to: email, // This goes to whichever random user logs in!
      subject: 'Your Payment Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px;">
          <h2 style="color: #0066ff;">Payment Verification</h2>
          <p>Please use the following 6-digit code to verify your identity and proceed with the payment.</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 6px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    console.log(`[OTP SERVICE] Successfully sent OTP ${otp} to ${email}`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP Send Error:', error);
    if (error.code === 'EAUTH') {
      return res.status(500).json({ error: 'Gmail Authentication Failed! You must use a 16-letter Google "App Password", NOT your normal email password. Check your .env file.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/otp/verify
 * Body: { email, otp }
 */
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: 'Incorrect OTP' });
    }

    // OTP is valid
    otpStore.delete(email);
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
