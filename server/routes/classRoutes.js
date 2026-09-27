const express = require('express');
const router = express.Router();
const {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
} = require('../controllers/classController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, getClasses);
router.post('/', protect, authorizeRoles('admin'), createClass);
router.put('/:id', protect, authorizeRoles('admin'), updateClass);
router.delete('/:id', protect, authorizeRoles('admin'), deleteClass);

module.exports = router;
