const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Faculty,Admin
exports.createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      department,
      year,
      semester,
      section,
      dueDate,
      maxMarks,
    } = req.body;

    if (!title || !description || !subject || !department || !year || !semester || !section || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, subject, department, year, semester, section, and due date',
      });
    }

    // Determine faculty ID
    let facultyId = null;
    if (req.user.role === 'faculty' || req.user.role === 'hod') {
      const faculty = await Faculty.findOne({ user: req.user._id });
      if (faculty) facultyId = faculty._id;
    } else {
      const fac = await Faculty.findOne({ department });
      facultyId = fac ? fac._id : null;
    }

    const assignment = await Assignment.create({
      title,
      description,
      subject,
      department,
      year: Number(year),
      semester: Number(semester),
      section: section.toUpperCase(),
      dueDate: new Date(dueDate),
      maxMarks: maxMarks ? Number(maxMarks) : 100,
      attachment: req.file ? `/uploads/${req.file.filename}` : '',
      attachmentName: req.file ? req.file.originalname : '',
      faculty: facultyId,
    });

    // Notify all matching students in this class/section
    const targetStudents = await Student.find({
      department,
      year: Number(year),
      semester: Number(semester),
      section: section.toUpperCase(),
      isActive: true,
    });

    const notifications = targetStudents.map((s) => ({
      user: s.user,
      title: `New Assignment: ${title}`,
      message: `A new assignment has been posted for your class with due date ${new Date(dueDate).toLocaleDateString()}.`,
      type: 'assignment',
      link: '/student/assignments',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    const populated = await Assignment.findById(assignment._id)
      .populate('subject', 'name code')
      .populate('faculty', 'name');

    res.status(201).json({
      success: true,
      message: 'Assignment created and published to students successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get assignments (Strictly scoped by role and student's class)
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    const { department, year, semester, section, subject, status } = req.query;

    if (req.user.role === 'student') {
      // Find the logged in student
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      // CRITICAL: Students can ONLY see assignments targeting their Department, Year, Semester, Section!
      const assignments = await Assignment.find({
        department: student.department,
        year: student.year,
        semester: student.semester,
        section: student.section,
      })
        .populate('subject', 'name code')
        .populate('faculty', 'name email')
        .sort({ dueDate: 1 });

      // Fetch student's submissions for these assignments
      const submissions = await AssignmentSubmission.find({
        student: student._id,
        assignment: { $in: assignments.map((a) => a._id) },
      });

      const submissionMap = {};
      submissions.forEach((sub) => {
        submissionMap[sub.assignment.toString()] = sub;
      });

      // Combine assignment with submission details
      const studentAssignments = assignments.map((assignment) => {
        const sub = submissionMap[assignment._id.toString()];
        let currentStatus = 'Pending';

        if (sub) {
          currentStatus = sub.status;
        } else if (new Date() > new Date(assignment.dueDate)) {
          currentStatus = 'Late';
        }

        return {
          ...assignment.toObject(),
          submission: sub || null,
          status: currentStatus,
        };
      });

      // Filter by status if requested
      const filtered = status
        ? studentAssignments.filter((a) => a.status.toLowerCase() === status.toLowerCase())
        : studentAssignments;

      return res.status(200).json({
        success: true,
        count: filtered.length,
        data: filtered,
      });
    }

    // If Faculty:
    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ user: req.user._id });
      let query = {};

      if (faculty) {
        query.faculty = faculty._id;
      }
      if (department) query.department = department;
      if (year) query.year = Number(year);
      if (semester) query.semester = Number(semester);
      if (section) query.section = section.toUpperCase();
      if (subject) query.subject = subject;

      const assignments = await Assignment.find(query)
        .populate('subject', 'name code')
        .populate('department', 'name code')
        .sort({ createdAt: -1 });

      // Attach submission stats
      const assignmentsWithStats = await Promise.all(
        assignments.map(async (a) => {
          const totalSubmissions = await AssignmentSubmission.countDocuments({ assignment: a._id });
          const evaluatedSubmissions = await AssignmentSubmission.countDocuments({
            assignment: a._id,
            status: 'Evaluated',
          });
          const totalEnrolled = await Student.countDocuments({
            department: a.department._id,
            year: a.year,
            semester: a.semester,
            section: a.section,
            isActive: true,
          });

          return {
            ...a.toObject(),
            stats: {
              totalEnrolled,
              totalSubmissions,
              evaluatedSubmissions,
              pendingEvaluation: totalSubmissions - evaluatedSubmissions,
            },
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: assignmentsWithStats.length,
        data: assignmentsWithStats,
      });
    }

    // Admin / HOD
    let query = {};
    if (req.user.role === 'hod') {
      const hod = await Faculty.findOne({ user: req.user._id });
      if (hod) query.department = hod.department;
    } else if (department) {
      query.department = department;
    }

    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (section) query.section = section.toUpperCase();
    if (subject) query.subject = subject;

    const assignments = await Assignment.find(query)
      .populate('subject', 'name code')
      .populate('department', 'name code')
      .populate('faculty', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single assignment details with student submission
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('department', 'name code')
      .populate('faculty', 'name email');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    let submission = null;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        submission = await AssignmentSubmission.findOne({
          assignment: assignment._id,
          student: student._id,
        }).populate('evaluatedBy', 'name');
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...assignment.toObject(),
        submission,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit an assignment (student)
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
exports.submitAssignment = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Verify student belongs to this class
    if (
      student.department.toString() !== assignment.department.toString() ||
      student.year !== assignment.year ||
      student.semester !== assignment.semester ||
      student.section !== assignment.section
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to submit this assignment',
      });
    }

    const isLate = new Date() > new Date(assignment.dueDate);
    const status = isLate ? 'Late' : 'Submitted';

    const submissionData = {
      assignment: assignment._id,
      student: student._id,
      submissionDate: new Date(),
      status,
      submissionNotes: req.body.submissionNotes || '',
    };

    if (req.file) {
      submissionData.attachment = `/uploads/${req.file.filename}`;
      submissionData.attachmentName = req.file.originalname;
    }

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { assignment: assignment._id, student: student._id },
      submissionData,
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: isLate ? 'Assignment submitted (Marked Late)' : 'Assignment submitted successfully',
      data: submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all submissions for an assignment (faculty view)
// @route   GET /api/assignments/:id/submissions
// @access  Private/Faculty,HOD,Admin
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Get all enrolled students in this target class
    const enrolledStudents = await Student.find({
      department: assignment.department,
      year: assignment.year,
      semester: assignment.semester,
      section: assignment.section,
      isActive: true,
    }).sort({ rollNumber: 1 });

    const submissions = await AssignmentSubmission.find({ assignment: assignment._id })
      .populate('evaluatedBy', 'name');

    const submissionMap = {};
    submissions.forEach((s) => {
      submissionMap[s.student.toString()] = s;
    });

    const isPastDue = new Date() > new Date(assignment.dueDate);

    const fullList = enrolledStudents.map((st) => {
      const sub = submissionMap[st._id.toString()];
      return {
        student: {
          _id: st._id,
          name: st.name,
          rollNumber: st.rollNumber,
          email: st.email,
          profilePhoto: st.profilePhoto,
        },
        submission: sub || null,
        status: sub ? sub.status : (isPastDue ? 'Not Submitted' : 'Pending'),
      };
    });

    res.status(200).json({
      success: true,
      count: fullList.length,
      assignment,
      data: fullList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Evaluate student submission (marks & feedback)
// @route   PUT /api/assignments/:assignmentId/submissions/:submissionId/evaluate
// @access  Private/Faculty,HOD,Admin
exports.evaluateSubmission = async (req, res) => {
  try {
    const { obtainedMarks, feedback } = req.body;
    const { assignmentId, submissionId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (obtainedMarks === undefined || Number(obtainedMarks) < 0) {
      return res.status(400).json({ success: false, message: 'Valid obtained marks are required' });
    }

    if (Number(obtainedMarks) > assignment.maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Obtained marks (${obtainedMarks}) cannot exceed maximum marks (${assignment.maxMarks})`,
      });
    }

    let facultyId = null;
    if (req.user.role === 'faculty' || req.user.role === 'hod') {
      const faculty = await Faculty.findOne({ user: req.user._id });
      if (faculty) facultyId = faculty._id;
    }

    const submission = await AssignmentSubmission.findByIdAndUpdate(
      submissionId,
      {
        obtainedMarks: Number(obtainedMarks),
        feedback: feedback || '',
        status: 'Evaluated',
        evaluatedBy: facultyId,
        evaluatedAt: new Date(),
      },
      { new: true }
    ).populate('student', 'name email user');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Send notification to student
    if (submission.student && submission.student.user) {
      await Notification.create({
        user: submission.student.user,
        title: `Assignment Evaluated: ${assignment.title}`,
        message: `Your assignment has been evaluated. Score: ${obtainedMarks}/${assignment.maxMarks}. Feedback: "${feedback || 'Good job!'}"`,
        type: 'assignment',
        link: '/student/assignments',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Submission evaluated successfully',
      data: submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Faculty,Admin
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    await AssignmentSubmission.deleteMany({ assignment: assignment._id });
    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assignment and related submissions deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
