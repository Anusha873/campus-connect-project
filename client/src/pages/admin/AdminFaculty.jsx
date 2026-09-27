import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import { Users, Plus, Search, Edit2, Trash2, Award, UserCheck, Shield } from 'lucide-react';

const AdminFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form Fields
  const [facultyId, setFacultyId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [password, setPassword] = useState('password123');
  const [isHOD, setIsHOD] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Batch assignment state
  const [assignedBatches, setAssignedBatches] = useState([]);
  const [batchYear, setBatchYear] = useState('3');
  const [batchSem, setBatchSem] = useState('5');
  const [batchSec, setBatchSec] = useState('A');
  const [batchSubject, setBatchSubject] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [modalMsg, setModalMsg] = useState({ type: '', text: '' });

  // Delete Confirm
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  useEffect(() => {
    fetchFaculty();
    const fetchMeta = async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          api.get('/departments'),
          api.get('/subjects'),
        ]);
        if (dRes.data.success && dRes.data.data.length > 0) {
          setDepartments(dRes.data.data);
          setDepartment(dRes.data.data[0]._id);
        }
        if (sRes.data.success && sRes.data.data.length > 0) {
          setSubjects(sRes.data.data);
          setBatchSubject(sRes.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFacultyId(`FAC-CSE-${Math.floor(10 + Math.random() * 90)}`);
    setName('');
    setEmail('');
    setPhone('');
    setDesignation('Assistant Professor');
    setPassword('password123');
    setIsHOD(false);
    setSelectedSubjects([]);
    setAssignedBatches([]);
    setModalMsg({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (fac) => {
    setIsEditing(true);
    setCurrentId(fac._id);
    setFacultyId(fac.facultyId);
    setName(fac.name);
    setEmail(fac.email);
    setPhone(fac.phone || '');
    setDepartment(fac.department?._id || fac.department);
    setDesignation(fac.designation);
    setIsHOD(fac.isHOD);
    setSelectedSubjects(fac.subjects?.map((s) => s._id || s) || []);
    setAssignedBatches(
      fac.assignedClasses?.map((c) => ({
        department: c.department?._id || c.department,
        year: c.year,
        semester: c.semester,
        section: c.section,
        subject: c.subject?._id || c.subject,
      })) || []
    );
    setModalMsg({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleAddBatch = () => {
    if (!department || !batchSubject) return;
    const exists = assignedBatches.some(
      (b) =>
        b.year === Number(batchYear) &&
        b.semester === Number(batchSem) &&
        b.section === batchSec &&
        b.subject === batchSubject
    );
    if (!exists) {
      setAssignedBatches((prev) => [
        ...prev,
        {
          department,
          year: Number(batchYear),
          semester: Number(batchSem),
          section: batchSec,
          subject: batchSubject,
        },
      ]);
    }
  };

  const handleRemoveBatch = (index) => {
    setAssignedBatches((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleSubject = (subId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    setModalMsg({ type: '', text: '' });

    try {
      setSubmitting(true);
      const payload = {
        facultyId,
        name,
        email,
        phone,
        department,
        designation: isHOD ? 'Head of Department' : designation,
        password,
        isHOD,
        subjects: selectedSubjects,
        assignedClasses: assignedBatches,
      };

      if (isEditing) {
        await api.put(`/faculty/${currentId}`, payload);
        setModalMsg({ type: 'success', text: 'Faculty details updated successfully!' });
      } else {
        await api.post('/faculty', payload);
        setModalMsg({ type: 'success', text: 'New faculty member registered successfully!' });
      }

      setTimeout(() => {
        setIsModalOpen(false);
        fetchFaculty();
      }, 1000);
    } catch (err) {
      setModalMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save faculty record',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaculty = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/faculty/${deleteTarget._id}`);
      setIsConfirmOpen(false);
      fetchFaculty();
    } catch (err) {
      alert(err.response?.data?.message || 'Deactivation failed');
    }
  };

  const filtered = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.facultyId.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      selectedDept === 'all' ||
      f.department?._id === selectedDept ||
      f.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Faculty & HOD Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Recruit faculty members, appoint department chairs (HODs), and assign courses & class sections.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name, ID, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.code} - {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Faculty Table */}
      {loading ? (
        <LoadingSpinner message="Loading faculty directory..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              Institutional Faculty Directory ({filtered.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">ID & Name</th>
                  <th className="py-3.5 px-6">Email & Phone</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4 text-center">Role / Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((fac) => (
                  <tr key={fac._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-900 block">{fac.name}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{fac.facultyId}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-medium text-slate-800 block">{fac.email}</span>
                      <span className="text-[11px] text-slate-400">{fac.phone || '—'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {fac.department?.code || 'CSE'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{fac.designation}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={fac.isHOD ? 'warning' : 'primary'}>
                        {fac.isHOD ? 'HOD' : 'Faculty'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => openEditModal(fac)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Details & Classes"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(fac);
                            setIsConfirmOpen(true);
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Deactivate Faculty"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register / Edit Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Faculty Details' : 'Register New Faculty'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveFaculty} className="space-y-4 text-xs">
          {modalMsg.text && (
            <Alert
              type={modalMsg.type === 'success' ? 'success' : 'error'}
              message={modalMsg.text}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Faculty ID *
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. / Prof. Name"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Institutional Email *
              </label>
              <input
                type="email"
                required
                disabled={isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@campusconnect.edu"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
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
                Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Associate Professor"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {!isEditing && (
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Initial Password *
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          )}

          {/* HOD Checkbox */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-900 block">Appoint as Head of Department (HOD)</span>
              <p className="text-[11px] text-amber-700">
                Grant HOD administrative controls for the selected department.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isHOD}
              onChange={(e) => setIsHOD(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded"
            />
          </div>

          {/* Teaching Courses Selector */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Qualified Subject Courses
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-36 overflow-y-auto">
              {subjects.map((sub) => {
                const checked = selectedSubjects.includes(sub._id);
                return (
                  <button
                    key={sub._id}
                    type="button"
                    onClick={() => handleToggleSubject(sub._id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      checked
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sub.code} - {sub.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Classes Manager */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-800 block">Assign Teaching Lecture Batches</span>
            <div className="grid grid-cols-4 gap-2">
              <select
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>

              <select
                value={batchSem}
                onChange={(e) => setBatchSem(e.target.value)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>

              <select
                value={batchSec}
                onChange={(e) => setBatchSec(e.target.value)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <option value="A">Sec A</option>
                <option value="B">Sec B</option>
                <option value="C">Sec C</option>
              </select>

              <button
                type="button"
                onClick={handleAddBatch}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs"
              >
                + Add Batch
              </button>
            </div>

            {/* List of current assigned classes */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {assignedBatches.map((b, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  <span>
                    Y{b.year} S{b.semester} Sec {b.section}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBatch(idx)}
                    className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
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
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Confirm Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteFaculty}
        title="Deactivate Faculty Member"
        message={`Are you sure you want to deactivate ${deleteTarget?.name}? They will lose portal login privileges.`}
        confirmText="Deactivate"
        danger={true}
      />
    </div>
  );
};

export default AdminFaculty;
