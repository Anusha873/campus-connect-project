const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Announcement message is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creatorName: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['admin', 'hod', 'faculty'],
      required: true,
    },
    type: {
      type: String,
      enum: ['college', 'department', 'class'],
      default: 'college',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    targetYear: {
      type: Number,
      default: null,
    },
    targetSemester: {
      type: Number,
      default: null,
    },
    targetSection: {
      type: String,
      default: null,
      uppercase: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ type: 1, department: 1, targetYear: 1, targetSection: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
