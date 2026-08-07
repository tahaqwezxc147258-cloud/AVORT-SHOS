import React from 'react';
import { Category } from '../types';
import { useStore } from '../context/StoreContext';
import { Search } from 'lucide-react';

const CATEGORIES: Category[] = ['همه', 'جردن', 'نایک', 'باشگاه', 'رانینگ', 'کلاسیک'];

export const CategoryTabs: React.FC = () => {
  const { activeCategory, setActiveCategory, searchQuery, setSearchQuery, setViewMode } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 space-y-4">
      
      {/* Mobile Search Bar */}
      <div className="sm:hidden relative flex items-center">
        <input
          type="text"
          placeholder="جستجو در بین کفش‌های جردن و نایک..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setViewMode('shop');
          }}
          className="w-full bg-white border border-cyan-100 rounded-2xl py-3 pr-4 pl-12 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 shadow-xs placeholder:text-slate-400"
        />
        <button
          onClick={() => setViewMode('shop')}
          className="absolute left-2 w-9 h-9 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-xs active:scale-95 transition-all"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Category Pills Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          دسته‌بندی‌های اِی‌وُرت
        </h2>
        <button
          onClick={() => setViewMode('shop')}
          className="text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors"
        >
          مشاهده همه محصولات ←
        </button>
      </div>

      {/* Category Tabs Scroll Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-105'
                  : 'bg-white text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 border border-slate-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
