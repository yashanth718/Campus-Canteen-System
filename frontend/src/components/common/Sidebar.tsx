import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  Users,
  ChefHat,
  ShoppingBag,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mode: 'admin' | 'staff';
}

export const Sidebar: React.FC<SidebarProps> = ({ mode }) => {
  const { logout, userProfile } = useAuth();

  const adminLinks = [
    { to: '/admin', label: 'Analytics & KPIs', icon: LayoutDashboard },
    { to: '/admin/menu', label: 'Food Menu Manager', icon: Utensils },
    { to: '/admin/users', label: 'Users & Staff Roles', icon: Users },
  ];

  const staffLinks = [
    { to: '/staff', label: 'Kitchen Live Stream', icon: ChefHat },
  ];

  const links = mode === 'admin' ? adminLinks : staffLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-4.5rem)]">
      <div className="space-y-6">
        {/* Header Mode Title */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {mode === 'admin' ? 'Administrator' : 'Kitchen Operations'}
          </span>
          <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">
            {mode === 'admin' ? 'Management Console' : 'Kitchen Display System'}
          </h3>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Return & Logout */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Switch to Student Menu</span>
        </Link>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
