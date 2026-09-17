import React from 'react';
import { CreditCard, Sparkles } from 'lucide-react';
import type { CampusPass } from '../../types';

interface PassStatusCardProps {
  pass: CampusPass;
  onTopUp: () => void;
}

export const PassStatusCard: React.FC<PassStatusCardProps> = ({ pass, onTopUp }) => (
  <div className="rounded-[28px] border border-[#8B5CF6]/25 bg-gradient-to-br from-[#8B5CF6]/[0.16] via-[#0E1528] to-[#06B6D4]/[0.10] p-5">
    <div className="flex items-start gap-3.5">
      <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
        <CreditCard className="w-5 h-5 text-[#C4B5FD]" strokeWidth={1.9} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">₹{pass.amount} Campus Pass</span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              pass.isActive
                ? 'border-[#10B981]/30 bg-[#10B981]/12 text-[#6EE7B7]'
                : 'border-amber-400/30 bg-amber-400/10 text-amber-300'
            }`}
          >
            {pass.isActive ? 'Active' : 'Expired'}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-300">{pass.label}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Valid till {pass.validUntil} · {pass.daysLeft} days left
        </p>
      </div>
    </div>

    <div className="mt-4 h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] transition-all duration-500"
        style={{ width: `${Math.min(100, Math.round((pass.daysLeft / 120) * 100))}%` }}
      />
    </div>

    <button
      onClick={onTopUp}
      className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white/[0.07] border border-white/10 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12]"
    >
      <Sparkles className="w-4 h-4 text-[#06B6D4]" />
      Top Up / Extend
    </button>
  </div>
);
