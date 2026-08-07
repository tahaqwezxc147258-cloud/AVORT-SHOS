import React from 'react';
import { Home, Grid, ShoppingBag, Heart, ShieldAlert, UserRound } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MobileBottomNav: React.FC = () => {
  const { viewMode, setViewMode, cart, wishlist, user, setIsLoginModalOpen } = useStore();
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden pointer-events-auto">
      {/* Outer Floating Pill Container (Rounded Rectangle Frame) */}
      <div className="bg-white/95 backdrop-blur-xl border border-cyan-200/80 rounded-3xl px-3 py-2 shadow-[0_20px_40px_rgba(0,180,216,0.22)] flex items-center justify-between relative">
        
        {/* Home Item */}
        <button
          onClick={() => setViewMode('home')}
          className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all ${
            viewMode === 'home'
              ? 'text-cyan-600 font-bold bg-cyan-50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">خانه</span>
        </button>

        {/* Shop/Products Item */}
        <button
          onClick={() => setViewMode('shop')}
          className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all ${
            viewMode === 'shop'
              ? 'text-cyan-600 font-bold bg-cyan-50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px]">فروشگاه</span>
        </button>

        {/* Highlighted Center Cart Button */}
        <div className="relative -top-5 px-1 shrink-0">
          <button
            onClick={() => setViewMode('cart')}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-cyan-500/40 border-4 border-[#eaf7f9] active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>

        {/* Wishlist Item */}
        <button
          onClick={() => setViewMode('shop')}
          className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all ${
            wishlist.length > 0 && viewMode !== 'cart'
              ? 'text-rose-500 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">علاقه‌ها</span>
        </button>

        <button
          onClick={() => user ? setViewMode('profile') : setIsLoginModalOpen(true)}
          className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all ${viewMode === 'profile' ? 'text-cyan-600 font-bold bg-cyan-50' : 'text-slate-500'}`}
        >
          <UserRound className="w-5 h-5" />
          <span className="text-[10px]">{user ? 'حساب' : 'ورود'}</span>
        </button>

        {/* Admin Item if user is admin */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setViewMode(viewMode === 'admin' ? 'home' : 'admin')}
            className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all ${
              viewMode === 'admin'
                ? 'text-cyan-600 font-bold bg-cyan-50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px]">مدیریت</span>
          </button>
        )}

      </div>
    </div>
  );
};
