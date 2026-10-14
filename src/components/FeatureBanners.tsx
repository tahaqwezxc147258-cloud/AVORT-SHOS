import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FeatureBanners: React.FC = () => {
  const { setViewMode } = useStore();

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-10">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 rounded-3xl lg:rounded-[36px] p-6 lg:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 px-4 py-1 rounded-full text-xs font-bold">
            <span>کیفیت قابل اعتماد برای استفاده روزمره</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black leading-tight">کیفیت، سبک وزنی و راحتی برای قدم‌های شما</h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            مدل‌های فروشگاه با تمرکز بر راحتی، طراحی کاربردی و کیفیت ساخت انتخاب شده‌اند تا برای استفاده روزمره انتخابی مطمئن داشته باشید.
          </p>
          <div className="pt-2 flex justify-center">
            <button onClick={() => setViewMode('shop')} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/30 active:scale-95 transition-all flex items-center gap-2">
              <span>مشاهده مدل‌های موجود</span><ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </section>
  );
};
