import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { Calendar, Plus, Clock, MapPin, User, Trash2 } from 'lucide-react';

const AdminTimetable = () => {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter Selections
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('3');
  const [selectedSem, setSelectedSem] = useState('5');
  const [selectedSec, setSelectedSec] = useState('A');

  // Add Slot Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [day, setDay] = useState('Monday');
  const [period, setPeriod] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [subject, setSubject] = useState('');
  const [faculty, setFaculty] = useState('');
  const [roomNumber, setRoomNumber] = useState('Lecture Hall 101');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [dRes, sRes, fRes] = await Promise.all([
          api.get('/departments'),
          api.get('/subjects'),
          api.get('/faculty'),
        ]);
        if (dRes.data.success && dRes.data.data.length > 0) {
          setDepartments(dRes.data.data);
          setSelectedDept(dRes.data.data[0]._id);
        }
        if (sRes.data.success && sRes.data.data.length > 0) {
          setSubjects(sRes.data.data);
          setSubject(sRes.data.data[0]._id);
        }
        if (fRes.data.success && fRes.data.data.length > 0) {
          setFacultyList(fRes.data.data);
          setFaculty(fRes.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchTimetable = async () => {
    if (!selectedDept) return;
    try {
      setLoading(true);
      const res = await api.get('/timetable', {
        params: {
          department: selectedDept,
          year: selectedYear,
          semester: selectedSem,
          section: selectedSec,
        },
      });
      if (res.data.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDept) {
      fetchTimetable();
    }
  }, [selectedDept, selectedYear, selectedSem, selectedSec]);

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    try {
      setSubmitting(true);
      const res = await api.post('/timetable', {
        department: selectedDept,
        year: Number(selectedYear),
        semester: Number(selectedSem),
        section: selectedSec,
        day,
        period: Number(period),
        startTime,
        endTime,
        subject,
        faculty,
        roomNumber,
      });

      if (res.data.success) {
        setMsg({ type: 'success', text: 'Timetable slot scheduled!' });
        setTimeout(() => {
          setIsModalOpen(false);
          fetchTimetable();
        }, 800);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Slot collision or error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this timetable slot?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      fetchTimetable();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove slot');
    }
  };

  const timetableByDay = {};
  daysOfWeek.forEach((d) => {
    timetableByDay[d] = slots.filter((s) => s.day === d).sort((a, b) => a.period - b.period);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">College Timetable Scheduler</h2>
          <p className="text-xs text-slate-500 mt-1">
            Construct master weekly grids and prevent period classroom conflicts.
          </p>
        </div>

        <button
          onClick={() => {
            setMsg({ type: '', text: '' });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Timetable Period</span>
        </button>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-0.5">Dept</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-0.5">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-0.5">Sem</label>
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Sem {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-0.5">Section</label>
          <select
            value={selectedSec}
            onChange={(e) => setSelectedSec(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner message="Loading weekly timetable schedule..." />
      ) : (
        <div className="space-y-6">
          {daysOfWeek.map((d) => {
            const daySlots = timetableByDay[d] || [];

            return (
              <div
                key={d}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
              >
                <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">{d}</span>
                  <span className="text-xs text-slate-500">{daySlots.length} Periods</span>
                </div>

                {daySlots.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 italic">No periods assigned</p>
                ) : (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {daySlots.map((s) => (
                      <div
                        key={s._id}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/40 relative group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                            P{s.period}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {s.startTime} - {s.endTime}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 mt-2">{s.subject?.name}</h4>
                        <span className="text-[11px] font-semibold text-indigo-600 block">
                          {s.subject?.code}
                        </span>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="truncate max-w-[120px]">{s.faculty?.name}</span>
                          <span>{s.roomNumber}</span>
                        </div>

                        <button
                          onClick={() => handleDeleteSlot(s._id)}
                          className="absolute top-2 right-2 p-1 text-rose-500 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove period"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Timetable Slot"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
          {msg.text && (
            <Alert
              type={msg.type === 'success' ? 'success' : 'error'}
              message={msg.text}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Day of Week</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Period #</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                  <option key={p} value={p}>
                    Period {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Course / Subject *</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Faculty Instructor *</label>
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {facultyList.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.facultyId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Room / Lab Number</label>
            <input
              type="text"
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. Hall 101 or Lab 203"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Confirm Slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTimetable;
