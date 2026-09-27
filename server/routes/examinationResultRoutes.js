const express = require('express');
const router = express.Router();
const {
  enterResult,
  getStudentResults,
  getClassResults,
} = require('../controllers/examinationResultController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('admin', 'hod', 'faculty'), enterResult);
router.get('/student', protect, getStudentResults);
router.get('/student/:id', protect, getStudentResults);
router.get('/class', protect, authorizeRoles('admin', 'hod', 'faculty'), getClassResults);

module.exports = router;
