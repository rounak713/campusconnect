import React, { useEffect, useState } from 'react';
import { ArrowRight, Lock, RefreshCw, Sparkles } from 'lucide-react';
import { OtpInput } from '../common/OtpInput';

const EMPTY_OTP = ['', '', '', '', '', ''];

interface PhoneOtpStepProps {
  onVerified: (phone: string) => void;
}

export const PhoneOtpStep: React.FC<PhoneOtpStepProps> = ({ onVerified }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(EMPTY_OTP);
  const [stage, setStage] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (stage !== 'otp' || timer <= 0) return;
    const t = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [stage, timer]);

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setOtp(EMPTY_OTP);
    setTimer(30);
    setStage('otp');
  };

  const verify = (code: string[]) => {
    if (code.join('').length < 6) {
      setError('Enter all 6 digits of the OTP');
      return;
    }
    setError('');
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerified(phone);
    }, 700);
  };

  if (stage === 'phone') {
    return (
      <form onSubmit={sendOtp} className="space-y-5 animate-fade-up">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Verify your number</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            One number, one student account. We store only a salted hash of your phone.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Mobile Number</label>
          <div className="flex items-center rounded-2xl bg-[#0E1528] border border-white/[0.08] overflow-hidden transition-all focus-within:border-[#8B5CF6]/70 focus-within:ring-2 focus-within:ring-[#8B5CF6]/20">
            <span className="px-4 py-3.5 text-xs font-semibold text-slate-400 border-r border-white/[0.07]">🇮🇳 +91</span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="98765 43210"
              className="flex-1 bg-transparent px-4 py-3.5 text-sm text-white font-mono tracking-widest placeholder:text-slate-600 focus:outline-none"
            />
          </div>
          {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.28)] transition-transform active:scale-[0.98]"
        >
          Send 6-digit OTP
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Lock className="w-3 h-3" /> Number never shown to other students
        </p>
      </form>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Enter the OTP</h2>
        <div className="flex items-center gap-2 mt-1.5">
          <p className="text-xs text-slate-400">
            Sent to +91 {phone.slice(0, 2)}****{phone.slice(-4)}
          </p>
          <button onClick={() => setStage('phone')} className="text-[11px] font-semibold text-[#8B5CF6]">
            Change
          </button>
        </div>
      </div>

      <OtpInput value={otp} onChange={setOtp} accent="violet" autoFocus />
      {error && <p className="text-xs text-rose-400">{error}</p>}

      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (timer <= 0) setTimer(30); }}
          disabled={timer > 0}
          className={`inline-flex items-center gap-1.5 text-xs ${timer > 0 ? 'text-slate-600' : 'text-[#06B6D4]'}`}
        >
          <RefreshCw className={`w-3 h-3 ${timer > 0 ? 'animate-spin' : ''}`} />
          {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
        </button>
        <button
          onClick={() => { const demo = ['1', '2', '3', '4', '5', '6']; setOtp(demo); verify(demo); }}
          className="inline-flex items-center gap-1 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-2.5 py-1 text-[11px] font-semibold text-[#6EE7B7]"
        >
          <Sparkles className="w-3 h-3" /> Demo 123456
        </button>
      </div>

      <button
        onClick={() => verify(otp)}
        disabled={isVerifying}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.28)] transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        {isVerifying ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
            Verifying…
          </>
        ) : (
          <>Verify number<ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </div>
  );
};
