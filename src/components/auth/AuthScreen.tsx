import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Sparkles, RefreshCw, KeyRound, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CollegeSelector } from './CollegeSelector';
import { PrivacyBanner } from './PrivacyBanner';

export const AuthScreen: React.FC = () => {
  const { selectedCollege, setSelectedCollege, login, isSetupModalOpen, setIsSetupModalOpen } = useApp();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setError('');
    setStep('otp');
    setTimer(30);
    setCanResend(false);
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '');
    setOtp(newOtp);

    // Auto advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (autoFilledOtp?: string[]) => {
    const code = (autoFilledOtp || otp).join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      setIsVerifying(false);
      login(phone || '9810123456', selectedCollege);
    }, 800);
  };

  const handleDemoAutofill = () => {
    const demoCode = ['1', '2', '3', '4', '5', '6'];
    setOtp(demoCode);
    handleVerifyOtp(demoCode);
  };

  if (!isSetupModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-navy-900 border border-violet-500/30 rounded-3xl p-6 text-left shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close / Skip button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-emerald-500 p-0.5">
              <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">CampusConnect Discreet Auth</span>
          </div>
          <button 
            onClick={() => setIsSetupModalOpen(false)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5"
          >
            Cancel
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Discreet Student Login</span>
            <Sparkles className="w-4 h-4 text-neon-violet" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Anonymous authentication. Your phone number is hashed and never shown to anyone.
          </p>
        </div>

        {/* Privacy Banner */}
        <div className="mb-5">
          <PrivacyBanner />
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* College Selector */}
            <CollegeSelector 
              selectedCollege={selectedCollege} 
              onSelect={setSelectedCollege} 
            />

            {/* Phone Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Mobile Number</span>
                <span className="text-[10px] text-slate-400">+91 Indian Numbers Only</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center space-x-2 text-slate-400 text-xs font-semibold pointer-events-none">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                  <div className="w-px h-4 bg-white/20" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full bg-navy-850 border border-white/10 rounded-2xl pl-20 pr-4 py-3 text-sm text-white placeholder:text-slate-500 font-mono tracking-wider focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-rose-400 mt-1.5 pl-1">{error}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-2xl transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center space-x-2 group"
            >
              <span>Get Discreet OTP</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-navy-850/80 p-3 rounded-2xl border border-white/10">
              <div className="text-xs">
                <span className="text-slate-400">Code sent to: </span>
                <span className="text-white font-mono font-medium">+91 {phone.slice(0, 2)}****{phone.slice(-4)}</span>
              </div>
              <button
                onClick={() => setStep('phone')}
                className="text-[11px] text-violet-400 hover:underline"
              >
                Change
              </button>
            </div>

            {/* OTP 6-box input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-violet-400" />
                <span>Enter 6-Digit OTP</span>
              </label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-13 text-center bg-navy-850 border border-white/10 focus:border-violet-500 rounded-xl text-lg font-bold text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all shadow-inner"
                  />
                ))}
              </div>
              {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
            </div>

            {/* Resend & Demo autofill */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  if (canResend) {
                    setTimer(30);
                    setCanResend(false);
                  }
                }}
                disabled={!canResend}
                className={`text-xs flex items-center space-x-1.5 ${
                  canResend ? 'text-violet-400 hover:underline cursor-pointer' : 'text-slate-500'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${!canResend ? 'animate-spin' : ''}`} />
                <span>{canResend ? 'Resend OTP' : `Resend in ${timer}s`}</span>
              </button>

              <button
                type="button"
                onClick={handleDemoAutofill}
                className="text-[11px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center space-x-1"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Demo Fill (123456)</span>
              </button>
            </div>

            {/* Verify CTA */}
            <button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={isVerifying}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Cryptographic Session...</span>
                </div>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Enter CampusConnect</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
