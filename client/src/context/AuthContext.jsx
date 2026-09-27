import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campusconnect_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details on load if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('campusconnect_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Session expired or invalid:', err.message);
          localStorage.removeItem('campusconnect_token');
          localStorage.removeItem('campusconnect_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('campusconnect_token', receivedToken);
        localStorage.setItem('campusconnect_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Network error occurred during login';
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('campusconnect_token', receivedToken);
        localStorage.setItem('campusconnect_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Network error occurred during registration';
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Non-fatal if backend logout call errors
    } finally {
      localStorage.removeItem('campusconnect_token');
      localStorage.removeItem('campusconnect_user');
      setToken(null);
      setUser(null);
      window.location.href = '/login';
    }
  };

  // Update user in state
  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('campusconnect_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
