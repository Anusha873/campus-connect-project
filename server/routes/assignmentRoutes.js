const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  submitAssignment,
  getAssignmentSubmissions,
  evaluateSubmission,
  deleteAssignment,
} = require('../controllers/assignmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, authorizeRoles('faculty', 'hod', 'admin'), upload.single('attachment'), createAssignment);
router.get('/', protect, getAssignments);
router.get('/:id', protect, getAssignmentById);
router.post('/:id/submit', protect, authorizeRoles('student'), upload.single('attachment'), submitAssignment);
router.get('/:id/submissions', protect, authorizeRoles('faculty', 'hod', 'admin'), getAssignmentSubmissions);
router.put('/:assignmentId/submissions/:submissionId/evaluate', protect, authorizeRoles('faculty', 'hod', 'admin'), evaluateSubmission);
router.delete('/:id', protect, authorizeRoles('faculty', 'admin'), deleteAssignment);

module.exports = router;
