import React from 'react';
import { Home, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { seoArticles } from '../data/seoArticles';

export const SeoPages: React.FC<{ path: string }> = ({ path }) => {
  const { setViewMode } = useStore();
  const slug = path.replace(/^\//, '');
  const article = slug.startsWith('articles/') ? seoArticles.find(a => a.slug === slug.slice(9)) : null;
  const title = article?.title || 'راهنمای خرید کفش';
  const intro = article?.intro || 'راهنماهای انتخاب و نگهداری کفش را بخوانید.';
  const body = article?.sections?.map(s => `${s.heading}: ${s.body}`).join('\n\n') || '';
  const articleImage = article?.slug === 'shoe-size-guide' ? '/images/shoe-size-guide.svg' : undefined;
  return <main className="min-h-[65vh] bg-slate-50 px-4 py-8 sm:py-14" dir="rtl"><div className="mx-auto max-w-3xl"><div className="rounded-[28px] border border-cyan-100 bg-white p-6 shadow-sm sm:p-10">
    {articleImage && <img src={articleImage} alt="راهنمای اندازه‌گیری سایز کفش" className="mb-8 w-full rounded-2xl border border-slate-100 bg-slate-50 object-cover" />}
    <p className="mb-3 text-sm font-black text-cyan-600">ایوُرت | راهنمای مشتری</p><h1 className="text-2xl font-black text-slate-900 sm:text-4xl">{title}</h1><p className="mt-6 text-base font-bold leading-8 text-slate-700">{intro}</p><p className="mt-4 whitespace-pre-line leading-8 text-slate-600">{body}</p><div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6"><button onClick={() => setViewMode('shop')} className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-white"><ShoppingBag className="h-4 w-4" />مشاهده فروشگاه</button><button onClick={() => setViewMode('home')} className="flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700"><Home className="h-4 w-4" />بازگشت به خانه</button></div></div>{!article && <div className="mt-6 rounded-2xl bg-white p-5"><h2 className="font-black">مطالب مرتبط</h2>{seoArticles.slice(0, 4).map(a => <a className="mt-3 block text-sm font-bold text-cyan-700" href={`/articles/${a.slug}`} key={a.slug}>{a.title}</a>)}</div>}</div></main>;
};
