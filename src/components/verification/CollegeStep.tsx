import React, { useState } from 'react';
import { ArrowRight, GraduationCap } from 'lucide-react';
import type { College } from '../../types';
import { CollegeSelector } from '../auth/CollegeSelector';

interface CollegeStepProps {
  initialCollege: College;
  onBack: () => void;
  onConfirm: (college: College) => void;
}

export const CollegeStep: React.FC<CollegeStepProps> = ({ initialCollege, onBack, onConfirm }) => {
  const [college, setCollege] = useState<College>(initialCollege);

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Pick your campus</h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Crushes only collide inside your own college network.
        </p>
      </div>

      <CollegeSelector selectedCollege={college} onSelect={setCollege} />

      <div className="rounded-2xl border border-[#06B6D4]/20 bg-[#06B6D4]/[0.07] p-4 flex items-start gap-3">
        <GraduationCap className="w-4 h-4 text-[#06B6D4] mt-0.5 shrink-0" />
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Accepted student domain for {college.shortName}:{' '}
          <span className="font-mono text-[#67E8F9]">@{college.emailDomain ?? 'your-college.ac.in'}</span>
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="rounded-2xl border border-white/10 px-5 py-3.5 text-sm font-medium text-slate-300 transition-colors hover:border-white/25"
        >
          Back
        </button>
        <button
          onClick={() => onConfirm(college)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.28)] transition-transform active:scale-[0.98]"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
