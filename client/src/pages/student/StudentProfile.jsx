import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Building2,
  MapPin,
  Users,
  Shield,
  Upload,
  CheckCircle,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const profile = user?.profile;

  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState({ type: '', text: '' });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    setSaveMsg({ type: '', text: '' });
    try {
      setSaving(true);
      const res = await api.put('/auth/profile', { phone, address });
      if (res.data.success) {
        setSaveMsg({ type: 'success', text: 'Contact details updated successfully!' });
        updateUser({ profile: { ...profile, phone, address } });
      }
    } catch (err) {
      setSaveMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile details',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    try {
      setPwSaving(true);
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        setPwMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPwMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Student Profile</h2>
        <p className="text-xs text-slate-500 mt-1">
          Your official institutional registration information and personal credentials.
        </p>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-md flex-shrink-0">
          {profile?.name ? profile.name.charAt(0) : 'S'}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="text-2xl font-black text-slate-900">{profile?.name}</h3>
              <p className="text-sm font-semibold text-indigo-600">
                Roll No: {profile?.rollNumber} • ID: {profile?.studentId}
              </p>
            </div>
            <span className="self-center md:self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Enrolled
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs text-slate-600">
            <span className="flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile?.department?.name} ({profile?.department?.code})</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile?.course} • Year {profile?.year}, Sem {profile?.semester}, Sec {profile?.section}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic & Personal Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Academic & Enrollment Record</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Gender</span>
              <span className="font-semibold text-slate-800">{profile?.gender || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Date of Birth</span>
              <span className="font-semibold text-slate-800">
                {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Admission Year</span>
              <span className="font-semibold text-slate-800">{profile?.admissionYear || 2023}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Email Address</span>
              <span className="font-semibold text-slate-800">{profile?.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Parent / Guardian</span>
              <span className="font-semibold text-slate-800">{profile?.parentName || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Parent Phone</span>
              <span className="font-semibold text-slate-800">{profile?.parentPhone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Update Contact Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center space-x-2">
            <Phone className="w-4 h-4 text-indigo-600" />
            <span>Contact Information</span>
          </h4>

          {saveMsg.text && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                saveMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{saveMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateContact} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Student Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Residential / Hostel Address
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Room number, Hostel Block, Campus Address..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm disabled:opacity-50 transition-all"
            >
              {saving ? 'Updating...' : 'Save Contact Details'}
            </button>
          </form>
        </div>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          <span>Security & Password Credentials</span>
        </h4>

        {pwMsg.text && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              pwMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{pwMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pwSaving}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-sm disabled:opacity-50 transition-all"
            >
              {pwSaving ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
