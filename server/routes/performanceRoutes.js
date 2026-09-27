const express = require('express');
const router = express.Router();
const { getStudentPerformance } = require('../controllers/performanceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:studentId?', protect, getStudentPerformance);

module.exports = router;
