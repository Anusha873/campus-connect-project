const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const InternalMarks = require('../models/InternalMarks');
const ExaminationResult = require('../models/ExaminationResult');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const LeaveRequest = require('../models/LeaveRequest');

// Helper to escape CSV strings
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

// @desc    Export Attendance Report to CSV
// @route   GET /api/reports/attendance/csv
// @access  Private/Admin,HOD
exports.exportAttendanceCSV = async (req, res) => {
  try {
    const { department, year, semester, section } = req.query;
    let query = {};
    if (department) query.department = department;
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (section) query.section = section.toUpperCase();

    const records = await Attendance.find(query)
      .populate('student', 'name rollNumber studentId')
      .populate('subject', 'name code')
      .populate('department', 'code')
      .sort({ date: -1 });

    let csv = 'Student ID,Roll Number,Student Name,Department,Year,Semester,Section,Subject Code,Subject Name,Date,Status,Remarks\n';

    records.forEach((r) => {
      const row = [
        escapeCSV(r.student ? r.student.studentId : ''),
        escapeCSV(r.student ? r.student.rollNumber : ''),
        escapeCSV(r.student ? r.student.name : ''),
        escapeCSV(r.department ? r.department.code : ''),
        escapeCSV(r.year),
        escapeCSV(r.semester),
        escapeCSV(r.section),
        escapeCSV(r.subject ? r.subject.code : ''),
        escapeCSV(r.subject ? r.subject.name : ''),
        escapeCSV(r.date ? new Date(r.date).toISOString().split('T')[0] : ''),
        escapeCSV(r.status),
        escapeCSV(r.remarks || ''),
      ];
      csv += row.join(',') + '\n';
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_report.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Internal Marks Report to CSV
// @route   GET /api/reports/internal-marks/csv
// @access  Private/Admin,HOD
exports.exportInternalMarksCSV = async (req, res) => {
  try {
    const { department, semester } = req.query;
    let query = {};
    if (semester) query.semester = Number(semester);

    const records = await InternalMarks.find(query)
      .populate('student', 'name rollNumber studentId department')
      .populate('subject', 'name code')
      .sort({ semester: 1 });

    let csv = 'Student ID,Roll Number,Student Name,Subject Code,Subject Name,Semester,Exam Type,Max Marks,Obtained Marks,Percentage,Remarks\n';

    records.forEach((r) => {
      const pct = r.maxMarks > 0 ? ((r.obtainedMarks / r.maxMarks) * 100).toFixed(1) : '0';
      const row = [
        escapeCSV(r.student ? r.student.studentId : ''),
        escapeCSV(r.student ? r.student.rollNumber : ''),
        escapeCSV(r.student ? r.student.name : ''),
        escapeCSV(r.subject ? r.subject.code : ''),
        escapeCSV(r.subject ? r.subject.name : ''),
        escapeCSV(r.semester),
        escapeCSV(r.examType),
        escapeCSV(r.maxMarks),
        escapeCSV(r.obtainedMarks),
        escapeCSV(`${pct}%`),
        escapeCSV(r.remarks || ''),
      ];
      csv += row.join(',') + '\n';
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('internal_marks_report.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Examination Results to CSV
// @route   GET /api/reports/exam-results/csv
// @access  Private/Admin,HOD
exports.exportExamResultsCSV = async (req, res) => {
  try {
    const { semester } = req.query;
    let query = {};
    if (semester) query.semester = Number(semester);

    const records = await ExaminationResult.find(query)
      .populate('student', 'name rollNumber studentId')
      .populate('subject', 'name code credits')
      .sort({ semester: 1 });

    let csv = 'Student ID,Roll Number,Student Name,Subject Code,Subject Name,Credits,Semester,Exam Name,Max Marks,Obtained Marks,Grade,Grade Point,Status\n';

    records.forEach((r) => {
      const row = [
        escapeCSV(r.student ? r.student.studentId : ''),
        escapeCSV(r.student ? r.student.rollNumber : ''),
        escapeCSV(r.student ? r.student.name : ''),
        escapeCSV(r.subject ? r.subject.code : ''),
        escapeCSV(r.subject ? r.subject.name : ''),
        escapeCSV(r.subject ? r.subject.credits : 3),
        escapeCSV(r.semester),
        escapeCSV(r.examName),
        escapeCSV(r.maxMarks),
        escapeCSV(r.obtainedMarks),
        escapeCSV(r.grade),
        escapeCSV(r.gradePoint),
        escapeCSV(r.status),
      ];
      csv += row.join(',') + '\n';
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('exam_results_report.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Leave Requests to CSV
// @route   GET /api/reports/leaves/csv
// @access  Private/Admin,HOD
exports.exportLeavesCSV = async (req, res) => {
  try {
    const { department, status } = req.query;
    let query = {};
    if (department) query.department = department;
    if (status) query.status = status;

    const leaves = await LeaveRequest.find(query)
      .populate('student', 'name rollNumber studentId')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    let csv = 'Student ID,Roll Number,Student Name,Department,Start Date,End Date,Days,Reason,Status,Reviewer,Review Comment\n';

    leaves.forEach((l) => {
      const row = [
        escapeCSV(l.student ? l.student.studentId : ''),
        escapeCSV(l.student ? l.student.rollNumber : ''),
        escapeCSV(l.student ? l.student.name : ''),
        escapeCSV(l.department ? l.department.code : ''),
        escapeCSV(l.startDate ? new Date(l.startDate).toISOString().split('T')[0] : ''),
        escapeCSV(l.endDate ? new Date(l.endDate).toISOString().split('T')[0] : ''),
        escapeCSV(l.numberOfDays),
        escapeCSV(l.reason),
        escapeCSV(l.status),
        escapeCSV(l.reviewerName || ''),
        escapeCSV(l.reviewComment || ''),
      ];
      csv += row.join(',') + '\n';
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('leave_requests_report.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
