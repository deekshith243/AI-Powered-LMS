const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, enrollmentController.enrollSubject);

module.exports = router;
