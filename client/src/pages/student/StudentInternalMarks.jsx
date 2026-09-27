import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Award, BookOpen, CheckCircle, Percent } from 'lucide-react';

const StudentInternalMarks = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/internal-marks/student');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load internal marks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Retrieving your internal assessment marks..." />;
  }

  const summary = data?.summary || { totalMax: 0, totalObtained: 0, overallPercentage: 0, testCount: 0 };
  const subjectWise = data?.subjectWise || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Internal Marks & Assessments</h2>
        <p className="text-xs text-slate-500 mt-1">
          Performance across periodic tests, midterms, and internal practical assessments.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Internals"
          value={`${summary.overallPercentage}%`}
          subtitle="Weighted assessment average"
          icon={Percent}
          color="indigo"
        />

        <StatCard
          title="Marks Obtained"
          value={summary.totalObtained}
          subtitle={`Out of ${summary.totalMax} Maximum Marks`}
          icon={Award}
          color="emerald"
        />

        <StatCard
          title="Tests Completed"
          value={summary.testCount}
          subtitle="Internal evaluations"
          icon={CheckCircle}
          color="sky"
        />

        <StatCard
          title="Courses Evaluated"
          value={subjectWise.length}
          subtitle="This academic semester"
          icon={BookOpen}
          color="purple"
        />
      </div>

      {/* Subject-Wise Cards */}
      {subjectWise.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No internal marks posted"
          description="Your instructors have not recorded internal test scores for this semester yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectWise.map((subject) => (
            <div
              key={subject.subjectId}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{subject.subjectName}</h3>
                  <span className="text-xs font-semibold text-indigo-600">{subject.subjectCode}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-indigo-600 block">
                    {subject.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {subject.totalObtained} / {subject.totalMax}
                  </span>
                </div>
              </div>

              {/* Assessment list */}
              <div className="space-y-2.5">
                {subject.tests.map((test, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">{test.examType}</span>
                      {test.remarks && (
                        <span className="text-[11px] text-slate-400 italic">{test.remarks}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">
                        {test.obtainedMarks} / {test.maxMarks}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          test.percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {test.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentInternalMarks;
