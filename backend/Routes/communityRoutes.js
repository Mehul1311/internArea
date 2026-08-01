const express = require('express');
const router = express.Router();
const db = require('../pg_db');
const { checkPostLimit } = require('../Middleware/checkPostLimit');

// 1. Get user friends & count
router.get('/friends', async (req, res) => {
    try {
        const userId = req.query.userId || 1;
        const result = await db.query(
            `SELECT f.id, f.friend_id, u.username, u.profile_picture 
             FROM friends f
             JOIN users u ON f.friend_id = u.id
             WHERE f.user_id = $1`,
            [userId]
        );
        res.json({
            count: result.rows.length,
            friends: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

// 2. Add a friend (to easily test increasing post limits!)
router.post('/friends/add', async (req, res) => {
    try {
        const { userId = 1, friendId } = req.body;
        if (!friendId) return res.status(400).json({ error: 'Friend ID is required' });

        const existing = await db.query(
            'SELECT id FROM friends WHERE user_id = $1 AND friend_id = $2',
            [userId, friendId]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Already friends' });
        }

        await db.query(
            'INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)',
            [userId, friendId]
        );

        // Recalculate count
        const countRes = await db.query('SELECT COUNT(*) as count FROM friends WHERE user_id = $1', [userId]);
        const newCount = parseInt(countRes.rows[0].count, 10);

        res.status(201).json({
            success: true,
            message: 'Friend added successfully!',
            friendCount: newCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add friend' });
    }
});

// 3. Create a Post (enforces friend-based posting limits)
router.post('/posts', checkPostLimit, async (req, res) => {
    try {
        const { userId = 1, content, mediaUrl } = req.body;
        
        if (!content && !mediaUrl) {
            return res.status(400).json({ error: 'Post must contain text or photo/video URL' });
        }

        const result = await db.query(
            `INSERT INTO posts (user_id, content, media_url) 
             VALUES ($1, $2, $3) RETURNING *`,
            [userId, content || '', mediaUrl || '']
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// 4. Fetch all public posts with likes, comments, shares
router.get('/posts', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, p.content, p.media_url, p.created_at,
                u.id as user_id, u.username, u.profile_picture,
                (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
                (SELECT COUNT(*) FROM shares s WHERE s.post_id = p.id) as shares_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `;
        const result = await db.query(query);

        // Fetch comments for each post
        const posts = await Promise.all(result.rows.map(async (post) => {
            const commentsRes = await db.query(
                `SELECT c.id, c.content, c.created_at, u.username 
                 FROM comments c 
                 JOIN users u ON c.user_id = u.id 
                 WHERE c.post_id = $1 
                 ORDER BY c.created_at ASC`,
                [post.id]
            );
            return {
                ...post,
                comments: commentsRes.rows
            };
        }));

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// 5. Like a post
router.post('/posts/:id/like', async (req, res) => {
    try {
        const postId = req.params.id;
        const { userId = 1 } = req.body;

        await db.query(
            `INSERT INTO likes (post_id, user_id) VALUES ($1, $2)`,
            [postId, userId]
        );

        res.status(200).json({ message: 'Post liked successfully' });
    } catch (err) {
        // If unique constraint or duplicate, ignore error
        res.status(200).json({ message: 'Post liked' });
    }
});

// 6. Comment on a post
router.post('/posts/:id/comment', async (req, res) => {
    try {
        const postId = req.params.id;
        const { userId = 1, content } = req.body;

        if (!content) return res.status(400).json({ error: 'Comment content required' });

        const result = await db.query(
            `INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *`,
            [postId, userId, content]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// 7. Share a post
router.post('/posts/:id/share', async (req, res) => {
    try {
        const postId = req.params.id;
        const { userId = 1 } = req.body;

        await db.query(
            `INSERT INTO shares (post_id, user_id) VALUES ($1, $2)`,
            [postId, userId]
        );

        res.status(200).json({ message: 'Post shared successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to share post' });
    }
});

module.exports = router;
