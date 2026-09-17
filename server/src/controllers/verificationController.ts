import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { CollegeDomainService } from '../services/collegeDomainService.js';
import {
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MINUTES,
  VerificationService
} from '../services/verificationService.js';
import {
  ALLOWED_MIME_TYPES,
  IdStorageService,
  MAX_UPLOAD_BYTES
} from '../services/idStorageService.js';

export class VerificationController {
  /**
   * Method A, step 1: validate the college email domain and dispatch a 6-digit OTP.
   */
  static async requestEmailOtp(req: Request, res: Response) {
    const userId = req.user!.id;
    const check = await CollegeDomainService.check(req.body?.email || '');

    if (!check.valid) {
      return res.status(400).json({
        error: check.reason,
        message:
          check.reason === 'INVALID_EMAIL_FORMAT'
            ? 'Enter a valid email address'
            : 'This domain is not an approved college domain. Upload your college ID instead.',
        approvedSuffixes: CollegeDomainService.listApprovedSuffixes()
      });
    }

    const emailOwner = await prisma.user.findUnique({ where: { eduEmail: check.email } });
    if (emailOwner && emailOwner.id !== userId) {
      return res.status(409).json({
        error: 'EMAIL_ALREADY_VERIFIED',
        message: 'This college email is already linked to another account'
      });
    }

    const result = await VerificationService.issueEmailOtp(userId, check.email, check.domain);
    if (!result.issued) {
      return res.status(429).json({
        error: 'OTP_COOLDOWN',
        message: 'An OTP was just sent. Please wait before requesting another.',
        retryAfterSeconds: result.retryAfterSeconds
      });
    }

    if (check.collegeId) {
      await prisma.user.update({ where: { id: userId }, data: { collegeId: check.collegeId } });
    }

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${check.email}`,
      domain: check.domain,
      expiresAt: result.expiresAt,
      expiresInMinutes: OTP_TTL_MINUTES,
      provider: result.delivery.provider
    });
  }

  /**
   * Method A, step 2: redeem the OTP and auto-grant VERIFIED status.
   */
  static async verifyEmailOtp(req: Request, res: Response) {
    const userId = req.user!.id;
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email and OTP are required' });
    }

    const normalizedEmail = CollegeDomainService.normalizeEmail(email);
    const result = await VerificationService.redeemEmailOtp(userId, normalizedEmail, String(otp));

    if (!result.ok) {
      const httpStatus = result.error === 'TOO_MANY_ATTEMPTS' ? 429 : 400;
      return res.status(httpStatus).json({
        error: result.error,
        message: {
          OTP_NOT_FOUND: 'No active verification code for this email. Request a new one.',
          OTP_EXPIRED: 'This code has expired. Request a new one.',
          TOO_MANY_ATTEMPTS: `More than ${OTP_MAX_ATTEMPTS} wrong attempts. Request a new code.`,
          INVALID_OTP: 'Incorrect code'
        }[result.error],
        attemptsRemaining: 'attemptsRemaining' in result ? result.attemptsRemaining : undefined
      });
    }

    return res.status(200).json({
      success: true,
      verificationStatus: result.user.verificationStatus,
      verificationMethod: result.user.verificationMethod,
      eduEmail: result.user.eduEmail,
      verifiedAt: result.user.verifiedAt
    });
  }

  /**
   * Method B: store the college ID photo privately and queue it for admin review.
   */
  static async submitIdCard(req: Request, res: Response) {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'MISSING_FILE', message: 'Attach an "idCard" image file' });
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res.status(415).json({
        error: 'UNSUPPORTED_MEDIA_TYPE',
        message: `Allowed formats: ${ALLOWED_MIME_TYPES.join(', ')}`
      });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return res.status(413).json({
        error: 'FILE_TOO_LARGE',
        message: `Maximum upload size is ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB`
      });
    }

    const existingPending = await prisma.verificationRequest.findFirst({
      where: { userId, status: 'PENDING_REVIEW' }
    });
    if (existingPending) {
      return res.status(409).json({
        error: 'REVIEW_ALREADY_PENDING',
        message: 'Your previous submission is still under review',
        requestId: existingPending.id
      });
    }

    const stored = await IdStorageService.upload(userId, file.buffer, file.mimetype);

    const contactEmail = req.body?.contactEmail
      ? CollegeDomainService.normalizeEmail(req.body.contactEmail)
      : undefined;

    const [request] = await prisma.$transaction([
      prisma.verificationRequest.create({
        data: {
          userId,
          storageProvider: stored.provider,
          storageKey: stored.key,
          mimeType: file.mimetype,
          sizeBytes: file.size
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          verificationStatus: 'PENDING_REVIEW',
          verificationMethod: 'MANUAL_ID',
          ...(contactEmail ? { contactEmail } : {})
        }
      })
    ]);

    return res.status(202).json({
      success: true,
      message: 'College ID submitted. An admin will review it shortly.',
      requestId: request.id,
      status: request.status,
      storageProvider: request.storageProvider
    });
  }

  /** Current verification state for the authenticated student. */
  static async getStatus(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        verificationRequests: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });

    const latestRequest = user.verificationRequests[0];
    return res.status(200).json({
      success: true,
      verificationStatus: user.verificationStatus,
      verificationMethod: user.verificationMethod,
      verifiedAt: user.verifiedAt,
      eduEmail: user.eduEmail,
      latestRequest: latestRequest
        ? {
            id: latestRequest.id,
            status: latestRequest.status,
            reviewReason: latestRequest.reviewReason,
            submittedAt: latestRequest.createdAt,
            reviewedAt: latestRequest.reviewedAt
          }
        : null
    });
  }

  /** Public list of whitelisted college domains (drives the signup hint UI). */
  static async listDomains(_req: Request, res: Response) {
    const domains = await prisma.collegeDomain.findMany({
      where: { active: true },
      orderBy: { domain: 'asc' },
      include: { college: { select: { id: true, name: true, shortCode: true } } }
    });

    return res.status(200).json({
      success: true,
      approvedSuffixes: CollegeDomainService.listApprovedSuffixes(),
      domains: domains.map(entry => ({
        domain: entry.domain,
        college: entry.college
      }))
    });
  }
}
