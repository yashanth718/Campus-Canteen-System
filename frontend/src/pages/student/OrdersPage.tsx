import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Clock, Calendar, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return ['placed', 'accepted', 'preparing', 'ready'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['collected', 'cancelled'].includes(order.status);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track live preparation status and view your college canteen order receipts.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({orders.filter((o) => ['placed', 'accepted', 'preparing', 'ready'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past ({orders.filter((o) => ['collected', 'cancelled'].includes(o.status)).length})
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching your orders..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description={
            filter === 'active'
              ? 'You have no active orders currently in the kitchen.'
              : 'You have not placed any orders yet. Check out our menu!'
          }
          actionText="Browse Menu"
          onAction={() => (window.location.href = '/')}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isLive = ['placed', 'accepted', 'preparing', 'ready'].includes(order.status);

            return (
              <div
                key={order.orderId}
                className={`bg-white rounded-3xl p-6 border transition hover:shadow-md ${
                  isLive ? 'border-teal-300 ring-2 ring-teal-500/10' : 'border-slate-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">#{order.orderId}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.paymentStatus} size="sm" />
                    <Link
                      to={`/orders/${order.orderId}`}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition"
                    >
                      <span>{isLive ? 'Live Tracker' : 'View Receipt'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-slate-600 font-medium">
                    {order.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                  </div>

                  <div className="text-sm font-extrabold text-slate-900">
                    Total: <span className="text-teal-700">₹{order.total}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
