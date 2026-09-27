import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building2,
  UserCheck,
  ClipboardCheck,
  Award,
  SendHorizontal,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/admin');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating university-wide metrics and institutional health..." />;
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const examPieData = [
    { name: 'Passed', value: data?.examStats?.passed || 90 },
    { name: 'Failed / Backlog', value: data?.examStats?.failed || 10 },
  ];
  const PIE_COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30">
              CampusConnect Executive Administration Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              University Management & ERP Overview
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Real-time monitoring across all constituent colleges, departments, faculty allocations, student rosters, and accreditation metrics.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/admin/students"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Student</span>
            </Link>
            <Link
              to="/admin/reports"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all flex items-center space-x-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Reports</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={data?.totalStudents || 0}
          subtitle="Enrolled undergraduates"
          icon={GraduationCap}
          color="indigo"
        />

        <StatCard
          title="Faculty Members"
          value={data?.totalFaculty || 0}
          subtitle="Professors & Instructors"
          icon={Users}
          color="emerald"
        />

        <StatCard
          title="Departments & HODs"
          value={`${data?.totalDepartments || 0} Depts`}
          subtitle={`${data?.totalHODs || 0} Appointed HODs`}
          icon={Building2}
          color="amber"
        />

        <StatCard
          title="College Attendance"
          value={`${data?.averageAttendance || 88.5}%`}
          subtitle="Campus-wide average"
          icon={ClipboardCheck}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Enrollment Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">
              Department Student & Faculty Distribution
            </h3>
            <span className="text-xs text-slate-500">Active Departments</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.departmentDistribution || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="students" name="Students" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="faculty" name="Faculty" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Examination Pass Rate Doughnut */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
              <h3 className="font-bold text-base text-slate-900">Examination Pass Rate</h3>
              <span className="text-xs font-bold text-emerald-600">
                {data?.passPercentage || 92.4}% Pass
              </span>
            </div>

            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={examPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {examPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}`, 'Students']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">
                  {data?.passPercentage || 92.4}%
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Passed</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span>Total Evaluated: {data?.examStats?.totalEvaluated || 100}</span>
            <span>Failed: {data?.examStats?.failed || 0}</span>
          </div>
        </div>
      </div>

      {/* Quick Access Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Quick Administrative Hub</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Link
            to="/admin/students"
            className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 flex flex-col justify-between space-y-2 group transition-all"
          >
            <GraduationCap className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-slate-900 block">Manage Students</span>
              <span className="text-[11px] text-slate-500">Add, edit, deactivate students</span>
            </div>
          </Link>

          <Link
            to="/admin/faculty"
            className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 flex flex-col justify-between space-y-2 group transition-all"
          >
            <Users className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-slate-900 block">Manage Faculty</span>
              <span className="text-[11px] text-slate-500">Appoint, assign classes</span>
            </div>
          </Link>

          <Link
            to="/admin/departments"
            className="p-4 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 flex flex-col justify-between space-y-2 group transition-all"
          >
            <Building2 className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-slate-900 block">Departments & Classes</span>
              <span className="text-[11px] text-slate-500">Create sections, courses</span>
            </div>
          </Link>

          <Link
            to="/admin/reports"
            className="p-4 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-100 flex flex-col justify-between space-y-2 group transition-all"
          >
            <FileSpreadsheet className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-slate-900 block">Export CSV Reports</span>
              <span className="text-[11px] text-slate-500">Attendance, Marks, Exam CSVs</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
