const express = require('express');
const { generateSummary, chatTutor, generateQuiz, getRecommendations, searchLessons } = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/summary', authMiddleware, generateSummary);
router.post('/chat', authMiddleware, chatTutor);
router.post('/quiz', authMiddleware, generateQuiz);
router.get('/recommendations/:userId', authMiddleware, getRecommendations);
router.post('/search', authMiddleware, searchLessons);

module.exports = router;
