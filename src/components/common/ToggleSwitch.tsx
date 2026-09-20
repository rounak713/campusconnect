import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  accent?: 'violet' | 'cyan' | 'emerald';
}

const ACCENT_ON: Record<NonNullable<ToggleSwitchProps['accent']>, string> = {
  violet: 'bg-[#8B5CF6] shadow-[0_0_16px_rgba(139,92,246,0.45)]',
  cyan: 'bg-[#06B6D4] shadow-[0_0_16px_rgba(6,182,212,0.45)]',
  emerald: 'bg-[#10B981] shadow-[0_0_16px_rgba(16,185,129,0.45)]',
};

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, accent = 'violet' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative w-[52px] h-[30px] rounded-full shrink-0 transition-all duration-300 ease-out border ${
      checked ? `${ACCENT_ON[accent]} border-transparent` : 'bg-white/[0.06] border-white/10'
    }`}
  >
    <span
      className={`absolute top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full bg-white transition-all duration-300 ease-out ${
        checked ? 'left-[26px]' : 'left-[3px]'
      }`}
    />
  </button>
);
