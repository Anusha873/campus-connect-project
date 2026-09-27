import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notification Center</h2>
          <p className="text-xs text-slate-500 mt-1">
            System alerts, assignment evaluations, attendance notifications, and messages.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-white border border-slate-200 text-indigo-600 hover:bg-slate-50 text-xs font-semibold rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving your alerts..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are completely caught up! No unread notifications found."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                !item.isRead ? 'bg-indigo-50/25' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  {item.message}
                </p>
                <div className="flex items-center space-x-3 pt-1 text-[11px] text-slate-400">
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  {item.link && (
                    <Link
                      to={item.link}
                      className="font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                    >
                      <span>Take Action</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  )}
                </div>
              </div>

              {!item.isRead && (
                <button
                  onClick={() => handleMarkRead(item._id)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
