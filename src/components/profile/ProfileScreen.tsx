import React, { useState } from 'react';
import {
  GraduationCap, ShieldCheck, Lock, Key, ChevronRight,
  LogOut, Edit2, ChevronDown, ChevronUp, Hash, Eye, Zap,
  CreditCard, CheckCircle, AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProfileScreen: React.FC = () => {
  const {
    user, selectedCollege, crushes,
    setIsSetupModalOpen, setIsPaymentModalOpen, logout
  } = useApp();

  const [showPrivacy, setShowPrivacy]   = useState(false);
  const [showLogout, setShowLogout]     = useState(false);

  const mutual  = crushes.filter(c => c.status === 'mutual_match').length;
  const waiting = crushes.filter(c => c.status === 'waiting').length;
  const slotsLeft = (user?.crushSlotsTotal ?? 3) - (user?.crushSlotsUsed ?? 0);

  // Generate initials avatar from masked phone
  const initials = user?.maskedPhone
    ? user.maskedPhone.replace(/\D/g, '').slice(-4, -2)
    : 'CC';

  return (
    <div className="px-5 py-6 pb-28 space-y-4 animate-fade-up">

      {/* ── Avatar + Identity card ── */}
      <div className="hinge-card p-5 space-y-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-[#6F38E8]/20 border-2 border-[#6F38E8]/40 flex items-center justify-center select-none">
              <span className="text-xl font-bold text-[#6F38E8] font-mono tracking-widest">
                {initials}
              </span>
            </div>
            {user?.isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-400 border-2 border-noir-850 flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-semibold text-bone truncate">
                {user?.maskedPhone ?? '+91 98****3456'}
              </span>
              {user?.isVerified && (
                <span className="hinge-badge hinge-badge-green shrink-0">
                  <CheckCircle className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-subtle">
              <GraduationCap className="w-3.5 h-3.5 text-[#6F38E8]" />
              <span>{selectedCollege.name}</span>
            </div>
            <p className="text-[10px] text-subtle/60 mt-0.5 font-mono">
              ID: {user?.id ?? 'usr-demo'}
            </p>
          </div>

          {/* Edit college */}
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="p-2 rounded-xl bg-noir-800 border border-white/[0.06] text-subtle hover:text-bone transition-colors shrink-0"
            title="Change college"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="hinge-divider" />

        {/* College detail row */}
        <button
          onClick={() => setIsSetupModalOpen(true)}
          className="w-full flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#6F38E8]/10 border border-[#6F38E8]/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-[#6F38E8]" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-bone truncate">{selectedCollege.shortName}</p>
            <p className="text-xs text-subtle">{selectedCollege.city} · {selectedCollege.campusTag}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-subtle group-hover:text-bone transition-colors shrink-0" />
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Crushes',  value: crushes.length, color: 'text-[#6F38E8]',  bg: 'bg-[#6F38E8]/10',  border: 'border-[#6F38E8]/15' },
          { label: 'Matches',  value: mutual,          color: 'text-[#E86090]',  bg: 'bg-[#E86090]/10',  border: 'border-[#E86090]/15' },
          { label: 'Waiting',  value: waiting,         color: 'text-amber-400',  bg: 'bg-amber-400/10',   border: 'border-amber-400/15' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-3.5 text-center`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-subtle mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Crush slots card ── */}
      <div className="hinge-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="w-4 h-4 text-[#6F38E8]" />
            <span className="text-sm font-semibold text-bone">Crush Slots</span>
          </div>
          <span className="text-xs font-mono text-subtle">
            {user?.crushSlotsUsed ?? 0} / {user?.crushSlotsTotal ?? 3} used
          </span>
        </div>

        {/* Slot dots */}
        <div className="flex gap-2">
          {Array.from({ length: user?.crushSlotsTotal ?? 3 }).map((_, i) => {
            const filled = i < (user?.crushSlotsUsed ?? 0);
            return (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all ${
                  filled ? 'bg-[#6F38E8]' : 'bg-noir-700 border border-white/[0.06]'
                }`}
              />
            );
          })}
          {/* Locked extra slots hint */}
          {Array.from({ length: Math.max(0, 5 - (user?.crushSlotsTotal ?? 3)) }).map((_, i) => (
            <div key={`locked-${i}`} className="flex-1 h-2 rounded-full bg-noir-950/60 border border-white/[0.03]" />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-subtle">
            {slotsLeft > 0
              ? <span className="text-emerald-400">{slotsLeft} slot{slotsLeft > 1 ? 's' : ''} available</span>
              : <span className="text-amber-400">All slots filled</span>
            }
          </p>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6F38E8] bg-[#6F38E8]/10 border border-[#6F38E8]/20 px-2.5 py-1 rounded-full hover:bg-[#6F38E8]/20 transition-colors"
          >
            <CreditCard className="w-3 h-3" />
            Unlock +1 for ₹10
          </button>
        </div>
      </div>

      {/* ── Privacy accordion ── */}
      <div className="hinge-card overflow-hidden">
        <button
          onClick={() => setShowPrivacy(p => !p)}
          className="w-full flex items-center gap-3 p-5"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-bone">Privacy & Encryption</p>
            <p className="text-xs text-subtle">Zero-knowledge double-blind</p>
          </div>
          {showPrivacy
            ? <ChevronUp className="w-4 h-4 text-subtle shrink-0" />
            : <ChevronDown className="w-4 h-4 text-subtle shrink-0" />
          }
        </button>

        {showPrivacy && (
          <div className="px-5 pb-5 space-y-3 animate-fade-up border-t border-white/[0.04]">
            <div className="pt-4 space-y-3">
              {[
                { icon: Hash,        color: 'text-[#6F38E8]', title: 'Client-side SHA-256',      body: 'Your crush\'s handle is hashed before it leaves your device. We never see plaintext.' },
                { icon: Lock,        color: 'text-amber-400',  title: 'Zero server plaintext',    body: 'Only 64-character hex digests are stored — even our engineers can\'t reverse them.' },
                { icon: Eye,         color: 'text-[#E86090]',  title: 'Mutual consent reveal',    body: 'Identities are revealed only when both parties explicitly agree.' },
                { icon: Zap,         color: 'text-emerald-400',title: 'Double-blind matching',    body: 'A collision fires only when both of you independently enter each other\'s handle.' },
              ].map(({ icon: Icon, color, title, body }) => (
                <div key={title} className="flex items-start gap-3">
                  <Icon className={`w-3.5 h-3.5 ${color} mt-0.5 shrink-0`} strokeWidth={1.75} />
                  <div>
                    <p className="text-xs font-semibold text-bone">{title}</p>
                    <p className="text-[11px] text-subtle leading-relaxed mt-0.5">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Danger zone: logout ── */}
      <div className="hinge-card p-5">
        {!showLogout ? (
          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-rose-400">Sign Out</p>
              <p className="text-xs text-subtle">Clears local session only</p>
            </div>
            <ChevronRight className="w-4 h-4 text-subtle group-hover:text-rose-400 transition-colors shrink-0" />
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-subtle leading-relaxed">
                Your encrypted vault data is stored server-side. Signing out only clears this device session — your crushes are safe.
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowLogout(false)}
                className="hinge-btn-ghost flex-1 text-sm py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={() => { logout(); setShowLogout(false); }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-full transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── App version footer ── */}
      <div className="text-center pt-2 pb-2">
        <p className="text-[11px] text-subtle/50">CampusConnect · ZK-v2.0 · Built for Indian Students 🇮🇳</p>
        <p className="text-[10px] text-subtle/30 mt-1">All data is encrypted. No identity is ever shared without consent.</p>
      </div>

    </div>
  );
};
