import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, X, Smartphone } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, requestOtp, verifyOtp } = useStore();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isLoginModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('لطفا شماره همراه معتبر ۱۱ رقمی وارد نمایید.');
      return;
    }
    setErrorMsg('');

    try {
      if (!otpSent) {
        if (!(await requestOtp(phoneNumber))) throw new Error('otp');
        setOtpSent(true);
        return;
      }
      if (!(await verifyOtp(phoneNumber, otp))) throw new Error('otp');
      setPhoneNumber('');
      setOtp('');
      setOtpSent(false);
      setIsLoginModalOpen(false);
    } catch {
      setErrorMsg('ورود با خطا مواجه شد. لطفا دوباره تلاش کنید.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cyan-100 overflow-hidden">
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-cyan-400 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-cyan-500/25">
            N
          </div>

          {otpSent && (
            <div>
              <label className="block text-slate-700 mb-1">کد تستی OTP</label>
              <input type="text" inputMode="numeric" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="1234" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-center tracking-[0.5em] font-black text-slate-900" autoFocus />
              <p className="text-[11px] text-cyan-600 mt-2 text-center">کد تستی ورود: 1234</p>
            </div>
          )}
          <h2 className="text-xl font-black text-slate-900">ورود / ثبت‌نام در اِی‌وُرت</h2>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold p-3 rounded-2xl mb-4 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">شماره همراه *</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pr-10 pl-4 text-slate-900 dir-ltr text-center font-extrabold focus:outline-none focus:border-cyan-500 text-sm"
                autoFocus
              />
              <Smartphone className="w-5 h-5 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 active:scale-98 text-white py-3.5 rounded-2xl font-black text-sm shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>ورود سریع بدون SMS</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
