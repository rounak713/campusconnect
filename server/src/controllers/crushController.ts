import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { CampusCryptoService } from '../services/cryptoService.js';
import { AnonymizedSmsService } from '../services/smsService.js';

export class CrushController {
  /**
   * Submits a secret crush with double-blind matching logic.
   */
  static async submitCrush(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const { targetInput, inputType } = req.body; // 'phone' | 'instagram'
    if (!targetInput || !inputType) {
      return res.status(400).json({ 
        error: 'MISSING_FIELDS', 
        message: 'targetInput and inputType are required' 
      });
    }

    // 1. Check user slot quota
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }

    if (user.crushSlotsUsed >= user.crushSlotsTotal) {
      return res.status(403).json({
        error: 'CRUSH_SLOTS_EXHAUSTED',
        message: 'You have used all available slots. Unlock a new slot with a ₹10 Semester Pass.'
      });
    }

    // 2. Canonicalize & Hash target identity
    const canonicalTarget = CampusCryptoService.canonicalize(targetInput, inputType);
    const targetHash = CampusCryptoService.generateIdentityHash(canonicalTarget);

    // Prevent self-crushes
    if (targetHash === user.identityHash) {
      return res.status(400).json({ 
        error: 'SELF_CRUSH_NOT_ALLOWED', 
        message: 'You cannot enter your own handle or phone number' 
      });
    }

    // Commutative pair collision token & directional proof
    const rendezvousToken = CampusCryptoService.generateRendezvousToken(user.identityHash, targetHash);
    const directionalHash = CampusCryptoService.generateDirectionalHash(user.identityHash, targetHash);
    const maskedHint = CampusCryptoService.createMaskedHint(targetInput, inputType);

    try {
      // 3. Atomic transaction to prevent double-spending or race conditions
      const result = await prisma.$transaction(async (tx) => {
        // Prevent duplicate commitment by the same user to the same target
        const existingSelf = await tx.crushCommitment.findUnique({
          where: { directionalHash }
        });

        if (existingSelf) {
          throw new Error('TARGET_ALREADY_COMMITTED');
        }

        // Check if the other party has already submitted the reciprocal crush
        const reciprocalCommitment = await tx.crushCommitment.findFirst({
          where: {
            rendezvousToken,
            userId: { not: user.id },
            status: 'WAITING_FOR_PAIR'
          }
        });

        if (reciprocalCommitment) {
          // Both parties have submitted each other -> MUTUAL MATCH!
          const now = new Date();
          const selfCommitment = await tx.crushCommitment.create({
            data: {
              userId: user.id,
              rendezvousToken,
              directionalHash,
              maskedTargetHint: maskedHint,
              status: 'MUTUAL_MATCH',
              matchedAt: now
            }
          });

          await tx.crushCommitment.update({
            where: { id: reciprocalCommitment.id },
            data: {
              status: 'MUTUAL_MATCH',
              matchedAt: now
            }
          });

          await tx.user.update({
            where: { id: user.id },
            data: { crushSlotsUsed: { increment: 1 } }
          });

          return {
            matchStatus: 'MUTUAL_MATCH',
            commitmentId: selfCommitment.id,
            rendezvousToken
          };
        } else {
          // One-sided commitment -> WAITING FOR PAIR
          const selfCommitment = await tx.crushCommitment.create({
            data: {
              userId: user.id,
              rendezvousToken,
              directionalHash,
              maskedTargetHint: maskedHint,
              status: 'WAITING_FOR_PAIR'
            }
          });

          await tx.user.update({
            where: { id: user.id },
            data: { crushSlotsUsed: { increment: 1 } }
          });

          return {
            matchStatus: 'WAITING_FOR_PAIR',
            commitmentId: selfCommitment.id,
            rendezvousToken
          };
        }
      });

      // 4. If target is an unregistered phone number and status is pending, dispatch blind SMS invite
      if (result.matchStatus === 'WAITING_FOR_PAIR' && inputType === 'phone') {
        const targetUser = await prisma.user.findUnique({
          where: { identityHash: targetHash }
        });

        if (!targetUser) {
          // Target is unregistered; send blind invitation
          await AnonymizedSmsService.sendBlindCrushNotification(
            canonicalTarget,
            targetHash,
            user.college.shortCode
          );
        }
      }

      return res.status(200).json({
        success: true,
        status: result.matchStatus,
        commitmentId: result.commitmentId,
        maskedHint,
        message: result.matchStatus === 'MUTUAL_MATCH'
          ? "It's a Mutual Match! 🎉"
          : 'Your crush is encrypted and stored safely.'
      });

    } catch (err: any) {
      if (err.message === 'TARGET_ALREADY_COMMITTED') {
        return res.status(409).json({ 
          error: 'DUPLICATE_CRUSH', 
          message: 'You have already added this secret crush to your vault.' 
        });
      }
      console.error('Error submitting crush:', err);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }

  /**
   * Retrieves all commitments for the authenticated user.
   */
  static async listCrushes(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const commitments = await prisma.crushCommitment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        maskedTargetHint: true,
        status: true,
        matchedAt: true,
        createdAt: true,
        rendezvousToken: true
      }
    });

    return res.status(200).json({
      success: true,
      crushes: commitments
    });
  }

  /**
   * Revokes and wipes a crush commitment, freeing up a slot.
   */
  static async revokeCrush(req: Request, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const commitment = await prisma.crushCommitment.findFirst({
      where: { id, userId }
    });

    if (!commitment) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Crush record not found' });
    }

    await prisma.$transaction(async (tx) => {
      // Delete commitment
      await tx.crushCommitment.delete({
        where: { id }
      });

      // Free up slot
      await tx.user.update({
        where: { id: userId },
        data: { crushSlotsUsed: { decrement: 1 } }
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Crush record permanently wiped and slot restored'
    });
  }
}
