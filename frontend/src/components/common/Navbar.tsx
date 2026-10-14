import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingBag,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ChefHat,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { NotificationDropdown } from '../student/NotificationDropdown';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { userProfile, role, logout, switchDemoRole, isDemoUser } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const handleSelectRole = (newRole: UserRole) => {
    switchDemoRole(newRole);
    setRoleSwitcherOpen(false);
    if (newRole === 'admin') navigate('/admin');
    else if (newRole === 'staff') navigate('/staff');
    else navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">Campus Canteen</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-extrabold uppercase tracking-wider">
                Cloud
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Fast & Fresh Online Dining</p>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/60">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-white transition"
          >
            Menu Catalog
          </Link>

          <Link
            to="/orders"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-white transition"
          >
            My Orders
          </Link>

          {(role === 'staff' || role === 'admin') && (
            <Link
              to="/staff"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-700 hover:bg-white transition"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen Staff</span>
            </Link>
          )}

          {role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-teal-700 hover:bg-white transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Demo Role Switcher for Faculty & Evaluator Review */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition shadow-xs"
              title="Switch demo evaluation role"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span className="capitalize">{role}</span>
              <ChevronDown className="w-3 h-3 text-teal-600" />
            </button>

            {roleSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                <span className="block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Role (Evaluation)
                </span>
                <button
                  onClick={() => handleSelectRole('student')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                    role === 'student' ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Student View</span>
                  {role === 'student' && <span className="text-[10px] bg-teal-600 text-white px-1.5 py-0.5 rounded-md">Active</span>}
                </button>
                <button
                  onClick={() => handleSelectRole('staff')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                    role === 'staff' ? 'bg-amber-50 text-amber-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Kitchen Staff View</span>
                  {role === 'staff' && <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded-md">Active</span>}
                </button>
                <button
                  onClick={() => handleSelectRole('admin')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                    role === 'admin' ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Admin Dashboard</span>
                  {role === 'admin' && <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-md">Active</span>}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* Cart Icon & Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition flex items-center justify-center"
            title="Open Cart Tray"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-900 rounded-full text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-bounce">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Profile / Logout */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1"
            >
              <User className="w-5 h-5" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {userProfile?.displayName || 'Campus User'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{userProfile?.email || 'user@canteen.edu'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wide">
                    {role}
                  </span>
                </div>

                <div className="pt-1">
                  <Link
                    to="/orders"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    My Order History
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
