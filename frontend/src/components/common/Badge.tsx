import React from 'react';
import { OrderStatus, PaymentStatus } from '../../types';

interface BadgeProps {
  status: OrderStatus | PaymentStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-bold',
  }[size];

  switch (status.toLowerCase()) {
    case 'placed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Placed
        </span>
      );
    case 'accepted':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Accepted
        </span>
      );
    case 'preparing':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses} animate-pulse`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Preparing 🔥
        </span>
      );
    case 'ready':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses} shadow-sm ring-2 ring-emerald-500/20`}>
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
          Ready for Pickup 🔔
        </span>
      );
    case 'collected':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Collected ✓
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Cancelled
        </span>
      );
    case 'paid':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses}`}>
          Paid ✓
        </span>
      );
    case 'pending':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          Payment Pending
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-gray-100 text-gray-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
