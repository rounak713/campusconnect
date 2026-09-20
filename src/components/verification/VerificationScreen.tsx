import React from 'react';
import { CheckCircle2, GraduationCap, Mail, Phone, RotateCcw, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StepIndicator } from './StepIndicator';
import { PhoneOtpStep } from './PhoneOtpStep';
import { CollegeStep } from './CollegeStep';
import { MethodChooserStep } from './MethodChooserStep';
import { VerifiedBadge } from './VerifiedBadge';

export const VerificationScreen: React.FC = () => {
  const {
    verification, selectedCollege, user,
    setVerificationStep, confirmPhone, confirmCollege,
    startVerification, completeVerification, resetVerification,
    setActiveTab,
  } = useApp();

  const isVerified = verification.status === 'verified' && verification.step === 'done';

  return (
    <div className="px-5 py-6 pb-28 space-y-6 animate-fade-up">
      {/* Header */}
      <div className="rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#0A0F1D] via-[#131C33] to-[#0A0F1D] p-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" strokeWidth={1.9} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Student Verification</p>
            <p className="text-[11px] text-slate-400">Campus-only matching, zero-knowledge storage</p>
          </div>
          {isVerified && <VerifiedBadge />}
        </div>
        <div className="mt-5">
          <StepIndicator current={verification.step} />
        </div>
      </div>

      {/* Steps */}
      {verification.step === 'phone' && (
        <PhoneOtpStep onVerified={confirmPhone} />
      )}

      {verification.step === 'college' && (
        <CollegeStep
          initialCollege={selectedCollege}
          onBack={() => setVerificationStep('phone')}
          onConfirm={confirmCollege}
        />
      )}

      {verification.step === 'method' && (
        <MethodChooserStep
          college={selectedCollege}
          method={verification.method}
          onSelectMethod={m => startVerification(m, {})}
          onEmailSent={email => startVerification('email', { collegeEmail: email })}
          onIdUploaded={fileName => startVerification('id_card', { idCardFileName: fileName })}
          onVerified={completeVerification}
          onBack={() => setVerificationStep('college')}
        />
      )}

      {isVerified && (
        <div className="space-y-5">
          <div className="rounded-[28px] border border-[#10B981]/25 bg-gradient-to-br from-[#10B981]/[0.12] to-[#06B6D4]/[0.06] p-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#10B981]/15 border border-[#10B981]/35 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#10B981]" strokeWidth={1.8} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">Verified Student ✓</h2>
            <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
              {user?.displayName ?? 'You'} is confirmed at {selectedCollege.shortName}. Your identity stays hidden —
              only the verification flag is public.
            </p>
            <div className="mt-4 flex justify-center">
              <VerifiedBadge size="md" label={`Verified · ${selectedCollege.shortName}`} />
            </div>
          </div>

          <div className="rounded-[24px] border border-white/[0.07] bg-[#0E1528] divide-y divide-white/[0.05]">
            {[
              { icon: Phone, label: 'Phone', value: user?.maskedPhone ?? '+91 98****3456', tone: 'text-[#8B5CF6]' },
              { icon: GraduationCap, label: 'College', value: selectedCollege.name, tone: 'text-[#06B6D4]' },
              {
                icon: Mail,
                label: verification.method === 'id_card' ? 'ID card' : 'College email',
                value: verification.method === 'id_card'
                  ? verification.idCardFileName ?? 'Student ID approved'
                  : verification.collegeEmail ?? `student@${selectedCollege.emailDomain ?? 'college.ac.in'}`,
                tone: 'text-[#10B981]',
              },
            ].map(({ icon: Icon, label, value, tone }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3.5">
                <Icon className={`w-4 h-4 shrink-0 ${tone}`} />
                <span className="text-[11px] uppercase tracking-wider text-slate-500 w-20 shrink-0">{label}</span>
                <span className="flex-1 text-xs text-white truncate text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetVerification}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 px-4 py-3 text-xs font-medium text-slate-300 transition-colors hover:border-white/25"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-verify
            </button>
            <button
              onClick={() => setActiveTab('crushes')}
              className="flex-1 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.28)] transition-transform active:scale-[0.98]"
            >
              Start adding crushes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
