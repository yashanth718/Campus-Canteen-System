import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Clock, ShieldCheck, AlertCircle, XCircle } from 'lucide-react';
import { db } from '../../config/firebase';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { OrderProgressTracker } from '../../components/student/OrderProgressTracker';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const OrderTrackerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  // Real-time Firestore snapshot listener on this specific order
  useEffect(() => {
    if (!id) return;

    try {
      const orderRef = doc(db, 'orders', id);
      const unsubscribe = onSnapshot(
        orderRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setOrder(docSnap.data() as Order);
            setLoading(false);
          } else {
            // Document not found in local client snapshot, attempt REST fetch
            fetchOrderFromApi(id);
          }
        },
        (error) => {
          console.warn('[RealTimeTracker] Listener fallback to REST API:', error.message);
          fetchOrderFromApi(id);
        }
      );

      return () => unsubscribe();
    } catch {
      fetchOrderFromApi(id);
    }
  }, [id]);

  const fetchOrderFromApi = async (orderId: string) => {
    try {
      const data = await api.getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Order not found or permission denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setCancelling(true);
      const updated = await api.updateOrderStatus(order.orderId, 'cancelled', 'Cancelled by student');
      setOrder(updated);
      setShowCancelDialog(false);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Connecting to live canteen kitchen feed..." />;
  }

  if (errorMessage || !order) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Order Not Available</h3>
        <p className="text-xs text-slate-500">{errorMessage || 'Could not locate order details.'}</p>
        <Link
          to="/orders"
          className="inline-block px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  const canCancel = ['placed', 'accepted'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Return button */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Order History</span>
      </Link>

      {/* Top Banner with Real-Time Notification Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Order #{order.orderId}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>Placed on {new Date(order.createdAt).toLocaleString()}</span>
            <span>•</span>
            <span className="text-teal-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
              Live Real-Time Sync Active
            </span>
          </p>
        </div>

        {canCancel && (
          <button
            onClick={() => setShowCancelDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition self-start sm:self-auto"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Order</span>
          </button>
        )}
      </div>

      {/* Visual Order Progress Stepper */}
      <OrderProgressTracker order={order} />

      {/* Order Itemized Receipt Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
          Order Summary & Payment Receipt
        </h3>

        {/* Item Rows */}
        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-xs">
                  {item.quantity}x
                </span>
                <span className="font-bold text-slate-800">{item.name}</span>
              </div>
              <span className="font-extrabold text-slate-900">₹{item.subtotal}</span>
            </div>
          ))}
        </div>

        {/* Special Instructions if provided */}
        {order.instructions && (
          <div className="p-3 rounded-2xl bg-slate-50 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-0.5">Kitchen Note:</span>
            <p className="italic">"{order.instructions}"</p>
          </div>
        )}

        {/* Financial Breakdown */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Campus Subsidy (GST)</span>
            <span className="text-teal-600 font-semibold">₹0 (Zero tax)</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method</span>
            <span className="font-bold text-slate-800 uppercase tracking-wide">
              {order.paymentMethod.replace('_', ' ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status</span>
            <StatusBadge status={order.paymentStatus} size="sm" />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
            <span>Total Paid / Payable</span>
            <span className="text-teal-700">₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for cancellation */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelOrder}
        title="Cancel This Order?"
        message="Are you sure you want to cancel your order? The canteen kitchen will be notified immediately."
        confirmText="Yes, Cancel Order"
        confirmVariant="danger"
        loading={cancelling}
      />
    </div>
  );
};
