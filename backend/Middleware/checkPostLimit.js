const db = require('../pg_db');
const { getDailyPostLimit } = require('../utils/communityUtils');

/**
 * Middleware to check if a user has reached their daily posting limit.
 * Expects req.user.id to be set by a previous authentication middleware.
 * If req.user is not present, we will fallback to a userId passed in the body for testing purposes.
 */
const checkPostLimit = async (req, res, next) => {
    try {
        // Retrieve userId from auth token or body (for simple testing without full auth)
        const userId = req.user ? req.user.id : req.body.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: User ID is required' });
        }

        // 1. Get friend count
        const friendsResult = await db.query(
            `SELECT COUNT(*) FROM friends WHERE user_id = $1`,
            [userId]
        );
        const friendCount = parseInt(friendsResult.rows[0].count, 10);

        // 2. Calculate limit based on rules
        const limit = getDailyPostLimit(friendCount);

        // 3. If limit is 0, they can't post
        if (limit === 0) {
            return res.status(403).json({
                error: 'Posting Limit Reached',
                message: 'You need at least 1 friend to create a post.'
            });
        }

        // 4. If limit is Infinity, allow
        if (limit === Infinity) {
            return next();
        }

        // 5. Check how many posts they've made today using UTC strictly
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        const postsResult = await db.query(
            `SELECT COUNT(*) FROM posts WHERE user_id = $1 AND created_at >= $2`,
            [userId, todayStart.toISOString()]
        );
        
        const postsToday = parseInt(postsResult.rows[0].count, 10);

        // 6. Check against limit
        if (postsToday >= limit) {
            return res.status(403).json({
                error: 'Posting Limit Reached',
                message: `You have reached your daily limit of ${limit} post(s). Make more friends to post more!`
            });
        }

        // 7. Limit not reached, proceed
        next();
    } catch (error) {
        console.error('Error in checkPostLimit middleware:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    checkPostLimit
};
