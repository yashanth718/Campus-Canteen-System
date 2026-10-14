import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Utensils,
  Search,
  Filter,
  Flame,
  Bell,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../services/api';
import {
  AnalyticsSummary,
  HighestOrderedFoodResponse,
  EarningsBreakdown,
  Order,
} from '../../types';
import { KpiCard } from '../../components/admin/KpiCard';
import { DateRangePicker } from '../../components/admin/DateRangePicker';
import { HighestFoodCard } from '../../components/admin/HighestFoodCard';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const PIE_COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#10b981', '#64748b', '#ef4444'];

export const AdminDashboardPage: React.FC = () => {
  const [range, setRange] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [kpis, setKpis] = useState<AnalyticsSummary | null>(null);
  const [charts, setCharts] = useState<any | null>(null);
  const [highestFood, setHighestFood] = useState<HighestOrderedFoodResponse | null>(null);
  const [earnings, setEarnings] = useState<EarningsBreakdown | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('all');

  useEffect(() => {
    loadAnalytics();
  }, [range, customStart, customEnd]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const params = {
        range,
        startDate: customStart || undefined,
        endDate: customEnd || undefined,
      };

      const [summaryData, chartsData, highestData, earningsData, ordersData] = await Promise.all([
        api.getAnalyticsSummary(params),
        api.getAnalyticsCharts(params),
        api.getHighestFoodOfDay(),
        api.getEarnings(),
        api.getAllOrders({ limit: 100 }),
      ]);

      setKpis(summaryData);
      setCharts(chartsData);
      setHighestFood(highestData);
      setEarnings(earningsData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load analytics dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (tableStatusFilter !== 'all' && o.status !== tableStatusFilter) return false;
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.studentName.toLowerCase().includes(q) ||
        o.items.some((it) => it.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Dashboard Header & Range Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Campus Canteen Analytics & Intelligence</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time sales revenue, kitchen load distribution, food popularity, and customer metrics.
          </p>
        </div>

        <DateRangePicker
          range={range}
          onRangeChange={(newRange) => setRange(newRange)}
          startDate={customStart}
          endDate={customEnd}
          onCustomDateChange={(start, end) => {
            setCustomStart(start);
            setCustomEnd(end);
          }}
        />
      </div>

      {loading && !kpis ? (
        <LoadingSpinner message="Calculating real-time analytics from Cloud Firestore..." />
      ) : (
        <>
          {/* Summary KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              title="Realized Revenue"
              value={`₹${kpis?.realizedRevenue.toLocaleString('en-IN') || 0}`}
              subtitle={`Gross: ₹${kpis?.grossOrderValue.toLocaleString('en-IN') || 0} (Paid only)`}
              icon={IndianRupee}
              variant="teal"
            />
            <KpiCard
              title="Total Orders"
              value={kpis?.totalOrders || 0}
              subtitle={`${kpis?.ordersToday || 0} placed today`}
              icon={ShoppingBag}
              variant="blue"
            />
            <KpiCard
              title="Average Order Value"
              value={`₹${kpis?.averageOrderValue || 0}`}
              subtitle="Per customer transaction"
              icon={TrendingUp}
              variant="purple"
            />
            <KpiCard
              title="Unique Customers"
              value={kpis?.distinctStudents || 0}
              subtitle="Distinct students ordering"
              icon={Users}
              variant="emerald"
            />
          </div>

          {/* Kitchen Active Load Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-amber-600 animate-pulse" />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">Currently Cooking</span>
                  <span className="text-[11px] text-amber-700">Orders on stove</span>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-amber-800">{kpis?.ordersPreparing || 0}</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-emerald-600 animate-swing" />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Ready for Collection</span>
                  <span className="text-[11px] text-emerald-700">Waiting at counter #1</span>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-emerald-800">{kpis?.ordersReady || 0}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-slate-600" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Collected Meals</span>
                  <span className="text-[11px] text-slate-500">Delivered to students</span>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-slate-800">{kpis?.ordersCollected || 0}</span>
            </div>
          </div>

          {/* Section: Highest-Ordered Food of the Day */}
          <HighestFoodCard data={highestFood} loading={loading} />

          {/* Interactive Recharts Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Daily Orders Trend Line Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Daily Order Volume Trend</h3>
                  <p className="text-xs text-slate-400">Total orders received per calendar day</p>
                </div>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <ShoppingBag className="w-4 h-4" />
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts?.dailyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="orderCount"
                      name="Orders Placed"
                      stroke="#0d9488"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0d9488' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Daily Realized Revenue Area Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Realized Revenue Trend (₹)</h3>
                  <p className="text-xs text-slate-400">Total earnings from paid/collected orders</p>
                </div>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <IndianRupee className="w-4 h-4" />
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts?.dailyTrends || []}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val: any) => [`₹${val}`, 'Revenue']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue (₹)"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Food Item Popularity Bar Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Top Ordered Food Dishes</h3>
                  <p className="text-xs text-slate-400">Popularity ranked by total quantity ordered</p>
                </div>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Utensils className="w-4 h-4" />
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(charts?.popularItems || []).slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                    />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Bar dataKey="quantityOrdered" name="Quantity Ordered" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Hourly Order Distribution Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Hourly Canteen Rush Distribution</h3>
                  <p className="text-xs text-slate-400">Peak ordering hours across campus schedule</p>
                </div>
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.hourlyDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Bar dataKey="orderCount" name="Orders in Hour" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 5. Category-wise Sales Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Category-wise Sales Breakdown</h3>
                  <p className="text-xs text-slate-400">Revenue contribution per food category</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.categorySales || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val: any) => [`₹${val}`, 'Revenue']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" name="Sales (₹)" fill="#0d9488" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 6. Order Status Distribution Donut Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Order Status Distribution</h3>
                  <p className="text-xs text-slate-400">Current ratio of orders by lifecycle stage</p>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts?.statusDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="status"
                    >
                      {(charts?.statusDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section D: Earnings Analytics Summary */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Revenue & Earnings Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  ₹{earnings?.today.toLocaleString('en-IN') || 0}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Yesterday</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  ₹{earnings?.yesterday.toLocaleString('en-IN') || 0}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last 7 Days</span>
                <span className="text-xl font-extrabold text-teal-700 mt-1 block">
                  ₹{earnings?.last7Days.toLocaleString('en-IN') || 0}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last 30 Days</span>
                <span className="text-xl font-extrabold text-teal-700 mt-1 block">
                  ₹{earnings?.last30Days.toLocaleString('en-IN') || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Section E: Order Analytics Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Order Logs & Transactions</h3>
                <p className="text-xs text-slate-400">Search and filter all orders placed in the system</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search by ID, student, item..."
                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <select
                  value={tableStatusFilter}
                  onChange={(e) => setTableStatusFilter(e.target.value)}
                  className="text-xs p-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="placed">Placed</option>
                  <option value="accepted">Accepted</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="collected">Collected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Items</th>
                    <th className="py-3 px-3">Total</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredOrders.slice(0, 25).map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">#{ord.orderId}</td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(ord.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 font-semibold">{ord.studentName}</td>
                      <td className="py-3 px-3 max-w-xs truncate text-slate-600">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">₹{ord.total}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={ord.paymentStatus} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={ord.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
