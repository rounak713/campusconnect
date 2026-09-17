import React from 'react';
import { Sparkles, HeartHandshake, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MatchesList: React.FC = () => {
  const { crushes, setActiveMatchModal, setActiveTab } = useApp();
  const mutualMatches = crushes.filter(c => c.status === 'mutual_match');

  return (
    <div className="space-y-4 pb-20 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>Mutual Matches</span>
            <Sparkles className="w-4 h-4 text-pink-400" />
          </h2>
          <p className="text-xs text-slate-400">
            Encrypted cryptographic collisions verified by double-blind protocol
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 text-xs font-bold font-mono">
          {mutualMatches.length} Active
        </span>
      </div>

      {mutualMatches.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-3xl bg-navy-850/50 border border-white/5 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-pink-500/20 border border-violet-500/30 flex items-center justify-center mx-auto text-pink-400">
            <HeartHandshake className="w-8 h-8 opacity-70" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Mutual Matches Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              When someone you have added also adds your Instagram handle or phone number, a double-blind match triggers instantly here!
            </p>
          </div>
          <button
            onClick={() => setActiveTab('add')}
            className="py-2.5 px-5 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30"
          >
            Add Another Secret Crush
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {mutualMatches.map((crush) => {
            const data = crush.mutualMatchData;
            return (
              <div
                key={crush.id}
                onClick={() => setActiveMatchModal(crush)}
                className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 via-navy-850 to-pink-950/40 border border-violet-500/40 hover:border-pink-500/60 transition-all cursor-pointer shadow-lg shadow-black/20 group relative overflow-hidden"
              >
                <div className="flex items-center space-x-3.5">
                  {/* Blurred Avatar preview */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-violet-500/50 shadow-md bg-navy-900">
                      <img
                        src={data?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"}
                        alt="Match"
                        className="w-full h-full object-cover"
                        style={{ filter: data?.isRevealed ? 'none' : 'blur(10px)' }}
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-navy-900 flex items-center justify-center text-white">
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-white">
                        {data?.isRevealed ? data.revealedName : data?.alias}
                      </h4>
                      <span className="text-[10px] bg-pink-500/20 text-pink-300 font-bold px-1.5 py-0.2 rounded border border-pink-500/30">
                        Mutual 🎉
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {crush.maskedHandle} • {data?.college}
                    </p>

                    <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-emerald-400 font-medium">
                      <Lock className="w-3 h-3" />
                      <span>E2E Encrypted Chat Ready</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-violet-600 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Security note */}
      <div className="p-3 bg-navy-850/60 rounded-2xl border border-white/5 flex items-center space-x-2.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Identities stay veiled until both partners explicitly tap Reveal Consent.</span>
      </div>
    </div>
  );
};
