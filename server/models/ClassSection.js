const mongoose = require('mongoose');

const classSectionSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1,
      max: 4,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      uppercase: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      default: '2025-2026',
    },
    capacity: {
      type: Number,
      default: 60,
    },
  },
  {
    timestamps: true,
  }
);

classSectionSchema.index(
  { department: 1, year: 1, semester: 1, section: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model('ClassSection', classSectionSchema);
