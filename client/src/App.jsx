import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentStudyMaterials from './pages/student/StudentStudyMaterials';
import StudentInternalMarks from './pages/student/StudentInternalMarks';
import StudentExaminationResults from './pages/student/StudentExaminationResults';
import StudentPerformance from './pages/student/StudentPerformance';
import StudentLeave from './pages/student/StudentLeave';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import StudentNotifications from './pages/student/StudentNotifications';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyClasses from './pages/faculty/FacultyClasses';
import FacultyAttendance from './pages/faculty/FacultyAttendance';
import FacultyAssignments from './pages/faculty/FacultyAssignments';
import FacultyStudyMaterials from './pages/faculty/FacultyStudyMaterials';
import FacultyInternalMarks from './pages/faculty/FacultyInternalMarks';
import FacultyAnnouncements from './pages/faculty/FacultyAnnouncements';
import FacultyStudentPerformance from './pages/faculty/FacultyStudentPerformance';
import FacultyProfile from './pages/faculty/FacultyProfile';

// HOD Pages
import HODDashboard from './pages/hod/HODDashboard';
import HODStudents from './pages/hod/HODStudents';
import HODFaculty from './pages/hod/HODFaculty';
import HODLeaves from './pages/hod/HODLeaves';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminFaculty from './pages/admin/AdminFaculty';
import AdminHODs from './pages/admin/AdminHODs';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminTimetable from './pages/admin/AdminTimetable';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminReports from './pages/admin/AdminReports';

// Root Redirect Helper
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const roleRedirects = {
    admin: '/admin/dashboard',
    hod: '/hod/dashboard',
    faculty: '/faculty/dashboard',
    student: '/student/dashboard',
  };

  return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="study-materials" element={<StudentStudyMaterials />} />
            <Route path="internal-marks" element={<StudentInternalMarks />} />
            <Route path="results" element={<StudentExaminationResults />} />
            <Route path="performance" element={<StudentPerformance />} />
            <Route path="leave" element={<StudentLeave />} />
            <Route path="announcements" element={<StudentAnnouncements />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>

          {/* Faculty Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'hod', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="classes" element={<FacultyClasses />} />
            <Route path="attendance" element={<FacultyAttendance />} />
            <Route path="assignments" element={<FacultyAssignments />} />
            <Route path="study-materials" element={<FacultyStudyMaterials />} />
            <Route path="internal-marks" element={<FacultyInternalMarks />} />
            <Route path="announcements" element={<FacultyAnnouncements />} />
            <Route path="performance" element={<FacultyStudentPerformance />} />
            <Route path="profile" element={<FacultyProfile />} />
          </Route>

          {/* HOD Routes */}
          <Route
            path="/hod"
            element={
              <ProtectedRoute allowedRoles={['hod', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<HODDashboard />} />
            <Route path="students" element={<HODStudents />} />
            <Route path="faculty" element={<HODFaculty />} />
            <Route path="attendance" element={<FacultyAttendance />} />
            <Route path="timetable" element={<AdminTimetable />} />
            <Route path="internal-marks" element={<FacultyInternalMarks />} />
            <Route path="assignments" element={<FacultyAssignments />} />
            <Route path="study-materials" element={<FacultyStudyMaterials />} />
            <Route path="leaves" element={<HODLeaves />} />
            <Route path="announcements" element={<FacultyAnnouncements />} />
            <Route path="results" element={<StudentExaminationResults />} />
            <Route path="performance" element={<FacultyStudentPerformance />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="faculty" element={<AdminFaculty />} />
            <Route path="hods" element={<AdminHODs />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="timetable" element={<AdminTimetable />} />
            <Route path="attendance" element={<FacultyAttendance />} />
            <Route path="internal-marks" element={<FacultyInternalMarks />} />
            <Route path="assignments" element={<FacultyAssignments />} />
            <Route path="study-materials" element={<FacultyStudyMaterials />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="leaves" element={<AdminLeaves />} />
            <Route path="results" element={<StudentExaminationResults />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
