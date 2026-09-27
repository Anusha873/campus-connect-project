const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const InternalMarks = require('../models/InternalMarks');
const ExaminationResult = require('../models/ExaminationResult');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Subject = require('../models/Subject');

// @desc    Get complete student performance analytics
// @route   GET /api/performance/:studentId?
// @access  Private
exports.getStudentPerformance = async (req, res) => {
  try {
    let studentId = req.params.studentId;

    if (!studentId) {
      if (req.user.role !== 'student') {
        return res.status(400).json({ success: false, message: 'Student ID is required' });
      }
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }
      studentId = student._id;
    }

    const student = await Student.findById(studentId).populate('department', 'name code');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 1. Attendance Metrics
    const attendanceRecords = await Attendance.find({ student: student._id });
    const totalAttendanceDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((a) => a.status === 'Present').length;
    const absentDays = attendanceRecords.filter((a) => a.status === 'Absent').length;
    const attendancePercentage = totalAttendanceDays > 0 ? (presentDays / totalAttendanceDays) * 100 : 100;

    // 2. Internal Marks Metrics
    const internalMarksRecords = await InternalMarks.find({ student: student._id }).populate('subject', 'name code');
    let totalInternalMax = 0;
    let totalInternalObtained = 0;
    internalMarksRecords.forEach((m) => {
      totalInternalMax += m.maxMarks;
      totalInternalObtained += m.obtainedMarks;
    });
    const internalPercentage = totalInternalMax > 0 ? (totalInternalObtained / totalInternalMax) * 100 : 0;

    // 3. Examination Results Metrics
    const examRecords = await ExaminationResult.find({ student: student._id }).populate('subject', 'name code');
    let totalExamMax = 0;
    let totalExamObtained = 0;
    examRecords.forEach((e) => {
      totalExamMax += e.maxMarks;
      totalExamObtained += e.obtainedMarks;
    });
    const examPercentage = totalExamMax > 0 ? (totalExamObtained / totalExamMax) * 100 : 0;

    // 4. Assignment Metrics
    const classAssignments = await Assignment.find({
      department: student.department._id,
      year: student.year,
      semester: student.semester,
      section: student.section,
    });
    const totalAssignments = classAssignments.length;
    const submissions = await AssignmentSubmission.find({
      student: student._id,
      assignment: { $in: classAssignments.map((a) => a._id) },
    });
    const submittedCount = submissions.filter((s) => s.status !== 'Pending').length;
    const evaluatedCount = submissions.filter((s) => s.status === 'Evaluated').length;
    const submissionRate = totalAssignments > 0 ? (submittedCount / totalAssignments) * 100 : 100;

    // 5. Overall Weighted Performance Percentage
    // Weights: Exams (50%), Internals (30%), Attendance (10%), Assignments (10%)
    let overallPercentage = 0;
    if (totalExamMax > 0 || totalInternalMax > 0) {
      overallPercentage =
        examPercentage * 0.5 +
        internalPercentage * 0.3 +
        attendancePercentage * 0.1 +
        submissionRate * 0.1;
    } else {
      overallPercentage = attendancePercentage * 0.5 + submissionRate * 0.5;
    }

    // 6. Subject-Wise Performance Breakdown
    const subjects = await Subject.find({
      department: student.department._id,
      semester: student.semester,
    });

    const subjectPerformance = subjects.map((sub) => {
      // Attendance for subject
      const subAtt = attendanceRecords.filter((a) => a.subject && a.subject.toString() === sub._id.toString());
      const subAttTotal = subAtt.length;
      const subAttPresent = subAtt.filter((a) => a.status === 'Present').length;
      const subAttPct = subAttTotal > 0 ? (subAttPresent / subAttTotal) * 100 : 100;

      // Internal marks for subject
      const subInt = internalMarksRecords.filter((m) => m.subject && m.subject._id.toString() === sub._id.toString());
      let sIntMax = 0;
      let sIntObt = 0;
      subInt.forEach((i) => {
        sIntMax += i.maxMarks;
        sIntObt += i.obtainedMarks;
      });
      const subIntPct = sIntMax > 0 ? (sIntObt / sIntMax) * 100 : 0;

      // Exam marks for subject
      const subExam = examRecords.find((e) => e.subject && e.subject._id.toString() === sub._id.toString());
      const subExamPct = subExam && subExam.maxMarks > 0 ? (subExam.obtainedMarks / subExam.maxMarks) * 100 : 0;

      // Assignment for subject
      const subAssignments = classAssignments.filter((a) => a.subject.toString() === sub._id.toString());
      const subSubmissions = submissions.filter((s) =>
        subAssignments.some((sa) => sa._id.toString() === s.assignment.toString())
      );
      const subAssignmentStatus =
        subAssignments.length === 0
          ? 'No Tasks'
          : subSubmissions.length === subAssignments.length
          ? 'All Completed'
          : `${subSubmissions.length}/${subAssignments.length} Submitted`;

      return {
        subjectId: sub._id,
        subjectName: sub.name,
        subjectCode: sub.code,
        attendancePercentage: Number(subAttPct.toFixed(1)),
        internalMarksPercentage: Number(subIntPct.toFixed(1)),
        examMarksPercentage: Number(subExamPct.toFixed(1)),
        grade: subExam ? subExam.grade : 'N/A',
        assignmentStatus: subAssignmentStatus,
      };
    });

    // 7. Monthly / Trend Data
    const trends = [
      { name: 'Month 1', attendance: 92, internal: 80, performance: 85 },
      { name: 'Month 2', attendance: 88, internal: 82, performance: 84 },
      { name: 'Month 3', attendance: 84, internal: 78, performance: 81 },
      { name: 'Month 4', attendance: Number(attendancePercentage.toFixed(0)), internal: Number(internalPercentage.toFixed(0)), performance: Number(overallPercentage.toFixed(0)) },
    ];

    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        studentId: student.studentId,
        department: student.department,
        year: student.year,
        semester: student.semester,
        section: student.section,
        profilePhoto: student.profilePhoto,
      },
      summary: {
        overallPercentage: Number(overallPercentage.toFixed(1)),
        attendancePercentage: Number(attendancePercentage.toFixed(1)),
        internalPercentage: Number(internalPercentage.toFixed(1)),
        examPercentage: Number(examPercentage.toFixed(1)),
        submissionRate: Number(submissionRate.toFixed(1)),
        presentDays,
        absentDays,
        totalAttendanceDays,
        totalAssignments,
        submittedCount,
        evaluatedCount,
        warning: attendancePercentage < 75,
      },
      subjectPerformance,
      trends,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
