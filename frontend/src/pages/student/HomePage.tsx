import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ChefHat } from 'lucide-react';
import { api } from '../../services/api';
import { MenuItem } from '../../types';
import { FoodCard } from '../../components/student/FoodCard';
import { CategoryPills } from '../../components/student/CategoryPills';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const HomePage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadMenu();
  }, [selectedCategory]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await api.getMenuItems({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
      });
      setItems(data);
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.categoryId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-teal-700 p-8 sm:p-10 text-white overflow-hidden shadow-xl shadow-teal-900/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/30 backdrop-blur-md border border-teal-400/30 text-teal-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Campus Dining Reimagined</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Skip the long canteen queues. Order online, pick up fresh!
          </h1>
          <p className="text-sm text-teal-100 max-w-lg leading-relaxed">
            Browse today's hot specials, breakfast combos, beverages, and meals. Track your order in real time from lecture halls.
          </p>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
      </div>

      {/* Search and Filters Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Masala Dosa, Biryani, Chai)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500 self-end sm:self-auto">
            Showing {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'}
          </span>
        </div>

        {/* Category Pills */}
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
        />
      </div>

      {/* Menu Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching campus menu..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="No food dishes found"
          description={
            searchQuery
              ? `No dishes matched "${searchQuery}". Try a different keyword.`
              : 'No dishes currently available in this category.'
          }
          actionText={searchQuery ? 'Clear Search' : 'View All Dishes'}
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <FoodCard key={item.itemId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
