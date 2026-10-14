import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ChefHat, Search, Filter, RefreshCw, Flame, Bell, CheckCircle2, Clock } from 'lucide-react';
import { db } from '../../config/firebase';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { StaffOrderCard } from '../../components/staff/StaffOrderCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const StaffDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Real-time Firestore listener for kitchen orders
  useEffect(() => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedOrders = snapshot.docs.map((doc) => doc.data() as Order);
          setOrders(fetchedOrders);
          setLoading(false);
        },
        (error) => {
          console.warn('[StaffDashboard] Listener fallback to REST API:', error.message);
          loadOrdersViaApi();
        }
      );

      return () => unsubscribe();
    } catch {
      loadOrdersViaApi();
    }
  }, []);

  const loadOrdersViaApi = async () => {
    try {
      setLoading(true);
      const data = await api.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders via API:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      setFeedbackMessage(`Order #${orderId} moved to "${nextStatus.toUpperCase()}"!`);
      setTimeout(() => setFeedbackMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    // Status filter
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.studentName.toLowerCase().includes(q) ||
        o.items.some((it) => it.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Pipeline counts
  const placedCount = orders.filter((o) => o.status === 'placed').length;
  const acceptedCount = orders.filter((o) => o.status === 'accepted').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const collectedCount = orders.filter((o) => o.status === 'collected').length;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <ChefHat className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Kitchen Display System (KDS)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>Manage live campus canteen orders & update preparation statuses in real time.</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Feed Active
            </span>
          </p>
        </div>

        <button
          onClick={loadOrdersViaApi}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Stage KPI Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter(statusFilter === 'placed' ? 'all' : 'placed')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'placed'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Incoming</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-blue-700">{placedCount}</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-[11px] font-semibold text-slate-600 mt-1 block">New Placed</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'accepted' ? 'all' : 'accepted')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'accepted'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Queued</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-indigo-700">{acceptedCount}</span>
            <ChefHat className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[11px] font-semibold text-slate-600 mt-1 block">Accepted</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'preparing' ? 'all' : 'preparing')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'preparing'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cooking</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-amber-700">{preparingCount}</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[11px] font-semibold text-slate-600 mt-1 block">On Stove 🔥</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'ready' ? 'all' : 'ready')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'ready'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pickup</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-emerald-700">{readyCount}</span>
            <Bell className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[11px] font-semibold text-slate-600 mt-1 block">Ready at Counter 🔔</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'collected' ? 'all' : 'collected')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'collected'
              ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-500/20'
              : 'bg-white border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Done</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-700">{collectedCount}</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[11px] font-semibold text-slate-600 mt-1 block">Collected</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, student name, dish..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {statusFilter !== 'all' && (
          <button
            onClick={() => setStatusFilter('all')}
            className="text-xs font-bold text-teal-600 hover:text-teal-700"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <LoadingSpinner message="Syncing kitchen feed..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="No Orders Found"
          description={
            statusFilter !== 'all'
              ? `No active orders currently in "${statusFilter}" state.`
              : 'No orders are in the kitchen pipeline right now.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <StaffOrderCard
              key={order.orderId}
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
