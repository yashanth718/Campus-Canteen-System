import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentLayout } from '../layouts/StudentLayout';
import { StaffLayout } from '../layouts/StaffLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { HomePage } from '../pages/student/HomePage';
import { CartPage } from '../pages/student/CartPage';
import { OrdersPage } from '../pages/student/OrdersPage';
import { OrderTrackerPage } from '../pages/student/OrderTrackerPage';
import { NotificationsPage } from '../pages/student/NotificationsPage';
import { StaffDashboardPage } from '../pages/staff/StaffDashboardPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminMenuPage } from '../pages/admin/AdminMenuPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Student App Routes */}
      <Route element={<StudentLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
              <OrderTrackerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Staff Kitchen Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/staff" element={<StaffDashboardPage />} />
      </Route>

      {/* Admin Management & Analytics Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>

      {/* Authentication Pages */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
