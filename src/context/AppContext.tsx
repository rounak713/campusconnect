import React, { createContext, useContext, useState } from 'react';
import type { College, CrushEntry, UserProfile, ChatMessage } from '../types';
import { INDIAN_COLLEGES } from '../data/colleges';
import { computeSHA256, normalizeIdentityInput, maskIdentity } from '../utils/crypto';

interface AppContextType {
  user: UserProfile | null;
  selectedCollege: College;
  setSelectedCollege: (college: College) => void;
  crushes: CrushEntry[];
  activeTab: 'crushes' | 'add' | 'matches' | 'privacy';
  setActiveTab: (tab: 'crushes' | 'add' | 'matches' | 'privacy') => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  activeMatchModal: CrushEntry | null;
  setActiveMatchModal: (crush: CrushEntry | null) => void;
  isSetupModalOpen: boolean;
  setIsSetupModalOpen: (open: boolean) => void;
  viewMode: 'mobile-frame' | 'responsive';
  setViewMode: (mode: 'mobile-frame' | 'responsive') => void;
  
  // Actions
  login: (phone: string, college: College) => void;
  logout: () => void;
  addCrush: (rawInput: string) => Promise<{ success: boolean; isMatch?: boolean; error?: string }>;
  removeCrush: (id: string) => void;
  completePayment: () => void;
  revealMatch: (crushId: string) => void;
  clearChatAndUnmatch: (crushId: string) => void;
  
  // Mock Chat messages store
  chatMessages: Record<string, ChatMessage[]>;
  sendChatMessage: (matchId: string, text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCollege, setSelectedCollege] = useState<College>(INDIAN_COLLEGES[0]);
  const [viewMode, setViewMode] = useState<'mobile-frame' | 'responsive'>('mobile-frame');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'crushes' | 'add' | 'matches' | 'privacy'>('crushes');
  const [activeMatchModal, setActiveMatchModal] = useState<CrushEntry | null>(null);

  // Default demo user initialized at DU SRCC
  const [user, setUser] = useState<UserProfile | null>({
    id: 'usr-9874',
    phone: '+919810123456',
    maskedPhone: '+91 98****3456',
    collegeId: INDIAN_COLLEGES[0].id,
    collegeName: INDIAN_COLLEGES[0].name,
    collegeShortName: INDIAN_COLLEGES[0].shortName,
    isVerified: true,
    crushSlotsTotal: 3,
    crushSlotsUsed: 2,
  });

  // Preloaded mock crushes
  const [crushes, setCrushes] = useState<CrushEntry[]>([
    {
      id: 'crush-mutual-1',
      type: 'instagram',
      rawInput: 'anjali_eco_srcc',
      maskedHandle: '@a***a_eco',
      sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      createdAt: 'Yesterday, 11:20 PM',
      status: 'mutual_match',
      mutualMatchData: {
        matchId: 'match-anjali',
        alias: 'Economics Star ⭐',
        revealedName: 'Anjali Sharma (Economics Hons, 2nd Yr)',
        college: 'DU • SRCC',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        matchTimestamp: 'Mutual collision detected 2h ago',
        blurAmount: 18,
        isRevealed: false,
      }
    },
    {
      id: 'crush-waiting-2',
      type: 'phone',
      rawInput: '+919876543210',
      maskedHandle: '+91 98****3210',
      sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      createdAt: '3 days ago',
      status: 'waiting',
    }
  ]);

  // Ephemeral Chat store
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    'match-anjali': [
      {
        id: 'msg-1',
        senderId: 'crush',
        isSelf: false,
        text: 'OMG no way! Did you secretly put my handle too? 🙈',
        timestamp: 'Just now',
        isEncrypted: true
      },
      {
        id: 'msg-2',
        senderId: 'self',
        isSelf: true,
        text: 'Haha yes! I noticed you during the Eco fest seminar last week ✨',
        timestamp: 'Just now',
        isEncrypted: true
      }
    ]
  });

  const login = (phone: string, college: College) => {
    setSelectedCollege(college);
    const digits = phone.replace(/\D/g, '');
    const masked = digits.length >= 10 ? `+91 ${digits.slice(-10, -8)}****${digits.slice(-4)}` : '+91 98****3456';
    setUser({
      id: `usr-${Date.now().toString().slice(-4)}`,
      phone: `+91${digits.slice(-10)}`,
      maskedPhone: masked,
      collegeId: college.id,
      collegeName: college.name,
      collegeShortName: college.shortName,
      isVerified: true,
      crushSlotsTotal: 3,
      crushSlotsUsed: crushes.length,
    });
    setIsSetupModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setIsSetupModalOpen(true);
  };

  const addCrush = async (rawInput: string): Promise<{ success: boolean; isMatch?: boolean; error?: string }> => {
    if (!user) {
      setIsSetupModalOpen(true);
      return { success: false, error: 'Please login first' };
    }

    if (user.crushSlotsUsed >= user.crushSlotsTotal) {
      setIsPaymentModalOpen(true);
      return { success: false, error: 'Slots exhausted! Unlock another slot with ₹10 Semester Pass.' };
    }

    const { normalized, type } = normalizeIdentityInput(rawInput);
    const hash = await computeSHA256(normalized);
    const masked = maskIdentity(normalized, type);

    // Check if already in list
    if (crushes.some(c => c.sha256Hash === hash)) {
      return { success: false, error: 'You have already added this crush!' };
    }

    // Interactive demo trigger: instant match if handle has "priya", "rohan", or "match"
    const isInstantMatch = normalized.toLowerCase().includes('priya') || 
                           normalized.toLowerCase().includes('rohan') || 
                           normalized.toLowerCase().includes('match');

    const newCrush: CrushEntry = {
      id: `crush-${Date.now()}`,
      type,
      rawInput: normalized,
      maskedHandle: masked,
      sha256Hash: hash,
      createdAt: 'Just now',
      status: isInstantMatch ? 'mutual_match' : 'waiting',
      mutualMatchData: isInstantMatch ? {
        matchId: `match-${Date.now()}`,
        alias: 'Campus Star ✨',
        revealedName: `${normalized.replace('@', '')} (${selectedCollege.shortName})`,
        college: selectedCollege.shortName,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
        matchTimestamp: 'Just collided now!',
        blurAmount: 16,
        isRevealed: false
      } : undefined
    };

    setCrushes(prev => [newCrush, ...prev]);
    setUser(prev => prev ? { ...prev, crushSlotsUsed: prev.crushSlotsUsed + 1 } : null);

    if (isInstantMatch) {
      setActiveMatchModal(newCrush);
      return { success: true, isMatch: true };
    }

    return { success: true, isMatch: false };
  };

  const removeCrush = (id: string) => {
    setCrushes(prev => prev.filter(c => c.id !== id));
    setUser(prev => prev ? { ...prev, crushSlotsUsed: Math.max(0, prev.crushSlotsUsed - 1) } : null);
    if (activeMatchModal?.id === id) {
      setActiveMatchModal(null);
    }
  };

  const completePayment = () => {
    setUser(prev => prev ? { ...prev, crushSlotsTotal: prev.crushSlotsTotal + 1 } : null);
    setIsPaymentModalOpen(false);
  };

  const revealMatch = (crushId: string) => {
    setCrushes(prev => prev.map(c => {
      if (c.id === crushId && c.mutualMatchData) {
        return {
          ...c,
          mutualMatchData: {
            ...c.mutualMatchData,
            isRevealed: true,
            blurAmount: 0
          }
        };
      }
      return c;
    }));

    if (activeMatchModal?.id === crushId && activeMatchModal.mutualMatchData) {
      setActiveMatchModal({
        ...activeMatchModal,
        mutualMatchData: {
          ...activeMatchModal.mutualMatchData,
          isRevealed: true,
          blurAmount: 0
        }
      });
    }
  };

  const clearChatAndUnmatch = (crushId: string) => {
    const crush = crushes.find(c => c.id === crushId);
    if (crush?.mutualMatchData) {
      const matchId = crush.mutualMatchData.matchId;
      setChatMessages(prev => {
        const next = { ...prev };
        delete next[matchId];
        return next;
      });
    }
    removeCrush(crushId);
  };

  const sendChatMessage = (matchId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'self',
      isSelf: true,
      text,
      timestamp: 'Just now',
      isEncrypted: true
    };

    setChatMessages(prev => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), newMsg]
    }));

    // Auto simulated reply after 1.2s for fun realistic demo
    setTimeout(() => {
      const replies = [
        "I was so nervous to enter your handle, but I'm so glad it matched! 💜",
        "Wait, are you coming to the college canteen after class today? ☕",
        "This zero-knowledge encryption is so cool haha. Glad it kept our secret!",
        "Let's grab a coffee at the cafeteria this evening? 😊"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const autoMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: 'crush',
        isSelf: false,
        text: randomReply,
        timestamp: 'Just now',
        isEncrypted: true
      };
      setChatMessages(prev => ({
        ...prev,
        [matchId]: [...(prev[matchId] || []), autoMsg]
      }));
    }, 1200);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        selectedCollege,
        setSelectedCollege,
        crushes,
        activeTab,
        setActiveTab,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        activeMatchModal,
        setActiveMatchModal,
        isSetupModalOpen,
        setIsSetupModalOpen,
        viewMode,
        setViewMode,
        login,
        logout,
        addCrush,
        removeCrush,
        completePayment,
        revealMatch,
        clearChatAndUnmatch,
        chatMessages,
        sendChatMessage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
