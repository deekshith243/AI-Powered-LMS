const express = require('express');
const { getSubjects, getSubjectDetails, getSubjectTree } = require('../controllers/subjectController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getSubjects);
router.get('/:subjectId', authMiddleware, getSubjectDetails);
router.get('/:subjectId/tree', authMiddleware, getSubjectTree);

module.exports = router;
