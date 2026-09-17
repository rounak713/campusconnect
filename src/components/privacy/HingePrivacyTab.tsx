import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, Hash, ChevronDown, ChevronUp } from 'lucide-react';

const steps = [
  {
    icon: Lock,
    title: 'You type a handle',
    body: 'Your crush\'s Instagram handle or phone number is entered on your device. It never leaves in plaintext.',
    color: 'text-[#6F38E8]',
    bg:    'bg-[#6F38E8]/10',
  },
  {
    icon: Hash,
    title: 'SHA-256 hashed client-side',
    body: 'Your browser computes a 256-bit mathematical fingerprint. The original handle is discarded immediately.',
    color: 'text-amber-400',
    bg:    'bg-amber-400/10',
  },
  {
    icon: ShieldCheck,
    title: 'Only the hash is stored',
    body: 'Our servers store only this irreversible fingerprint — even we cannot reverse it back to an identity.',
    color: 'text-emerald-400',
    bg:    'bg-emerald-400/10',
  },
  {
    icon: Eye,
    title: 'Mutual match triggers reveal',
    body: 'If your crush independently hashes your handle and it collides with yours — a double-blind match fires.',
    color: 'text-[#E86090]',
    bg:    'bg-[#E86090]/10',
  },
];

export const HingePrivacyTab: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="px-6 py-6 pb-28 space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">How It Works</p>
        <h2 className="editorial-heading text-4xl">
          Zero-Knowledge<br />
          <span className="italic text-[#6F38E8]">Privacy</span>
        </h2>
        <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
          We designed this so even we cannot snoop on your crush.
        </p>
      </div>

      {/* Accordion steps */}
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isOpen = openIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full text-left p-5 rounded-[24px] bg-noir-850 border border-white/[0.06] hover:border-white/10 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${step.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${step.color}`} strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">{step.title}</span>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
                  </div>
                  {isOpen && (
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed animate-fade-up">{step.body}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hash demo */}
      <div className="p-5 rounded-[24px] bg-noir-850 border border-white/[0.06] space-y-3">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Example Hash</p>
        <p className="text-sm text-zinc-300">
          <span className="text-zinc-500">Input: </span>
          <span className="font-mono text-white">@anjali_srcc</span>
        </p>
        <div className="p-3 rounded-xl bg-noir-800 border border-white/[0.04] font-mono text-[11px] text-zinc-500 break-all leading-relaxed">
          <span className="text-[#6F38E8]">sha256: </span>
          <span className="text-zinc-300">9f86d081884c7d65</span>
          <span className="text-zinc-600">9a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08</span>
        </div>
        <p className="text-[11px] text-zinc-600 leading-relaxed">
          This 64-character hex string is the only thing that ever touches our servers. Mathematically irreversible.
        </p>
      </div>

      {/* Threat model summary */}
      <div className="p-5 rounded-[24px] bg-noir-850 border border-white/[0.06] space-y-3">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">What We Protect Against</p>
        {[
          ['Database breach', 'Only hashes stored — no plaintext identities'],
          ['Admin snooping',  'Even our engineers cannot read your crushes'],
          ['Stalking',        'Zero alerts sent until mutual consent'],
          ['Brute force',     'Salted KMS pepper + rate-limited endpoints'],
        ].map(([threat, protection]) => (
          <div key={threat} className="flex items-start gap-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-white">{threat}</span>
              <span className="text-xs text-zinc-500"> — {protection}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
