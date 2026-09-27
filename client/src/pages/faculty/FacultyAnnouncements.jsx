import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import { BellRing, Plus, Calendar, Trash2 } from 'lucide-react';

const FacultyAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('class');
  const [department, setDepartment] = useState('');
  const [targetYear, setTargetYear] = useState('3');
  const [targetSemester, setTargetSemester] = useState('5');
  const [targetSection, setTargetSection] = useState('A');
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
        department,
        targetYear: type === 'class' ? Number(targetYear) : null,
        targetSemester: type === 'class' ? Number(targetSemester) : null,
        targetSection: type === 'class' ? targetSection : null,
        priority,
      });

      if (res.data.success) {
        setPostMsg({ type: 'success', text: 'Announcement published to target students!' });
        setTimeout(() => {
          setIsModalOpen(false);
          setTitle('');
          setMessage('');
          setPostMsg({ type: '', text: '' });
          fetchAnnouncements();
        }, 1200);
      }
    } catch (err) {
      setPostMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to publish announcement',
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
          <h2 className="text-xl font-bold text-slate-900">Faculty Announcements</h2>
          <p className="text-xs text-slate-500 mt-1">
            Publish circulars directly to your department or targeted classroom sections.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading bulletins..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No notices published"
          description="Create your first classroom announcement for your students."
          actionLabel="Publish Notice"
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
                      item.type === 'class'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.type} Notice
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

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>By: <strong>{item.creatorName}</strong></span>
                {item.targetSection && (
                  <span>Target: Year {item.targetYear} Sec {item.targetSection}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Class / Department Notice"
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
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule Change for Database Lab Session"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Notice Message *
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detailed instructions or notice description..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Scope</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="class">Class Specific</option>
                <option value="department">Department Wide</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {type === 'class' && (
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Year</label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Sem</label>
                <select
                  value={targetSemester}
                  onChange={(e) => setTargetSemester(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Sem {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Sec</label>
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                </select>
              </div>
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
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all"
            >
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyAnnouncements;
