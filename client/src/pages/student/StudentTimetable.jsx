import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const res = await api.get('/timetable');
        if (res.data.success) {
          setTimetable(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load timetable:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading weekly timetable schedule..." />;
  }

  // Group by day
  const timetableByDay = {};
  daysOfWeek.forEach((day) => {
    timetableByDay[day] = timetable
      .filter((slot) => slot.day === day)
      .sort((a, b) => a.period - b.period);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Weekly Class Timetable</h2>
        <p className="text-xs text-slate-500 mt-1">
          Assigned lectures, laboratory sessions, and classrooms for your semester.
        </p>
      </div>

      {/* Days Grid */}
      <div className="space-y-6">
        {daysOfWeek.map((day) => {
          const slots = timetableByDay[day];
          if (!slots || slots.length === 0) return null;

          return (
            <div
              key={day}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
            >
              <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-800">{day}</h3>
                </div>
                <span className="text-xs text-slate-500">{slots.length} Classes</span>
              </div>

              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {slots.map((slot) => (
                  <div
                    key={slot._id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/40 hover:bg-indigo-50/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          Period {slot.period}
                        </span>
                        <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{slot.startTime}</span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">
                        {slot.subject?.name}
                      </h4>
                      <span className="text-[11px] font-semibold text-indigo-600 block mt-0.5">
                        {slot.subject?.code}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{slot.faculty?.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{slot.roomNumber}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentTimetable;
