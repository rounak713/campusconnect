import React, { useRef } from 'react';

interface OtpInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  accent?: 'violet' | 'cyan';
  autoFocus?: boolean;
}

const ACCENT_BORDER = {
  violet: 'border-[#8B5CF6] shadow-[0_0_14px_rgba(139,92,246,0.35)]',
  cyan: 'border-[#06B6D4] shadow-[0_0_14px_rgba(6,182,212,0.35)]',
};

export const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, accent = 'violet', autoFocus }) => {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (idx: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length > 1) {
      const next = [...value];
      digits.slice(0, 6 - idx).split('').forEach((d, i) => { next[idx + i] = d; });
      onChange(next);
      refs.current[Math.min(idx + digits.length, 5)]?.focus();
      return;
    }
    const next = [...value];
    next[idx] = digits;
    onChange(next);
    if (digits && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };

  return (
    <div className="flex justify-between gap-2">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={digit}
          autoFocus={autoFocus && i === 0}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className={`w-full h-14 text-center rounded-2xl bg-[#0E1528] text-xl font-bold text-white font-mono border transition-all duration-200 focus:outline-none ${
            digit ? ACCENT_BORDER[accent] : 'border-white/[0.08] focus:border-white/25'
          }`}
        />
      ))}
    </div>
  );
};
