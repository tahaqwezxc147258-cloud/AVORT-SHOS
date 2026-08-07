import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, User as UserIcon, Lock } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const {
    user,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateUserProfile,
    logout
  } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [addressText, setAddressText] = useState('');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || '');
    setPhone(user.phone || '');
    const activeAddress = user.addresses?.[0] || null;
    setCity(activeAddress?.city || '');
    setAddressText(activeAddress?.address || '');
    setPostalCode(activeAddress?.postalCode || '');
  }, [user, isProfileModalOpen]);

  if (!isProfileModalOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAddress = {
      id: user.addresses[0]?.id || `address-${Date.now()}`,
      title: 'آدرس پیش‌فرض',
      receiverName: fullName,
      phone,
      city,
      address: addressText,
      postalCode
    };

    updateUserProfile({
      fullName,
      phone,
      addresses: [updatedAddress]
    });
    setIsProfileModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cyan-100 overflow-hidden">
        <button
          onClick={() => setIsProfileModalOpen(false)}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto mb-4 w-16 h-16 rounded-3xl bg-cyan-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/20">
            <UserIcon className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">پروفایل کاربری</h2>
          <p className="text-xs text-slate-500">اطلاعات خود را ویرایش کنید تا در سفارش‌های بعدی سریع‌تر تسویه کنید.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">نام و نام خانوادگی</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">شماره همراه</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">شهر</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">کد پستی</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">آدرس کامل</label>
            <textarea
              rows={3}
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-2xl font-black text-sm transition-all"
            >
              ذخیره پروفایل
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-black text-sm transition-all"
            >
              خروج از حساب
            </button>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 rounded-2xl p-3 border border-slate-100">
            نقش شما: <span className="font-black text-slate-900">{user.role === 'admin' ? 'ادمین' : 'کاربر'}</span>
          </div>
        </form>
      </div>
    </div>
  );
};
