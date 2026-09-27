import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  Filter,
} from 'lucide-react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  // Register / Edit Student Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form Fields
  const [studentId, setStudentId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('2004-01-01');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('B.Tech');
  const [year, setYear] = useState('3');
  const [semester, setSemester] = useState('5');
  const [section, setSection] = useState('A');
  const [admissionYear, setAdmissionYear] = useState('2023');
  const [address, setAddress] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalMsg, setModalMsg] = useState({ type: '', text: '' });

  // Delete Confirm State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  useEffect(() => {
    fetchStudents();
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success && res.data.data.length > 0) {
          setDepartments(res.data.data);
          setDepartment(res.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setStudentId(`ST-CSE-${Math.floor(10 + Math.random() * 90)}`);
    setRollNumber(`23CSE${Math.floor(100 + Math.random() * 899)}`);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('password123');
    setGender('Male');
    setDateOfBirth('2004-01-01');
    setAddress('Campus Hostel Block A');
    setParentName('');
    setParentPhone('');
    setModalMsg({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (st) => {
    setIsEditing(true);
    setCurrentId(st._id);
    setStudentId(st.studentId);
    setRollNumber(st.rollNumber);
    setName(st.name);
    setEmail(st.email);
    setPhone(st.phone || '');
    setGender(st.gender);
    setDateOfBirth(st.dateOfBirth ? st.dateOfBirth.split('T')[0] : '2004-01-01');
    setDepartment(st.department?._id || st.department);
    setCourse(st.course);
    setYear(String(st.year));
    setSemester(String(st.semester));
    setSection(st.section);
    setAdmissionYear(String(st.admissionYear));
    setAddress(st.address || '');
    setParentName(st.parentName || '');
    setParentPhone(st.parentPhone || '');
    setModalMsg({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setModalMsg({ type: '', text: '' });

    try {
      setSubmitting(true);
      const payload = {
        studentId,
        rollNumber,
        name,
        email,
        phone,
        password,
        gender,
        dateOfBirth,
        department,
        course,
        year: Number(year),
        semester: Number(semester),
        section,
        admissionYear: Number(admissionYear),
        address,
        parentName,
        parentPhone,
      };

      if (isEditing) {
        await api.put(`/students/${currentId}`, payload);
        setModalMsg({ type: 'success', text: 'Student profile updated successfully!' });
      } else {
        await api.post('/students', payload);
        setModalMsg({ type: 'success', text: 'New student registered successfully!' });
      }

      setTimeout(() => {
        setIsModalOpen(false);
        fetchStudents();
      }, 1000);
    } catch (err) {
      setModalMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save student',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/students/${deleteTarget._id}`);
      setIsConfirmOpen(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Deactivation failed');
    }
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      selectedDept === 'all' ||
      s.department?._id === selectedDept ||
      s.department === selectedDept;

    const matchesYear = selectedYear === 'all' || String(s.year) === selectedYear;

    return matchesSearch && matchesDept && matchesYear;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Administration</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register students, manage academic enrollments, and maintain student databases.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll no, student ID, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          <a
            href="http://localhost:5000/api/reports/attendance/csv"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </a>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <LoadingSpinner message="Loading student database..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              Registered Students Directory ({filtered.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">ID & Roll No</th>
                  <th className="py-3.5 px-6">Full Name & Email</th>
                  <th className="py-3.5 px-4 text-center">Batch</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-6">Parent / Contact</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-900 block">{st.rollNumber}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{st.studentId}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-900 block">{st.name}</span>
                      <span className="text-[11px] text-slate-500">{st.email}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                        Y{st.year} S{st.semester} - Sec {st.section}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {st.department?.code || 'CSE'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      <div className="font-medium text-slate-800">{st.parentName || '—'}</div>
                      <div className="text-[11px] text-slate-400">{st.parentPhone || '—'}</div>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => openEditModal(st)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(st);
                            setIsConfirmOpen(true);
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Deactivate Student"
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

      {/* Register / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Student Profile' : 'Register New Student'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
          {modalMsg.text && (
            <Alert
              type={modalMsg.type === 'success' ? 'success' : 'error'}
              message={modalMsg.text}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Student ID *
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
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
                placeholder="Student Name"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                placeholder="student@campusconnect.edu"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {!isEditing && (
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Default Password *
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
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">DOB *</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
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
              <label className="block font-semibold text-slate-700 uppercase mb-1">Course</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Year *</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Section *</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Admission Year
              </label>
              <input
                type="number"
                value={admissionYear}
                onChange={(e) => setAdmissionYear(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Parent Full Name"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Parent Emergency Phone *
              </label>
              <input
                type="text"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+91 9820011000"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Campus Hostel Block or City Address"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving Student...' : isEditing ? 'Save Changes' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Deactivate Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteStudent}
        title="Deactivate Student Account"
        message={`Are you sure you want to deactivate ${deleteTarget?.name} (${deleteTarget?.rollNumber})? This will suspend portal login.`}
        confirmText="Deactivate"
        danger={true}
      />
    </div>
  );
};

export default AdminStudents;
