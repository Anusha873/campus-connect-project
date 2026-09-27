const Timetable = require('../models/Timetable');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// @desc    Get timetable grid for class/section or logged-in student/faculty
// @route   GET /api/timetable
// @access  Private
exports.getTimetable = async (req, res) => {
  try {
    const { department, year, semester, section, day } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student record not found' });
      }
      query = {
        department: student.department,
        year: student.year,
        semester: student.semester,
        section: student.section,
      };
    } else if (req.user.role === 'faculty') {
      // Return faculty's assigned timetable entries unless specific class requested
      if (!department && !section) {
        const faculty = await Faculty.findOne({ user: req.user._id });
        if (faculty) {
          query.faculty = faculty._id;
        }
      } else {
        if (department) query.department = department;
        if (year) query.year = Number(year);
        if (semester) query.semester = Number(semester);
        if (section) query.section = section.toUpperCase();
      }
    } else {
      // Admin or HOD
      if (department) query.department = department;
      if (year) query.year = Number(year);
      if (semester) query.semester = Number(semester);
      if (section) query.section = section.toUpperCase();
    }

    if (day) query.day = day;

    const entries = await Timetable.find(query)
      .populate('subject', 'name code')
      .populate('faculty', 'name facultyId')
      .populate('department', 'name code')
      .sort({ period: 1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or update timetable slot
// @route   POST /api/timetable
// @access  Private/Admin,HOD
exports.upsertTimetableSlot = async (req, res) => {
  try {
    const {
      department,
      year,
      semester,
      section,
      day,
      period,
      startTime,
      endTime,
      subject,
      faculty,
      roomNumber,
    } = req.body;

    if (
      !department ||
      !year ||
      !semester ||
      !section ||
      !day ||
      !period ||
      !startTime ||
      !endTime ||
      !subject ||
      !faculty ||
      !roomNumber
    ) {
      return res.status(400).json({
        success: false,
        message: 'All timetable slot details are required',
      });
    }

    // Upsert slot
    const slot = await Timetable.findOneAndUpdate(
      {
        department,
        year: Number(year),
        semester: Number(semester),
        section: section.toUpperCase(),
        day,
        period: Number(period),
      },
      {
        department,
        year: Number(year),
        semester: Number(semester),
        section: section.toUpperCase(),
        day,
        period: Number(period),
        startTime,
        endTime,
        subject,
        faculty,
        roomNumber,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .populate('subject', 'name code')
      .populate('faculty', 'name')
      .populate('department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Timetable slot saved successfully',
      data: slot,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a timetable slot
// @route   DELETE /api/timetable/:id
// @access  Private/Admin,HOD
exports.deleteTimetableSlot = async (req, res) => {
  try {
    const slot = await Timetable.findByIdAndDelete(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Timetable slot removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
