const fs = require('fs');
const path = require('path');
const { pool } = require('./pg_db');

async function initDB() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Running database migrations...');
        await pool.query(sql);
        console.log('Migrations executed successfully!');
    } catch (err) {
        console.error('Error executing migrations:', err);
    } finally {
        pool.end();
    }
}

initDB();
