const express = require('express');
const { getVideoProgress, updateVideoProgress, getSubjectProgress } = require('../controllers/progressController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/videos/:videoId', authMiddleware, getVideoProgress);
router.post('/videos/:videoId', authMiddleware, updateVideoProgress);
router.get('/subjects/:subjectId', authMiddleware, getSubjectProgress);

module.exports = router;
