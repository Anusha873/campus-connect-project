import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart3,
  Award,
  ClipboardCheck,
  FileText,
  TrendingUp,
  Percent,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

const StudentPerformance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const res = await api.get('/performance');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load performance metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating your comprehensive academic analytics..." />;
  }

  const summary = data?.summary || {};
  const subjectPerformance = data?.subjectPerformance || [];
  const trends = data?.trends || [];

  // Multi-dimensional metrics for Radar Chart
  const radarData = [
    { metric: 'Attendance', score: summary.attendancePercentage || 0, fullMark: 100 },
    { metric: 'Internals', score: summary.internalPercentage || 0, fullMark: 100 },
    { metric: 'Exams', score: summary.examPercentage || 0, fullMark: 100 },
    { metric: 'Assignments', score: summary.submissionRate || 0, fullMark: 100 },
    { metric: 'Overall', score: summary.overallPercentage || 0, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Academic Performance Matrix</h2>
        <p className="text-xs text-slate-500 mt-1">
          Holistic view correlating your attendance, internal assessments, semester exams, and assignment rates.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Performance"
          value={`${summary.overallPercentage || 0}%`}
          subtitle="Cumulative weighted index"
          icon={Percent}
          color="indigo"
        />

        <StatCard
          title="Attendance Rate"
          value={`${summary.attendancePercentage || 0}%`}
          subtitle={`${summary.presentDays || 0} / ${summary.totalAttendanceDays || 0} Lectures`}
          icon={ClipboardCheck}
          color={summary.warning ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Internal Assessment"
          value={`${summary.internalPercentage || 0}%`}
          subtitle="Average continuous score"
          icon={Award}
          color="amber"
        />

        <StatCard
          title="Assignment Completion"
          value={`${summary.submissionRate || 0}%`}
          subtitle={`${summary.submittedCount || 0} / ${summary.totalAssignments || 0} Submitted`}
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar / Holistic Balance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">Multi-Dimensional Evaluation</h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                <Radar
                  name="Student Score"
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.4}
                />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Score']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Trend Line Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">Monthly Performance Trends</h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val}%`]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  name="Attendance %"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="internal"
                  name="Internal Tests %"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="performance"
                  name="Weighted Index %"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mandatory Subject-Wise Performance Section:
          Subject | Attendance | Internal Marks | Exam Marks | Assignment Status */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">
            Subject-Wise Multi-Metric Performance Table
          </h3>
          <span className="text-xs text-slate-500">Continuous Assessment Matrix</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Subject</th>
                <th className="py-3.5 px-4 text-center">Attendance %</th>
                <th className="py-3.5 px-4 text-center">Internal Marks %</th>
                <th className="py-3.5 px-4 text-center">Exam Marks %</th>
                <th className="py-3.5 px-4 text-center">Final Grade</th>
                <th className="py-3.5 px-6 text-right">Assignment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {subjectPerformance.map((sub) => (
                <tr key={sub.subjectId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6">
                    <span className="font-bold text-slate-900 block">{sub.subjectName}</span>
                    <span className="text-[11px] text-indigo-600 font-medium">{sub.subjectCode}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">
                    <span
                      className={
                        sub.attendancePercentage < 75 ? 'text-rose-600' : 'text-slate-800'
                      }
                    >
                      {sub.attendancePercentage}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                    {sub.internalMarksPercentage}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                    {sub.examMarksPercentage}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-black text-indigo-700">
                    {sub.grade}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {sub.assignmentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
