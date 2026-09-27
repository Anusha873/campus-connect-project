const StudyMaterial = require('../models/StudyMaterial');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs');

// @desc    Upload new study material
// @route   POST /api/study-materials
// @access  Private/Faculty,Admin
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, description, subject, department, year, semester, section } = req.body;

    if (!title || !subject || !department || !year || !semester || !section) {
      return res.status(400).json({
        success: false,
        message: 'Title, Subject, Department, Year, Semester, and Section are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an educational document file (PDF, Word, PPT, etc.)',
      });
    }

    let facultyId = null;
    if (req.user.role === 'faculty' || req.user.role === 'hod') {
      const faculty = await Faculty.findOne({ user: req.user._id });
      if (faculty) facultyId = faculty._id;
    } else {
      const fac = await Faculty.findOne({ department });
      facultyId = fac ? fac._id : null;
    }

    const material = await StudyMaterial.create({
      title,
      description: description || '',
      subject,
      department,
      year: Number(year),
      semester: Number(semester),
      section: section.toUpperCase(),
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).replace('.', '').toUpperCase(),
      fileSize: req.file.size,
      uploadedBy: facultyId,
    });

    // Notify all target students of new study material
    const targetStudents = await Student.find({
      department,
      year: Number(year),
      semester: Number(semester),
      section: section.toUpperCase(),
      isActive: true,
    });

    const notifications = targetStudents.map((s) => ({
      user: s.user,
      title: `New Study Material: ${title}`,
      message: `New notes/slides have been uploaded for your class.`,
      type: 'material',
      link: '/student/study-materials',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    const populated = await StudyMaterial.findById(material._id)
      .populate('subject', 'name code')
      .populate('uploadedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get study materials (Strictly filtered by class for students)
// @route   GET /api/study-materials
// @access  Private
exports.getMaterials = async (req, res) => {
  try {
    const { department, year, semester, section, subject, search } = req.query;

    let query = {};

    if (req.user.role === 'student') {
      // Find the logged-in student
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      // CRITICAL: Students can ONLY see materials targeting their exact Department, Year, Semester, Section
      query = {
        department: student.department,
        year: student.year,
        semester: student.semester,
        section: student.section,
      };
    } else if (req.user.role === 'hod') {
      const hod = await Faculty.findOne({ user: req.user._id });
      if (hod) query.department = hod.department;
      if (year) query.year = Number(year);
      if (semester) query.semester = Number(semester);
      if (section) query.section = section.toUpperCase();
    } else if (req.user.role === 'faculty') {
      if (department) query.department = department;
      if (year) query.year = Number(year);
      if (semester) query.semester = Number(semester);
      if (section) query.section = section.toUpperCase();
    } else {
      // Admin
      if (department) query.department = department;
      if (year) query.year = Number(year);
      if (semester) query.semester = Number(semester);
      if (section) query.section = section.toUpperCase();
    }

    if (subject) query.subject = subject;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
      ];
    }

    const materials = await StudyMaterial.find(query)
      .populate('subject', 'name code')
      .populate('department', 'name code')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete study material
// @route   DELETE /api/study-materials/:id
// @access  Private/Faculty,Admin
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Try to remove local file if exists
    if (material.fileUrl) {
      const filePath = path.join(__dirname, '..', material.fileUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete physical file:', e.message);
        }
      }
    }

    await material.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Study material deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
