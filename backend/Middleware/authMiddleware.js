const { query } = require("../pg_db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || 'internshala_clone_secret_key_2026';

/**
 * Verify JWT Token
 */
async function verifyToken(req, res, next) {
    try {
        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (jwtErr) {
            console.error("JWT verify error:", jwtErr.message);
            return res.status(401).json({ error: "Invalid token.", expired: jwtErr.name === 'TokenExpiredError' });
        }
        
        const userId = decoded.id;

        let userRes = await query(`
            SELECT u.id, u.username, u.profile_picture, r.name as role 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `, [userId]);

        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        req.user = userRes.rows[0];
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(500).json({ error: "Internal server error during authentication." });
    }
}

/**
 * Require specific role
 * @param {string[]} roles Array of allowed roles (e.g., ['employer', 'admin'])
 */
function requireRoles(roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access forbidden. Insufficient permissions." });
        }
        next();
    };
}

module.exports = {
    verifyToken,
    requireRoles,
    JWT_SECRET
};
