import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  CreditCard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { computeSHA256, normalizeIdentityInput, maskIdentity } from '../../utils/crypto';

export const StepCrushEntry: React.FC<{ onDone?: () => void }> = ({ onDone }) => {
  const { user, addCrush, setIsPaymentModalOpen, setActiveTab } = useApp();
  const [inputVal, setInputVal] = useState('');
  const [activeHash, setActiveHash] = useState('');
  const [maskedPreview, setMaskedPreview] = useState('');
  const [, setDetectedType] = useState<'instagram' | 'phone'>('instagram');
  const [showWhyHashModal, setShowWhyHashModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Live real-time Web Crypto calculation
  useEffect(() => {
    if (!inputVal.trim()) {
      setActiveHash('');
      setMaskedPreview('');
      return;
    }

    const { normalized, type } = normalizeIdentityInput(inputVal);
    setDetectedType(type);
    setMaskedPreview(maskIdentity(normalized, type));

    let isMounted = true;
    computeSHA256(normalized).then(hash => {
      if (isMounted) setActiveHash(hash);
    });

    return () => {
      isMounted = false;
    };
  }, [inputVal]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) {
      setErrorMessage('Please enter an Instagram handle or Indian phone number');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const result = await addCrush(inputVal);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(result.isMatch ? "It's a Mutual Match! 🎉" : 'Crush securely encrypted and locked in your vault.');
      setInputVal('');
      setTimeout(() => {
        if (onDone) onDone();
        else setActiveTab('crushes');
      }, 1000);
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  const slotsAvailable = user ? user.crushSlotsTotal - user.crushSlotsUsed : 0;

  return (
    <div className="min-h-full flex flex-col justify-between p-6 sm:p-8 text-left animate-in fade-in duration-300">
      <div>
        {/* Signpost Icon & Step Header (Hinge style) */}
        <div className="flex items-center justify-between pt-2 mb-8">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full border border-white/15 bg-noir-850 flex items-center justify-center text-white">
              <Lock className="w-4 h-4 text-hinge-purple" />
            </div>
            <div className="flex space-x-1">
              <div className="w-6 h-1 rounded-full bg-hinge-purple" />
              <div className="w-2 h-1 rounded-full bg-white/20" />
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-subtle">
              {slotsAvailable} / {user?.crushSlotsTotal || 3} Slots Left
            </span>
          </div>
        </div>

        {/* Large Editorial Headline */}
        <h2 className="font-serif text-3xl sm:text-4xl text-bone font-normal tracking-tight leading-snug mb-3">
          Who has caught <br />your attention?
        </h2>
        <p className="text-sm text-subtle leading-relaxed mb-8">
          Enter their Instagram handle or Indian mobile number.
        </p>

        {/* Minimal Underline Input (Hinge style) */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="@handle or 9876543210"
              className="w-full bg-transparent border-b-2 border-white/15 focus:border-hinge-purple py-3 text-xl text-white font-normal placeholder:text-zinc-600 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Contextual Link: "Why cryptographic hash?" (Directly matching Hinge's "Why last name?") */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowWhyHashModal(true)}
              className="text-xs text-hinge-purple hover:underline font-medium flex items-center space-x-1"
            >
              <span>Why client-side hash? Why?</span>
            </button>

            {maskedPreview && (
              <span className="text-xs font-mono text-subtle bg-noir-850 px-2.5 py-1 rounded-full border border-white/5">
                Masked: {maskedPreview}
              </span>
            )}
          </div>

          {/* Live Subtle SHA-256 Digest (Calm, understated) */}
          {activeHash && (
            <div className="mt-4 p-3.5 rounded-2xl bg-noir-850 border border-white/5 font-mono text-[11px] text-zinc-400 break-all leading-tight">
              <span className="text-hinge-purple font-semibold">sha256: </span>
              <span className="text-zinc-300">{activeHash.slice(0, 32)}</span>
              <span className="text-zinc-500">{activeHash.slice(32)}</span>
              <p className="text-[10px] text-zinc-500 mt-1 font-sans">
                Only this irreversible one-way mathematical fingerprint will leave your phone.
              </p>
            </div>
          )}

          {/* Error & Success Feedback */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-2 text-xs text-emerald-300">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Action */}
      <div className="pt-8 pb-4 flex items-center justify-between">
        {slotsAvailable <= 0 ? (
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full py-4 bg-noir-850 border border-hinge-purple/30 text-white font-medium text-sm rounded-full flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-4 h-4 text-hinge-purple" />
            <span>Unlock Next Slot for ₹10</span>
          </button>
        ) : (
          <div className="w-full flex items-center justify-end">
            <button
              type="button"
              disabled={!inputVal.trim() || isSubmitting}
              onClick={() => handleSubmit()}
              className="w-14 h-14 rounded-full bg-hinge-purple hover:bg-hinge-hover disabled:opacity-30 text-white flex items-center justify-center transition-all shadow-lg shadow-hinge-purple/30"
              title="Add to secret vault"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Hinge-style "Why last name?" Explainer Drawer Modal */}
      {showWhyHashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-sm bg-noir-900 border border-white/10 rounded-3xl p-6 text-left shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-hinge-muted border border-hinge-purple/30 text-hinge-purple flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-2xl text-bone font-normal mb-2">
              Why client-side hash?
            </h3>

            <p className="text-xs text-subtle leading-relaxed mb-4">
              Typing a handle or number computes an irreversible 256-bit mathematical digest directly in your browser. 
              We never store their actual handle on our servers.
            </p>

            <p className="text-xs text-subtle leading-relaxed mb-6">
              Even if our database were breached, an intruder only sees scrambled alphanumeric strings. 
              Your secret stays 100% private unless both of you enter each other.
            </p>

            <button
              onClick={() => setShowWhyHashModal(false)}
              className="w-full py-3.5 bg-hinge-purple hover:bg-hinge-hover text-white font-medium text-sm rounded-full transition-all"
            >
              Ok, Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

