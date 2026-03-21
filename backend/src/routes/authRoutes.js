const express = require('express');
const { register, login, refresh, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
