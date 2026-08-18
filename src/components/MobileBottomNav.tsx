import React from 'react';
import { Home, LayoutGrid, ShoppingBag, UserRound, ShieldAlert } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MobileBottomNav: React.FC = () => {
  const { viewMode, setViewMode, cart, user, setIsLoginModalOpen } = useStore();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const item = (active: boolean) => `flex-1 min-w-0 flex flex-col items-center justify-center gap-1 rounded-2xl py-2 transition ${active ? 'bg-cyan-50 text-cyan-600' : 'text-slate-500 hover:bg-slate-50'}`;
  return <div className="fixed bottom-3 left-3 right-3 z-50 md:hidden"><nav className="mx-auto flex max-w-md items-center gap-1 rounded-[26px] border border-slate-200/80 bg-white/95 p-2 shadow-[0_14px_35px_rgba(15,23,42,.14)] backdrop-blur-xl">
    <button onClick={() => setViewMode('home')} className={item(viewMode === 'home')}><Home className="h-5 w-5" /><span className="text-[10px] font-bold">خانه</span></button>
    <button onClick={() => setViewMode('shop')} className={item(viewMode === 'shop')}><LayoutGrid className="h-5 w-5" /><span className="text-[10px] font-bold">فروشگاه</span></button>
    <button onClick={() => setViewMode('cart')} className="relative -mt-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-white bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"><ShoppingBag className="h-5 w-5" />{count > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[9px] font-black">{count}</span>}</button>
    <button onClick={() => user ? setViewMode('profile') : setIsLoginModalOpen(true)} className={item(viewMode === 'profile')}><UserRound className="h-5 w-5" /><span className="text-[10px] font-bold">{user ? 'حساب من' : 'ورود'}</span></button>
    {user?.role === 'admin' && <button onClick={() => setViewMode('admin')} className={item(viewMode === 'admin')}><ShieldAlert className="h-5 w-5" /><span className="text-[10px] font-bold">مدیریت</span></button>}
  </nav></div>;
};
