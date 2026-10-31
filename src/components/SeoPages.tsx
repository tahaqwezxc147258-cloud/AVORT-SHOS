import React, { useEffect, useState } from 'react';
import { Home, Instagram, MessageCircle, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { seoArticles, type SeoArticle } from '../data/seoArticles';

const WHATSAPP_URL = 'https://wa.me/989374453927';
const INSTAGRAM_URL = 'https://www.instagram.com/avort.shoes/';

type StaticPage = { title: string; intro: string; body: string };

const staticPages: Record<string, StaticPage> = {
  about: {
    title: 'درباره آورت',
    intro: 'آورت فروشگاه آنلاین کتانی و کفش است؛ جایی برای بررسی مدل‌ها، مشخصات و سایزهای موجود پیش از خرید.',
    body: 'در صفحه هر محصول می‌توانید اطلاعات، تصاویر، رنگ‌ها و سایزهای موجود را بررسی کنید. برای انتخاب بهتر، مشخصات همان مدل را با نیاز و نوع استفاده خود مقایسه کنید.\n\nاگر درباره انتخاب سایز یا ثبت سفارش پرسشی دارید، از راه‌های ارتباطی صفحه تماس با ما استفاده کنید.',
  },
  contact: {
    title: 'تماس با آورت',
    intro: 'برای پرسش درباره محصولات، انتخاب سایز یا پیگیری سفارش با پشتیبانی آورت در ارتباط باشید.',
    body: 'برای دریافت راهنمایی، از طریق واتساپ یا صفحه اینستاگرام آورت پیام بفرستید. هنگام پیگیری سفارش، کد سفارش خود را آماده داشته باشید.',
  },
  'purchase-rules': {
    title: 'شرایط خرید',
    intro: 'پیش از نهایی‌کردن خرید، اطلاعات محصول و جزئیات سفارش را با دقت بررسی کنید.',
    body: 'سایزها و رنگ‌های قابل انتخاب در صفحه محصول نمایش داده می‌شوند. پیش از پرداخت، مشخصات اقلام سبد خرید و اطلاعات گیرنده و نشانی ارسال را بررسی کنید. جزئیات نهایی سفارش پس از ثبت، در حساب کاربری قابل پیگیری است.',
  },
  returns: {
    title: 'پیگیری و بازگشت سفارش',
    intro: 'برای راهنمایی درباره سفارش یا درخواست بررسی، با پشتیبانی آورت تماس بگیرید.',
    body: 'هنگام تماس، کد سفارش و توضیح کوتاهی از درخواست خود را ارائه دهید تا موضوع بررسی شود. شرایط هر درخواست بر اساس اطلاعات سفارش و وضعیت کالا پیگیری خواهد شد.',
  },
  shipping: {
    title: 'اطلاعات ارسال سفارش',
    intro: 'هزینه پست به‌صورت پس‌کرایه است و هنگام تحویل سفارش پرداخت می‌شود.',
    body: 'هزینه پست در مبلغ پرداخت آنلاین سفارش محاسبه نمی‌شود و گیرنده آن را هنگام تحویل به مأمور پست می‌پردازد. پیش از پرداخت، نام گیرنده، شماره تماس، شهر، نشانی کامل و کدپستی را بررسی کنید. پس از ثبت سفارش، برای پیگیری از اطلاعات سفارش در حساب کاربری یا پشتیبانی استفاده کنید.',
  },
  privacy: {
    title: 'حریم خصوصی',
    intro: 'اطلاعات تماس و نشانی برای ثبت و پیگیری سفارش و ارائه خدمات فروشگاه استفاده می‌شود.',
    body: 'اطلاعاتی که هنگام ورود یا ثبت سفارش وارد می‌کنید برای انجام همان خدمات و پاسخ‌گویی به درخواست‌های شما نگهداری و استفاده می‌شود. برای پرسش درباره اطلاعات حساب خود با پشتیبانی آورت در ارتباط باشید.',
  },
};

export const SeoPages: React.FC<{ path: string }> = ({ path }) => {
  const { setViewMode } = useStore();
  const slug = path.replace(/^\//, '');
  const [longArticles, setLongArticles] = useState<SeoArticle[]>([]);
  const [hasLoadedLongArticles, setHasLoadedLongArticles] = useState(false);
  useEffect(() => {
    if (slug !== 'articles' && !slug.startsWith('articles/')) return;
    let active = true;
    import('../data/seoLongArticles')
      .then(({ seoLongArticles }) => {
        if (!active) return;
        setLongArticles(seoLongArticles);
        setHasLoadedLongArticles(true);
      })
      .catch(error => {
        console.error('Failed to load magazine articles:', error);
        if (active) setHasLoadedLongArticles(true);
      });
    return () => { active = false; };
  }, [slug]);
  const article = slug.startsWith('articles/')
    ? [...seoArticles, ...longArticles].find(item => item.slug === slug.slice(9))
    : null;
  const isLoadingArticle = slug.startsWith('articles/') && !article && !hasLoadedLongArticles;
  const page = staticPages[slug];
  const isArticleIndex = slug === 'articles';
  const title = article?.title || page?.title || (isLoadingArticle ? 'در حال بارگذاری مقاله…' : isArticleIndex ? 'مجله آورت؛ راهنمای خرید و نگهداری کتانی' : 'صفحه پیدا نشد');
  const intro = article?.intro || page?.intro || (isLoadingArticle
    ? 'مقاله در حال بارگذاری است.'
    : isArticleIndex
    ? 'راهنماهای کاربردی برای انتخاب کفش، اندازه‌گیری سایز و نگهداری کتانی را بخوانید.'
    : 'صفحه موردنظر پیدا نشد. می‌توانید از راهنماهای آورت دیدن کنید.');
  const articleImage = article?.slug === 'shoe-size-guide' ? '/images/shoe-size-guide.svg' : article?.image;

  return <main className="min-h-[65vh] bg-slate-50 px-4 py-8 sm:py-14" dir="rtl"><div className="mx-auto max-w-3xl"><div className="rounded-[28px] border border-cyan-100 bg-white p-6 shadow-sm sm:p-10">
    {articleImage && <img src={articleImage} alt={article?.title || 'راهنمای تصویری انتخاب سایز کفش'} className="mb-8 w-full rounded-2xl border border-slate-100 bg-slate-50 object-cover" />}
    <p className="mb-3 text-sm font-black text-cyan-600">آورت | راهنمای خرید کتانی</p><h1 className="text-2xl font-black text-slate-900 sm:text-4xl">{title}</h1><p className="mt-6 text-base font-bold leading-8 text-slate-700">{intro}</p>
    {article?.sections.map(section => <section className="mt-7" key={section.heading}><h2 className="text-lg font-black text-slate-900">{section.heading}</h2><p className="mt-2 whitespace-pre-line leading-8 text-slate-600">{section.body}</p></section>)}
    {!article && page?.body && <p className="mt-4 whitespace-pre-line leading-8 text-slate-600">{page.body}</p>}
    {slug === 'contact' && <div className="mt-7 grid gap-3 sm:grid-cols-2"><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white"><MessageCircle className="h-5 w-5" />واتساپ پشتیبانی</a><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-rose-500 px-5 py-3 font-black text-white"><Instagram className="h-5 w-5" />اینستاگرام @avort.shoes</a></div>}
    {!article && !page && !isArticleIndex && !isLoadingArticle && <button onClick={() => setViewMode('home')} className="mt-6 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-white">بازگشت به صفحه اصلی</button>}
    <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6"><button onClick={() => setViewMode('shop')} className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-white"><ShoppingBag className="h-4 w-4" />مشاهده محصولات</button><button onClick={() => setViewMode('home')} className="flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700"><Home className="h-4 w-4" />بازگشت به خانه</button></div>
  </div>{(!article || isArticleIndex) && !isLoadingArticle && <section className="mt-6 rounded-2xl bg-white p-5"><h2 className="font-black">راهنماهای خرید و نگهداری کفش</h2><div className="mt-2 divide-y divide-slate-100">{[...seoArticles, ...longArticles].map(item => <a className="block py-3 text-sm font-bold text-cyan-700" href={`/articles/${item.slug}`} key={item.slug}><span>{item.title}</span><span className="mt-1 block font-normal leading-6 text-slate-500">{item.description}</span></a>)}</div></section>}</div></main>;
};
