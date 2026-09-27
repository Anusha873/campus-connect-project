const express = require('express');
const router = express.Router();
const {
  getTimetable,
  upsertTimetableSlot,
  deleteTimetableSlot,
} = require('../controllers/timetableController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, getTimetable);
router.post('/', protect, authorizeRoles('admin', 'hod'), upsertTimetableSlot);
router.delete('/:id', protect, authorizeRoles('admin', 'hod'), deleteTimetableSlot);

module.exports = router;
