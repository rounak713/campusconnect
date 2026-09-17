import { Request, Response } from 'express';
import { prisma } from '../db.js';

export class ChatController {
  /**
   * Sends a temporary encrypted message in a confirmed mutual match.
   */
  static async sendMessage(req: Request, res: Response) {
    const userId = req.user?.id;
    const { commitmentId, ciphertext } = req.body;

    if (!userId || !commitmentId || !ciphertext) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    // Verify commitment is a MUTUAL_MATCH and user belongs to it
    const commitment = await prisma.crushCommitment.findUnique({
      where: { id: commitmentId }
    });

    if (!commitment || commitment.status !== 'MUTUAL_MATCH') {
      return res.status(403).json({ 
        error: 'FORBIDDEN', 
        message: 'Chat is only accessible for confirmed mutual matches.' 
      });
    }

    // Verify user is either initiator or reciprocal partner
    if (commitment.userId !== userId) {
      const isPartner = await prisma.crushCommitment.findFirst({
        where: {
          rendezvousToken: commitment.rendezvousToken,
          userId
        }
      });

      if (!isPartner) {
        return res.status(403).json({ error: 'UNAUTHORIZED_CHAT_ACCESS' });
      }
    }

    const message = await prisma.ephemeralMessage.create({
      data: {
        commitmentId,
        senderUserId: userId,
        ciphertext,
        isEncrypted: true
      }
    });

    return res.status(200).json({
      success: true,
      message: {
        id: message.id,
        isSelf: true,
        ciphertext: message.ciphertext,
        createdAt: message.createdAt
      }
    });
  }

  /**
   * Retrieves messages for a mutual match.
   */
  static async getMessages(req: Request, res: Response) {
    const userId = req.user?.id;
    const { commitmentId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const commitment = await prisma.crushCommitment.findUnique({
      where: { id: commitmentId }
    });

    if (!commitment || commitment.status !== 'MUTUAL_MATCH') {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    // Fetch messages for all commitments under this rendezvous token
    const relatedCommitments = await prisma.crushCommitment.findMany({
      where: { rendezvousToken: commitment.rendezvousToken },
      select: { id: true }
    });
    const commitmentIds = relatedCommitments.map(c => c.id);

    const messages = await prisma.ephemeralMessage.findMany({
      where: { commitmentId: { in: commitmentIds } },
      orderBy: { createdAt: 'asc' }
    });

    return res.status(200).json({
      success: true,
      messages: messages.map(m => ({
        id: m.id,
        isSelf: m.senderUserId === userId,
        ciphertext: m.ciphertext,
        createdAt: m.createdAt
      }))
    });
  }

  /**
   * Emergency Wipe: Clears all chat messages and unmatches both parties.
   */
  static async clearChatAndUnmatch(req: Request, res: Response) {
    const userId = req.user?.id;
    const { commitmentId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const commitment = await prisma.crushCommitment.findUnique({
      where: { id: commitmentId }
    });

    if (!commitment) {
      return res.status(404).json({ error: 'COMMITMENT_NOT_FOUND' });
    }

    await prisma.$transaction(async (tx) => {
      // Find both mutual commitments
      const mutuals = await tx.crushCommitment.findMany({
        where: { rendezvousToken: commitment.rendezvousToken }
      });

      for (const item of mutuals) {
        // Delete all associated messages
        await tx.ephemeralMessage.deleteMany({
          where: { commitmentId: item.id }
        });

        // Delete commitment
        await tx.crushCommitment.delete({
          where: { id: item.id }
        });

        // Decrement crushSlotsUsed
        await tx.user.update({
          where: { id: item.userId },
          data: { crushSlotsUsed: { decrement: 1 } }
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Zero-trace wipe complete: all messages and mutual match records destroyed.'
    });
  }
}
