import React from 'react';
import { Home, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { seoArticles } from '../data/seoArticles';

const pages: Record<string, { title: string; intro: string; body: string }> = {
  about: { title: 'درباره ما', intro: 'ایوُرت، فروشگاه آنلاین انتخاب کتانی برای استایل روزمره و ورزشی است.', body: 'ما مشخصات، تصاویر، سایزها و قیمت هر محصول را شفاف ارائه می‌کنیم تا انتخابی مطمئن‌تر داشته باشید.' },
  contact: { title: 'تماس با ما', intro: 'برای راهنمایی انتخاب مدل، سایز یا پیگیری سفارش با ما در تماس باشید.', body: 'شماره تماس پشتیبانی: ۰۹۳۸۲۴۷۵۴۳۸\nپاسخ‌گویی برای انتخاب سایز و پیگیری سفارش انجام می‌شود.' },
  'purchase-rules': { title: 'قوانین خرید', intro: 'قبل از ثبت سفارش، مشخصات محصول و شرایط ارسال را بررسی کنید.', body: 'موجودی، سایز و قیمت نهایی همان مواردی است که در صفحه محصول نمایش داده می‌شود.' },
  returns: { title: 'شرایط مرجوعی', intro: 'رضایت شما برای ما مهم است.', body: 'کالا باید استفاده‌نشده، سالم و همراه بسته‌بندی اصلی باشد. برای هماهنگی مرجوعی با پشتیبانی تماس بگیرید.' },
  shipping: { title: 'شرایط ارسال', intro: 'سفارش شما پس از تأیید برای ارسال آماده می‌شود.', body: 'زمان تحویل به مقصد و شرکت حمل‌ونقل بستگی دارد.' },
  privacy: { title: 'حریم خصوصی', intro: 'اطلاعات شما نزد ایوُرت محفوظ است.', body: 'اطلاعات ثبت‌شده فقط برای پردازش سفارش، ارسال کالا و پشتیبانی استفاده می‌شود.' },
};

export const SeoPages: React.FC<{ path: string }> = ({ path }) => {
  const { setViewMode } = useStore();
  const slug = path.replace(/^\//, '');
  const article = slug.startsWith('articles/') ? seoArticles.find(a => a.slug === slug.slice(9)) : null;
  const page = pages[slug];
  const title = article?.title || page?.title || 'راهنمای خرید کفش';
  const intro = article?.intro || page?.intro || 'راهنماهای انتخاب و نگهداری کفش را بخوانید.';
  const body = article?.sections?.map(s => `${s.heading}: ${s.body}`).join('\n\n') || page?.body || '';
  return <main className="min-h-[65vh] bg-slate-50 px-4 py-8 sm:py-14" dir="rtl"><div className="mx-auto max-w-3xl"><div className="rounded-[28px] border border-cyan-100 bg-white p-6 shadow-sm sm:p-10"><p className="mb-3 text-sm font-black text-cyan-600">ایوُرت | راهنمای مشتری</p><h1 className="text-2xl font-black text-slate-900 sm:text-4xl">{title}</h1><p className="mt-6 text-base font-bold leading-8 text-slate-700">{intro}</p><p className="mt-4 whitespace-pre-line leading-8 text-slate-600">{body}</p><div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6"><button onClick={() => setViewMode('shop')} className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-white"><ShoppingBag className="h-4 w-4" />مشاهده فروشگاه</button><button onClick={() => setViewMode('home')} className="flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700"><Home className="h-4 w-4" />بازگشت به خانه</button></div></div>{!page && <div className="mt-6 rounded-2xl bg-white p-5"><h2 className="font-black">مطالب مرتبط</h2>{seoArticles.slice(0, 4).map(a => <a className="mt-3 block text-sm font-bold text-cyan-700" href={`/articles/${a.slug}`} key={a.slug}>{a.title}</a>)}</div>}</div></main>;
};
