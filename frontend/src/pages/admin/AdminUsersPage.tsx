import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, UserX, Search, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { UserProfile, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminUsersPage: React.FC = () => {
  const { userProfile: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUid: string, newRole: UserRole) => {
    if (currentUser?.uid === targetUid && newRole !== 'admin') {
      alert('You cannot demote your own admin account.');
      return;
    }

    try {
      const updated = await api.updateUserRole(targetUid, newRole);
      setUsers((prev) => prev.map((u) => (u.uid === targetUid ? updated : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleToggleActive = async (targetUid: string, currentActive: boolean) => {
    if (currentUser?.uid === targetUid && currentActive) {
      alert('You cannot deactivate your own account.');
      return;
    }

    try {
      const updated = await api.updateUserActive(targetUid, !currentActive);
      setUsers((prev) => prev.map((u) => (u.uid === targetUid ? updated : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle active status');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.uid?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">User Access & Staff Role Control</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage canteen staff permissions, student access, and administrator rights.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'student' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setRoleFilter('staff')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'staff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'admin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-extrabold text-slate-900 block text-sm">
                          {user.displayName || 'Campus User'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">UID: {user.uid}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-semibold">{user.email}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          user.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : user.role === 'staff'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(user.uid, user.active !== false)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          user.active !== false
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {user.active !== false ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Deactivated</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                        className="text-xs p-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold"
                      >
                        <option value="student">Student</option>
                        <option value="staff">Kitchen Staff</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
