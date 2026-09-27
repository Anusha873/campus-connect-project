const mongoose = require('mongoose');

const internalMarksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
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
    examType: {
      type: String,
      required: true, // e.g. 'Internal Assessment 1', 'Internal Assessment 2', 'Mid Term', 'Assignment Mark'
      trim: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: [1, 'Maximum marks must be at least 1'],
    },
    obtainedMarks: {
      type: Number,
      required: true,
      min: [0, 'Obtained marks cannot be negative'],
      validate: {
        validator: function (value) {
          return value <= this.maxMarks;
        },
        message: 'Obtained marks cannot exceed maximum marks',
      },
    },
    semester: {
      type: Number,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      default: '2025-2026',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

internalMarksSchema.index(
  { student: 1, subject: 1, examType: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model('InternalMarks', internalMarksSchema);
