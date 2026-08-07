import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://noir-sneaker-store.vercel.app').replace(/\/$/, '');

const setMeta = (name: string, content: string, property = false) => {
  const attribute = property ? 'property' : 'name';
  let tag = document.head.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attribute, name); document.head.appendChild(tag); }
  tag.content = content;
};

export const SeoHead: React.FC = () => {
  const { viewMode, selectedProduct } = useStore();
  useEffect(() => {
    const isPrivate = viewMode === 'cart' || viewMode === 'profile' || viewMode === 'admin';
    const title = selectedProduct ? `${selectedProduct.nameFa} | خرید کتانی اصل | ای‌وورت` : viewMode === 'shop' ? 'خرید کتانی نایک و جردن اصل | فروشگاه ای‌وورت' : 'فروشگاه کتانی اصل نایک و جردن | ای‌وورت';
    const description = selectedProduct ? `مشاهده مشخصات، تصاویر، سایزها و قیمت ${selectedProduct.nameFa} در فروشگاه ای‌وورت.` : 'خرید آنلاین کتانی اصل نایک و جردن با تضمین اصالت، قیمت مناسب و ارسال سریع از فروشگاه ای‌وورت.';
    document.title = title;
    setMeta('description', description);
    setMeta('robots', isPrivate ? 'noindex, nofollow' : 'index, follow');
    setMeta('og:title', title, true); setMeta('og:description', description, true); setMeta('og:type', selectedProduct ? 'product' : 'website', true); setMeta('og:locale', 'fa_IR', true); setMeta('og:site_name', 'ای‌وورت', true); setMeta('twitter:card', 'summary_large_image');
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${siteUrl}${viewMode === 'shop' ? '/shop' : '/'}`;
    let structuredData = document.getElementById('seo-structured-data');
    if (!structuredData) { const script = document.createElement('script'); script.id = 'seo-structured-data'; script.type = 'application/ld+json'; document.head.appendChild(script); structuredData = script; }
    structuredData.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'Organization', name: 'ای‌وورت', url: siteUrl, logo: `${siteUrl}/favicon.svg` },
      { '@type': 'WebSite', name: 'فروشگاه ای‌وورت', url: siteUrl, inLanguage: 'fa-IR', potentialAction: { '@type': 'SearchAction', target: `${siteUrl}/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
      { '@type': 'OnlineStore', name: 'فروشگاه کتانی ای‌وورت', url: siteUrl, description, priceRange: '$$' },
      ...(selectedProduct ? [{ '@type': 'Product', name: selectedProduct.nameFa, image: selectedProduct.images, description: selectedProduct.description, brand: { '@type': 'Brand', name: selectedProduct.brand }, offers: { '@type': 'Offer', priceCurrency: 'IRR', price: selectedProduct.priceToman * 10, availability: selectedProduct.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: siteUrl } }] : [])
    ] });
  }, [viewMode, selectedProduct]);
  return null;
};
