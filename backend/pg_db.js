const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

let useSQLite = false;
let sqliteDb = null;
let pgPool = null;

// Initialize PostgreSQL pool
try {
  pgPool = new Pool({
    connectionString: process.env.PG_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/internshala_clone',
    connectionTimeoutMillis: 2000,
  });
} catch (e) {
  useSQLite = true;
}

let dbPath = path.join(__dirname, 'internshala.sqlite');

if (process.env.VERCEL || process.env.AWS_REGION) {
  const fs = require('fs');
  const tmpPath = path.join('/tmp', 'internshala.sqlite');
  try {
    if (!fs.existsSync(tmpPath)) {
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, tmpPath);
        console.log('Copied SQLite database to /tmp for serverless environment.');
      } else {
        console.log('SQLite source database not found, a new one will be created in /tmp.');
      }
    }
    dbPath = tmpPath;
  } catch (err) {
    console.error('Error setting up SQLite in /tmp:', err);
  }
}

function initSQLite() {
  sqliteDb = new sqlite3.Database(dbPath);
  console.log('Connected to embedded SQLite database at', dbPath);
  
  sqliteDb.serialize(() => {
    // Enable Foreign Keys
    sqliteDb.run('PRAGMA foreign_keys = ON');

    // Create Tables
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      phone TEXT,
      role_id INTEGER DEFAULT 1,
      profile_picture TEXT,
      resume_file_url TEXT,
      preferred_language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Add column to existing local sqlite database if it doesn't have it yet
    sqliteDb.run("ALTER TABLE users ADD COLUMN otp_verified_at DATETIME", (err) => {
        // Will throw an error if column already exists, which we can safely ignore
    });



    sqliteDb.run(`CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      logo_url TEXT,
      website TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      stipend TEXT NOT NULL,
      duration TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      ctc TEXT NOT NULL,
      experience TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      internship_id INTEGER,
      job_id INTEGER,
      student_id INTEGER,
      resume_url TEXT NOT NULL,
      cover_letter TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER,
      sender_id INTEGER,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      application_limit INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      plan_id INTEGER,
      status TEXT DEFAULT 'active',
      current_period_start DATETIME NOT NULL,
      current_period_end DATETIME NOT NULL,
      applications_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      order_id TEXT,
      payment_id TEXT,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);



    sqliteDb.run(`CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS resume_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      order_id TEXT,
      payment_id TEXT,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT,
      media_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id)
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);



    // Add Performance Indexes
    sqliteDb.run(`CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category)`);
    sqliteDb.run(`CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location)`);
    sqliteDb.run(`CREATE INDEX IF NOT EXISTS idx_internships_category ON internships(category)`);
    sqliteDb.run(`CREATE INDEX IF NOT EXISTS idx_internships_location ON internships(location)`);
    sqliteDb.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);

    // Add resume_file_url to existing users if they don't have it
    sqliteDb.run(`ALTER TABLE users ADD COLUMN resume_file_url TEXT`, (err) => {
      // Ignore error if column already exists
    });

    seedSQLiteData();
  });
}

function seedSQLiteData() {
  // Roles
  sqliteDb.run("INSERT OR IGNORE INTO roles (id, name) VALUES (1, 'student'), (2, 'employer'), (3, 'admin')");

  // Plans: Free, Bronze (₹100, 3 app), Silver (₹300, 5 app), Gold (₹1000, unlimited)
  sqliteDb.get("SELECT COUNT(*) as count FROM plans", (err, row) => {
    if (row && row.count === 0) {
      sqliteDb.run("INSERT INTO plans (id, name, price, application_limit) VALUES (1, 'Free', 0, 1)");
      sqliteDb.run("INSERT INTO plans (id, name, price, application_limit) VALUES (2, 'Bronze', 100, 3)");
      sqliteDb.run("INSERT INTO plans (id, name, price, application_limit) VALUES (3, 'Silver', 300, 5)");
      sqliteDb.run("INSERT INTO plans (id, name, price, application_limit) VALUES (4, 'Gold', 1000, NULL)");
    }
  });

  // Seed Default Users if none exist
  sqliteDb.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
    if (row && row.count === 0) {
      // Student user
      sqliteDb.run(
        "INSERT INTO users (id, username, phone, role_id) VALUES (1, 'student@example.com', '9876543210', 1)"
      );
      // Employer user
      sqliteDb.run(
        "INSERT INTO users (id, username, phone, role_id) VALUES (2, 'employer@google.com', '9876543211', 2)"
      );
      // Admin user
      sqliteDb.run(
        "INSERT INTO users (id, username, phone, role_id) VALUES (3, 'admin@internshala.com', '9876543212', 3)"
      );

      // Companies
      sqliteDb.run("INSERT INTO companies (id, user_id, name, description, logo_url, website) VALUES (1, 2, 'Google Inc.', 'Global tech giant specializing in search, AI, and cloud services.', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', 'https://google.com')");
      sqliteDb.run("INSERT INTO companies (id, user_id, name, description, logo_url, website) VALUES (2, 2, 'Meta Technologies', 'Social technology company empowering global connectivity.', 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta-Logo.png', 'https://meta.com')");
      sqliteDb.run("INSERT INTO companies (id, user_id, name, description, logo_url, website) VALUES (3, 2, 'Adobe Systems', 'Leading creative software solutions company.', 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.png', 'https://adobe.com')");

      // Internships
      sqliteDb.run(`INSERT INTO internships (id, company_id, title, description, location, stipend, duration, category, status) VALUES 
        (1, 1, 'Frontend Development Intern', 'Work with React, Next.js, and TypeScript to build scalable UI components.', 'Remote', '₹25,000 /month', '3 Months', 'Engineering', 'open'),
        (2, 2, 'Full Stack Web Developer Intern', 'Build modern Node.js and React applications with GraphQL and REST APIs.', 'Bangalore', '₹35,000 /month', '6 Months', 'Engineering', 'open'),
        (3, 3, 'UI/UX Design Intern', 'Create intuitive designs, wireframes, and design systems for mobile & web.', 'Work From Home', '₹20,000 /month', '2 Months', 'Design', 'open'),
        (4, 1, 'Data Science & ML Intern', 'Develop predictive machine learning models using Python, Pandas & PyTorch.', 'Gurgaon', '₹30,000 /month', '4 Months', 'Data Science', 'open'),
        (5, 2, 'Digital Marketing Intern', 'Manage social media campaigns, SEO optimizations, and growth analytics.', 'Mumbai', '₹15,000 /month', '3 Months', 'Media', 'open')`);

      // Jobs
      sqliteDb.run(`INSERT INTO jobs (id, company_id, title, description, location, ctc, experience, category, status) VALUES 
        (1, 1, 'Software Engineer - Frontend', 'Build high-performance web interfaces with React and Next.js.', 'Bangalore', '₹12-16 LPA', '1-3 Years', 'Engineering', 'open'),
        (2, 2, 'Backend Developer (Node.js/Postgres)', 'Architect scalable microservices and robust API gateways.', 'Hyderabad', '₹14-18 LPA', '2+ Years', 'Engineering', 'open'),
        (3, 3, 'Product Designer', 'Lead user research, prototyping, and end-to-end UX flow design.', 'Remote', '₹10-14 LPA', '1+ Years', 'Design', 'open'),
        (4, 1, 'AI Engineer', 'Implement generative AI solutions and LLM fine-tuning pipelines.', 'Gurgaon', '₹18-24 LPA', '2+ Years', 'Data Science', 'open')`);

      // Friends for Student (User 1 has 2 friends initially: User 2 & User 3)
      sqliteDb.run("INSERT INTO friends (user_id, friend_id) VALUES (1, 2)");
      sqliteDb.run("INSERT INTO friends (user_id, friend_id) VALUES (1, 3)");

      // Sample Community Posts
      sqliteDb.run(`INSERT INTO posts (id, user_id, content, media_url) VALUES 
        (1, 1, 'Excited to start my journey learning Next.js and building cool projects on Internshala!', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop'),
        (2, 2, 'We are hiring Frontend and Data Science interns at Google! Check out our latest listings.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop')`);

      console.log('Initial SQLite database seeded with default users, companies, internships, jobs, friends & posts!');
    }
  });
}

// Test PG connection; fallback to SQLite if PG fails
pgPool.connect((err, client, release) => {
  if (err) {
    console.log('PostgreSQL unavailable. Using embedded SQLite database fallback.');
    useSQLite = true;
    initSQLite();
  } else {
    console.log('PostgreSQL database connected successfully');
    if (release) release();
  }
});

/**
 * Execute SQL query with parameter normalization for SQLite / Postgres
 */
function query(sqlText, params = []) {
  if (!useSQLite && pgPool) {
    return pgPool.query(sqlText, params);
  }

  return new Promise((resolve, reject) => {
    if (!sqliteDb) {
      initSQLite();
    }

    let normalizedSql = sqlText
      .replace(/\$([0-9]+)/g, '?')
      .replace(/ILIKE/gi, 'LIKE')
      .replace(/CURRENT_TIMESTAMP/gi, "datetime('now')");

    // Remove RETURNING * or RETURNING id for SQLite
    const hasReturning = /RETURNING/i.test(normalizedSql);
    normalizedSql = normalizedSql.replace(/\s+RETURNING\s+.*$/i, '');

    const isSelect = /^(\s*SELECT|\s*WITH|\s*EXPLAIN)/i.test(normalizedSql);

    if (isSelect) {
      sqliteDb.all(normalizedSql, params, (err, rows) => {
        if (err) return reject(err);
        resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 });
      });
    } else {
      sqliteDb.run(normalizedSql, params, function (err) {
        if (err) return reject(err);
        
        if (hasReturning) {
          // If query had RETURNING, fetch inserted row or updated count
          const lastId = this.lastID;
          if (lastId) {
            // Retrieve inserted row using table name or lastID
            const match = sqlText.match(/INSERT\s+INTO\s+([a-z0-9_]+)/i);
            const tableName = match ? match[1] : null;
            if (tableName) {
              sqliteDb.get(`SELECT * FROM ${tableName} WHERE id = ?`, [lastId], (fetchErr, row) => {
                if (fetchErr) return resolve({ rows: [{ id: lastId }], rowCount: 1 });
                resolve({ rows: [row], rowCount: 1 });
              });
              return;
            }
          }
        }
        resolve({ rows: [{ id: this.lastID }], rowCount: this.changes });
      });
    }
  });
}

module.exports = {
  query,
  pool: pgPool,
};
