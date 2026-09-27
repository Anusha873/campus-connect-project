const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    attachment: {
      type: String,
      default: '',
    },
    attachmentName: {
      type: String,
      default: '',
    },
    submissionNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Late', 'Evaluated'],
      default: 'Submitted',
    },
    obtainedMarks: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      default: null,
    },
    evaluatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One submission per student per assignment
assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
