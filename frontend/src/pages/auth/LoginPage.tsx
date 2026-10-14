import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Lock, Mail, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    switchDemoRole(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'staff') navigate('/staff');
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-teal-600/30">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Campus Canteen
          </h1>
          <p className="text-xs text-slate-500">
            Order fresh meals, track preparation, or manage kitchen queues.
          </p>
        </div>

        {/* Demo Fast-Switch Buttons for Reviewers / Faculty */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-teal-900">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-extrabold uppercase tracking-wider">Evaluation Quick Login</span>
          </div>
          <p className="text-[11px] text-teal-800 leading-relaxed">
            One-click evaluation access for evaluators, faculty & project demonstration:
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="py-2 px-1 rounded-xl bg-white text-teal-800 text-xs font-bold border border-teal-200 hover:bg-teal-600 hover:text-white transition shadow-xs"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('staff')}
              className="py-2 px-1 rounded-xl bg-white text-amber-800 text-xs font-bold border border-amber-200 hover:bg-amber-600 hover:text-white transition shadow-xs"
            >
              Kitchen Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-1 rounded-xl bg-white text-purple-800 text-xs font-bold border border-purple-200 hover:bg-purple-600 hover:text-white transition shadow-xs"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md shadow-slate-200/50 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <Link to="/auth/forgot-password" className="text-xs font-bold text-teal-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Don't have an account? </span>
            <Link to="/auth/register" className="text-xs font-extrabold text-teal-600 hover:underline">
              Register as Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
