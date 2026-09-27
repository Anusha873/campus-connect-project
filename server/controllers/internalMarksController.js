const InternalMarks = require('../models/InternalMarks');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// @desc    Enter or update marks for a student or batch
// @route   POST /api/internal-marks
// @access  Private/Faculty,Admin
exports.enterMarks = async (req, res) => {
  try {
    const { studentId, subject, examType, maxMarks, obtainedMarks, semester, academicYear, remarks } = req.body;

    if (!studentId || !subject || !examType || maxMarks === undefined || obtainedMarks === undefined || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Student, subject, exam type, max marks, obtained marks, and semester are required',
      });
    }

    if (Number(obtainedMarks) > Number(maxMarks)) {
      return res.status(400).json({
        success: false,
        message: `Obtained marks (${obtainedMarks}) cannot exceed maximum marks (${maxMarks})`,
      });
    }

    // Determine faculty ID
    let facultyId = null;
    if (req.user.role === 'faculty' || req.user.role === 'hod') {
      const faculty = await Faculty.findOne({ user: req.user._id });
      if (faculty) facultyId = faculty._id;
    }

    const marksRecord = await InternalMarks.findOneAndUpdate(
      {
        student: studentId,
        subject,
        examType,
        semester: Number(semester),
        academicYear: academicYear || '2025-2026',
      },
      {
        student: studentId,
        subject,
        faculty: facultyId,
        examType,
        maxMarks: Number(maxMarks),
        obtainedMarks: Number(obtainedMarks),
        semester: Number(semester),
        academicYear: academicYear || '2025-2026',
        remarks: remarks || '',
      },
      { upsert: true, new: true, runValidators: true }
    )
      .populate('student', 'name rollNumber studentId')
      .populate('subject', 'name code');

    res.status(200).json({
      success: true,
      message: 'Internal marks saved successfully',
      data: marksRecord,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get internal marks for logged in student or specific student
// @route   GET /api/internal-marks/student/:id?
// @access  Private
exports.getStudentMarks = async (req, res) => {
  try {
    let studentId = req.params.id;

    if (!studentId) {
      if (req.user.role !== 'student') {
        return res.status(400).json({ success: false, message: 'Student ID required' });
      }
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }
      studentId = student._id;
    }

    const { semester } = req.query;
    let query = { student: studentId };
    if (semester) query.semester = Number(semester);

    const records = await InternalMarks.find(query)
      .populate('subject', 'name code credits')
      .populate('faculty', 'name')
      .sort({ semester: 1, subject: 1 });

    // Calculate totals and percentages
    let totalMax = 0;
    let totalObtained = 0;

    const subjectMap = {};

    records.forEach((record) => {
      totalMax += record.maxMarks;
      totalObtained += record.obtainedMarks;

      if (!record.subject) return;
      const subId = record.subject._id.toString();
      if (!subjectMap[subId]) {
        subjectMap[subId] = {
          subjectId: subId,
          subjectName: record.subject.name,
          subjectCode: record.subject.code,
          credits: record.subject.credits,
          tests: [],
          totalMax: 0,
          totalObtained: 0,
        };
      }
      subjectMap[subId].tests.push({
        examType: record.examType,
        maxMarks: record.maxMarks,
        obtainedMarks: record.obtainedMarks,
        percentage: Number(((record.obtainedMarks / record.maxMarks) * 100).toFixed(1)),
        remarks: record.remarks,
      });
      subjectMap[subId].totalMax += record.maxMarks;
      subjectMap[subId].totalObtained += record.obtainedMarks;
    });

    const subjectWise = Object.values(subjectMap).map((sub) => ({
      ...sub,
      percentage: sub.totalMax > 0 ? Number(((sub.totalObtained / sub.totalMax) * 100).toFixed(1)) : 0,
    }));

    const overallPercentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalMax,
        totalObtained,
        overallPercentage,
        testCount: records.length,
      },
      subjectWise,
      records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get internal marks for a class/section and subject (faculty view)
// @route   GET /api/internal-marks/class
// @access  Private
exports.getClassMarks = async (req, res) => {
  try {
    const { department, year, semester, section, subject, examType } = req.query;

    if (!department || !year || !semester || !section || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Department, year, semester, section, and subject are required',
      });
    }

    const students = await Student.find({
      department,
      year: Number(year),
      semester: Number(semester),
      section: section.toUpperCase(),
      isActive: true,
    }).sort({ rollNumber: 1 });

    let marksQuery = {
      subject,
      semester: Number(semester),
      student: { $in: students.map((s) => s._id) },
    };
    if (examType) marksQuery.examType = examType;

    const marksRecords = await InternalMarks.find(marksQuery);

    const studentMarksMap = {};
    marksRecords.forEach((m) => {
      const sId = m.student.toString();
      if (!studentMarksMap[sId]) studentMarksMap[sId] = [];
      studentMarksMap[sId].push(m);
    });

    const result = students.map((student) => ({
      ...student.toObject(),
      marks: studentMarksMap[student._id.toString()] || [],
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
