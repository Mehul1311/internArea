const { query } = require('./pg_db');

const locations = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Gurgaon', 'Noida', 'Remote', 'New York', 'London', 'San Francisco'];
const jobCategories = ['Engineering', 'Design', 'Data Science', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product Management', 'Customer Support', 'Legal'];
const durations = ['1 Month', '2 Months', '3 Months', '6 Months', 'Flexible'];
const experiences = ['Fresher', '1 Year', '2+ Years', '3-5 Years', '5+ Years'];

// Array of random company names
const companyNames = [
  'TechNova', 'InnovateX', 'Alpha Dynamics', 'Nexus Solutions', 'Quantum Leap', 'DataMind', 'CloudSync', 'Apex Systems',
  'Visionary Labs', 'Pioneer Digital', 'Synergy Corp', 'EcoTech', 'NextGen Apps', 'FutureWorks', 'Global Innovations',
  'Smart Solutions', 'Creative Media', 'FinTech Hub', 'HealthCorp', 'EduLearn', 'GreenEnergy Solutions'
];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomElement(arr) {
  return arr[getRandomInt(arr.length)];
}

function generateStipend() {
  const amount = getRandomInt(4) * 5000 + 10000; // 10k to 25k
  return `₹${amount} /month`;
}

function generateCTC() {
  const min = getRandomInt(10) + 3; // 3 to 12
  const max = min + getRandomInt(5) + 2;
  return `₹${min}-${max} LPA`;
}

async function seedData() {
  console.log('Waiting for DB connection/fallback...');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Starting seed process...');

  try {
    // 1. Create Companies (if they don't exist in bulk)
    console.log('Generating companies...');
    const companyIds = [];
    for (let i = 0; i < 50; i++) {
      const name = getRandomElement(companyNames) + ' ' + (getRandomInt(100) > 50 ? 'Inc.' : 'LLC');
      const desc = `A leading company in ${getRandomElement(jobCategories)}.`;
      // Use employer user_id = 2
      const res = await query(
        "INSERT INTO companies (user_id, name, description, logo_url, website) VALUES (2, $1, $2, 'https://ui-avatars.com/api/?name=' || REPLACE($1, ' ', '+') || '&background=random', 'https://example.com') RETURNING id",
        [name, desc]
      );
      companyIds.push(res.rows[0].id);
    }

    // 2. Insert 100 Internships
    console.log('Generating 100 Internships...');
    for (let i = 0; i < 100; i++) {
      const category = getRandomElement(jobCategories);
      const title = `${category} Intern - Level ${getRandomInt(3) + 1} (${Math.random().toString(36).substring(7)})`;
      const desc = `Join our exciting team as a ${category} intern. You will work on cutting-edge projects, learn from industry experts, and contribute to our core products. This is a great opportunity to jumpstart your career in ${category}.`;
      const loc = getRandomElement(locations);
      const stip = generateStipend();
      const dur = getRandomElement(durations);
      const compId = getRandomElement(companyIds);

      await query(
        `INSERT INTO internships (company_id, title, description, location, stipend, duration, category, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')`,
        [compId, title, desc, loc, stip, dur, category]
      );
      if ((i + 1) % 20 === 0) console.log(`Inserted ${i + 1} internships...`);
    }

    // 3. Insert 100 Jobs
    console.log('Generating 100 Jobs...');
    for (let i = 0; i < 100; i++) {
      const category = getRandomElement(jobCategories);
      const title = `Senior ${category} Specialist (${Math.random().toString(36).substring(7)})`;
      const desc = `We are looking for an experienced ${category} professional to join our fast-growing company. You will take ownership of major projects, mentor junior team members, and drive our strategic goals forward.`;
      const loc = getRandomElement(locations);
      const ctc = generateCTC();
      const exp = getRandomElement(experiences);
      const compId = getRandomElement(companyIds);

      await query(
        `INSERT INTO jobs (company_id, title, description, location, ctc, experience, category, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')`,
        [compId, title, desc, loc, ctc, exp, category]
      );
      if ((i + 1) % 20 === 0) console.log(`Inserted ${i + 1} jobs...`);
    }

    console.log('Successfully seeded 200 static jobs and internships!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedData();
