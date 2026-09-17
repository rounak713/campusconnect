import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  GraduationCap, 
  Key, 
  Heart, 
  CreditCard,
  Flame,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CrushCard } from './CrushCard';
import { AddCrushForm } from './AddCrushForm';
import { PrivacyBanner } from '../auth/PrivacyBanner';

export const CrushDashboard: React.FC = () => {
  const { user, crushes, selectedCollege, setIsPaymentModalOpen, setActiveTab } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);

  const totalSlots = user?.crushSlotsTotal || 3;
  const usedSlots = user?.crushSlotsUsed || crushes.length;
  const remainingSlots = Math.max(0, totalSlots - usedSlots);
  const mutualMatches = crushes.filter(c => c.status === 'mutual_match');

  return (
    <div className="space-y-4 pb-20">
      {/* Privacy Guarantee Banner */}
      <PrivacyBanner />

      {/* College & Slots Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-navy-850 via-navy-900 to-violet-950/40 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-wide">{selectedCollege.shortName}</span>
              <span className="text-[10px] text-slate-400 ml-1.5">• {selectedCollege.campusTag}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Vault Active</span>
          </div>
        </div>

        {/* Slot Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-violet-400" />
              <span>Encrypted Crush Slots</span>
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {usedSlots} / {totalSlots} Used
            </span>
          </div>

          {/* Segmented Slot Indicators */}
          <div className="grid grid-cols-5 gap-1.5 h-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const isSlotUnlocked = i < totalSlots;
              const isSlotFilled = i < usedSlots;
              return (
                <div
                  key={i}
                  className={`h-full rounded-full transition-all duration-500 ${
                    !isSlotUnlocked
                      ? 'bg-navy-950 border border-white/5 opacity-40'
                      : isSlotFilled
                      ? 'bg-gradient-to-r from-violet-500 to-pink-500 shadow-glow-violet'
                      : 'bg-emerald-500/30 border border-emerald-500/40'
                  }`}
                  title={
                    !isSlotUnlocked
                      ? 'Locked slot (Unlock for ₹10)'
                      : isSlotFilled
                      ? 'Occupied encrypted slot'
                      : 'Available free slot'
                  }
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              {remainingSlots > 0 ? (
                <span className="text-emerald-400 font-medium">✨ {remainingSlots} secret slot{remainingSlots > 1 ? 's' : ''} ready</span>
              ) : (
                <span className="text-amber-400 font-medium">⚡ All slots filled</span>
              )}
            </span>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="text-[11px] font-bold text-violet-300 hover:text-white bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 px-2.5 py-1 rounded-xl transition-all flex items-center space-x-1"
            >
              <CreditCard className="w-3 h-3" />
              <span>+ Add Slot (₹10)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mutual Match Highlight Banner (If any) */}
      {mutualMatches.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-violet-900/60 via-purple-900/40 to-pink-900/60 border border-pink-500/40 shadow-lg shadow-pink-900/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 to-pink-500 p-0.5 flex items-center justify-center animate-bounce">
              <div className="w-full h-full bg-navy-900 rounded-[14px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-pink-400" />
              </div>
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1">
                <span>{mutualMatches.length} Mutual Match Detected!</span>
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <p className="text-[11px] text-slate-300">
                You both added each other independently.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('matches')}
            className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/30"
          >
            Open Chat
          </button>
        </div>
      )}

      {/* Action Bar / Add Crush Toggle */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-1.5">
          <span>Active Cryptographic Crushes</span>
          <span className="text-xs text-slate-400 font-normal font-mono">({crushes.length})</span>
        </h2>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shadow-md ${
            showAddForm 
              ? 'bg-white/10 text-slate-300 hover:bg-white/20' 
              : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30'
          }`}
        >
          <Plus className={`w-3.5 h-3.5 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
          <span>{showAddForm ? 'Close Form' : 'Add Crush'}</span>
        </button>
      </div>

      {/* Add Crush Sheet */}
      {showAddForm && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <AddCrushForm onSuccess={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Crushes List */}
      <div className="space-y-3">
        {crushes.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-3xl bg-navy-850/40 border border-white/5 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7 text-violet-400/60" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Your Vault is Empty</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Add an Instagram handle or Indian phone number. It will be scrambled client-side with SHA-256 before saving.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 py-2.5 px-5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30"
            >
              Add Your First Secret Crush
            </button>
          </div>
        ) : (
          crushes.map((crush) => (
            <CrushCard key={crush.id} crush={crush} />
          ))
        )}
      </div>

      {/* Indian College Student Micro-Faq */}
      <div className="p-3.5 rounded-2xl bg-navy-850/40 border border-white/5 flex items-start space-x-3 text-left">
        <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Campus Tip:</strong> If your crush isn't on CampusConnect yet, our double-blind engine holds your encrypted hash securely. The moment they join and type your handle, your match sparks instantly!
        </div>
      </div>
    </div>
  );
};
