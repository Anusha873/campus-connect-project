const mongoose = require('mongoose');

const examinationResultSchema = new mongoose.Schema(
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
    examName: {
      type: String,
      required: true, // e.g. 'Semester End Examinations Nov 2025'
      trim: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    obtainedMarks: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          return value <= this.maxMarks;
        },
        message: 'Obtained marks cannot exceed maximum marks',
      },
    },
    grade: {
      type: String, // 'O', 'A+', 'A', 'B+', 'B', 'C', 'F'
      default: '',
    },
    gradePoint: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass',
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
  },
  {
    timestamps: true,
  }
);

examinationResultSchema.index(
  { student: 1, subject: 1, examName: 1, semester: 1 },
  { unique: true }
);

module.exports = mongoose.model('ExaminationResult', examinationResultSchema);
