import React from 'react';
import { Instagram, MessageCircle, Music2, PackageCheck, BadgeCheck, Headphones } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const WHATSAPP_URL = 'https://wa.me/989382475438';
const ENAMAD_URL = 'https://trustseal.enamad.ir/?id=774226&Code=w40rZvRfboztUEStJQMazJQw6bzHxHY5';
const ENAMAD_LOGO_URL = 'https://trustseal.enamad.ir/logo.aspx?id=774226&Code=w40rZvRfboztUEStJQMazJQw6bzHxHY5';
const INSTAGRAM_URL = 'https://www.instagram.com/avort.shoes/';
const TIKTOK_URL = 'https://www.tiktok.com/@avort.shoes';

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
            <p className="text-slate-500 leading-relaxed">فروشگاهی برای انتخاب کتونی‌های باکیفیت، راحت و مناسب استفاده روزمره.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 pt-2 font-bold text-emerald-700">
              <MessageCircle className="h-4 w-4" />ارتباط فقط از طریق واتساپ
            </a>
            <div className="flex items-center gap-3 pt-1">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="اینستاگرام آورت" className="inline-flex items-center gap-1.5 font-bold text-pink-600 hover:text-pink-700">
                <Instagram className="h-4 w-4" />اینستاگرام
              </a>
              <a href={TIKTOK_URL} target="_blank" rel="noreferrer" aria-label="تیک‌تاک آورت" className="inline-flex items-center gap-1.5 font-bold text-slate-800 hover:text-cyan-700">
                <Music2 className="h-4 w-4" />تیک‌تاک
              </a>
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

          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900">تماس با ما</h4>
            <p className="text-slate-500">ارتباط فقط از طریق واتساپ</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" dir="ltr" className="inline-block font-black text-emerald-700">09382475438</a>
            <div className="pt-3">
              <a href={ENAMAD_URL} referrerPolicy="origin" target="_blank" aria-label="مشاهده نماد اعتماد الکترونیکی آورت">
                <img
                  src={ENAMAD_LOGO_URL}
                  alt="نماد اعتماد الکترونیکی"
                  referrerPolicy="origin"
                  data-code="w40rZvRfboztUEStJQMazJQw6bzHxHY5"
                  className="h-auto w-28 cursor-pointer"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">فروشگاه آنلاین کتونی آورت © ۲۰۲۶ - تمامی حقوق محفوظ است.</div>
      </div>
    </footer>
  );
};

const Trust: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="rounded-2xl bg-cyan-50/60 border border-cyan-100 p-4 flex items-center gap-3"><div className="text-cyan-600 [&>svg]:w-6 [&>svg]:h-6">{icon}</div><div><h4 className="font-black text-slate-900 text-sm">{title}</h4><p className="text-xs text-slate-500 mt-1">{text}</p></div></div>
);
