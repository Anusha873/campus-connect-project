import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ClipboardCheck,
  FileText,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Download,
  AlertTriangle,
  Award,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [timetableToday, setTimetableToday] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [performance, setPerformance] = useState(null);

  const studentProfile = user?.profile;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = dayNames[new Date().getDay()];

        const [attRes, ttRes, assignRes, matRes, annRes, perfRes] = await Promise.all([
          api.get('/attendance/student').catch(() => ({ data: { summary: null } })),
          api.get(`/timetable?day=${todayName === 'Sunday' ? 'Monday' : todayName}`).catch(() => ({ data: { data: [] } })),
          api.get('/assignments').catch(() => ({ data: { data: [] } })),
          api.get('/study-materials').catch(() => ({ data: { data: [] } })),
          api.get('/announcements').catch(() => ({ data: { data: [] } })),
          api.get('/performance').catch(() => ({ data: { summary: null } })),
        ]);

        if (attRes.data.success) setAttendanceSummary(attRes.data.summary);
        if (ttRes.data.success) setTimetableToday(ttRes.data.data);
        if (assignRes.data.success) setAssignments(assignRes.data.data);
        if (matRes.data.success) setStudyMaterials(matRes.data.data);
        if (annRes.data.success) setAnnouncements(annRes.data.data);
        if (perfRes.data.success) setPerformance(perfRes.data.summary);
      } catch (err) {
        console.error('Error fetching student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your student portal..." />;
  }

  const pendingAssignments = assignments.filter((a) => a.status === 'Pending' || a.status === 'Late');
  const attendancePct = attendanceSummary?.overallPercentage ?? 85;
  const isAttendanceLow = attendancePct < 75;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
              {studentProfile?.course || 'B.Tech'} • Year {studentProfile?.year || 3}, Sem {studentProfile?.semester || 5} • Sec {studentProfile?.section || 'A'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {studentProfile?.name || user?.email}!
            </h2>
            <p className="text-sm text-indigo-100 max-w-xl leading-relaxed">
              Roll No: <span className="font-semibold text-white">{studentProfile?.rollNumber || 'N/A'}</span> | 
              Department of <span className="font-semibold text-white">{studentProfile?.department?.name || 'Computer Science'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/student/timetable"
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-bold hover:bg-indigo-50 shadow-md transition-all flex items-center space-x-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Full Schedule</span>
            </Link>
            <Link
              to="/student/assignments"
              className="px-4 py-2.5 rounded-xl bg-white/20 text-white text-xs font-bold hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Assignments</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Attendance Warning if below 75% */}
      {isAttendanceLow && (
        <Alert
          type="warning"
          title="Attendance Shortage Warning"
          message={`Your current overall attendance is ${attendancePct}%, which is below the university required minimum of 75%. Please attend upcoming lectures and reach out to your faculty mentor.`}
        />
      )}

      {/* Quick Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${attendancePct}%`}
          subtitle={`${attendanceSummary?.presentClasses || 0} Present / ${attendanceSummary?.totalClasses || 0} Sessions`}
          icon={ClipboardCheck}
          color={isAttendanceLow ? 'rose' : 'emerald'}
          trend={{
            positive: !isAttendanceLow,
            text: isAttendanceLow ? 'Critical (<75%)' : 'Good Standing',
          }}
        />

        <StatCard
          title="Pending Assignments"
          value={pendingAssignments.length}
          subtitle={`${assignments.length - pendingAssignments.length} Completed`}
          icon={FileText}
          color={pendingAssignments.length > 0 ? 'amber' : 'indigo'}
        />

        <StatCard
          title="Study Materials"
          value={studyMaterials.length}
          subtitle="Filtered to your class"
          icon={BookOpen}
          color="sky"
        />

        <StatCard
          title="Academic Score"
          value={`${performance?.overallPercentage || 86}%`}
          subtitle="Combined GPA & Internals"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Two-Column Layout: Left (Schedule & Assignments) - Right (Materials & Announcements) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Timetable */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Today's Class Schedule</h3>
              </div>
              <Link
                to="/student/timetable"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>View Week</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {timetableToday.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 bg-slate-50 rounded-xl">
                No classes scheduled for today. Take time to study or review notes!
              </div>
            ) : (
              <div className="space-y-3">
                {timetableToday.map((slot) => (
                  <div
                    key={slot._id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-indigo-100 bg-slate-50/50 hover:bg-indigo-50/30 transition-all"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="px-2.5 py-1.5 rounded-lg bg-indigo-100/70 text-indigo-800 font-bold text-xs">
                        P{slot.period}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {slot.subject?.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {slot.faculty?.name} • Room: {slot.roomNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-700 block">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="text-[11px] text-indigo-600 font-medium">
                        {slot.subject?.code}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending & Active Assignments */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Class Assignments</h3>
              </div>
              <Link
                to="/student/assignments"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>All Assignments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {assignments.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 bg-slate-50 rounded-xl">
                No assignments have been assigned for your class.
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-indigo-600">
                          {item.subject?.code}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500">
                        Due: {new Date(item.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} • Max Marks: {item.maxMarks}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge>{item.status}</Badge>
                      <Link
                        to="/student/assignments"
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                      >
                        {item.status === 'Evaluated' ? 'View Grade' : 'Open'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col wide) */}
        <div className="space-y-6">
          {/* Latest Class Study Materials */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Recent Materials</h3>
              </div>
              <Link
                to="/student/study-materials"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View All
              </Link>
            </div>

            {studyMaterials.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl text-center">
                No notes uploaded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {studyMaterials.slice(0, 3).map((mat) => (
                  <div
                    key={mat._id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <h5 className="text-xs font-semibold text-slate-800 truncate">
                        {mat.title}
                      </h5>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {mat.subject?.name}
                      </span>
                    </div>
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors flex-shrink-0"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements Feed */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Announcements</h3>
              <Link
                to="/student/announcements"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                All
              </Link>
            </div>

            {announcements.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl text-center">
                No campus bulletins right now.
              </p>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        {ann.type} Notice
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">{ann.title}</h5>
                    <p className="text-xs text-slate-600 line-clamp-2">{ann.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
