const express = require('express');
const { generateSummary, chatTutor, generateQuiz, getRecommendations, searchLessons, askDoubt, generateCareerPath } = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/summary', authMiddleware, generateSummary);
router.post('/tutor', authMiddleware, chatTutor);
router.post('/quiz', authMiddleware, generateQuiz);
router.post('/doubt', authMiddleware, askDoubt);
router.post('/career', authMiddleware, generateCareerPath);
router.get('/recommendations/:userId', authMiddleware, getRecommendations);
router.post('/search', authMiddleware, searchLessons);

module.exports = router;
