const express = require("express");
const router = express.Router();
const db = require("../pg_db");

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const offset = (page - 1) * limit;
    const { location, category, search } = req.query;

    let baseQuery = `
      FROM internships i
      LEFT JOIN companies c ON i.company_id = c.id
      WHERE i.status = 'open'
    `;
    const params = [];

    if (location) {
        params.push(`%${location}%`);
        baseQuery += ` AND i.location ILIKE $${params.length}`;
    }
    if (category && category !== 'All Categories') {
        params.push(`%${category}%`);
        baseQuery += ` AND i.category ILIKE $${params.length}`;
    }
    if (search) {
        params.push(`%${search}%`);
        baseQuery += ` AND (i.title ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
    }

    const countRes = await db.query(`SELECT COUNT(*) as total ${baseQuery}`, params);
    const total = parseInt(countRes.rows[0].total, 10);

    params.push(limit, offset);
    const result = await db.query(`
      SELECT i.id as _id, i.id, i.title, i.description, i.location, i.stipend, i.duration, i.category, c.name as company
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT i.id as _id, i.id, i.title, i.description, i.location, i.stipend, i.duration, i.category, c.name as company, c.description as aboutCompany
      FROM internships i
      LEFT JOIN companies c ON i.company_id = c.id
      WHERE i.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Internship not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, company, location, category, aboutCompany, aboutInternship, whoCanApply, perks, numberOfOpening, stipend, startDate, duration } = req.body;
    const compRes = await db.query('SELECT id FROM companies LIMIT 1');
    const companyId = compRes.rows.length ? compRes.rows[0].id : 1;

    const result = await db.query(
      `INSERT INTO internships (company_id, title, description, location, stipend, duration, category) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [companyId, title, aboutInternship || 'Detailed internship description.', location, stipend || '₹20,000 /month', duration || '3 Months', category || 'Engineering']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
