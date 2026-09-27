import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { BarChart3, Search, GraduationCap, Eye } from 'lucide-react';
import Modal from '../../components/common/Modal';

const FacultyStudentPerformance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected Student Performance Detail Modal
  const [selectedStudentPerf, setSelectedStudentPerf] = useState(null);
  const [perfLoading, setPerfLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/students?limit=500');
        if (res.data.success) {
          setStudents(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleViewPerformance = async (st) => {
    try {
      setPerfLoading(true);
      const res = await api.get(`/performance/${st._id}`);
      if (res.data.success) {
        setSelectedStudentPerf(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPerfLoading(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Academic Performance</h2>
          <p className="text-xs text-slate-500 mt-1">
            Analyze continuous progress, attendance shortages, and course evaluations for enrolled students.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name or roll..."
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading student academic data..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Students Directory ({filtered.length})</h3>
            <span className="text-xs text-slate-500">Department Rosters</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Roll No</th>
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-6 text-right">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">{st.rollNumber}</td>
                    <td className="py-3 px-6 font-semibold text-slate-800">
                      {st.name}
                      <span className="block text-[11px] text-slate-400 font-normal">{st.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                        Y{st.year} S{st.semester} Sec {st.section}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {st.department?.code || 'CSE'}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => handleViewPerformance(st)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Matrix</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {selectedStudentPerf && (
        <Modal
          isOpen={!!selectedStudentPerf}
          onClose={() => setSelectedStudentPerf(null)}
          title={`Performance Matrix: ${selectedStudentPerf.student.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {selectedStudentPerf.student.name} ({selectedStudentPerf.student.rollNumber})
                </span>
                <span className="text-slate-500">
                  Year {selectedStudentPerf.student.year} Sem {selectedStudentPerf.student.semester} Sec {selectedStudentPerf.student.section}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Attendance</span>
                  <span
                    className={`font-black text-sm ${
                      selectedStudentPerf.summary.attendancePercentage < 75
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {selectedStudentPerf.summary.attendancePercentage}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Internals</span>
                  <span className="font-black text-sm text-indigo-600">
                    {selectedStudentPerf.summary.internalPercentage}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Overall</span>
                  <span className="font-black text-sm text-slate-900">
                    {selectedStudentPerf.summary.overallPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Subject breakdown */}
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4 text-center">Attendance %</th>
                    <th className="py-2.5 px-4 text-center">Internals %</th>
                    <th className="py-2.5 px-4 text-center">Exam Marks %</th>
                    <th className="py-2.5 px-4 text-right">Tasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedStudentPerf.subjectPerformance.map((sub) => (
                    <tr key={sub.subjectId}>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {sub.subjectName} ({sub.subjectCode})
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold">
                        <span className={sub.attendancePercentage < 75 ? 'text-rose-600' : 'text-slate-800'}>
                          {sub.attendancePercentage}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-semibold text-slate-800">
                        {sub.internalMarksPercentage}%
                      </td>
                      <td className="py-2.5 px-4 text-center font-semibold text-slate-800">
                        {sub.examMarksPercentage}%
                      </td>
                      <td className="py-2.5 px-4 text-right text-indigo-600 font-semibold">
                        {sub.assignmentStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FacultyStudentPerformance;
