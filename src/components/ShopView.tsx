import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoeCard } from './ShoeCard';
import { Filter, SlidersHorizontal, Search, RotateCcw, Check } from 'lucide-react';
import { Brand, Category } from '../types';

export const ShopView: React.FC = () => {
  const { products, searchQuery, setSearchQuery, activeCategory, setActiveCategory } = useStore();

  const [selectedBrand, setSelectedBrand] = useState<string>('همه');
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');
  const [maxPrice, setMaxPrice] = useState<number>(25000000);

  const ALL_SIZES = [38, 39, 40, 41, 42, 43, 44, 45, 46];

  // Filtering Logic
  let filtered = products.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.nameFa.includes(searchQuery);
    
    const matchesBrand = selectedBrand === 'همه' || p.brand === selectedBrand;
    const matchesCategory = activeCategory === 'همه' || p.category === activeCategory;
    const matchesSize = selectedSize === null || p.sizes.includes(selectedSize);
    const matchesPrice = p.priceToman <= maxPrice;

    return matchesSearch && matchesBrand && matchesCategory && matchesSize && matchesPrice;
  });

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceToman - b.priceToman;
    if (sortBy === 'price-desc') return b.priceToman - a.priceToman;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.reviewsCount || 0) - (a.reviewsCount || 0); // popular
  });

  const resetFilters = () => {
    setSelectedBrand('همه');
    setActiveCategory('همه');
    setSelectedSize(null);
    setMaxPrice(25000000);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-cyan-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-bold text-cyan-400">کاتالوگ جامع اِی‌وُرت</span>
          <h1 className="text-2xl sm:text-4xl font-black">فروشگاه اختصاصی کفش نایک و جردن</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            تضمین اصالت کالا، بهترین قیمت بازار و ارسال سریع به سراسر کشور
          </p>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Right Sidebar Filters (Desktop & Mobile) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-cyan-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
              <Filter className="w-4 h-4 text-cyan-500" />
              <span>فیلترهای پیشرفته</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-[11px] font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>بازنشانی</span>
            </button>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 block">برند کفش</label>
            <div className="flex flex-wrap gap-1.5">
              {['همه', 'نایک', 'جردن'].map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    selectedBrand === brand
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-cyan-50'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 block">دسته‌بندی کاربردی</label>
            <div className="flex flex-wrap gap-1.5">
              {['همه', 'جردن', 'نایک', 'باشگاه', 'رانینگ', 'کلاسیک'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as Category)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-cyan-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Size Picker */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 block">انتخاب سایز (EU)</label>
            <div className="grid grid-cols-3 gap-1.5">
              {ALL_SIZES.map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedSize === sz
                      ? 'bg-cyan-500 border-cyan-500 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-cyan-300'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700">حداکثر قیمت:</span>
              <span className="font-bold text-cyan-600">{maxPrice.toLocaleString('fa-IR')} تومان</span>
            </div>
            <input
              type="range"
              min="5000000"
              max="25000000"
              step="500000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Main Grid & Sort Bar */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Sorting Header Bar */}
          <div className="bg-white rounded-2xl p-4 border border-cyan-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-600">
              نمایش <span className="text-cyan-600 font-extrabold">{filtered.length}</span> کتانی موجود
            </span>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400">مرتب‌سازی بر اساس:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 font-bold focus:outline-none cursor-pointer"
              >
                <option value="popular">محبوب‌ترین‌ها</option>
                <option value="price-asc">ارزان‌ترین به گران‌ترین</option>
                <option value="price-desc">گران‌ترین به ارزان‌ترین</option>
                <option value="rating">بالاترین امتیاز</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(product => (
                <ShoeCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-cyan-100 space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-500 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-slate-800 font-black text-base">محصولی با این فیلترها پیدا نشد</h3>
              <p className="text-xs text-slate-500">لطفا فیلترهای اعمال شده را بازنشانی کنید.</p>
              <button
                onClick={resetFilters}
                className="bg-cyan-500 text-white px-6 py-2.5 rounded-2xl font-bold text-xs shadow-md"
              >
                حذف تمام فیلترها
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
