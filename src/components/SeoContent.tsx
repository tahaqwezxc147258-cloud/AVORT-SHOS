import React from 'react';

export const SeoContent: React.FC = () => (
  <section className="max-w-7xl mx-auto px-4 lg:px-8 pb-10" aria-labelledby="seo-content-title">
    <div className="rounded-3xl border border-cyan-100 bg-white p-6 sm:p-8 shadow-sm">
      <h2 id="seo-content-title" className="text-xl font-black text-slate-900">خرید کتونی با کیفیت و انتخاب مطمئن</h2>
      <p className="mt-3 text-sm leading-8 text-slate-600">
        در فروشگاه ایوُرت می‌توانید مدل‌های متنوع کتونی را با تصاویر واقعی، مشخصات کامل، رنگ‌ها و سایزهای موجود بررسی کنید. محصولات ما با تمرکز بر کیفیت ساخت، راحتی و ارزش خرید انتخاب شده‌اند.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <details className="rounded-2xl bg-cyan-50/60 p-4">
          <summary className="cursor-pointer font-black text-slate-900">چطور خرید کنیم؟</summary>
          <p className="mt-2 text-sm leading-7 text-slate-600">مدل موردنظر را انتخاب کنید، سایز و رنگ را بررسی کرده و آن را به سبد خرید اضافه کنید. سپس اطلاعات ارسال را کامل و سفارش خود را پیگیری کنید.</p>
        </details>
        <details className="rounded-2xl bg-cyan-50/60 p-4">
          <summary className="cursor-pointer font-black text-slate-900">چطور سایز مناسب را پیدا کنیم؟</summary>
          <p className="mt-2 text-sm leading-7 text-slate-600">طول پا را در حالت ایستاده از پاشنه تا بلندترین انگشت اندازه بگیرید و با جدول سایز همان محصول مقایسه کنید. اگر بین دو سایز هستید، برای راهنمایی با پشتیبانی تماس بگیرید.</p>
        </details>
        <details className="rounded-2xl bg-cyan-50/60 p-4">
          <summary className="cursor-pointer font-black text-slate-900">کیفیت محصولات چگونه است؟</summary>
          <p className="mt-2 text-sm leading-7 text-slate-600">هر محصول پیش از ارسال از نظر ظاهر و مشخصات بررسی می‌شود. درباره مشخصات، کیفیت و موجودی هر مدل، اطلاعات همان صفحه محصول ملاک خرید است.</p>
        </details>
        <details className="rounded-2xl bg-cyan-50/60 p-4">
          <summary className="cursor-pointer font-black text-slate-900">ارسال و پیگیری سفارش</summary>
          <p className="mt-2 text-sm leading-7 text-slate-600">پس از ثبت سفارش، اطلاعات ارسال و کد پیگیری در حساب کاربری شما قابل مشاهده است و پشتیبانی پاسخ‌گوی سوالات شما خواهد بود.</p>
        </details>
      </div>
    </div>
  </section>
);
