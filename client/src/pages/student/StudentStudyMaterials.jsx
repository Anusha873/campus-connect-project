import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  BookOpen,
  Search,
  Download,
  Calendar,
  FileCode,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react';

const StudentStudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/study-materials');
      if (res.data.success) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load study materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Format file size
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Extract unique subjects for filtering
  const subjects = Array.from(
    new Set(materials.map((m) => m.subject?.name).filter(Boolean))
  );

  const filteredMaterials = materials.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.subject?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesSubject =
      selectedSubject === 'all' || item.subject?.name === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Study Materials & Notes</h2>
          <p className="text-xs text-slate-500 mt-1">
            Course lecture slides, lab manuals, and readings targeted to your section.
          </p>
        </div>

        {/* Search & Subject Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, topics..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm w-full sm:w-56"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials List */}
      {loading ? (
        <LoadingSpinner message="Loading course study materials..." />
      ) : filteredMaterials.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No study materials found"
          description="Your instructors have not yet posted any notes for the selected search or filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((mat) => (
            <div
              key={mat._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {mat.subject?.code} • {mat.subject?.name}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {mat.fileType || 'DOC'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                  {mat.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {mat.description || 'Lecture notes and reference material.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5 text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{mat.uploadedBy?.name || 'Faculty Member'}</span>
                  </div>
                  <div>Size: {formatBytes(mat.fileSize)}</div>
                </div>

                <a
                  href={mat.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentStudyMaterials;
