const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    credits: {
      type: Number,
      default: 3,
    },
    type: {
      type: String,
      enum: ['theory', 'practical', 'elective'],
      default: 'theory',
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({ code: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
