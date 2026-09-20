import React from 'react';
import { Plus, CreditCard, Lock, GraduationCap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EditorialCrushCard } from './EditorialCrushCard';

export const DeckView: React.FC = () => {
  const { crushes, user, selectedCollege, setActiveTab, setIsPaymentModalOpen, setIsSetupModalOpen } = useApp();

  const totalSlots = user?.crushSlotsTotal || 3;
  const usedSlots = crushes.length;
  const remainingSlots = Math.max(0, totalSlots - usedSlots);

  return (
    <div className="p-6 space-y-6 pb-24 text-left animate-in fade-in duration-300">
      {/* Top Subtle Campus Pill */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setIsSetupModalOpen(true)}
          className="flex items-center space-x-2 text-xs text-subtle hover:text-white px-3 py-1.5 rounded-full bg-noir-850 border border-white/5 transition-colors"
        >
          <GraduationCap className="w-3.5 h-3.5 text-hinge-purple" />
          <span className="font-medium text-white">{selectedCollege.shortName}</span>
          <span>•</span>
          <span>{selectedCollege.campusTag}</span>
        </button>

        <div className="flex items-center space-x-1 text-xs font-mono text-subtle">
          <span className="text-white font-medium">{usedSlots}</span>
          <span>/</span>
          <span>{totalSlots} slots</span>
        </div>
      </div>

      {/* Editorial Header */}
      <div>
        <h2 className="font-serif text-3xl sm:text-4xl text-bone font-normal tracking-tight">
          Your Secret Vault
        </h2>
        <p className="text-xs text-subtle mt-1.5 leading-relaxed">
          {remainingSlots > 0 
            ? `You have ${remainingSlots} private slot${remainingSlots > 1 ? 's' : ''} available.` 
            : "All semester slots filled. Unlock more below."}
        </p>
      </div>

      {/* Crush Cards Deck */}
      <div className="space-y-4">
        {crushes.length === 0 ? (
          <div className="py-16 px-6 rounded-3xl bg-noir-850 border border-white/5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-hinge-muted border border-hinge-purple/30 text-hinge-purple flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-2xl text-bone font-normal">Vault is Empty</h3>
              <p className="text-xs text-subtle mt-1 max-w-xs mx-auto leading-relaxed">
                Add an Instagram handle or phone number. They will never know unless they crush on you too.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('add')}
              className="py-3 px-6 bg-hinge-purple hover:bg-hinge-hover text-white font-medium text-xs rounded-full shadow-md shadow-hinge-purple/20 transition-all"
            >
              Add Secret Crush
            </button>
          </div>
        ) : (
          crushes.map((crush) => (
            <EditorialCrushCard key={crush.id} crush={crush} />
          ))
        )}
      </div>

      {/* Action Footer: Add Crush or Unlock Slot */}
      <div className="pt-2">
        {remainingSlots > 0 ? (
          <button
            onClick={() => setActiveTab('add')}
            className="w-full py-3.5 rounded-full border border-white/10 hover:border-hinge-purple/40 bg-noir-850 text-white text-xs font-medium flex items-center justify-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4 text-hinge-purple" />
            <span>Add Another Secret Crush ({remainingSlots} left)</span>
          </button>
        ) : (
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full py-3.5 rounded-full bg-noir-850 border border-hinge-purple/30 text-white text-xs font-medium flex items-center justify-center space-x-2 transition-all hover:bg-noir-800"
          >
            <CreditCard className="w-4 h-4 text-hinge-purple" />
            <span>Unlock Next Slot with ₹10 Pass</span>
          </button>
        )}
      </div>
    </div>
  );
};
