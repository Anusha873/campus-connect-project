const ExaminationResult = require('../models/ExaminationResult');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// Grade calculation helper
const calculateGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'O', gradePoint: 10, status: 'Pass' };
  if (percentage >= 80) return { grade: 'A+', gradePoint: 9, status: 'Pass' };
  if (percentage >= 70) return { grade: 'A', gradePoint: 8, status: 'Pass' };
  if (percentage >= 60) return { grade: 'B+', gradePoint: 7, status: 'Pass' };
  if (percentage >= 50) return { grade: 'B', gradePoint: 6, status: 'Pass' };
  if (percentage >= 40) return { grade: 'C', gradePoint: 5, status: 'Pass' };
  return { grade: 'F', gradePoint: 0, status: 'Fail' };
};

// @desc    Enter or update examination results
// @route   POST /api/results
// @access  Private/Admin,HOD,Faculty
exports.enterResult = async (req, res) => {
  try {
    const { studentId, subject, examName, maxMarks, obtainedMarks, semester, academicYear } = req.body;

    if (!studentId || !subject || !examName || maxMarks === undefined || obtainedMarks === undefined || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Student, subject, exam name, max marks, obtained marks, and semester are required',
      });
    }

    if (Number(obtainedMarks) > Number(maxMarks)) {
      return res.status(400).json({
        success: false,
        message: `Obtained marks (${obtainedMarks}) cannot exceed maximum marks (${maxMarks})`,
      });
    }

    const pct = (Number(obtainedMarks) / Number(maxMarks)) * 100;
    const { grade, gradePoint, status } = calculateGrade(pct);

    const result = await ExaminationResult.findOneAndUpdate(
      {
        student: studentId,
        subject,
        examName,
        semester: Number(semester),
      },
      {
        student: studentId,
        subject,
        examName,
        maxMarks: Number(maxMarks),
        obtainedMarks: Number(obtainedMarks),
        grade,
        gradePoint,
        status,
        semester: Number(semester),
        academicYear: academicYear || '2025-2026',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .populate('student', 'name rollNumber user')
      .populate('subject', 'name code credits');

    // Notify student
    if (result.student && result.student.user) {
      await Notification.create({
        user: result.student.user,
        title: `Exam Result Published: ${examName}`,
        message: `Your result for ${result.subject.name} has been published: Grade ${grade} (${obtainedMarks}/${maxMarks}).`,
        type: 'result',
        link: '/student/results',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Examination result saved successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student results (for student portal or single student view)
// @route   GET /api/results/student/:id?
// @access  Private
exports.getStudentResults = async (req, res) => {
  try {
    let studentId = req.params.id;

    if (!studentId) {
      if (req.user.role !== 'student') {
        return res.status(400).json({ success: false, message: 'Student ID required' });
      }
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      studentId = student._id;
    }

    const { semester } = req.query;
    let query = { student: studentId };
    if (semester) query.semester = Number(semester);

    const results = await ExaminationResult.find(query)
      .populate('subject', 'name code credits')
      .sort({ semester: 1, subject: 1 });

    // Group by semester
    const semestersMap = {};
    results.forEach((r) => {
      const sem = r.semester;
      if (!semestersMap[sem]) {
        semestersMap[sem] = {
          semester: sem,
          results: [],
          totalMax: 0,
          totalObtained: 0,
          totalCredits: 0,
          weightedPoints: 0,
          hasBacklog: false,
        };
      }

      semestersMap[sem].results.push(r);
      semestersMap[sem].totalMax += r.maxMarks;
      semestersMap[sem].totalObtained += r.obtainedMarks;

      const credits = (r.subject && r.subject.credits) || 3;
      semestersMap[sem].totalCredits += credits;
      semestersMap[sem].weightedPoints += r.gradePoint * credits;

      if (r.status === 'Fail') {
        semestersMap[sem].hasBacklog = true;
      }
    });

    const semesterCards = Object.values(semestersMap).map((sem) => {
      const gpa = sem.totalCredits > 0 ? Number((sem.weightedPoints / sem.totalCredits).toFixed(2)) : 0;
      const percentage = sem.totalMax > 0 ? Number(((sem.totalObtained / sem.totalMax) * 100).toFixed(1)) : 0;
      return {
        semester: sem.semester,
        results: sem.results,
        totalMax: sem.totalMax,
        totalObtained: sem.totalObtained,
        percentage,
        gpa,
        status: sem.hasBacklog ? 'Backlog' : 'Passed',
      };
    });

    // Overall metrics
    let grandMax = 0;
    let grandObtained = 0;
    results.forEach((r) => {
      grandMax += r.maxMarks;
      grandObtained += r.obtainedMarks;
    });

    const overallPercentage = grandMax > 0 ? Number(((grandObtained / grandMax) * 100).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalSubjects: results.length,
        grandMax,
        grandObtained,
        overallPercentage,
        semestersCompleted: semesterCards.length,
      },
      semesterCards,
      allResults: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get class examination results
// @route   GET /api/results/class
// @access  Private/Admin,HOD,Faculty
exports.getClassResults = async (req, res) => {
  try {
    const { department, year, semester, section, subject, examName } = req.query;

    if (!department || !year || !semester || !section) {
      return res.status(400).json({
        success: false,
        message: 'Department, year, semester, and section are required',
      });
    }

    const students = await Student.find({
      department,
      year: Number(year),
      semester: Number(semester),
      section: section.toUpperCase(),
      isActive: true,
    }).sort({ rollNumber: 1 });

    let query = {
      semester: Number(semester),
      student: { $in: students.map((s) => s._id) },
    };
    if (subject) query.subject = subject;
    if (examName) query.examName = examName;

    const records = await ExaminationResult.find(query).populate('subject', 'name code');

    const studentMap = {};
    records.forEach((r) => {
      const sId = r.student.toString();
      if (!studentMap[sId]) studentMap[sId] = [];
      studentMap[sId].push(r);
    });

    const data = students.map((s) => ({
      ...s.toObject(),
      results: studentMap[s._id.toString()] || [],
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
