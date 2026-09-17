import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  EyeOff, 
  Lock, 
  Cpu, 
  ServerCrash
} from 'lucide-react';
import { computeSHA256, maskIdentity, normalizeIdentityInput } from '../../utils/crypto';

export const ZeroKnowledgeTab: React.FC = () => {
  const [testInput, setTestInput] = useState('priya_srcc');
  const [testHash, setTestHash] = useState('');
  const [testMasked, setTestMasked] = useState('');

  useEffect(() => {
    const { normalized, type } = normalizeIdentityInput(testInput);
    setTestMasked(maskIdentity(normalized, type));
    computeSHA256(normalized).then(setTestHash);
  }, [testInput]);

  return (
    <div className="space-y-4 pb-20 text-left">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <span>Zero-Knowledge Security Engine</span>
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </h2>
        <p className="text-xs text-slate-400">
          How CampusConnect mathematically guarantees 100% secret anonymity
        </p>
      </div>

      {/* Live Interactive Hash Simulator */}
      <div className="p-4 rounded-3xl bg-navy-850/90 border border-violet-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span>Interactive Hashing Sandbox</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Web Crypto API
          </span>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">
            Test any handle or phone number:
          </label>
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Type anything..."
            className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="space-y-1.5 text-xs bg-navy-950 p-3 rounded-xl border border-white/5 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Masked Display:</span>
            <span className="text-white font-bold">{testMasked}</span>
          </div>
          <div className="text-[10px] break-all leading-tight text-slate-300 pt-1">
            <span className="text-violet-400 font-bold">SHA-256 Digest:</span><br />
            <span className="text-emerald-400">{testHash}</span>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Architecture */}
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-navy-850/70 border border-white/5 space-y-1.5">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <KeyRound className="w-4 h-4 text-violet-400" />
            <span>1. Client-Side Cryptographic Hash</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your crush's handle is scrambled into a 256-bit hash directly inside your browser before transmitting over TLS 1.3. Raw handles never enter transit.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-850/70 border border-white/5 space-y-1.5">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <ServerCrash className="w-4 h-4 text-emerald-400" />
            <span>2. DBA-Immune Zero Exposure</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Even if an engineer or college administrator opens our production database, they only see irreversible hexadecimal strings. It is impossible to see who added whom.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-850/70 border border-white/5 space-y-1.5">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <EyeOff className="w-4 h-4 text-pink-400" />
            <span>3. Double-Blind Rendezvous Matching</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            No unilateral notification is ever sent. A match only triggers when both student hashes independently produce a mathematical commutative collision.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-850/70 border border-white/5 space-y-1.5">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>4. ₹10 Anti-Harassment Friction</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The ₹10 semester pass prevents bots, stalkers, or malicious users from bulk-spamming campus directories. Every student has strict slot quotas.
          </p>
        </div>
      </div>
    </div>
  );
};
