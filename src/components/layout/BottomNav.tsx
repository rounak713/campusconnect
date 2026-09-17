import React from 'react';
import { Lock, Plus, Heart, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const tabs = [
  { id: 'crushes' as const, label: 'Vault',    icon: Lock,        activeColor: 'text-[#6F38E8]' },
  { id: 'add'     as const, label: 'Add',       icon: Plus,        activeColor: 'text-[#6F38E8]', special: true },
  { id: 'matches' as const, label: 'Matches',   icon: Heart,       activeColor: 'text-[#E86090]' },
  { id: 'privacy' as const, label: 'Privacy',   icon: ShieldCheck, activeColor: 'text-emerald-400' },
];

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, crushes } = useApp();
  const matchCount = crushes.filter(c => c.status === 'mutual_match').length;

  return (
    <nav className="shrink-0 border-t border-white/[0.05] bg-noir-900/95 backdrop-blur-xl safe-bottom">
      <div className="grid grid-cols-4 px-2 py-1">
        {tabs.map(({ id, label, icon: Icon, activeColor, special }) => {
          const isActive = activeTab === id;
          const showBadge = id === 'matches' && matchCount > 0;

          if (special) {
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center justify-center py-3 gap-1"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#6F38E8] shadow-glow-sm-violet'
                    : 'bg-[#6F38E8]/15 border border-[#6F38E8]/30'
                }`}>
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-[#6F38E8]'}`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-[#6F38E8]' : 'text-zinc-600'}`}>
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
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${isActive ? activeColor : 'text-zinc-600'}`}>
                {label}
              </span>
              {isActive && (
                <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${
                  id === 'matches' ? 'bg-[#E86090]' : id === 'privacy' ? 'bg-emerald-400' : 'bg-[#6F38E8]'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
