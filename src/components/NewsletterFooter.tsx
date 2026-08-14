import React from 'react';
import { Instagram, Music2, PackageCheck, BadgeCheck, Headphones } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const NewsletterFooter: React.FC = () => {
  const { setViewMode, setActiveCategory } = useStore();

  return (
    <footer className="bg-white border-t border-cyan-100/80 pt-8 pb-20 md:pb-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Trust icon={<BadgeCheck />} title="انتخاب باکیفیت" text="مدل‌ها با تمرکز بر راحتی و ارزش خرید انتخاب می‌شوند." />
          <Trust icon={<PackageCheck />} title="بررسی پیش از ارسال" text="محصول از نظر ظاهر و مشخصات قبل از ارسال بررسی می‌شود." />
          <Trust icon={<Headphones />} title="پشتیبانی قبل از خرید" text="برای انتخاب مدل و سایز مناسب کنار شما هستیم." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-t border-slate-100 pt-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-cyan-500 text-white font-black flex items-center justify-center text-sm">N</div><span className="font-extrabold text-lg text-slate-900 tracking-wider">ایوُرت</span></div>
            <p className="text-slate-500 leading-relaxed">فروشگاهی برای انتخاب کتونی‌های باکیفیت، راحت و مناسب استفاده روزمره.</p>
            <div className="flex items-center gap-2 pt-2">
              <a href="https://www.instagram.com/avort.shoes/" target="_blank" rel="noreferrer" aria-label="Instagram Avort" className="text-pink-600 text-xs font-bold">اینستاگرام Avort</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="اینستاگرام" className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100"><Instagram className="w-5 h-5" /></a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="تیک تاک" className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center hover:bg-slate-200"><Music2 className="w-5 h-5" /></a>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900">دسترسی سریع</h4>
            <ul className="flex flex-wrap gap-4 text-slate-600 font-medium">
              <li><button onClick={() => { setViewMode('home'); setActiveCategory('همه'); }} className="hover:text-cyan-600">صفحه اصلی</button></li>
              <li><button onClick={() => setViewMode('shop')} className="hover:text-cyan-600">فروشگاه کتونی‌ها</button></li>
              <li><button onClick={() => { setViewMode('shop'); setActiveCategory('جردن'); }} className="hover:text-cyan-600">مدل‌های جردن</button></li>
            </ul>
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3 text-slate-600"><a href="/about">درباره ما</a><a href="/contact">تماس با ما</a><a href="/purchase-rules">قوانین خرید</a><a href="/returns">مرجوعی</a><a href="/shipping">ارسال</a><a href="/privacy">حریم خصوصی</a><a href="/articles">مقالات</a></div>
          </div>

          <div className="space-y-1"><h4 className="font-extrabold text-slate-900">تماس با ایوُرت</h4><p className="text-cyan-600 dir-ltr text-right font-black text-sm">09382475438</p><p className="text-slate-500">پاسخ‌گویی برای انتخاب سایز و پیگیری سفارش</p></div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">فروشگاه آنلاین کتونی ایوُرت © ۲۰۲۶ - تمامی حقوق محفوظ است.</div>
      </div>
    </footer>
  );
};

const Trust: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="rounded-2xl bg-cyan-50/60 border border-cyan-100 p-4 flex items-center gap-3"><div className="text-cyan-600 [&>svg]:w-6 [&>svg]:h-6">{icon}</div><div><h4 className="font-black text-slate-900 text-sm">{title}</h4><p className="text-xs text-slate-500 mt-1">{text}</p></div></div>
);
