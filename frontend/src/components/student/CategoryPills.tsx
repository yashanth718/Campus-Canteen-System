import React from 'react';
import { Coffee, Utensils, Cookie, CupSoda, CakeSlice, Sparkles } from 'lucide-react';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All Dishes', icon: Sparkles },
  { id: 'breakfast', name: 'Breakfast', icon: Coffee },
  { id: 'lunch', name: 'Lunch', icon: Utensils },
  { id: 'snacks', name: 'Snacks', icon: Cookie },
  { id: 'beverages', name: 'Beverages', icon: CupSoda },
  { id: 'desserts', name: 'Desserts', icon: CakeSlice },
];

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
              isSelected
                ? 'bg-teal-600 text-white shadow-teal-500/20 shadow-md scale-105'
                : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-teal-600'}`} />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
