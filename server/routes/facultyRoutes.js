const express = require('express');
const router = express.Router();
const {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  assignHOD,
  deleteFaculty,
} = require('../controllers/facultyController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getFaculty);
router.get('/:id', protect, getFacultyById);
router.post('/', protect, authorizeRoles('admin'), upload.single('profilePhoto'), createFaculty);
router.put('/:id', protect, authorizeRoles('admin'), upload.single('profilePhoto'), updateFaculty);
router.post('/assign-hod', protect, authorizeRoles('admin'), assignHOD);
router.delete('/:id', protect, authorizeRoles('admin'), deleteFaculty);

module.exports = router;
