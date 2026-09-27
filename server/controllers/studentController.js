const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all students with search & filter
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res) => {
  try {
    const { department, year, semester, section, search, page = 1, limit = 100 } = req.query;
    let query = { isActive: true };

    // HOD filter: if HOD, force department to HOD's department
    if (req.user.role === 'hod') {
      const Faculty = require('../models/Faculty');
      const hod = await Faculty.findOne({ user: req.user._id });
      if (hod) {
        query.department = hod.department;
      }
    } else if (department) {
      query.department = department;
    }

    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (section) query.section = section.toUpperCase();

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query)
      .populate('department', 'name code')
      .sort({ rollNumber: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      data: students,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('department', 'name code')
      .populate('user', 'email profilePhoto lastLogin isActive');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new student
// @route   POST /api/students
// @access  Private/Admin
exports.createStudent = async (req, res) => {
  try {
    const {
      studentId,
      rollNumber,
      name,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      department,
      course,
      year,
      semester,
      section,
      admissionYear,
      address,
      parentName,
      parentPhone,
    } = req.body;

    // Required field validation
    if (
      !studentId ||
      !rollNumber ||
      !name ||
      !email ||
      !password ||
      !gender ||
      !dateOfBirth ||
      !department ||
      !year ||
      !semester ||
      !section ||
      !parentName ||
      !parentPhone
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required student information fields',
      });
    }

    // Check duplicate studentId
    const existingId = await Student.findOne({ studentId: studentId.toUpperCase() });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: `Student ID '${studentId}' already exists`,
      });
    }

    // Check duplicate rollNumber
    const existingRoll = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (existingRoll) {
      return res.status(400).json({
        success: false,
        message: `Roll Number '${rollNumber}' already exists`,
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Email '${email}' is already registered`,
      });
    }

    // Create User account
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: 'student',
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : '',
    });

    // Create Student record
    const student = await Student.create({
      user: user._id,
      studentId: studentId.toUpperCase(),
      rollNumber: rollNumber.toUpperCase(),
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      gender,
      dateOfBirth: new Date(dateOfBirth),
      department,
      course: course || 'B.Tech',
      year: Number(year),
      semester: Number(semester),
      section: section.toUpperCase(),
      admissionYear: admissionYear ? Number(admissionYear) : 2023,
      address: address || '',
      parentName,
      parentPhone,
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : '',
    });

    const populated = await Student.findById(student._id).populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const {
      name,
      phone,
      gender,
      dateOfBirth,
      department,
      course,
      year,
      semester,
      section,
      admissionYear,
      address,
      parentName,
      parentPhone,
      isActive,
      password,
    } = req.body;

    if (name) student.name = name;
    if (phone !== undefined) student.phone = phone;
    if (gender) student.gender = gender;
    if (dateOfBirth) student.dateOfBirth = new Date(dateOfBirth);
    if (department) student.department = department;
    if (course) student.course = course;
    if (year) student.year = Number(year);
    if (semester) student.semester = Number(semester);
    if (section) student.section = section.toUpperCase();
    if (admissionYear) student.admissionYear = Number(admissionYear);
    if (address !== undefined) student.address = address;
    if (parentName) student.parentName = parentName;
    if (parentPhone) student.parentPhone = parentPhone;

    if (isActive !== undefined) {
      student.isActive = isActive;
      await User.findByIdAndUpdate(student.user, { isActive });
    }

    if (req.file) {
      student.profilePhoto = `/uploads/${req.file.filename}`;
      await User.findByIdAndUpdate(student.user, { profilePhoto: student.profilePhoto });
    }

    if (password) {
      const user = await User.findById(student.user).select('+password');
      if (user) {
        user.password = password;
        await user.save();
      }
    }

    await student.save();

    const populated = await Student.findById(student._id).populate('department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete/Deactivate student
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.isActive = false;
    await student.save();

    await User.findByIdAndUpdate(student.user, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Student deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
