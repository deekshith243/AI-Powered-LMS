const pool = require('../config/db');
require('dotenv').config();
const { OpenAI } = require('openai');

console.log("KEY:", process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─── SUMMARY ─────────────────────────────────────────────
exports.generateSummary = async (req, res) => {
  try {
    const { title, description } = req.body;
    const prompt = `Explain this lesson simply: [${title} ${description ? '+ ' + description : ''}]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    console.log("OPENAI RESPONSE:", response);
    const result = response.choices[0].message.content;

    return res.json({
      result: result,
      summary: result // Ensures frontend page.tsx doesn't break
    });
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    return res.json({
      result: "AI service temporarily unavailable",
      summary: "AI service temporarily unavailable"
    });
  }
};

// ─── CHAT TUTOR ──────────────────────────────────────────
exports.chatTutor = async (req, res) => {
  try {
    const { question, context } = req.body;
    const prompt = `You are a helpful AI tutor for students. Subject Context: ${context || 'General'}\nStudent Question: ${question}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    console.log("OPENAI RESPONSE:", response);
    const result = response.choices[0].message.content;

    return res.json({
      result: result,
      answer: result // Ensures frontend AITutor.tsx doesn't break
    });
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    return res.json({
      result: "AI service temporarily unavailable",
      answer: "AI service temporarily unavailable"
    });
  }
};

// ─── QUIZ ────────────────────────────────────────────────
exports.generateQuiz = async (req, res) => {
  try {
    const { title } = req.body;
    const prompt = `Generate 3 MCQ questions in JSON format only:
[
{question, options:[], answer}
]
Topic: [${title}]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    console.log("OPENAI RESPONSE:", response);
    let text = response.choices[0].message.content;

    let quiz;

    try {
      const jsonStart = text.indexOf("[");
      const jsonEnd = text.lastIndexOf("]") + 1;
      quiz = JSON.parse(text.substring(jsonStart, jsonEnd));
    } catch (parseErr) {
      console.error("OPENAI PARSE ERROR:", parseErr);
      quiz = [
        {
          question: "Sample question?",
          options: ["A", "B", "C", "D"],
          answer: "A"
        }
      ];
    }

    return res.json({ quiz });
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    return res.json({
      result: "AI service temporarily unavailable",
      quiz: [
        {
           question: "Sample question?",
           options: ["A", "B", "C", "D"],
           answer: "A"
        }
      ]
    });
  }
};

// ─── RECOMMENDATIONS ─────────────────────────────────────
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const [allSubjects] = await pool.query('SELECT id, title, description FROM subjects');
    const [progress] = await pool.query(`
      SELECT DISTINCT s.id, s.title
      FROM subjects s
      JOIN sections sec ON s.id = sec.subject_id
      JOIN videos v ON sec.id = v.section_id
      JOIN video_progress vp ON v.id = vp.video_id
      WHERE vp.user_id = ?
    `, [userId]);

    const completedSubjectIds = progress.map(p => p.id);
    const unstartedSubjects = allSubjects.filter(s => !completedSubjectIds.includes(s.id));

    if (unstartedSubjects.length === 0) return res.json({ recommendations: [] });

    const prompt = `Based on completed courses: ${progress.map(p=>p.title).join(', ')}. Recommend 2 courses from: ${unstartedSubjects.map(s => s.title).join(', ')}. Format JSON array: ["Course 1", "Course 2"]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    console.log("OPENAI RESPONSE:", response);

    let text = response.choices[0].message.content;
    let recommendedTitles = [];

    try {
      const jsonStart = text.indexOf("[");
      const jsonEnd = text.lastIndexOf("]") + 1;
      recommendedTitles = JSON.parse(text.substring(jsonStart, jsonEnd));
    } catch {
      recommendedTitles = unstartedSubjects.slice(0, 2).map(s => s.title);
    }

    let finalRecs = unstartedSubjects.filter(s => recommendedTitles.some(t => typeof t === 'string' && t.toLowerCase().includes(s.title.toLowerCase())));
    if (finalRecs.length === 0) finalRecs = unstartedSubjects.slice(0, 2);

    return res.json({ recommendations: finalRecs });
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    return res.json({ recommendations: [] });
  }
};

// ─── SEMANTIC SEARCH ─────────────────────────────────────
exports.searchLessons = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query string is required.' });

    const [allVideos] = await pool.query(`
      SELECT v.id, v.title, v.description, s.title as subject_title, s.id as subject_id 
      FROM videos v 
      JOIN sections sec ON v.section_id = sec.id
      JOIN subjects s ON sec.subject_id = s.id
    `);

    if (allVideos.length === 0) return res.json({ results: [] });

    const videoMapContext = allVideos.map(v => `ID: ${v.id} | Subject: ${v.subject_title} | Lesson: ${v.title}`).join('\\n');
    const prompt = `User search: "${query}". Lessons: \n${videoMapContext}\nReturn exact integer IDs of top 3 relevant lessons as JSON array: [1, 2, 3]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    console.log("OPENAI RESPONSE:", response);

    let text = response.choices[0].message.content;
    let matchedIds = [];

    try {
      const jsonStart = text.indexOf("[");
      const jsonEnd = text.lastIndexOf("]") + 1;
      matchedIds = JSON.parse(text.substring(jsonStart, jsonEnd));
    } catch {
      matchedIds = [];
    }

    const results = allVideos.filter(v => matchedIds.includes(v.id));
    return res.json({ results });
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    return res.json({ results: [] });
  }
};
