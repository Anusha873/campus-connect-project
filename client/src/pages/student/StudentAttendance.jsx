import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  BookOpen,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const StudentAttendance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await api.get('/attendance/student');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating your attendance logs..." />;
  }

  const summary = data?.summary || {
    totalClasses: 0,
    presentClasses: 0,
    absentClasses: 0,
    overallPercentage: 0,
    warning: false,
  };
  const subjectWise = data?.subjectWise || [];
  const history = data?.history || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Attendance Monitoring</h2>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics of your classroom presence, subject attendance, and history records.
        </p>
      </div>

      {/* Warning Callout if below 75% */}
      {summary.warning && (
        <Alert
          type="warning"
          title="Attendance Below University Threshold (75%)"
          message={`Your current attendance rate is ${summary.overallPercentage}%. Regulation requires at least 75% attendance to sit for final semester examinations.`}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${summary.overallPercentage}%`}
          subtitle="Minimum 75% Required"
          icon={ClipboardCheck}
          color={summary.warning ? 'rose' : 'emerald'}
          trend={{
            positive: !summary.warning,
            text: summary.warning ? 'Warning (<75%)' : 'Good Standing',
          }}
        />

        <StatCard
          title="Total Lectures"
          value={summary.totalClasses}
          subtitle="Conducted this semester"
          icon={Calendar}
          color="indigo"
        />

        <StatCard
          title="Classes Attended"
          value={summary.presentClasses}
          subtitle="Marked Present"
          icon={CheckCircle}
          color="emerald"
        />

        <StatCard
          title="Classes Missed"
          value={summary.absentClasses}
          subtitle="Marked Absent"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Subject-Wise Attendance Visual Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">Subject-Wise Attendance Percentage</h3>
          </div>
          <span className="text-xs text-slate-500">75% Target Line</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectWise} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="subjectCode"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Attendance']}
                labelFormatter={(code) => {
                  const sub = subjectWise.find((s) => s.subjectCode === code);
                  return sub ? `${sub.subjectName} (${code})` : code;
                }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                {subjectWise.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.percentage < 75 ? '#f43f5e' : '#4f46e5'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject-Wise Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">Course Breakdown</h3>
          <span className="text-xs text-slate-500">{subjectWise.length} Enrolled Courses</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4 text-center">Conducted</th>
                <th className="py-3 px-4 text-center">Attended</th>
                <th className="py-3 px-4 text-center">Missed</th>
                <th className="py-3 px-4 text-right">Percentage</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {subjectWise.map((sub) => (
                <tr key={sub.subjectId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{sub.subjectName}</td>
                  <td className="py-3 px-4 text-indigo-600 font-medium">{sub.subjectCode}</td>
                  <td className="py-3 px-4 text-center font-medium">{sub.total}</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">{sub.present}</td>
                  <td className="py-3 px-4 text-center text-rose-600 font-semibold">{sub.absent}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-bold ${
                        sub.warning ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {sub.warning ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Low Attendance
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Satisfactory
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance History Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">Attendance Log History</h3>
          <span className="text-xs text-slate-500">Past Sessions</span>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {history.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-500">No logs found.</p>
          ) : (
            history.map((record) => (
              <div
                key={record._id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">
                      {record.subject?.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({record.subject?.code})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                    <span>
                      {new Date(record.date).toLocaleDateString([], {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {record.faculty?.name && <span>• Marked by {record.faculty.name}</span>}
                  </div>
                </div>

                <Badge variant={record.status === 'Present' ? 'success' : 'danger'}>
                  {record.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
