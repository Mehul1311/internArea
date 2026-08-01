const express = require('express');
const router = express.Router();
const { query } = require('../pg_db');
const { generateAndSendOTP, verifyOTP } = require('../utils/otpService');

async function getUser(username) {
  const res = await query('SELECT * FROM users WHERE username = $1 OR phone = $1 OR id = $1', [username]);
  return res.rows[0];
}

/**
 * POST /api/resume/request-payment-otp
 * Step 1: Send OTP to registered email before processing ₹50 payment
 */
router.post('/request-payment-otp', async (req, res) => {
  const { username = 'student@example.com' } = req.body;

  try {
    const user = await getUser(username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await generateAndSendOTP(user.id, user.username, 'resume');

    res.status(200).json({ 
      requires_otp: true, 
      message: 'OTP sent to your registered email for verifying resume payment.' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

/**
 * POST /api/resume/verify-and-pay
 * Step 2: Verify OTP, process ₹50 payment & save generated resume
 */
router.post('/verify-and-pay', async (req, res) => {
  const { username = 'student@example.com', otp, resumeContent } = req.body;
  if (!otp) return res.status(400).json({ error: 'OTP is required' });

  try {
    const user = await getUser(username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await verifyOTP(user.id, otp, 'resume');
    if (!isValid) return res.status(400).json({ error: 'Invalid or expired OTP. Use 123456 for test.' });

    const orderId = `resume_order_${Date.now()}`;
    const paymentId = `resume_pay_${Date.now()}`;

    // Record ₹50 payment success
    await query(
      'INSERT INTO resume_payments (user_id, order_id, payment_id, amount, status) VALUES ($1, $2, $3, $4, $5)',
      [user.id, orderId, paymentId, 50, 'success']
    );

    // Save resume to DB
    const resumeJson = JSON.stringify(resumeContent || {});
    await query('INSERT INTO resumes (user_id, content) VALUES ($1, $2)', [user.id, resumeJson]);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully! ₹50 payment completed & resume generated and attached to your profile.',
      paymentId,
      resume: resumeContent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/resume/:username
 * Fetch latest resume for student
 */
router.get('/:username', async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const result = await query(
      'SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No resume found' });
    }

    const resumeRow = result.rows[0];
    let content = resumeRow.content;
    if (typeof content === 'string') {
      try { content = JSON.parse(content); } catch (e) {}
    }

    res.json({
      id: resumeRow.id,
      content,
      created_at: resumeRow.created_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
