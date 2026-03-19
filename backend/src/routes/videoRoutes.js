const express = require('express');
const { getVideoDetails, markVideoComplete } = require('../controllers/videoController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:videoId', authMiddleware, getVideoDetails);
router.post('/:videoId/complete', authMiddleware, markVideoComplete);

module.exports = router;
