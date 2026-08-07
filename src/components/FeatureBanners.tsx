import React from 'react';
import { Truck, ShieldCheck, Headphones, ArrowLeft, Ruler, ShoppingBag, MessageCircle } from 'lucide-react';
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Feature icon={<Truck />} title="ارسال سریع و مطمئن" text="سفارش شما با بسته‌بندی مناسب و امکان پیگیری ارسال می‌شود." />
        <Feature icon={<ShieldCheck />} title="تضمین کیفیت و تطابق کالا" text="تصاویر و مشخصات هر مدل شفاف است و محصول پیش از ارسال بررسی می‌شود." />
        <Feature icon={<Headphones />} title="پشتیبانی برای انتخاب سایز" text="برای انتخاب مدل و سایز مناسب می‌توانید با پشتیبانی در تماس باشید." />
      </div>

      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-cyan-100 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl lg:text-3xl font-black text-slate-900">راهنمای خرید کتونی</h3>
          <p className="text-sm text-slate-600">برای انتخاب مطمئن‌تر، مشخصات، سایزهای موجود و تصاویر هر محصول را بررسی کنید.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Guide icon={<ShoppingBag />} title="مدل مناسب را انتخاب کنید" text="وارد صفحه محصول شوید و رنگ و سایز موجود را ببینید." />
          <Guide icon={<Ruler />} title="سایز پا را اندازه بگیرید" text="پا را روی کاغذ بگذارید و طول آن را از پاشنه تا بلندترین انگشت اندازه بگیرید." />
          <Guide icon={<MessageCircle />} title="ثبت سفارش و پیگیری" text="اطلاعات ارسال را وارد کنید؛ سپس وضعیت سفارش و کد پیگیری را دنبال کنید." />
        </div>
      </div>
    </section>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="bg-white rounded-3xl p-6 border border-cyan-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
    <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 [&>svg]:w-7 [&>svg]:h-7">{icon}</div>
    <div><h3 className="font-extrabold text-slate-900 text-base">{title}</h3><p className="text-xs text-slate-500 mt-1">{text}</p></div>
  </div>
);

const Guide: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="rounded-2xl bg-cyan-50/70 p-5 text-right border border-cyan-100">
    <div className="text-cyan-600 [&>svg]:w-7 [&>svg]:h-7 mb-3">{icon}</div>
    <h4 className="font-black text-slate-900 text-sm">{title}</h4>
    <p className="mt-2 text-xs leading-6 text-slate-600">{text}</p>
  </div>
);
