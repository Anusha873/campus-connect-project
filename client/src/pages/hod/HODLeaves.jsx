import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import { SendHorizontal, CheckCircle2, XCircle, Download, User } from 'lucide-react';

const HODLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Review Modal State
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves');
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const openReviewModal = (leave, initialStatus) => {
    setSelectedLeave(leave);
    setReviewStatus(initialStatus);
    setReviewComment('');
    setReviewMsg({ type: '', text: '' });
  };

  const handleProcessReview = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    try {
      setSubmitting(true);
      const res = await api.put(`/leaves/${selectedLeave._id}/status`, {
        status: reviewStatus,
        reviewComment,
      });

      if (res.data.success) {
        setReviewMsg({ type: 'success', text: `Leave application ${reviewStatus.toLowerCase()} successfully!` });
        setTimeout(() => {
          setSelectedLeave(null);
          fetchLeaves();
        }, 1000);
      }
    } catch (err) {
      setReviewMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update leave status',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = leaves.filter((l) => {
    if (filterStatus === 'all') return true;
    return l.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Leave Applications</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review absence requests from department students and provide administrative approvals.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm self-start">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching department leave applications..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SendHorizontal}
          title="No applications found"
          description="There are currently no student leave requests matching your filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Dates</th>
                  <th className="py-3.5 px-6">Reason Statement</th>
                  <th className="py-3.5 px-4">Document</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-900 block">{item.student?.name}</span>
                      <span className="text-[11px] text-slate-400">{item.student?.rollNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      Y{item.student?.year} S{item.student?.semester} - {item.student?.section}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">
                        {new Date(item.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
                        {new Date(item.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[11px] text-indigo-600 font-semibold">
                        {item.numberOfDays} Days
                      </span>
                    </td>
                    <td className="py-3.5 px-6 max-w-xs truncate font-medium">
                      {item.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.supportingDocument ? (
                        <a
                          href={item.supportingDocument}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 underline font-semibold hover:text-indigo-800 inline-flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View Doc</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge>{item.status}</Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {item.status === 'Pending' ? (
                        <div className="inline-flex space-x-2">
                          <button
                            onClick={() => openReviewModal(item, 'Approved')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openReviewModal(item, 'Rejected')}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openReviewModal(item, item.status)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                        >
                          Modify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedLeave && (
        <Modal
          isOpen={!!selectedLeave}
          onClose={() => setSelectedLeave(null)}
          title={`Review Leave: ${selectedLeave.student?.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleProcessReview} className="space-y-4 text-xs">
            {reviewMsg.text && (
              <Alert
                type={reviewMsg.type === 'success' ? 'success' : 'error'}
                message={reviewMsg.text}
              />
            )}

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-500 block">Reason for absence:</span>
              <p className="font-semibold text-slate-800">{selectedLeave.reason}</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Decision Action *
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Approved">Approve Application</option>
                <option value="Rejected">Reject Application</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                HOD Comments & Official Remarks
              </label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Enter formal note to student (e.g. Approved. Ensure lab manuals are completed upon return.)..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all"
              >
                {submitting ? 'Updating...' : 'Submit Decision'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default HODLeaves;
