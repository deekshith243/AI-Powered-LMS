const express = require('express');
const { getNote, saveNote } = require('../controllers/noteController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:videoId', authMiddleware, getNote);
router.post('/:videoId', authMiddleware, saveNote);

module.exports = router;
