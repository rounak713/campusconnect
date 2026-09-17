import React, { useState } from 'react';
import { Search, GraduationCap, MapPin, Check, ChevronDown } from 'lucide-react';
import type { College } from '../../types';
import { INDIAN_COLLEGES } from '../../data/colleges';

interface CollegeSelectorProps {
  selectedCollege: College;
  onSelect: (college: College) => void;
}

export const CollegeSelector: React.FC<CollegeSelectorProps> = ({ selectedCollege, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredColleges = INDIAN_COLLEGES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.campusTag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <label className="block text-xs font-semibold text-zinc-400 mb-2">Your Campus</label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-noir-800 border border-white/[0.08] hover:border-[#6F38E8]/40 p-3.5 rounded-2xl flex items-center justify-between transition-all group text-left focus-within:border-[#6F38E8]/40"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-[#6F38E8]/10 border border-[#6F38E8]/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4.5 h-4.5 text-[#6F38E8]" />
          </div>
          <div className="truncate">
            <div className="text-sm font-semibold text-white truncate">
              {selectedCollege.shortName}
            </div>
            <div className="text-xs text-zinc-500 flex items-center gap-1 truncate mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{selectedCollege.city} • {selectedCollege.campusTag}</span>
            </div>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-violet-400 transition-colors shrink-0 ml-2" />
      </button>

      {/* College Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-navy-900 border border-violet-500/30 rounded-t-3xl sm:rounded-3xl p-5 text-left shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Choose Your College</h3>
                <p className="text-xs text-slate-400">Match with peers across your college network</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5"
              >
                Done
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative my-3.5">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search DU, IIT, BITS, NIT, DTU..."
                className="w-full bg-navy-800 border border-white/10 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1 custom-scroll">
              {filteredColleges.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No colleges found matching "{searchQuery}".<br/>
                  Try searching "DU", "IIT", or "BITS".
                </div>
              ) : (
                filteredColleges.map((college) => {
                  const isSelected = college.id === selectedCollege.id;
                  return (
                    <div
                      key={college.id}
                      onClick={() => {
                        onSelect(college);
                        setIsOpen(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'bg-violet-950/40 border-violet-500/50 shadow-md shadow-violet-900/20' 
                          : 'bg-navy-850/60 border-white/5 hover:border-white/15 hover:bg-navy-800/80'
                      }`}
                    >
                      <div className="pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-white">{college.shortName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                            {college.campusTag}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 truncate max-w-[260px]">
                          {college.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-1">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{college.city}, {college.state}</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
