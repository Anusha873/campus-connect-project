const express = require('express');
const router = express.Router();
const { getAdminAnalytics, getHODAnalytics } = require('../controllers/analyticsController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorizeRoles('admin'), getAdminAnalytics);
router.get('/hod', protect, authorizeRoles('hod', 'admin'), getHODAnalytics);

module.exports = router;
