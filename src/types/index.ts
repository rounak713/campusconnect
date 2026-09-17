export interface College {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  campusTag: string;
  badgeColor: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  maskedPhone: string;
  collegeId: string;
  collegeName: string;
  collegeShortName: string;
  isVerified: boolean;
  crushSlotsTotal: number;
  crushSlotsUsed: number;
}

export type CrushStatus = 'waiting' | 'mutual_match';

export interface CrushEntry {
  id: string;
  type: 'instagram' | 'phone';
  rawInput: string;
  maskedHandle: string;
  sha256Hash: string;
  createdAt: string;
  status: CrushStatus;
  notes?: string;
  mutualMatchData?: {
    matchId: string;
    alias: string;
    revealedName?: string;
    college: string;
    avatarUrl: string;
    matchTimestamp: string;
    blurAmount: number; // 0 to 20 px
    isRevealed: boolean;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  isSelf: boolean;
  text: string;
  timestamp: string;
  isEncrypted: boolean;
}

export interface UPIApp {
  id: string;
  name: string;
  iconName: string;
  color: string;
  popular?: boolean;
}
