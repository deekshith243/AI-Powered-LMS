const pool = require('../config/db');
const Groq = require('groq-sdk');
require('dotenv').config();
const fs = require('fs');
const callGroq = require('../utils/groq');

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

// ─── CAREER PATH GENERATOR ──────────────────────────────────
exports.generateCareerPath = async (req, res) => {
  const { goal } = req.body;
  if (!goal) return res.status(400).json({ error: "Goal required" });

  try {
    const prompt = `Create a step-by-step career roadmap for becoming a ${goal}. Format as a clear, numbered list.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const roadmap = completion.choices[0]?.message?.content || "Could not generate roadmap.";
    return res.json({ 
      roadmap,
      steps: ["Learn basics", "Build projects", "Apply for internships", "Graduate"],
      skills: ["Problem solving", "Core theory", "Practical projects"],
      timeline: "6-12 months"
    });
  } catch (err) {
    console.error("GROQ ERROR (Career):", err.message);
    return res.json({ 
      roadmap: "AI generation failed. Here is a general roadmap:\n1. Learn Fundamentals\n2. Build Projects\n3. Gain Experience\n4. Continuous Learning",
      steps: ["Learn basics", "Build projects", "Apply for roles"],
      skills: ["Core concepts"],
      timeline: "3-6 months"
    });
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
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    let quizContent = completion.choices[0]?.message?.content;
    const cleanJson = quizContent.replace(/```json|```/g, '').trim();
    const quiz = JSON.parse(cleanJson);

    return res.json({ quiz });
  } catch (err) {
    console.error("GROQ ERROR (Quiz):", err.message);
    return res.status(500).json({ quiz: [] });
  }
};

// ─── RECOMMENDATIONS ──────────────────────────────────────
exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = [
      { title: "Python for Beginners", reason: "Fundamental for coding" },
      { title: "Data Science Foundations", reason: "Highly in-demand skill" },
      { title: "Advanced React", reason: "Frontend mastery" }
    ];
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
  try {
    const { role, name, skills } = req.body;
    if (!role) return res.status(400).json({ error: "Role required" });

    const prompt = `Generate a professional, high-quality resume for a ${role}. 
Name: ${name || 'Professional Candidate'}
Skills: ${skills || 'Relevant industry skills'}
Provide a structured, clean resume in plain text with clear sections for Summary, Experience, and Education.`;

    const aiText = await callGroq(prompt);

    if (!aiText) throw new Error("AI failed to generate resume");

    return res.json({ resume: aiText });
  } catch (err) {
    console.error("GENERATOR ERROR (Resume):", err.message);
    return res.json({ 
      resume: "A professional resume for " + (req.body.name || "Manager") + ".\n\nSummary: Experienced professional with a background in " + (req.body.role || "Technology") + ".\nSkills: " + (req.body.skills || "Communication, Leadership") + "\n\n(AI generation temporarily limited. Please try again soon.)" 
    });
  }
};

// ─── ATS ANALYZER (AI POWERED) ───────────────────────────
exports.analyzeATS = async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText || !targetRole) {
      return res.json({
        score: 0,
        matched_skills: [],
        missing_skills: [],
        suggestions: ["Please provide resume and target role"]
      });
    }

    const prompt = `
You are a professional Applicant Tracking System (ATS). 
Analyze the following resume against the target job role.

TARGET ROLE:
${targetRole}

RESUME:
${resumeText}

Return a valid JSON object ONLY. No preamble or conversational text.
Format:
{
  "score": 0-100,
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skillA", "skillB"],
  "suggestions": ["suggestion1", "suggestion2"]
}
`;

    const aiText = await callGroq(prompt);

    if (!aiText) throw new Error("AI failed to analyze ATS");

    try {
      const jsonStart = aiText.indexOf("{");
      const jsonEnd = aiText.lastIndexOf("}") + 1;
      const jsonStr = aiText.slice(jsonStart, jsonEnd);
      const result = JSON.parse(jsonStr);
      
      return res.json({
        score: result.score ?? 70,
        matched_skills: result.matched_skills ?? [],
        missing_skills: result.missing_skills ?? [],
        suggestions: result.suggestions ?? ["Optimize your resume for keywords"]
      });
    } catch (parseErr) {
      console.error("JSON Parse Error (ATS):", parseErr.message);
      throw new Error("Invalid AI response format");
    }

  } catch (error) {
    console.error("ATS API ERROR:", error);
    return res.json({
      score: 65,
      matched_skills: ["Analysis"],
      missing_skills: ["Advanced Frameworks"],
      suggestions: ["AI scoring temporarily limited. Use keywords from the job description."]
    });
  }
};

// ─── RESUME IMPROVER ─────────────────────────────────────
exports.improveResume = async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) return res.status(400).json({ error: "Resume text missing" });

    const prompt = `Improve this professional resume for the role of ${targetRole || 'industry expert'}. 
Resume: 
${resumeText}

Return ONLY the improved resume text. Professional tone. No preamble.`;

    const aiText = await callGroq(prompt);

    if (!aiText) throw new Error("AI failed to improve resume");

    return res.json({ improved_resume: aiText });
  } catch (err) {
    console.error("IMPROVE ERROR:", err.message);
    return res.json({ 
      improved_resume: "Professional Resume\n\n(AI service temporarily limited. Please review your resume for formatting and keywords.)" 
    });
  }
};

// ─── MOCK INTERVIEW START ──────────────────────────────
exports.startInterview = async (req, res) => {
  try {
    const { role } = req.body;
    const questions = [
      "Tell me about yourself.",
      `Why do you want to be a ${role}?`,
      "Describe a challenging technical project you worked on.",
      "How do you handle conflict in a team?"
    ];
    return res.json({ questions });
  } catch (err) {
    console.error("Interview Start Error:", err.message);
    return res.status(500).json({ error: "Failed to start interview" });
  }
};

// ─── MOCK INTERVIEW EVALUATE ──────────────────────────
exports.evaluateInterview = async (req, res) => {
  try {
    const { role, questions, userAnswers } = req.body;
    
    // PART 1: Strict Validation
    if (!userAnswers || userAnswers.length === 0 || !userAnswers.some(ans => ans && ans.trim().length > 0)) {
      return res.json({
        score: 0,
        feedback: "No answers provided. Please answer the questions to receive evaluation.",
        suggestions: ["Type or speak at least one answer"]
      });
    }

    // PART 2: Real Scoring Logic (Dynamic)
    let baseScore = 0;
    userAnswers.forEach(ans => {
      if (ans && ans.length > 20) baseScore += 20;
      if (ans && ans.toLowerCase().includes("example")) baseScore += 10;
    });
    baseScore = Math.min(baseScore, 100);

    // PART 3: Groq Evaluation (Safe)
    try {
        const prompt = `Evaluate these mock interview answers for a ${role} position. 
        Questions: ${questions.join(' | ')}
        Answers: ${userAnswers.join(' | ')}
        Current estimated score: ${baseScore}/100.
        
        Provide a detailed JSON evaluation with:
        {
          "score": finalScore,
          "feedback": "overall summary",
          "suggestions": ["s1", "s2"]
        }`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
        return res.json({
            score: result.score || baseScore,
            feedback: result.feedback || "Basic evaluation completed.",
            suggestions: result.suggestions || ["Add more detailed answers", "Include examples"]
        });
    } catch (groqErr) {
        console.error("Groq Eval Error (Mock Interview):", groqErr.message);
        return res.json({ 
            score: baseScore, 
            feedback: "Basic evaluation completed (AI temporarily limited).",
            suggestions: ["Add more detailed answers", "Include examples"]
        });
    }

  } catch (err) {
    console.error("GROQ ERROR (Evaluate Interview):", err.message);
    return res.status(500).json({ 
      score: 0, 
      feedback: "Evaluation failed due to server error.",
      suggestions: ["Please try again later"]
    });
  }
};

// ─── END OF AI CONTROLLER ───────────────────────────────
