import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md';
  label?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 'sm', label = 'Verified Student' }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 font-semibold text-[#6EE7B7] ${
      size === 'md' ? 'px-3.5 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]'
    }`}
  >
    <CheckCircle2 className={size === 'md' ? 'w-4 h-4' : 'w-3 h-3'} strokeWidth={2.5} />
    {label}
  </span>
);
