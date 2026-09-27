const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public endpoint for department listings (registration, academic info)
router.get('/', getDepartments);
router.get('/:id', protect, getDepartmentById);
router.post('/', protect, authorizeRoles('admin'), createDepartment);
router.put('/:id', protect, authorizeRoles('admin'), updateDepartment);
router.delete('/:id', protect, authorizeRoles('admin'), deleteDepartment);

module.exports = router;
