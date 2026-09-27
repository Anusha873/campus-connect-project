import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  SendHorizontal,
  Calendar,
  FileText,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

const StudentLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Form states
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [document, setDocument] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves');
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Calculate day difference automatically
  useEffect(() => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffTime = e - s;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        setNumberOfDays(diffDays);
      }
    }
  }, [startDate, endDate]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });

    if (!reason || !startDate || !endDate) {
      setFormMsg({ type: 'error', text: 'Please fill all required leave details' });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('reason', reason);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('numberOfDays', numberOfDays);
      if (document) {
        formData.append('document', document);
      }

      const res = await api.post('/leaves', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setFormMsg({ type: 'success', text: 'Leave application submitted successfully!' });
        setTimeout(() => {
          setIsApplyModalOpen(false);
          setReason('');
          setStartDate('');
          setEndDate('');
          setDocument(null);
          setFormMsg({ type: '', text: '' });
          fetchLeaves();
        }, 1200);
      }
    } catch (err) {
      setFormMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit leave request',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Leave Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Apply for academic leave and monitor approval workflow by department heads.
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leaves History Table */}
      {loading ? (
        <LoadingSpinner message="Loading leave applications..." />
      ) : leaves.length === 0 ? (
        <EmptyState
          icon={SendHorizontal}
          title="No leave requests filed"
          description="You haven't submitted any leave applications this semester."
          actionLabel="Apply for Leave"
          onAction={() => setIsApplyModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">My Leave Applications</h3>
            <span className="text-xs text-slate-500">{leaves.length} Applications</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Leave Duration</th>
                  <th className="py-3.5 px-4 text-center">Days</th>
                  <th className="py-3.5 px-6">Reason & Statement</th>
                  <th className="py-3.5 px-4">Supporting Document</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6">Reviewer Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">
                        {new Date(l.startDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(l.endDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Filed: {new Date(l.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-indigo-700">
                      {l.numberOfDays} {l.numberOfDays === 1 ? 'day' : 'days'}
                    </td>
                    <td className="py-3.5 px-6 max-w-xs font-medium text-slate-800 leading-relaxed">
                      {l.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      {l.supportingDocument ? (
                        <a
                          href={l.supportingDocument}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 underline font-medium hover:text-indigo-800"
                        >
                          {l.documentName || 'Attachment'}
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge>{l.status}</Badge>
                    </td>
                    <td className="py-3.5 px-6">
                      {l.status !== 'Pending' ? (
                        <div>
                          <p className="text-xs text-slate-800 italic">
                            "{l.reviewComment || 'Processed'}"
                          </p>
                          <span className="text-[10px] text-slate-400">
                            By {l.reviewerName || 'Authority'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Student Leave"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          {formMsg.text && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                formMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {formMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{formMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Calculated Days
            </label>
            <input
              type="number"
              min={1}
              value={numberOfDays}
              onChange={(e) => setNumberOfDays(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Reason for Absence *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State legitimate purpose (medical emergency, sports meet, conference paper, etc.)..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Supporting Document (Optional PDF / Image)
            </label>
            <input
              type="file"
              onChange={(e) => setDocument(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentLeave;
