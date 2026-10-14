import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';

export const CartPage: React.FC = () => {
  const {
    items,
    instructions,
    setInstructions,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
  } = useCart();

  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'test_mode' | 'cash' | 'razorpay'>('test_mode');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Idempotency key generated per checkout session
  const [idempotencyKey] = useState(() => `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setErrorMessage('');
    setSubmitting(true);

    try {
      const orderPayload = {
        items: items.map((ci) => ({
          itemId: ci.item.itemId,
          quantity: ci.quantity,
        })),
        instructions: instructions.trim(),
        paymentMethod,
        idempotencyKey,
      };

      const createdOrder = await api.createOrder(orderPayload);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Clear cart
      clearCart();

      // Navigate to live tracker
      navigate(`/orders/${createdOrder.orderId}`);
    } catch (err: any) {
      console.error('Order placement failed:', err);
      setErrorMessage(err.message || 'Failed to place order. Please check menu availability and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your Food Tray is Empty"
          description="You haven't added any dishes to your tray yet. Explore our delicious menu to get started!"
          actionText="Browse Menu Catalog"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Return button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Menu</span>
      </Link>

      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Checkout & Order Review</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review items, add special kitchen instructions, and choose payment mode.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-500 hover:text-rose-700 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition"
        >
          Clear Tray
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Items list & instructions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800">Selected Items ({items.length})</h3>

            <div className="divide-y divide-slate-100">
              {items.map(({ item, quantity }) => (
                <div key={item.itemId} className="py-3 flex items-center gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-100 flex-shrink-0 shadow-xs"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                    <span className="text-xs text-slate-400">₹{item.price} each</span>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                      ₹{item.price * quantity}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                    <button
                      onClick={() => updateQuantity(item.itemId, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-800">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.itemId, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.itemId)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Preparation Instructions (Optional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                placeholder="e.g. Less spicy sambar, pack chutney separately, extra tissues..."
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800">Select Payment Method</h3>

            <div className="space-y-3">
              {/* Test Mode Instant Payment */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'test_mode'
                    ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'test_mode'}
                  onChange={() => setPaymentMethod('test_mode')}
                  className="mt-1 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-teal-700" />
                    <span className="font-extrabold text-xs text-slate-900">
                      Test Mode (Instant Simulated Payment)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                      Recommended for Demo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Simulates immediate payment confirmation without entering real bank credentials. Perfect for testing and college project demonstrations.
                  </p>
                </div>
              </label>

              {/* Cash at Collection */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'cash'
                    ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="mt-1 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-xs text-slate-900">
                      Cash at Collection Counter
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Order is placed now; pay in cash when collecting your food tray at Counter #1.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Bill Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800">Bill Summary</h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Canteen Subsidized GST</span>
                <span className="text-teal-600 font-semibold">₹0 (Free)</span>
              </div>
              <div className="flex justify-between">
                <span>Counter Pickup Fee</span>
                <span className="text-teal-600 font-semibold">₹0</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
                <span>Grand Total</span>
                <span className="text-teal-700">₹{subtotal}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Prices are calculated and verified server-side against live menu records.</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full py-4 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Place Order • ₹{subtotal}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
