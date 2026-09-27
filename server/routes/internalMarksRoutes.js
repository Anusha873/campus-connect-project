const express = require('express');
const router = express.Router();
const {
  enterMarks,
  getStudentMarks,
  getClassMarks,
} = require('../controllers/internalMarksController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('faculty', 'hod', 'admin'), enterMarks);
router.get('/student', protect, getStudentMarks);
router.get('/student/:id', protect, getStudentMarks);
router.get('/class', protect, authorizeRoles('faculty', 'hod', 'admin'), getClassMarks);

module.exports = router;
