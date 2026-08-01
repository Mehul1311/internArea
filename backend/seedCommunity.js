const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'internshala.sqlite');
const db = new sqlite3.Database(dbPath);

function query(sql, params) {
  return new Promise((resolve, reject) => {
    // Basic conversion for RETURNING id
    const isInsert = sql.toLowerCase().includes('insert');
    const cleanSql = sql.replace(/\s+RETURNING\s+id/i, '');
    
    db.run(cleanSql, params, function (err) {
      if (err) return reject(err);
      resolve({ rows: [{ id: this.lastID }] });
    });
  });
}

function selectQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve({ rows });
    });
  });
}

async function seed() {
  console.log("Seeding crazy community data...");
  const passHash = await bcrypt.hash('password123', 10);
  
  // Create some users
  const users = [
    { username: 'elonmusk@spacex.com', role: 2, dp: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Elon_Musk_Royal_Society_crop.jpg/800px-Elon_Musk_Royal_Society_crop.jpg' },
    { username: 'samaltman@openai.com', role: 2, dp: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Sam_Altman_TechCrunch_Disrupt_San_Francisco_2019_%2848834434641%29_%28cropped%29.jpg' },
    { username: '1337hacker@college.edu', role: 1, dp: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=500&auto=format&fit=crop' },
    { username: 'intern_hero@uni.edu', role: 1, dp: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop' }
  ];

  const userIds = {};

  for (let u of users) {
    try {
      const res = await query(
        "INSERT INTO users (username, password_hash, role_id, profile_picture) VALUES (?, ?, ?, ?) RETURNING id",
        [u.username, passHash, u.role, u.dp]
      );
      userIds[u.username] = res.rows[0].id;
    } catch (e) {
      // User might already exist, get ID
      const res = await selectQuery("SELECT id FROM users WHERE username = ?", [u.username]);
      if (res.rows.length) {
         userIds[u.username] = res.rows[0].id;
      }
    }
  }

  // Create Posts
  const posts = [
    { 
      uid: userIds['elonmusk@spacex.com'], 
      content: "We are urgently hiring interns to colonize Mars. Requirements: Node.js, React, and a spacesuit. Willingness to relocate is mandatory. 🚀🔥", 
      media: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&auto=format&fit=crop" 
    },
    {
      uid: userIds['samaltman@openai.com'],
      content: "AGI achieved internally. It writes better Next.js than all of us combined. We still need frontend interns to center divs though. Please apply.",
      media: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop"
    },
    {
      uid: userIds['1337hacker@college.edu'],
      content: "Just spent 12 hours debugging a CORS error. Turns out I was hitting the wrong API endpoint the whole time. Pain. 🫠",
      media: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop"
    },
    {
      uid: userIds['intern_hero@uni.edu'],
      content: "Got my first internship at Google! 🎉 Thanks to this community for the resume reviews! Never giving up pays off.",
      media: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop"
    }
  ];

  for (let p of posts) {
    if(!p.uid) continue;
    const pRes = await query(
      "INSERT INTO posts (user_id, content, media_url) VALUES (?, ?, ?) RETURNING id",
      [p.uid, p.content, p.media]
    );
    const postId = pRes.rows[0].id;

    // Add some random likes
    const randomUsers = Object.values(userIds).concat([1, 2]); // add student/employer ids
    for (let uId of randomUsers) {
      if (Math.random() > 0.3) {
         try {
           await query("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [postId, uId]);
         } catch(e){}
      }
    }

    // Add some comments
    if (p.uid === userIds['elonmusk@spacex.com']) {
       await query("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)", [postId, userIds['1337hacker@college.edu'], "Can I work remotely from Earth?"]);
    }
    if (p.uid === userIds['samaltman@openai.com']) {
       await query("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)", [postId, userIds['intern_hero@uni.edu'], "Will AGI steal my internship? 😭"]);
    }
    if (p.uid === userIds['1337hacker@college.edu']) {
       await query("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)", [postId, userIds['intern_hero@uni.edu'], "Bro we've all been there 💀"]);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed();
