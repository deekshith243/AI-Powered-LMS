const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
const { 
  generateSummary, 
  chatTutor, 
  generateQuiz, 
  getRecommendations, 
  searchLessons, 
  askDoubt, 
  generateCareerPath,
  generateResume,
  analyzeATS,
  improveResume,
  startInterview,
  evaluateInterview,
  extractPDF
} = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/summary', authMiddleware, generateSummary);
router.post('/tutor', authMiddleware, chatTutor);
router.post('/quiz', authMiddleware, generateQuiz);
router.post('/doubt', authMiddleware, askDoubt);
router.post('/career', authMiddleware, generateCareerPath);
router.get('/recommendations/:userId', authMiddleware, getRecommendations);
router.post('/search', authMiddleware, searchLessons);
router.post('/resume', authMiddleware, generateResume);
router.post('/ats', authMiddleware, analyzeATS);
router.post('/resume-improve', authMiddleware, improveResume);
router.post('/interview/start', authMiddleware, startInterview);
router.post('/interview/evaluate', authMiddleware, evaluateInterview);
router.post('/extract-pdf', authMiddleware, upload.single('file'), extractPDF);

module.exports = router;
