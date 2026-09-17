import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X, Sparkles, ShieldCheck, Send, Trash2, Eye, EyeOff,
  Lock, AlertTriangle, GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { CrushEntry } from '../../types';

interface Props { crush: CrushEntry; onClose: () => void; }

export const MutualMatchModal: React.FC<Props> = ({ crush, onClose }) => {
  const { chatMessages, sendChatMessage, revealMatch, clearChatAndUnmatch } = useApp();

  const [blurAmount, setBlurAmount] = useState(crush.mutualMatchData?.blurAmount ?? 16);
  const [inputText, setInputText]   = useState('');
  const [showConsent, setShowConsent]   = useState(false);
  const [showUnmatch, setShowUnmatch]   = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  const endRef  = useRef<HTMLDivElement>(null);
  const matchId = crush.mutualMatchData?.matchId || 'match-default';
  const messages = chatMessages[matchId] || [];
  const isRevealed = crush.mutualMatchData?.isRevealed || false;

  useEffect(() => {
    if (celebrated) return;
    setCelebrated(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#6F38E8', '#E86090', '#34D399', '#F59E0B'] });
  }, [celebrated]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(matchId, inputText);
    setInputText('');
  };

  const handleReveal = () => {
    revealMatch(crush.id);
    setBlurAmount(0);
    setShowConsent(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 }, colors: ['#34D399', '#6F38E8', '#E86090'] });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center bg-black/80 backdrop-blur-md animate-fade-up">
      <div
        className="w-full max-w-lg h-full sm:h-[92dvh] bg-noir-850 sm:rounded-[32px] flex flex-col overflow-hidden border border-white/[0.07] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top bar ── */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Blurred avatar */}
            <button
              onClick={() => isRevealed ? setBlurAmount(p => p === 0 ? 16 : 0) : setShowConsent(true)}
              className="relative shrink-0"
            >
              <div className="w-11 h-11 rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={crush.mutualMatchData?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt="match"
                  className="w-full h-full object-cover transition-all duration-500"
                  style={{ filter: `blur(${blurAmount}px) brightness(${blurAmount > 0 ? 0.7 : 1})` }}
                />
                {blurAmount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <EyeOff className="w-3.5 h-3.5 text-white/80" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-noir-850" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {isRevealed ? crush.mutualMatchData?.revealedName : crush.mutualMatchData?.alias}
                </span>
                <span className="hinge-badge hinge-badge-purple text-[10px]">
                  <Sparkles className="w-2.5 h-2.5" /> Mutual
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500">
                <span className="font-mono">{crush.maskedHandle}</span>
                <span>·</span>
                <GraduationCap className="w-3 h-3" />
                <span>{crush.mutualMatchData?.college}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isRevealed && (
              <button
                onClick={() => setShowConsent(true)}
                className="text-[11px] font-semibold text-[#6F38E8] bg-[#6F38E8]/10 border border-[#6F38E8]/20 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-[#6F38E8]/20 transition-colors"
              >
                <Eye className="w-3 h-3" /> Reveal
              </button>
            )}
            <button onClick={() => setShowUnmatch(true)} className="p-2 text-zinc-500 hover:text-rose-400 rounded-xl transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-xl transition-colors">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Match timestamp ribbon */}
        <div className="bg-[#6F38E8]/8 border-b border-[#6F38E8]/15 px-5 py-2 flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-[#6F38E8]" />
          <span className="text-[11px] text-zinc-400">{crush.mutualMatchData?.matchTimestamp || 'Just matched!'}</span>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-400/80">
            <Lock className="w-3 h-3" />
            <span>E2E Encrypted</span>
          </div>
        </div>

        {/* ── Chat messages ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Ephemeral notice */}
          <div className="text-center py-2">
            <span className="text-[10px] text-zinc-600 bg-noir-800 px-3 py-1 rounded-full border border-white/[0.04]">
              Chat auto-purges in 24h · Zero persistence
            </span>
          </div>

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.isSelf
                  ? 'bg-[#6F38E8] text-white rounded-br-sm'
                  : 'bg-noir-800 border border-white/[0.06] text-zinc-200 rounded-bl-sm'
              }`}>
                {msg.text}
                <div className={`flex items-center gap-1 mt-1 text-[10px] ${msg.isSelf ? 'text-white/50 justify-end' : 'text-zinc-600'}`}>
                  <Lock className="w-2.5 h-2.5" />
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* ── Message input ── */}
        <form onSubmit={send} className="px-4 py-3 border-t border-white/[0.06] flex items-center gap-3 shrink-0 safe-bottom">
          <div className="flex-1 flex items-center gap-2 bg-noir-800 border border-white/[0.07] rounded-full px-4 py-2.5 focus-within:border-[#6F38E8]/40 transition-colors">
            <Lock className="w-3 h-3 text-zinc-600 shrink-0" />
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type a private message…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-[#6F38E8] disabled:opacity-30 flex items-center justify-center text-white transition-all hover:bg-[#5E27D8] shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ── Consent modal ── */}
      {showConsent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-noir-850 rounded-[28px] border border-white/[0.07] p-6 space-y-5 animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-[#6F38E8]/15 border border-[#6F38E8]/25 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7 text-[#6F38E8]" strokeWidth={1.75} />
            </div>
            <div className="text-center">
              <h3 className="editorial-heading text-2xl mb-2">Mutual Reveal</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Both identities are revealed simultaneously. This action is permanent — neither of you can re-blur after consent.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConsent(false)} className="hinge-btn-ghost flex-1 text-sm py-3">Cancel</button>
              <button onClick={handleReveal} className="hinge-btn flex-1 text-sm py-3">Yes, Reveal</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Unmatch modal ── */}
      {showUnmatch && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-noir-850 rounded-[28px] border border-white/[0.07] p-6 space-y-5 animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-rose-400" strokeWidth={1.75} />
            </div>
            <div className="text-center">
              <h3 className="editorial-heading text-2xl mb-2">Clear & Unmatch</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                All messages will be permanently deleted and this match removed from your vault. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowUnmatch(false)} className="hinge-btn-ghost flex-1 text-sm py-3">Cancel</button>
              <button
                onClick={() => { clearChatAndUnmatch(crush.id); onClose(); }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-full transition-colors"
              >
                Unmatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
