const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function migrate() {
  console.log('🔌 Connecting to Cloud MySQL for migration...');
  const conn = await mysql.createConnection(dbConfig);
  console.log('✅ Connected.');

  try {
    // 1. Alter Users table - One by one with error handling
    const columns = [
      ['points', 'INT DEFAULT 0'],
      ['streak', 'INT DEFAULT 0'],
      ['last_login_date', 'DATE']
    ];

    for (const [name, type] of columns) {
      try {
        console.log(`Adding column \`${name}\` to \`users\` table...`);
        await conn.execute(`ALTER TABLE users ADD COLUMN ${name} ${type}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column \`${name}\` already exists, skipping.`);
        } else {
          throw err;
        }
      }
    }

    // 2. Create Badges table
    console.log('Creating \`badges\` table...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        points_required INT NOT NULL,
        description TEXT,
        icon_name VARCHAR(50)
      )
    `);

    // 3. Seed Badges
    console.log('Seeding initial badges...');
    const badges = [
      ['Beginner', 100, 'Getting started on the journey!', 'Award'],
      ['Intermediate', 500, 'A dedicated learner!', 'Trophy'],
      ['Expert', 1000, 'Master of the craft!', 'Crown'],
      ['Legendary', 2500, 'An unstoppable force of knowledge!', 'Star']
    ];

    for (const badge of badges) {
      await conn.execute(`
        INSERT INTO badges (name, points_required, description, icon_name)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE points_required = VALUES(points_required), description = VALUES(description), icon_name = VALUES(icon_name)
      `, badge);
    }

    console.log('✅ Migration complete.');
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await conn.end();
  }
}

migrate();
