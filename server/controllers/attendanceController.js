const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');

// @desc    Mark or update attendance for students in a class
// @route   POST /api/attendance
// @access  Private/Faculty,Admin
exports.markAttendance = async (req, res) => {
  try {
    const { department, year, semester, section, subject, date, attendanceRecords } = req.body;

    if (!department || !year || !semester || !section || !subject || !date || !attendanceRecords) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all class details, subject, date, and attendance records',
      });
    }

    // Determine faculty ID
    let facultyId = null;
    if (req.user.role === 'faculty' || req.user.role === 'hod') {
      const faculty = await Faculty.findOne({ user: req.user._id });
      if (faculty) facultyId = faculty._id;
    } else {
      // If admin, find assigned faculty or default
      const defaultFac = await Faculty.findOne({ department });
      facultyId = defaultFac ? defaultFac._id : null;
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const savedRecords = [];

    for (const record of attendanceRecords) {
      const { studentId, status, remarks } = record;

      // Upsert attendance for student + subject + date
      const updated = await Attendance.findOneAndUpdate(
        {
          student: studentId,
          subject,
          date: attendanceDate,
        },
        {
          student: studentId,
          faculty: facultyId,
          subject,
          department,
          year: Number(year),
          semester: Number(semester),
          section: section.toUpperCase(),
          date: attendanceDate,
          status: status || 'Present',
          remarks: remarks || '',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      savedRecords.push(updated);

      // Check if student's overall attendance dropped below 75% and send notification
      if (status === 'Absent') {
        const studentDocs = await Attendance.find({ student: studentId });
        const total = studentDocs.length;
        const present = studentDocs.filter((a) => a.status === 'Present').length;
        const percent = total > 0 ? (present / total) * 100 : 100;

        if (percent < 75) {
          const studentObj = await Student.findById(studentId);
          if (studentObj) {
            await Notification.create({
              user: studentObj.user,
              title: 'Low Attendance Warning',
              message: `Your overall attendance has dropped to ${percent.toFixed(1)}%, which is below the mandatory 75% threshold. Please meet your faculty advisor.`,
              type: 'attendance',
              link: '/student/attendance',
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Attendance marked successfully for ${savedRecords.length} students`,
      data: savedRecords,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance for a specific class, subject, and date (for faculty view)
// @route   GET /api/attendance/class
// @access  Private
exports.getClassAttendance = async (req, res) => {
  try {
    const { department, year, semester, section, subject, date } = req.query;

    if (!department || !year || !semester || !section) {
      return res.status(400).json({
        success: false,
        message: 'Department, year, semester, and section are required',
      });
    }

    // Get all students enrolled in this class
    const students = await Student.find({
      department,
      year: Number(year),
      semester: Number(semester),
      section: section.toUpperCase(),
      isActive: true,
    }).sort({ rollNumber: 1 });

    let attendanceMap = {};

    if (subject && date) {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      const records = await Attendance.find({
        subject,
        date: attendanceDate,
        student: { $in: students.map((s) => s._id) },
      });

      records.forEach((r) => {
        attendanceMap[r.student.toString()] = {
          status: r.status,
          remarks: r.remarks,
        };
      });
    }

    const studentsWithAttendance = students.map((student) => ({
      ...student.toObject(),
      attendanceStatus: attendanceMap[student._id.toString()]
        ? attendanceMap[student._id.toString()].status
        : 'Present',
      remarks: attendanceMap[student._id.toString()]
        ? attendanceMap[student._id.toString()].remarks
        : '',
    }));

    res.status(200).json({
      success: true,
      count: studentsWithAttendance.length,
      data: studentsWithAttendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in student's or specific student's attendance stats and history
// @route   GET /api/attendance/student/:id?
// @access  Private
exports.getStudentAttendance = async (req, res) => {
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

    const attendanceRecords = await Attendance.find({ student: studentId })
      .populate('subject', 'name code')
      .populate('faculty', 'name')
      .sort({ date: -1 });

    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter((a) => a.status === 'Present').length;
    const absentClasses = attendanceRecords.filter((a) => a.status === 'Absent').length;
    const overallPercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;

    // Subject-wise stats
    const subjectMap = {};
    attendanceRecords.forEach((record) => {
      if (!record.subject) return;
      const subId = record.subject._id.toString();
      if (!subjectMap[subId]) {
        subjectMap[subId] = {
          subjectId: subId,
          subjectName: record.subject.name,
          subjectCode: record.subject.code,
          total: 0,
          present: 0,
          absent: 0,
        };
      }
      subjectMap[subId].total += 1;
      if (record.status === 'Present') {
        subjectMap[subId].present += 1;
      } else {
        subjectMap[subId].absent += 1;
      }
    });

    const subjectWise = Object.values(subjectMap).map((sub) => ({
      ...sub,
      percentage: Number(((sub.present / sub.total) * 100).toFixed(1)),
      warning: (sub.present / sub.total) * 100 < 75,
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalClasses,
        presentClasses,
        absentClasses,
        overallPercentage: Number(overallPercentage.toFixed(1)),
        warning: overallPercentage < 75,
      },
      subjectWise,
      history: attendanceRecords,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
