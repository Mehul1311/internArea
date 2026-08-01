const express = require('express');
const router = express.Router();
const { query } = require('../pg_db');

const { upload } = require('../utils/cloudinary');

/**
 * GET /api/profile/login-history
 * Returns paginated login history for a user
 */
router.get('/login-history', async (req, res) => {
  // Mocking auth check by accepting username from query
  // In a real application, extract user ID from JWT token via middleware
  const { username, page = 1, limit = 10 } = req.query;

  if (!username) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const userRes = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const userId = userRes.rows[0].id;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch paginated history
    const historyRes = await query(`
      SELECT browser, os, device_type, ip_address, status, block_reason, created_at
      FROM login_attempts
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit), offset]);

    // Fetch total count for pagination metadata
    const countRes = await query('SELECT COUNT(*) FROM login_attempts WHERE user_id = $1', [userId]);
    const totalCount = parseInt(countRes.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      history: historyRes.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: totalCount,
        totalPages: totalPages
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/profile/upload-photo
 * Upload a profile picture
 */
router.post('/upload-photo', upload.single('file'), async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  try {
    const photoUrl = req.file.path;
    await query('UPDATE users SET profile_picture = $1 WHERE username = $2', [photoUrl, username]);
    res.json({ success: true, photo: photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

/**
 * POST /api/profile/upload-resume
 * Upload a resume (PDF)
 */
router.post('/upload-resume', upload.single('file'), async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  try {
    const resumeUrl = req.file.path;
    await query('UPDATE users SET resume_file_url = $1 WHERE username = $2', [resumeUrl, username]);
    res.json({ success: true, resumeUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

module.exports = router;
