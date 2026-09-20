export interface College {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  campusTag: string;
  badgeColor: string;
  emailDomain?: string;
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
  displayName?: string;
  degree?: string;
  year?: string;
  avatarEmoji?: string;
}

export type VerificationMethod = 'email' | 'id_card';

export type VerificationStep = 'phone' | 'college' | 'method' | 'done';

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface StudentVerification {
  step: VerificationStep;
  status: VerificationStatus;
  method: VerificationMethod | null;
  phoneVerified: boolean;
  collegeEmail?: string;
  idCardFileName?: string;
  verifiedAt?: string;
}

export interface PrivacySettings {
  ghostMode: boolean;
  photoShield: boolean;
  contactShield: boolean;
}

export interface CampusPass {
  isActive: boolean;
  label: string;
  amount: number;
  validUntil: string;
  daysLeft: number;
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
