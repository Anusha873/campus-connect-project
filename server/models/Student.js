const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll Number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Full Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of Birth is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      default: 'B.Tech',
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
    admissionYear: {
      type: Number,
      required: [true, 'Admission Year is required'],
      default: 2023,
    },
    address: {
      type: String,
      default: '',
    },
    parentName: {
      type: String,
      default: 'Guardian',
      trim: true,
    },
    parentPhone: {
      type: String,
      default: '',
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);
