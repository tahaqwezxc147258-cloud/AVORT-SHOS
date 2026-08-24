import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { seoArticles } from '../data/seoArticles';

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://avort.ir').replace(/\/$/, '');

export const SeoHead: React.FC = () => {
  const { viewMode } = useStore();
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '') || '/';
    const article = path.startsWith('/articles/') ? seoArticles.find(item => item.slug === path.slice(10)) : undefined;
    const title = article ? `${article.title} | Avort` : 'خرید کفش و کتانی اصل | Avort';
    const description = article?.description || 'فروشگاه آنلاین Avort برای خرید کفش و کتانی اصل با تضمین اصالت، قیمت مناسب و ارسال سریع.';
    const canonical = siteUrl + path;
    const robots = ['cart', 'profile', 'admin'].includes(viewMode) ? 'noindex, nofollow' : 'index, follow';
    document.title = title;
    const setMeta = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.head.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, name); document.head.appendChild(element); }
      element.content = content;
    };
    setMeta('description', description); setMeta('robots', robots);
    setMeta('og:title', title, true); setMeta('og:description', description, true); setMeta('og:type', article ? 'article' : 'website', true);
    setMeta('og:url', canonical, true); setMeta('og:site_name', 'Avort', true); setMeta('og:locale', 'fa_IR', true); setMeta('og:image', `${siteUrl}/favicon.svg`, true);
    setMeta('twitter:card', 'summary'); setMeta('twitter:title', title); setMeta('twitter:description', description);
    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    link.href = canonical;
    const structuredData = article
      ? { '@context': 'https://schema.org', '@type': 'Article', headline: title, description, url: canonical, image: `${siteUrl}/favicon.svg`, author: { '@type': 'Organization', name: 'Avort' }, inLanguage: 'fa-IR' }
      : { '@context': 'https://schema.org', '@type': ['Organization', 'Store'], name: 'Avort', url: siteUrl, description, image: `${siteUrl}/favicon.svg`, areaServed: 'IR', priceRange: '$$', inLanguage: 'fa-IR' };
    let script = document.getElementById('seo-structured-data') as HTMLScriptElement | null;
    if (!script) { script = document.createElement('script'); script.id = 'seo-structured-data'; script.type = 'application/ld+json'; document.head.appendChild(script); }
    script.textContent = JSON.stringify(structuredData);
  }, [viewMode]);
  return null;
};
