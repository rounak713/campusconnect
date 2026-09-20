import React from 'react';
import { CreditCard, Sparkles, Zap } from 'lucide-react';
import type { College, VerificationMethod } from '../../types';
import { CollegeEmailPanel } from './CollegeEmailPanel';
import { IdCardDropzone } from './IdCardDropzone';

interface MethodChooserStepProps {
  college: College;
  method: VerificationMethod | null;
  onSelectMethod: (method: VerificationMethod) => void;
  onEmailSent: (email: string) => void;
  onIdUploaded: (fileName: string) => void;
  onVerified: () => void;
  onBack: () => void;
}

const METHODS: Array<{
  id: VerificationMethod;
  title: string;
  subtitle: string;
  icon: typeof Zap;
  accent: string;
  ring: string;
  chip: string;
}> = [
  {
    id: 'email',
    title: 'Instant verification',
    subtitle: 'OTP to your .edu.in / .ac.in college email',
    icon: Zap,
    accent: 'text-[#06B6D4]',
    ring: 'border-[#06B6D4]/60 bg-[#06B6D4]/[0.09] shadow-[0_0_24px_rgba(6,182,212,0.18)]',
    chip: 'bg-[#06B6D4]/15 text-[#67E8F9] border-[#06B6D4]/25',
  },
  {
    id: 'id_card',
    title: 'Backup verification',
    subtitle: 'Upload your student ID card for manual review',
    icon: CreditCard,
    accent: 'text-[#8B5CF6]',
    ring: 'border-[#8B5CF6]/60 bg-[#8B5CF6]/[0.09] shadow-[0_0_24px_rgba(139,92,246,0.18)]',
    chip: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/25',
  },
];

export const MethodChooserStep: React.FC<MethodChooserStepProps> = ({
  college, method, onSelectMethod, onEmailSent, onIdUploaded, onVerified, onBack,
}) => (
  <div className="space-y-5 animate-fade-up">
    <div>
      <h2 className="text-2xl font-bold text-white tracking-tight">Prove you study here</h2>
      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
        Pick a method — instant email OTP, or upload your ID card if your college mail is inactive.
      </p>
    </div>

    <div className="space-y-3">
      {METHODS.map(({ id, title, subtitle, icon: Icon, accent, ring, chip }) => {
        const isActive = method === id;
        return (
          <button
            key={id}
            onClick={() => onSelectMethod(id)}
            className={`w-full text-left rounded-3xl border p-4 transition-all duration-200 ${
              isActive ? ring : 'border-white/[0.07] bg-[#0E1528] hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white/[0.06]' : 'bg-white/[0.04]'}`}>
                <Icon className={`w-5 h-5 ${accent}`} strokeWidth={1.9} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{title}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${chip}`}>
                    {id === 'email' ? 'Fastest' : 'Backup'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>

    {method === 'email' && (
      <CollegeEmailPanel college={college} onSent={onEmailSent} onVerified={onVerified} />
    )}
    {method === 'id_card' && (
      <IdCardDropzone onUploaded={onIdUploaded} onSubmitted={onVerified} />
    )}

    {!method && (
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <Sparkles className="w-3 h-3" /> Verified students get 3 free crush slots
      </p>
    )}

    <button
      onClick={onBack}
      className="w-full rounded-2xl border border-white/10 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-white/25"
    >
      Back to college
    </button>
  </div>
);
