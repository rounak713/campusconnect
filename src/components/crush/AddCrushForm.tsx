import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Lock, 
  ShieldCheck, 
  Cpu, 
  Plus, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { computeSHA256, normalizeIdentityInput, maskIdentity } from '../../utils/crypto';
import { InstagramIcon } from '../common/Icons';

export const AddCrushForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { user, addCrush, setIsPaymentModalOpen } = useApp();
  const [inputVal, setInputVal] = useState('');
  const [activeHash, setActiveHash] = useState('');
  const [maskedPreview, setMaskedPreview] = useState('');
  const [detectedType, setDetectedType] = useState<'instagram' | 'phone'>('instagram');
  const [isHashing, setIsHashing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Live real-time cryptographic hash calculation on every keystroke
  useEffect(() => {
    if (!inputVal.trim()) {
      setActiveHash('');
      setMaskedPreview('');
      setIsHashing(false);
      return;
    }

    setIsHashing(true);
    const { normalized, type } = normalizeIdentityInput(inputVal);
    setDetectedType(type);
    setMaskedPreview(maskIdentity(normalized, type));

    let isMounted = true;
    computeSHA256(normalized).then(hash => {
      if (isMounted) {
        setActiveHash(hash);
        setIsHashing(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [inputVal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      setErrorMessage('Please enter an Instagram handle or Indian phone number');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    const result = await addCrush(inputVal);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(result.isMatch ? "IT'S A MUTUAL MATCH! 🎉" : 'Crush securely encrypted and registered in vault!');
      setInputVal('');
      if (onSuccess) {
        setTimeout(onSuccess, 800);
      }
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  const slotsAvailable = user ? user.crushSlotsTotal - user.crushSlotsUsed : 0;

  return (
    <div className="bg-navy-850/90 border border-violet-500/25 rounded-3xl p-5 shadow-2xl relative overflow-hidden text-left">
      {/* Subtle ambient light */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Secret Crush Slot</span>
              <span className="text-[10px] text-emerald-400 font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                {slotsAvailable} Remaining
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Zero notification sent unless mutual</p>
          </div>
        </div>

        {slotsAvailable <= 0 && (
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="text-[11px] font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-xl transition-all"
          >
            + Unlock for ₹10
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Input Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Target Handle or Number</span>
            <span className="text-[10px] text-slate-400 flex items-center space-x-1">
              <span>Auto-detects</span>
              <span className="text-violet-400 font-mono">@insta</span>
              <span>or</span>
              <span className="text-emerald-400 font-mono">+91</span>
            </span>
          </label>

          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center space-x-2 text-slate-400 pointer-events-none">
              {detectedType === 'instagram' ? (
                <InstagramIcon className="w-4 h-4 text-violet-400" />
              ) : (
                <Phone className="w-4 h-4 text-emerald-400" />
              )}
            </div>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. @priya_srcc or 9876543210"
              className="w-full bg-navy-900 border border-white/10 rounded-2xl pl-10 pr-24 py-3 text-sm text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
            />

            {/* Live Mask Badge */}
            {maskedPreview && (
              <div className="absolute right-3 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-violet-300 pointer-events-none">
                {maskedPreview}
              </div>
            )}
          </div>
        </div>

        {/* Live Cryptographic Security Indicator */}
        <div className={`p-3 rounded-2xl border transition-all duration-300 ${
          activeHash 
            ? 'bg-navy-900/95 border-emerald-500/40 shadow-glow-emerald/10' 
            : 'bg-navy-900/50 border-white/5'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-1.5">
              <Cpu className={`w-3.5 h-3.5 ${isHashing ? 'text-violet-400 animate-spin' : activeHash ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Live Cryptographic Hashing
              </span>
            </div>

            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
              activeHash 
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                : 'bg-white/5 text-slate-500'
            }`}>
              <ShieldCheck className="w-3 h-3" />
              <span>{activeHash ? 'Client-Side 256-Bit SHA' : 'Awaiting Keystroke'}</span>
            </span>
          </div>

          {/* Cryptographic hash live preview */}
          <div className="font-mono text-[10px] break-all leading-tight">
            {activeHash ? (
              <div className="space-y-1">
                <div className="text-slate-300">
                  <span className="text-violet-400 font-bold">hash: </span>
                  <span className="text-emerald-400">{activeHash.slice(0, 16)}</span>
                  <span className="text-slate-400">{activeHash.slice(16, 48)}</span>
                  <span className="text-violet-300">{activeHash.slice(48)}</span>
                </div>
                <div className="text-[9px] text-slate-400 flex items-center space-x-1 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Only this irreversible mathematical fingerprint leaves your device.</span>
                </div>
              </div>
            ) : (
              <span className="text-slate-400 italic">
                Type an Instagram handle or phone number above to witness real-time Web Crypto zero-knowledge hash generation...
              </span>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-2 text-xs text-emerald-400 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!inputVal.trim() || isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-purple-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 group"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Checking Double-Blind Collision...</span>
            </div>
          ) : (
            <>
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>Lock Secret Crush in Vault</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
