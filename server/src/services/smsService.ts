/**
 * Zero-Leak Anonymized SMS Gateway Integration (Twilio / Fast2SMS / MSG91)
 */

interface SmsRecord {
  targetHash: string;
  lastSentAt: number;
}

// In-memory anti-spam rate-limiter for phone invites (30-day lock)
const smsCooldownMap = new Map<string, number>();
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export class AnonymizedSmsService {
  /**
   * Dispatches blind SMS notification to unregistered target without disclosing initiator identity.
   */
  static async sendBlindCrushNotification(
    rawPhone: string,
    phoneHash: string,
    collegeShortName: string
  ): Promise<{ sent: boolean; reason?: string }> {
    const now = Date.now();
    const lastSent = smsCooldownMap.get(phoneHash);

    // Anti-Spam / Anti-Harassment Safeguard: Max 1 SMS per unique target phone per 30 days
    if (lastSent && now - lastSent < THIRTY_DAYS_MS) {
      return { 
        sent: false, 
        reason: 'THROTTLED_30_DAY_COOLDOWN' 
      };
    }

    // Scrub and format message
    const messageTemplate = 
      `Someone from ${collegeShortName} has secretly added you as a Crush on CampusConnect. ` +
      `If you add them back, you both match! Find out: https://campusconnect.in/join`;

    // Simulated SMS dispatch (Fast2SMS / Twilio webhook)
    console.log(`[Blind SMS Gateway] Dispatched to ***${rawPhone.slice(-4)}: "${messageTemplate}"`);

    // Record cooldown timestamp against salted hash only
    smsCooldownMap.set(phoneHash, now);

    return { sent: true };
  }

  static getRemainingCooldownDays(phoneHash: string): number {
    const lastSent = smsCooldownMap.get(phoneHash);
    if (!lastSent) return 0;
    const elapsed = Date.now() - lastSent;
    if (elapsed >= THIRTY_DAYS_MS) return 0;
    return Math.ceil((THIRTY_DAYS_MS - elapsed) / (24 * 60 * 60 * 1000));
  }
}
