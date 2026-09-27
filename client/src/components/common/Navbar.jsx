import React from 'react';
import { Menu, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  // Map path to friendly title
  const getPageTitle = (path) => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return 'Dashboard';
    const lastPart = parts[parts.length - 1];
    return lastPart
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-nav px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            CampusConnect College Management System
          </p>
        </div>
      </div>

      {/* Right: Notification & Profile */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <NotificationDropdown />

        {/* User Pill */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              {user?.profile?.name || user?.email}
            </div>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
              {role}
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {user?.profile?.name ? user.profile.name.charAt(0) : user?.email.charAt(0).toUpperCase()}
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
