const { query } = require('../pg_db');

/**
 * Middleware to check if the user is allowed to apply for internships.
 * Returns { allowed: boolean, remaining: number | "unlimited", reason?: string }
 */
async function checkApplicationEligibility(req, res, next) {
  // Assuming req.body.user contains the username or userId.
  // We need the database user ID to check the subscriptions table.
  // If the frontend only sends a user name/email, we need to look up their ID.
  const username = req.body.user || req.user?.username;

  if (!username) {
    return res.status(401).json({ error: 'User identifier required' });
  }

  try {
    // 1. Find user by username (or email)
    const userRes = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (userRes.rows.length === 0) {
      // If user doesn't exist in pg DB, we'll allow it for legacy compatibility or reject.
      // Let's create them or just reject.
      return res.status(401).json({ error: 'User not found in main database' });
    }
    const userId = userRes.rows[0].id;

    // 2. Fetch active subscription
    const subRes = await query(`
      SELECT s.*, p.application_limit 
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.user_id = $1 AND s.status = 'active'
      ORDER BY s.current_period_end DESC
      LIMIT 1
    `, [userId]);

    let applicationLimit = 1; // Default to free plan limit (1 per month)
    let applicationsUsed = 0;

    if (subRes.rows.length > 0) {
      const sub = subRes.rows[0];
      applicationLimit = sub.application_limit;
      applicationsUsed = sub.applications_used || 0;
      
      // Check if subscription has expired
      if (new Date() > new Date(sub.current_period_end)) {
         // Expired, default back to free tier
         applicationLimit = 1;
      }
    } else {
      // No active subscription, check if they have a Free subscription record, if not, assume 0 used, limit 1.
      const freeRes = await query(`
        SELECT applications_used FROM subscriptions 
        WHERE user_id = $1 AND plan_id = (SELECT id FROM plans WHERE name = 'Free' LIMIT 1)
      `, [userId]);
      if (freeRes.rows.length > 0) {
        applicationsUsed = freeRes.rows[0].applications_used;
      }
    }

    // 3. Evaluate eligibility
    if (applicationLimit === null) {
      // Unlimited (Gold plan)
      req.eligibility = { allowed: true, remaining: "unlimited" };
      req.userId = userId; // Attach to request for later use
      return next();
    }

    if (applicationsUsed >= applicationLimit) {
      return res.status(403).json({
        error: 'Application limit reached',
        details: {
          allowed: false,
          remaining: 0,
          reason: `You have reached your limit of ${applicationLimit} applications for your current plan.`
        }
      });
    }

    req.eligibility = { allowed: true, remaining: applicationLimit - applicationsUsed };
    req.userId = userId;
    next();

  } catch (error) {
    console.error('Error in checkApplicationEligibility:', error);
    res.status(500).json({ error: 'Failed to verify application eligibility' });
  }
}

module.exports = checkApplicationEligibility;
