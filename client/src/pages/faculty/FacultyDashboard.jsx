import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  FileText,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Layers,
  Award,
} from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);

  const profile = user?.profile;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = dayNames[new Date().getDay()];

        const [ttRes, assignRes, stRes] = await Promise.all([
          api.get(`/timetable?day=${todayName === 'Sunday' ? 'Monday' : todayName}`).catch(() => ({ data: { data: [] } })),
          api.get('/assignments').catch(() => ({ data: { data: [] } })),
          api.get('/students?limit=500').catch(() => ({ data: { total: 0 } })),
        ]);

        if (ttRes.data.success) setTodaySchedule(ttRes.data.data);
        if (assignRes.data.success) setRecentAssignments(assignRes.data.data);
        if (stRes.data.success) setTotalStudentsCount(stRes.data.total || 0);

        setAssignedClasses(profile?.assignedClasses || []);
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [profile]);

  if (loading) {
    return <LoadingSpinner message="Loading faculty portal..." />;
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              {profile?.designation || 'Faculty Member'} • Dept of {profile?.department?.name || 'Engineering'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {profile?.name || user?.email}!
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Faculty ID: <span className="font-bold text-white">{profile?.facultyId || 'FAC-001'}</span> • Assigned to {assignedClasses.length} academic lecture batches.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/faculty/attendance"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Mark Attendance</span>
            </Link>
            <Link
              to="/faculty/assignments"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Classes"
          value={assignedClasses.length}
          subtitle="Lecture & practical batches"
          icon={Layers}
          color="indigo"
        />

        <StatCard
          title="Lectures Today"
          value={todaySchedule.length}
          subtitle="Timetable schedule"
          icon={Clock}
          color="emerald"
        />

        <StatCard
          title="Active Assignments"
          value={recentAssignments.length}
          subtitle="Targeted tasks published"
          icon={FileText}
          color="amber"
        />

        <StatCard
          title="Total Students"
          value={totalStudentsCount}
          subtitle="In your department batches"
          icon={GraduationCap}
          color="purple"
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Teaching Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900">Today's Class Schedule</h3>
            </div>
            <Link
              to="/faculty/attendance"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Take Attendance
            </Link>
          </div>

          {todaySchedule.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
              No classes scheduled for you today.
            </p>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((slot) => (
                <div
                  key={slot._id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 bg-slate-50/50 hover:bg-indigo-50/20 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3.5">
                    <span className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                      P{slot.period}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{slot.subject?.name}</h4>
                      <p className="text-xs text-slate-500">
                        {slot.department?.code} • Year {slot.year}, Sem {slot.semester}, Sec {slot.section} • Room: {slot.roomNumber}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <Link
                      to="/faculty/attendance"
                      className="text-[11px] font-semibold text-indigo-600 hover:underline inline-block mt-0.5"
                    >
                      Record Attendance →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Classes Quick Links */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">My Assigned Classes</h3>
            <Link
              to="/faculty/classes"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Rosters
            </Link>
          </div>

          {assignedClasses.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
              No classes currently mapped to your account.
            </p>
          ) : (
            <div className="space-y-3">
              {assignedClasses.map((cls, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {cls.department?.code || 'CSE'} - Year {cls.year}, Sec {cls.section}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      Sem {cls.semester}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Course: {cls.subject?.name || 'Assigned Subject'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
