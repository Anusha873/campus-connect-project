import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { Award, Save, Users, AlertCircle } from 'lucide-react';

const FacultyInternalMarks = () => {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selections
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('3');
  const [selectedSem, setSelectedSem] = useState('5');
  const [selectedSec, setSelectedSec] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState('Internal Assessment 1');
  const [maxMarks, setMaxMarks] = useState('50');

  // Student Marks Map: { studentId: { obtainedMarks: number, remarks: string } }
  const [marksMap, setMarksMap] = useState({});

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
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  const handleFetchStudents = async () => {
    if (!selectedDept || !selectedSubject) {
      setErrorMsg('Please select Department and Subject');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSaveSuccess(false);

      const res = await api.get('/internal-marks/class', {
        params: {
          department: selectedDept,
          year: selectedYear,
          semester: selectedSem,
          section: selectedSec,
          subject: selectedSubject,
          examType,
        },
      });

      if (res.data.success) {
        setStudents(res.data.data);
        const initialMap = {};
        res.data.data.forEach((st) => {
          const existing = st.marks?.find((m) => m.examType === examType);
          initialMap[st._id] = {
            obtainedMarks: existing ? existing.obtainedMarks : '',
            remarks: existing ? existing.remarks : '',
          };
        });
        setMarksMap(initialMap);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, val) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], obtainedMarks: val },
    }));
  };

  const handleSaveMarks = async () => {
    // Validate that no student's marks exceed maxMarks
    for (const st of students) {
      const val = marksMap[st._id]?.obtainedMarks;
      if (val !== '' && val !== undefined) {
        if (Number(val) < 0 || Number(val) > Number(maxMarks)) {
          setErrorMsg(`Marks for ${st.name} (${val}) cannot exceed Maximum Marks (${maxMarks})`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      setErrorMsg('');

      // Save sequentially or in parallel
      for (const st of students) {
        const entry = marksMap[st._id];
        if (entry && entry.obtainedMarks !== '' && entry.obtainedMarks !== undefined) {
          await api.post('/internal-marks', {
            studentId: st._id,
            subject: selectedSubject,
            examType,
            maxMarks: Number(maxMarks),
            obtainedMarks: Number(entry.obtainedMarks),
            semester: Number(selectedSem),
            remarks: entry.remarks || '',
          });
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Enter Internal Assessment Marks</h2>
        <p className="text-xs text-slate-500 mt-1">
          Record continuous assessment scores with strict maximum marks validation.
        </p>
      </div>

      {/* Selectors */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="1">Yr 1</option>
              <option value="2">Yr 2</option>
              <option value="3">Yr 3</option>
              <option value="4">Yr 4</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Semester
            </label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Sem {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Section
            </label>
            <select
              value={selectedSec}
              onChange={(e) => setSelectedSec(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="A">Sec A</option>
              <option value="B">Sec B</option>
              <option value="C">Sec C</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Assessment Type
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="Internal Assessment 1">Internal 1</option>
              <option value="Internal Assessment 2">Internal 2</option>
              <option value="Mid Term Exam">Mid Term</option>
              <option value="Model Exam">Model Exam</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Max Marks
            </label>
            <input
              type="number"
              min={1}
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleFetchStudents}
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>{loading ? 'Loading...' : 'Load Class for Grading'}</span>
          </button>
        </div>
      </div>

      {errorMsg && <Alert type="error" title="Validation Error" message={errorMsg} />}

      {saveSuccess && (
        <Alert
          type="success"
          title="Scores Saved Successfully!"
          message={`Recorded internal marks for ${examType} (Max: ${maxMarks}).`}
        />
      )}

      {/* Roster Table */}
      {students.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              Student Grade Sheet ({students.length} Enrolled)
            </h3>
            <span className="text-xs text-indigo-600 font-bold">
              {examType} • Max: {maxMarks} Marks
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Roll No</th>
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-6 text-center">Marks Obtained (/{maxMarks})</th>
                  <th className="py-3 px-6 text-center">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((st) => {
                  const val = marksMap[st._id]?.obtainedMarks ?? '';
                  const pct =
                    val !== '' && !isNaN(val) && Number(maxMarks) > 0
                      ? ((Number(val) / Number(maxMarks)) * 100).toFixed(1)
                      : '—';

                  const isOver = Number(val) > Number(maxMarks);

                  return (
                    <tr key={st._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-6 font-bold text-slate-900">{st.rollNumber}</td>
                      <td className="py-3 px-6 font-medium text-slate-800">{st.name}</td>
                      <td className="py-3 px-6 text-center">
                        <input
                          type="number"
                          min={0}
                          max={maxMarks}
                          value={val}
                          onChange={(e) => handleMarkChange(st._id, e.target.value)}
                          placeholder="Marks"
                          className={`w-28 p-2 text-center rounded-xl border text-sm font-bold focus:outline-none ${
                            isOver
                              ? 'bg-rose-50 border-rose-500 text-rose-700'
                              : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500'
                          }`}
                        />
                      </td>
                      <td className="py-3 px-6 text-center font-bold text-slate-800">
                        {isOver ? (
                          <span className="text-rose-600">Exceeds Max</span>
                        ) : pct !== '—' ? (
                          <span
                            className={
                              Number(pct) >= 75 ? 'text-emerald-600' : 'text-amber-600'
                            }
                          >
                            {pct}%
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-5 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveMarks}
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Submit & Save Marks'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyInternalMarks;
