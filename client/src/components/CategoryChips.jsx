import React from 'react';
import {
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Watch,
  Shirt,
  Home,
  Dumbbell,
  BookOpen,
  Sparkles,
  LayoutGrid
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Categories', icon: LayoutGrid },
  { id: 'Mobiles', label: 'Mobiles', icon: Smartphone },
  { id: 'Laptops', label: 'Laptops', icon: Laptop },
  { id: 'Audio', label: 'Audio & TWS', icon: Headphones },
  { id: 'Fashion', label: 'Fashion & Shoes', icon: Shirt },
  { id: 'Home & Kitchen', label: 'Home & Kitchen', icon: Home },
  { id: 'Appliances', label: 'TV & Appliances', icon: Tv },
  { id: 'Wearables', label: 'Smartwatches', icon: Watch },
  { id: 'Fitness', label: 'Fitness & Sports', icon: Dumbbell },
  { id: 'Books', label: 'Books', icon: BookOpen },
];

const CategoryChips = ({ activeCategory = 'All', onSelectCategory }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
