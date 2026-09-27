const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
exports.getSubjects = async (req, res) => {
  try {
    const { department, semester, type } = req.query;
    let query = {};

    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (type) query.type = type;

    const subjects = await Subject.find(query)
      .populate('department', 'name code')
      .sort({ department: 1, semester: 1, code: 1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private/Admin
exports.createSubject = async (req, res) => {
  try {
    const { code, name, department, semester, credits, type } = req.body;

    if (!code || !name || !department || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Code, Name, Department, and Semester are required',
      });
    }

    const existing = await Subject.findOne({
      code: code.toUpperCase(),
      department,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Subject with code '${code}' already exists in this department`,
      });
    }

    const subject = await Subject.create({
      code: code.toUpperCase(),
      name,
      department,
      semester: Number(semester),
      credits: credits ? Number(credits) : 3,
      type: type || 'theory',
    });

    const populated = await Subject.findById(subject._id).populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('department', 'name code');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await subject.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
