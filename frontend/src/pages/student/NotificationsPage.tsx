import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, Sparkles, ArrowLeft } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    requestPushPermission,
    pushPermissionStatus,
  } = useNotifications();

  const navigate = useNavigate();

  const handleItemClick = async (notifId: string, orderId?: string) => {
    await markAsRead(notifId);
    if (orderId) {
      navigate(`/orders/${orderId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Menu</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time kitchen alerts and order ready updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold transition self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Push Notification Opt-in Card */}
      {pushPermissionStatus === 'default' && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-amber-900">Enable Browser Push Notifications</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Receive instant popups on your device the moment your food is ready at the counter!
              </p>
            </div>
          </div>
          <button
            onClick={() => requestPushPermission()}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition whitespace-nowrap"
          >
            Allow Notifications
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications Yet"
          description="Your order preparation and collection updates will appear here in real time."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {notifications.map((n) => (
            <div
              key={n.notificationId}
              onClick={() => handleItemClick(n.notificationId, n.orderId)}
              className={`p-5 cursor-pointer transition hover:bg-slate-50 flex items-start gap-4 ${
                !n.read ? 'bg-teal-50/40' : 'bg-white'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${
                  !n.read ? 'bg-teal-600 ring-4 ring-teal-500/20' : 'bg-slate-200'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm ${!n.read ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                {n.orderId && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:underline mt-2">
                    <span>View Order #{n.orderId}</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
