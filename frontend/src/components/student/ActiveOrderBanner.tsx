import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Bell, ArrowRight, Clock } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { api } from '../../services/api';

export const ActiveOrderBanner: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!userProfile?.uid) {
      setActiveOrder(null);
      return;
    }

    try {
      // Query active orders (status in ['placed', 'accepted', 'preparing', 'ready'])
      const q = query(
        collection(db, 'orders'),
        where('studentId', '==', userProfile.uid),
        where('status', 'in', ['placed', 'accepted', 'preparing', 'ready'])
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            // Pick most recent active order
            const orders = snapshot.docs.map((d) => d.data() as Order);
            orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setActiveOrder(orders[0]);
          } else {
            setActiveOrder(null);
          }
        },
        () => {
          // Fallback REST call
          api.getMyOrders().then((orders) => {
            const active = orders.find((o) =>
              ['placed', 'accepted', 'preparing', 'ready'].includes(o.status)
            );
            setActiveOrder(active || null);
          }).catch(() => {});
        }
      );

      return () => unsubscribe();
    } catch {
      // ignore
    }
  }, [userProfile?.uid]);

  if (!activeOrder) return null;

  const isReady = activeOrder.status === 'ready';

  return (
    <div
      className={`fixed bottom-5 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40 p-4 rounded-2xl shadow-xl backdrop-blur-md border transition-all animate-slideUp ${
        isReady
          ? 'bg-emerald-900/90 text-white border-emerald-400 ring-4 ring-emerald-400/30 animate-soft-pulse'
          : 'bg-slate-900/90 text-white border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isReady ? 'bg-emerald-500 text-white' : 'bg-teal-500 text-white'
            }`}
          >
            {isReady ? <Bell className="w-5 h-5 animate-swing" /> : <Flame className="w-5 h-5 animate-pulse" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
              {isReady ? 'Ready for Pickup!' : 'Active Order'}
            </span>
            <h4 className="text-sm font-bold truncate">#{activeOrder.orderId}</h4>
            <span className="text-xs text-slate-300 capitalize">Status: {activeOrder.status}</span>
          </div>
        </div>

        <Link
          to={`/orders/${activeOrder.orderId}`}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
            isReady ? 'bg-white text-emerald-900 hover:bg-emerald-50' : 'bg-teal-600 text-white hover:bg-teal-500'
          }`}
        >
          <span>Track</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
