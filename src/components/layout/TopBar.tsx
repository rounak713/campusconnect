import React from 'react';
import { Shield, GraduationCap, Smartphone, Monitor, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopBar: React.FC = () => {
  const { 
    selectedCollege, 
    setIsSetupModalOpen, 
    viewMode, 
    setViewMode 
  } = useApp();

  return (
    <header className="w-full bg-navy-900/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Brand & Shield */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-emerald-500 p-0.5 shadow-glow-violet">
            <div className="w-full h-full bg-navy-900 rounded-[14px] flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-black tracking-tight text-white">CampusConnect</span>
              <span className="text-[9px] bg-violet-500/20 text-violet-300 font-bold px-1.5 py-0.2 rounded-full border border-violet-500/30">
                ZK-v2
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Zero-Knowledge Engine</span>
            </div>
          </div>
        </div>

        {/* College & Profile Pill */}
        <div className="flex items-center space-x-2">
          {/* View Mode Switcher (Visible on desktop/tablet) */}
          <div className="hidden sm:flex items-center bg-navy-850 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('mobile-frame')}
              title="Mobile Device Frame View"
              className={`p-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
                viewMode === 'mobile-frame' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold">Mobile</span>
            </button>
            <button
              onClick={() => setViewMode('responsive')}
              title="Full Responsive View"
              className={`p-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
                viewMode === 'responsive' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold">Full</span>
            </button>
          </div>

          {/* College / User Badge */}
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="flex items-center space-x-2 bg-navy-850 hover:bg-navy-800 border border-white/10 hover:border-violet-500/40 px-2.5 py-1.5 rounded-xl transition-all text-left shadow-sm"
          >
            <div className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <div className="hidden xs:block max-w-[100px] truncate">
              <div className="text-[11px] font-bold text-white truncate">{selectedCollege.shortName}</div>
              <div className="text-[9px] text-emerald-400 font-mono flex items-center space-x-0.5">
                <UserCheck className="w-2.5 h-2.5" />
                <span>Verified</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
