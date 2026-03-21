const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/apply', authMiddleware, jobController.applyForJob);
router.get('/applied', authMiddleware, jobController.getAppliedJobs);

module.exports = router;
