import React from 'react';
import { Heart, Sparkles, ChevronRight, Lock, ShieldCheck, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HingeMatchesList: React.FC = () => {
  const { crushes, setActiveMatchModal, setActiveTab } = useApp();
  const matches = crushes.filter(c => c.status === 'mutual_match');

  return (
    <div className="px-6 py-6 pb-28 space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">Secure Connections</p>
        <h2 className="editorial-heading text-4xl">
          Your{' '}
          <span className="italic font-normal text-[#E86090]">Matches</span>
        </h2>
        <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
          Double-blind cryptographic collisions, verified mutually.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="mt-6 py-16 px-6 rounded-[28px] bg-noir-850 border border-white/[0.05] flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#E86090]/10 border border-[#E86090]/20 flex items-center justify-center">
            <Heart className="w-7 h-7 text-[#E86090]/60" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="editorial-heading text-2xl mb-2">No Matches Yet</h3>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              A match sparks only when you and someone else independently enter each other's handle.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('add')}
            className="hinge-btn text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add a Secret Crush
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((crush) => {
            const data = crush.mutualMatchData;
            return (
              <button
                key={crush.id}
                onClick={() => setActiveMatchModal(crush)}
                className="w-full text-left p-5 rounded-[24px] bg-noir-850 border border-white/[0.06] hover:border-[#6F38E8]/30 transition-all duration-200 group animate-card-enter"
              >
                <div className="flex items-center gap-4">
                  {/* Blurred avatar */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/[0.08]">
                      <img
                        src={data?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                        alt="match"
                        className="w-full h-full object-cover transition-all duration-300"
                        style={{ filter: data?.isRevealed ? 'none' : 'blur(12px) brightness(0.8)' }}
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#6F38E8] flex items-center justify-center border-2 border-noir-900">
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-semibold text-white truncate">
                        {data?.isRevealed ? data.revealedName : data?.alias}
                      </span>
                      <span className="hinge-badge hinge-badge-pink shrink-0">Mutual 🎉</span>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mb-2 truncate">
                      {crush.maskedHandle} · {data?.college}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/80">
                      <Lock className="w-3 h-3" />
                      <span>E2E encrypted chat ready</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#6F38E8] transition-colors shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Privacy footer */}
      <div className="p-4 rounded-2xl bg-noir-850 border border-white/[0.04] flex items-center gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Identities stay veiled until both parties explicitly consent to reveal.
        </p>
      </div>
    </div>
  );
};
