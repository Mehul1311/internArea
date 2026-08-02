const express = require('express');
const router = express.Router();
const { query } = require('../pg_db');
const { generateAndSendOTP, verifyOTP } = require('../utils/otpService');

async function getUser(username) {
  const res = await query('SELECT * FROM users WHERE username = $1 OR phone = $1 OR id = $1', [username]);
  return res.rows[0];
}

/**
 * POST /api/resume/save
 * Directly save generated resume
 */
router.post('/save', async (req, res) => {
  const { username = 'student@example.com', resumeContent } = req.body;

  try {
    const user = await getUser(username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Save resume to DB
    const resumeJson = JSON.stringify(resumeContent || {});
    await query('INSERT INTO resumes (user_id, content) VALUES ($1, $2)', [user.id, resumeJson]);

    res.status(200).json({
      success: true,
      message: 'Resume generated and attached to your profile successfully!',
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
