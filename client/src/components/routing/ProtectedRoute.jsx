import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <LoadingSpinner message="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own role dashboard
    const roleRoutes = {
      admin: '/admin/dashboard',
      hod: '/hod/dashboard',
      faculty: '/faculty/dashboard',
      student: '/student/dashboard',
    };
    const targetRoute = roleRoutes[user.role] || '/login';
    return <Navigate to={targetRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;
