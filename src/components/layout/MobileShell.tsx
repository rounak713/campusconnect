import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BottomNav } from './BottomNav';
import { DeckView } from '../hinge/DeckView';
import { StepCrushEntry } from '../hinge/StepCrushEntry';
import { HingeMatchesList } from '../match/HingeMatchesList';
import { HingePrivacyTab } from '../privacy/HingePrivacyTab';
import { HingeAuthScreen } from '../auth/HingeAuthScreen';
import { HingePaymentSheet } from '../payment/HingePaymentSheet';
import { MutualMatchModal } from '../match/MutualMatchModal';

export const MobileShell: React.FC = () => {
  const {
    activeTab,
    activeMatchModal,
    setActiveMatchModal,
  } = useApp();

  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const t = setInterval(update, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-noir-900 flex flex-col items-center justify-start sm:py-8 sm:bg-black selection:bg-[#6F38E8] selection:text-white">
      {/* Phone frame on desktop */}
      <div className="w-full max-w-[430px] min-h-[100dvh] sm:min-h-0 sm:h-[900px] bg-noir-900 sm:rounded-[50px] sm:border-[8px] sm:border-zinc-900/80 sm:shadow-2xl sm:ring-1 sm:ring-white/5 overflow-hidden flex flex-col relative">
        
        {/* Status bar (desktop mock) */}
        <div className="hidden sm:flex items-center justify-between px-8 pt-4 pb-1 text-[11px] font-semibold text-zinc-500 select-none shrink-0">
          <span className="text-white">{time}</span>
          <div className="w-28 h-[22px] bg-black rounded-full" />
          <div className="flex items-center gap-1.5 text-white">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
          </div>
        </div>

        {/* Minimal top bar */}
        <header className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#6F38E8] flex items-center justify-center shadow-glow-sm-violet">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white stroke-[2]">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <span className="text-[15px] font-bold text-white tracking-tight">CampusConnect</span>
              <div className="flex items-center gap-1 mt-[1px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
                <span className="text-[10px] text-zinc-500 font-medium">Zero-Knowledge Active</span>
              </div>
            </div>
          </div>

          <CollegeChip />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overscroll-contain">
          {activeTab === 'crushes'  && <DeckView />}
          {activeTab === 'add'      && (
            <div className="p-6 pb-28 animate-slide-up">
              <StepCrushEntry />
            </div>
          )}
          {activeTab === 'matches'  && <HingeMatchesList />}
          {activeTab === 'privacy'  && <HingePrivacyTab />}
        </main>

        {/* Bottom navigation */}
        <BottomNav />

        {/* Modals & overlays */}
        <HingePaymentSheet />
        <HingeAuthScreen />
        {activeMatchModal && (
          <MutualMatchModal
            crush={activeMatchModal}
            onClose={() => setActiveMatchModal(null)}
          />
        )}
      </div>
    </div>
  );
};

/* Inline college chip for top bar */
const CollegeChip: React.FC = () => {
  const { selectedCollege, setIsSetupModalOpen } = useApp();
  return (
    <button
      onClick={() => setIsSetupModalOpen(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-noir-850 border border-white/[0.07] hover:border-[#6F38E8]/40 transition-colors text-left"
    >
      <span className="text-xs font-semibold text-white">{selectedCollege.shortName}</span>
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-zinc-500 stroke-[2.5]">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
};
