const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getLeaves,
  reviewLeave,
} = require('../controllers/leaveController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, authorizeRoles('student'), upload.single('document'), applyLeave);
router.get('/', protect, getLeaves);
router.put('/:id/status', protect, authorizeRoles('hod', 'admin', 'faculty'), reviewLeave);

module.exports = router;
