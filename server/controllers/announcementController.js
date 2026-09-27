const Announcement = require('../models/Announcement');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private/Admin,HOD,Faculty
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, type, department, targetYear, targetSemester, targetSection, priority, expiryDate } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    let creatorName = req.user.email;
    if (req.user.role === 'faculty' || req.user.role === 'hod') {
      const fac = await Faculty.findOne({ user: req.user._id });
      if (fac) creatorName = fac.name;
    } else if (req.user.role === 'admin') {
      creatorName = 'College Administration';
    }

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: req.user._id,
      creatorName,
      role: req.user.role,
      type: type || 'college',
      department: department || null,
      targetYear: targetYear ? Number(targetYear) : null,
      targetSemester: targetSemester ? Number(targetSemester) : null,
      targetSection: targetSection ? targetSection.toUpperCase() : null,
      priority: priority || 'normal',
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    // Notify applicable users
    let notifyQuery = { isActive: true };
    if (announcement.type === 'department' && announcement.department) {
      // Find students and faculty of this department
      const students = await Student.find({ department: announcement.department, isActive: true });
      const facs = await Faculty.find({ department: announcement.department, isActive: true });
      const targetUserIds = [...students.map((s) => s.user), ...facs.map((f) => f.user)];

      const notifications = targetUserIds.map((uId) => ({
        user: uId,
        title: `Department Announcement: ${title}`,
        message: message.slice(0, 120) + (message.length > 120 ? '...' : ''),
        type: 'announcement',
        link: '/announcements',
      }));
      if (notifications.length > 0) await Notification.insertMany(notifications);
    } else if (announcement.type === 'class' && announcement.department) {
      let stQuery = { department: announcement.department, isActive: true };
      if (announcement.targetYear) stQuery.year = announcement.targetYear;
      if (announcement.targetSection) stQuery.section = announcement.targetSection;

      const students = await Student.find(stQuery);
      const notifications = students.map((s) => ({
        user: s.user,
        title: `Class Announcement: ${title}`,
        message: message.slice(0, 120) + (message.length > 120 ? '...' : ''),
        type: 'announcement',
        link: '/announcements',
      }));
      if (notifications.length > 0) await Notification.insertMany(notifications);
    } else {
      // College-wide: notify all active students & faculty
      const allUsers = await User.find({ isActive: true, role: { $in: ['student', 'faculty', 'hod'] } });
      const notifications = allUsers.map((u) => ({
        user: u._id,
        title: `Campus Announcement: ${title}`,
        message: message.slice(0, 120) + (message.length > 120 ? '...' : ''),
        type: 'announcement',
        link: '/announcements',
      }));
      if (notifications.length > 0) await Notification.insertMany(notifications);
    }

    const populated = await Announcement.findById(announcement._id).populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get announcements applicable to the logged-in user
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      // Applicable to student:
      // 1. College-wide announcements
      // 2. Department-wide announcements for student's department
      // 3. Class-specific announcements matching department AND year AND section
      query.$or = [
        { type: 'college' },
        { type: 'department', department: student.department },
        {
          type: 'class',
          department: student.department,
          $or: [
            { targetYear: null, targetSection: null },
            { targetYear: student.year, targetSection: null },
            { targetYear: student.year, targetSection: student.section },
          ],
        },
      ];
    } else if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ user: req.user._id });
      query.$or = [
        { type: 'college' },
        ...(faculty ? [{ department: faculty.department }] : []),
      ];
    } else if (req.user.role === 'hod') {
      const hod = await Faculty.findOne({ user: req.user._id });
      query.$or = [
        { type: 'college' },
        ...(hod ? [{ department: hod.department }] : []),
      ];
    }
    // Admin sees all

    const announcements = await Announcement.find(query)
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin,HOD
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
