const express = require('express');
const router = express.Router();
const { query } = require('../pg_db');
const { verifyToken } = require('../Middleware/authMiddleware');

/**
 * GET /api/auth/me
 * Fetches user profile after Firebase auth validation.
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userRes = await query(
      'SELECT id, username, phone, role_id, profile_picture, preferred_language, created_at FROM users WHERE id = $1', 
      [req.user.id]
    );
    
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in local database' });
    }
    const user = userRes.rows[0];

    // Return user info
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
