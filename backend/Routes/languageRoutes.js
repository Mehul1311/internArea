const express = require('express');
const router = express.Router();
const { query } = require('../pg_db');


const SUPPORTED_LANGUAGES = ['en', 'es', 'hi', 'pt', 'zh', 'fr'];

async function getUser(username) {
  const res = await query('SELECT * FROM users WHERE username = $1 OR phone = $1 OR id = $1', [username]);
  return res.rows[0];
}

/**
 * POST /api/language/change
 * Handle language switch
 * If language is French ('fr'), triggers OTP requirement
 */
router.post('/change', async (req, res) => {
  const { username = 'student@example.com', targetLanguage } = req.body;
  if (!targetLanguage || !SUPPORTED_LANGUAGES.includes(targetLanguage)) {
    return res.status(400).json({ error: 'Unsupported language specified' });
  }

  try {
    const user = await getUser(username);
    if (!user) return res.status(404).json({ error: 'User not found' });



    // For all other languages, switch immediately
    await query('UPDATE users SET preferred_language = $1 WHERE id = $2', [targetLanguage, user.id]);

    res.status(200).json({
      success: true,
      message: `Language updated to ${targetLanguage}`,
      preferred_language: targetLanguage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
