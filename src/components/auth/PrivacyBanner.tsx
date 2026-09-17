import React, { useState } from 'react';
import { Shield, Lock, EyeOff, KeyRound, ChevronRight, CheckCircle2, X } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Compact Privacy Banner */}
      <div 
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-violet-950/40 via-navy-800/60 to-emerald-950/40 border border-violet-500/20 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:border-violet-500/40 transition-all duration-300 group shadow-lg shadow-black/20"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-violet-400" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white tracking-wide uppercase">Zero-Knowledge Guarantee</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Double-blind encrypted. Nobody knows unless it's mutual.
            </p>
          </div>
        </div>
        <div className="flex items-center text-violet-400 text-xs font-semibold pl-2 group-hover:translate-x-0.5 transition-transform">
          <span className="hidden sm:inline mr-1 text-[11px]">How it works</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Explainer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-navy-900 border border-violet-500/30 rounded-t-3xl sm:rounded-3xl p-6 text-left shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-emerald-500 p-0.5 flex items-center justify-center">
                  <div className="w-full h-full bg-navy-900 rounded-[14px] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Zero-Knowledge Privacy</h3>
                  <p className="text-xs text-slate-400">100% Mathematically Anonymous</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simple Steps */}
            <div className="space-y-4 py-5">
              <div className="flex items-start space-x-3.5 bg-navy-850/80 p-3.5 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">1. Client-Side SHA-256 Hashing</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    When you type an Instagram handle or phone number, your phone instantly calculates a 256-bit cryptographic fingerprint. We never receive the raw handle.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 bg-navy-850/80 p-3.5 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">2. Double-Blind Storage</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Even college admins or database engineers cannot read who you added. All records are stored as scrambled mathematical hashes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 bg-navy-850/80 p-3.5 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">3. Zero Notification to Crush</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Your crush is never notified that you entered them. A match happens <span className="text-pink-400 font-medium">only if they also independently enter your handle</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Guarantees Checklist */}
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-3.5 mb-5 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No public profiles or public browsing</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant client-side wipe on unmatch</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>End-to-End encrypted ephemeral chat</span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-violet-600/30"
            >
              I Understand, Keep It Discreet
            </button>
          </div>
        </div>
      )}
    </>
  );
};
