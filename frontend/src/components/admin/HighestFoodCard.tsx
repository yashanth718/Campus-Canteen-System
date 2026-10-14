import React from 'react';
import { Trophy, TrendingUp, ShoppingBag, Utensils } from 'lucide-react';
import { HighestOrderedFoodResponse } from '../../types';

interface HighestFoodCardProps {
  data: HighestOrderedFoodResponse | null;
  loading: boolean;
}

export const HighestFoodCard: React.FC<HighestFoodCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-28 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  if (!data || !data.hasOrders || data.highestItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
          <Utensils className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Food Orders on {data?.date || 'Selected Date'}</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Zero orders were placed for this calendar date. Star dish will appear once students start ordering.
        </p>
      </div>
    );
  }

  const isTie = data.highestItems.length > 1;

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 rounded-3xl p-6 border border-amber-200/80 shadow-xs relative overflow-hidden">
      {/* Decorative Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block">
              {isTie ? 'Tied Top Dishes of the Day' : 'Top Star Dish of the Day'}
            </span>
            <h4 className="text-sm font-extrabold text-slate-900">Highest Ordered ({data.date})</h4>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          #1 Bestseller
        </span>
      </div>

      {/* Grid of Winners (handles ties) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.highestItems.map((item) => (
          <div
            key={item.itemId}
            className="flex items-center gap-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 shadow-xs"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-20 h-20 rounded-2xl object-cover bg-slate-100 flex-shrink-0 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
              }}
            />

            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-teal-600 block">{item.category}</span>
              <h5 className="text-base font-extrabold text-slate-900 truncate">{item.name}</h5>

              <div className="mt-2 grid grid-cols-3 gap-2 text-center bg-slate-50 p-2 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Quantity</span>
                  <span className="text-xs font-extrabold text-amber-700">{item.quantityOrdered} pcs</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Orders</span>
                  <span className="text-xs font-extrabold text-slate-700">{item.orderCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Sales</span>
                  <span className="text-xs font-extrabold text-teal-700">₹{item.revenue}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
