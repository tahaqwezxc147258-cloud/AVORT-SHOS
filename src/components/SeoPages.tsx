import React from 'react';
import { seoArticles } from '../data/seoArticles';

const pages: Record<string,{title:string; body:string}> = {
  about:{title:'درباره ما',body:'Avort یک فروشگاه مستقل آنلاین برای انتخاب کفش و کتانی روزمره است. هدف ما ارائه اطلاعات روشن درباره مدل، سایز، رنگ و شرایط خرید است. ما ادعای نمایندگی رسمی یا اصالت مطلق همه برندها را نداریم و مشتری باید اطلاعات محصول و شرایط خرید را پیش از ثبت سفارش بررسی کند.'},
  contact:{title:'تماس با ما',body:'برای مشاوره انتخاب سایز، پیگیری سفارش و پرسش‌های خرید با شماره 09382475438 تماس بگیرید. همچنین می‌توانید از طریق صفحه اینستاگرام Avort با ما در ارتباط باشید.'},
  purchase-rules:{title:'قوانین خرید',body:'ثبت سفارش به معنی مطالعه مشخصات کالا، قیمت، سایز، روش پرداخت و شرایط ارسال است. سفارش پس از تأیید اطلاعات پرداخت وارد فرایند آماده‌سازی می‌شود. قیمت و موجودی تا زمان ثبت نهایی سفارش قابل تغییر است.'},
  returns:{title:'شرایط مرجوعی',body:'درخواست مرجوعی باید در اولین فرصت پس از دریافت ثبت شود. کالا باید استفاده‌نشده، تمیز و همراه با جعبه و متعلقات تحویل داده شود. بررسی شرایط کالا پیش از تأیید مرجوعی انجام می‌شود.'},
  shipping:{title:'شرایط ارسال',body:'سفارش پس از تأیید پرداخت آماده ارسال می‌شود. زمان تحویل به شهر مقصد و شرکت حمل‌ونقل بستگی دارد. اطلاعات پیگیری، در صورت فراهم بودن، از طریق پشتیبانی در اختیار خریدار قرار می‌گیرد.'},
  privacy:{title:'حریم خصوصی',body:'اطلاعاتی مانند شماره تماس و نشانی فقط برای ثبت، پردازش و پیگیری سفارش استفاده می‌شود. Avort اطلاعات کاربران را برای فروش یا تبلیغات نامرتبط در اختیار اشخاص ثالث قرار نمی‌دهد، مگر در موارد لازم برای انجام سفارش یا الزام قانونی.'}
};

export const SeoPages: React.FC<{ path:string }> = ({path}) => {
  const slug = path.replace(/^\//,'');
  const article = slug.startsWith('articles/') ? seoArticles.find(a => a.slug === slug.slice(9)) : null;
  const page = pages[slug];
  return <main className="max-w-4xl mx-auto px-4 py-12 min-h-[60vh]" dir="rtl">{article ? <><p className="text-cyan-600 font-bold mb-3">مجله Avort</p><h1 className="text-3xl font-black text-slate-900">{article.title}</h1><img src="/favicon.svg" alt={`تصویر ${article.title}`} className="mt-6 h-32 w-32 rounded-3xl" /><p className="mt-5 text-lg leading-9 text-slate-600">{article.intro}</p>{article.sections.map(s=><section key={s.heading} className="mt-8"><h2 className="text-xl font-black text-slate-900">{s.heading}</h2><p className="mt-3 leading-9 text-slate-600">{s.body}</p></section>)}<nav className="mt-10 border-t pt-6"><h2 className="text-lg font-black">مطالب مرتبط</h2><div className="mt-3 flex flex-wrap gap-3">{seoArticles.filter(a=>a.slug!==article.slug).slice(0,4).map(a=><a className="text-cyan-700 hover:underline" href={`/articles/${a.slug}`} key={a.slug}>{a.title}</a>)}<a className="text-cyan-700 hover:underline" href="/shop">مشاهده فروشگاه</a></div></nav></> : <><h1 className="text-3xl font-black text-slate-900">{page?.title || 'مقالات راهنمای خرید کفش'}</h1><p className="mt-6 leading-9 text-slate-600">{page?.body || 'راهنماهای کاربردی انتخاب، خرید و نگهداری کفش را در مجله Avort بخوانید.'}</p>{!page&&<div className="mt-8 grid gap-3 sm:grid-cols-2">{seoArticles.map(a=><a className="rounded-xl bg-white p-4 text-cyan-700 hover:shadow" href={`/articles/${a.slug}`} key={a.slug}>{a.title}</a>)}</div>}</>}</main>;
};

export { pages };
