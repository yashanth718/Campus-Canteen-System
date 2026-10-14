import React from 'react';
import { Check, Clock, ChefHat, Flame, Bell, CheckCircle2 } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderProgressTrackerProps {
  order: Order;
}

const STEPS: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  { status: 'placed', label: 'Placed', desc: 'Order received', icon: Clock },
  { status: 'accepted', label: 'Accepted', desc: 'Kitchen acknowledged', icon: ChefHat },
  { status: 'preparing', label: 'Preparing', desc: 'Cooking meal', icon: Flame },
  { status: 'ready', label: 'Ready', desc: 'Pick up at counter', icon: Bell },
  { status: 'collected', label: 'Collected', desc: 'Delivered to student', icon: CheckCircle2 },
];

export const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({ order }) => {
  const currentStatusIndex = STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center">
        <h3 className="text-lg font-bold text-rose-800">Order Cancelled</h3>
        <p className="text-sm text-rose-600 mt-1">This order has been cancelled.</p>
      </div>
    );
  }

  // Format time for timestamp history
  const getTimestampForStatus = (status: OrderStatus) => {
    const entry = order.statusHistory?.find((h) => h.status === status);
    if (!entry) return null;
    return new Date(entry.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
      {/* Prominent Alert for READY state */}
      {order.status === 'ready' && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 flex items-center gap-4 animate-bounce shadow-md shadow-emerald-500/10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Bell className="w-6 h-6 animate-swing" />
          </div>
          <div>
            <h4 className="font-extrabold text-emerald-900 text-base">Your Food is Hot & Ready! 🔔</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Please present Order Reference <strong className="underline">#{order.orderId}</strong> at the Canteen Collection Counter.
            </p>
          </div>
        </div>
      )}

      {/* Stepper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Live Order Status</span>
          <h3 className="text-xl font-extrabold text-slate-900 capitalize flex items-center gap-2">
            <span>{order.status}</span>
            {order.status === 'preparing' && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold animate-pulse">In Kitchen</span>}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">Estimated Pickup</span>
          <span className="text-sm font-bold text-teal-700">Counter #1 (Main Canteen)</span>
        </div>
      </div>

      {/* 5-Step Horizontal Tracker on Desktop, Vertical on Mobile */}
      <div className="relative">
        <div className="hidden md:flex items-center justify-between relative">
          {/* Progress Connecting Line */}
          <div className="absolute top-6 left-8 right-8 h-1 bg-slate-100 -z-0">
            <div
              className="h-full bg-teal-500 transition-all duration-700"
              style={{
                width: `${Math.max(0, (currentStatusIndex / (STEPS.length - 1)) * 100)}%`,
              }}
            />
          </div>

          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const timeStr = getTimestampForStatus(step.status);

            return (
              <div key={step.status} className="flex flex-col items-center text-center relative z-10 w-28">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                    isCurrent
                      ? 'bg-teal-600 text-white ring-4 ring-teal-500/20 scale-110 shadow-lg shadow-teal-500/30'
                      : isCompleted
                      ? 'bg-teal-500 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-6 h-6 stroke-[3]" /> : <Icon className="w-5 h-5" />}
                </div>

                <div className="mt-3">
                  <span
                    className={`block text-xs font-bold ${
                      isCurrent ? 'text-teal-900 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{step.desc}</span>
                  {timeStr && <span className="block text-[10px] font-semibold text-teal-600 mt-1">{timeStr}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Stepper */}
        <div className="md:hidden space-y-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const timeStr = getTimestampForStatus(step.status);

            return (
              <div key={step.status} className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-teal-600 text-white ring-4 ring-teal-500/20'
                      : isCompleted
                      ? 'bg-teal-500 text-white'
                      : 'bg-white border border-slate-200 text-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-bold ${
                        isCurrent ? 'text-teal-900 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                    {timeStr && <span className="text-xs font-semibold text-teal-600">{timeStr}</span>}
                  </div>
                  <p className="text-xs text-slate-400">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
