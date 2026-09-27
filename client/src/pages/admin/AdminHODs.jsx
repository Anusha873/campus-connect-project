import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import { UserCheck, Shield, Building2, UserPlus, CheckCircle } from 'lucide-react';

const AdminHODs = () => {
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign HOD Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dRes, fRes] = await Promise.all([
        api.get('/departments'),
        api.get('/faculty'),
      ]);
      if (dRes.data.success) {
        setDepartments(dRes.data.data);
        if (dRes.data.data.length > 0 && !selectedDept) {
          setSelectedDept(dRes.data.data[0]._id);
        }
      }
      if (fRes.data.success) {
        setFacultyList(fRes.data.data);
        if (fRes.data.data.length > 0 && !selectedFaculty) {
          setSelectedFaculty(fRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignHOD = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!selectedDept || !selectedFaculty) {
      setMsg({ type: 'error', text: 'Select both department and faculty member.' });
      return;
    }

    try {
      setAssigning(true);
      const res = await api.post('/faculty/assign-hod', {
        facultyId: selectedFaculty,
        departmentId: selectedDept,
      });

      if (res.data.success) {
        setMsg({ type: 'success', text: res.data.message });
        setTimeout(() => {
          setIsModalOpen(false);
          fetchData();
        }, 1000);
      }
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to appoint HOD',
      });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Head of Department (HOD) Governance</h2>
          <p className="text-xs text-slate-500 mt-1">
            Assign and regulate department chairpersons. Strictly enforces one active HOD per department.
          </p>
        </div>

        <button
          onClick={() => {
            setMsg({ type: '', text: '' });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all self-start"
        >
          <UserPlus className="w-4 h-4" />
          <span>Appoint / Switch Department HOD</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading HOD administration..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const hasHOD = !!dept.hod;

            return (
              <div
                key={dept._id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-extrabold text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
                      {dept.code}
                    </span>
                    <Badge variant={hasHOD ? 'success' : 'warning'}>
                      {hasHOD ? 'HOD Appointed' : 'Seat Vacant'}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{dept.name}</h3>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Department Head
                  </span>
                  {hasHOD ? (
                    <div>
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-sm text-slate-900">{dept.hod.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{dept.hod.email}</p>
                      <p className="text-[11px] text-slate-400">ID: {dept.hod.facultyId}</p>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-700 italic">
                      No active professor designated as HOD.
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedDept(dept._id);
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                  >
                    {hasHOD ? 'Change Department HOD' : 'Assign Faculty as HOD'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Appoint Department Head (HOD)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssignHOD} className="space-y-4 text-xs">
          {msg.text && (
            <Alert
              type={msg.type === 'success' ? 'success' : 'error'}
              message={msg.text}
            />
          )}

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Select Department *
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Select Faculty Candidate *
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {facultyList.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.facultyId}) • {f.department?.code}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Note: Appointing this faculty will automatically grant HOD role privileges and update any former department head back to standard faculty role.
            </p>
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
              disabled={assigning}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {assigning ? 'Assigning...' : 'Appoint as Active HOD'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminHODs;
