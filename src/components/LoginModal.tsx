import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, X, Smartphone, Pencil, RefreshCw } from 'lucide-react';

const toEnglishDigits = (value: string) => value.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, requestOtp, verifyOtp } = useStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = window.setInterval(() => setRetryAfter(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [retryAfter]);

  if (!isLoginModalOpen) return null;
  const editPhone = () => { setOtpSent(false); setOtp(''); setErrorMsg(''); setRetryAfter(0); };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = toEnglishDigits(phoneNumber).replace(/[\s-]/g, '');
    setPhoneNumber(phone);
    if (!/^09\d{9}$/.test(phone) && !/^(?:\+98|98)9\d{9}$/.test(phone)) { setErrorMsg('لطفاً شماره موبایل معتبر وارد کنید.'); return; }
    setErrorMsg(''); setIsBusy(true);
    try {
      if (!otpSent) {
        const result = await requestOtp(phone);
        if (!result.success) { setErrorMsg(result.message || 'ارسال کد تأیید انجام نشد.'); if (result.retryAfter) setRetryAfter(result.retryAfter); return; }
        setOtpSent(true); setOtp(''); setRetryAfter(60); return;
      }
      if (otp.length < 4) { setErrorMsg('کد تأیید را کامل وارد کنید.'); return; }
      const result = await verifyOtp(phone, otp);
      if (!result.success) { setErrorMsg(result.message || 'کد تأیید صحیح نیست.'); return; }
      setPhoneNumber(''); setOtp(''); setOtpSent(false); setIsLoginModalOpen(false);
    } finally { setIsBusy(false); }
  };
  const resend = async () => { setErrorMsg(''); setIsBusy(true); try { const result = await requestOtp(phoneNumber); if (!result.success) { setErrorMsg(result.message || 'ارسال مجدد انجام نشد.'); if (result.retryAfter) setRetryAfter(result.retryAfter); return; } setOtp(''); setRetryAfter(60); } finally { setIsBusy(false); } };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"><div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cyan-100">
    <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-700 p-1"><X className="w-5 h-5" /></button>
    <div className="text-center space-y-2 mb-6"><div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-cyan-400 text-white flex items-center justify-center font-black text-2xl mx-auto">N</div>{otpSent && <p className="text-sm font-bold text-cyan-700">کد تأیید به شماره شما ارسال شد.</p>}<h2 className="text-xl font-black text-slate-900">ورود / ثبت‌نام در ایوُرت</h2></div>
    {errorMsg && <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold p-3 rounded-2xl mb-4 text-center">{errorMsg}</div>}
    <form onSubmit={handleLogin} className="space-y-4 text-xs font-bold">
      <div><div className="flex items-center justify-between mb-1"><label className="text-slate-700">شماره همراه *</label>{otpSent && <button type="button" onClick={editPhone} className="flex items-center gap-1 text-cyan-600"><Pencil className="h-3 w-3" />ویرایش شماره</button>}</div><div className="relative"><input type="tel" disabled={otpSent || isBusy} value={phoneNumber} onChange={e => setPhoneNumber(toEnglishDigits(e.target.value))} placeholder="09123456789" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pr-10 pl-4 text-slate-900 dir-ltr text-center font-extrabold focus:outline-none focus:border-cyan-500 text-sm disabled:opacity-60" autoFocus={!otpSent} /><Smartphone className="w-5 h-5 text-slate-400 absolute right-3 top-3" /></div></div>
      {otpSent && <div><label className="block text-slate-700 mb-1">کد تأیید پیامک</label><input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="123456" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-center tracking-[0.5em] font-black text-slate-900" autoFocus /></div>}
      <button type="submit" disabled={isBusy || (otpSent && retryAfter > 0 && otp.length === 0)} className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2">{isBusy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><span>{otpSent ? 'تأیید و ورود' : 'دریافت کد تأیید'}</span><ArrowLeft className="w-4 h-4" /></>}</button>
      {otpSent && <button type="button" disabled={isBusy || retryAfter > 0} onClick={resend} className="w-full text-xs font-bold text-cyan-600 disabled:text-slate-400">{retryAfter > 0 ? `ارسال مجدد پس از ${retryAfter} ثانیه` : 'ارسال مجدد کد'}</button>}
    </form>
  </div></div>;
};
