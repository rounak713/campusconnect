import React from 'react';
import { Check } from 'lucide-react';
import type { VerificationStep } from '../../types';

const ORDER: VerificationStep[] = ['phone', 'college', 'method', 'done'];

const LABELS: Record<VerificationStep, string> = {
  phone: 'Phone',
  college: 'College',
  method: 'Verify',
  done: 'Done',
};

export const StepIndicator: React.FC<{ current: VerificationStep }> = ({ current }) => {
  const currentIdx = ORDER.indexOf(current);

  return (
    <div className="flex items-center gap-1.5">
      {ORDER.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-[#10B981] text-[#0A0F1D]'
                    : isActive
                      ? 'bg-[#8B5CF6] text-white shadow-[0_0_16px_rgba(139,92,246,0.5)]'
                      : 'bg-white/[0.05] text-slate-500 border border-white/10'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : idx + 1}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>
                {LABELS[step]}
              </span>
            </div>
            {idx < ORDER.length - 1 && (
              <div className={`flex-1 h-[2px] rounded-full -mt-5 ${idx < currentIdx ? 'bg-[#10B981]' : 'bg-white/[0.07]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
