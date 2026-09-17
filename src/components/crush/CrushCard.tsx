import React, { useState } from 'react';
import { 
  Lock, 
  Sparkles, 
  Trash2, 
  ChevronRight, 
  Phone, 
  Clock, 
  ShieldCheck, 
  HeartHandshake,
  KeyRound
} from 'lucide-react';
import type { CrushEntry } from '../../types';
import { useApp } from '../../context/AppContext';
import { InstagramIcon } from '../common/Icons';

interface CrushCardProps {
  crush: CrushEntry;
}

export const CrushCard: React.FC<CrushCardProps> = ({ crush }) => {
  const { removeCrush, setActiveMatchModal } = useApp();
  const [showHash, setShowHash] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isMutual = crush.status === 'mutual_match';

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-4 ${
      isMutual 
        ? 'bg-gradient-to-br from-violet-950/70 via-navy-850 to-pink-950/40 border-violet-500/50 shadow-lg shadow-violet-900/25 ring-1 ring-violet-500/30' 
        : 'bg-navy-850/80 border-white/10 hover:border-white/20 shadow-md'
    }`}>
      {/* Background glow for mutual match */}
      {isMutual && (
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between">
        {/* Left identity details */}
        <div className="flex items-center space-x-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
            isMutual 
              ? 'bg-gradient-to-tr from-violet-600 to-pink-500 border-pink-400 text-white shadow-glow-rose' 
              : 'bg-navy-850 border-white/10 text-slate-400'
          }`}>
            {isMutual ? (
              <HeartHandshake className="w-6 h-6 animate-pulse" />
            ) : crush.type === 'instagram' ? (
              <InstagramIcon className="w-5 h-5 text-violet-400" />
            ) : (
              <Phone className="w-5 h-5 text-emerald-400" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-extrabold text-white font-mono tracking-wide">
                {crush.maskedHandle}
              </span>
              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full uppercase font-mono">
                {crush.type}
              </span>
            </div>

            <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{crush.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isMutual ? (
            <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>Mutual Match! 🎉</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.8 rounded-full bg-violet-950/60 text-violet-300 border border-violet-500/30">
              <Lock className="w-3 h-3 text-violet-400" />
              <span>Encrypted & Waiting</span>
            </span>
          )}
        </div>
      </div>

      {/* Cryptographic SHA-256 fingerprint preview (collapsible) */}
      <div className="mt-3 pt-2.5 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px]">
          <button
            onClick={() => setShowHash(!showHash)}
            className="text-slate-400 hover:text-violet-400 flex items-center space-x-1 font-mono transition-colors"
          >
            <KeyRound className="w-3 h-3 text-slate-500" />
            <span>{showHash ? 'Hide SHA-256 fingerprint' : 'View cryptographic hash'}</span>
          </button>
          <span className="text-emerald-400 font-medium flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Zero-Knowledge Stored</span>
          </span>
        </div>

        {showHash && (
          <div className="mt-2 p-2 bg-navy-950 rounded-xl border border-white/5 font-mono text-[9px] text-slate-300 break-all leading-tight">
            <span className="text-violet-400 font-bold">SHA-256: </span>
            {crush.sha256Hash}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-3.5 flex items-center justify-between">
        {isMutual ? (
          <button
            onClick={() => setActiveMatchModal(crush)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-violet-600/30 group"
          >
            <span>Unlock Match & Private Chat</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <div className="w-full flex items-center justify-between">
            <span className="text-[11px] text-slate-400 italic">
              Waiting for them to add you back...
            </span>

            {showConfirmDelete ? (
              <div className="flex items-center space-x-2 animate-in fade-in">
                <span className="text-[10px] text-rose-400">Wipe record?</span>
                <button
                  onClick={() => removeCrush(crush.id)}
                  className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-500"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2 py-1 bg-white/10 text-slate-300 text-[10px] rounded-lg"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDelete(true)}
                title="Revoke and wipe cryptographic hash"
                className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
