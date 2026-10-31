import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { seoArticles, type SeoArticle } from '../data/seoArticles';

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://avort.ir').replace(/\/$/, '');
const siteName = 'آورت';
const defaultTitle = 'فروشگاه کفش نایک و جردن | کتانی رانینگ آورت';
const defaultDescription = 'خرید آنلاین کتانی و کفش نایک و جردن از فروشگاه آورت؛ بررسی مشخصات، رنگ و سایز محصولات و ثبت سفارش آنلاین.';
const pageMeta: Record<string, { title: string; description: string }> = {
  '/': { title: defaultTitle, description: defaultDescription },
  '/shop': { title: 'فروشگاه کفش نایک و جردن | کتانی رانینگ آورت', description: 'مدل‌های کتانی رانینگ و روزمره نایک و جردن را در فروشگاه آورت ببینید، مشخصات و سایزها را مقایسه کنید و آنلاین سفارش دهید.' },
  '/articles': { title: 'راهنمای خرید و نگهداری کتانی | مجله آورت', description: 'راهنماهای انتخاب سایز، خرید کفش پیاده‌روی، تشخیص اصالت و نگهداری کتانی را در مجله آورت بخوانید.' },
  '/about': { title: 'درباره آورت | فروشگاه آنلاین کتانی', description: 'با فروشگاه آنلاین آورت و راه‌های انتخاب و خرید کتانی آشنا شوید.' },
  '/contact': { title: 'تماس با آورت | پشتیبانی و پیگیری سفارش', description: 'برای پرسش درباره محصولات، انتخاب سایز یا پیگیری سفارش با پشتیبانی آورت در ارتباط باشید.' },
  '/shipping': { title: 'هزینه و روش ارسال سفارش | آورت', description: 'هزینه پست به‌صورت پس‌کرایه است و هنگام تحویل سفارش پرداخت می‌شود؛ مبلغ ارسال در پرداخت آنلاین سفارش محاسبه نمی‌شود.' },
  '/purchase-rules': { title: 'شرایط خرید از فروشگاه آورت', description: 'پیش از ثبت سفارش، مشخصات محصول، اطلاعات ارسال و شرایط خرید فروشگاه آورت را بررسی کنید.' },
  '/returns': { title: 'شرایط پیگیری و بازگشت سفارش | آورت', description: 'برای راهنمایی درباره پیگیری سفارش یا درخواست بررسی، با پشتیبانی آورت تماس بگیرید.' },
  '/privacy': { title: 'حریم خصوصی | فروشگاه آورت', description: 'اطلاعات موردنیاز برای ثبت سفارش و ارائه خدمات در فروشگاه آورت استفاده می‌شود.' },
  '/collection/jordan': { title: 'خرید کتانی جردن | فروشگاه آورت', description: 'مدل‌های جردن موجود در فروشگاه آورت را بررسی کنید و مشخصات و سایزهای هر محصول را ببینید.' },
  '/collection/nike': { title: 'خرید کتانی نایک | فروشگاه آورت', description: 'مدل‌های نایک موجود در فروشگاه آورت را بررسی کنید و مشخصات و سایزهای هر محصول را ببینید.' },
  '/collection/women': { title: 'خرید کتانی زنانه | فروشگاه آورت', description: 'مدل‌های کتانی زنانه فروشگاه آورت را ببینید و مشخصات و سایزهای موجود را بررسی کنید.' },
};

export const SeoHead: React.FC = () => {
  const { selectedProduct } = useStore();
  const [longArticles, setLongArticles] = useState<SeoArticle[]>([]);
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  useEffect(() => {
    if (!path.startsWith('/articles/') || seoArticles.some(item => item.slug === path.slice('/articles/'.length))) return;
    let active = true;
    import('../data/seoLongArticles')
      .then(({ seoLongArticles }) => { if (active) setLongArticles(seoLongArticles); })
      .catch(error => console.error('Failed to load article metadata:', error));
    return () => { active = false; };
  }, [path]);
  useEffect(() => {
    const article = path.startsWith('/articles/')
      ? [...seoArticles, ...longArticles].find(item => item.slug === path.slice('/articles/'.length))
      : undefined;
    const isProductPage = path.startsWith('/product/');
    const isPrivatePage = ['/cart', '/profile', '/admin'].includes(path);
    const isKnownPage = Boolean(pageMeta[path] || article || isProductPage);
    const product = isProductPage ? selectedProduct : null;
    const page = pageMeta[path];
    const title = article
      ? `${article.title} | مجله آورت`
      : product
        ? `${product.nameFa || product.name} | خرید از آورت`
        : page?.title || (isProductPage ? defaultTitle : 'صفحه پیدا نشد | آورت');
    const description = article?.description || product?.description || page?.description || defaultDescription;
    const canonical = `${siteUrl}${path}`;
    const robots = isPrivatePage || !isKnownPage ? 'noindex, nofollow' : 'index, follow';

    document.title = title;
    const meta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let element = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };
    meta('description', description);
    meta('robots', robots);
    meta('og:title', title, true);
    meta('og:description', description, true);
    meta('og:type', article ? 'article' : 'website', true);
    meta('og:url', canonical, true);
    meta('og:site_name', siteName, true);
    meta('og:locale', 'fa_IR', true);
    meta('og:image', `${siteUrl}/og-image.svg`, true);
    meta('twitter:card', 'summary_large_image');
    meta('twitter:title', title);
    meta('twitter:description', description);

    let canonicalLink = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    const data = article
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description,
          url: canonical,
          inLanguage: 'fa-IR',
          author: { '@type': 'Organization', name: siteName },
          publisher: { '@type': 'Organization', name: siteName, url: siteUrl },
        }
      : product
        ? {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.nameFa || product.name,
            image: product.images.map((image: string) => new URL(image, siteUrl).href),
            description: product.description,
            brand: { '@type': 'Brand', name: product.brand },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'IRR',
              price: product.priceToman * 10,
              availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: canonical,
            },
          }
        : {
            '@context': 'https://schema.org',
            '@type': ['Organization', 'Store'],
            name: siteName,
            url: siteUrl,
            description,
            areaServed: 'IR',
            inLanguage: 'fa-IR',
            sameAs: ['https://www.instagram.com/avort.shoes/', 'https://www.tiktok.com/@avort.shoes'],
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+989382475438',
              contactType: 'customer service',
              availableLanguage: 'fa',
            },
          };
    let script = document.getElementById('seo-structured-data') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'seo-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }, [selectedProduct, longArticles, path]);
  return null;
};
