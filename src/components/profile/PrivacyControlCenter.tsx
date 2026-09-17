import React from 'react';
import { EyeOff, ImageOff, Lock, PhoneOff } from 'lucide-react';
import type { PrivacySettings } from '../../types';
import { ToggleSwitch } from '../common/ToggleSwitch';

interface PrivacyControlCenterProps {
  privacy: PrivacySettings;
  onToggle: (key: keyof PrivacySettings) => void;
}

const CONTROLS: Array<{
  key: keyof PrivacySettings;
  title: string;
  body: string;
  icon: typeof EyeOff;
  accent: 'violet' | 'cyan' | 'emerald';
  tone: string;
}> = [
  {
    key: 'ghostMode',
    title: 'Ghost Mode',
    body: 'Hide your profile from search and public campus listings.',
    icon: EyeOff,
    accent: 'violet',
    tone: 'text-[#8B5CF6] bg-[#8B5CF6]/12 border-[#8B5CF6]/25',
  },
  {
    key: 'photoShield',
    title: 'Photo Shield',
    body: 'Keep photos blurred until a 100% mutual crush match occurs.',
    icon: ImageOff,
    accent: 'cyan',
    tone: 'text-[#06B6D4] bg-[#06B6D4]/12 border-[#06B6D4]/25',
  },
  {
    key: 'contactShield',
    title: 'Contact Shield',
    body: 'Automatically block phone contacts from discovering your profile.',
    icon: PhoneOff,
    accent: 'emerald',
    tone: 'text-[#10B981] bg-[#10B981]/12 border-[#10B981]/25',
  },
];

export const PrivacyControlCenter: React.FC<PrivacyControlCenterProps> = ({ privacy, onToggle }) => {
  const activeCount = Object.values(privacy).filter(Boolean).length;

  return (
    <section className="rounded-[28px] border border-white/[0.07] bg-[#0E1528] overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
        <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/12 border border-[#8B5CF6]/25 flex items-center justify-center">
          <Lock className="w-4 h-4 text-[#8B5CF6]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Privacy & Incognito</p>
          <p className="text-[11px] text-slate-500">{activeCount} of 3 shields active</p>
        </div>
      </header>

      <div className="divide-y divide-white/[0.04]">
        {CONTROLS.map(({ key, title, body, icon: Icon, accent, tone }) => (
          <div key={key} className="flex items-center gap-3.5 px-5 py-4">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-opacity duration-300 ${tone} ${privacy[key] ? 'opacity-100' : 'opacity-45'}`}>
              <Icon className="w-4 h-4" strokeWidth={1.9} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{body}</p>
            </div>
            <ToggleSwitch checked={privacy[key]} onChange={() => onToggle(key)} label={title} accent={accent} />
          </div>
        ))}
      </div>
    </section>
  );
};
