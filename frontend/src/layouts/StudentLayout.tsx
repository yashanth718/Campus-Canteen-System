import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { CartDrawer } from '../components/student/CartDrawer';
import { ActiveOrderBanner } from '../components/student/ActiveOrderBanner';

export const StudentLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Persistent global cart drawer and active order tracker */}
      <CartDrawer />
      <ActiveOrderBanner />

      {/* Modern Campus Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-600">Campus Cloud Canteen Ordering System</p>
        <p className="mt-1">Cloud Computing Final Year Project • Powered by React, Node.js & Cloud Firestore</p>
      </footer>
    </div>
  );
};
