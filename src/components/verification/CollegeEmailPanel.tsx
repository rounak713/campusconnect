import React, { useState } from 'react';
import { ArrowRight, Mail, Zap } from 'lucide-react';
import type { College } from '../../types';
import { OtpInput } from '../common/OtpInput';

const EMPTY_OTP = ['', '', '', '', '', ''];
const ALLOWED_TLDS = ['.edu.in', '.ac.in'];

interface CollegeEmailPanelProps {
  college: College;
  onSent: (email: string) => void;
  onVerified: () => void;
}

export const CollegeEmailPanel: React.FC<CollegeEmailPanelProps> = ({ college, onSent, onVerified }) => {
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(EMPTY_OTP);
  const [stage, setStage] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const domain = college.emailDomain ?? 'your-college.ac.in';

  const send = () => {
    const composed = `${handle.trim().toLowerCase()}@${domain}`;
    if (!handle.trim()) {
      setError('Enter your college email handle');
      return;
    }
    if (!ALLOWED_TLDS.some(tld => domain.endsWith(tld))) {
      setError('Only .edu.in and .ac.in domains can be instantly verified');
      return;
    }
    setError('');
    setEmail(composed);
    setOtp(EMPTY_OTP);
    setStage('otp');
    onSent(composed);
  };

  const verify = (code: string[]) => {
    if (code.join('').length < 6) {
      setError('Enter all 6 digits sent to your inbox');
      return;
    }
    setError('');
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerified();
    }, 900);
  };

  return (
    <div className="space-y-4 animate-fade-up">
      {stage === 'email' ? (
        <>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">College Email</label>
            <div className="flex items-center rounded-2xl bg-[#0E1528] border border-white/[0.08] overflow-hidden transition-all focus-within:border-[#06B6D4]/70 focus-within:ring-2 focus-within:ring-[#06B6D4]/20">
              <Mail className="w-4 h-4 text-slate-500 ml-4 shrink-0" />
              <input
                type="text"
                value={handle}
                onChange={e => setHandle(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ''))}
                placeholder="rollno.name"
                className="flex-1 min-w-0 bg-transparent px-3 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none"
              />
              <span className="px-3 py-3.5 text-xs font-mono text-[#67E8F9] border-l border-white/[0.07] shrink-0">
                @{domain}
              </span>
            </div>
            {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
          </div>

          <button
            onClick={send}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#06B6D4] py-3.5 text-sm font-semibold text-[#04222B] shadow-[0_10px_30px_rgba(6,182,212,0.25)] transition-transform active:scale-[0.98]"
          >
            <Zap className="w-4 h-4" />
            Send instant verification code
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-slate-400">
            6-digit code sent to <span className="font-mono text-[#67E8F9]">{email}</span>
          </p>
          <OtpInput value={otp} onChange={setOtp} accent="cyan" autoFocus />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex items-center justify-between">
            <button onClick={() => setStage('email')} className="text-[11px] font-semibold text-slate-400">
              Change email
            </button>
            <button
              onClick={() => { const demo = ['1', '2', '3', '4', '5', '6']; setOtp(demo); verify(demo); }}
              className="rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-2.5 py-1 text-[11px] font-semibold text-[#6EE7B7]"
            >
              Demo 123456
            </button>
          </div>
          <button
            onClick={() => verify(otp)}
            disabled={isVerifying}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#06B6D4] py-3.5 text-sm font-semibold text-[#04222B] shadow-[0_10px_30px_rgba(6,182,212,0.25)] transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-[#04222B]/30 border-t-[#04222B] animate-spin" />
                Confirming…
              </>
            ) : (
              <>Confirm student status<ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </>
      )}
    </div>
  );
};
