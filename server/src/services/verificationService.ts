/**
 * Student verification core: cryptographic email OTPs (Method A) and
 * status transitions shared by both methods.
 */
import crypto from 'crypto';
import { prisma } from '../db.js';
import { EmailService } from './emailService.js';
import dotenv from 'dotenv';
dotenv.config();

const OTP_PEPPER =
  process.env.OTP_PEPPER || process.env.KMS_PEPPER || 'KMS_PEPPER_HSM_PROTECTED_32_BYTE_KEY_XYZ123';

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export type VerificationStatus =
  | 'PENDING_VERIFICATION'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export class VerificationService {
  /** Cryptographically uniform 6-digit code (no modulo bias). */
  static generateOtpCode(): string {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  static hashOtp(email: string, code: string): string {
    return crypto.createHmac('sha256', OTP_PEPPER).update(`${email}::${code}`).digest('hex');
  }

  static matches(expectedHash: string, candidateHash: string): boolean {
    const expected = Buffer.from(expectedHash, 'hex');
    const candidate = Buffer.from(candidateHash, 'hex');
    return expected.length === candidate.length && crypto.timingSafeEqual(expected, candidate);
  }

  /**
   * Invalidates outstanding codes, stores a fresh hashed OTP and emails the plaintext code.
   */
  static async issueEmailOtp(userId: string, email: string, domain: string) {
    const latest = await prisma.emailOtp.findFirst({
      where: { userId, email, consumedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    if (latest) {
      const elapsedSeconds = (Date.now() - latest.createdAt.getTime()) / 1000;
      if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
        return {
          issued: false as const,
          retryAfterSeconds: Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds)
        };
      }
    }

    await prisma.emailOtp.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() }
    });

    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.emailOtp.create({
      data: { userId, email, domain, codeHash: this.hashOtp(email, code), expiresAt }
    });

    const delivery = await EmailService.sendOtp(email, code, OTP_TTL_MINUTES);

    return { issued: true as const, expiresAt, delivery };
  }

  /**
   * Consumes an OTP. On success the user is upgraded to VERIFIED via the email-domain method.
   */
  static async redeemEmailOtp(userId: string, email: string, code: string) {
    const otp = await prisma.emailOtp.findFirst({
      where: { userId, email, consumedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    if (!otp) return { ok: false as const, error: 'OTP_NOT_FOUND' };
    if (otp.expiresAt.getTime() < Date.now()) {
      await prisma.emailOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
      return { ok: false as const, error: 'OTP_EXPIRED' };
    }
    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.emailOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
      return { ok: false as const, error: 'TOO_MANY_ATTEMPTS' };
    }
    if (!this.matches(otp.codeHash, this.hashOtp(email, String(code)))) {
      await prisma.emailOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      return {
        ok: false as const,
        error: 'INVALID_OTP',
        attemptsRemaining: OTP_MAX_ATTEMPTS - (otp.attempts + 1)
      };
    }

    await prisma.emailOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        eduEmail: email,
        contactEmail: email,
        verificationStatus: 'VERIFIED',
        verificationMethod: 'EMAIL_DOMAIN',
        verifiedAt: new Date()
      }
    });

    return { ok: true as const, user };
  }
}
