const Faculty = require('../models/Faculty');
const User = require('../models/User');
const Department = require('../models/Department');

// @desc    Get all faculty members
// @route   GET /api/faculty
// @access  Private
exports.getFaculty = async (req, res) => {
  try {
    const { department, search, isHOD } = req.query;
    let query = {};

    // If HOD is requesting, scope to their department unless admin
    if (req.user.role === 'hod') {
      const hodProfile = await Faculty.findOne({ user: req.user._id });
      if (hodProfile) {
        query.department = hodProfile.department;
      }
    } else if (department) {
      query.department = department;
    }

    if (isHOD !== undefined) {
      query.isHOD = isHOD === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { facultyId: { $regex: search, $options: 'i' } },
      ];
    }

    const facultyList = await Faculty.find(query)
      .populate('department', 'name code')
      .populate('subjects', 'name code')
      .populate('assignedClasses.subject', 'name code')
      .populate('assignedClasses.department', 'name code')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: facultyList.length,
      data: facultyList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single faculty member
// @route   GET /api/faculty/:id
// @access  Private
exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('department', 'name code')
      .populate('subjects', 'name code')
      .populate('assignedClasses.subject', 'name code')
      .populate('assignedClasses.department', 'name code');

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty member not found' });
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create faculty member
// @route   POST /api/faculty
// @access  Private/Admin
exports.createFaculty = async (req, res) => {
  try {
    const {
      facultyId,
      name,
      email,
      phone,
      department,
      designation,
      subjects,
      assignedClasses,
      password,
      isHOD,
    } = req.body;

    if (!facultyId || !name || !email || !department || !password) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID, Name, Email, Department, and Password are required',
      });
    }

    // Check duplicate email in User
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Check duplicate facultyId
    const existingFaculty = await Faculty.findOne({ facultyId: facultyId.toUpperCase() });
    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: `Faculty ID '${facultyId}' already exists`,
      });
    }

    // Role determined by isHOD or designation
    const role = isHOD ? 'hod' : 'faculty';

    // Create User record
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role,
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : '',
    });

    // Create Faculty record
    const faculty = await Faculty.create({
      user: user._id,
      facultyId: facultyId.toUpperCase(),
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      department,
      designation: designation || (isHOD ? 'Head of Department' : 'Assistant Professor'),
      subjects: subjects || [],
      assignedClasses: assignedClasses ? JSON.parse(typeof assignedClasses === 'string' ? assignedClasses : JSON.stringify(assignedClasses)) : [],
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : '',
      isHOD: !!isHOD,
    });

    // If marked as HOD, update the department
    if (isHOD) {
      // Deactivate any previous HOD in this department
      await Faculty.updateMany(
        { department, _id: { $ne: faculty._id }, isHOD: true },
        { isHOD: false, designation: 'Professor' }
      );
      // Update User roles for any previous HOD of this department
      const previousHods = await Faculty.find({ department, _id: { $ne: faculty._id } });
      for (const prev of previousHods) {
        await User.findByIdAndUpdate(prev.user, { role: 'faculty' });
      }

      await Department.findByIdAndUpdate(department, { hod: faculty._id });
    }

    const populated = await Faculty.findById(faculty._id)
      .populate('department', 'name code')
      .populate('subjects', 'name code');

    res.status(201).json({
      success: true,
      message: `${isHOD ? 'HOD' : 'Faculty'} created successfully`,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update faculty member
// @route   PUT /api/faculty/:id
// @access  Private/Admin
exports.updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    const {
      name,
      phone,
      department,
      designation,
      subjects,
      assignedClasses,
      isHOD,
      isActive,
      password,
    } = req.body;

    if (name) faculty.name = name;
    if (phone !== undefined) faculty.phone = phone;
    if (department) faculty.department = department;
    if (designation) faculty.designation = designation;
    if (subjects) faculty.subjects = typeof subjects === 'string' ? JSON.parse(subjects) : subjects;
    if (assignedClasses) faculty.assignedClasses = typeof assignedClasses === 'string' ? JSON.parse(assignedClasses) : assignedClasses;
    if (isActive !== undefined) {
      faculty.isActive = isActive;
      await User.findByIdAndUpdate(faculty.user, { isActive });
    }

    if (req.file) {
      faculty.profilePhoto = `/uploads/${req.file.filename}`;
      await User.findByIdAndUpdate(faculty.user, { profilePhoto: faculty.profilePhoto });
    }

    // Password update if provided
    if (password) {
      const user = await User.findById(faculty.user).select('+password');
      if (user) {
        user.password = password;
        await user.save();
      }
    }

    // Check HOD status change
    if (isHOD !== undefined && isHOD !== faculty.isHOD) {
      faculty.isHOD = isHOD;
      const newRole = isHOD ? 'hod' : 'faculty';
      await User.findByIdAndUpdate(faculty.user, { role: newRole });

      if (isHOD) {
        // Enforce single active HOD per department
        await Faculty.updateMany(
          { department: faculty.department, _id: { $ne: faculty._id }, isHOD: true },
          { isHOD: false, designation: 'Professor' }
        );
        await Department.findByIdAndUpdate(faculty.department, { hod: faculty._id });
      } else {
        await Department.findOneAndUpdate({ hod: faculty._id }, { hod: null });
      }
    }

    await faculty.save();

    const populated = await Faculty.findById(faculty._id)
      .populate('department', 'name code')
      .populate('subjects', 'name code')
      .populate('assignedClasses.subject', 'name code')
      .populate('assignedClasses.department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign HOD to department
// @route   POST /api/faculty/assign-hod
// @access  Private/Admin
exports.assignHOD = async (req, res) => {
  try {
    const { facultyId, departmentId } = req.body;

    if (!facultyId || !departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Both facultyId and departmentId are required',
      });
    }

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty member not found' });
    }

    // Reset previous HOD in this department
    const previousHods = await Faculty.find({ department: departmentId, isHOD: true });
    for (const prev of previousHods) {
      prev.isHOD = false;
      await prev.save();
      await User.findByIdAndUpdate(prev.user, { role: 'faculty' });
    }

    // Set new HOD
    faculty.isHOD = true;
    faculty.department = departmentId;
    faculty.designation = 'Head of Department';
    await faculty.save();

    await User.findByIdAndUpdate(faculty.user, { role: 'hod' });
    await Department.findByIdAndUpdate(departmentId, { hod: faculty._id });

    res.status(200).json({
      success: true,
      message: `${faculty.name} successfully appointed as HOD`,
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete/Deactivate faculty
// @route   DELETE /api/faculty/:id
// @access  Private/Admin
exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    // Soft delete / deactivate
    faculty.isActive = false;
    await faculty.save();

    await User.findByIdAndUpdate(faculty.user, { isActive: false });

    // If HOD, remove from department
    if (faculty.isHOD) {
      await Department.findOneAndUpdate({ hod: faculty._id }, { hod: null });
    }

    res.status(200).json({
      success: true,
      message: 'Faculty deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
