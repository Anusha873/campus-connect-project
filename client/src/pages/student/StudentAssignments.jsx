import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  FileText,
  Download,
  Upload,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileCheck2,
  Paperclip,
} from 'lucide-react';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Submit Modal state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments');
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionFile(null);
    setSubmissionNotes(assignment.submission?.submissionNotes || '');
    setSubmitMessage({ type: '', text: '' });
    setIsSubmitModalOpen(true);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submissionFile && !submissionNotes) {
      setSubmitMessage({
        type: 'error',
        text: 'Please upload a solution file or provide your submission text notes.',
      });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      if (submissionFile) {
        formData.append('attachment', submissionFile);
      }
      formData.append('submissionNotes', submissionNotes);

      const res = await api.post(`/assignments/${selectedAssignment._id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSubmitMessage({ type: 'success', text: res.data.message });
        setTimeout(() => {
          setIsSubmitModalOpen(false);
          fetchAssignments();
        }, 1200);
      }
    } catch (err) {
      setSubmitMessage({
        type: 'error',
        text: err.response?.data?.message || 'Submission failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Class Assignments</h2>
          <p className="text-xs text-slate-500 mt-1">
            Displaying tasks filtered exclusively to your Department, Year, Semester & Section.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm self-start">
          {['all', 'pending', 'submitted', 'evaluated'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <LoadingSpinner message="Fetching your class assignments..." />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments found"
          description={
            statusFilter === 'all'
              ? 'No assignments currently targeted to your section.'
              : `No assignments matching '${statusFilter}' status.`
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((assignment) => {
            const isEvaluated = assignment.status === 'Evaluated';
            const isPastDue = new Date() > new Date(assignment.dueDate);

            return (
              <div
                key={assignment._id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Subject and Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {assignment.subject?.code} - {assignment.subject?.name}
                    </span>
                    <Badge>{assignment.status}</Badge>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {assignment.title}
                  </h3>
                  <p className="text-xs text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                    {assignment.description}
                  </p>

                  {/* Faculty Attachment if present */}
                  {assignment.attachment && (
                    <div className="mb-4">
                      <a
                        href={assignment.attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="truncate max-w-[200px]">
                          {assignment.attachmentName || 'Faculty Problem Sheet'}
                        </span>
                      </a>
                    </div>
                  )}

                  {/* Evaluation Details Card if Evaluated */}
                  {isEvaluated && assignment.submission && (
                    <div className="mb-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900">
                          Marks Awarded:
                        </span>
                        <span className="text-sm font-extrabold text-emerald-700">
                          {assignment.submission.obtainedMarks} / {assignment.maxMarks}
                        </span>
                      </div>
                      {assignment.submission.feedback && (
                        <p className="text-xs text-emerald-800 italic pt-1 border-t border-emerald-200/60">
                          "{assignment.submission.feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Metadata & Submission Action */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div className="space-y-1 text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div>Faculty: {assignment.faculty?.name || 'Assigned Instructor'}</div>
                  </div>

                  <button
                    onClick={() => openSubmitModal(assignment)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 ${
                      isEvaluated
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : assignment.status === 'Submitted'
                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        : isPastDue
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {isEvaluated
                        ? 'Review Submission'
                        : assignment.status === 'Submitted'
                        ? 'Update Submission'
                        : 'Submit Solution'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Assignment Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={`Submit Solution: ${selectedAssignment?.title}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          {submitMessage.text && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                submitMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {submitMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{submitMessage.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload Document / Code / Archive (PDF, Word, Zip)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                id="student-file-upload"
                className="hidden"
                onChange={(e) => setSubmissionFile(e.target.files[0])}
              />
              <label
                htmlFor="student-file-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-1"
              >
                <Upload className="w-6 h-6 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-700">
                  {submissionFile ? submissionFile.name : 'Choose File to Upload'}
                </span>
                <span className="text-[11px] text-slate-400">PDF, DOC, ZIP up to 25MB</span>
              </label>
            </div>
            {selectedAssignment?.submission?.attachment && !submissionFile && (
              <p className="text-[11px] text-slate-500 mt-1">
                Previously uploaded:{' '}
                <a
                  href={selectedAssignment.submission.attachment}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline font-medium"
                >
                  {selectedAssignment.submission.attachmentName || 'Download current file'}
                </a>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Submission Comments / Explanations
            </label>
            <textarea
              rows={3}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Add any student notes, github repo links, or key explanations for your instructor..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all"
            >
              {submitting ? 'Uploading Submission...' : 'Confirm Submission'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentAssignments;
