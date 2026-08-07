import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Lock, CreditCard, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const ZarinpalGatewayModal: React.FC = () => {
  const { pendingOrder, isZarinpalModalOpen, completeZarinpalPayment, setIsZarinpalModalOpen, user } = useStore();

  const [cardNumber, setCardNumber] = useState<string>('۶۰۳۷-۹۹۷۵-۸۳۲۱-۴۵۹۰');
  const [cvv2, setCvv2] = useState<string>('۴۵۹');
  const [expMonth, setExpMonth] = useState<string>('۰۸');
  const [expYear, setExpYear] = useState<string>('۰۶');
  const [pin, setPin] = useState<string>('۱۲۳۴۵۶');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isZarinpalModalOpen || !pendingOrder) return null;

  const handlePaySuccess = async () => {
    if (!user) {
      alert('برای تکمیل پرداخت باید وارد حساب کاربری شوید.');
      setIsZarinpalModalOpen(false);
      return;
    }

    setIsProcessing(true);
    // simulate processing delay then call payment completion which talks to server
    setTimeout(async () => {
      try {
        const ok = await completeZarinpalPayment(pendingOrder.id, true);
        if (ok) alert('پرداخت با موفقیت انجام شد.');
        else alert('پرداخت انجام نشد. لطفاً دوباره تلاش کنید.');
      } catch (e) {
        alert('خطا در تکمیل پرداخت.');
      }
      setIsProcessing(false);
    }, 1200);
  };

  const handleCancel = () => {
    completeZarinpalPayment(pendingOrder.id, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      
      {/* Zarinpal Styled Frame Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200 animate-scale-up">
        
        {/* Zarinpal Top Brand Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 p-5 text-slate-950 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 font-black text-xl flex items-center justify-center shadow-md">
              Z
            </div>
            <div>
              <h2 className="font-black text-lg">درگاه پرداخت امن زرین‌پال</h2>
              <p className="text-[11px] font-bold text-slate-900 opacity-90">درگاه پرداخت الکترونیک شاپرک</p>
            </div>
          </div>
          <div className="text-left text-xs font-bold bg-slate-950/10 px-3 py-1 rounded-full border border-slate-950/20">
            تست سندباکس
          </div>
        </div>

        {/* Merchant & Order Details */}
        <div className="p-5 bg-amber-50/60 border-b border-amber-100 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-medium block">پذیرنده:</span>
            <span className="font-extrabold text-slate-900">فروشگاه آنلاین اِی‌وُرت</span>
          </div>

          <div>
            <span className="text-slate-500 font-medium block">کد پیگیری سفارش:</span>
            <span className="font-extrabold text-cyan-700 dir-ltr text-right inline-block">{pendingOrder.trackingCode}</span>
          </div>

          <div className="col-span-2 pt-2 border-t border-amber-200/60 flex items-center justify-between">
            <span className="text-slate-600 font-bold">مبلغ کل پرداختی:</span>
            <span className="text-xl font-black text-slate-900">
              {pendingOrder.totalAmountToman.toLocaleString('fa-IR')} <span className="text-xs text-amber-600">تومان</span>
            </span>
          </div>
        </div>

        {/* Payment Card Simulation Form */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">شماره کارت بانکی عضو شتاب</label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 font-extrabold text-center dir-ltr tracking-widest focus:outline-none focus:border-amber-500"
              />
              <CreditCard className="w-5 h-5 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">کد CVV2</label>
              <input
                type="text"
                value={cvv2}
                onChange={(e) => setCvv2(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-2 text-slate-900 font-bold text-center focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">ماه انقضا</label>
              <input
                type="text"
                value={expMonth}
                onChange={(e) => setExpMonth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-2 text-slate-900 font-bold text-center focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">سال انقضا</label>
              <input
                type="text"
                value={expYear}
                onChange={(e) => setExpYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-2 text-slate-900 font-bold text-center focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">رمز پویا / دوم اینترنتی</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 font-bold text-center focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-2.5 rounded-xl font-bold text-[11px] whitespace-nowrap"
              >
                درخواست رمز پویا
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-2">
            <button
              onClick={handlePaySuccess}
              disabled={isProcessing}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال تایید تراکنش در شبکه شتاب...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>پرداخت و تکمیل تراکنش</span>
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-xs transition-colors"
            >
              انصراف و بازگشت به فروشگاه
            </button>
          </div>

          <p className="text-[10px] text-center text-slate-400 pt-2 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-emerald-500" />
            تراکنش‌های شما با استاندارد رمزنگاری ۲۵۶ بیتی SSL محافظت می‌شود.
          </p>

        </div>

      </div>
    </div>
  );
};
