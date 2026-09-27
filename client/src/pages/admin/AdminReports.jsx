import React from 'react';
import { getApiBaseUrl } from '../../services/api';
import {
  FileSpreadsheet,
  Download,
  ClipboardCheck,
  Award,
  SendHorizontal,
  GraduationCap,
  FileCheck2,
} from 'lucide-react';

const AdminReports = () => {
  const reports = [
    {
      title: 'Institutional Attendance Report',
      description: 'Comprehensive lecture-by-lecture attendance records with student roll numbers, subjects, timestamps, and presence status.',
      endpoint: '/api/reports/attendance/csv',
      icon: ClipboardCheck,
      color: 'indigo',
    },
    {
      title: 'Internal Continuous Assessment Marks',
      description: 'Test scores, max marks, obtained marks, and percentages across Internal Assessment 1, 2, and Midterm evaluations.',
      endpoint: '/api/reports/internal-marks/csv',
      icon: FileCheck2,
      color: 'emerald',
    },
    {
      title: 'Semester Examination Results & Grades',
      description: 'Official end-semester university results with course credits, SGPA points, final letter grades (O, A+, A), and pass/fail statistics.',
      endpoint: '/api/reports/exam-results/csv',
      icon: Award,
      color: 'purple',
    },
    {
      title: 'Student Leave & Absence Audit',
      description: 'Official audit trail of all student leave applications, start/end dates, approval statuses, reviewer names, and remarks.',
      endpoint: '/api/reports/leaves/csv',
      icon: SendHorizontal,
      color: 'amber',
    },
  ];

  const handleDownloadCSV = (endpoint, filename) => {
    const token = localStorage.getItem('campusconnect_token');
    const baseUrl = getApiBaseUrl().replace(/\/api$/, '');
    const url = `${baseUrl}${endpoint}`;
    
    // Fetch with authorization header and trigger file download
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Export failed');
        return res.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => {
        alert('Failed to export CSV: ' + err.message);
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Institutional Reports & CSV Exports</h2>
        <p className="text-xs text-slate-500 mt-1">
          Export verified university academic data, attendance logs, and examination records in standard CSV format.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((rep, idx) => {
          const Icon = rep.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{rep.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{rep.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  Format: Microsoft Excel CSV
                </span>
                <button
                  onClick={() =>
                    handleDownloadCSV(rep.endpoint, `${rep.title.toLowerCase().replace(/\s+/g, '_')}.csv`)
                  }
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminReports;
