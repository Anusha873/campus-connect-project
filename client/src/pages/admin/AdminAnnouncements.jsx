import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import { BellRing, Plus, Calendar, Trash2 } from 'lucide-react';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('college');
  const [department, setDepartment] = useState('');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);
  const [postMsg, setPostMsg] = useState({ type: '', text: '' });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success && res.data.data.length > 0) {
          setDepartments(res.data.data);
          setDepartment(res.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setPostMsg({ type: '', text: '' });

    if (!title || !message) {
      setPostMsg({ type: 'error', text: 'Title and message are required' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/announcements', {
        title,
        message,
        type,
        department: type === 'department' ? department : null,
        priority,
      });

      if (res.data.success) {
        setPostMsg({ type: 'success', text: 'Bulletin published successfully!' });
        setTimeout(() => {
          setIsModalOpen(false);
          setTitle('');
          setMessage('');
          fetchAnnouncements();
        }, 1000);
      }
    } catch (err) {
      setPostMsg({
        type: 'error',
        text: err.response?.data?.message || 'Publishing failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">University Bulletins & Circulars</h2>
          <p className="text-xs text-slate-500 mt-1">
            Publish executive college notifications, holiday circulars, and departmental memos.
          </p>
        </div>

        <button
          onClick={() => {
            setPostMsg({ type: '', text: '' });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Bulletin</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading bulletins..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No bulletins posted"
          description="Publish a university-wide or department bulletin."
          actionLabel="Publish Bulletin"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.type === 'college'
                        ? 'bg-purple-100 text-purple-800'
                        : item.type === 'department'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.type} Circular
                  </span>
                  <Badge variant={item.priority === 'high' ? 'danger' : 'default'}>
                    {item.priority}
                  </Badge>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-rose-600 hover:text-rose-800"
                    title="Delete notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {item.message}
              </p>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>By: <strong>{item.creatorName || 'Administration'}</strong></span>
                {item.department && <span>Dept: {item.department?.code}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Executive Circular"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
          {postMsg.text && (
            <Alert
              type={postMsg.type === 'success' ? 'success' : 'error'}
              message={postMsg.text}
            />
          )}

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Bulletin Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule of University End Semester Examinations"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Notice Text / Memo *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Official text of circular..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Scope</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="college">College-Wide</option>
                <option value="department">Department-Specific</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent Alert</option>
              </select>
            </div>
          </div>

          {type === 'department' && (
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Target Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Bulletin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAnnouncements;
