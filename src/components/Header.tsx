import React from 'react';
import { Search, ShoppingBag, Heart, User as UserIcon, ShieldAlert, LogOut } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Header: React.FC = () => {
  const {
    cart,
    wishlist,
    user,
    logout,
    viewMode,
    setViewMode,
    setIsLoginModalOpen,
    searchQuery,
    setSearchQuery,
    setActiveCategory,
    openBrandCollection
  } = useStore();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#eaf7f9]/90 backdrop-blur-md border-b border-cyan-100/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Right Section (RTL Start): Logo & Admin Pill */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => {
              setViewMode('home');
              setActiveCategory('همه');
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
              <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
                AV
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-wider text-slate-900 group-hover:text-cyan-600 transition-colors">
                AVORT<span className="text-cyan-500">.</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium -mt-1">
                فروشگاه کفش نایک و جردن
              </span>
            </div>
          </div>

          {/* Navigation Links for Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-white/80 border border-cyan-100/60 p-1.5 rounded-2xl shadow-xs">
            <button
              onClick={() => { setViewMode('home'); setActiveCategory('همه'); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'home'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-cyan-600 hover:bg-cyan-50'
              }`}
            >
              خانه
            </button>

            <button
              onClick={() => setViewMode('shop')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'shop'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-cyan-600 hover:bg-cyan-50'
              }`}
            >
              فروشگاه
            </button>

            <button
              onClick={() => openBrandCollection('جردن')}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
            >
              کالکشن جردن
            </button>

            <button
              onClick={() => openBrandCollection('نایک')}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
            >
              کتانی‌های نایک
            </button>
            <button
              onClick={() => { window.history.pushState({}, '', '/collection/women'); window.dispatchEvent(new PopStateEvent('popstate')); setViewMode('shop'); }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all"
            >
              کالکشن زنانه
            </button>
          </nav>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="جستجو بر اساس نام کفش، جردن، نایک..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setViewMode('shop');
              }}
              className="w-full bg-white border border-cyan-100 rounded-full py-2.5 pr-4 pl-12 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 shadow-xs transition-all placeholder:text-slate-400"
            />
            <button
              onClick={() => setViewMode('shop')}
              className="absolute left-1.5 w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white flex items-center justify-center transition-colors shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Left Actions (Cart, Wishlist, User, Admin Switcher) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Admin shortcut button (visible to admin role) */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setViewMode(viewMode === 'admin' ? 'home' : 'admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black border transition-all ${
                viewMode === 'admin'
                  ? 'bg-slate-900 text-cyan-400 border-slate-900 shadow-md'
                  : 'bg-cyan-500 text-white border-cyan-400 hover:bg-cyan-600'
              }`}
              title="مدیریت فروشگاه و افزودن محصول"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>پنل مدیریت و افزودن محصول</span>
            </button>
          )}

          {/* Cart Icon Button (Desktop & Tablet) */}
          <button
            onClick={() => setViewMode('cart')}
            className="relative w-10 h-10 rounded-2xl bg-white border border-cyan-100 text-slate-700 hover:text-cyan-600 hover:border-cyan-300 flex items-center justify-center transition-all shadow-xs"
            title="سبد خرید"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-cyan-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => setViewMode('shop')}
            className="relative hidden sm:flex w-10 h-10 rounded-2xl bg-white border border-cyan-100 text-slate-700 hover:text-rose-500 hover:border-rose-200 items-center justify-center transition-all shadow-xs"
            title="علاقه‌مندی‌ها"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Desktop-only: account actions move to the bottom navigation on mobile. */}
          <div className="hidden md:block">
          {user ? (
            <div className="flex items-center gap-2 bg-white border border-cyan-100 rounded-2xl px-3 py-1.5 shadow-xs">
              <button
                onClick={() => setViewMode('profile')}
                className="flex items-center gap-2 text-xs font-bold text-slate-800"
                title="نمایش پروفایل"
              >
                <UserIcon className="w-4 h-4 text-cyan-600 shrink-0" />
                <span className="hidden sm:inline">{user.fullName || user.phone}</span>
                <span className="sm:hidden text-[11px] font-bold text-slate-700">پروفایل</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-[11px] font-extrabold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-xl transition-all cursor-pointer mr-1"
                title="خروج از حساب"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              <span>ورود / ثبت‌نام</span>
            </button>
          )}
          </div>

        </div>
      </div>
    </header>
  );
};
