import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, ShieldCheck, ArrowRight, Tag } from 'lucide-react';
import { Address } from '../types';

export const CartView: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    user,
    initiateCheckout,
    setViewMode,
    setIsLoginModalOpen,
    updateUserProfile
  } = useStore();

  const activeAddress = user?.addresses?.find((item) => item.isDefault) || user?.addresses?.[0] || null;

  const [receiverName, setReceiverName] = useState<string>(user?.fullName || activeAddress?.receiverName || '');
  const [phone, setPhone] = useState<string>(user?.phone || activeAddress?.phone || '');
  const [city, setCity] = useState<string>(activeAddress?.city || 'تهران');
  const [address, setAddress] = useState<string>(activeAddress?.address || '');
  const [postalCode, setPostalCode] = useState<string>(activeAddress?.postalCode || '');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(activeAddress?.id || '');
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');
  

  useEffect(() => {
    const nextAddress = user?.addresses?.find((item) => item.isDefault) || user?.addresses?.[0] || null;
    if (!nextAddress) return;
    setSelectedAddressId(nextAddress.id);
    setReceiverName(user?.fullName || nextAddress.receiverName);
    setPhone(user?.phone || nextAddress.phone);
    setCity(nextAddress.city);
    setAddress(nextAddress.address);
    setPostalCode(nextAddress.postalCode);
  }, [user?.id, user?.fullName, user?.phone, user?.addresses]);

  const selectAddress = (nextAddress: Address) => {
    setSelectedAddressId(nextAddress.id);
    setReceiverName(nextAddress.receiverName || user?.fullName || '');
    setPhone(nextAddress.phone || user?.phone || '');
    setCity(nextAddress.city);
    setAddress(nextAddress.address);
    setPostalCode(nextAddress.postalCode);
  };

  const itemsSubtotal = cart.reduce((sum, item) => sum + (item.product.priceToman * item.quantity), 0);
  const packagingTotal = cart.reduce((sum, item) => sum + (item.withSpecialBox ? (item.product.specialBoxPrice || 350000) * item.quantity : 0), 0);
  const shippingFee = cart.length === 0 ? 0 : 200000;
  const discountAmount = Math.round((itemsSubtotal * discountPercent) / 100);
  const finalTotal = itemsSubtotal + packagingTotal + shippingFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'EIVORT2026') {
      setDiscountPercent(15);
      setCouponMessage('کد تخفیف ۱۵٪ جشنواره با موفقیت اعمال شد!');
    } else {
      setDiscountPercent(0);
      setCouponMessage('کد تخفیف وارد شده معتبر نیست.');
    }
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName || !phone || !address) {
      alert('لطفا اطلاعات تحویل‌گیرنده و آدرس ارسال را تکمیل نمایید.');
      return;
    }

    if (!user && false) {
      setIsLoginModalOpen(true);
      alert('برای ادامه‌ی پرداخت لطفاً وارد حساب کاربری شوید.');
      return;
    }

    const updatedAddress: Address = {
      id: activeAddress?.id || `address-${Date.now()}`,
      title: 'آدرس پیش‌فرض',
      receiverName,
      phone,
      city,
      address,
      postalCode
    };

    updateUserProfile({
      fullName: receiverName,
      phone,
      addresses: [updatedAddress]
    });

    await initiateCheckout(receiverName, phone, city, address, postalCode);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-cyan-100/60 text-cyan-600 mx-auto flex items-center justify-center shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">سبد خرید شما خالی است</h2>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
          جدیدترین کتانی‌های اصل نایک و جردن را بررسی کنید و جفت مورد علاقه‌تان را به سبد خرید بیفزایید.
        </p>
        <button
          onClick={() => setViewMode('shop')}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-cyan-500/25 active:scale-95 transition-all text-xs sm:text-sm inline-flex items-center gap-2"
        >
          <span>مشاهده محصولات فروشگاه</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-cyan-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">سبد خرید و تسویه‌حساب</h1>
          <p className="text-xs text-slate-500 mt-1">تعداد محصولات انتخاب شده: {cart.length} جفت</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>خالی کردن سبد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Main Section: Cart Items & Address Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Cart Items List */}
          <div className="bg-white rounded-3xl p-5 border border-cyan-100 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-900 text-base">اقلام سبد خرید</h2>

            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.name}`} className="py-4 flex flex-wrap sm:flex-nowrap items-center gap-4">
                  
                  {/* Image */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-contain filter drop-shadow-xs"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-[180px] space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm dir-ltr text-right">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-slate-500">{item.product.nameFa}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                      <span className="bg-cyan-50 text-cyan-700 px-2.5 py-0.5 rounded-lg font-bold">
                        سایز {item.selectedSize}
                      </span>
                      <span className="flex items-center gap-1">
                        رنگ:
                        <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: item.selectedColor.hex }} />
                        <span>{item.selectedColor.name}</span>
                      </span>
                      <span className={item.withSpecialBox ? 'bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg font-bold' : 'text-slate-400'}>{item.withSpecialBox ? 'جعبه خاص + عادی' : 'جعبه عادی'}</span>
                    </div>
                  </div>

                  {/* Quantity & Controls */}
                  <div className="flex items-center gap-3 shrink-0 mr-auto">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor.name, 1)}
                        className="w-7 h-7 bg-white rounded-lg text-slate-700 flex items-center justify-center font-bold hover:bg-cyan-500 hover:text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-6 text-center font-black text-xs text-slate-900">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor.name, -1)}
                        className="w-7 h-7 bg-white rounded-lg text-slate-700 flex items-center justify-center font-bold hover:bg-rose-500 hover:text-white transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-left font-black text-sm text-slate-900 min-w-[100px]">
                      {(item.product.priceToman * item.quantity).toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-slate-500">تومان</span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor.name)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="حذف از سبد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address Form */}
          <div className="bg-white rounded-3xl p-6 border border-cyan-100 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-900 text-base">مشخصات تحویل‌گیرنده و آدرس ارسال</h2>

            {user?.addresses?.length ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-600">آدرس ارسال را انتخاب کنید</p>
                  <button type="button" onClick={() => setViewMode('profile')} className="text-xs font-bold text-cyan-600 hover:text-cyan-700">مدیریت آدرس‌ها</button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {user.addresses.map((savedAddress) => (
                    <button key={savedAddress.id} type="button" onClick={() => selectAddress(savedAddress)} className={`text-right rounded-2xl border p-3 transition ${selectedAddressId === savedAddress.id ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100' : 'border-slate-200 bg-slate-50 hover:border-cyan-300'}`}>
                      <div className="flex items-center justify-between gap-2"><span className="font-black text-sm text-slate-900">{savedAddress.title}</span>{savedAddress.isDefault && <span className="text-[10px] font-bold text-cyan-600">پیش‌فرض</span>}</div>
                      <p className="mt-1 text-xs text-slate-600">{savedAddress.receiverName} · {savedAddress.city}</p>
                      <p className="mt-1 truncate text-[11px] text-slate-500">{savedAddress.address}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : !user ? (
              <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-xs leading-6 text-cyan-800">برای استفاده از آدرس‌های ذخیره‌شده، ابتدا وارد حساب کاربری شوید.</div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">نام و نام خانوادگی تحویل‌گیرنده *</label>
                <input
                  type="text"
                  required
                  placeholder="مانند: علی محمدی"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">شماره تماس همراه *</label>
                <input
                  type="text"
                  required
                  placeholder="مانند: ۰۹۱۲۳۴۵۶۷۸۹"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">شهر *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">کد پستی ۱۰ رقمی</label>
                <input
                  type="text"
                  placeholder="۱۹۸۷۶۵۴۳۲۱"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">آدرس کامل پستی *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="خیابان، کوچه، پلاک، واحد..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Section: Summary & Zarinpal Checkout Card */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          
          <div className="bg-white rounded-3xl p-6 border border-cyan-100 shadow-lg space-y-5">
            <h2 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">خلاصه فاکتور خرید</h2>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs font-bold text-slate-600">
              <div className="flex justify-between">
                <span>مجموع قیمت محصولات:</span>
                <span className="text-slate-900 font-extrabold">{itemsSubtotal.toLocaleString('fa-IR')} تومان</span>
              </div>

              <div className="flex justify-between">
                <span>هزینه ارسال پست پیشتاز:</span>
                <span className="text-slate-900 font-extrabold">{`${shippingFee.toLocaleString('fa-IR')} تومان`}</span>
              </div>

              {false && discountAmount > 0 && (
                <div className="flex justify-between text-rose-500">
                  <span>تخفیف کد EIVORT2026:</span>
                  <span className="font-extrabold">- {discountAmount.toLocaleString('fa-IR')} تومان</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                <span>مبلغ قابل پرداخت:</span>
                <span className="text-xl text-cyan-600">{finalTotal.toLocaleString('fa-IR')} <span className="text-xs">تومان</span></span>
              </div>
            </div>

            {false && <>
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-cyan-500" />
                <span>کد تخفیف داری؟ (تست: EIVORT2026)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="کد تخفیف"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dir-ltr text-center uppercase"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  اعمال
                </button>
              </div>
              {couponMessage && (
                <p className={`text-[11px] font-bold mt-1.5 ${discountPercent > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {couponMessage}
                </p>
              )}
            </form></>}

            {/* Payment Button leading to Zarinpal Gateway */}
            <button
              onClick={handleProceedToPayment}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 py-4 rounded-2xl font-black text-sm shadow-xl shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 border border-amber-300"
            >
              <CreditCard className="w-5 h-5" />
              <span>پرداخت آنلاین از طریق درگاه زرین‌پال</span>
            </button>

            <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-3 flex items-start gap-2.5 text-cyan-800 text-[11px]">
              <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <p>
                پرداخت شما به صورت امن از طریق شبکه شتاب زرین‌پال انجام می‌شود و سفارش بلافاصله آماده ارسال خواهد شد.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
