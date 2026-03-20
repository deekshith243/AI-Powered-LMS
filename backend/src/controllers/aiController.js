const pool = require('../config/db');
const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ─── SUMMARY ─────────────────────────────────────────────
exports.generateSummary = async (req, res) => {
  try {
    const { title, lessonContent } = req.body;
    const content = lessonContent || title || "No content provided.";

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Summarize this lesson in simple terms for students: ${content}`
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const summary = completion.choices[0]?.message?.content || "Could not generate summary.";
    return res.json({ summary, result: summary });
  } catch (err) {
    console.error("GROQ ERROR (Summary):", err.message);
    return res.status(500).json({
      summary: "AI summary temporarily unavailable.",
      result: "AI summary temporarily unavailable."
    });
  }
};

// ─── AI TUTOR ──────────────────────────────────────────
exports.chatTutor = async (req, res) => {
  try {
    const { message, courseTitle } = req.body;
    console.log("AI TUTOR REQUEST:", { message, courseTitle });
    
    if (!process.env.GROQ_API_KEY) {
      console.error("CRITICAL: GROQ_API_KEY is missing in environment!");
    }
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI tutor helping a student learn ${courseTitle || 'this course'}. Explain clearly with examples.`
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
    return res.json({ reply, answer: reply });
  } catch (err) {
    console.error("GROQ ERROR (Tutor):", err.message);
    return res.status(500).json({
      reply: "AI Tutor temporarily unavailable.",
      answer: "AI Tutor temporarily unavailable."
    });
  }
};

// ─── ASK DOUBT ───────────────────────────────────────────
exports.askDoubt = async (req, res) => {
  try {
    const { question, courseTitle, lessonTitle } = req.body;
    
    const prompt = `You are an expert tutor for ${courseTitle || 'this course'}.
The student is currently learning '${lessonTitle || 'a lesson'}'.
Answer clearly with examples:
${question}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const answer = completion.choices[0]?.message?.content || "I'm sorry, I couldn't answer that right now.";
    return res.json({ answer });
  } catch (err) {
    console.error("GROQ ERROR (Doubt):", err.message);
    return res.status(500).json({ answer: "I'm sorry, I'm having trouble thinking clearly. Try again later!" });
  }
};

// ─── CAREER PATH GENERATOR ──────────────────────────────
exports.generateCareerPath = async (req, res) => {
  try {
    const { goal } = req.body;
    
    const prompt = `Create a step-by-step learning roadmap for becoming a ${goal || 'professional'}.
Include:
- Required skills
- Recommended topics
- Logical course sequence
Use Markdown for formatting.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const roadmap = completion.choices[0]?.message?.content || "Roadmap generation failed.";
    return res.json({ roadmap });
  } catch (err) {
    console.error("GROQ ERROR (Career):", err.message);
    return res.status(500).json({ roadmap: "Failed to generate roadmap. Please try again later." });
  }
};

// ─── QUIZ ────────────────────────────────────────────────
exports.generateQuiz = async (req, res) => {
  try {
    const { topic } = req.body;
    
    const prompt = `Generate 5 multiple choice questions for the topic: ${topic || 'educational content'}.
Each question must have:
- question
- 4 options
- correct answer index (0-3)

Return ONLY a valid JSON array of objects with the following format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": 2
  }
]`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    let quizContent = completion.choices[0]?.message?.content;
    
    // Safety check for JSON parsing
    let quiz;
    try {
      const parsed = JSON.parse(quizContent);
      // Groq might wrap it in an object if forced to json_object
      quiz = Array.isArray(parsed) ? parsed : (parsed.quiz || parsed.questions || Object.values(parsed)[0]);
      if (!Array.isArray(quiz)) throw new Error("Not an array");
    } catch (e) {
      console.error("JSON Parse Error for Quiz:", e);
      // Fallback if parsing fails
      quiz = [
        {
          question: "What is the primary focus of this topic?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 0
        }
      ];
    }

    return res.json({ quiz });
  } catch (err) {
    console.error("GROQ ERROR (Quiz):", err.message);
    return res.status(500).json({ quiz: [] });
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

    const finalRecs = unstartedSubjects.slice(0, 2);
    return res.json({ recommendations: finalRecs });
  } catch (err) {
    console.error("AI ERROR (Recommendations):", err.message);
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

    const queryLower = query.toLowerCase();
    const results = allVideos.filter(v => 
      v.title.toLowerCase().includes(queryLower) || 
      v.description?.toLowerCase().includes(queryLower) ||
      v.subject_title.toLowerCase().includes(queryLower)
    ).slice(0, 5);

    return res.json({ results });
  } catch (err) {
    console.error("AI ERROR (Search):", err.message);
    return res.json({ results: [] });
  }
};
// ─── AI RESUME GENERATOR ──────────────────────────────────
exports.generateResume = async (req, res) => {
  console.log('generateResume called with body:', req.body);
  try {
    const { role, name, skills } = req.body;
    
    const prompt = `Generate a professional ATS-friendly resume for a ${role || 'Software Developer'}.
Name: ${name || 'John Doe'}
Additional Skills: ${skills || 'None provided'}

Include:
- Summary
- Skills
- Projects
- Experience (realistic entry/mid level)
- Education
- Use clean bullet points. Return ONLY the resume content.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const resume = completion.choices[0]?.message?.content || "Resume generation failed.";
    return res.json({ resume });
  } catch (err) {
    console.error("GROQ ERROR (Resume):", err.message);
    return res.status(500).json({ resume: "Failed to generate resume." });
  }
};

// ─── ATS ANALYZER ─────────────────────────────────────────
exports.analyzeATS = async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    
    const prompt = `Analyze this resume for ATS compatibility for the role: ${targetRole || 'Software Engineer'}.
Resume Text: ${resumeText}

Return ONLY a specific JSON object (no other text):
{
  "score": 75,
  "missing_skills": ["List", "of", "skills"],
  "suggestions": ["List", "of", "improvements"],
  "required_skills": ["List", "of", "critical", "skills"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    let content = completion.choices[0]?.message?.content || "{}";
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (e) {
      console.error("ATS Parse Error:", e);
      const match = content.match(/\{[\s\S]*\}/);
      analysis = match ? JSON.parse(match[0]) : { score: 0, missing_skills: [], suggestions: ["Error analyzing resume format."], required_skills: [] };
    }

    return res.json(analysis);
  } catch (err) {
    console.error("GROQ ERROR (ATS):", err.message);
    return res.status(500).json({ message: "ATS analysis failed." });
  }
};

// ─── RESUME IMPROVER ──────────────────────────────────────
exports.improveResume = async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    
    const prompt = `Rewrite this resume to be an industry-level, ATS-optimized resume for the role: ${targetRole || 'Professional'}.
Original Resume: ${resumeText}
Make it strong, professional, and keyword-rich. Return ONLY the improved resume content.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const improved_resume = completion.choices[0]?.message?.content || "Resume improvement failed.";
    return res.json({ improved_resume });
  } catch (err) {
    console.error("GROQ ERROR (Improve):", err.message);
    return res.status(500).json({ improved_resume: "Failed to improve resume." });
  }
};

// ─── MOCK INTERVIEW START ──────────────────────────────────
exports.startInterview = async (req, res) => {
  try {
    const { role } = req.body;
    
    const prompt = `Generate 5 technical interview questions for a ${role || 'Software Developer'}.
Return ONLY a JSON object with the key "questions" containing an array of strings.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    let content = completion.choices[0]?.message?.content || "{}";
    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      const match = content.match(/\{[\s\S]*\}/);
      data = match ? JSON.parse(match[0]) : { questions: ["What is your experience with this role?", "How do you handle technical challenges?", "Explain a project you worked on.", "What are your strengths?", "Where do you see yourself in 5 years?"] };
    }

    return res.json(data);
  } catch (err) {
    console.error("GROQ ERROR (Interview Start):", err.message);
    return res.status(500).json({ message: "Interview start failed." });
  }
};

// ─── MOCK INTERVIEW EVALUATE ──────────────────────────────
exports.evaluateInterview = async (req, res) => {
  try {
    const { role, questions, userAnswers } = req.body;
    
    const prompt = `Evaluate these interview answers for a ${role || 'Professional'} role.
Questions: ${JSON.stringify(questions)}
User Answers: ${JSON.stringify(userAnswers)}

Return ONLY a specific JSON object (no other text):
{
  "score": 80,
  "strengths": "Provide a summary of strengths",
  "weaknesses": "Provide a summary of weaknesses",
  "feedback": "Provide general feedback and tips"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    let content = completion.choices[0]?.message?.content || "{}";
    let evaluation;
    try {
      evaluation = JSON.parse(content);
    } catch (e) {
      const match = content.match(/\{[\s\S]*\}/);
      evaluation = match ? JSON.parse(match[0]) : { score: 0, strengths: "N/A", weaknesses: "N/A", feedback: "Evaluation failed to process." };
    }

    return res.json(evaluation);
  } catch (err) {
    console.error("GROQ ERROR (Interview Eval):", err.message);
    return res.status(500).json({ message: "Evaluation failed." });
  }
};
