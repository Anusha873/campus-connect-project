import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { BellRing, Calendar, Megaphone } from 'lucide-react';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await api.get('/announcements');
        if (res.data.success) {
          setAnnouncements(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const filtered = announcements.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campus & Class Bulletins</h2>
          <p className="text-xs text-slate-500 mt-1">
            Official circulars, department updates, and classroom notifications.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm self-start">
          {['all', 'college', 'department', 'class'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {type === 'all' ? 'All Bulletins' : `${type}`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching campus circulars..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No bulletins found"
          description="There are currently no active announcements matching your selection."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.type === 'college'
                        ? 'bg-purple-100 text-purple-800'
                        : item.type === 'department'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.type} Notice
                  </span>
                  <Badge variant={item.priority === 'high' ? 'danger' : 'default'}>
                    {item.priority} priority
                  </Badge>
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {item.message}
              </p>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Posted by: <strong className="text-slate-700">{item.creatorName || 'Administration'}</strong></span>
                {item.department && <span>Dept: {item.department?.name || item.department}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncements;
