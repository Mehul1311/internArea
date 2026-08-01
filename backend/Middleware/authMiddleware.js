const jwt = require("jsonwebtoken");
const { query } = require("../pg_db");

/**
 * Verify JWT Token from Cookie
 */
async function verifyToken(req, res, next) {
    try {
        let token = req.cookies ? req.cookies.access_token : null;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        const userRes = await query(`
            SELECT u.id, u.username, u.profile_picture, r.name as role 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `, [decoded.id]);

        if (userRes.rows.length === 0) {
            return res.status(401).json({ error: "Invalid token. User not found." });
        }

        req.user = userRes.rows[0];
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired", expired: true });
        }
        return res.status(400).json({ error: "Invalid token." });
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
    requireRoles
};
