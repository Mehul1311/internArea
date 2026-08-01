const express = require('express');
const router = express.Router();
const { query } = require('../pg_db');
const { verifyToken, requireRoles } = require('../Middleware/authMiddleware');

/**
 * GET /api/internships
 * Public/Student: Browse internships with filters
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        const { location, category, search } = req.query;

        let baseQuery = `
            FROM internships i
            JOIN companies c ON i.company_id = c.id
            WHERE i.status = 'open'
        `;
        const params = [];

        if (location) {
            params.push(`%${location}%`);
            baseQuery += ` AND i.location ILIKE $${params.length}`;
        }
        if (category) {
            params.push(`%${category}%`);
            baseQuery += ` AND i.category ILIKE $${params.length}`;
        }
        if (search) {
            params.push(`%${search}%`);
            baseQuery += ` AND (i.title ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
        }

        // Get total count
        const countRes = await query(`SELECT COUNT(*) as total ${baseQuery}`, params);
        const total = parseInt(countRes.rows[0].total, 10);

        // Get paginated data
        params.push(limit, offset);
        const result = await query(`
            SELECT i.*, c.name as company_name, c.logo_url 
            ${baseQuery}
            ORDER BY i.created_at DESC
            LIMIT $${params.length - 1} OFFSET $${params.length}
        `, params);
        
        res.status(200).json({
            data: result.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            limit
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/internships/my-internships
 * Employer: View their posted internships
 */
router.get('/my-internships', verifyToken, requireRoles(['employer']), async (req, res) => {
    try {
        const compRes = await query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
        if (compRes.rows.length === 0) return res.status(404).json({ error: 'Company profile not found' });
        
        const results = await query('SELECT * FROM internships WHERE company_id = $1 ORDER BY created_at DESC', [compRes.rows[0].id]);
        res.json(results.rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/internships
 * Employer: Create an internship
 */
router.post('/', verifyToken, requireRoles(['employer']), async (req, res) => {
    try {
        const { title, description, location, stipend, duration, category } = req.body;

        const compRes = await query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
        if (compRes.rows.length === 0) return res.status(404).json({ error: 'Company profile not found' });
        const companyId = compRes.rows[0].id;

        const result = await query(
            `INSERT INTO internships (company_id, title, description, location, stipend, duration, category) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [companyId, title, description, location, stipend, duration, category]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/internships/:id
 * Public: Get single internship details
 */
router.get('/:id', async (req, res) => {
    try {
        const result = await query(`
            SELECT i.*, c.name as company_name, c.logo_url, c.description as company_description
            FROM internships i
            JOIN companies c ON i.company_id = c.id
            WHERE i.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'Internship not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PUT /api/internships/:id
 * Employer: Edit internship
 */
router.put('/:id', verifyToken, requireRoles(['employer']), async (req, res) => {
    try {
        const { title, description, location, stipend, duration, category, status } = req.body;
        
        const compRes = await query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
        if (compRes.rows.length === 0) return res.status(404).json({ error: 'Company profile not found' });

        const checkRes = await query('SELECT id FROM internships WHERE id = $1 AND company_id = $2', [req.params.id, compRes.rows[0].id]);
        if (checkRes.rows.length === 0) return res.status(403).json({ error: 'Not authorized to edit this internship' });

        await query(
            `UPDATE internships SET title=$1, description=$2, location=$3, stipend=$4, duration=$5, category=$6, status=$7 
             WHERE id=$8`,
            [title, description, location, stipend, duration, category, status, req.params.id]
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
