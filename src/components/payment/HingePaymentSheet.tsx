import React, { useState } from 'react';
import { X, CreditCard, Check, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const UPI_METHODS = [
  { id: 'gpay',     label: 'Google Pay',  emoji: '🟢', color: 'bg-green-500/10  border-green-500/20  text-green-400' },
  { id: 'phonepe',  label: 'PhonePe',     emoji: '🟣', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  { id: 'paytm',    label: 'Paytm',       emoji: '🔵', color: 'bg-blue-500/10   border-blue-500/20   text-blue-400' },
  { id: 'upi',      label: 'Any UPI App', emoji: '🏦', color: 'bg-amber-500/10  border-amber-500/20  text-amber-400' },
];

export const HingePaymentSheet: React.FC = () => {
  const { isPaymentModalOpen, setIsPaymentModalOpen, completePayment } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [isPaying, setIsPaying]   = useState(false);
  const [done, setDone]           = useState(false);

  const pay = () => {
    if (!selected) return;
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setSelected(null);
        completePayment();
      }, 1200);
    }, 1400);
  };

  if (!isPaymentModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-up">
      <div
        className="w-full max-w-md bg-noir-850 rounded-t-[32px] sm:rounded-[32px] border border-white/[0.07] shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#6F38E8] flex items-center justify-center shadow-glow-sm-violet">
              <CreditCard className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Unlock Crush Slot</p>
              <p className="text-[11px] text-zinc-500">One-time semester pass</p>
            </div>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="w-8 h-8 rounded-full bg-noir-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Amount display */}
          <div className="text-center py-4">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Amount</p>
            <p className="editorial-heading text-6xl">₹10</p>
            <p className="text-xs text-zinc-500 mt-2">+1 encrypted crush slot · Valid this semester</p>
          </div>

          {/* Feature bullets */}
          <div className="p-4 rounded-2xl bg-noir-800 border border-white/[0.05] space-y-2">
            {[
              'One additional secret crush slot',
              'Double-blind SHA-256 encryption',
              'Auto-expires end of semester',
            ].map(feat => (
              <div key={feat} className="flex items-center gap-2.5 text-xs text-zinc-400">
                <div className="w-4 h-4 rounded-full bg-[#6F38E8]/15 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-[#6F38E8]" strokeWidth={2.5} />
                </div>
                {feat}
              </div>
            ))}
          </div>

          {/* UPI method grid */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 mb-3">Pay via UPI</p>
            <div className="grid grid-cols-2 gap-2">
              {UPI_METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`flex items-center gap-2.5 p-3.5 rounded-2xl border transition-all duration-150 text-left ${
                    selected === m.id
                      ? 'border-[#6F38E8] bg-[#6F38E8]/10 ring-1 ring-[#6F38E8]/30'
                      : `${m.color} hover:opacity-80`
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-xs font-semibold text-white">{m.label}</span>
                  {selected === m.id && <Check className="w-3.5 h-3.5 text-[#6F38E8] ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Pay button */}
          <button
            onClick={pay}
            disabled={!selected || isPaying}
            className={`hinge-btn w-full text-base transition-all ${done ? '!bg-emerald-500' : ''}`}
          >
            {done ? (
              <><Check className="w-5 h-5 mr-2" />Slot Unlocked!</>
            ) : isPaying ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />Processing…</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" />Pay ₹10 via {UPI_METHODS.find(m => m.id === selected)?.label || 'UPI'}</>
            )}
          </button>

          <p className="text-center text-[11px] text-zinc-600">
            Powered by Razorpay · Webhook-verified slot unlock
          </p>
        </div>
      </div>
    </div>
  );
};
