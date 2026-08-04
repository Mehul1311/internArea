const { query } = require("../pg_db");
const { auth } = require('../firebaseAdmin');

/**
 * Verify Firebase ID Token
 */
async function verifyToken(req, res, next) {
    try {
        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ error: "Access denied. No Firebase token provided." });
        }

        // Verify Firebase Token
        let decoded;
        try {
            decoded = await auth.verifyIdToken(token);
        } catch (fbErr) {
            console.error("Firebase verify error:", fbErr.message);
            return res.status(401).json({ error: "Invalid Firebase token.", expired: fbErr.code === 'auth/id-token-expired' });
        }
        
        const email = decoded.email || decoded.uid; // Fallback to uid if no email

        let userRes = await query(`
            SELECT u.id, u.username, u.profile_picture, r.name as role 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.username = $1
        `, [email]);

        // Auto-create user in Postgres if they signed up via Firebase but don't exist in DB
        if (userRes.rows.length === 0) {
            let roleId = 1; // Default to student
            if (req.query.role === 'employer') {
                roleId = 2; // Employer role
            }
            const phone = req.query.phone || '';

            const newUser = await query(
                'INSERT INTO users (username, role_id, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
                [email, roleId, phone, 'google_auth_placeholder']
            );
            
            // If employer, auto-create company
            if (roleId === 2) {
                await query('INSERT INTO companies (user_id, name) VALUES ($1, $2)', [newUser.rows[0].id, email.split('@')[0] + "'s Company"]);
            }

            userRes = await query(`
                SELECT u.id, u.username, u.profile_picture, r.name as role 
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = $1
            `, [newUser.rows[0].id]);
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
    requireRoles
};
