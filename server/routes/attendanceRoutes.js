const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getClassAttendance,
  getStudentAttendance,
} = require('../controllers/attendanceController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('faculty', 'hod', 'admin'), markAttendance);
router.get('/class', protect, getClassAttendance);
router.get('/student', protect, getStudentAttendance);
router.get('/student/:id', protect, getStudentAttendance);

module.exports = router;
