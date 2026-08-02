const express = require('express');
const router = express.Router();
const { query } = require('../pg_db');
const { verifyToken, requireRoles } = require('../Middleware/authMiddleware');

/**
 * POST /api/applications/apply/:internshipId
 * Student: Apply to an internship
 */
router.post('/apply/:internshipId', async (req, res) => {
    try {
        const { cover_letter, resume_url, userId = 1, studentId } = req.body;
        const internshipId = req.params.internshipId;
        const sId = studentId || userId;

        // 1. Check if user already applied
        const existing = await query('SELECT id FROM applications WHERE internship_id = $1 AND student_id = $2', [internshipId, sId]);
        if (existing.rows.length > 0) return res.status(400).json({ error: 'You have already applied to this internship.' });

        // 2. Daily Limit Check (5 per day)
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        const countRes = await query(
            'SELECT COUNT(*) as count FROM applications WHERE student_id = $1 AND created_at >= $2', 
            [sId, todayStart.toISOString()]
        );
        const appsToday = parseInt(countRes.rows[0].count, 10);

        if (appsToday >= 5) {
            return res.status(403).json({
                error: 'Daily application limit reached (5 per day). Please try again tomorrow!',
                limitReached: true
            });
        }

        // Get user resume if resume_url not provided
        let finalResumeUrl = resume_url;
        if (!finalResumeUrl) {
            const userResObj = await query('SELECT resume_file_url FROM users WHERE id = $1', [sId]);
            if (userResObj.rows.length > 0 && userResObj.rows[0].resume_file_url) {
                finalResumeUrl = userResObj.rows[0].resume_file_url;
            } else {
                const resRes = await query('SELECT content FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [sId]);
                if (resRes.rows.length > 0) {
                    finalResumeUrl = 'Generated Resume (Attached to Profile)';
                } else {
                    finalResumeUrl = 'Standard Applicant Profile Resume';
                }
            }
        }

        const result = await query(
            'INSERT INTO applications (internship_id, student_id, resume_url, cover_letter) VALUES ($1, $2, $3, $4) RETURNING id',
            [internshipId, sId, finalResumeUrl, cover_letter || 'I am excited to apply for this role.']
        );



        res.status(201).json({ success: true, message: 'Application submitted successfully!', applicationId: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/applications/apply-job/:jobId
 * Student: Apply to a job
 */
router.post('/apply-job/:jobId', async (req, res) => {
    try {
        const { cover_letter, resume_url, userId = 1, studentId } = req.body;
        const jobId = req.params.jobId;
        const sId = studentId || userId;

        const existing = await query('SELECT id FROM applications WHERE job_id = $1 AND student_id = $2', [jobId, sId]);
        if (existing.rows.length > 0) return res.status(400).json({ error: 'You have already applied to this job.' });

        // Daily Limit Check (5 per day)
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        const countRes = await query(
            'SELECT COUNT(*) as count FROM applications WHERE student_id = $1 AND created_at >= $2', 
            [sId, todayStart.toISOString()]
        );
        const appsToday = parseInt(countRes.rows[0].count, 10);

        if (appsToday >= 5) {
            return res.status(403).json({
                error: 'Daily application limit reached (5 per day). Please try again tomorrow!',
                limitReached: true
            });
        }

        let finalResumeUrl = resume_url;
        if (!finalResumeUrl) {
            const userResObj = await query('SELECT resume_file_url FROM users WHERE id = $1', [sId]);
            if (userResObj.rows.length > 0 && userResObj.rows[0].resume_file_url) {
                finalResumeUrl = userResObj.rows[0].resume_file_url;
            } else {
                finalResumeUrl = 'Standard Applicant Profile Resume';
            }
        }

        const result = await query(
            'INSERT INTO applications (job_id, student_id, resume_url, cover_letter) VALUES ($1, $2, $3, $4) RETURNING id',
            [jobId, sId, finalResumeUrl, cover_letter || 'I am excited to apply for this role.']
        );



        res.status(201).json({ success: true, message: 'Job application submitted successfully!', applicationId: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/applications/my-applications
 */
router.get('/my-applications', async (req, res) => {
    try {
        const studentId = req.query.userId || 1;
        const result = await query(`
            SELECT a.*, 
                   COALESCE(i.title, j.title) as title, 
                   COALESCE(i.location, j.location) as location, 
                   COALESCE(i.stipend, j.ctc) as stipend, 
                   COALESCE(c_i.name, c_j.name) as company_name, 
                   COALESCE(c_i.logo_url, c_j.logo_url) as logo_url
            FROM applications a
            LEFT JOIN internships i ON a.internship_id = i.id
            LEFT JOIN companies c_i ON i.company_id = c_i.id
            LEFT JOIN jobs j ON a.job_id = j.id
            LEFT JOIN companies c_j ON j.company_id = c_j.id
            WHERE a.student_id = $1
            ORDER BY a.created_at DESC
        `, [studentId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/applications/all
 * Fetch all applications (for admin / employer dashboard view)
 */
router.get('/all', async (req, res) => {
    try {
        const result = await query(`
            SELECT a.*, i.title, c.name as company_name, u.username as student_email, u.phone
            FROM applications a
            JOIN internships i ON a.internship_id = i.id
            JOIN companies c ON i.company_id = c.id
            JOIN users u ON a.student_id = u.id
            ORDER BY a.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PUT /api/applications/:id/status
 */
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'accepted', 'rejected', 'shortlisted'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await query('UPDATE applications SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ success: true, status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
