import React, { useEffect, useState } from 'react';
import { Trash2, Save } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import api from '../api';

const readFile = (file: File) => new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(file); });
export const BannerManager: React.FC = () => {
  const { banners, refreshBanners, addBanner, updateBanner, deleteBanner } = useStore();
  const empty = { title: '', description: '', buttonLabel: 'مشاهده محصولات', href: '/shop', desktopImage: '', mobileImage: '', isActive: true, sortOrder: 0 };
  const [draft, setDraft] = useState(empty);
  useEffect(() => { refreshBanners().catch(() => {}); }, []);
  const set = (key: keyof typeof empty, value: string | boolean | number) => setDraft(p => ({ ...p, [key]: value }));
  const upload = async (key: 'desktopImage' | 'mobileImage', file?: File) => { if (file) { const dataUrl = await readFile(file); const result: any = await api.post('/banners/upload', { dataUrl }); set(key, result.url); } };
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!draft.title || !draft.desktopImage) return alert('عنوان و تصویر دسکتاپ الزامی است'); await addBanner(draft); setDraft(empty); };
  return <section className="bg-white rounded-3xl p-6 border border-cyan-100 shadow-sm space-y-6" dir="rtl">
    <div><h2 className="font-black text-lg">مدیریت بنرها</h2><p className="text-xs text-slate-500 mt-1">تصویر دسکتاپ نسبت ۱۶:۶ و تصویر موبایل نسبت ۴:۵ پیشنهاد می‌شود.</p></div>
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
      <input required placeholder="عنوان بنر" value={draft.title} onChange={e => set('title', e.target.value)} className="rounded-xl border p-3" />
      <input placeholder="توضیح کوتاه" value={draft.description} onChange={e => set('description', e.target.value)} className="rounded-xl border p-3" />
      <label className="rounded-xl border border-dashed p-3 text-sm">تصویر دسکتاپ *<input required type="file" accept="image/*" onChange={e => upload('desktopImage', e.target.files?.[0])} className="block mt-2" /></label>
      <label className="rounded-xl border border-dashed p-3 text-sm">تصویر موبایل<input type="file" accept="image/*" onChange={e => upload('mobileImage', e.target.files?.[0])} className="block mt-2" /></label>
      <input placeholder="متن دکمه" value={draft.buttonLabel} onChange={e => set('buttonLabel', e.target.value)} className="rounded-xl border p-3" />
      <input placeholder="لینک دکمه" value={draft.href} onChange={e => set('href', e.target.value)} className="rounded-xl border p-3 dir-ltr" />
      <button className="sm:col-span-2 rounded-xl bg-cyan-500 text-white p-3 font-bold"><Save className="inline w-4 h-4 ml-1" />افزودن بنر</button>
    </form>
    <div className="grid sm:grid-cols-2 gap-4">{banners.map(b => <div key={b.id} className="rounded-2xl border p-3 space-y-2"><img src={b.desktopImage} className="w-full aspect-[16/6] object-cover rounded-xl" /><div className="flex items-center justify-between"><b>{b.title}</b><div className="flex gap-2"><button onClick={() => updateBanner(b.id, { isActive: !b.isActive })} className="rounded-lg bg-slate-100 px-3 py-1 text-xs">{b.isActive ? 'فعال' : 'غیرفعال'}</button><button onClick={() => confirm('حذف بنر؟') && deleteBanner(b.id)} className="text-rose-600"><Trash2 className="w-4" /></button></div></div></div>)}</div>
  </section>;
};
