import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import { BookOpen, Plus, Download, Trash2, Upload, FileCode } from 'lucide-react';

const FacultyStudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('3');
  const [semester, setSemester] = useState('5');
  const [section, setSection] = useState('A');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState({ type: '', text: '' });

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/study-materials');
      if (res.data.success) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
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
          setSubject(sRes.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    setUploadMsg({ type: '', text: '' });

    if (!title || !department || !subject || !file) {
      setUploadMsg({ type: 'error', text: 'Please fill all required fields and choose a file.' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('department', department);
      formData.append('year', year);
      formData.append('semester', semester);
      formData.append('section', section);
      formData.append('subject', subject);
      formData.append('file', file);

      const res = await api.post('/study-materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setUploadMsg({ type: 'success', text: 'Study material uploaded successfully!' });
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setTitle('');
          setDescription('');
          setFile(null);
          setUploadMsg({ type: '', text: '' });
          fetchMaterials();
        }, 1200);
      }
    } catch (err) {
      setUploadMsg({
        type: 'error',
        text: err.response?.data?.message || 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this study material?')) return;
    try {
      await api.delete(`/study-materials/${id}`);
      fetchMaterials();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Study Materials Repository</h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload lecture notes, presentations, and readings directly to target classes.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Study Material</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading course study materials..." />
      ) : materials.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No materials uploaded"
          description="Upload your first lecture notes, slides, or manuals for your students."
          actionLabel="Upload Material"
          onAction={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((mat) => (
            <div
              key={mat._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {mat.subject?.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {mat.department?.code} Y{mat.year} S{mat.semester} Sec {mat.section}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">{mat.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {mat.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {new Date(mat.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center space-x-2">
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(mat._id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Class Study Material"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUploadMaterial} className="space-y-4 text-xs">
          {uploadMsg.text && (
            <Alert
              type={uploadMsg.type === 'success' ? 'success' : 'error'}
              message={uploadMsg.text}
            />
          )}

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Material Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 4: Computer Networks Routing Protocols"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide chapter overview or key concepts covered..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Class Targeting */}
          <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
            <span className="font-bold text-indigo-900 block text-xs">
              Target Student Class (Students in this section will see this material)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Dept</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="1">Yr 1</option>
                  <option value="2">Yr 2</option>
                  <option value="3">Yr 3</option>
                  <option value="4">Yr 4</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Sem</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Sem {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Sec</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Subject *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Educational File (PDF, DOC, PPT) *
            </label>
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 font-semibold"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all"
            >
              {uploading ? 'Uploading...' : 'Publish Material'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyStudyMaterials;
