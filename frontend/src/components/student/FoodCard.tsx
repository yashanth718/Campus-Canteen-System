import React from 'react';
import { Clock, Plus, Minus, Check } from 'lucide-react';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';

interface FoodCardProps {
  item: MenuItem;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const { items, addToCart, updateQuantity } = useCart();

  const cartEntry = items.find((ci) => ci.item.itemId === item.itemId);
  const currentQuantity = cartEntry ? cartEntry.quantity : 0;

  return (
    <div
      className={`group relative flex flex-col justify-between bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
        !item.available ? 'opacity-70 grayscale-[20%]' : ''
      }`}
    >
      {/* Top Image & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            // High quality food placeholder if image fails
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Preparation time badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/60 backdrop-blur-md text-white text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{item.preparationTimeMinutes || 12} mins</span>
        </div>

        {/* Availability Badge */}
        {!item.available && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
              Currently Sold Out
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold uppercase tracking-wider shadow-sm">
            {item.categoryId}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex-1">
          <h4 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-teal-600 transition">
            {item.name}
          </h4>
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price and Add to Cart */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-xl font-extrabold text-slate-900">₹{item.price}</span>
          </div>

          <div>
            {!item.available ? (
              <button
                disabled
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
              >
                Unavailable
              </button>
            ) : currentQuantity > 0 ? (
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 p-1 rounded-xl">
                <button
                  onClick={() => updateQuantity(item.itemId, -1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-teal-700 shadow-sm hover:bg-teal-100 transition"
                  title="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-teal-800">
                  {currentQuantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.itemId, 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm hover:bg-teal-700 transition"
                  title="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(item)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm shadow-teal-600/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
