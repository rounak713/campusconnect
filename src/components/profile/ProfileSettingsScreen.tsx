import React, { useState } from 'react';
import {
  ChevronRight, Eraser, FileLock2, GraduationCap, Heart,
  LogOut, ShieldCheck, Sparkles, User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VerifiedBadge } from '../verification/VerifiedBadge';
import { PassStatusCard } from './PassStatusCard';
import { PrivacyControlCenter } from './PrivacyControlCenter';

export const ProfileSettingsScreen: React.FC = () => {
  const {
    user, selectedCollege, crushes, verification,
    privacy, togglePrivacy, pass, extendPass,
    clearEncryptedCache, logout, setActiveTab,
  } = useApp();

  const [cacheCleared, setCacheCleared] = useState(false);

  const isVerified = verification.status === 'verified';
  const mutualCount = crushes.filter(c => c.status === 'mutual_match').length;

  const handleClearCache = () => {
    clearEncryptedCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2400);
  };

  return (
    <div className="px-5 py-6 pb-28 space-y-5 animate-fade-up">
      {/* ── Identity card ── */}
      <section className="rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#131C33] via-[#0A0F1D] to-[#0E1528] p-5">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-[#8B5CF6]/30 to-[#06B6D4]/20 border border-white/10 flex items-center justify-center text-2xl select-none">
              {user?.avatarEmoji ?? '🌙'}
            </div>
            {isVerified && (
              <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#10B981] border-[3px] border-[#0A0F1D] flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 text-[#04231A]" strokeWidth={3} />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-white truncate">{user?.displayName ?? 'Anonymous Student'}</p>
            <p className="text-[11px] text-slate-500 font-mono">{user?.maskedPhone ?? '+91 98****3456'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {isVerified && <VerifiedBadge label={selectedCollege.shortName} />}
              <span className="inline-flex items-center gap-1 rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-2.5 py-1 text-[11px] font-semibold text-[#C4B5FD]">
                <GraduationCap className="w-3 h-3" />
                {user?.degree ?? 'B.A. (Hons)'} · {user?.year ?? '1st Year'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            { label: 'Crushes', value: crushes.length, icon: Sparkles, tone: 'text-[#8B5CF6]' },
            { label: 'Mutuals', value: mutualCount, icon: Heart, tone: 'text-[#06B6D4]' },
            { label: 'Slots left', value: Math.max(0, (user?.crushSlotsTotal ?? 3) - (user?.crushSlotsUsed ?? 0)), icon: User, tone: 'text-[#10B981]' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-center">
              <Icon className={`w-3.5 h-3.5 mx-auto ${tone}`} />
              <p className="mt-1.5 text-lg font-bold text-white leading-none">{value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Micro-payment status ── */}
      <PassStatusCard pass={pass} onTopUp={extendPass} />

      {/* ── Privacy control center ── */}
      <PrivacyControlCenter privacy={privacy} onToggle={togglePrivacy} />

      {/* ── Verification shortcut ── */}
      <button
        onClick={() => setActiveTab('verify')}
        className="w-full flex items-center gap-3.5 rounded-[24px] border border-white/[0.07] bg-[#0E1528] px-5 py-4 text-left transition-colors hover:border-white/20"
      >
        <div className="w-9 h-9 rounded-xl bg-[#10B981]/12 border border-[#10B981]/25 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Student verification</p>
          <p className="text-[11px] text-slate-400 truncate">
            {isVerified
              ? `${verification.method === 'id_card' ? 'ID card' : 'College email'} · ${verification.verifiedAt ?? 'Verified'}`
              : 'Not verified yet — finish in 3 steps'}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
      </button>

      {/* ── Account actions ── */}
      <section className="rounded-[24px] border border-white/[0.07] bg-[#0E1528] divide-y divide-white/[0.04] overflow-hidden">
        <button
          onClick={() => setActiveTab('privacy')}
          className="w-full flex items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
        >
          <FileLock2 className="w-4 h-4 text-[#06B6D4] shrink-0" />
          <span className="flex-1 text-sm font-medium text-white">Data Privacy FAQ</span>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={handleClearCache}
          className="w-full flex items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
        >
          <Eraser className="w-4 h-4 text-[#8B5CF6] shrink-0" />
          <span className="flex-1 text-sm font-medium text-white">Clear Encrypted Cache</span>
          <span className={`text-[11px] font-semibold ${cacheCleared ? 'text-[#10B981]' : 'text-slate-500'}`}>
            {cacheCleared ? 'Cleared ✓' : 'Local only'}
          </span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-rose-500/[0.06]"
        >
          <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="flex-1 text-sm font-medium text-rose-400">Log out</span>
        </button>
      </section>

      <p className="text-center text-[10px] text-slate-600">
        CampusConnect · double-blind matching · your handles never leave your device in plaintext
      </p>
    </div>
  );
};
