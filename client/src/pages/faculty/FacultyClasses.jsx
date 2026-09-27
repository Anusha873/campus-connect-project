import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Layers, Users, GraduationCap, Building2 } from 'lucide-react';

const FacultyClasses = () => {
  const { user } = useAuth();
  const profile = user?.profile;
  const assignedClasses = profile?.assignedClasses || [];

  const [selectedClass, setSelectedClass] = useState(assignedClasses[0] || null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        try {
          setLoading(true);
          const res = await api.get('/students', {
            params: {
              department: selectedClass.department?._id || selectedClass.department,
              year: selectedClass.year,
              semester: selectedClass.semester,
              section: selectedClass.section,
            },
          });
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
    }
  }, [selectedClass]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Assigned Classes & Student Rosters</h2>
        <p className="text-xs text-slate-500 mt-1">
          View enrolled batches, student directories, and classroom allocations.
        </p>
      </div>

      {assignedClasses.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No classes assigned"
          description="Your department administrator has not yet linked class batches to your profile."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Assigned Class Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assigned Batches
            </h3>
            {assignedClasses.map((cls, idx) => {
              const isSelected =
                selectedClass?.department === cls.department &&
                selectedClass?.year === cls.year &&
                selectedClass?.section === cls.section;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedClass(cls)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">
                      {cls.department?.code || 'CSE'} - Y{cls.year} Sec {cls.section}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      Sem {cls.semester}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate ${
                      isSelected ? 'text-indigo-100' : 'text-slate-500'
                    }`}
                  >
                    {cls.subject?.name || 'Class Subject'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Student Roster */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Enrolled Students ({students.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    {selectedClass?.department?.name || 'Department'} • Year {selectedClass?.year} Sem {selectedClass?.semester} Sec {selectedClass?.section}
                  </span>
                </div>
              </div>

              {loading ? (
                <LoadingSpinner message="Fetching roster..." />
              ) : students.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-500">
                  No registered students found in this section.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-6">Roll Number</th>
                        <th className="py-3 px-6">Student Name</th>
                        <th className="py-3 px-6">Institutional Email</th>
                        <th className="py-3 px-6">Phone Number</th>
                        <th className="py-3 px-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {students.map((st) => (
                        <tr key={st._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-6 font-bold text-slate-900">{st.rollNumber}</td>
                          <td className="py-3 px-6 font-semibold text-slate-800">{st.name}</td>
                          <td className="py-3 px-6 text-slate-500">{st.email}</td>
                          <td className="py-3 px-6 text-slate-500">{st.phone || '—'}</td>
                          <td className="py-3 px-6 text-right">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyClasses;
