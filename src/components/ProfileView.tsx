import React, { useMemo, useState } from 'react';
import { Heart, LogIn, MapPin, Package, Plus, Save, Trash2, UserRound } from 'lucide-react';
import rawCities from 'iran-cities/json/city.json';
import rawProvinces from 'iran-cities/json/province.json';
import { Address } from '../types';
import { useStore } from '../context/StoreContext';

type Tab = 'profile' | 'addresses' | 'orders' | 'wishlist';
type Place = { id: string; name: string; province_id?: string };
type AddressDraft = Omit<Address, 'id'> & { id?: string };

const decode = (value: string) => { try { return decodeURIComponent(escape(value)); } catch { return value; } };
const provinces = (rawProvinces as Place[]).map(item => ({ ...item, name: decode(item.name) }));
const cities = (rawCities as Place[]).map(item => ({ ...item, name: decode(item.name) }));
const blankAddress = (): AddressDraft => ({ title: 'خانه', receiverName: '', phone: '', city: '', address: '', postalCode: '', isDefault: false });
const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100';

const AddressEditor: React.FC<{ draft: AddressDraft; onSave: (draft: AddressDraft) => void; onCancel: () => void }> = ({ draft, onSave, onCancel }) => {
  const cityRecord = cities.find(item => item.name === draft.city);
  const [provinceId, setProvinceId] = useState(cityRecord?.province_id || '');
  const [value, setValue] = useState(draft);
  const cityOptions = cities.filter(city => city.province_id === provinceId);
  const set = <K extends keyof AddressDraft>(key: K, next: AddressDraft[K]) => setValue(previous => ({ ...previous, [key]: next }));
  return (
    <form onSubmit={event => { event.preventDefault(); onSave(value); }} className="rounded-3xl border border-cyan-200 bg-cyan-50/60 p-4 sm:p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-sm font-bold">عنوان آدرس<input required value={value.title} onChange={e => set('title', e.target.value)} placeholder="خانه، محل کار…" className={inputClass} /></label>
        <label className="text-sm font-bold">نام گیرنده<input required value={value.receiverName} onChange={e => set('receiverName', e.target.value)} placeholder="نام تحویل‌گیرنده" className={inputClass} /></label>
        <label className="text-sm font-bold">شماره تماس<input required value={value.phone} onChange={e => set('phone', e.target.value)} inputMode="numeric" placeholder="۰۹۱۲۱۲۳۴۵۶۷" className={inputClass} /></label>
        <label className="text-sm font-bold">استان<select required value={provinceId} onChange={e => { setProvinceId(e.target.value); set('city', ''); }} className={inputClass}><option value="">استان را انتخاب کنید</option>{provinces.map(province => <option key={province.id} value={province.id}>{province.name}</option>)}</select></label>
        <label className="text-sm font-bold">شهر<select required disabled={!provinceId} value={value.city} onChange={e => set('city', e.target.value)} className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}><option value="">{provinceId ? 'شهر را انتخاب کنید' : 'ابتدا استان را انتخاب کنید'}</option>{cityOptions.map(city => <option key={city.id} value={city.name}>{city.name}</option>)}</select></label>
        <label className="text-sm font-bold">کدپستی<input required value={value.postalCode} onChange={e => set('postalCode', e.target.value)} inputMode="numeric" placeholder="۱۰ رقمی" className={inputClass} /></label>
        <label className="sm:col-span-2 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={value.isDefault} onChange={e => set('isDefault', e.target.checked)} className="accent-cyan-500 w-4 h-4" />آدرس پیش‌فرض</label>
        <label className="sm:col-span-2 text-sm font-bold">نشانی کامل<textarea required value={value.address} onChange={e => set('address', e.target.value)} placeholder="خیابان، کوچه، پلاک و واحد" className={`${inputClass} min-h-28 resize-y`} /></label>
      </div>
      <div className="mt-5 flex gap-2"><button className="rounded-xl bg-cyan-500 px-5 py-3 text-white font-bold">ذخیره آدرس</button><button type="button" onClick={onCancel} className="rounded-xl bg-white px-5 py-3 font-bold text-slate-600">انصراف</button></div>
    </form>
  );
};

export const ProfileView: React.FC = () => {
  const { user, orders, products, wishlist, setSelectedProduct, setViewMode, setIsLoginModalOpen, updateProfile, saveAddress, removeAddress } = useStore();
  const [tab, setTab] = useState<Tab>('profile');
  const [name, setName] = useState(user?.fullName || '');
  const [addressDraft, setAddressDraft] = useState<AddressDraft | null>(null);
  const wishedProducts = useMemo(() => products.filter(product => wishlist.includes(product.id)), [products, wishlist]);
  if (!user) return <section className="max-w-xl mx-auto px-4 py-16 text-center space-y-5"><div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-100 text-cyan-600 grid place-items-center"><UserRound /></div><h1 className="text-2xl font-black">حساب کاربری</h1><p className="text-slate-600">برای ثبت مشخصات و آدرس، ابتدا وارد شوید.</p><button onClick={() => setIsLoginModalOpen(true)} className="bg-cyan-500 text-white rounded-2xl px-6 py-3 font-bold inline-flex gap-2"><LogIn className="w-4 h-4" />ورود یا ثبت‌نام</button></section>;
  const tabs: Array<[Tab, string, React.ElementType]> = [['profile', 'مشخصات من', UserRound], ['addresses', 'آدرس‌ها', MapPin], ['orders', 'سفارش‌ها', Package], ['wishlist', 'علاقه‌مندی‌ها', Heart]];
  return <section className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-6">
    <header className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-wrap gap-5 justify-between items-center"><div className="flex gap-4 items-center"><div className="w-16 h-16 bg-cyan-500 rounded-2xl grid place-items-center"><UserRound className="w-8 h-8" /></div><div><h1 className="text-2xl font-black">{user.fullName || 'حساب کاربری'}</h1><p className="text-slate-300 text-sm dir-ltr text-right">{user.phone}</p></div></div><button onClick={() => setViewMode('shop')} className="rounded-2xl bg-cyan-500 px-5 py-3 font-bold">ادامه خرید</button></header>
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6"><nav className="rounded-3xl border border-cyan-100 bg-white p-3 flex lg:flex-col gap-2 overflow-x-auto">{tabs.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={`shrink-0 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-bold ${tab === id ? 'bg-cyan-500 text-white' : 'text-slate-600 hover:bg-cyan-50'}`}><Icon className="w-4 h-4" />{label}</button>)}</nav>
      <main className="rounded-3xl border border-cyan-100 bg-white p-5 sm:p-7 min-h-96">
        {tab === 'profile' && <form onSubmit={async e => { e.preventDefault(); await updateProfile({ fullName: name, avatar: user.avatar }); }} className="max-w-xl space-y-5"><h2 className="text-lg font-black">اطلاعات شخصی</h2><label className="block text-sm font-bold">نام و نام خانوادگی<input required value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً علی رضایی" className={inputClass} /></label><p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">تصویر پروفایل به‌صورت خودکار از حرف اول نام یا شمارهٔ شما ساخته می‌شود.</p><button className="rounded-xl bg-cyan-500 px-5 py-3 text-white font-bold inline-flex gap-2"><Save className="w-4 h-4" />ذخیرهٔ تغییرات</button></form>}
        {tab === 'addresses' && <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black">آدرس‌های من</h2><p className="text-xs text-slate-500 mt-1">ابتدا استان و سپس شهر را انتخاب کنید.</p></div><button onClick={() => setAddressDraft(blankAddress())} className="rounded-xl bg-cyan-500 text-white px-4 py-2.5 font-bold text-sm inline-flex items-center gap-1"><Plus className="w-4 h-4" />افزودن آدرس</button></div>{addressDraft && <AddressEditor draft={addressDraft} onSave={async draft => { await saveAddress(draft); setAddressDraft(null); }} onCancel={() => setAddressDraft(null)} />}{user.addresses.length === 0 ? <div className="py-10 text-center text-sm text-slate-500">هنوز آدرسی ثبت نشده است.</div> : <div className="grid gap-3">{user.addresses.map(address => <article key={address.id} className="rounded-2xl border border-slate-100 p-4 flex gap-3 justify-between"><div><div className="font-black">{address.title} {address.isDefault && <span className="text-xs text-cyan-600 mr-2">پیش‌فرض</span>}</div><p className="mt-2 text-sm">{address.receiverName} — {address.city}</p><p className="mt-1 text-xs leading-5 text-slate-500">{address.address}</p></div><div className="flex h-fit gap-3 text-sm"><button onClick={() => setAddressDraft(address)} className="text-cyan-600">ویرایش</button><button onClick={() => removeAddress(address.id)} className="text-rose-500"><Trash2 className="w-4 h-4" /></button></div></article>)}</div>}</div>}
        {tab === 'orders' && <div className="space-y-3"><h2 className="text-lg font-black">سفارش‌های من</h2>{orders.length ? orders.map(order => <article key={order.id} className="rounded-2xl border border-slate-100 p-4 flex justify-between"><div><b>{order.trackingCode}</b><p className="mt-1 text-xs text-slate-500">{order.createdAt}</p></div><div className="text-left"><b className="text-cyan-600">{order.totalAmountToman.toLocaleString('fa-IR')} تومان</b><p className="mt-1 text-xs">{order.status}</p></div></article>) : <p className="text-sm text-slate-500">هنوز سفارشی ثبت نکرده‌اید.</p>}</div>}
        {tab === 'wishlist' && <div className="space-y-3"><h2 className="text-lg font-black">علاقه‌مندی‌ها</h2>{wishedProducts.length ? <div className="grid sm:grid-cols-2 gap-3">{wishedProducts.map(product => <button key={product.id} onClick={() => setSelectedProduct(product)} className="rounded-2xl border border-slate-100 p-3 flex gap-3 items-center text-right"><img src={product.images[0]} className="w-14 h-14 object-contain" /><b className="text-sm">{product.name}</b></button>)}</div> : <p className="text-sm text-slate-500">هنوز محصولی به علاقه‌مندی‌ها اضافه نشده است.</p>}</div>}
      </main></div>
  </section>;
};
