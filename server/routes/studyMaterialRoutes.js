const express = require('express');
const router = express.Router();
const {
  uploadMaterial,
  getMaterials,
  deleteMaterial,
} = require('../controllers/studyMaterialController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, authorizeRoles('faculty', 'hod', 'admin'), upload.single('file'), uploadMaterial);
router.get('/', protect, getMaterials);
router.delete('/:id', protect, authorizeRoles('faculty', 'admin'), deleteMaterial);

module.exports = router;
