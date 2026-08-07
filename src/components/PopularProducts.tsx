import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoeCard } from './ShoeCard';
import { Flame } from 'lucide-react';

export const PopularProducts: React.FC = () => {
  const { products, activeCategory, searchQuery } = useStore();

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'همه' || p.category === activeCategory || p.brand === activeCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.nameFa.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              محبوب‌ترین کتانی‌های اِی‌وُرت
            </h2>
            <p className="text-xs text-slate-500">
              منتخب‌ترین مدل‌های نایک و جردن بر اساس رضایت خریداران
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Shoe Cards */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map((shoe) => (
            <ShoeCard key={shoe.id} product={shoe} badge={shoe.isSpecialOffer ? 'تخفیف ویژه' : undefined} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-cyan-100 space-y-3">
          <p className="text-slate-500 text-sm font-bold">محصولی با مشخصات جستجو شده یافت نشد.</p>
          <p className="text-xs text-slate-400">لطفا عبارت دیگری را جستجو کنید یا دسته‌بندی را تغییر دهید.</p>
        </div>
      )}
    </section>
  );
};
