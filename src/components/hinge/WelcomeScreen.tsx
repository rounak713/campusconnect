import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WelcomeScreen: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
  const { selectedCollege, setIsSetupModalOpen } = useApp();

  return (
    <div className="min-h-full flex flex-col justify-between p-6 sm:p-8 text-left animate-in fade-in duration-300">
      {/* Top Header Signpost */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-hinge-muted flex items-center justify-center text-hinge-purple border border-hinge-purple/30">
            <Lock className="w-4 h-4" />
          </div>
          <span className="text-xs tracking-wider uppercase font-semibold text-subtle">
            Zero-Knowledge Campus Vault
          </span>
        </div>
        <button
          onClick={() => setIsSetupModalOpen(true)}
          className="text-xs text-subtle hover:text-white px-2.5 py-1 rounded-full bg-noir-800 border border-white/5"
        >
          {selectedCollege.shortName}
        </button>
      </div>

      {/* Middle Hero: Large Editorial Serif Typography */}
      <div className="my-auto py-10">
        <h1 className="font-serif text-4xl sm:text-5xl text-bone font-normal tracking-tight leading-[1.15]">
          Welcome to <br />
          <span className="font-medium text-white">CampusConnect.</span>
        </h1>

        <p className="font-serif italic text-2xl sm:text-3xl text-subtle mt-4 font-normal leading-snug">
          The app designed to keep crushes 100% secret.
        </p>

        {/* Minimalist Visual Vignette */}
        <div className="my-8 p-6 rounded-3xl bg-noir-850 border border-white/5 space-y-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-2 h-2 rounded-full bg-hinge-purple mt-2 shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-white">Zero Unsolicited Alerts</h4>
              <p className="text-xs text-subtle mt-0.5 leading-relaxed">
                Your crush never knows you added them. A spark happens only if they independently enter your handle too.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-white">Irreversible Cryptography</h4>
              <p className="text-xs text-subtle mt-0.5 leading-relaxed">
                We store mathematical 256-bit fingerprints, never plaintext handles or phone numbers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="pb-4 space-y-3">
        <button
          onClick={onContinue}
          className="w-full py-4 bg-hinge-purple hover:bg-hinge-hover text-white font-medium text-base rounded-full transition-all flex items-center justify-center space-x-2 shadow-lg shadow-hinge-purple/20 group"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-center text-[11px] text-subtle">
          By continuing, you agree to discreet double-blind campus ethics.
        </p>
      </div>
    </div>
  );
};
