import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e, demoEmail, demoPassword) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const targetEmail = demoEmail || email;
    const targetPassword = demoPassword || password;

    if (!targetEmail || !targetPassword) {
      setError('Please provide both email and password');
      setLoading(false);
      return;
    }

    const result = await login(targetEmail, targetPassword);
    setLoading(false);

    if (result.success) {
      // Determine redirection based on role
      const roleRedirects = {
        admin: '/admin/dashboard',
        hod: '/hod/dashboard',
        faculty: '/faculty/dashboard',
        student: '/student/dashboard',
      };
      const redirectPath = roleRedirects[result.user.role] || '/';
      navigate(redirectPath, { replace: true });
    } else {
      setError(result.message || 'Invalid email or password');
    }
  };

  const handleDemoLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleLogin(null, demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative backdrop glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white shadow-xl shadow-indigo-500/25 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
            CampusConnect
          </h1>
          <p className="text-sm text-indigo-200/80 mt-1">
            College Academic Management & ERP Platform
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with your institutional credentials to access your portal.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campusconnect.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Fast Demo Login Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Instant 1-Click Demo Login</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@campusconnect.edu', 'password123')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 text-left transition-colors group"
              >
                <div className="font-bold text-purple-700 group-hover:text-purple-800">👑 Admin</div>
                <div className="text-[10px] text-slate-500">Super Admin</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('hod.cse@campusconnect.edu', 'password123')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 text-left transition-colors group"
              >
                <div className="font-bold text-amber-700 group-hover:text-amber-800">🏛️ HOD (CSE)</div>
                <div className="text-[10px] text-slate-500">Dr. Ramesh</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('priya.sharma@campusconnect.edu', 'password123')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-left transition-colors group"
              >
                <div className="font-bold text-blue-700 group-hover:text-blue-800">👨‍🏫 Faculty</div>
                <div className="text-[10px] text-slate-500">Prof. Priya (CSE)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('aarav.sharma@campusconnect.edu', 'password123')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-left transition-colors group"
              >
                <div className="font-bold text-emerald-700 group-hover:text-emerald-800">🎓 Student A</div>
                <div className="text-[10px] text-slate-500">Aarav (Y3 S5 Sec A)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center space-x-1.5 text-xs text-indigo-200/60 mt-6">
          <ShieldCheck className="w-4 h-4" />
          <span>Protected by 256-bit JWT Encryption & Secure Role Gates</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
