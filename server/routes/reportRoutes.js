const express = require('express');
const router = express.Router();
const {
  exportAttendanceCSV,
  exportInternalMarksCSV,
  exportExamResultsCSV,
  exportLeavesCSV,
} = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/attendance/csv', protect, authorizeRoles('admin', 'hod'), exportAttendanceCSV);
router.get('/internal-marks/csv', protect, authorizeRoles('admin', 'hod'), exportInternalMarksCSV);
router.get('/exam-results/csv', protect, authorizeRoles('admin', 'hod'), exportExamResultsCSV);
router.get('/leaves/csv', protect, authorizeRoles('admin', 'hod'), exportLeavesCSV);

module.exports = router;
