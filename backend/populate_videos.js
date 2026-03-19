const mysql = require('mysql2/promise');
const ytSearch = require('yt-search');
require('dotenv').config();

const PROGRESSION_TOPICS = [
  "Introduction to {SUBJECT}",
  "{SUBJECT} Basics, Variables and Setup",
  "{SUBJECT} Intermediate Concepts and Loops",
  "{SUBJECT} Advanced Features and Functions",
  "{SUBJECT} Object Oriented Programming and Architecture",
  "{SUBJECT} Real World Project and Best Practices"
];

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('🔌 Connected to database');

  console.log('🗑️ Clearing existing sections, videos, and progress...');
  await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
  await conn.execute('TRUNCATE TABLE video_progress');
  await conn.execute('TRUNCATE TABLE videos');
  await conn.execute('TRUNCATE TABLE sections');
  await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

  const [subjects] = await conn.execute('SELECT id, title FROM subjects');

  let totalVideos = 0;

  for (const subject of subjects) {
    console.log(`\n📚 Populating Course: ${subject.title}`);
    
    // Create 2 sections per course
    const [sec1] = await conn.execute('INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)', [subject.id, 'Beginner Concepts', 1]);
    const [sec2] = await conn.execute('INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)', [subject.id, 'Advanced Concepts', 2]);
    
    const sectionIds = [sec1.insertId, sec1.insertId, sec1.insertId, sec2.insertId, sec2.insertId, sec2.insertId];
    
    let firstThumb = null;
    let orderIndex = 1;
    
    for (let i = 0; i < PROGRESSION_TOPICS.length; i++) {
        // Customize topic slightly based on subject to make it unique
        let queryTemplate = PROGRESSION_TOPICS[i];
        
        // Minor adjustments for non-programming subjects
        if (subject.title.toLowerCase().includes('cyber') || subject.title.toLowerCase().includes('security')) {
            if (i === 1) queryTemplate = "{SUBJECT} Footprinting and Reconnaissance";
            if (i === 2) queryTemplate = "{SUBJECT} Scanning and Enumeration";
            if (i === 4) queryTemplate = "{SUBJECT} Exploitation and Post-Exploitation";
        }
        
        const query = queryTemplate.replace(/{SUBJECT}/g, subject.title) + " tutorial";
        
        try {
            const r = await ytSearch(query);
            const videos = r.videos;
            
            if (videos.length > 0) {
                // Get the top video that isn't excessively long (like 10 hours) to keep it a specific topic
                const video = videos.find(v => v.seconds < 7200) || videos[0]; 
                
                const url = `https://www.youtube.com/watch?v=${video.videoId}`;
                
                if (orderIndex === 1) {
                    firstThumb = `https://img.youtube.com/vi/${video.videoId}/0.jpg`;
                }

                await conn.execute(
                    'INSERT INTO videos (section_id, title, description, youtube_url, order_index) VALUES (?, ?, ?, ?, ?)',
                    [sectionIds[i], video.title.substring(0, 250), video.description.substring(0, 500) || video.title, url, orderIndex]
                );
                
                console.log(`  ✅ Added Video ${orderIndex}: ${video.title.substring(0, 50)}...`);
                orderIndex++;
                totalVideos++;
                
                // Slight delay to avoid hammering YouTube
                await delay(500);
            }
        } catch (e) {
            console.error(`  ❌ Failed to search for ${query}:`, e.message);
        }
    }
    
    if (firstThumb) {
        await conn.execute('UPDATE subjects SET thumbnail_url = ? WHERE id = ?', [firstThumb, subject.id]);
    }
  }

  console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎉 Success! Automated population complete. Inserted ${totalVideos} videos.`);
  await conn.end();
}

run().catch(console.error);
