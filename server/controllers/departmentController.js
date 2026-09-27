const Department = require('../models/Department');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('hod', 'name email facultyId')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('hod', 'name email facultyId phone designation');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const facultyCount = await Faculty.countDocuments({ department: department._id, isActive: true });
    const studentCount = await Student.countDocuments({ department: department._id, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        facultyCount,
        studentCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res) => {
  try {
    const { code, name, description } = req.body;

    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Code and Name are required' });
    }

    const existing = await Department.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Department with code '${code}' already exists` });
    }

    const department = await Department.create({
      code: code.toUpperCase(),
      name,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete department (or toggle active)
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check if faculty or students are enrolled
    const studentCount = await Student.countDocuments({ department: department._id });
    if (studentCount > 0) {
      // Soft deactivate instead of deleting
      department.isActive = !department.isActive;
      await department.save();
      return res.status(200).json({
        success: true,
        message: `Department ${department.isActive ? 'activated' : 'deactivated'} successfully because it has registered students`,
        data: department,
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
