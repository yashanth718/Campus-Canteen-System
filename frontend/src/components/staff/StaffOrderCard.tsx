import React, { useState } from 'react';
import { Clock, ChefHat, Flame, Bell, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { StatusBadge } from '../common/Badge';

interface StaffOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
}

export const StaffOrderCard: React.FC<StaffOrderCardProps> = ({ order, onUpdateStatus }) => {
  const [updating, setUpdating] = useState(false);

  const handleAction = async (nextStatus: OrderStatus) => {
    try {
      setUpdating(true);
      await onUpdateStatus(order.orderId, nextStatus);
    } finally {
      setUpdating(false);
    }
  };

  const elapsedMinutes = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / 60000
  );

  return (
    <div
      className={`bg-white rounded-3xl p-5 border shadow-sm transition hover:shadow-md flex flex-col justify-between ${
        order.status === 'ready'
          ? 'border-emerald-300 ring-2 ring-emerald-500/20'
          : order.status === 'placed'
          ? 'border-blue-200'
          : 'border-slate-100'
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">#{order.orderId}</span>
              <StatusBadge status={order.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Student: <span className="font-bold text-slate-700">{order.studentName}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{elapsedMinutes}m ago</span>
            </div>
            <StatusBadge status={order.paymentStatus} size="sm" />
          </div>
        </div>

        {/* Order Items */}
        <div className="py-3 space-y-1.5">
          {order.items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-slate-800 font-semibold">
                <span className="w-5 inline-block text-teal-700 font-extrabold">{it.quantity}x</span>
                {it.name}
              </span>
              <span className="text-slate-500 font-medium">₹{it.subtotal}</span>
            </div>
          ))}
        </div>

        {/* Special Instructions if present */}
        {order.instructions && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2 mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Kitchen Note:</span>
              <p className="italic">{order.instructions}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer with valid transition button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total</span>
          <span className="text-base font-extrabold text-slate-900">₹{order.total}</span>
        </div>

        <div>
          {order.status === 'placed' && (
            <button
              onClick={() => handleAction('accepted')}
              disabled={updating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>{updating ? 'Updating...' : 'Accept Order'}</span>
            </button>
          )}

          {order.status === 'accepted' && (
            <button
              onClick={() => handleAction('preparing')}
              disabled={updating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold shadow-sm transition disabled:opacity-50"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{updating ? 'Updating...' : 'Start Cooking'}</span>
            </button>
          )}

          {order.status === 'preparing' && (
            <button
              onClick={() => handleAction('ready')}
              disabled={updating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{updating ? 'Updating...' : 'Mark as Ready'}</span>
            </button>
          )}

          {order.status === 'ready' && (
            <button
              onClick={() => handleAction('collected')}
              disabled={updating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{updating ? 'Updating...' : 'Mark Collected'}</span>
            </button>
          )}

          {order.status === 'collected' && (
            <span className="text-xs font-bold text-slate-400">Order Complete ✓</span>
          )}
        </div>
      </div>
    </div>
  );
};
