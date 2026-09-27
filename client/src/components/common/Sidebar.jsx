import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock,
  BookOpen,
  FileText,
  FileCheck2,
  BellRing,
  SendHorizontal,
  Award,
  BarChart3,
  FileSpreadsheet,
  UserCheck,
  UserCircle,
  FolderOpen,
  LogOut,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  // Navigation configs per role
  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: GraduationCap },
    { name: 'Faculty', path: '/admin/faculty', icon: Users },
    { name: 'HODs & Heads', path: '/admin/hods', icon: UserCheck },
    { name: 'Departments & Classes', path: '/admin/departments', icon: Building2 },
    { name: 'Timetable', path: '/admin/timetable', icon: Clock },
    { name: 'Attendance Records', path: '/admin/attendance', icon: ClipboardCheck },
    { name: 'Internal Marks', path: '/admin/internal-marks', icon: FileCheck2 },
    { name: 'Assignments', path: '/admin/assignments', icon: FileText },
    { name: 'Study Materials', path: '/admin/study-materials', icon: BookOpen },
    { name: 'Announcements', path: '/admin/announcements', icon: BellRing },
    { name: 'Leave Requests', path: '/admin/leaves', icon: SendHorizontal },
    { name: 'Exam Results', path: '/admin/results', icon: Award },
    { name: 'Reports & Export', path: '/admin/reports', icon: FileSpreadsheet },
  ];

  const hodNav = [
    { name: 'Department Dashboard', path: '/hod/dashboard', icon: LayoutDashboard },
    { name: 'Dept Students', path: '/hod/students', icon: GraduationCap },
    { name: 'Dept Faculty', path: '/hod/faculty', icon: Users },
    { name: 'Attendance Monitor', path: '/hod/attendance', icon: ClipboardCheck },
    { name: 'Timetable', path: '/hod/timetable', icon: Clock },
    { name: 'Internal Marks', path: '/hod/internal-marks', icon: FileCheck2 },
    { name: 'Assignments', path: '/hod/assignments', icon: FileText },
    { name: 'Study Materials', path: '/hod/study-materials', icon: BookOpen },
    { name: 'Leave Approvals', path: '/hod/leaves', icon: SendHorizontal },
    { name: 'Dept Announcements', path: '/hod/announcements', icon: BellRing },
    { name: 'Examination Results', path: '/hod/results', icon: Award },
    { name: 'Performance Analytics', path: '/hod/performance', icon: BarChart3 },
  ];

  const facultyNav = [
    { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { name: 'My Classes & Students', path: '/faculty/classes', icon: Layers },
    { name: 'Mark Attendance', path: '/faculty/attendance', icon: ClipboardCheck },
    { name: 'Assignments & Submissions', path: '/faculty/assignments', icon: FileText },
    { name: 'Upload Study Materials', path: '/faculty/study-materials', icon: BookOpen },
    { name: 'Enter Internal Marks', path: '/faculty/internal-marks', icon: FileCheck2 },
    { name: 'Announcements', path: '/faculty/announcements', icon: BellRing },
    { name: 'Student Performance', path: '/faculty/performance', icon: BarChart3 },
    { name: 'My Profile', path: '/faculty/profile', icon: UserCircle },
  ];

  const studentNav = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: UserCircle },
    { name: 'Weekly Timetable', path: '/student/timetable', icon: Clock },
    { name: 'Attendance Tracking', path: '/student/attendance', icon: ClipboardCheck },
    { name: 'My Assignments', path: '/student/assignments', icon: FileText },
    { name: 'Study Materials', path: '/student/study-materials', icon: BookOpen },
    { name: 'Internal Marks', path: '/student/internal-marks', icon: FileCheck2 },
    { name: 'Examination Results', path: '/student/results', icon: Award },
    { name: 'Performance Matrix', path: '/student/performance', icon: BarChart3 },
    { name: 'Apply for Leave', path: '/student/leave', icon: SendHorizontal },
    { name: 'Announcements', path: '/student/announcements', icon: BellRing },
    { name: 'Notifications', path: '/student/notifications', icon: BellRing },
  ];

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return adminNav;
      case 'hod':
        return hodNav;
      case 'faculty':
        return facultyNav;
      case 'student':
        return studentNav;
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white font-['Outfit']">
                CampusConnect
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                ERP System
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
            {user?.profile?.name ? user.profile.name.charAt(0) : user?.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.profile?.name || user?.email.split('@')[0]}
            </p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-500/20 transition-all border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
