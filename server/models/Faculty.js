const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    facultyId: {
      type: String,
      required: [true, 'Faculty ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Faculty name is required'],
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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      default: 'Assistant Professor',
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    assignedClasses: [
      {
        department: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Department',
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
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
        },
      },
    ],
    profilePhoto: {
      type: String,
      default: '',
    },
    isHOD: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model('Faculty', facultySchema);
