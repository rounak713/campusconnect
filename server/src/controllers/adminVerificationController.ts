import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { IdStorageService } from '../services/idStorageService.js';
import { EmailService } from '../services/emailService.js';

const MAX_PAGE_SIZE = 100;

export class AdminVerificationController {
  /**
   * GET /admin/verifications/pending
   * Pending ID submissions, each with a short-lived signed image URL.
   */
  static async listPending(req: Request, res: Response) {
    const take = Math.min(Number(req.query.limit) || 25, MAX_PAGE_SIZE);
    const skip = Math.max(Number(req.query.offset) || 0, 0);

    const [requests, total] = await prisma.$transaction([
      prisma.verificationRequest.findMany({
        where: { status: 'PENDING_REVIEW' },
        orderBy: { createdAt: 'asc' },
        take,
        skip,
        include: {
          user: {
            select: {
              id: true,
              maskedPhone: true,
              eduEmail: true,
              contactEmail: true,
              verificationStatus: true,
              college: { select: { id: true, name: true, shortCode: true } }
            }
          }
        }
      }),
      prisma.verificationRequest.count({ where: { status: 'PENDING_REVIEW' } })
    ]);

    const items = await Promise.all(
      requests.map(async request => ({
        requestId: request.id,
        submittedAt: request.createdAt,
        mimeType: request.mimeType,
        sizeBytes: request.sizeBytes,
        imageUrl: await IdStorageService.createSignedUrl(request.storageProvider, request.storageKey),
        user: request.user
      }))
    );

    return res.status(200).json({
      success: true,
      total,
      count: items.length,
      signedUrlTtlSeconds: IdStorageService.getSignedUrlTtlSeconds(),
      pending: items
    });
  }

  /**
   * POST /admin/verifications/action
   * Body: { userId, status: "APPROVED" | "REJECTED", reason? }
   * Applies the decision to the user's newest pending request and notifies them by email.
   */
  static async actOnVerification(req: Request, res: Response) {
    const { userId, status, reason, requestId } = req.body || {};

    if (!userId || !status) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'userId and status are required' });
    }
    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return res.status(400).json({
        error: 'INVALID_STATUS',
        message: 'status must be "APPROVED" or "REJECTED"'
      });
    }
    if (status === 'REJECTED' && !reason) {
      return res.status(400).json({ error: 'MISSING_REASON', message: 'A reason is required to reject' });
    }

    const request = await prisma.verificationRequest.findFirst({
      where: { userId, status: 'PENDING_REVIEW', ...(requestId ? { id: requestId } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });

    if (!request) {
      return res.status(404).json({
        error: 'NO_PENDING_REQUEST',
        message: 'This user has no verification request awaiting review'
      });
    }

    const reviewedAt = new Date();
    const [updatedRequest, updatedUser] = await prisma.$transaction([
      prisma.verificationRequest.update({
        where: { id: request.id },
        data: { status, reviewerId: req.user!.id, reviewReason: reason || null, reviewedAt }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          verificationStatus: status === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
          verifiedAt: status === 'APPROVED' ? reviewedAt : null
        }
      })
    ]);

    const notifyAddress = request.user.contactEmail || request.user.eduEmail;
    const notification = notifyAddress
      ? status === 'APPROVED'
        ? await EmailService.sendVerificationApproved(notifyAddress)
        : await EmailService.sendVerificationRejected(notifyAddress, reason)
      : { delivered: false, provider: 'NONE' };

    return res.status(200).json({
      success: true,
      requestId: updatedRequest.id,
      userId: updatedUser.id,
      requestStatus: updatedRequest.status,
      verificationStatus: updatedUser.verificationStatus,
      reason: updatedRequest.reviewReason,
      reviewedAt: updatedRequest.reviewedAt,
      notification
    });
  }

  /** Review history for one student (audit trail). */
  static async getUserHistory(req: Request, res: Response) {
    const requests = await prisma.verificationRequest.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      requests: requests.map(request => ({
        requestId: request.id,
        status: request.status,
        reviewerId: request.reviewerId,
        reason: request.reviewReason,
        submittedAt: request.createdAt,
        reviewedAt: request.reviewedAt
      }))
    });
  }
}
