import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Users, Mail, Phone, BookOpen, Layers } from 'lucide-react';

const HODFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const res = await api.get('/faculty');
        if (res.data.success) {
          setFacultyList(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Department Faculty Roster</h2>
        <p className="text-xs text-slate-500 mt-1">
          Instructors, professors, and subject teachers within your department.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading department faculty directory..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facultyList.map((fac) => (
            <div
              key={fac._id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-base font-bold shadow-sm">
                    {fac.name ? fac.name.charAt(0) : 'F'}
                  </div>
                  <Badge variant={fac.isHOD ? 'warning' : 'primary'}>
                    {fac.isHOD ? 'HOD' : 'Faculty'}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900">{fac.name}</h3>
                <p className="text-xs font-semibold text-indigo-600 mb-2">{fac.designation}</p>
                <p className="text-[11px] text-slate-500">ID: {fac.facultyId}</p>

                {/* Assigned Subjects */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Teaching Courses
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {fac.subjects && fac.subjects.length > 0 ? (
                      fac.subjects.map((sub) => (
                        <span
                          key={sub._id}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold"
                        >
                          {sub.code} - {sub.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">None assigned</span>
                    )}
                  </div>
                </div>

                {/* Assigned Batches */}
                <div className="mt-3 pt-2 text-xs text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Lecture Batches ({fac.assignedClasses?.length || 0})
                  </span>
                  <div className="space-y-1">
                    {fac.assignedClasses?.slice(0, 3).map((cls, idx) => (
                      <div key={idx} className="text-[11px] text-slate-600">
                        • Year {cls.year}, Sem {cls.semester}, Sec {cls.section} ({cls.subject?.code || 'Course'})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <div className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{fac.email}</span>
                </div>
                {fac.phone && (
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{fac.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HODFaculty;
