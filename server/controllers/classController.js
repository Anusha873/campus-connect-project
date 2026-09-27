const ClassSection = require('../models/ClassSection');
const Student = require('../models/Student');

// @desc    Get all classes/sections
// @route   GET /api/classes
// @access  Private
exports.getClasses = async (req, res) => {
  try {
    const { department, year, semester } = req.query;
    let query = {};

    if (department) query.department = department;
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);

    const classes = await ClassSection.find(query)
      .populate('department', 'name code')
      .sort({ department: 1, year: 1, semester: 1, section: 1 });

    // Attach student counts
    const classesWithCounts = await Promise.all(
      classes.map(async (c) => {
        const studentCount = await Student.countDocuments({
          department: c.department._id,
          year: c.year,
          semester: c.semester,
          section: c.section,
          isActive: true,
        });
        return {
          ...c.toObject(),
          studentCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: classesWithCounts.length,
      data: classesWithCounts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a class/section
// @route   POST /api/classes
// @access  Private/Admin
exports.createClass = async (req, res) => {
  try {
    const { department, year, semester, section, academicYear, capacity } = req.body;

    if (!department || !year || !semester || !section) {
      return res.status(400).json({
        success: false,
        message: 'Please provide department, year, semester, and section',
      });
    }

    const existing = await ClassSection.findOne({
      department,
      year: Number(year),
      semester: Number(semester),
      section: section.toUpperCase(),
      academicYear: academicYear || '2025-2026',
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Class section ${section} already exists for Year ${year} Semester ${semester}`,
      });
    }

    const newClass = await ClassSection.create({
      department,
      year: Number(year),
      semester: Number(semester),
      section: section.toUpperCase(),
      academicYear: academicYear || '2025-2026',
      capacity: capacity ? Number(capacity) : 60,
    });

    res.status(201).json({
      success: true,
      message: 'Class section created successfully',
      data: newClass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a class/section
// @route   PUT /api/classes/:id
// @access  Private/Admin
exports.updateClass = async (req, res) => {
  try {
    const updatedClass = await ClassSection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('department', 'name code');

    if (!updatedClass) {
      return res.status(404).json({ success: false, message: 'Class section not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Class section updated successfully',
      data: updatedClass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a class/section
// @route   DELETE /api/classes/:id
// @access  Private/Admin
exports.deleteClass = async (req, res) => {
  try {
    const classSection = await ClassSection.findById(req.params.id);

    if (!classSection) {
      return res.status(404).json({ success: false, message: 'Class section not found' });
    }

    // Check if students exist in this class
    const studentCount = await Student.countDocuments({
      department: classSection.department,
      year: classSection.year,
      semester: classSection.semester,
      section: classSection.section,
    });

    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete class section with ${studentCount} enrolled students. Transfer students first.`,
      });
    }

    await classSection.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Class section deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
