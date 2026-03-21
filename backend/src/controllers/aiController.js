const pool = require('../config/db');
const Groq = require('groq-sdk');
require('dotenv').config();
const fs = require('fs');

const groqKey = process.env.GROQ_API_KEY || "test_key";
let groq;
try {
  groq = new Groq({
    apiKey: groqKey,
    timeout: 60000
  });
} catch (e) {
  console.error("GROQ Init Error (Safe Fallback):", e.message);
}

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

// ─── CAREER PATH GENERATOR (UPGRADED) ──────────────────────
exports.generateCareerPath = async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: "Goal required" });

    const prompt = `Create a high-impact, professional career roadmap for becoming a ${goal}.
Return ONLY a valid JSON object:
{
  "roadmap": [
    { "step": "Foundations", "topics": ["A", "B"], "timeline": "Month 1" },
    { "step": "Advanced UI/UX", "topics": ["X", "Y"], "timeline": "Month 2" }
  ],
  "required_skills": ["Skill 1", "Skill 2"],
  "total_timeline": "6 Months",
  "recommended_courses": ["Python for Beginners", "Data Science Foundations"]
}
Use natural language for course names that sound like common educational subjects.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0]?.message?.content);
    return res.json(data);
  } catch (err) {
    console.error("GROQ ERROR (Career):", err.message);
    return res.status(500).json({ error: "Failed to generate roadmap." });
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

// ─── RECOMMENDATIONS (AI UPGRADE) ─────────────────────────
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    // Fetch user progress and all courses to find gaps
    const [allSubjects] = await pool.query('SELECT title, description FROM subjects');
    const [progress] = await pool.query(`
      SELECT DISTINCT s.title
      FROM subjects s
      JOIN sections sec ON s.id = sec.subject_id
      JOIN videos v ON sec.id = v.section_id
      JOIN video_progress vp ON v.id = vp.video_id
      WHERE vp.user_id = ?
    `, [userId]);

    const completedTitles = progress.map(p => p.title);
    
    const prompt = `Based on the student's completed courses: ${completedTitles.join(', ') || 'None yet'}.
Available courses: ${allSubjects.map(s => s.title).join(', ')}.

Recommend the top 3 best next courses for this student.
Return ONLY a valid JSON array of objects:
[
  { "title": "Course Title", "reason": "Why this is recommended" }
]`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content);
    const recommendations = Array.isArray(result) ? result : (result.recommendations || Object.values(result)[0]);

    return res.json({ recommendations });
  } catch (err) {
    console.error("AI ERROR (Recommendations):", err.message);
    return res.status(500).json({ recommendations: [] });
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

// ─── RESUME GENERATOR ────────────────────────────────────
exports.generateResume = async (req, res) => {
  console.log("Resume API HIT");
  try {
    const { role, name, skills } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Role required" });
    }
    if (!process.env.GROQ_API_KEY) {
      console.error("Missing GROQ key");
      return res.status(500).json({ error: "AI not configured" });
    }

    const prompt = `Generate a professional resume for a ${role}. 
Name: ${name || 'N/A'}
Skills: ${skills || 'N/A'}
Provide a structured, clean resume in plain text.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const output = completion.choices[0]?.message?.content || "Resume generation failed.";
    return res.json({ resume: output });
  } catch (err) {
    console.error("GROQ ERROR (Resume):", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── ATS ANALYZER ───────────────────────────────────────
exports.analyzeATS = async (req, res) => {
  console.log("ATS API HIT");
  try {
    const { resumeText, targetRole } = req.body;
    if (!targetRole) {
      return res.status(400).json({ error: "Target role required" });
    }
    if (!process.env.GROQ_API_KEY) {
      console.error("Missing GROQ key");
      return res.status(500).json({ error: "AI not configured" });
    }

    const prompt = `Analyze this resume for the role of ${targetRole}.
Resume Content: ${resumeText}

Return ONLY a valid JSON object:
{
  "score": 85,
  "missing_skills": ["Skill 1", "Skill 2"],
  "suggestions": ["Suggestion 1"],
  "required_skills": ["Skill A"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const stats = JSON.parse(completion.choices[0]?.message?.content);
    return res.json({
      score: stats.score || 75,
      missing_skills: stats.missing_skills || [],
      suggestions: stats.suggestions || [],
      required_skills: stats.required_skills || []
    });
  } catch (err) {
    console.error("GROQ ERROR (ATS):", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── RESUME IMPROVER ─────────────────────────────────────
exports.improveResume = async (req, res) => {
  console.log("Improve API HIT");
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: "Resume text missing" });
    }
    if (!targetRole) {
      return res.status(400).json({ error: "Target role required" });
    }
    if (!process.env.GROQ_API_KEY) {
      console.error("Missing GROQ key");
      return res.status(500).json({ error: "AI not configured" });
    }

    const trimmedText = resumeText.substring(0, 3000);
    const prompt = `Improve this resume for the role of ${targetRole}. 
Optimize keywords and professional tone.
Resume: ${trimmedText}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const output = completion.choices[0]?.message?.content || "Resume improvement failed.";
    return res.json({ improved_resume: output });
  } catch (err) {
    console.error("Improve Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── MOCK INTERVIEW START ──────────────────────────────
exports.startInterview = async (req, res) => {
  try {
    const { role } = req.body;
    const prompt = `Generate 5 technical interview questions for a ${role} position. 
Return ONLY a valid JSON array of strings: ["Question 1", "Question 2", ...]`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content);
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || Object.values(parsed)[0]);
    return res.json({ questions });
  } catch (err) {
    console.error("GROQ ERROR (Interview Start):", err.message);
    return res.status(500).json({ questions: ["Tell me about your experience.", "What are your core technical skills?"] });
  }
};

// ─── MOCK INTERVIEW EVALUATE (UPGRADED) ───────────────────
exports.evaluateInterview = async (req, res) => {
  try {
    const { role, questions, userAnswers } = req.body;
    
    const prompt = `You are a Senior Technical Interviewer. Evaluate this candidate for a ${role} position.
Questions & Answers:
${questions.map((q, i) => `Q: ${q}\nA: ${userAnswers[i] || 'No answer provided'}`).join('\n\n')}

Return ONLY a valid JSON object:
{
  "score": 85,
  "strengths": ["Clear explanation of X", "Good grasp of Y"],
  "weaknesses": ["Improve depth in Z"],
  "overall_feedback": "A detailed professional feedback summary...",
  "status": "Strong Hire / Hire / No Hire"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const evaluation = JSON.parse(completion.choices[0]?.message?.content);
    return res.json(evaluation);
  } catch (err) {
    console.error("GROQ ERROR (Evaluate):", err.message);
    return res.status(500).json({ score: 0, overall_feedback: "Evaluation failed. Please try again." });
  }
};


// ─── JOB MATCH ANALYZER (MULTI-JOB UPGRADE) ────────────────
exports.jobMatch = async (req, res) => {
  try {
    const { resumeText, jobs } = req.body;
    if (!resumeText || !Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ error: "Resume text and array of jobs required" });
    }

    const prompt = `Compare this resume with these job openings.
Resume: ${resumeText.substring(0, 2000)}

Jobs:
${jobs.map((j, i) => `${i + 1}. ${j.company} - ${j.role}: ${j.description?.substring(0, 500)}`).join('\n')}

Return ONLY a valid JSON array of objects:
[
  {
    "company": "...",
    "role": "...",
    "matchScore": 85,
    "missingSkills": ["Skill 1", "Skill 2"]
  }
]`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content);
    // Ensure it's an array
    const finalResult = Array.isArray(result) ? result : (result.matches || result.data || Object.values(result)[0]);
    
    return res.json(finalResult);
  } catch (err) {
    console.error("GROQ ERROR (Job Match):", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── DASHBOARD INSIGHTS ──────────────────────────────────
exports.getDashboardInsights = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware

    // Fetch user progress data
    const [progress] = await pool.query(`
      SELECT s.title, vp.percent_complete
      FROM video_progress vp
      JOIN videos v ON vp.video_id = v.id
      JOIN sections sec ON v.section_id = sec.id
      JOIN subjects s ON sec.subject_id = s.id
      WHERE vp.user_id = ?
    `, [userId]);

    const [badges] = await pool.query('SELECT name FROM badges WHERE user_id = ?', [userId]);

    const stats = {
      coursesCovered: progress.length,
      averageProgress: progress.length > 0 ? progress.reduce((a, b) => a + b.percent_complete, 0) / progress.length : 0,
      badgeCount: badges.length,
      topics: progress.map(p => p.title)
    };

    const prompt = `Analyze this student's learning data and provide career insights.
Stats: ${JSON.stringify(stats)}

Return ONLY a valid JSON object:
{
  "strengths": ["Fast learner in X", "Great progress in Y"],
  "weaknesses": ["Needs more focus on Z"],
  "recommendations": ["Try Advanced Python", "Work on a project in React"],
  "next_steps": ["Complete the remaining 20% of Java", "Take a Mock Interview"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const insights = JSON.parse(completion.choices[0]?.message?.content);
    return res.json(insights);
  } catch (err) {
    console.error("GROQ ERROR (Insights):", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── END OF AI CONTROLLER ───────────────────────────────
