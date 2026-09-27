import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import {
  FileText,
  Plus,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  Eye,
  Trash2,
  Upload,
  Award,
} from 'lucide-react';

const FacultyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Assignment Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newYear, setNewYear] = useState('3');
  const [newSem, setNewSem] = useState('5');
  const [newSec, setNewSec] = useState('A');
  const [newSubject, setNewSubject] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState('100');
  const [newAttachment, setNewAttachment] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  // Submissions Modal State
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Grade Modal State
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [gradeMarks, setGradeMarks] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [gradeMsg, setGradeMsg] = useState({ type: '', text: '' });

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments');
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    const fetchMetadata = async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          api.get('/departments'),
          api.get('/subjects'),
        ]);
        if (dRes.data.success && dRes.data.data.length > 0) {
          setDepartments(dRes.data.data);
          setNewDept(dRes.data.data[0]._id);
        }
        if (sRes.data.success && sRes.data.data.length > 0) {
          setSubjects(sRes.data.data);
          setNewSubject(sRes.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setCreateMsg({ type: '', text: '' });

    if (!newTitle || !newDesc || !newDept || !newSubject || !newDueDate) {
      setCreateMsg({ type: 'error', text: 'Please fill all required fields.' });
      return;
    }

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('description', newDesc);
      formData.append('department', newDept);
      formData.append('year', newYear);
      formData.append('semester', newSem);
      formData.append('section', newSec);
      formData.append('subject', newSubject);
      formData.append('dueDate', newDueDate);
      formData.append('maxMarks', newMaxMarks);
      if (newAttachment) {
        formData.append('attachment', newAttachment);
      }

      const res = await api.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setCreateMsg({ type: 'success', text: 'Assignment published successfully!' });
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setNewTitle('');
          setNewDesc('');
          setNewAttachment(null);
          setCreateMsg({ type: '', text: '' });
          fetchAssignments();
        }, 1200);
      }
    } catch (err) {
      setCreateMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create assignment',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleOpenSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionsModalOpen(true);
    try {
      setSubmissionsLoading(true);
      const res = await api.get(`/assignments/${assignment._id}/submissions`);
      if (res.data.success) {
        setSubmissionsList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleOpenGrade = (item) => {
    setActiveSubmission(item);
    setGradeMarks(item.submission?.obtainedMarks ?? '');
    setGradeFeedback(item.submission?.feedback || '');
    setGradeMsg({ type: '', text: '' });
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!activeSubmission?.submission?._id) return;

    if (Number(gradeMarks) > selectedAssignment.maxMarks) {
      setGradeMsg({
        type: 'error',
        text: `Marks cannot exceed assignment maximum (${selectedAssignment.maxMarks})`,
      });
      return;
    }

    try {
      setGrading(true);
      const res = await api.put(
        `/assignments/${selectedAssignment._id}/submissions/${activeSubmission.submission._id}/evaluate`,
        {
          obtainedMarks: Number(gradeMarks),
          feedback: gradeFeedback,
        }
      );

      if (res.data.success) {
        setGradeMsg({ type: 'success', text: 'Grade evaluated and recorded!' });
        setTimeout(() => {
          setActiveSubmission(null);
          handleOpenSubmissions(selectedAssignment);
          fetchAssignments();
        }, 1000);
      }
    } catch (err) {
      setGradeMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to record evaluation',
      });
    } finally {
      setGrading(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment and its submissions?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Assignments Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Publish targeted coursework, receive student submissions, and record marks with feedback.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create Targeted Assignment</span>
        </button>
      </div>

      {/* Assignments List */}
      {loading ? (
        <LoadingSpinner message="Loading course assignments..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments created yet"
          description="Create your first targeted assignment for a specific class and section."
          actionLabel="Create Assignment"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {assignment.subject?.code} • {assignment.subject?.name}
                  </span>
                  <span className="text-xs font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                    {assignment.department?.code} Y{assignment.year} S{assignment.semester} - Sec {assignment.section}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                  {assignment.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {assignment.description}
                </p>

                {/* Submissions Stats Pill */}
                {assignment.stats && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block">Submissions:</span>
                      <span className="font-bold text-slate-900">
                        {assignment.stats.totalSubmissions} / {assignment.stats.totalEnrolled} Enrolled
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Evaluated:</span>
                      <span className="font-bold text-emerald-600">
                        {assignment.stats.evaluatedSubmissions} Evaluated
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pending Grading:</span>
                      <span className="font-bold text-amber-600">
                        {assignment.stats.pendingEvaluation}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500 space-y-0.5">
                  <div>Due: {new Date(assignment.dueDate).toLocaleDateString()}</div>
                  <div>Max Marks: {assignment.maxMarks}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenSubmissions(assignment)}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Submissions</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAssignment(assignment._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Targeted Assignment"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
          {createMsg.text && (
            <Alert
              type={createMsg.type === 'success' ? 'success' : 'error'}
              message={createMsg.text}
            />
          )}

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Distributed Database Architecture & Sharding Analysis"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Problem Description & Instructions *
            </label>
            <textarea
              rows={3}
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Detail assignment questions, submission guidelines, format expectations..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Target Audience Controls (Targeting Dept + Year + Sem + Section) */}
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
            <span className="font-bold text-indigo-900 block text-xs">
              Target Audience Class (Students will only see this in their dashboard)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Year</label>
                <select
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Semester</label>
                <select
                  value={newSem}
                  onChange={(e) => setNewSem(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Sem {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Section</label>
                <select
                  value={newSec}
                  onChange={(e) => setNewSec(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Subject *
              </label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-medium"
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Maximum Marks *
              </label>
              <input
                type="number"
                min={1}
                required
                value={newMaxMarks}
                onChange={(e) => setNewMaxMarks(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assignment Problem Sheet (Optional PDF/Doc)
            </label>
            <input
              type="file"
              onChange={(e) => setNewAttachment(e.target.files[0])}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 font-semibold"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all"
            >
              {creating ? 'Publishing...' : 'Publish to Target Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submissions List Modal */}
      <Modal
        isOpen={isSubmissionsModalOpen}
        onClose={() => setIsSubmissionsModalOpen(false)}
        title={`Student Submissions: ${selectedAssignment?.title}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Target: <strong>{selectedAssignment?.department?.code} Y{selectedAssignment?.year} S{selectedAssignment?.semester} Sec {selectedAssignment?.section}</strong>
            </span>
            <span>
              Due Date: <strong>{new Date(selectedAssignment?.dueDate).toLocaleDateString()}</strong>
            </span>
            <span>
              Max Marks: <strong>{selectedAssignment?.maxMarks}</strong>
            </span>
          </div>

          {submissionsLoading ? (
            <LoadingSpinner message="Loading student submissions..." />
          ) : submissionsList.length === 0 ? (
            <p className="text-center text-xs text-slate-500 p-8">
              No students enrolled in this target class.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider sticky top-0 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Submitted File</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Marks</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {submissionsList.map((item) => (
                    <tr key={item.student._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{item.student.name}</span>
                        <span className="text-[11px] text-slate-400">{item.student.rollNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        {item.submission?.attachment ? (
                          <a
                            href={item.submission.attachment}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 font-semibold underline inline-flex items-center space-x-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[140px]">
                              {item.submission.attachmentName || 'View Solution'}
                            </span>
                          </a>
                        ) : (
                          <span className="text-slate-400">No file</span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-600">
                        {item.submission?.submissionNotes || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge>{item.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {item.submission?.obtainedMarks !== null &&
                        item.submission?.obtainedMarks !== undefined
                          ? `${item.submission.obtainedMarks} / ${selectedAssignment.maxMarks}`
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.submission ? (
                          <button
                            onClick={() => handleOpenGrade(item)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                          >
                            {item.submission.status === 'Evaluated' ? 'Edit Grade' : 'Grade'}
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Not Submitted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* Grade & Feedback Modal */}
      {activeSubmission && (
        <Modal
          isOpen={!!activeSubmission}
          onClose={() => setActiveSubmission(null)}
          title={`Grade Submission: ${activeSubmission.student.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
            {gradeMsg.text && (
              <Alert
                type={gradeMsg.type === 'success' ? 'success' : 'error'}
                message={gradeMsg.text}
              />
            )}

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Marks Obtained (Out of {selectedAssignment?.maxMarks}) *
              </label>
              <input
                type="number"
                min={0}
                max={selectedAssignment?.maxMarks}
                required
                value={gradeMarks}
                onChange={(e) => setGradeMarks(e.target.value)}
                placeholder="Enter score"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Instructor Feedback & Remarks
              </label>
              <textarea
                rows={3}
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="Provide constructive feedback for student..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveSubmission(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={grading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all"
              >
                {grading ? 'Saving...' : 'Save Grade'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FacultyAssignments;
