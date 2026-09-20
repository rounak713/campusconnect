import React from 'react';
import { Lock, Plus, Heart, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const tabs = [
  { id: 'crushes' as const, label: 'Crushes', icon: Lock,        activeColor: 'text-[#8B5CF6]', indicator: 'bg-[#8B5CF6]' },
  { id: 'add'     as const, label: 'Add',     icon: Plus,        activeColor: 'text-[#8B5CF6]', indicator: 'bg-[#8B5CF6]', special: true },
  { id: 'matches' as const, label: 'Matches', icon: Heart,       activeColor: 'text-[#E86090]', indicator: 'bg-[#E86090]' },
  { id: 'profile' as const, label: 'Profile', icon: User,        activeColor: 'text-[#06B6D4]', indicator: 'bg-[#06B6D4]' },
  { id: 'verify'  as const, label: 'Verify',  icon: ShieldCheck, activeColor: 'text-[#10B981]', indicator: 'bg-[#10B981]' },
];

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, crushes, verification } = useApp();
  const matchCount = crushes.filter(c => c.status === 'mutual_match').length;
  const needsVerification = verification.status !== 'verified';

  return (
    <nav className="shrink-0 border-t border-white/[0.05] bg-noir-900/95 backdrop-blur-xl safe-bottom">
      <div className="grid grid-cols-5 px-1 py-1">
        {tabs.map(({ id, label, icon: Icon, activeColor, indicator, special }) => {
          const isActive = activeTab === id;
          const showBadge = id === 'matches' && matchCount > 0;
          const showDot = id === 'verify' && needsVerification;

          if (special) {
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center justify-center py-3 gap-1"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] shadow-glow-sm-violet'
                    : 'bg-[#8B5CF6]/15 border border-[#8B5CF6]/30'
                }`}>
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-[#8B5CF6]'}`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-[#8B5CF6]' : 'text-zinc-600'}`}>
                  {label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center justify-center py-3 gap-1 relative"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${isActive ? activeColor : 'text-zinc-600'}`}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-[#E86090] text-white text-[9px] font-black flex items-center justify-center px-1 shadow-md">
                    {matchCount}
                  </span>
                )}
                {showDot && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse-glow" />
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${isActive ? activeColor : 'text-zinc-600'}`}>
                {label}
              </span>
              {isActive && (
                <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${indicator}`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
