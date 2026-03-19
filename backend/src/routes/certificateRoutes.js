const express = require('express');
const { downloadCertificate } = require('../controllers/certificateController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:subjectId', authMiddleware, downloadCertificate);

module.exports = router;
