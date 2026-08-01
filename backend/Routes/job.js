const express = require("express");
const router = express.Router();
const db = require("../pg_db");

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const { search, category, location } = req.query;

    let baseQuery = `
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.status = 'open'
    `;
    let params = [];

    if (category) {
      params.push(`%${category}%`);
      baseQuery += ` AND j.category ILIKE $${params.length}`;
    }
    if (location) {
      params.push(`%${location}%`);
      baseQuery += ` AND j.location ILIKE $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      baseQuery += ` AND (j.title ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
    }

    // Get total count
    const countRes = await db.query(`SELECT COUNT(*) as total ${baseQuery}`, params);
    const total = parseInt(countRes.rows[0].total, 10);

    // Get paginated data
    params.push(limit, offset);
    const result = await db.query(`
      SELECT j.id as _id, j.id, j.title, j.description, j.location, j.ctc as CTC, j.experience as Experience, j.category, c.name as company
      ${baseQuery}
      ORDER BY j.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.status(200).json({
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT j.id as _id, j.id, j.title, j.description, j.location, j.ctc as CTC, j.experience as Experience, j.category, c.name as company, c.description as aboutCompany
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, company = 'Google Inc.', location, stipend, duration, category, CTC, Experience, aboutCompany, aboutJob } = req.body;
    const compRes = await db.query('SELECT id FROM companies LIMIT 1');
    const companyId = compRes.rows.length ? compRes.rows[0].id : 1;

    const result = await db.query(
      `INSERT INTO jobs (company_id, title, description, location, ctc, experience, category) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [companyId, title, aboutJob || 'Detailed job description.', location, CTC || '₹12 LPA', Experience || '1+ Years', category || 'Engineering']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;