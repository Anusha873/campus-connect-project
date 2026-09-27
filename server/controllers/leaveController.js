const LeaveRequest = require('../models/LeaveRequest');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');

// @desc    Apply for student leave
// @route   POST /api/leaves
// @access  Private/Student
exports.applyLeave = async (req, res) => {
  try {
    const { reason, startDate, endDate, numberOfDays } = req.body;

    if (!reason || !startDate || !endDate || !numberOfDays) {
      return res.status(400).json({
        success: false,
        message: 'Reason, start date, end date, and number of days are required',
      });
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const leave = await LeaveRequest.create({
      student: student._id,
      department: student.department,
      reason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      numberOfDays: Number(numberOfDays),
      supportingDocument: req.file ? `/uploads/${req.file.filename}` : '',
      documentName: req.file ? req.file.originalname : '',
      status: 'Pending',
    });

    // Notify HOD of the department
    const hod = await Faculty.findOne({ department: student.department, isHOD: true });
    if (hod && hod.user) {
      await Notification.create({
        user: hod.user,
        title: `New Leave Request from ${student.name}`,
        message: `${student.name} (${student.rollNumber}) applied for ${numberOfDays} days leave from ${new Date(startDate).toLocaleDateString()}.`,
        type: 'leave',
        link: '/hod/leaves',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leave requests (scoped by role)
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = async (req, res) => {
  try {
    const { status, department } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }
      query.student = student._id;
    } else if (req.user.role === 'hod') {
      const hod = await Faculty.findOne({ user: req.user._id });
      if (hod) {
        query.department = hod.department;
      }
    } else if (department) {
      query.department = department;
    }

    if (status) query.status = status;

    const leaves = await LeaveRequest.find(query)
      .populate('student', 'name rollNumber studentId year semester section profilePhoto')
      .populate('department', 'name code')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Review leave request (Approve/Reject)
// @route   PUT /api/leaves/:id/status
// @access  Private/HOD,Admin,Faculty
exports.reviewLeave = async (req, res) => {
  try {
    const { status, reviewComment } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected',
      });
    }

    let reviewerName = 'College Authority';
    if (req.user.role === 'faculty' || req.user.role === 'hod') {
      const fac = await Faculty.findOne({ user: req.user._id });
      if (fac) reviewerName = fac.name;
    } else if (req.user.role === 'admin') {
      reviewerName = 'Administrator';
    }

    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewComment: reviewComment || '',
        reviewedBy: req.user._id,
        reviewerName,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate('student', 'name email user');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Send notification to the student
    if (leave.student && leave.student.user) {
      await Notification.create({
        user: leave.student.user,
        title: `Leave Request ${status}`,
        message: `Your leave application has been ${status.toLowerCase()} by ${reviewerName}. Note: "${reviewComment || 'Processed'}"`,
        type: 'leave',
        link: '/student/leave',
      });
    }

    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
