import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Award, CheckCircle2, FileText, Printer } from 'lucide-react';

const StudentExaminationResults = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await api.get('/results/student');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load examination results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Generating your official semester result cards..." />;
  }

  const semesterCards = data?.semesterCards || [];
  const summary = data?.summary || { grandMax: 0, grandObtained: 0, overallPercentage: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Examination Results</h2>
          <p className="text-xs text-slate-500 mt-1">
            Official University Grade Sheets & Semester Result Cards.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print Grade Sheet</span>
        </button>
      </div>

      {semesterCards.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No exam results published"
          description="Your semester examination results have not been officially finalized yet."
        />
      ) : (
        <div className="space-y-8">
          {semesterCards.map((semCard) => (
            <div
              key={semCard.semester}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden"
            >
              {/* Result Card Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                    Official Grade Sheet
                  </span>
                  <h3 className="text-lg font-bold tracking-tight">
                    Semester {semCard.semester} End Examinations
                  </h3>
                  <p className="text-xs text-slate-300">
                    Result Status:{' '}
                    <span
                      className={`font-bold ${
                        semCard.status === 'Passed' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {semCard.status}
                    </span>
                  </p>
                </div>

                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-indigo-200 block">
                      Semester GPA
                    </span>
                    <span className="text-2xl font-black text-white">{semCard.gpa}</span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold text-indigo-200 block">
                      Percentage
                    </span>
                    <span className="text-lg font-bold text-white">{semCard.percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Table of Courses */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Subject Code</th>
                      <th className="py-3.5 px-6">Course Name</th>
                      <th className="py-3.5 px-4 text-center">Credits</th>
                      <th className="py-3.5 px-4 text-center">Max Marks</th>
                      <th className="py-3.5 px-4 text-center">Marks Obtained</th>
                      <th className="py-3.5 px-4 text-center">Grade</th>
                      <th className="py-3.5 px-6 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {semCard.results.map((res) => (
                      <tr key={res._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-indigo-600">
                          {res.subject?.code}
                        </td>
                        <td className="py-3.5 px-6 font-medium text-slate-900">
                          {res.subject?.name}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold">
                          {res.subject?.credits || 3}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-500">
                          {res.maxMarks}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                          {res.obtainedMarks}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                              res.grade === 'O' || res.grade === 'A+'
                                ? 'bg-purple-100 text-purple-800'
                                : res.grade === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {res.grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <span
                            className={`font-bold ${
                              res.status === 'Pass' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Summary Footer */}
                  <tfoot className="bg-slate-50/80 font-bold text-slate-800 border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="py-3.5 px-6">
                        Semester Total:
                      </td>
                      <td className="py-3.5 px-4 text-center">{semCard.totalMax}</td>
                      <td className="py-3.5 px-4 text-center text-indigo-600">
                        {semCard.totalObtained}
                      </td>
                      <td colSpan={2} className="py-3.5 px-6 text-right text-emerald-600">
                        SGPA: {semCard.gpa} / 10.0
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentExaminationResults;
