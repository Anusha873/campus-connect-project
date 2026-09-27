import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  Building2,
  GraduationCap,
  Users,
  ClipboardCheck,
  SendHorizontal,
  FileText,
  BarChart3,
  Calendar,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const HODDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHODAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/hod');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load HOD analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHODAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading department dashboard metrics..." />;
  }

  const dept = data?.department;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Department Head Portal • {dept?.code || 'CSE'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {dept?.name || 'Department of Computer Science'}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              HOD Administrator: <strong className="text-white">{user?.profile?.name || user?.email}</strong>. Overseeing academic operations, attendance, faculty workloads, and student affairs.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/hod/leaves"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-extrabold shadow-md transition-all flex items-center space-x-1.5"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>Review Leaves ({data?.pendingLeaves || 0})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={data?.totalStudents || 0}
          subtitle="Enrolled in department"
          icon={GraduationCap}
          color="indigo"
        />

        <StatCard
          title="Department Faculty"
          value={data?.totalFaculty || 0}
          subtitle="Professors & Instructors"
          icon={Users}
          color="emerald"
        />

        <StatCard
          title="Average Attendance"
          value={`${data?.deptAttendance || 87.5}%`}
          subtitle="Across all classes"
          icon={ClipboardCheck}
          color="sky"
        />

        <StatCard
          title="Pending Leaves"
          value={data?.pendingLeaves || 0}
          subtitle="Requires HOD approval"
          icon={SendHorizontal}
          color={data?.pendingLeaves > 0 ? 'rose' : 'indigo'}
        />
      </div>

      {/* Charts & Quick Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Year-wise Student Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900">
                Student Enrollment by Academic Year
              </h3>
            </div>
            <span className="text-xs text-slate-500">B.Tech Cohorts</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.yearDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} Students`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Operations Links */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
            HOD Department Operations
          </h3>

          <div className="space-y-2 text-xs">
            <Link
              to="/hod/students"
              className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 flex items-center justify-between transition-colors font-semibold text-slate-800"
            >
              <span>View Department Students Directory</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </Link>

            <Link
              to="/hod/faculty"
              className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 flex items-center justify-between transition-colors font-semibold text-slate-800"
            >
              <span>Faculty Workload & Subjects</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </Link>

            <Link
              to="/hod/leaves"
              className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 flex items-center justify-between transition-colors font-semibold text-slate-800"
            >
              <span>Review Pending Student Leaves</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </Link>

            <Link
              to="/hod/announcements"
              className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 flex items-center justify-between transition-colors font-semibold text-slate-800"
            >
              <span>Post Department Notice</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </Link>

            <Link
              to="/hod/results"
              className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 flex items-center justify-between transition-colors font-semibold text-slate-800"
            >
              <span>Semester Examination Results</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;
