import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Save,
  Users,
  Search,
} from 'lucide-react';

const FacultyAttendance = () => {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form selections
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('3');
  const [selectedSem, setSelectedSem] = useState('5');
  const [selectedSec, setSelectedSec] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Student Attendance Map: { studentId: { status: 'Present' | 'Absent' | 'Late', remarks: '' } }
  const [attendanceMap, setAttendanceMap] = useState({});

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          api.get('/departments'),
          api.get('/subjects'),
        ]);
        if (dRes.data.success && dRes.data.data.length > 0) {
          setDepartments(dRes.data.data);
          setSelectedDept(dRes.data.data[0]._id);
        }
        if (sRes.data.success && sRes.data.data.length > 0) {
          setSubjects(sRes.data.data);
          setSelectedSubject(sRes.data.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };

    fetchMetadata();
  }, []);

  const handleFetchStudents = async () => {
    if (!selectedDept || !selectedYear || !selectedSem || !selectedSec) {
      setErrorMsg('Please select Department, Year, Semester, and Section');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSaveSuccess(false);

      const res = await api.get('/attendance/class', {
        params: {
          department: selectedDept,
          year: selectedYear,
          semester: selectedSem,
          section: selectedSec,
          subject: selectedSubject,
          date: selectedDate,
        },
      });

      if (res.data.success) {
        setStudents(res.data.data);
        const initialMap = {};
        res.data.data.forEach((st) => {
          initialMap[st._id] = {
            status: st.attendanceStatus || 'Present',
            remarks: st.remarks || '',
          };
        });
        setAttendanceMap(initialMap);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch class students');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((st) => {
      updated[st._id] = {
        status,
        remarks: attendanceMap[st._id]?.remarks || '',
      };
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) return;

    try {
      setSaving(true);
      setErrorMsg('');

      const records = students.map((st) => ({
        studentId: st._id,
        status: attendanceMap[st._id]?.status || 'Present',
        remarks: attendanceMap[st._id]?.remarks || '',
      }));

      const res = await api.post('/attendance', {
        department: selectedDept,
        year: Number(selectedYear),
        semester: Number(selectedSem),
        section: selectedSec,
        subject: selectedSubject,
        date: selectedDate,
        attendanceRecords: records,
      });

      if (res.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((v) => v.status === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter((v) => v.status === 'Absent').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Mark Class Attendance</h2>
        <p className="text-xs text-slate-500 mt-1">
          Select target class, subject, and date to record daily presence and calculate warnings.
        </p>
      </div>

      {/* Filter / Selector Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Semester
            </label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Sem {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Section
            </label>
            <select
              value={selectedSec}
              onChange={(e) => setSelectedSec(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Course / Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Lecture Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleFetchStudents}
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>{loading ? 'Fetching Roster...' : 'Load Class Roster'}</span>
          </button>
        </div>
      </div>

      {errorMsg && <Alert type="error" title="Error" message={errorMsg} />}

      {saveSuccess && (
        <Alert
          type="success"
          title="Attendance Saved!"
          message={`Successfully updated attendance for ${students.length} students on ${selectedDate}.`}
        />
      )}

      {/* Attendance Roster Table */}
      {students.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Class Attendance Roster ({students.length} Students)
              </h3>
              <p className="text-xs text-slate-500">
                Present: <strong className="text-emerald-600">{presentCount}</strong> | Absent:{' '}
                <strong className="text-rose-600">{absentCount}</strong> | Attendance Rate:{' '}
                <strong>{((presentCount / students.length) * 100).toFixed(1)}%</strong>
              </p>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Absent')}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Roll No</th>
                  <th className="py-3.5 px-6">Student Name</th>
                  <th className="py-3.5 px-6 text-center">Attendance Status</th>
                  <th className="py-3.5 px-6">Remarks / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((st) => {
                  const currentStatus = attendanceMap[st._id]?.status || 'Present';
                  const currentRemarks = attendanceMap[st._id]?.remarks || '';

                  return (
                    <tr key={st._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">{st.rollNumber}</td>
                      <td className="py-3.5 px-6 font-medium text-slate-800">
                        {st.name}
                        <span className="block text-[11px] text-slate-400">{st.studentId}</span>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st._id, 'Present')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st._id, 'Absent')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <input
                          type="text"
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(st._id, e.target.value)}
                          placeholder="Optional notes (e.g. verified medical)"
                          className="w-full max-w-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-5 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Submit Attendance'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAttendance;
