const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getStudents);
router.get('/:id', protect, getStudentById);
router.post('/', protect, authorizeRoles('admin'), upload.single('profilePhoto'), createStudent);
router.put('/:id', protect, authorizeRoles('admin'), upload.single('profilePhoto'), updateStudent);
router.delete('/:id', protect, authorizeRoles('admin'), deleteStudent);

module.exports = router;
