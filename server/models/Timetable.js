const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      required: true,
      uppercase: true,
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    period: {
      type: Number,
      required: true,
    },
    startTime: {
      type: String,
      required: true, // e.g., '09:00'
    },
    endTime: {
      type: String,
      required: true, // e.g., '10:00'
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
    },
    roomNumber: {
      type: String,
      required: true, // e.g., 'Lab 302' or 'Room 101'
    },
  },
  {
    timestamps: true,
  }
);

// Prevent timetable clash for the same class/section, day and period
timetableSchema.index(
  { department: 1, year: 1, semester: 1, section: 1, day: 1, period: 1 },
  { unique: true }
);

module.exports = mongoose.model('Timetable', timetableSchema);
