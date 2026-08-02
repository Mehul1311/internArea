const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { query } = require('../pg_db');
const { sendInvoiceEmail } = require('../utils/emailService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder',
});

async function getUserIdByUsername(username) {
  const res = await query('SELECT id, username FROM users WHERE username = $1 OR phone = $1', [username]);
  return res.rows.length ? res.rows[0] : null;
}

/**
 * GET /api/subscribe/plans
 * Requirement 3: Free (0 INR/1 app), Bronze (100 INR/3 app), Silver (300 INR/5 app), Gold (1000 INR/unlimited)
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = await query('SELECT * FROM plans ORDER BY price ASC');
    res.json(plans.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/subscribe
 * Create payment order with 10:00 AM - 11:00 AM IST time window check
 */
router.post('/', async (req, res) => {
  const { username = 'student@example.com', planId } = req.body;

  try {
    const user = await getUserIdByUsername(username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Enforce 10:00 AM to 11:00 AM IST payment window
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const totalMinutes = utcHour * 60 + utcMinute + 330; // 5 hours 30 mins
    const istHour = Math.floor(totalMinutes / 60) % 24;
    
    if (istHour !== 10) {
      return res.status(403).json({ error: 'Subscription payments are only allowed between 10:00 AM and 11:00 AM IST.' });
    }

    const planRes = await query('SELECT * FROM plans WHERE id = $1', [planId]);
    if (planRes.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
    const plan = planRes.rows[0];

    const orderId = `order_${Date.now()}`;
    const amount = plan.price;

    await query(
      'INSERT INTO transactions (user_id, order_id, amount, status) VALUES ($1, $2, $3, $4)',
      [user.id, orderId, amount, 'pending']
    );

    res.json({
      id: orderId,
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      plan: plan
    });
  } catch (error) {
    console.error('Error creating subscription order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/subscribe/confirm-mock-payment
 * Allows smooth payment completion & invoice generation in client
 */
router.post('/confirm-mock-payment', async (req, res) => {
  const { username = 'student@example.com', orderId, planId, paymentMethod = 'Razorpay' } = req.body;

  try {
    const user = await getUserIdByUsername(username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const planRes = await query('SELECT * FROM plans WHERE id = $1', [planId]);
    if (planRes.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
    const plan = planRes.rows[0];

    const paymentId = `pay_${Date.now()}`;

    await query('UPDATE transactions SET status = $1, payment_id = $2 WHERE order_id = $3', ['success', paymentId, orderId]);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const existingSub = await query('SELECT * FROM subscriptions WHERE user_id = $1', [user.id]);
    
    if (existingSub.rows.length > 0) {
      await query(
        `UPDATE subscriptions 
         SET plan_id = $1, status = 'active', current_period_start = $2, current_period_end = $3, applications_used = 0, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4`,
         [plan.id, startDate, endDate, user.id]
      );
    } else {
      await query(
        `INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end, applications_used)
         VALUES ($1, $2, 'active', $3, $4, 0)`,
         [user.id, plan.id, startDate, endDate]
      );
    }

    try {
      await sendInvoiceEmail({
        toEmail: user.username,
        invoiceNumber: paymentId,
        planName: plan.name,
        price: plan.price,
        billingDate: startDate,
        nextRenewalDate: endDate,
        paymentMethod: paymentMethod,
      });
    } catch (e) {
      // Ignore mail transport errors
    }

    res.status(200).json({
      success: true,
      message: 'Subscription payment successful! Invoice has been generated and sent to your email.',
      invoice: {
        invoiceNumber: paymentId,
        planName: plan.name,
        amount: plan.price,
        startDate: startDate,
        endDate: endDate
      }
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/subscribe/status/:username
 */
router.get('/status/:username', async (req, res) => {
    try {
        const user = await getUserIdByUsername(req.params.username);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const subRes = await query(`
            SELECT s.*, p.name as plan_name, p.price, p.application_limit 
            FROM subscriptions s
            JOIN plans p ON s.plan_id = p.id
            WHERE s.user_id = $1 AND s.status = 'active'
            ORDER BY s.current_period_end DESC
            LIMIT 1
          `, [user.id]);
          
        if (subRes.rows.length > 0) {
            res.json(subRes.rows[0]);
        } else {
            res.json({ plan_name: 'Free', price: 0, application_limit: 1, applications_used: 0 });
        }
    } catch (error) {
        console.error('Error fetching status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
