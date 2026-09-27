const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('admin', 'hod', 'faculty'), createAnnouncement);
router.get('/', protect, getAnnouncements);
router.delete('/:id', protect, authorizeRoles('admin', 'hod'), deleteAnnouncement);

module.exports = router;
