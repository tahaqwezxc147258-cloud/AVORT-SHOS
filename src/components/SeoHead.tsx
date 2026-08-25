import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { seoArticles } from '../data/seoArticles';

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://avort.ir').replace(/\/$/, '');
const defaultTitle = 'خرید کفش و کتانی اصل | آورت';
const defaultDescription = 'فروشگاه آنلاین آورت؛ خرید کتانی و کفش اصل با تضمین اصالت، قیمت مناسب و ارسال سریع.';

export const SeoHead: React.FC = () => {
  const { viewMode, products, selectedProduct } = useStore();
  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const article = path.startsWith('/articles/') ? seoArticles.find(item => item.slug === path.slice(10)) : undefined;
    const title = article ? `${article.title} | آورت` : defaultTitle;
    const description = article?.description || defaultDescription;
    const canonical = siteUrl + path;
    const noindex = ['cart', 'profile', 'admin'].includes(viewMode);
    document.title = title;
    const meta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };
    meta('description', description); meta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    meta('og:title', title, true); meta('og:description', description, true); meta('og:type', article ? 'article' : 'website', true); meta('og:url', canonical, true); meta('og:site_name', 'آورت', true); meta('og:locale', 'fa_IR', true); meta('og:image', `${siteUrl}/og-image.svg`, true);
    meta('twitter:card', 'summary_large_image'); meta('twitter:title', title); meta('twitter:description', description);
    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    link.href = canonical;
    const data = article ? { '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description, url: canonical, author: { '@type': 'Organization', name: 'آورت' }, publisher: { '@type': 'Organization', name: 'آورت' }, inLanguage: 'fa-IR' } : selectedProduct ? { '@context': 'https://schema.org', '@type': 'Product', name: selectedProduct.nameFa || selectedProduct.name, image: selectedProduct.images, description: selectedProduct.description, brand: { '@type': 'Brand', name: selectedProduct.brand }, offers: { '@type': 'Offer', priceCurrency: 'IRR', price: selectedProduct.priceToman * 10, availability: selectedProduct.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: canonical } } : { '@context': 'https://schema.org', '@type': ['Organization', 'Store'], name: 'آورت', url: siteUrl, description, areaServed: 'IR', inLanguage: 'fa-IR' };
    let script = document.getElementById('seo-structured-data') as HTMLScriptElement | null;
    if (!script) { script = document.createElement('script'); script.id = 'seo-structured-data'; script.type = 'application/ld+json'; document.head.appendChild(script); }
    script.textContent = JSON.stringify(data);
  }, [viewMode, products, selectedProduct]);
  return null;
};
