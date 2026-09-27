import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Alert from '../../components/common/Alert';
import { UserCircle, Mail, Phone, Building2, BookOpen, KeyRound } from 'lucide-react';

const FacultyProfile = () => {
  const { user, updateUser } = useAuth();
  const profile = user?.profile;

  const [phone, setPhone] = useState(profile?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      setLoading(true);
      const res = await api.put('/auth/profile', { phone });
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Contact number updated successfully!' });
        updateUser({ profile: { ...profile, phone } });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      setLoading(true);
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Faculty Profile</h2>
        <p className="text-xs text-slate-500 mt-1">
          Institutional profile details and system access credentials.
        </p>
      </div>

      {msg.text && <Alert type={msg.type === 'success' ? 'success' : 'error'} message={msg.text} />}

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex items-center space-x-5">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md">
          {profile?.name ? profile.name.charAt(0) : 'F'}
        </div>
        <div className="space-y-1">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
            {profile?.designation}
          </span>
          <h3 className="text-2xl font-bold text-slate-900">{profile?.name}</h3>
          <p className="text-xs text-slate-500">
            Faculty ID: <span className="font-semibold text-slate-700">{profile?.facultyId}</span> • Department of {profile?.department?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
            Contact Information
          </h4>
          <form onSubmit={handleUpdate} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Email</label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm disabled:opacity-50"
            >
              Update Phone
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
            Security & Password
          </h4>
          <form onSubmit={handlePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm disabled:opacity-50"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
