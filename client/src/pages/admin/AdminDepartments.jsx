import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { Building2, Plus, Layers, Users, GraduationCap, Trash2 } from 'lucide-react';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptMsg, setDeptMsg] = useState({ type: '', text: '' });
  const [deptSubmitting, setDeptSubmitting] = useState(false);

  // Class / Section Modal State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classDept, setClassDept] = useState('');
  const [classYear, setClassYear] = useState('3');
  const [classSem, setClassSem] = useState('5');
  const [classSec, setClassSec] = useState('A');
  const [classCapacity, setClassCapacity] = useState('60');
  const [classMsg, setClassMsg] = useState({ type: '', text: '' });
  const [classSubmitting, setClassSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dRes, cRes] = await Promise.all([
        api.get('/departments'),
        api.get('/classes'),
      ]);
      if (dRes.data.success) {
        setDepartments(dRes.data.data);
        if (dRes.data.data.length > 0 && !classDept) {
          setClassDept(dRes.data.data[0]._id);
        }
      }
      if (cRes.data.success) {
        setClasses(cRes.data.data);
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

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setDeptMsg({ type: '', text: '' });
    try {
      setDeptSubmitting(true);
      const res = await api.post('/departments', {
        code: deptCode,
        name: deptName,
        description: deptDesc,
      });
      if (res.data.success) {
        setDeptMsg({ type: 'success', text: 'Department created successfully!' });
        setTimeout(() => {
          setIsDeptModalOpen(false);
          setDeptCode('');
          setDeptName('');
          setDeptDesc('');
          fetchData();
        }, 1000);
      }
    } catch (err) {
      setDeptMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create department',
      });
    } finally {
      setDeptSubmitting(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setClassMsg({ type: '', text: '' });
    try {
      setClassSubmitting(true);
      const res = await api.post('/classes', {
        department: classDept,
        year: Number(classYear),
        semester: Number(classSem),
        section: classSec,
        capacity: Number(classCapacity),
      });
      if (res.data.success) {
        setClassMsg({ type: 'success', text: 'Class section added successfully!' });
        setTimeout(() => {
          setIsClassModalOpen(false);
          fetchData();
        }, 1000);
      }
    } catch (err) {
      setClassMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create class section',
      });
    } finally {
      setClassSubmitting(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Delete this class section?')) return;
    try {
      await api.delete(`/classes/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Departments, Classes & Sections</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure constituent college departments, year cohorts, semesters, and class divisions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDeptModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
          <button
            onClick={() => setIsClassModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class Section</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading academic departments and sections..." />
      ) : (
        <>
          {/* Departments Grid */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900">Academic Departments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept._id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-sm flex items-center justify-center">
                        {dept.code}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        Active
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 leading-snug">{dept.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {dept.description || 'Academic department.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <span className="text-slate-400 block text-[11px]">Head of Department (HOD)</span>
                    <strong className="text-slate-800">
                      {dept.hod?.name ? dept.hod.name : 'No HOD appointed yet'}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Classes & Sections Table */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900">Class Sections Directory</h3>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6 text-center">Year</th>
                      <th className="py-3.5 px-6 text-center">Semester</th>
                      <th className="py-3.5 px-6 text-center">Section</th>
                      <th className="py-3.5 px-6 text-center">Enrolled Students</th>
                      <th className="py-3.5 px-6 text-center">Max Capacity</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {classes.map((cls) => (
                      <tr key={cls._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-slate-900">
                          {cls.department?.name} ({cls.department?.code})
                        </td>
                        <td className="py-3.5 px-6 text-center font-semibold">Year {cls.year}</td>
                        <td className="py-3.5 px-6 text-center font-semibold text-indigo-600">
                          Sem {cls.semester}
                        </td>
                        <td className="py-3.5 px-6 text-center font-bold text-slate-800">
                          Section {cls.section}
                        </td>
                        <td className="py-3.5 px-6 text-center font-bold text-emerald-600">
                          {cls.studentCount || 0}
                        </td>
                        <td className="py-3.5 px-6 text-center text-slate-500">
                          {cls.capacity || 60} Seats
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => handleDeleteClass(cls._id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Create New Academic Department"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
          {deptMsg.text && (
            <Alert
              type={deptMsg.type === 'success' ? 'success' : 'error'}
              message={deptMsg.text}
            />
          )}

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Department Code *
            </label>
            <input
              type="text"
              required
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
              placeholder="e.g. MECH, CIVIL, AI"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Full Department Name *
            </label>
            <input
              type="text"
              required
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="e.g. Mechanical Engineering"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              placeholder="Brief department statement..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deptSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {deptSubmitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Class Section Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title="Add Class Section Division"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
          {classMsg.text && (
            <Alert
              type={classMsg.type === 'success' ? 'success' : 'error'}
              message={classMsg.text}
            />
          )}

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Department *
            </label>
            <select
              value={classDept}
              onChange={(e) => setClassDept(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Year *</label>
              <select
                value={classYear}
                onChange={(e) => setClassYear(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Semester *
              </label>
              <select
                value={classSem}
                onChange={(e) => setClassSem(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Section Name *
              </label>
              <input
                type="text"
                required
                value={classSec}
                onChange={(e) => setClassSec(e.target.value.toUpperCase())}
                placeholder="e.g. A, B, C"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Max Capacity
              </label>
              <input
                type="number"
                min={1}
                value={classCapacity}
                onChange={(e) => setClassCapacity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsClassModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={classSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {classSubmitting ? 'Adding...' : 'Create Class Section'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDepartments;
