import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    instructions,
    setInstructions,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    itemCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      {/* Background dismiss */}
      <div className="flex-1" onClick={() => setIsCartOpen(false)} />

      {/* Slide-out Panel */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Your Food Tray</h3>
              <p className="text-xs text-slate-500">{itemCount} {itemCount === 1 ? 'item' : 'items'} selected</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="font-bold text-slate-700 text-base">Your tray is empty</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Browse our delicious college canteen menu and add your favorite dishes!
              </p>
            </div>
          ) : (
            items.map(({ item, quantity }) => (
              <div
                key={item.itemId}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-200 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                  <span className="text-xs text-slate-400">₹{item.price} each</span>
                  <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                    ₹{item.price * quantity}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
                  <button
                    onClick={() => updateQuantity(item.itemId, -1)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.itemId, 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.itemId)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}

          {items.length > 0 && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Kitchen Instructions (Optional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                maxLength={200}
                placeholder="e.g. Less spicy, pack sambar separately, extra onions..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer & Checkout Button */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Canteen Subsidized GST</span>
                <span className="text-teal-600 font-medium">₹0 (Included)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-base font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-teal-700">₹{subtotal}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
