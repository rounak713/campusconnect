import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const KMS_PEPPER = process.env.KMS_PEPPER || 'KMS_PEPPER_HSM_PROTECTED_32_BYTE_KEY_XYZ123';
const KMS_PAIR_KEY = process.env.KMS_PAIR_KEY || 'KMS_PAIR_COMMUTATIVE_SECRET_KEY_789ABC';
const KMS_DIR_KEY = process.env.KMS_DIR_KEY || 'KMS_DIR_PROOF_SECRET_KEY_456DEF';

export class CampusCryptoService {
  /**
   * Normalizes identity inputs into a canonical string.
   */
  static canonicalize(input: string, type: 'phone' | 'instagram'): string {
    const clean = input.trim().toLowerCase();
    if (type === 'instagram') {
      return clean.replace(/^@+/, '');
    }
    // E.164 phone normalization for India: standardizes 10-digit, trunk 0, or +91 to +91XXXXXXXXXX
    const digitsOnly = clean.replace(/\D/g, '');
    if (digitsOnly.length >= 10) {
      const last10 = digitsOnly.slice(-10);
      return `+91${last10}`;
    }
    return `+${digitsOnly}`;
  }

  /**
   * Generates a peppered identity hash (stored in DB instead of raw numbers/handles).
   */
  static generateIdentityHash(canonicalInput: string): string {
    return crypto
      .createHmac('sha256', KMS_PEPPER)
      .update(canonicalInput)
      .digest('hex');
  }

  /**
   * Generates an order-independent rendezvous token between two identity hashes.
   * Commutative invariant: generateRendezvousToken(A, B) === generateRendezvousToken(B, A)
   */
  static generateRendezvousToken(hashA: string, hashB: string): string {
    const sorted = [hashA, hashB].sort();
    return crypto
      .createHmac('sha256', KMS_PAIR_KEY)
      .update(`${sorted[0]}::${sorted[1]}`)
      .digest('hex');
  }

  /**
   * Generates a directional commitment hash to verify who initiated.
   */
  static generateDirectionalHash(initiatorHash: string, targetHash: string): string {
    return crypto
      .createHmac('sha256', KMS_DIR_KEY)
      .update(`${initiatorHash}->${targetHash}`)
      .digest('hex');
  }

  /**
   * Creates a friendly masked display string (e.g., "@a***a_eco" or "+91 98****3210").
   */
  static createMaskedHint(input: string, type: 'phone' | 'instagram'): string {
    if (type === 'instagram') {
      const handle = input.replace(/^@+/, '');
      if (handle.length <= 2) return `@${handle[0]}*`;
      if (handle.length <= 4) return `@${handle[0]}**${handle.slice(-1)}`;
      const parts = handle.split(/[._]/);
      if (parts.length > 1) {
        return `@${parts[0][0]}***${parts[0].slice(-1)}_${parts[1]}`;
      }
      return `@${handle[0]}***${handle.slice(-2)}`;
    } else {
      const phone = input.replace(/\D/g, '');
      const last4 = phone.slice(-4);
      return `+91 98****${last4}`;
    }
  }
}
