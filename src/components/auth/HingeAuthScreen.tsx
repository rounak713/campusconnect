import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CollegeSelector } from './CollegeSelector';

export const HingeAuthScreen: React.FC = () => {
  const { selectedCollege, setSelectedCollege, login, isSetupModalOpen, setIsSetupModalOpen } = useApp();

  const [phone, setPhone]         = useState('');
  const [step, setStep]           = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [timer, setTimer]         = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError]         = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isSetupModalOpen) { setStep('phone'); setOtp(['','','','','','']); setError(''); }
  }, [isSetupModalOpen]);

  useEffect(() => {
    if (step !== 'otp') return;
    if (timer <= 0) { setCanResend(true); return; }
    const t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, timer]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid 10-digit number'); return;
    }
    setError('');
    setStep('otp');
    setTimer(30);
    setCanResend(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 6).split('');
      const next = [...otp];
      digits.forEach((d, i) => { if (i < 6) next[i] = d; });
      setOtp(next);
      inputRefs.current[Math.min(digits.length, 5)]?.focus();
      return;
    }
    const next = [...otp];
    next[idx] = val.replace(/\D/g, '');
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const verify = (autoOtp?: string[]) => {
    const code = (autoOtp || otp).join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setIsVerifying(true);
    setError('');
    setTimeout(() => {
      setIsVerifying(false);
      login(phone || '9810123456', selectedCollege);
    }, 800);
  };

  if (!isSetupModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-up">
      <div
        className="w-full max-w-md bg-noir-850 rounded-t-[32px] sm:rounded-[32px] border border-white/[0.07] shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#6F38E8] flex items-center justify-center shadow-glow-sm-violet">
              <ShieldCheck className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Discreet Sign In</p>
              <p className="text-[11px] text-zinc-500">Anonymous · Hashed · Private</p>
            </div>
          </div>
          <button
            onClick={() => setIsSetupModalOpen(false)}
            className="w-8 h-8 rounded-full bg-noir-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              {/* Heading */}
              <div>
                <h2 className="editorial-heading text-3xl mb-1">
                  What's your<br />
                  <span className="italic text-[#6F38E8]">campus?</span>
                </h2>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  We only store a hashed fingerprint of your number — never the real one.
                </p>
              </div>

              {/* College selector */}
              <CollegeSelector selectedCollege={selectedCollege} onSelect={setSelectedCollege} />

              {/* Phone input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">Mobile Number</label>
                <div className="flex items-center gap-0 bg-noir-800 border border-white/[0.08] rounded-2xl overflow-hidden focus-within:border-[#6F38E8]/60 focus-within:ring-2 focus-within:ring-[#6F38E8]/15 transition-all">
                  <div className="flex items-center gap-1.5 pl-4 pr-3 py-3.5 text-xs font-semibold text-zinc-400 border-r border-white/[0.07] shrink-0">
                    <span className="text-base">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="flex-1 bg-transparent px-3 py-3.5 text-sm text-white placeholder:text-zinc-600 font-mono tracking-widest focus:outline-none"
                    autoFocus
                  />
                </div>
                {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
              </div>

              <button type="submit" className="hinge-btn w-full">
                Get Secure OTP
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>

              <p className="text-center text-[11px] text-zinc-600">
                Your number is hashed client-side. We never see it.
              </p>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Heading */}
              <div>
                <h2 className="editorial-heading text-3xl mb-1">
                  Enter the<br />
                  <span className="italic text-[#6F38E8]">OTP</span>
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-zinc-500">
                    Sent to +91 {phone.slice(0, 2)}****{phone.slice(-4)}
                  </p>
                  <button onClick={() => setStep('phone')} className="text-[11px] text-[#6F38E8] hover:underline">
                    Change
                  </button>
                </div>
              </div>

              {/* OTP inputs */}
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className={`w-11 h-14 text-center bg-noir-800 border rounded-xl text-xl font-bold text-white font-mono focus:outline-none transition-all ${
                      digit ? 'border-[#6F38E8]' : 'border-white/[0.08] focus:border-[#6F38E8]/60'
                    }`}
                  />
                ))}
              </div>
              {error && <p className="text-xs text-rose-400">{error}</p>}

              {/* Resend + Demo */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { if (canResend) { setTimer(30); setCanResend(false); } }}
                  disabled={!canResend}
                  className={`text-xs flex items-center gap-1.5 ${canResend ? 'text-[#6F38E8] hover:underline' : 'text-zinc-600'}`}
                >
                  <RefreshCw className={`w-3 h-3 ${!canResend ? 'animate-spin' : ''}`} />
                  {canResend ? 'Resend OTP' : `Resend in ${timer}s`}
                </button>
                <button
                  onClick={() => { const demo = ['1','2','3','4','5','6']; setOtp(demo); verify(demo); }}
                  className="text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full"
                >
                  Demo: 123456
                </button>
              </div>

              <button
                onClick={() => verify()}
                disabled={isVerifying}
                className="hinge-btn w-full"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Enter CampusConnect
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
