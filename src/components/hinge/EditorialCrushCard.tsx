import React, { useState } from 'react';
import { 
  Sparkles, 
  Trash2, 
  ChevronRight, 
  Phone, 
  Lock, 
  ShieldCheck, 
  KeyRound,
  Heart
} from 'lucide-react';
import type { CrushEntry } from '../../types';
import { useApp } from '../../context/AppContext';
import { InstagramIcon } from '../common/Icons';

export const EditorialCrushCard: React.FC<{ crush: CrushEntry }> = ({ crush }) => {
  const { removeCrush, setActiveMatchModal } = useApp();
  const [showHash, setShowHash] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isMutual = crush.status === 'mutual_match';

  return (
    <div className={`w-full rounded-3xl p-6 text-left transition-all border ${
      isMutual 
        ? 'bg-gradient-to-b from-noir-850 to-noir-900 border-hinge-purple/40 shadow-xl' 
        : 'bg-noir-850 border-white/8'
    }`}>
      {/* Top Meta Line */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center space-x-2 text-xs text-subtle font-mono">
          {crush.type === 'instagram' ? (
            <InstagramIcon className="w-3.5 h-3.5 text-hinge-purple" />
          ) : (
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{crush.type.toUpperCase()} VAULT</span>
        </div>

        <div>
          {isMutual ? (
            <span className="inline-flex items-center space-x-1 text-[11px] font-medium px-3 py-0.5 rounded-full bg-hinge-purple text-white">
              <Sparkles className="w-3 h-3" />
              <span>It's Mutual 🎉</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-[11px] text-subtle px-2.5 py-0.5 rounded-full bg-noir-800 border border-white/5">
              <Lock className="w-3 h-3" />
              <span>Encrypted</span>
            </span>
          )}
        </div>
      </div>

      {/* Large Hinge-style Prompt & Identity */}
      <div className="py-5 space-y-2">
        <p className="text-xs uppercase tracking-wider text-subtle font-semibold">
          {isMutual ? "Mutual Match Confirmed" : "Secret Identity Stored"}
        </p>

        <h3 className="font-serif text-3xl sm:text-4xl text-bone font-normal tracking-tight">
          {crush.maskedHandle}
        </h3>

        <p className="text-xs text-subtle leading-relaxed pt-1">
          {isMutual 
            ? "Both of you independently added each other's handle this semester." 
            : "Awaiting reciprocal entry. Zero alerts will ever be sent to them."}
        </p>
      </div>

      {/* Cryptographic SHA-256 fingerprint toggle */}
      <div className="pt-3 border-t border-white/5">
        <button
          onClick={() => setShowHash(!showHash)}
          className="text-[11px] text-subtle hover:text-white flex items-center space-x-1.5 transition-colors font-mono"
        >
          <KeyRound className="w-3 h-3" />
          <span>{showHash ? 'Hide 256-bit hash' : 'View cryptographic fingerprint'}</span>
        </button>

        {showHash && (
          <div className="mt-2 p-3 bg-noir-950 rounded-xl border border-white/5 font-mono text-[10px] text-zinc-400 break-all leading-tight">
            <span className="text-hinge-purple font-semibold">sha256: </span>
            {crush.sha256Hash}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
        {isMutual ? (
          <button
            onClick={() => setActiveMatchModal(crush)}
            className="w-full py-3.5 px-5 rounded-full bg-hinge-purple hover:bg-hinge-hover text-white font-medium text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-hinge-purple/20"
          >
            <span>Open Private Chat & Consent Reveal</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-full flex items-center justify-between text-xs">
            <span className="text-[11px] text-subtle">
              Added {crush.createdAt}
            </span>

            {showConfirmDelete ? (
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-rose-400">Wipe?</span>
                <button
                  onClick={() => removeCrush(crush.id)}
                  className="px-2.5 py-1 bg-rose-600 text-white font-semibold text-[10px] rounded-full"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2.5 py-1 bg-noir-800 text-zinc-300 text-[10px] rounded-full"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDelete(true)}
                title="Wipe record"
                className="text-subtle hover:text-rose-400 p-1.5 rounded-lg transition-colors"
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
