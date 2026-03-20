const express = require('express');
const { getSubjects, getSubjectDetails, getSubjectTree, checkAccess } = require('../controllers/subjectController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuth = require('../middlewares/optionalAuthMiddleware');

const router = express.Router();

router.get('/', optionalAuth, getSubjects);
router.get('/:subjectId', authMiddleware, getSubjectDetails);
router.get('/:subjectId/tree', authMiddleware, getSubjectTree);
router.get('/:subjectId/access', authMiddleware, checkAccess);

module.exports = router;
