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

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../Middleware/authMiddleware');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'student', phone = '' } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE username = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const roleId = role === 'employer' ? 2 : 1;
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await query(
      'INSERT INTO users (username, role_id, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, roleId, phone, passwordHash]
    );

    const userId = newUser.rows[0].id;

    if (roleId === 2) {
      await query('INSERT INTO companies (user_id, name) VALUES ($1, $2)', [userId, email.split('@')[0] + "'s Company"]);
    }

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: userId, email, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userRes = await query(`
        SELECT u.id, u.username, u.password_hash, r.name as role 
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.username = $1
    `, [email]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userRes.rows[0];

    // Some default users might not have proper password_hash
    if (!user.password_hash || user.password_hash === 'google_auth_placeholder') {
      return res.status(401).json({ error: 'Please register again with a password, this account used Google Login previously' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
